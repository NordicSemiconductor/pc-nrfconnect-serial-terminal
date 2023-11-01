/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getCurrentWindow } from '@electron/remote';
import {
    AppDispatch,
    AppThunk,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { rename, rm, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import {
    MAXIMUM_MAX_NUMBER_OF_LINES,
    MINIMUM_MAX_NUMER_OF_LINES,
} from '../../app/store';
import { RootState } from '../../appReducer';
import HistoryBufferWrapper from './historyBuffer';
import {
    getMaximumNumberOfLinesInHistory,
    getNumberOfLinesInHistory,
    getPathToHistoryFile,
    setMaxNumberOfLinesInHistoryFile,
    setNumberOfLinesInHistory,
} from './historySlice';

let historyBuffer: Awaited<ReturnType<typeof HistoryBufferWrapper>>;

const HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE =
    'History Buffer is not initialized. Try to restart the app, or create a ticket on https://devzone.nordicsemi.com/ if the issue persists.';

export const initializeHistoryBuffer: AppThunk<RootState> = async (
    dispatch,
    getState
) => {
    if (historyBuffer != null) {
        logger.debug(
            'History Buffer is already initialized, and should only be initialized once.'
        );
        return;
    }

    const pathToHistoryFile = getPathToHistoryFile(getState());
    historyBuffer = await HistoryBufferWrapper(pathToHistoryFile);

    if (historyBuffer) {
        dispatch(setNumberOfLinesInHistory(historyBuffer.getNumberOfLines()));
        if (dispatch(validateNumberOfLinesInHistory)) {
            logger.warn(
                'History file is full, consider increasing the Max lines in history file, or cleaning it up, by using the Terminal Settings in the Side Panel.'
            );
        }
    }

    getCurrentWindow().on('focus', async () => {
        if (historyBuffer) {
            logger.debug(
                `The app will need to read the content of ${pathToHistoryFile}, becuase it may not be in-sync with the (in-memory) history buffer.`
            );
            const numberOfLines = await historyBuffer.refreshHistoryFromFile(
                pathToHistoryFile
            );

            if (numberOfLines == null) {
                return;
            }

            historyBuffer.redoHistoryMap();
            dispatch(setNumberOfLinesInHistory(numberOfLines));
        }
    });
};

const validateNumberOfLinesInHistory: AppThunk<RootState, boolean> = (
    dispatch,
    getState
) => {
    if (historyBuffer == null) {
        logger.error(HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE);
        return false;
    }
    const maximumNumberOfLinesInHistory = getMaximumNumberOfLinesInHistory(
        getState()
    );
    const numberOfLinesInHistory = getNumberOfLinesInHistory(getState());

    if (numberOfLinesInHistory <= maximumNumberOfLinesInHistory) {
        return false;
    }

    // Retrieve the history in buffer, and slice it to contain the maximum number of lines.
    historyBuffer.trimDownToNumberOfLinesToKeep(maximumNumberOfLinesInHistory);

    dispatch(writeHistory(historyBuffer.getHistory()));
    return true;
};

export const setNewMaximumNumberOfLinesInHistory =
    (newMaxSize: number) => (dispatch: AppDispatch) => {
        if (historyBuffer == null) {
            logger.error(HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE);
            return false;
        }

        if (
            newMaxSize < MINIMUM_MAX_NUMER_OF_LINES ||
            newMaxSize > MAXIMUM_MAX_NUMBER_OF_LINES
        ) {
            logger.error(
                `Cannot set max number of lines in history file to ${newMaxSize}, it must be between ${MINIMUM_MAX_NUMER_OF_LINES} and ${MAXIMUM_MAX_NUMBER_OF_LINES}.`
            );
            return false;
        }
        dispatch(setMaxNumberOfLinesInHistoryFile(newMaxSize));

        const currentNumberOfLinesInHistoryFile =
            historyBuffer.getNumberOfLines();

        if (currentNumberOfLinesInHistoryFile > newMaxSize) {
            logger.debug(
                `New history max size ${newMaxSize} is less than the current history file.`
            );
            dispatch(trimHistoryFileToMaxSize);
        }
    };

export const getHistoryPercentage: AppThunk<RootState> = (
    _dispatch,
    getState
) => {
    const historySize = getNumberOfLinesInHistory(getState());
    const maximumHistorySize = getMaximumNumberOfLinesInHistory(getState());

    return (historySize / maximumHistorySize) * 100;
};

export const writeHistoryLine =
    (line: string): AppThunk<RootState> =>
    (dispatch, getState) => {
        if (historyBuffer == null) {
            logger.error(HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE);
            return;
        }

        historyBuffer.pushLineToHistory(line);

        const maximumNumberOfLinesInHistory = getMaximumNumberOfLinesInHistory(
            getState()
        );

        if (historyBuffer.getNumberOfLines() > maximumNumberOfLinesInHistory) {
            historyBuffer.trimDownToNumberOfLinesToKeep(
                maximumNumberOfLinesInHistory
            );
        }

        dispatch(writeHistory(historyBuffer.getHistory()));
    };

export const trimHistoryFile =
    (numberOfLinesToKeep: number): AppThunk<RootState> =>
    (dispatch, getState) => {
        if (historyBuffer == null) {
            logger.error(HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE);
            return;
        }

        const maximumNumberOfLines = getMaximumNumberOfLinesInHistory(
            getState()
        );

        if (
            numberOfLinesToKeep > maximumNumberOfLines ||
            numberOfLinesToKeep < 0
        ) {
            logger.error(
                `Invalid number of lines to keep: ${numberOfLinesToKeep}, must be between [0, ${maximumNumberOfLines}]`
            );
            return;
        }

        historyBuffer.trimDownToNumberOfLinesToKeep(numberOfLinesToKeep);

        try {
            dispatch(writeHistory(historyBuffer.getHistory()));
        } catch (error) {
            logger.error('Failed truncating the history file', error);
        }
    };

// Utility to use when the file is full, and should be trimmed down
// to 100% of the maximum size
const trimHistoryFileToMaxSize: AppThunk<RootState> = (dispatch, getStore) => {
    if (historyBuffer == null) {
        logger.error(HISTORY_BUFFER_NOT_INITIALIZED_MESSAGE);
        return false;
    }
    const maximumNumberOfLines = getMaximumNumberOfLinesInHistory(getStore());

    dispatch(trimHistoryFile(maximumNumberOfLines));
};

// In this function we do not want to care about the content in the file,
// this is to avoid the delay of first reading the content, and then process the data,
// and then writing. Rather, we just want to replace the whole content of the history file.
const writeHistory =
    (history: string[]): AppThunk<RootState> =>
    async (dispatch, getState) => {
        const pathToHistoryFile = getPathToHistoryFile(getState());
        const pathToTemporaryFile = join(
            dirname(pathToHistoryFile),
            'temporary_history_file'
        );

        try {
            if ((await stat(pathToHistoryFile)).isFile())
                await rename(pathToHistoryFile, pathToTemporaryFile);
        } catch (error) {
            logger.error(
                `Could not make necessary changes to the history file, ${pathToHistoryFile}. Verify that the file is not locked, usually by another app.`
            );
            return;
        }

        try {
            await writeFile(pathToHistoryFile, history.join('\n'));
            await rm(pathToTemporaryFile);
        } catch (error) {
            logger.error(
                'Could not write the (in-memory) history buffer to the (persistent) history file',
                pathToHistoryFile
            );
            rename(pathToTemporaryFile, pathToHistoryFile);
            return;
        }

        dispatch(setNumberOfLinesInHistory(history.length));
    };

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

    getCurrentWindow().on('focus', () => {
        if (historyBuffer) {
            logger.debug(
                `The app is again in-focus and will need to read the content of ${pathToHistoryFile}, becuase it may not be in-sync with the (in-memory) history buffer.`
            );
            historyBuffer.refreshHistoryFromFile(pathToHistoryFile);
            historyBuffer.redoHistoryMap();
        }
    });
};

const validateNumberOfLinesInHistory: AppThunk<RootState, boolean> = (
    dispatch,
    getState
) => {
    if (historyBuffer == null) {
        logger.error(
            'History Buffer is not initialized, this means that the app is not working as it should, and you should try to restart it. If the issue persists, please create a ticket on https://devzone.nordicsemi.com/'
        );
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
            logger.error(
                'History Buffer is not initialized, this means that the app is not working as it should, and you should try to restart it. If the issue persists, please create a ticket on https://devzone.nordicsemi.com/'
            );
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
            logger.error(
                'History Buffer is not initialized, this means that the app is not working as it should, and you should try to restart it. If the issue persists, please create a ticket on https://devzone.nordicsemi.com/'
            );
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
            logger.error(
                'History Buffer is not initialized, this means that the app is not working as it should, and you should try to restart it. If the issue persists, please create a ticket on https://devzone.nordicsemi.com/'
            );
            return;
        }

        const maximumNumberOfLines = getMaximumNumberOfLinesInHistory(
            getState()
        );

        if (
            numberOfLinesToKeep > maximumNumberOfLines ||
            numberOfLinesToKeep < 0
        ) {
            logger.error(`Lines to keep can never be negative 🤪`);
            return;
        }

        historyBuffer.trimDownToNumberOfLinesToKeep(numberOfLinesToKeep);

        try {
            dispatch(writeHistory(historyBuffer.getHistory()));
        } catch (error) {
            logger.error('Failed truncating the history file');
        }
    };

// Utility to use when the file is full, and should be trimmed down
// to 100% of the maximum size
const trimHistoryFileToMaxSize: AppThunk<RootState> = (dispatch, getStore) => {
    if (historyBuffer == null) {
        logger.error(
            'History Buffer is not initialized, this means that the app is not working as it should, and you should try to restart it. If the issue persists, please create a ticket on https://devzone.nordicsemi.com/'
        );
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
                'Cannot protect the history file before overwrite, aborting overwrite. Please make sure that the file is not locked.'
            );
            return;
        }

        try {
            await writeFile(pathToHistoryFile, history.join('\n'));
            await rm(pathToTemporaryFile);
        } catch (error) {
            logger.error(
                'Could not write the history buffer to the history file',
                pathToHistoryFile
            );
            rename(pathToTemporaryFile, pathToHistoryFile);
            return;
        }

        dispatch(setNumberOfLinesInHistory(history.length));
    };

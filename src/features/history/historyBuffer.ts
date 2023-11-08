/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

// This buffer is made in order to mitigate reading performance,
// as we tested reading, processing and writing files with sizes
// ~ 500_000 up to 2_000_000 lines, and the reading was significantly
// slower than processing and writing.
// Hence, we would like to keep the history in memory, and then only write
// to the file whenever we have to. Then we keep reading to a minimal, and
// we're still able to persist the content to file.

const getHistoryFromFile = async (pathToHistory: string) => {
    if (!existsSync(pathToHistory)) {
        logger.info('Created .history file', pathToHistory);
        await writeFile(pathToHistory, '\0');
        return [];
    }

    try {
        const content = await readFile(pathToHistory, { encoding: 'utf8' });
        const history = content.split('\n').filter(entry => {
            const parsedEntry = getCommandFromHistoryEntry(entry);
            return !!parsedEntry && parsedEntry.length > 0;
        });
        return history;
    } catch (error) {
        logger.error(
            `Could not read the content of the history file. Make sure that the file ${pathToHistory} is not locked by an application, and then restart the Serial Terminal.`
        );
        return null;
    }
};

const HistoryBufferWrapper = async (pathToHistory: string) => {
    const initialHistory = await getHistoryFromFile(pathToHistory);
    if (initialHistory == null) {
        // Something went wrong, and we should not initialize the HistoryBuffer, but rather wait for
        // the file to be ready to be read.
        return null;
    }
    let history: string[] = initialHistory;

    let currentLineIndex = history.length;
    let lastSearchHit: string | undefined;

    return {
        pushLineToHistory: (line: string) => {
            if (line.trim() === '') {
                return;
            }

            const lastLine = history.at(-1);
            if (
                lastLine != null &&
                getCommandFromHistoryEntry(lastLine) === line
            ) {
                // Do not record sequential duplicates.
                return;
            }

            history.push(`${new Date(Date.now()).toISOString()}: ${line}`);
        },

        trimDownToNumberOfLinesToKeep: (numberOfLinesToKeep: number) => {
            const numberOfLinesToDelete = history.length - numberOfLinesToKeep;
            if (numberOfLinesToDelete > history.length) {
                logger.debug(
                    `Attempted to delete more lines from history than there are lines in the buffer. NumberOfLinesToDelete=${numberOfLinesToDelete}, numberOfLinesToKeep=${numberOfLinesToKeep}, numberOfLinesInHistoryBuffer=${history.length}`
                );
            }
            history.splice(0, numberOfLinesToDelete);
            logger.debug(
                `Deleted ${numberOfLinesToDelete} lines from history file, it should not only contain ${numberOfLinesToKeep} lines.`
            );
        },

        getNumberOfLines: () => history.length,
        getHistory: () => history,

        refreshHistoryFromFile: async (path: string) => {
            const newHistory = await getHistoryFromFile(path);
            if (newHistory == null) {
                logger.error(
                    `The .history file may be out-of-sync. Attempted to refresh the content of the file, but was not successful. If you worry about content being lost, make sure that the file ${path} is not locked by an application, and then restart the Serial Terminal.`
                );
                return;
            }
            history = [...newHistory];
            return history.length;
        },

        resetScrollIndex: () => {
            currentLineIndex = history.length;
            lastSearchHit = undefined;
        },

        scrollBackSearch: (input: string) => {
            if (currentLineIndex === 0) {
                return undefined;
            }

            currentLineIndex -= 1;
            let nextLine = getCommandFromHistoryEntry(
                history.at(currentLineIndex)
            );

            while (
                (nextLine != null && !nextLine.startsWith(input)) ||
                nextLine === input ||
                nextLine === lastSearchHit
            ) {
                if (currentLineIndex === 0) {
                    return undefined;
                }

                currentLineIndex -= 1;
                nextLine = getCommandFromHistoryEntry(
                    history.at(currentLineIndex)
                );
            }

            lastSearchHit = nextLine;
            return nextLine;
        },

        scrollForwardSearch: (input: string) => {
            if (currentLineIndex === history.length) {
                return undefined;
            }

            currentLineIndex += 1;
            let nextLine = getCommandFromHistoryEntry(
                history.at(currentLineIndex)
            );

            while (
                (nextLine != null && !nextLine.startsWith(input)) ||
                nextLine === input ||
                nextLine === lastSearchHit
            ) {
                currentLineIndex += 1;

                if (currentLineIndex === history.length) {
                    lastSearchHit = undefined;
                    return undefined;
                }

                nextLine = getCommandFromHistoryEntry(
                    history.at(currentLineIndex)
                );
            }

            lastSearchHit = nextLine;
            return nextLine;
        },

        scrollBackOnce: () => {
            if (currentLineIndex === 0) {
                return;
            }
            currentLineIndex -= 1;
            return getCommandFromHistoryEntry(history.at(currentLineIndex));
        },
        scrollForwardOnce: () => {
            if (currentLineIndex === history.length) {
                return;
            }
            currentLineIndex += 1;
            return getCommandFromHistoryEntry(history.at(currentLineIndex));
        },
    };
};

export default HistoryBufferWrapper;

const getCommandFromHistoryEntry = (entry?: string) => {
    if (entry == null) {
        return undefined;
    }
    return entry.slice(entry.indexOf(': ') + 2).trim();
};

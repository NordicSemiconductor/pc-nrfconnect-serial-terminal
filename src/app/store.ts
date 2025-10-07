/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getAppDataDir,
    getPersistentStore,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { join } from 'path';

interface StoreSchema {
    pathToHistoryFile: string;
    maxNumberOfLinesInHistoryFile: number;
    scrollback: number;
}

const store = getPersistentStore<StoreSchema>({
    migrations: {},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromStore = <T extends keyof StoreSchema>(key: T, defaultValue?: any) =>
    [
        () => store.get(key, defaultValue),
        (value: StoreSchema[T]) => store.set(key, value),
    ] as const;

export const [getPathToHistoryFile, setPathToHistoryFile] = fromStore(
    'pathToHistoryFile',
    join(getAppDataDir(), '.history')
);

export const MINIMUM_MAX_NUMER_OF_LINES = 10;
export const MAXIMUM_MAX_NUMBER_OF_LINES = 1_000_000;

const [_getMaxNumberOfLinesInHistoryFile, _setMaxNumberOfLinesInHistoryFile] =
    fromStore('maxNumberOfLinesInHistoryFile', 1000);
export const getMaxNumberOfLinesInHistoryFile =
    _getMaxNumberOfLinesInHistoryFile;
export const setMaxNumberOfLinesInHistoryFile = (size: number) => {
    if (
        size < MINIMUM_MAX_NUMER_OF_LINES ||
        size > MAXIMUM_MAX_NUMBER_OF_LINES
    ) {
        logger.error(
            `Cannot set max number of lines in history file to ${size}, it must be between ${MINIMUM_MAX_NUMER_OF_LINES} and ${MAXIMUM_MAX_NUMBER_OF_LINES}.`
        );
        return false;
    }

    logger.debug(`New maxNumberOfLinesInHistoryFile: ${size}`);
    _setMaxNumberOfLinesInHistoryFile(size);
    return true;
};

export const [getScrollback, setScrollback] = fromStore('scrollback', 10000);

/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getAppDataDir } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const HISTORY_MAX_SIZE = 10;
const HISTORY_FILE = join(getAppDataDir(), '.history');

let historySize;

export const getHistoryFileLocation = () => HISTORY_FILE;
export const writeHistoryLine = (line: string) => {
    writeFileSync(HISTORY_FILE, `${Date.now().toString()}: ${line}\n`, {
        encoding: 'utf8',
        flag: 'a',
    });

    historySize = readHistorySize();

    if (historySize > HISTORY_MAX_SIZE + 10) {
        // Truncate the file
        truncateHistoryFileToMaxSize();
    }
};

function readHistorySize() {
    return readFileSync(HISTORY_FILE)
        .toString()
        .split('\n')
        .reduce(sum => {
            sum += 1;
            return sum;
        }, 0);
}

function truncateHistoryFileToMaxSize() {
    const contentToWriteBack = readFileSync(HISTORY_FILE)
        .toString()
        .split('\n')
        .slice(-HISTORY_MAX_SIZE)
        .join('\n');

    writeFileSync(HISTORY_FILE, contentToWriteBack, {
        flag: 'w',
        encoding: 'utf8',
    });
}

/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    getMaxNumberOfLinesInHistoryFile as getPersistedMaximumNumberOfLinesInHistoryFile,
    getPathToHistoryFile as getPersistedPathToHistoryFile,
    setMaxNumberOfLinesInHistoryFile as persistMaximumNumberOfLinesInHistoryFile,
    setPathToHistoryFile as persistPathToHistoryFile,
} from '../../app/store';
import type { RootState } from '../../appReducer';

interface HistoryFileState {
    numberOfLinesAboveMaxBeforeTruncate: number;
    numberOfLinesInHistory: number;
    maximumNumberOfLinesInHistory: number;
    pathToHistoryFile: string;
}

const initialState = (): HistoryFileState => ({
    numberOfLinesAboveMaxBeforeTruncate: 10,
    numberOfLinesInHistory: 0,
    maximumNumberOfLinesInHistory:
        getPersistedMaximumNumberOfLinesInHistoryFile(),
    pathToHistoryFile: getPersistedPathToHistoryFile(),
});

const historySlice = createSlice({
    name: 'historyFile',
    initialState: initialState(),
    reducers: {
        setNumberOfLinesInHistory: (
            state,
            { payload: numberOfLines }: PayloadAction<number>
        ) => {
            state.numberOfLinesInHistory = numberOfLines;
        },
        incrementNumberOfLinesInHistoryFile: state => {
            state.numberOfLinesInHistory += 1;
        },
        setNumberOfLinesToMaximum: state => {
            state.numberOfLinesInHistory = state.maximumNumberOfLinesInHistory;
        },
        setMaxNumberOfLinesInHistoryFile: (
            state,
            { payload: numberOfLines }: PayloadAction<number>
        ) => {
            state.maximumNumberOfLinesInHistory = numberOfLines;
            persistMaximumNumberOfLinesInHistoryFile(numberOfLines);
        },
        setPathToHistoryFile: (
            state,
            { payload: path }: PayloadAction<string>
        ) => {
            state.pathToHistoryFile = path;
            persistPathToHistoryFile(path);
        },
    },
});

export const getNumberOfLinesInHistory = (state: RootState) =>
    state.app.historyFile.numberOfLinesInHistory;
export const getMaximumNumberOfLinesInHistory = (state: RootState) =>
    state.app.historyFile.maximumNumberOfLinesInHistory;
export const getPathToHistoryFile = (state: RootState) =>
    state.app.historyFile.pathToHistoryFile;
export const getNumberOfLinesAboveMaximumBeforeTruncate = (state: RootState) =>
    state.app.historyFile.numberOfLinesAboveMaxBeforeTruncate;

export const {
    setNumberOfLinesInHistory,
    incrementNumberOfLinesInHistoryFile,
    setNumberOfLinesToMaximum,
    setMaxNumberOfLinesInHistoryFile,
    setPathToHistoryFile,
} = historySlice.actions;

export default historySlice.reducer;

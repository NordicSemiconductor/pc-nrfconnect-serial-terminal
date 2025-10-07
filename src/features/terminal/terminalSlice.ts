/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SerialPort } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';

import {
    getScrollback as getPersistedScrollback,
    setScrollback as persistScrollback,
} from '../../app/store';
import type { RootState } from '../../appReducer';

export type LineEnding = 'NONE' | 'LF' | 'CR' | 'CRLF';

interface WriteToFileAction {
    filePath: string;
}
interface TerminalState {
    availableSerialPorts: string[];
    serialPort?: SerialPort;
    serialOptions: SerialPortOpenOptions<AutoDetectTypes>;
    clearOnSend: boolean;
    lineEnding: LineEnding;
    lineMode: boolean;
    echoOnShell: boolean;
    showOverwriteDialog: boolean;
    scrollback: number;
    writeLogToFile?: WriteToFileAction;
}

const initialState: TerminalState = {
    availableSerialPorts: [],
    serialPort: undefined,
    serialOptions: {
        baudRate: 115200,
        path: '',
    },
    clearOnSend: true,
    lineEnding: 'CRLF',
    lineMode: true,
    echoOnShell: true,
    showOverwriteDialog: false,
    scrollback: getPersistedScrollback(), // Load from persistent storage
};

const cleanUndefined = <T>(obj: T) => JSON.parse(JSON.stringify(obj));

const terminalSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setAvailableSerialPorts: (state, action: PayloadAction<string[]>) => {
            state.availableSerialPorts = action.payload;
        },
        setSerialPort: (
            state,
            action: PayloadAction<SerialPort | undefined>
        ) => {
            state.serialPort?.close();
            state.serialPort = action.payload;
        },
        updateSerialOptions: (
            state,
            action: PayloadAction<
                Partial<SerialPortOpenOptions<AutoDetectTypes>>
            >
        ) => {
            state.serialOptions = cleanUndefined({
                ...state.serialOptions,
                ...action.payload,
            });
        },
        setSetOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            state.serialOptions = cleanUndefined({
                ...state.serialOptions,
                ...action.payload,
            });
        },
        setSerialOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            state.serialOptions = cleanUndefined(action.payload);
        },
        setClearOnSend: (state, action: PayloadAction<boolean>) => {
            state.clearOnSend = action.payload;
        },
        setLineEnding: (state, action: PayloadAction<LineEnding>) => {
            state.lineEnding = action.payload;
        },
        setLineMode: (state, action: PayloadAction<boolean>) => {
            state.lineMode = action.payload;
        },
        setEchoOnShell: (state, action: PayloadAction<boolean>) => {
            state.echoOnShell = action.payload;
        },
        setShowOverwriteDialog: (state, action: PayloadAction<boolean>) => {
            state.showOverwriteDialog = action.payload;
        },
        setScrollback: (
            state,
            { payload: scrollback }: PayloadAction<number>
        ) => {
            state.scrollback = scrollback;
            persistScrollback(scrollback);
        },
        setWriteLogToFile: (
            state,
            { payload: options }: PayloadAction<WriteToFileAction>
        ) => {
            state.writeLogToFile = options;
        },
        clearWriteLogToFile: state => {
            state.writeLogToFile = undefined;
        },
    },
});

export const getSerialPort = (state: RootState) =>
    state.app.terminal.serialPort;
export const getAvailableSerialPorts = (state: RootState) =>
    state.app.terminal.availableSerialPorts;
export const getSerialOptions = (state: RootState) =>
    state.app.terminal.serialOptions;
export const getClearOnSend = (state: RootState) =>
    state.app.terminal.clearOnSend;
export const getLineEnding = (state: RootState) =>
    state.app.terminal.lineEnding;
export const getLineMode = (state: RootState) => state.app.terminal.lineMode;
export const getEchoOnShell = (state: RootState) =>
    state.app.terminal.echoOnShell;
export const getShowOverwriteDialog = (state: RootState) =>
    state.app.terminal.showOverwriteDialog;
export const getScrollback = (state: RootState) =>
    state.app.terminal.scrollback;
export const getWriteLogToFile = (state: RootState) =>
    state.app.terminal.writeLogToFile;

export const {
    setSerialPort,
    setAvailableSerialPorts,
    setSerialOptions,
    updateSerialOptions,
    setSetOptions,
    setClearOnSend,
    setLineEnding,
    setLineMode,
    setEchoOnShell,
    setShowOverwriteDialog,
    setScrollback,
    setWriteLogToFile,
    clearWriteLogToFile,
} = terminalSlice.actions;
export default terminalSlice.reducer;

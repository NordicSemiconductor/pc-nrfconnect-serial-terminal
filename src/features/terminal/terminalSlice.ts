/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPort } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

import type { RootState } from '../../appReducer';

export type LineEnding = 'NONE' | 'LF' | 'CR' | 'CRLF';

interface TerminalState {
    availableSerialPorts: string[];
    serialPort?: SerialPort;
    autoConnected: boolean;
    serialOptions: SerialPortOpenOptions<AutoDetectTypes>;
    clearOnSend: boolean;
    lineEnding: LineEnding;
    lineMode: boolean;
    echoOnShell: boolean;
    showOverwriteDialog: boolean;
}

const initialState: TerminalState = {
    availableSerialPorts: [],
    serialPort: undefined,
    autoConnected: false,
    serialOptions: {
        baudRate: 115200,
        path: '',
    },
    clearOnSend: true,
    lineEnding: 'CRLF',
    lineMode: true,
    echoOnShell: true,
    showOverwriteDialog: false,
};

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
        setUpdateOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            state.serialOptions = { ...state.serialOptions, ...action.payload };
        },
        setSetOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            state.serialOptions = { ...state.serialOptions, ...action.payload };
        },
        setSerialOptions: (
            state,
            action: PayloadAction<
                Partial<SerialPortOpenOptions<AutoDetectTypes>>
            >
        ) => {
            state.serialOptions = {
                ...state.serialOptions,
                ...action.payload,
            };
        },
        setAutoConnected: (state, action: PayloadAction<boolean>) => {
            state.autoConnected = action.payload;
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
    },
});

export const getSerialPort = (state: RootState) =>
    state.app.terminal.serialPort;
export const getAutoConnected = (state: RootState) =>
    state.app.terminal.autoConnected;
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

export const {
    setSerialPort,
    setAvailableSerialPorts,
    setSerialOptions,
    setUpdateOptions,
    setSetOptions,
    setAutoConnected,
    setClearOnSend,
    setLineEnding,
    setLineMode,
    setEchoOnShell,
    setShowOverwriteDialog,
} = terminalSlice.actions;
export default terminalSlice.reducer;

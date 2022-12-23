/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';

import type { RootState } from '../../appReducer';
import type { Modem } from './modem';

export type SerialOptions = Partial<SerialPortOpenOptions<AutoDetectTypes>>;
export type LineEnding = 'NONE' | 'LF' | 'CR' | 'CRLF';

interface TerminalState {
    availableSerialPorts: string[];
    selectedSerialport?: string;
    modem?: Modem;
    autoConnected: boolean;
    serialOptions: SerialOptions;
    clearOnSend: boolean;
    lineEnding: LineEnding;
    lineMode: boolean;
    echoOnShell: boolean;
}

const initialState: TerminalState = {
    availableSerialPorts: [],
    selectedSerialport: undefined,
    modem: undefined,
    autoConnected: false,
    serialOptions: { baudRate: 115200 },
    clearOnSend: true,
    lineEnding: 'CRLF',
    lineMode: true,
    echoOnShell: true,
};

const terminalSlice = createSlice({
    name: 'modem',
    initialState,
    reducers: {
        setAvailableSerialPorts: (state, action: PayloadAction<string[]>) => {
            state.availableSerialPorts = action.payload;
        },
        setSelectedSerialport: (
            state,
            action: PayloadAction<string | undefined>
        ) => {
            state.selectedSerialport = action.payload;
        },
        setModem: (state, action: PayloadAction<Modem | undefined>) => {
            state.modem?.close();
            state.modem = action.payload;
        },
        setUpdateOptions: (state, action: PayloadAction<UpdateOptions>) => {
            state.serialOptions = { ...state.serialOptions, ...action.payload };
        },
        setSetOptions: (state, action: PayloadAction<SetOptions>) => {
            state.serialOptions = { ...state.serialOptions, ...action.payload };
        },
        setSerialOptions: (state, action: PayloadAction<SerialOptions>) => {
            state.serialOptions = action.payload;
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
    },
});

export const getModem = (state: RootState) => state.app.terminal.modem;
export const getSelectedSerialport = (state: RootState) =>
    state.app.terminal.selectedSerialport;
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

export const {
    setModem,
    setAvailableSerialPorts,
    setSelectedSerialport,
    setSerialOptions,
    setUpdateOptions,
    setSetOptions,
    setAutoConnected,
    setClearOnSend,
    setLineEnding,
    setLineMode,
    setEchoOnShell,
} = terminalSlice.actions;
export default terminalSlice.reducer;

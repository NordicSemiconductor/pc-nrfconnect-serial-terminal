/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { Modem } from './modem';

// Options Type Defs
export interface SerialOptions {
    baudRate?:
        | 115200
        | 57600
        | 38400
        | 19200
        | 9600
        | 4800
        | 2400
        | 1800
        | 1200
        | 600
        | 300
        | 200
        | 150
        | 134
        | 110
        | 75
        | 50
        | number
        | undefined;
    dataBits?: 8 | 7 | 6 | 5 | undefined;
    stopBits?: 1 | 2 | undefined;
    parity?: 'none' | 'even' | 'mark' | 'odd' | 'space' | undefined;
    rtscts?: boolean | undefined;
    xon?: boolean | undefined;
    xoff?: boolean | undefined;
    xany?: boolean | undefined;
}

interface TerminalState {
    availableSerialPorts: string[];
    selectedSerialport?: string;
    modem?: Modem;
    autoConnected: boolean;
    serialOptions: SerialOptions;
    clearOnSend: boolean;
    appendCarriageReturn: boolean;
    appendNewLine: boolean;
    appendNullTerminator: boolean;
    lineMode: boolean;
}

const initialState: TerminalState = {
    availableSerialPorts: [],
    selectedSerialport: undefined,
    modem: undefined,
    autoConnected: false,
    serialOptions: { baudRate: 115200 },
    clearOnSend: true,
    appendCarriageReturn: true,
    appendNewLine: true,
    appendNullTerminator: false,
    lineMode: true,
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
            state.modem = action.payload;
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
        setAppendCarriageReturn: (state, action: PayloadAction<boolean>) => {
            state.appendCarriageReturn = action.payload;
        },
        setAppendNewLine: (state, action: PayloadAction<boolean>) => {
            state.appendNewLine = action.payload;
        },
        setAppendNullTerminator: (state, action: PayloadAction<boolean>) => {
            state.appendNullTerminator = action.payload;
        },
        setLineMode: (state, action: PayloadAction<boolean>) => {
            state.lineMode = action.payload;
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
export const getAppendCarriageReturn = (state: RootState) =>
    state.app.terminal.appendCarriageReturn;
export const getAppendNewLine = (state: RootState) =>
    state.app.terminal.appendNewLine;
export const getAppendNullTerminator = (state: RootState) =>
    state.app.terminal.appendNullTerminator;
export const getLineMode = (state: RootState) => state.app.terminal.lineMode;

export const {
    setModem,
    setAvailableSerialPorts,
    setSelectedSerialport,
    setSerialOptions,
    setAutoConnected,
    setClearOnSend,
    setAppendCarriageReturn,
    setAppendNewLine,
    setAppendNullTerminator,
    setLineMode,
} = terminalSlice.actions;
export default terminalSlice.reducer;

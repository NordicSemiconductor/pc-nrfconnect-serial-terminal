/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfConnectState } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { combineReducers } from 'redux';

import historyFileReducer from './features/history/historySlice';
import terminalReducer from './features/terminal/terminalSlice';

type AppState = ReturnType<typeof appReducer>;

export type RootState = NrfConnectState<AppState>;

const appReducer = combineReducers({
    terminal: terminalReducer,
    historyFile: historyFileReducer,
});

export default appReducer;

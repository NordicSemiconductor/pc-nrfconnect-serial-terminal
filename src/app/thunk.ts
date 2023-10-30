/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import type { RootState } from '../appReducer';

export type TAction<T = void> = ThunkAction<T, RootState, null, AnyAction>;
export type TDispatch = ThunkDispatch<RootState, null, AnyAction>;

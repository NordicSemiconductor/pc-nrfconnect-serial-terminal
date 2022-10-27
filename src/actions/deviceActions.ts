/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device, logger } from 'pc-nrfconnect-shared';

import {
    setAvailableSerialPorts,
    setSelectedSerialport,
} from '../features/terminal/terminalSlice';
import type { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSelectedSerialport(undefined));
};

export const openDevice =
    (device: Device): TAction =>
    dispatch => {
        // Reset serial port settings
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSelectedSerialport(undefined));

        const ports = device.serialPorts;
        if (ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
    };

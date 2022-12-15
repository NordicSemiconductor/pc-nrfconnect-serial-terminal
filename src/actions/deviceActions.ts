/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { AutoDetectTypes } from '@serialport/bindings-cpp';
import { Device, getPersistedSerialPort, logger } from 'pc-nrfconnect-shared';
import { SerialPortOpenOptions } from 'serialport';

import { createModem } from '../features/terminal/modem';
import {
    setAvailableSerialPorts,
    setModem,
    setSelectedSerialport,
    setSerialOptions,
} from '../features/terminal/terminalSlice';
import type { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSelectedSerialport(undefined));
    dispatch(setModem(undefined));
};

export const openDevice =
    (device: Device): TAction =>
    async dispatch => {
        // Reset serial port settings
        const storedOptions:
            | SerialPortOpenOptions<AutoDetectTypes>
            | undefined = getPersistedSerialPort(
            device.serialNumber,
            'serial-terminal'
        );
        logger.info(
            `Got the options for app: ${JSON.stringify(storedOptions)}`
        );
        if (storedOptions) {
            dispatch(setSerialOptions(storedOptions));
            dispatch(setAvailableSerialPorts([]));
            dispatch(setSelectedSerialport(storedOptions.path));
            await dispatch(
                setModem(await createModem(storedOptions, false, dispatch))
            );
        }
        dispatch(setAvailableSerialPorts([]));
        dispatch(setSelectedSerialport(undefined));

        const ports = device.serialPorts;
        if (ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
    };

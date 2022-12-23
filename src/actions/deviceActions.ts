/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import {
    Device,
    getPersistedSerialPort,
    logger,
    SerialSettings,
} from 'pc-nrfconnect-shared';

import { createModem } from '../features/terminal/modem';
import {
    setAvailableSerialPorts,
    setModem,
    setSelectedSerialport,
    setSerialOptions,
} from '../features/terminal/terminalSlice';
import type { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    // TODO persistSerialPort
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSelectedSerialport(undefined));
    dispatch(setModem(undefined));
};

export const openDevice =
    (device: Device): TAction =>
    async dispatch => {
        // Reset serial port settings
        const serialSettings: SerialSettings | undefined =
            getPersistedSerialPort(device.serialNumber, 'serial-terminal');
        logger.info(
            `Got the options for app: ${JSON.stringify(
                serialSettings.serialPortOptions
            )}`
        );

        dispatch(setAvailableSerialPorts([]));
        dispatch(setSelectedSerialport(undefined));

        const storedOptions = serialSettings.serialPortOptions;
        if (storedOptions) {
            dispatch(setSerialOptions(storedOptions));
            dispatch(setSelectedSerialport(storedOptions.path));
            await dispatch(
                setModem(await createModem(storedOptions, false, dispatch))
            );
        }

        const ports = device.serialPorts;
        if (ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
    };

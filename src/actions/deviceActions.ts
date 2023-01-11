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

export const deviceConnected =
    (device: Device): TAction =>
    () => {
        // TODO persistSerialPort
        logger.info(`Device Connected SN:${device.serialNumber}`);
    };

export const deviceDisconnected =
    (device: Device): TAction =>
    () => {
        // TODO persistSerialPort
        logger.info(`Device Disconnected SN:${device.serialNumber}`);
    };

export const openDevice =
    (device: Device): TAction =>
    async dispatch => {
        // Reset serial port settings
        const serialSettings: SerialSettings | undefined =
            getPersistedSerialPort(device.serialNumber, 'serial-terminal');

        dispatch(setAvailableSerialPorts([]));
        dispatch(setSelectedSerialport(undefined));

        if (serialSettings) {
            const storedOptions = serialSettings.serialPortOptions;
            logger.info(
                `Got the options for app: ${JSON.stringify(
                    serialSettings.serialPortOptions
                )}`
            );
            dispatch(setSerialOptions(storedOptions));
            dispatch(setSelectedSerialport(storedOptions.path));
            await dispatch(
                setModem(await createModem(storedOptions, false, dispatch))
            );
        }

        const ports = device.serialPorts;
        if (ports && ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }
    };

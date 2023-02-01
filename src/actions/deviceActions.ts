/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import {
    createSerialPort,
    Device,
    getPersistedSerialPort,
    logger,
} from 'pc-nrfconnect-shared';

import {
    setAvailableSerialPorts,
    setSerialOptions,
    setSerialPort,
} from '../features/terminal/terminalSlice';
import type { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSerialOptions({ path: '' }));
    dispatch(setSerialPort(undefined));
};

export const deviceConnected =
    (device: Device): TAction =>
    () => {
        logger.info(`Device Connected SN:${device.serialNumber}`);
    };

export const deviceDisconnected =
    (device: Device): TAction =>
    () => {
        logger.info(`Device Disconnected SN:${device.serialNumber}`);
    };

export const openDevice =
    (device: Device): TAction =>
    async (dispatch, getState) => {
        // Reset serial port settings
        const globalAutoReconnect = getState().device.autoReconnect;
        const ports = device.serialPorts;

        if (ports && ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }

        if (globalAutoReconnect && ports) {
            const serialSettings = getPersistedSerialPort(
                device.serialNumber,
                'serial-terminal'
            );

            if (serialSettings && ports?.length > serialSettings.vComIndex) {
                const storedOptions = serialSettings.serialPortOptions;
                storedOptions.path =
                    ports[serialSettings.vComIndex].comName ??
                    storedOptions.path;

                logger.info(
                    `Got the options for app: ${JSON.stringify(
                        serialSettings.serialPortOptions
                    )}`
                );
                dispatch(setSerialOptions(storedOptions));
                await dispatch(
                    setSerialPort(
                        await createSerialPort(storedOptions, {
                            overwrite: false,
                            settingsLocked: false,
                        })
                    )
                );
            }
        }
    };

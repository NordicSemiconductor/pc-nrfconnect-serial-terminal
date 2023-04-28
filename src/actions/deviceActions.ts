/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { createSerialPort, Device, logger } from 'pc-nrfconnect-shared';

import {
    setAvailableSerialPorts,
    setSerialOptions,
    setSerialPort,
    updateSerialOptions,
} from '../features/terminal/terminalSlice';
import type { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(updateSerialOptions({ path: '' }));
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
        const autoReselect = getState().deviceAutoSelect.autoReselect;
        const ports = device.serialPorts;
        if (ports && ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
            dispatch(updateSerialOptions({ path: ports[0].comName ?? '' }));
        }
        if (autoReselect && ports) {
            const serialSettings = device.persistedSerialPortOptions;
            if (serialSettings) {
                await dispatch(setSerialOptions(serialSettings));
                dispatch(
                    setSerialPort(
                        await createSerialPort(serialSettings, {
                            overwrite: false,
                            settingsLocked: false,
                        })
                    )
                );
            }
        }
    };

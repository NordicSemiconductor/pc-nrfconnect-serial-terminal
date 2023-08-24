/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import {
    createSerialPort,
    Device,
    getSerialPortOptions,
    logger,
} from 'pc-nrfconnect-shared';

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

let cliAutoConnectDone = false;

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

        const { argv } = process;
        const portNameIndex = argv.findIndex(arg => arg === '--comPort');
        const cliAutoPortName =
            portNameIndex > -1 ? argv[portNameIndex + 1] : undefined;

        if (!cliAutoConnectDone && cliAutoPortName) {
            cliAutoConnectDone = true;

            const portExists =
                ports && ports.find(port => port.comName === cliAutoPortName);

            if (!portExists) {
                return;
            }

            const options =
                (await getSerialPortOptions(cliAutoPortName)) ??
                device.persistedSerialPortOptions;

            dispatch(
                setSerialPort(
                    await createSerialPort(
                        { path: cliAutoPortName, baudRate: 115200, ...options },
                        {
                            overwrite: false,
                            settingsLocked: false,
                        }
                    )
                )
            );
            return;
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

/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import {
    Button,
    createSerialPort,
    Dialog,
    getSerialPortOptions,
    SerialPort,
} from 'pc-nrfconnect-shared';
import { SerialPortOpenOptions } from 'serialport';

import {
    getSerialOptions,
    getSerialPort,
    getShowOverwriteDialog,
    setSerialPort,
    setShowOverwriteDialog,
} from '../../features/terminal/terminalSlice';

const getCurrentOptions = async (
    portPath: string,
    setSettings: (options: SerialPortOpenOptions<AutoDetectTypes>) => void
) => {
    try {
        const options = await getSerialPortOptions(portPath);
        if (options) {
            setSettings(options);
        }
    } catch (err) {
        console.error(err);
    }
};

export default () => {
    const dispatch = useDispatch();
    const serialOptions = useSelector(getSerialOptions);
    const conflictingSettings = useSelector(getShowOverwriteDialog);
    const [settings, setSettings] =
        useState<SerialPortOpenOptions<AutoDetectTypes>>();

    useEffect(() => {
        if (!settings) {
            getCurrentOptions(serialOptions.path, setSettings);
        }
    }, [settings, serialOptions.path, conflictingSettings]);

    const connectToSelectedSerialPort = async (
        overwrite: boolean,
        newSettings: SerialPortOpenOptions<AutoDetectTypes>
    ) => {
        try {
            const port = await createSerialPort(newSettings, {
                overwrite,
                settingsLocked: false,
            });
            dispatch(setSerialPort(port));
        } catch (error) {
            const msg = (error as Error).message;
            if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
                dispatch(setShowOverwriteDialog(true));
            } else {
                console.error(
                    'Port could not be opened. Verify it is not used by some other applications'
                );
            }
        }
    };

    return (
        <Dialog
            isVisible={conflictingSettings}
            size="lg"
            onHide={() => {
                dispatch(setShowOverwriteDialog(false));
            }}
            closeOnEsc
            closeOnUnfocus
        >
            <Dialog.Header
                title={`Conflicting Serial Settings for ${serialOptions.path}`}
            />
            <Dialog.Body>
                <p>
                    The port you have selected is already open with different
                    settings, this is most likely because a different nRF
                    Connect app has opened the same serial port. You may
                    continue with the current settings or overwrite the settings
                    and open the port. If you choose to overwrite the settings,
                    the port will be closed and reopened with the new settings.
                    Alternatively, you can close the port in the app that has it
                    open and try again.
                </p>

                <h4>Current settings</h4>
                {settings ? (
                    <ul>
                        {Object.entries(settings).map(([key, value]) => (
                            <li key={key}>
                                {key}: {JSON.stringify(value)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Could not retrieve the current settings</p>
                )}
                <h4>Selected settings</h4>
                <p>
                    <ul>
                        {Object.entries(serialOptions).map(([key, value]) => (
                            <li key={key}>
                                {key}: {JSON.stringify(value)}
                            </li>
                        ))}
                    </ul>
                </p>
            </Dialog.Body>
            <Dialog.Footer>
                &nbsp;
                <Button
                    variant="secondary"
                    onClick={() => {
                        dispatch(setShowOverwriteDialog(false));
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        dispatch(
                            connectToSelectedSerialPort(true, serialOptions)
                        );
                    }}
                >
                    Connect and overwrite settings
                </Button>
                {settings === undefined ? null : (
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(setShowOverwriteDialog(false));
                            dispatch(
                                connectToSelectedSerialPort(false, settings)
                            );
                        }}
                    >
                        Continue with current settings
                    </Button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};

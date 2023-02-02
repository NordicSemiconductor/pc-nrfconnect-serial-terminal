/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PaneProps } from 'pc-nrfconnect-shared';

import {
    getClearOnSend,
    getLineEnding,
    getLineMode,
    getSerialOptions,
    getSerialPort,
    setSerialOptions,
} from '../../features/terminal/terminalSlice';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const dispatch = useDispatch();
    const serialPort = useSelector(getSerialPort);
    const serialOptions = useSelector(getSerialOptions);
    const lineEnding = useSelector(getLineEnding);
    const lineMode = useSelector(getLineMode);
    const clearOnSend = useSelector(getClearOnSend);

    const onDataWritten = useCallback(
        (listener: (data: Uint8Array) => void) => {
            if (!serialPort) return () => {};

            return serialPort.onDataWritten(listener);
        },
        [serialPort]
    );
    const onData = useCallback(
        (listener: (data: Uint8Array) => void) => {
            if (!serialPort) return () => {};

            return serialPort.onData(listener);
        },
        [serialPort]
    );

    useEffect(() => {
        if (!serialPort) return;

        const unsubscribeOnUpdate = serialPort.onUpdate(options => {
            dispatch(
                setSerialOptions({
                    path: serialOptions.path,
                    ...options,
                })
            );
        });

        const unsubscribeOnChange = serialPort.onChange(options => {
            dispatch(setSerialOptions(options));
        });

        return () => {
            unsubscribeOnUpdate();
            unsubscribeOnChange();
        };
    }, [dispatch, serialOptions.path, serialPort]);

    const commandCallback = useCallback(
        (command: string) => {
            if (!serialPort) return 'Please connect a device';

            if (!serialPort.isOpen()) return 'Connection is not open';

            if (lineMode) {
                switch (lineEnding) {
                    case 'CR':
                        command += '\r';
                        break;
                    case 'CRLF':
                        command += '\r\n';
                        break;
                    case 'LF':
                        command += '\n';
                        break;
                }
            }

            serialPort?.write(command);
        },
        [serialPort, lineEnding, lineMode]
    );

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <Terminal
                    commandCallback={commandCallback}
                    onData={onData}
                    onDataWritten={onDataWritten}
                    clearOnSend={clearOnSend}
                    lineMode={lineMode}
                />
            )}
        </>
    );
};

export default Main;

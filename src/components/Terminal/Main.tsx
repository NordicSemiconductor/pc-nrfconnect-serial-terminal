/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PaneProps } from 'pc-nrfconnect-shared';

import {
    getAppendCarriageReturn,
    getAppendNewLine,
    getAppendNullTerminator,
    getClearOnSend,
    getLineMode,
    getModem,
} from '../../features/terminal/terminalSlice';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const modem = useSelector(getModem);
    const appendCarriageReturn = useSelector(getAppendCarriageReturn);
    const appendNewLine = useSelector(getAppendNewLine);
    const appendNullTerminator = useSelector(getAppendNullTerminator);
    const lineMode = useSelector(getLineMode);
    const clearOnSend = useSelector(getClearOnSend);

    const onModemData = useCallback(
        (listener: (data: string) => void) => {
            if (!modem) return () => {};

            const cleanup = [modem.onResponse(data => data.forEach(listener))];

            return () => cleanup.forEach(fn => fn());
        },
        [modem]
    );

    const onModemOpen = useCallback(
        (listener: () => void) => {
            if (!modem) return () => {};

            const cleanup = [modem.onOpen(listener)];

            return () => cleanup.forEach(fn => fn());
        },
        [modem]
    );

    const commandCallback = useCallback(
        (command: string) => {
            if (!modem) return 'Please connect a device';

            if (!modem.isOpen()) return 'Connection is not open';

            command += lineMode
                ? (appendCarriageReturn ? '\r' : '') +
                  (appendNewLine ? '\n' : '') +
                  (appendNullTerminator ? '\0' : '')
                : '';

            if (!modem?.write(command)) return 'Modem busy or invalid command';
        },
        [
            modem,
            appendCarriageReturn,
            appendNewLine,
            appendNullTerminator,
            lineMode,
        ]
    );

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <Terminal
                    commandCallback={commandCallback}
                    onModemData={onModemData}
                    onModemOpen={onModemOpen}
                    clearOnSend={clearOnSend}
                    lineMode={lineMode}
                />
            )}
        </>
    );
};

export default Main;

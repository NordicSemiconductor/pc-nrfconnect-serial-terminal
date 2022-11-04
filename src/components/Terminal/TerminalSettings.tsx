/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Group, StateSelector, Toggle } from 'pc-nrfconnect-shared';

import {
    getAppendCarriageReturn,
    getAppendNewLine,
    getAppendNullTerminator,
    getClearOnSend,
    getEchoOnShell,
    getLineMode,
    setAppendCarriageReturn,
    setAppendNewLine,
    setAppendNullTerminator,
    setClearOnSend,
    setEchoOnShell,
    setLineMode,
} from '../../features/terminal/terminalSlice';

const TerminalSettings = () => {
    const clearOnSend = useSelector(getClearOnSend);
    const appendCarriageReturn = useSelector(getAppendCarriageReturn);
    const appendNewLine = useSelector(getAppendNewLine);
    const appendNullTerminator = useSelector(getAppendNullTerminator);
    const echoOnShell = useSelector(getEchoOnShell);

    const lineMode = useSelector(getLineMode);

    const dispatch = useDispatch();

    return (
        <Group heading="Terminal Settings">
            <StateSelector
                items={['Line', 'Shell']}
                defaultIndex={0}
                onSelect={value => dispatch(setLineMode(value === 0))}
            />
            {lineMode && (
                <>
                    <Toggle
                        isToggled={clearOnSend}
                        onToggle={value => dispatch(setClearOnSend(value))}
                        label="Clear on Send"
                    />
                    <Toggle
                        isToggled={appendCarriageReturn}
                        onToggle={value =>
                            dispatch(setAppendCarriageReturn(value))
                        }
                        label="Append Carriage Return (CR)"
                    />
                    <Toggle
                        isToggled={appendNewLine}
                        onToggle={value => dispatch(setAppendNewLine(value))}
                        label="Append New Line (NL)"
                    />
                    <Toggle
                        isToggled={appendNullTerminator}
                        onToggle={value =>
                            dispatch(setAppendNullTerminator(value))
                        }
                        label="Append Null Terminator"
                    />
                </>
            )}
            {!lineMode && (
                <Toggle
                    isToggled={echoOnShell}
                    onToggle={value => dispatch(setEchoOnShell(value))}
                    label="Echo on Shell"
                />
            )}
        </Group>
    );
};

export default TerminalSettings;

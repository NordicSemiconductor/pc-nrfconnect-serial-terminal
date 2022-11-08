/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Group, StateSelector, Toggle } from 'pc-nrfconnect-shared';

import {
    getClearOnSend,
    getEchoOnShell,
    getLineEnding,
    getLineMode,
    LineEnding,
    setClearOnSend,
    setEchoOnShell,
    setLineEnding,
    setLineMode,
} from '../../features/terminal/terminalSlice';
import { convertToDropDownItems } from '../../utils/dataConstructors';

const TerminalSettings = () => {
    const clearOnSend = useSelector(getClearOnSend);
    const lineEnding = useSelector(getLineEnding);
    const echoOnShell = useSelector(getEchoOnShell);

    const lineMode = useSelector(getLineMode);

    const dispatch = useDispatch();

    const lineEndings = convertToDropDownItems<string>(
        ['NONE', 'LF', 'CR', 'CRLF'],
        false
    );

    const selectedLineEnding = lineEnding
        ? lineEndings[lineEndings.findIndex(e => e.value === lineEnding)]
        : lineEndings[0];

    const lineModeItems = ['Line', 'Shell'];

    return (
        <Group heading="Terminal Settings">
            <StateSelector
                items={lineModeItems}
                defaultIndex={0}
                onSelect={value => dispatch(setLineMode(value === 0))}
                selectedItem={lineModeItems[lineMode ? 0 : 1]}
            />
            {lineMode && (
                <>
                    <Toggle
                        isToggled={clearOnSend}
                        onToggle={value => dispatch(setClearOnSend(value))}
                        label="Clear on Send"
                    />
                    <Dropdown
                        label="Line Ending"
                        onSelect={value =>
                            dispatch(setLineEnding(value.value as LineEnding))
                        }
                        items={lineEndings}
                        selectedItem={selectedLineEnding}
                    />
                </>
            )}
            {!lineMode && (
                <Toggle
                    isToggled={echoOnShell}
                    onToggle={value => dispatch(setEchoOnShell(value))}
                    label="Echo on shell"
                />
            )}
        </Group>
    );
};

export default TerminalSettings;

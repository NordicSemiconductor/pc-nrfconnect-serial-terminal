/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    CollapsibleGroup,
    Dropdown,
    getPersistedTerminalSettings,
    persistTerminalSettings,
    selectedDevice,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getClearOnSend,
    getEchoOnShell,
    getLineEnding,
    getLineMode,
    getSerialOptions,
    getSerialPort,
    LineEnding,
    setClearOnSend,
    setEchoOnShell,
    setLineEnding,
    setLineMode,
} from '../../../features/terminal/terminalSlice';
import { convertToDropDownItems } from '../../../utils/dataConstructors';
import ExportLog from './ExportLog';

export default () => {
    const device = useSelector(selectedDevice);
    const serialPort = useSelector(getSerialPort);
    const lastModemOpenState = useRef(false);
    const selectedSerialport = useSelector(getSerialOptions).path;

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

    useEffect(() => {
        if (!serialPort) {
            lastModemOpenState.current = false;
        }
    }, [serialPort]);

    useEffect(() => {
        if (serialPort) {
            serialPort.isOpen().then(open => {
                if (lastModemOpenState.current !== open && device) {
                    const vComIndex = device.serialPorts?.findIndex(
                        dev => dev.comName === selectedSerialport
                    );

                    if (vComIndex === undefined || vComIndex === -1) {
                        return;
                    }

                    const terminalSettings = getPersistedTerminalSettings(
                        device,
                        vComIndex
                    );

                    if (terminalSettings) {
                        dispatch(setLineMode(terminalSettings.lineMode));
                        dispatch(setEchoOnShell(terminalSettings.echoOnShell));
                        dispatch(
                            setLineEnding(
                                terminalSettings.lineEnding as LineEnding
                            )
                        );
                        dispatch(setClearOnSend(terminalSettings.clearOnSend));
                    }
                }

                lastModemOpenState.current = open;
            });
        } else {
            lastModemOpenState.current = false;
        }
    }, [device, dispatch, serialPort, selectedSerialport]);

    useEffect(() => {
        if (!device) {
            return;
        }

        !serialPort?.isOpen().then(open => {
            if (!open) return;

            const vComIndex = device.serialPorts?.findIndex(
                dev => dev.comName === selectedSerialport
            );

            if (vComIndex === undefined || vComIndex === -1) {
                return;
            }

            persistTerminalSettings(device, vComIndex, {
                lineMode,
                echoOnShell,
                lineEnding,
                clearOnSend,
            });
        });
    }, [
        clearOnSend,
        device,
        echoOnShell,
        lineEnding,
        lineMode,
        selectedSerialport,
        serialPort,
    ]);

    return (
        <>
            <CollapsibleGroup heading="Terminal Settings">
                <StateSelector
                    items={lineModeItems}
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
                                dispatch(
                                    setLineEnding(value.value as LineEnding)
                                )
                            }
                            items={lineEndings}
                            selectedItem={selectedLineEnding}
                        />
                    </>
                )}
                {!lineMode && (
                    <Toggle
                        title="This option should be on ff the device echo back any data sent. Otherwise this needs to be set to off"
                        isToggled={echoOnShell}
                        onToggle={value => dispatch(setEchoOnShell(value))}
                        label="Device controls echo"
                    />
                )}
            </CollapsibleGroup>
            <CollapsibleGroup heading="Write to file">
                <ExportLog />
            </CollapsibleGroup>
        </>
    );
};

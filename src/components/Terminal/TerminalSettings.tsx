/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dropdown,
    getPersistedTerminalSettings,
    Group,
    persistTerminalSettings,
    selectedDevice,
    StateSelector,
    Toggle,
} from 'pc-nrfconnect-shared';

import {
    getClearOnSend,
    getEchoOnShell,
    getLineEnding,
    getLineMode,
    getModem,
    getSelectedSerialport,
    LineEnding,
    setClearOnSend,
    setEchoOnShell,
    setLineEnding,
    setLineMode,
} from '../../features/terminal/terminalSlice';
import { convertToDropDownItems } from '../../utils/dataConstructors';

const TerminalSettings = () => {
    const device = useSelector(selectedDevice);
    const modem = useSelector(getModem);
    const lastModemOpenState = useRef(false);
    const selectedSerialport = useSelector(getSelectedSerialport);

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
        if (!modem) {
            lastModemOpenState.current = false;
        }
    }, [modem]);

    useEffect(() => {
        if (modem) {
            modem.isOpen().then(open => {
                if (lastModemOpenState.current !== open && device) {
                    const vComIndex = device.serialPorts?.findIndex(
                        dev => dev.comName === selectedSerialport
                    );

                    if (vComIndex === undefined || vComIndex === -1) {
                        return;
                    }

                    const terminalSettings = getPersistedTerminalSettings(
                        device.serialNumber,
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
    }, [device, dispatch, modem, selectedSerialport]);

    useEffect(() => {
        if (!device) {
            return;
        }

        !modem?.isOpen().then(open => {
            if (!open) return;

            const vComIndex = device.serialPorts?.findIndex(
                dev => dev.comName === selectedSerialport
            );

            if (vComIndex === undefined || vComIndex === -1) {
                return;
            }

            persistTerminalSettings(device.serialNumber, vComIndex, {
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
        modem,
    ]);

    return (
        <Group heading="Terminal Settings">
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

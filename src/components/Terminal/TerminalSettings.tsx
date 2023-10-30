/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    Dropdown,
    getPersistedTerminalSettings,
    NumberInlineInput,
    NumberInputSliderWithUnit,
    persistTerminalSettings,
    selectedDevice,
    StateSelector,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { openFile } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/open';

import {
    getPathToHistoryFile,
    MAXIMUM_MAX_NUMBER_OF_LINES,
    MINIMUM_MAX_NUMER_OF_LINES,
} from '../../app/store';
import {
    initializeHistoryBuffer,
    setNewMaximumNumberOfLinesInHistory,
    trimHistoryFile,
} from '../../features/history/effects';
import {
    getMaximumNumberOfLinesInHistory,
    getNumberOfLinesInHistory,
} from '../../features/history/historySlice';
import {
    getClearOnSend,
    getEchoOnShell,
    getLineEnding,
    getLineMode,
    getScrollback,
    getSerialOptions,
    getSerialPort,
    LineEnding,
    setClearOnSend,
    setEchoOnShell,
    setLineEnding,
    setLineMode,
    setScrollback as setActiveScrollback,
} from '../../features/terminal/terminalSlice';
import { convertToDropDownItems } from '../../utils/dataConstructors';

export default () => {
    const device = useSelector(selectedDevice);
    const serialPort = useSelector(getSerialPort);
    const lastModemOpenState = useRef(false);
    const selectedSerialport = useSelector(getSerialOptions).path;

    const activeScrollback = useSelector(getScrollback);
    const [scrollback, setScrollback] = useState(activeScrollback);

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
        serialPort,
    ]);

    return (
        <CollapsibleGroup heading="Terminal Settings" defaultCollapsed={false}>
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
                    title="This option should be on ff the device echo back any data sent. Otherwise this needs to be set to off"
                    isToggled={echoOnShell}
                    onToggle={value => dispatch(setEchoOnShell(value))}
                    label="Device controls echo"
                />
            )}
            <div
                title="Set the number of lines it is possible to scroll in the Terminal"
                className="tw-flex tw-justify-between tw-pt-1"
            >
                Scrollback
                <NumberInlineInput
                    value={scrollback}
                    onChange={setScrollback}
                    onChangeComplete={() => {
                        if (scrollback !== activeScrollback) {
                            dispatch(setActiveScrollback(scrollback));
                        }
                    }}
                    range={{ min: 1, max: 2 ** 64 - 1 }}
                />
            </div>
            <HistoryFileSettings />
        </CollapsibleGroup>
    );
};

const HistoryFileSettings = () => {
    const dispatch = useDispatch();

    const pathToHistoryFile = useSelector(getPathToHistoryFile);
    const numberOfLinesInHistory = useSelector(getNumberOfLinesInHistory);
    const maximumNumberOfLinesInHistory = useSelector(
        getMaximumNumberOfLinesInHistory
    );

    const [newMaximumNumberOfLines, setNewMaximumNumberOfLines] = useState(
        maximumNumberOfLinesInHistory
    );
    const [numberOfLinesToKeep, setNumberOfLinesToKeep] = useState(
        numberOfLinesInHistory
    );
    const historyUsagePercentage =
        (numberOfLinesInHistory / maximumNumberOfLinesInHistory) * 100;

    useEffect(() => {
        dispatch(initializeHistoryBuffer);
    }, [dispatch]);

    useLayoutEffect(() => {
        setNumberOfLinesToKeep(numberOfLinesInHistory);
    }, [numberOfLinesInHistory]);

    return (
        <>
            <span className="tw-font-bold">File usage</span>
            {historyUsagePercentage < 75 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="success"
                />
            )}
            {historyUsagePercentage >= 75 && historyUsagePercentage < 90 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="warning"
                />
            )}
            {historyUsagePercentage >= 90 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="danger"
                />
            )}

            <div
                title="Set the maximum number of lines to store in the history file"
                className="tw-flex tw-justify-between"
            >
                Max lines in history file{' '}
                <NumberInlineInput
                    value={newMaximumNumberOfLines}
                    onChange={setNewMaximumNumberOfLines}
                    onChangeComplete={size =>
                        dispatch(setNewMaximumNumberOfLinesInHistory(size))
                    }
                    range={{
                        min: MINIMUM_MAX_NUMER_OF_LINES,
                        max: MAXIMUM_MAX_NUMBER_OF_LINES,
                    }}
                />
            </div>

            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() => openFile(pathToHistoryFile)}
            >
                Open History File
            </Button>

            {numberOfLinesInHistory > 0 ? (
                <>
                    <span className="tw-font-bold">Clean History File</span>
                    <div title="Clean the history file, select how much of the content should be kept in the file, denoted in % (percentage)">
                        <NumberInputSliderWithUnit
                            label="Keep"
                            value={numberOfLinesToKeep}
                            onChange={setNumberOfLinesToKeep}
                            range={{ min: 0, max: numberOfLinesInHistory }}
                            unit="lines"
                        />
                        <Button
                            variant="secondary"
                            className="tw-w-full"
                            onClick={() =>
                                dispatch(trimHistoryFile(numberOfLinesToKeep))
                            }
                        >
                            Clean up History File
                        </Button>
                    </div>
                </>
            ) : null}
        </>
    );
};

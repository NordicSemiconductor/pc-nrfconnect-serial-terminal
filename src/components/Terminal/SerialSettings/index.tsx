/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
    ConflictingSettingsDialog,
    createSerialPort,
    Dropdown,
    DropdownItem,
    Group,
    logger,
    persistSerialPortOptions,
    SerialPort,
    truncateMiddle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import {
    getAvailableSerialPorts,
    getSerialOptions,
    getSerialPort,
    getShowOverwriteDialog,
    setSerialOptions,
    setSerialPort,
    setShowOverwriteDialog,
    updateSerialOptions,
} from '../../../features/terminal/terminalSlice';
import {
    convertToDropDownItems,
    getSelectedDropdownItem,
} from '../../../utils/dataConstructors';
import Baudrate from './Baudrate';

type Parity = 'none' | 'even' | 'mark' | 'odd' | 'space' | undefined;
type DataBits = 8 | 7 | 6 | 5 | undefined;
type StopBits = 1 | 2 | undefined;

const convertOnOffItemToBoolean = (item: DropdownItem) =>
    ['on', 'off'].indexOf(item.value) === -1 ? undefined : item.value === 'on';

const convertItemToValue = (valueList: string[], item: DropdownItem) =>
    valueList.indexOf(item.value) === -1 ? undefined : item.value;

const SerialSettings = () => {
    const serialOptions = useSelector(getSerialOptions);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const serialPort = useSelector(getSerialPort);
    const showConflictingSettingsDialog = useSelector(getShowOverwriteDialog);

    const isConnected = serialPort !== undefined;

    const dispatch = useDispatch();

    const comPortsDropdownItems = useMemo(
        () =>
            availablePorts.length > 0
                ? [
                      ...availablePorts.map(portPath => ({
                          label: truncateMiddle(portPath, 20, 8),
                          value: portPath as string,
                      })),
                  ]
                : [{ label: 'Not connected', value: '' }],
        [availablePorts]
    );

    const selectedComPortItem = useMemo(
        () =>
            serialOptions.path !== ''
                ? getSelectedDropdownItem(
                      comPortsDropdownItems,
                      serialOptions.path
                  )
                : comPortsDropdownItems[0],
        [comPortsDropdownItems, serialOptions]
    );

    const updateSerialPort = async (
        options: Partial<SerialPortOpenOptions<AutoDetectTypes>>
    ) => {
        // If a port is not selected : just update settings
        if (options.path === '') {
            if (serialPort !== undefined) {
                dispatch(setSerialPort(undefined));
            }
            dispatch(updateSerialOptions(options));
            return;
        }

        // Port has been changed:
        if (serialOptions.path !== options.path) {
            await serialPort?.close();
        }

        dispatch(updateSerialOptions(options));
    };

    const connectToSelectedSerialPort = async (
        overwrite = false,
        options: Partial<SerialPortOpenOptions<AutoDetectTypes>> = {}
    ) => {
        const completeOptions = { ...serialOptions, ...options };

        if (completeOptions.path !== '') {
            dispatch(setShowOverwriteDialog(false));
            try {
                const port = await createSerialPort(completeOptions, {
                    overwrite,
                    settingsLocked: false,
                });
                dispatch(setSerialPort(port));
            } catch (error) {
                const msg = (error as Error).message;
                if (msg.includes('FAILED_DIFFERENT_SETTINGS')) {
                    dispatch(setShowOverwriteDialog(true));
                } else {
                    logger.error(
                        'Port could not be opened. Verify it is not used by some other applications'
                    );
                }
            }
        }
    };

    const parityOptions = () => {
        // https://serialport.io/docs/api-bindings-cpp#open
        if (process.platform === 'win32') {
            return ['none', 'even', 'mark', 'odd', 'space'];
        }
        return ['none', 'even', 'odd'];
    };

    const dataBitsItems = convertToDropDownItems([8, 7, 6, 5], true);
    const stopBitsItems = convertToDropDownItems([1, 2], true);
    const parityItems = convertToDropDownItems(parityOptions(), true);

    const onOffItems = convertToDropDownItems(['on', 'off'], true);

    useEffect(() => {
        if (serialPort !== undefined) {
            dispatch(persistSerialPortOptions(serialOptions));
        }
    }, [dispatch, serialOptions, serialPort]);

    return (
        <>
            <Group heading="Serial Port">
                <Dropdown
                    onSelect={({ value }) => updateSerialPort({ path: value })}
                    items={comPortsDropdownItems}
                    selectedItem={selectedComPortItem}
                    disabled={availablePorts.length === 0 || isConnected}
                />
                {serialPort == null ? (
                    <Button
                        size="lg"
                        variant="secondary"
                        className="tw-w-full"
                        onClick={() => connectToSelectedSerialPort(false)}
                        disabled={availablePorts.length === 0}
                    >
                        Connect to port
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        variant="secondary"
                        className="tw-w-full"
                        onClick={() => {
                            dispatch(setSerialPort(undefined));
                        }}
                        disabled={availablePorts.length === 0}
                    >
                        Disconnect from port
                    </Button>
                )}
            </Group>
            <CollapsibleGroup heading="Serial Settings">
                <Baudrate updateSerialPort={updateSerialPort} />
                <Dropdown
                    label="Data bits"
                    onSelect={item =>
                        updateSerialPort({
                            dataBits: convertItemToValue(
                                ['8', '7', '6', '5'],
                                item
                            ) as DataBits,
                        })
                    }
                    items={dataBitsItems}
                    selectedItem={getSelectedDropdownItem(
                        dataBitsItems,
                        serialOptions.dataBits
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="Stop bits"
                    onSelect={item =>
                        updateSerialPort({
                            stopBits: convertItemToValue(
                                ['1', '2'],
                                item
                            ) as StopBits,
                        })
                    }
                    items={stopBitsItems}
                    selectedItem={getSelectedDropdownItem(
                        stopBitsItems,
                        serialOptions.stopBits
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="Parity"
                    onSelect={item =>
                        updateSerialPort({
                            parity: convertItemToValue(
                                parityOptions(),
                                item
                            ) as Parity,
                        })
                    }
                    items={parityItems}
                    selectedItem={getSelectedDropdownItem(
                        parityItems,
                        serialOptions.parity
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="rts/cts"
                    onSelect={item =>
                        updateSerialPort({
                            rtscts: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getSelectedDropdownItem(
                        onOffItems,
                        serialOptions.rtscts
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xOn"
                    onSelect={item =>
                        updateSerialPort({
                            xon: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getSelectedDropdownItem(
                        onOffItems,
                        serialOptions.xon
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xOff"
                    onSelect={item =>
                        updateSerialPort({
                            xoff: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getSelectedDropdownItem(
                        onOffItems,
                        serialOptions.xoff
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xAny"
                    onSelect={item =>
                        updateSerialPort({
                            xany: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getSelectedDropdownItem(
                        onOffItems,
                        serialOptions.xany
                    )}
                    disabled={isConnected}
                />
            </CollapsibleGroup>
            <ConflictingSettingsDialog
                isVisible={showConflictingSettingsDialog}
                localSettings={serialOptions}
                onCancel={() => dispatch(setShowOverwriteDialog(false))}
                onOverwrite={() => {
                    dispatch(setShowOverwriteDialog(false));
                    connectToSelectedSerialPort(true);
                }}
                setSerialPortCallback={(newSerialPort: SerialPort) => {
                    dispatch(setSerialPort(newSerialPort));
                    newSerialPort.getOptions()?.then(options => {
                        if (options) {
                            dispatch(setSerialOptions(options));
                        }
                    });
                }}
            />
        </>
    );
};

export default SerialSettings;

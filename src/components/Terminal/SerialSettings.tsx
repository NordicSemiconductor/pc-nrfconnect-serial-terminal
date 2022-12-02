/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Dropdown,
    DropdownItem,
    Group,
    selectedDevice,
    Toggle,
    truncateMiddle,
} from 'pc-nrfconnect-shared';

import { createModem } from '../../features/terminal/modem';
import {
    getAutoConnected,
    getAvailableSerialPorts,
    getModem,
    getSelectedSerialport,
    getSerialOptions,
    SerialOptions,
    setAutoConnected,
    setModem,
    setSelectedSerialport,
    setSerialOptions,
} from '../../features/terminal/terminalSlice';
import { convertToDropDownItems } from '../../utils/dataConstructors';

type Parity = 'none' | 'even' | 'mark' | 'odd' | 'space' | undefined;
type DataBits = 8 | 7 | 6 | 5 | undefined;
type StopBits = 1 | 2 | undefined;

const getItem = (itemList: DropdownItem[], value: unknown) => {
    if (typeof value === 'boolean') value = value ? 'on' : 'off';

    const result = itemList[itemList.findIndex(e => e.value === `${value}`)];

    return result === undefined ? itemList[0] : result;
};

const convertOnOffItemToBoolean = (item: DropdownItem) =>
    ['on', 'off'].indexOf(item.value) === -1 ? undefined : item.value === 'on';

const convertItemToValue = (valueList: string[], item: DropdownItem) =>
    valueList.indexOf(item.value) === -1 ? undefined : item.value;

const SerialSettings = () => {
    const device = useSelector(selectedDevice);
    const serialOptions = useSelector(getSerialOptions);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const autoConnected = useSelector(getAutoConnected);
    const modem = useSelector(getModem);

    const isConnected = modem !== undefined;

    const dispatch = useDispatch();

    const [overwrite, setOverwrite] = useState(false);

    const comPortsDropdownItems =
        availablePorts.length > 0
            ? [
                  ...availablePorts.map(portPath => ({
                      label: truncateMiddle(portPath, 20, 8),
                      value: portPath as string,
                  })),
              ]
            : [{ label: 'Not connected', value: 'Not connected' }];

    const selectedComPortItem =
        selectedSerialport != null
            ? comPortsDropdownItems[
                  comPortsDropdownItems.findIndex(
                      e => e.value === selectedSerialport
                  )
              ]
            : comPortsDropdownItems[0];

    const updateSerialPort = async (
        portPath: string | undefined,
        options: SerialOptions
    ) => {
        // If a port is not selected : just update settings
        if (portPath == null || portPath === 'Not connected') {
            if (modem != null) {
                await modem.close();
                dispatch(setModem(undefined));
            }
            dispatch(setSelectedSerialport(undefined));
            dispatch(setSerialOptions(options));
            return;
        }

        // Port has been changed:
        if (selectedSerialport !== portPath) {
            await modem?.close();
        }

        dispatch(setSelectedSerialport(portPath));
        dispatch(setSerialOptions(options));
    };

    const connectToSelectedSerialPort = async () => {
        if (selectedSerialport != null) {
            dispatch(
                setModem(
                    await createModem(
                        { ...serialOptions, path: selectedSerialport },
                        overwrite,
                        dispatch
                    )
                )
            );
        }
    };

    useEffect(() => {
        if (device) {
            dispatch(setSelectedSerialport(selectedComPortItem.value));
        }
    }, [device, dispatch, selectedComPortItem.value]);

    const { argv } = process;
    const portNameIndex = argv.findIndex(arg => arg === '--comPort');
    const portName = portNameIndex > -1 ? argv[portNameIndex + 1] : undefined;
    const shouldAutoConnect = !autoConnected && portName;

    if (shouldAutoConnect && availablePorts.length > 0) {
        const portExists = availablePorts.indexOf(portName) !== -1;

        if (portExists) updateSerialPort(portName, serialOptions);

        dispatch(setAutoConnected(true));
    }

    const baudRateItems = convertToDropDownItems(
        [
            115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300,
            200, 150, 134, 110, 75, 50,
        ],
        false
    );

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

    return (
        <>
            {modem == null ? (
                <Button
                    className="btn-primary w-100 h-100"
                    onClick={connectToSelectedSerialPort}
                    disabled={selectedSerialport == null}
                >
                    Connect to port
                </Button>
            ) : (
                <Button
                    className="btn-secondary w-100 h-100"
                    onClick={async () => {
                        await modem.close();
                        dispatch(setModem(undefined));
                    }}
                >
                    Disconnect from port
                </Button>
            )}
            <Toggle
                isToggled={overwrite}
                onToggle={() => setOverwrite(!overwrite)}
                label="overwrite settings"
            />

            <Group heading="Serial Settings">
                <Dropdown
                    label="Port"
                    onSelect={({ value }) =>
                        updateSerialPort(value, serialOptions)
                    }
                    items={comPortsDropdownItems}
                    selectedItem={selectedComPortItem}
                    disabled={availablePorts.length === 0 || isConnected}
                />
                <Dropdown
                    label="Baud Rate"
                    onSelect={item => {
                        if (selectedSerialport != null) {
                            modem?.update({ baudRate: Number(item.value) });
                        } else {
                            updateSerialPort(selectedSerialport, {
                                ...serialOptions,
                                baudRate: Number(item.value),
                            });
                        }
                    }}
                    items={baudRateItems}
                    selectedItem={getItem(
                        baudRateItems,
                        serialOptions.baudRate
                    )}
                />
                <Dropdown
                    label="Data bits"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            dataBits: convertItemToValue(
                                ['8', '7', '6', '5'],
                                item
                            ) as DataBits,
                        })
                    }
                    items={dataBitsItems}
                    selectedItem={getItem(
                        dataBitsItems,
                        serialOptions.dataBits
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="Stop bits"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            stopBits: convertItemToValue(
                                ['1', '2'],
                                item
                            ) as StopBits,
                        })
                    }
                    items={stopBitsItems}
                    selectedItem={getItem(
                        stopBitsItems,
                        serialOptions.stopBits
                    )}
                    disabled={isConnected}
                />
                <Dropdown
                    label="Parity"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            parity: convertItemToValue(
                                parityOptions(),
                                item
                            ) as Parity,
                        })
                    }
                    items={parityItems}
                    selectedItem={getItem(parityItems, serialOptions.parity)}
                    disabled={isConnected}
                />
                <Dropdown
                    label="rts/cts"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            rtscts: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getItem(onOffItems, serialOptions.rtscts)}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xOn"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xon: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getItem(onOffItems, serialOptions.xon)}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xOff"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xoff: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getItem(onOffItems, serialOptions.xoff)}
                    disabled={isConnected}
                />
                <Dropdown
                    label="xAny"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xany: convertOnOffItemToBoolean(item),
                        })
                    }
                    items={onOffItems}
                    selectedItem={getItem(onOffItems, serialOptions.xany)}
                    disabled={isConnected}
                />
            </Group>
        </>
    );
};

export default SerialSettings;

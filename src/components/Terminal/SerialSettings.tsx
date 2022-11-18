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
    Group,
    selectedDevice,
    Toggle,
    truncateMiddle,
} from 'pc-nrfconnect-shared';

import { createModem } from '../../features/terminal/modem';
import {
    getAskToOverwriteSettings,
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

const SerialSettings = () => {
    const device = useSelector(selectedDevice);
    const serialOptions = useSelector(getSerialOptions);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const autoConnected = useSelector(getAutoConnected);
    const modem = useSelector(getModem);

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
    }, [device, dispatch]);

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
                    className="btn-secondary w-100"
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
                <div className="body" style={{ marginBottom: '16px' }}>
                    <Dropdown
                        onSelect={({ value }) =>
                            updateSerialPort(value, serialOptions)
                        }
                        items={comPortsDropdownItems}
                        selectedItem={selectedComPortItem}
                        disabled={availablePorts.length === 0}
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
                        selectedItem={
                            baudRateItems[
                                baudRateItems.findIndex(
                                    e => e.value === `${serialOptions.baudRate}`
                                )
                            ]
                        }
                    />
                    <Dropdown
                        label="Data bits"
                        onSelect={item =>
                            updateSerialPort(selectedSerialport, {
                                ...serialOptions,
                                dataBits: (['8', '7', '6', '5'].indexOf(
                                    item.value
                                ) === -1
                                    ? undefined
                                    : Number(item.value)) as DataBits,
                            })
                        }
                        items={dataBitsItems}
                        defaultIndex={0}
                        selectedItem={
                            dataBitsItems[
                                dataBitsItems.findIndex(
                                    e => e.value === `${serialOptions.dataBits}`
                                )
                            ]
                        }
                    />
                    <Dropdown
                        label="Stop bits"
                        onSelect={item =>
                            updateSerialPort(selectedSerialport, {
                                ...serialOptions,
                                stopBits: (['1', '2'].indexOf(item.value) === -1
                                    ? undefined
                                    : Number(item.value)) as StopBits,
                            })
                        }
                        items={stopBitsItems}
                        selectedItem={
                            stopBitsItems[
                                stopBitsItems.findIndex(
                                    e => e.value === `${serialOptions.stopBits}`
                                )
                            ]
                        }
                        defaultIndex={0}
                    />
                    <Dropdown
                        label="Parity"
                        onSelect={item =>
                            updateSerialPort(selectedSerialport, {
                                ...serialOptions,
                                parity: (parityOptions().indexOf(item.value) ===
                                -1
                                    ? undefined
                                    : item.value) as Parity,
                            })
                        }
                        items={parityItems}
                        selectedItem={
                            parityItems[
                                parityItems.findIndex(
                                    e => e.value === `${serialOptions.parity}`
                                )
                            ]
                        }
                        defaultIndex={0}
                    />
                </div>
                <Toggle
                    isToggled={serialOptions.rtscts}
                    onToggle={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            rtscts: item,
                        })
                    }
                    label="rts/cts"
                />
                <Toggle
                    isToggled={serialOptions.xon}
                    onToggle={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xon: item,
                        })
                    }
                    label="xOn"
                />
                <Toggle
                    isToggled={serialOptions.xoff}
                    onToggle={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xoff: item,
                        })
                    }
                    label="xOff"
                />
                <Toggle
                    isToggled={serialOptions.xany}
                    onToggle={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            xany: item,
                        })
                    }
                    label="xAny"
                />
            </Group>
        </>
    );
};

export default SerialSettings;

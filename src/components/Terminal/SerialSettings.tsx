/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Group, truncateMiddle } from 'pc-nrfconnect-shared';

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

const SerialSettings = () => {
    const serialOptions = useSelector(getSerialOptions);
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const autoConnected = useSelector(getAutoConnected);
    const modem = useSelector(getModem);

    const dispatch = useDispatch();

    const comPortsDropdownItems =
        availablePorts.length > 0
            ? [
                  { label: 'Not connected', value: 'Not connected' },
                  ...availablePorts.map(portPath => ({
                      label: truncateMiddle(portPath, 20, 8),
                      value: portPath as string,
                  })),
              ]
            : [{ label: 'Not connected', value: 'Not connected' }];

    const selectedComPortItem = selectedSerialport
        ? comPortsDropdownItems[
              comPortsDropdownItems.findIndex(
                  e => e.value === selectedSerialport
              )
          ]
        : comPortsDropdownItems[0];

    const updateSerialPort = (
        portPath: string | undefined,
        options: SerialOptions
    ) => {
        if (typeof portPath === 'undefined') {
            dispatch(setSerialOptions(options));
            return;
        }

        if (portPath !== 'Not connected' || options !== serialOptions) {
            const action = () =>
                dispatch(setModem(createModem(portPath as string, options)));

            if (modem?.isOpen()) {
                modem.close(action);
            } else {
                action();
            }
        } else {
            modem?.close();
            setModem(undefined);
        }

        dispatch(setSelectedSerialport(portPath));
        dispatch(setSerialOptions(options));
    };

    const { argv } = process;

    const portNameIndex = argv.findIndex(arg => arg === '--comPort');
    const portName = portNameIndex > -1 ? argv[portNameIndex + 1] : undefined;
    const shouldAutoConnect = !autoConnected && portName;

    if (shouldAutoConnect && availablePorts.length > 0) {
        const portExists = availablePorts.indexOf(portName) !== -1;

        if (portExists) updateSerialPort(portName, serialOptions);

        dispatch(setAutoConnected(true));
    }

    const boadrateItems = convertToDropDownItems(
        [
            115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300,
            200, 150, 134, 110, 75, 50,
        ],
        false
    );

    const dataBitsItems = convertToDropDownItems([8, 7, 6, 5], true);
    const stopBitsItems = convertToDropDownItems([1, 2], true);
    const parityItems = convertToDropDownItems(
        ['none', 'even', 'mark', 'odd', 'space'],
        true
    );

    const onOffItems = convertToDropDownItems(['on', 'off'], true);

    return (
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
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            baudRate: Number(item.value),
                        })
                    }
                    items={boadrateItems}
                    selectedItem={
                        boadrateItems[
                            boadrateItems.findIndex(
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
                />
                <Dropdown
                    label="Parity"
                    onSelect={item =>
                        updateSerialPort(selectedSerialport, {
                            ...serialOptions,
                            parity: ([
                                'none',
                                'even',
                                'mark',
                                'odd',
                                'space',
                            ].indexOf(item.value) === -1
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
                />
            </div>
            <Dropdown
                label="rts/cts"
                onSelect={item =>
                    updateSerialPort(selectedSerialport, {
                        ...serialOptions,
                        rtscts:
                            ['on', 'off'].indexOf(item.value) === -1
                                ? undefined
                                : item.value === 'on',
                    })
                }
                items={onOffItems}
                selectedItem={
                    onOffItems[
                        onOffItems.findIndex(e => {
                            if (typeof serialOptions.rtscts === 'undefined') {
                                return e.value === 'auto';
                            }

                            return (
                                e.value ===
                                (serialOptions.rtscts === true ? 'on' : 'off')
                            );
                        })
                    ]
                }
            />
            <Dropdown
                label="xOn"
                onSelect={item =>
                    updateSerialPort(selectedSerialport, {
                        ...serialOptions,
                        xon:
                            ['on', 'off'].indexOf(item.value) === -1
                                ? undefined
                                : item.value === 'on',
                    })
                }
                items={onOffItems}
                selectedItem={
                    onOffItems[
                        onOffItems.findIndex(e => {
                            if (typeof serialOptions.xon === 'undefined') {
                                return e.value === 'auto';
                            }

                            return (
                                e.value ===
                                (serialOptions.xon === true ? 'on' : 'off')
                            );
                        })
                    ]
                }
            />
            <Dropdown
                label="xOff"
                onSelect={item =>
                    updateSerialPort(selectedSerialport, {
                        ...serialOptions,
                        xoff:
                            ['on', 'off'].indexOf(item.value) === -1
                                ? undefined
                                : item.value === 'on',
                    })
                }
                items={onOffItems}
                selectedItem={
                    onOffItems[
                        onOffItems.findIndex(e => {
                            if (typeof serialOptions.xoff === 'undefined') {
                                return e.value === 'auto';
                            }

                            return (
                                e.value ===
                                (serialOptions.xoff === true ? 'on' : 'off')
                            );
                        })
                    ]
                }
            />
            <Dropdown
                label="xAny"
                onSelect={item =>
                    updateSerialPort(selectedSerialport, {
                        ...serialOptions,
                        xany:
                            ['on', 'off'].indexOf(item.value) === -1
                                ? undefined
                                : item.value === 'on',
                    })
                }
                items={onOffItems}
                selectedItem={
                    onOffItems[
                        onOffItems.findIndex(e => {
                            if (typeof serialOptions.xany === 'undefined') {
                                return e.value === 'auto';
                            }

                            return (
                                e.value ===
                                (serialOptions.xany === true ? 'on' : 'off')
                            );
                        })
                    ]
                }
            />
        </Group>
    );
};

export default SerialSettings;

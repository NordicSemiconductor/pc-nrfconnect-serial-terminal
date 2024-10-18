/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    convertToNumberDropDownItems,
    NumberInputWithDropdown,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import {
    getSerialOptions,
    getSerialPort,
} from '../../../features/terminal/terminalSlice';

interface BaudRateProperties {
    updateSerialPort: (
        options: Partial<SerialPortOpenOptions<AutoDetectTypes>>
    ) => Promise<void>;
    disabled: boolean;
}
export default ({ updateSerialPort, disabled }: BaudRateProperties) => {
    const serialOptions = useSelector(getSerialOptions);
    const serialPort = useSelector(getSerialPort);

    const baudRateItems = convertToNumberDropDownItems([
        1_000_000, 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200,
        600, 300, 200, 150, 134, 110, 75, 50,
    ]);

    return (
        <NumberInputWithDropdown
            label="Baud Rate"
            items={baudRateItems}
            onChange={baud => {
                if (serialOptions.path !== '') {
                    serialPort?.update({
                        baudRate: Number(baud),
                    });
                }
                updateSerialPort({
                    baudRate: Number(baud),
                });
            }}
            value={serialOptions.baudRate}
            range={{ min: 1, max: 1_000_000, step: 1 }}
            disabled={disabled}
        />
    );
};

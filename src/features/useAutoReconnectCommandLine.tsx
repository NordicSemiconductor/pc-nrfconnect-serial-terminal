/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import {
    getAvailableSerialPorts,
    getSerialPort,
} from './terminal/terminalSlice';

export default (
    doConnectToSerialPort: (
        options: Partial<SerialPortOpenOptions<AutoDetectTypes>>
    ) => void
) => {
    const alreadyTriedToAutoSelect = useRef(false);

    const { argv } = process;
    const portNameIndex = argv.findIndex(arg => arg === '--comPort');
    const portName = portNameIndex > -1 ? argv[portNameIndex + 1] : undefined;
    const availablePorts = useSelector(getAvailableSerialPorts);

    const serialPort = useSelector(getSerialPort);

    useEffect(() => {
        if (
            portName === undefined ||
            serialPort === undefined ||
            alreadyTriedToAutoSelect.current
        ) {
            return;
        }

        alreadyTriedToAutoSelect.current = true;

        const portExists = availablePorts.indexOf(portName) !== -1;

        if (!portExists) {
            return;
        }

        doConnectToSerialPort({ path: portName });
    }, [availablePorts, doConnectToSerialPort, portName, serialPort]);
};

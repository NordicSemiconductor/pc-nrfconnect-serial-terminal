/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { selectedDevice } from 'pc-nrfconnect-shared';
import { SerialPortOpenOptions } from 'serialport';

import { getSerialPort } from './terminal/terminalSlice';

export default (
    doConnectToSerialPort: (
        options: Partial<SerialPortOpenOptions<AutoDetectTypes>>
    ) => void
) => {
    const alreadyTriedToAutoSelect = useRef(false);

    const { argv } = process;
    const portNameIndex = argv.findIndex(arg => arg === '--comPort');
    const portName = portNameIndex > -1 ? argv[portNameIndex + 1] : undefined;
    const device = useSelector(selectedDevice);

    const serialPort = useSelector(getSerialPort);

    useEffect(() => {
        if (
            portName === undefined ||
            serialPort !== undefined ||
            alreadyTriedToAutoSelect.current
        ) {
            alreadyTriedToAutoSelect.current = true;
            return;
        }

        if (device === undefined) {
            return;
        }

        const availablePorts =
            device?.serialPorts?.map(port => port.comName ?? '') ?? [];

        alreadyTriedToAutoSelect.current = true;

        const portExists = availablePorts.indexOf(portName) !== -1;

        if (!portExists) {
            return;
        }

        doConnectToSerialPort({ path: portName });
    }, [device, doConnectToSerialPort, portName, serialPort]);
};

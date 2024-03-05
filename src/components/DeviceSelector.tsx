/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import {
    DeviceSelector,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { DeviceTraits } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';

import { closeDevice, openDevice } from '../actions/deviceActions';

const deviceListing: DeviceTraits = {
    serialPorts: true,
};

export default () => {
    const dispatch = useDispatch();

    return (
        <DeviceSelector
            deviceFilter={device =>
                !!(device.serialPorts && device.serialPorts.length > 0)
            }
            deviceListing={deviceListing}
            onDeviceConnected={device => {
                logger.info(`Device Connected SN:${device.serialNumber}`);
            }}
            onDeviceDisconnected={device => {
                logger.info(`Device Disconnected SN:${device.serialNumber}`);
            }}
            onDeviceSelected={device => {
                logger.info(`Selected device with s/n ${device.serialNumber}`);
                dispatch(openDevice(device));
            }}
            onDeviceDeselected={() => {
                logger.info('Deselected device');
                dispatch(closeDevice());
            }}
        />
    );
};

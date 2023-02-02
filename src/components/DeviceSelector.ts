/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import {
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    logger,
} from 'pc-nrfconnect-shared';

import {
    closeDevice,
    deviceConnected,
    deviceDisconnected,
    openDevice,
} from '../actions/deviceActions';
import { TDispatch } from '../thunk';
/**
 * Configures which device types to show in the device selector.
 * The config format is described on
 * https://github.com/NordicSemiconductor/nrf-device-lister-js.
 */
const deviceListing: DeviceTraits = {
    serialPorts: true,
};

/**
 * Configures how devices should be set up (programmed) when selected.
 * The config format is described on
 * https://github.com/NordicSemiconductor/nrf-device-setup-js.
 *
 * Currently no setup is done. If you need one, set deviceSetup appropriately
 * and add it in mapState below.
 *
 * To refer to files provided by your app, use getAppFile exported by
 * pc-nrfconnect-shared
 */
// const deviceSetup = {
// dfu: {},
// jprog: {},
// };

const mapState = () => ({
    deviceListing,
    // deviceSetup,
});

/*
 * In these callbacks you may react on events when users (de)selected a device.
 * Leave out callbacks you do not need.
 *
 * Note that the callbacks releaseCurrentDevice and onDeviceIsReady
 * are only invoked, if a deviceSetup is defined.
 */
const mapDispatch = (dispatch: TDispatch): Partial<DeviceSelectorProps> => ({
    onDeviceSelected: (device: Device) => {
        logger.info(`Selected device with s/n ${device.serialNumber}`);
        dispatch(openDevice(device));
    },
    // releaseCurrentDevice: () => {
    //     logger.info('Will set up selected device');
    // },
    // onDeviceIsReady: device => {
    //     logger.info(`Device with s/n ${device.serialNumber} was set up with a firmware`);
    // },
    onDeviceDeselected: () => {
        logger.info('Deselected device');
        dispatch(closeDevice());
    },

    onDeviceConnected(device) {
        dispatch(deviceConnected(device));
    },

    onDeviceDisconnected(device) {
        dispatch(deviceDisconnected(device));
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);

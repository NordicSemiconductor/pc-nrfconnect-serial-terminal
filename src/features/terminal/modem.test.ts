/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import SerialPort from 'serialport';

import { createModem, Modem } from './modem';

const MockBinding = require('@serialport/binding-mock');

describe('modem', () => {
    it('accepts a command', () => {
        const [modem] = initialiseModem();
        const result = modem.write('command');

        expect(result).toBe(true);
    });

    // it('should handle OK response', done => {
    //     const [modem] = initialiseModem();

    //     const okResponse = 'OK';
    //     modem.onResponse((data, error) => {
    //         try {
    //             expect(data).toBe(okResponse);
    //             expect(error).toBe(undefined);
    //             modem.close(done);
    //         } catch (e) {
    //             done(e);
    //         }
    //     });
    //     modem.write(okResponse);
    // });

    // it('should handle errors', done => {
    //     const [modem] = initialiseModem();
    //     const errorResponse = 'ERROR';

    //     modem.onResponse((data, error) => {
    //         try {
    //             expect(data).toBe(errorResponse);
    //             expect(error).toBe(errorResponse);
    //             modem.close(done);
    //         } catch (e) {
    //             done(e);
    //         }
    //     });

    //     modem.write(errorResponse);
    // });
});

// SETUP

function initialiseModem(): [Modem, SerialPort] {
    SerialPort.Binding = MockBinding;
    const port = '/dev/PORT';
    // Create a port and enable echoing of input
    MockBinding.createPort(port, {
        echo: true,
        readyData: Buffer.from([]),
    });
    const serialPort = new SerialPort(port);
    return [createModem(serialPort.path), serialPort];
}

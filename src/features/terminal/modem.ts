/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
import { logger } from 'pc-nrfconnect-shared';
import { OpenOptions } from 'serialport';

import { SerialPort } from './serialportWrapper';

export type Modem = ReturnType<typeof createModem>;

const cleanUndefined = (obj: OpenOptions) => JSON.parse(JSON.stringify(obj));

export const createModem = (
    serialPortPath: string,
    options: OpenOptions = {}
) => {
    const eventEmitter = new EventEmitter();
    options = cleanUndefined(options);

    logger.info(
        `Opening: '${serialPortPath}' with options: ${JSON.stringify(options)}`
    );

    // const serialPort = new SerialPort(serialPortPath, options, e => {
    //     if (e) {
    //         logger.error(e);
    //     }
    // });
    const serialPort = SerialPort(serialPortPath, options);

    // serialPort.on('open', () => {
    //     eventEmitter.emit('open');
    // });

    serialPort.on('data', (data: Buffer) => {
        eventEmitter.emit('response', [data]);
    });

    return {
        onResponse: (handler: (data: Buffer[], error?: string) => void) => {
            eventEmitter.on('response', handler);
            return () => eventEmitter.removeListener('response', handler);
        },

        onOpen: (handler: (error?: string) => void) => {
            eventEmitter.on('open', handler);
            return () => eventEmitter.removeListener('open', handler);
        },

        close: async (callback?: (error?: Error | null) => void) => {
            if (await serialPort.isOpen()) {
                logger.info(`Closing: '${serialPort.path}'`);
                await serialPort.close();
            }
        },

        write: async (command: string) => {
            await serialPort.write(command, e => {
                if (e) console.error(e);
            });

            return true;
        },

        isOpen: () => serialPort.isOpen,

        getpath: () => serialPort.path,
    };
};

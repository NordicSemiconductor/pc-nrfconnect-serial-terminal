/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import EventEmitter from 'events';
import { logger, SerialPort } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

import { TDispatch } from '../../thunk';
import { SerialOptions, setSerialOptions } from './terminalSlice';

export type Modem = Awaited<ReturnType<typeof createModem>>;

const cleanUndefined = (obj: SerialOptions) => JSON.parse(JSON.stringify(obj));

export const createModem = async (
    options: SerialOptions,
    overwrite: boolean,
    dispatch: TDispatch
) => {
    const eventEmitter = new EventEmitter();
    options = cleanUndefined(options);

    logger.info(`Opening: with options: ${JSON.stringify(options)}`);

    let serialPort: Awaited<ReturnType<typeof SerialPort>>;
    try {
        serialPort = await SerialPort(
            options as SerialPortOpenOptions<AutoDetectTypes>,
            overwrite,
            data => eventEmitter.emit('response', [data]),
            () => {},
            newOptions => dispatch(setSerialOptions(newOptions)),
            newOptions => dispatch(setSerialOptions(newOptions)),
            newOptions => {
                dispatch(setSerialOptions(newOptions));
                console.log(
                    `Received new settings from serial port: ${JSON.stringify(
                        newOptions
                    )}`
                );
            }
        );
    } catch (error) {
        return undefined;
    }

    return {
        onResponse: (handler: (data: Buffer[], error?: string) => void) => {
            eventEmitter.on('response', handler);
            return () => eventEmitter.removeListener('response', handler);
        },

        onOpen: (handler: (error?: string) => void) => {
            eventEmitter.on('open', handler);
            return () => eventEmitter.removeListener('open', handler);
        },

        close: async () => {
            if (await serialPort.isOpen()) {
                logger.info(`Closing: '${serialPort.path}'`);
                return serialPort.close();
            }
        },

        write: (command: string) => {
            serialPort.write(command);
            return true;
        },

        update: (newOptions: UpdateOptions): void =>
            serialPort.update(newOptions),

        set: (newOptions: SetOptions): void => serialPort.set(newOptions),

        isOpen: (): Promise<boolean> => serialPort.isOpen(),

        getPath: (): string => serialPort.path,
    };
};

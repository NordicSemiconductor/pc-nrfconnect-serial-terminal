/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* Should work as a wrapper to the SerialPort library 

E.g. should support the same features that is needed from the SerialPort

port.on('open', () => void);
port.on('close', () => void);
port.on('data', () => void);

port.write(data);

*/

import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { ipcRenderer } from 'electron';
import { logger } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

export const SerialPort = (options: SerialPortOpenOptions<AutoDetectTypes>) => {
    const { path } = options;
    const events = ['open', 'close', 'data'] as const;

    const on = (
        event: typeof events[number],
        callback: (data?: unknown) => void
    ) => {
        // if (event === 'open') {
        //     ipcRenderer.invoke('serialport:on-open').then(callback);
        // }
        if (event === 'close') {
            ipcRenderer.invoke('serialport:on-close').then(callback);
        }
        if (event === 'data') {
            // ipcRenderer.invoke('serialport:data');
            ipcRenderer.on('serialport:data', (_event, data) => callback(data));
        }
    };

    const write = (
        data: string | number[] | Buffer,
        callback?: ((error: Error | null | undefined) => void) | undefined
    ) => ipcRenderer.invoke('serialport:write', path, data).then(callback);

    const isOpen = (): Promise<boolean> =>
        ipcRenderer.invoke('serialport:isOpen', path);

    const close = () => ipcRenderer.invoke('serialport:close', path);

    ipcRenderer
        .invoke('serialport:new', options)
        .then(() => logger.info(`Serialport ${path} opened.`));

    return { path, on, write, close, isOpen };
};

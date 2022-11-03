/* Should work as a wrapper to the SerialPort library 

E.g. should support the same features that is needed from the SerialPort

port.on('open', () => void);
port.on('close', () => void);
port.on('data', () => void);

port.write(data);

*/

import { ipcRenderer } from 'electron';
import { logger } from 'pc-nrfconnect-shared';
import { OpenOptions } from 'serialport';
//

export const SerialPort = (path: string, options: OpenOptions) => {
    const events = ['open', 'close', 'data'] as const;

    const on = (
        event: typeof events[number],
        callback: (data?: any) => void
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

    const write = async (
        data: string | number[] | Buffer,
        callback?:
            | ((error: Error | null | undefined, bytesWritten: number) => void)
            | undefined
    ): any => {
        ipcRenderer.invoke('serialport:write', path, data).then(callback);
    };

    const isOpen = async (): Promise<boolean> => {
        return await ipcRenderer.invoke('serialport:isOpen', path);
    };

    const close = async () => {
        return await ipcRenderer.invoke('serialport:close', path);
    };

    ipcRenderer
        .invoke('serialport:new', path, options)
        .then(() => logger.info(`Serialport ${path} opened.`));

    return { path, on, write, close, isOpen };
};

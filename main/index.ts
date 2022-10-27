/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

ipcMain.handle('open-popout', (event, appDir: string) => {
    const hostWindow = BrowserWindow.getAllWindows().find(
        window => window.webContents.id === event.sender.id
    );
    if (!hostWindow) return;

    const terminalWindow = openWindow(appDir, event.sender.id);
    terminalWindow.once('close', () => {
        try {
            event.sender.send('popout-closed', terminalWindow.webContents.id);
        } catch {
            // Host window is closed
        }
    });

    const closeTerminal = () => {
        if (!terminalWindow) return;
        try {
            terminalWindow.removeAllListeners();
            terminalWindow.close();
        } catch {
            // Terminal window is closed
        }
    };

    hostWindow.reload = new Proxy(hostWindow.reload, {
        apply(reload, thisArg) {
            closeTerminal();
            return reload.call(thisArg);
        },
    });

    hostWindow?.once('close', () => {
        closeTerminal();
    });

    return terminalWindow.webContents.id;
});

const openWindow = (appDir: string, parent?: number) => {
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        backgroundColor: '#263238',
        autoHideMenuBar: true,
        title: 'Terminal',
        icon: join(appDir, 'resources', 'icon.png'),
    });
    window.loadFile(join(appDir, 'terminal', 'index.html'));
    window.on('ready-to-show', () =>
        window.webContents.send('parent-id', parent)
    );

    return window;
};

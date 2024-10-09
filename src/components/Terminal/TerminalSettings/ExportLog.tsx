/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { dialog, getCurrentWindow } from '@electron/remote';
import { Button, logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { setWriteLogToFile } from '../../../features/terminal/terminalSlice';

export default () => {
    const dispatch = useDispatch();

    const saveToFile = async () => {
        const browserWindow = getCurrentWindow();

        const date = new Date(Date.now());
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}${date.getFullYear()}_${date
            .getHours()
            .toString()
            .padStart(2, '0')}${date
            .getMinutes()
            .toString()
            .padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
        const fileName = `serial-terminal-${formattedDate}.txt`;
        const { filePath, canceled } = await dialog.showSaveDialog(
            browserWindow,
            {
                title: 'Save Serial Terminal logs',
                defaultPath: fileName,
                properties: ['createDirectory', 'showOverwriteConfirmation'],
            }
        );

        if (canceled || filePath == null) {
            logger.debug(
                'Saving cancelled while selecting the log file location.'
            );
            return;
        }

        dispatch(setWriteLogToFile({ filePath }));
    };

    return (
        <Button onClick={saveToFile} variant="secondary" className="tw-w-full">
            Save to file
        </Button>
    );
};

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NrfTerminalCommander } from 'pc-xterm-lib';

const nrfTerminalCommander = new NrfTerminalCommander({
    commands: {
        my_custom_command: () => {
            console.log('Doing something...');
        },
    },
    prompt: '',
    hoverMetadata: [],
    completerFunction: () => [
        {
            value: 'my_custom_command',
            description: 'Does something interesting',
        },
    ],
    showTimestamps: false,
});

export default nrfTerminalCommander;

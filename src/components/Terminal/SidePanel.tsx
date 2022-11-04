/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { SidePanel } from 'pc-nrfconnect-shared';

import SerialSettings from './SerialSettings';
import TerminalSettings from './TerminalSettings';

const TerminalSidePanel = () => (
    <SidePanel className="side-panel">
        <SerialSettings />
        <TerminalSettings />
    </SidePanel>
);

export default TerminalSidePanel;

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { SidePanel } from 'pc-nrfconnect-shared';

import { getAvailableSerialPorts } from '../../features/terminal/terminalSlice';
import SerialSettings from './SerialSettings';
import TerminalSettings from './TerminalSettings';

const TerminalSidePanel = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);

    return (
        <SidePanel className="side-panel">
            {availablePorts?.length > 0 && (
                <>
                    <SerialSettings />
                    <TerminalSettings />
                </>
            )}
        </SidePanel>
    );
};

export default TerminalSidePanel;

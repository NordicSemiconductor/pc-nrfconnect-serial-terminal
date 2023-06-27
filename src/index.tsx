/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { App } from 'pc-nrfconnect-shared';

import appReducer from './appReducer';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import Terminal from './components/Terminal/Main';
import TerminalSidePanel from './components/Terminal/SidePanel';

import './index.scss';

export default () => (
    <App
        reportUsageData
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<TerminalSidePanel />}
        documentation={DocumentationSections}
        panes={[
            {
                name: 'Terminal',
                Main: Terminal,
            },
        ]}
        autoReselectByDefault
    />
);

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml, { ModuleVersion } from '@nordicsemiconductor/nrf-monitor-lib-js';
import nrfMonitorLibJsPackageJson from '@nordicsemiconductor/nrf-monitor-lib-js/package.json';
import { logger } from 'pc-nrfconnect-shared';

const version = (module: ModuleVersion) => {
    switch (module.version_format) {
        case 'NRFML_VERSION_FORMAT_INCREMENTAL':
            return module.incremental;
        case 'NRFML_VERSION_FORMAT_STRING':
            return module.string;
        case 'NRFML_VERSION_FORMAT_SEMANTIC':
            return `${module.semver.major}.${module.semver.minor}.${module.semver.patch}`;
    }
};

const describe = (module: ModuleVersion) =>
    `${module.module_name} ${version(module)}`;

export default async () => {
    const { modules } = await nrfml.apiVersion();

    if (modules.length > 0) {
        logger.debug('Lib module versions:');
        modules.forEach(module => logger.debug(`- ${describe(module)}`));
    }

    logger.debug(
        `- ${nrfMonitorLibJsPackageJson.name} ${nrfMonitorLibJsPackageJson.version}`
    );
};

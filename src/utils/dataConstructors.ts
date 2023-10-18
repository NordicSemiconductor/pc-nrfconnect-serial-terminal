/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { DropdownItem } from '@nordicsemiconductor/pc-nrfconnect-shared';

export const convertToDropDownItems: <T>(
    data: T[],
    addAuto?: boolean
) => DropdownItem[] = (data, addAuto = true) => {
    const mappedData = data.map(v => ({
        label: `${v}`,
        value: `${v}`,
    }));

    return addAuto
        ? [{ label: 'Default', value: 'undefined' }, ...mappedData]
        : mappedData;
};

import { DropdownItem } from 'pc-nrfconnect-shared';

export const convertToDropDownItems: <T>(
    data: T[],
    addAuto?: boolean
) => DropdownItem[] = (data, addAuto = true) => {
    const mappedData = data.map(v => ({
        label: `${v}`,
        value: `${v}`,
    }));

    return addAuto
        ? [{ label: 'AUTO', value: 'undefined' }, ...mappedData]
        : mappedData;
};

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfml from '@nordicsemiconductor/nrf-monitor-lib-js';
// eslint-disable-next-line import/no-unresolved
import { Configuration } from '@nordicsemiconductor/nrf-monitor-lib-js/config/configuration';
import { currentPane, logger } from 'pc-nrfconnect-shared';
import { testUtils } from 'pc-nrfconnect-shared/test';

import appReducer from '../appReducer';

const mockedNrfmlStart = nrfml.start as jest.MockedFunction<typeof nrfml.start>;

export const getNrfmlCallbacks = () =>
    new Promise<{
        completeCallback: nrfml.CompleteCallback;
        progressCallback: nrfml.ProgressCallback;
        dataCallback?: nrfml.DataCallback;
        jsonCallback?: nrfml.JsonCallback;
    }>(resolve => {
        mockedNrfmlStart.mockImplementationOnce(
            (
                _: Configuration,
                completeCallback: nrfml.CompleteCallback,
                progressCallback: nrfml.ProgressCallback,
                dataCallback?: nrfml.DataCallback,
                jsonCallback?: nrfml.JsonCallback
            ) => {
                resolve({
                    completeCallback,
                    progressCallback,
                    dataCallback,
                    jsonCallback,
                });
                return 1; // mocked task id
            }
        );
    });

export const expectNrfmlStartCalledWithSinks = (...sinkNames: string[]) => {
    expect(mockedNrfmlStart).toBeCalledWith(
        expect.objectContaining({
            sinks: expect.arrayContaining(
                sinkNames.map(sinkName =>
                    expect.objectContaining({
                        name: sinkName,
                    })
                )
            ),
        }),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
    );

    const args = mockedNrfmlStart.mock.calls[0][0];
    expect(args.sinks).toHaveLength(sinkNames.length); // raw + pcap + live + opp which is always added in the background
};

export const mockedDataDir = '/mocked/data/dir';

jest.mock('pc-nrfconnect-shared', () => ({
    ...jest.requireActual('pc-nrfconnect-shared'),
    getAppDir: () => '/mocked/data/dir',
    getAppDataDir: () => '/mocked/data/dir',
    getPersistentStore: jest.fn().mockImplementation(() => ({
        get: (_: unknown, defaultVal: unknown) => defaultVal,
        set: jest.fn(),
    })),
    currentPane: jest.fn().mockReturnValue(0),
}));
export const mockedCurrentPane = currentPane as jest.MockedFunction<
    typeof currentPane
>;

export const assertErrorWasLogged = () => {
    jest.spyOn(logger, 'error');
    return () => expect(logger.error).toHaveBeenCalled();
};

export const render = testUtils.render(appReducer);

export * from '@testing-library/react';

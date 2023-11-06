/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Card,
    FileLink,
    MasonryLayout,
    NumberInlineInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { openFile } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/open';

import {
    getPathToHistoryFile,
    MAXIMUM_MAX_NUMBER_OF_LINES,
    MINIMUM_MAX_NUMER_OF_LINES,
} from '../../app/store';
import {
    initializeHistoryBuffer,
    setNewMaximumNumberOfLinesInHistory,
} from '../history/effects';
import {
    getMaximumNumberOfLinesInHistory,
    getNumberOfLinesInHistory,
} from '../history/historySlice';

const HistorySettings = () => {
    const dispatch = useDispatch();

    const pathToHistoryFile = useSelector(getPathToHistoryFile);
    const numberOfLinesInHistory = useSelector(getNumberOfLinesInHistory);
    const maximumNumberOfLinesInHistory = useSelector(
        getMaximumNumberOfLinesInHistory
    );

    const [newMaximumNumberOfLines, setNewMaximumNumberOfLines] = useState(
        maximumNumberOfLinesInHistory
    );

    const historyUsagePercentage =
        (numberOfLinesInHistory / maximumNumberOfLinesInHistory) * 100;

    useEffect(() => {
        dispatch(initializeHistoryBuffer);
    }, [dispatch]);

    return (
        <div className="tw-max-w-[512px]">
            <Card title="History File">
                <div className="tw-whitespace-nowrap tw-p-1">
                    Current file usage: ({historyUsagePercentage.toFixed(0)}%)
                </div>

                <div
                    title="Set the maximum number of lines to store in the history file"
                    className="tw-flex tw-items-center tw-justify-between tw-p-1"
                >
                    Max number of lines in history file{' '}
                    <NumberInlineInput
                        className="tw-p-0"
                        value={newMaximumNumberOfLines}
                        onChange={setNewMaximumNumberOfLines}
                        onChangeComplete={size =>
                            dispatch(setNewMaximumNumberOfLinesInHistory(size))
                        }
                        range={{
                            min: MINIMUM_MAX_NUMER_OF_LINES,
                            max: MAXIMUM_MAX_NUMBER_OF_LINES,
                        }}
                    />
                </div>

                <div
                    title={pathToHistoryFile}
                    className="tw-flex tw-items-center tw-justify-between tw-gap-1 tw-overflow-hidden tw-whitespace-nowrap tw-p-1"
                >
                    File Location:
                    <FileLink
                        label={`${pathToHistoryFile}`}
                        fileLocation={pathToHistoryFile}
                    />
                </div>
            </Card>
        </div>
    );
};

export default () => (
    <MasonryLayout minWidth={256}>
        <HistorySettings />
    </MasonryLayout>
);

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
    NumberInlineInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { openFile } from '@nordicsemiconductor/pc-nrfconnect-shared/src/utils/open';

import {
    getPathToHistoryFile,
    MAXIMUM_MAX_NUMBER_OF_LINES,
    MINIMUM_MAX_NUMER_OF_LINES,
} from '../../../app/store';
import {
    initializeHistoryBuffer,
    setNewMaximumNumberOfLinesInHistory,
} from '../../../features/history/effects';
import {
    getMaximumNumberOfLinesInHistory,
    getNumberOfLinesInHistory,
} from '../../../features/history/historySlice';

export default () => {
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
        <>
            File usage ({historyUsagePercentage.toFixed(0)}%)
            <ProgressBar
                label={`${historyUsagePercentage.toFixed(0)}%`}
                now={historyUsagePercentage}
                variant={progressBarVariant(historyUsagePercentage)}
            />
            <div
                title="Set the maximum number of lines to store in the history file"
                className="tw-flex tw-justify-between"
            >
                Max lines in history file{' '}
                <NumberInlineInput
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
            <Button
                variant="secondary"
                className="tw-w-full"
                onClick={() => openFile(pathToHistoryFile)}
            >
                Open History File
            </Button>
        </>
    );
};

const progressBarVariant = (percentage: number) => {
    if (percentage < 75) return 'success';
    if (percentage >= 75 && percentage < 90) return 'warning';
    if (percentage >= 90) return 'danger';

    return null as never;
};

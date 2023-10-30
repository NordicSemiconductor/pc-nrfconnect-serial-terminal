/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    NumberInlineInput,
    NumberInputSliderWithUnit,
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
    trimHistoryFile,
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
    const [numberOfLinesToKeep, setNumberOfLinesToKeep] = useState(
        numberOfLinesInHistory
    );
    const [percentageOfFileToKeep, setPercetageOfFileToKeep] = useState(100);

    const historyUsagePercentage =
        (numberOfLinesInHistory / maximumNumberOfLinesInHistory) * 100;

    useEffect(() => {
        dispatch(initializeHistoryBuffer);
    }, [dispatch]);

    useLayoutEffect(() => {
        setNumberOfLinesToKeep(numberOfLinesInHistory);
    }, [numberOfLinesInHistory]);

    return (
        <>
            <span className="tw-font-bold">File usage</span>
            {historyUsagePercentage < 75 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="success"
                />
            )}
            {historyUsagePercentage >= 75 && historyUsagePercentage < 90 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="warning"
                />
            )}
            {historyUsagePercentage >= 90 && (
                <ProgressBar
                    label={`${historyUsagePercentage}%`}
                    now={historyUsagePercentage}
                    variant="danger"
                />
            )}

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

            {numberOfLinesInHistory > 0 ? (
                <>
                    <span className="tw-font-bold">Clean History File</span>
                    <div title="Clean the history file, select how much of the content should be kept in the file, denoted in % (percentage)">
                        <NumberInputSliderWithUnit
                            label="Keep"
                            value={percentageOfFileToKeep}
                            onChange={setPercetageOfFileToKeep}
                            range={{ min: 0, max: 100 }}
                            unit={`% (${Math.ceil(
                                numberOfLinesToKeep *
                                    (percentageOfFileToKeep / 100)
                            )} lines) of the content`}
                        />
                        <Button
                            variant="secondary"
                            className="tw-w-full"
                            onClick={() => {
                                dispatch(
                                    trimHistoryFile(
                                        Math.ceil(
                                            numberOfLinesToKeep *
                                                (percentageOfFileToKeep / 100)
                                        )
                                    )
                                );
                                setPercetageOfFileToKeep(100);
                            }}
                        >
                            Clean up History File
                        </Button>
                    </div>
                </>
            ) : null}
        </>
    );
};

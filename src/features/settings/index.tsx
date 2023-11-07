/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    FileLink,
    MasonryLayout,
    NumberInlineInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

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
import {
    getScrollback,
    setScrollback as setActiveScrollback,
} from '../terminal/terminalSlice';

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
        <Card title="History File">
            <div className="tw-flex tw-items-center tw-whitespace-nowrap tw-p-1">
                <div className="tw-pr-2">Current file usage:</div>{' '}
                {historyUsagePercentage.toFixed(0)}%
            </div>

            <div
                title="Set the maximum number of lines to store in the history file"
                className="tw-flex tw-items-center tw-p-1"
            >
                <div className="tw-pr-2">
                    Max number of lines in history file:
                </div>
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
    );
};

const TerminalScrollback = () => {
    const dispatch = useDispatch();
    const activeScrollback = useSelector(getScrollback);
    const [scrollback, setScrollback] = useState(activeScrollback);

    return (
        <Card title="XTerm Scrollback">
            <p>
                The Terminal is only able to keep a limited amount of data in
                its buffer. This amount is still adjustable using the scrollback
                option below. This will increase/decrease the maximum number of
                lines that can be kept in the buffer.
            </p>
            <div
                title="Set the number of lines it is possible to scroll in the Terminal"
                className="tw-flex tw-items-center tw-pt-1"
            >
                <div className="tw-pr-2">Scrollback:</div>
                <NumberInlineInput
                    value={scrollback}
                    onChange={setScrollback}
                    onChangeComplete={() => {
                        if (scrollback !== activeScrollback) {
                            dispatch(setActiveScrollback(scrollback));
                        }
                    }}
                    range={{ min: 1, max: 2 ** 64 - 1 }}
                />
            </div>
        </Card>
    );
};

export default () => (
    <MasonryLayout minWidth={256} className="tw-max-w-[1024px]">
        <TerminalScrollback />
        <HistorySettings />
    </MasonryLayout>
);

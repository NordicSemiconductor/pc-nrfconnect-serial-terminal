/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getSearchHighlightColor,
    getSearchQuery,
    getSearchRegex,
    setSearchHighlightColor,
    setSearchQuery,
    setSearchRegex,
} from '../../../features/terminal/terminalSlice';

export default () => {
    const dispatch = useDispatch();
    const searchQuery = useSelector(getSearchQuery);
    const searchRegex = useSelector(getSearchRegex);
    const searchHighlightColor = useSelector(getSearchHighlightColor);

    // Local state for immediate UI updates with debounced dispatch
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [localColorHex, setLocalColorHex] = useState(() => {
        // Initialize with current color converted to hex
        if (searchHighlightColor.startsWith('#')) return searchHighlightColor;
        const match = searchHighlightColor.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+)/
        );
        if (match) {
            const [, r, g, b] = match;
            return `#${parseInt(r, 10).toString(16).padStart(2, '0')}${parseInt(
                g,
                10
            )
                .toString(16)
                .padStart(2, '0')}${parseInt(b, 10)
                .toString(16)
                .padStart(2, '0')}`;
        }
        return '#87CEFA'; // Default light blue fallback
    });

    // Debounced effect to dispatch search query changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(setSearchQuery(localSearchQuery));
        }, 300); // 300ms debounce delay

        return () => clearTimeout(timeoutId);
    }, [localSearchQuery, dispatch]);

    // Function to commit color change to Redux store
    const commitColorChange = () => {
        const r = parseInt(localColorHex.slice(1, 3), 16);
        const g = parseInt(localColorHex.slice(3, 5), 16);
        const b = parseInt(localColorHex.slice(5, 7), 16);
        const rgba = `rgba(${r}, ${g}, ${b}, 0.35)`;
        dispatch(setSearchHighlightColor(rgba));
    };

    return (
        <div className="search-settings">
            <div className="form-group">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="search-input">Search</label>
                <input
                    id="search-input"
                    type="text"
                    className="form-control"
                    placeholder="Enter search term or regex..."
                    value={localSearchQuery}
                    onChange={e => {
                        const newValue = e.target.value;
                        setLocalSearchQuery(newValue);
                    }}
                />
            </div>

            <Toggle
                isToggled={searchRegex}
                onToggle={value => dispatch(setSearchRegex(value))}
                label="Use Regular Expression"
            />

            <div className="form-group">
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="highlight-color-picker">Highlight Color</label>
                <input
                    id="highlight-color-picker"
                    type="color"
                    className="form-control tw-h-10 tw-w-20"
                    value={localColorHex}
                    onChange={e => setLocalColorHex(e.target.value)}
                    onBlur={commitColorChange}
                    onMouseUp={commitColorChange}
                    title="Choose highlight color"
                />
            </div>

            {(searchQuery || localSearchQuery) && (
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                        setLocalSearchQuery('');
                        dispatch(setSearchQuery(''));
                    }}
                >
                    Clear Search
                </button>
            )}
        </div>
    );
};

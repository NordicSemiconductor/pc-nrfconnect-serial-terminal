/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import ansiEscapes from 'ansi-escapes';
import { XTerm } from 'xterm-for-react';

import { getEchoOnShell } from '../../features/terminal/terminalSlice';
import useFitAddon from '../../hooks/useFitAddon';

import 'xterm/css/xterm.css';
import './terminal.scss';
import styles from './Terminal.module.scss';

interface Props {
    commandCallback: (command: string) => string | undefined;
    onModemData: (listener: (data: Buffer) => void) => () => void;
    onModemOpen: (listener: () => void) => () => void;
    clearOnSend: boolean;
    lineMode: boolean;
}

const Terminal: React.FC<Props> = ({
    commandCallback,
    onModemData,
    onModemOpen,
    clearOnSend,
    lineMode,
}) => {
    const [cmdLine, setCmdLine] = useState('');
    const xtermRef = useRef<XTerm | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width, lineMode);
    const echoOnShell = useSelector(getEchoOnShell);

    // In Line mode we need to explicitly write the date send to the terminal
    // In addition we need to also write the data we got from the serial back
    // to the terminal
    const handleUserInputLineMode = useCallback(
        (data: string) => {
            xtermRef.current?.terminal.write(`(${data})> `);

            if (clearOnSend) setCmdLine('');

            const ret = commandCallback(data.trim());
            if (ret) {
                xtermRef.current?.terminal.write(ret);
            }

            xtermRef.current?.terminal.write('\r\n');
        },
        [commandCallback, clearOnSend]
    );

    // In Shell mode we need to only write to the serial port
    // Shell mode will garantee that data is echoed back and hence
    // all we need to do is write the data back to the terminal and let
    // the shell mode devide do all the auto complete etc...
    const handleUserInputShellMode = useCallback(
        (data: string) => {
            if (!echoOnShell) {
                if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126)
                    xtermRef.current?.terminal.write(data);
            }

            const ret = commandCallback(data);
            if (ret) {
                xtermRef.current?.terminal.write(ret);
            }
        },
        [commandCallback, echoOnShell]
    );

    const clearTermial = () => {
        xtermRef.current?.terminal.write(
            ansiEscapes.eraseLine + ansiEscapes.cursorTo(0)
        );
        xtermRef.current?.terminal.clear();
    };

    // Prepare Terminal for new connection or mode
    useEffect(() => {
        if (!lineMode) {
            commandCallback(String.fromCharCode(12)); // init shell mode
            // we need New Page (Ascii 12) so not to create an empty line on top of shell
        }
    }, [commandCallback, lineMode, onModemOpen]);

    useEffect(
        () => onModemData(data => xtermRef.current?.terminal.write(data)),
        [onModemData]
    );

    useEffect(
        () =>
            onModemOpen(() => {
                clearTermial(); // New connection or mode: clear terminal
                if (!lineMode) {
                    commandCallback(String.fromCharCode(12)); // init shell mode
                    // we need New Page (Ascii 12) so not to create an empty line on top of shell
                }
            }),
        [commandCallback, lineMode, onModemOpen]
    );

    const terminalOptions = {
        convertEol: false,
        theme: {
            foreground: styles.terminalForeground,
            background: styles.terminalBackground,
        },
        disableStdin: lineMode, // Line mode user needs to use the input field not the terminal
    };

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            {lineMode && (
                <form onSubmit={() => handleUserInputLineMode(cmdLine)}>
                    <Form.Group className="commandPrompt">
                        <InputGroup>
                            <Form.Control
                                value={cmdLine}
                                type="text"
                                placeholder="Type and press enter to send"
                                onChange={({ target }) => {
                                    setCmdLine(target.value);
                                }}
                            />
                            <InputGroup.Append>
                                <Button
                                    className="core-btn"
                                    type="submit"
                                    disabled={cmdLine.length === 0}
                                >
                                    Send
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </form>
            )}
            <div
                style={
                    lineMode
                        ? { height: 'calc(100% - 38px)' }
                        : { height: '100%' }
                }
            >
                <XTerm
                    onKey={v => {
                        if (!lineMode) handleUserInputShellMode(v.key);
                    }}
                    ref={xtermRef}
                    addons={[fitAddon]}
                    className="terminal-window"
                    options={terminalOptions}
                />
                {lineMode && (
                    <Button
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                        }}
                        className="clear-console"
                        onClick={() => clearTermial()}
                    >
                        clear console
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Terminal;

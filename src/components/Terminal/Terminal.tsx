/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useResizeDetector } from 'react-resize-detector';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import ansiEscapes from 'ansi-escapes';
import { clipboard } from 'electron';
import { writeFile } from 'fs/promises';
import { XTerm } from 'xterm-for-react';

import {
    resetHistoryScroll,
    scrollBack,
    scrollForward,
    writeHistoryLine,
} from '../../features/history/effects';
import {
    clearWriteLogToFile,
    getEchoOnShell,
    getScrollback,
    getSerialPort,
    getWriteLogToFile,
} from '../../features/terminal/terminalSlice';
import useFitAddon from '../../hooks/useFitAddon';

import 'xterm/css/xterm.css';
import './terminal.scss';
import styles from './Terminal.module.scss';

interface Props {
    commandCallback: (command: string) => string | undefined;
    onData: (listener: (data: Uint8Array) => void) => () => void;
    onDataWritten: (listener: (data: Uint8Array) => void) => () => void;
    clearOnSend: boolean;
    lineMode: boolean;
    active: boolean;
}

const clearTerminal = (xTerm?: XTerm | null) => {
    xTerm?.terminal.write(ansiEscapes.eraseLine + ansiEscapes.cursorTo(0));
    xTerm?.terminal.clear();
};

export default ({
    commandCallback,
    onData,
    onDataWritten,
    clearOnSend,
    lineMode,
    active,
}: Props) => {
    const [cmdLine, setCmdLine] = useState('');
    const [historyLine, setHistoryLine] = useState<string | undefined>(
        undefined
    );
    const xtermRef = useRef<XTerm | null>(null);
    const lineModeInputRef = useRef<HTMLInputElement | null>(null);
    const { width, height, ref: resizeRef } = useResizeDetector();
    const fitAddon = useFitAddon(height, width, lineMode);
    const echoOnShell = useSelector(getEchoOnShell);
    const serialPort = useSelector(getSerialPort);
    const scrollback = useSelector(getScrollback);
    const writeLogToFile = useSelector(getWriteLogToFile);
    const dispatch = useDispatch();

    const writeLineModeToXterm = (data: string) => {
        if (data.length === 1 && data.charCodeAt(0) === 12) return;

        xtermRef.current?.terminal.writeln(
            `\x1b[32;1m> ${data.trim()}\x1b[32;0m`
        );
    };

    const writeShellModeEchoOffToXterm = (character: string) => {
        if (character.charCodeAt(0) >= 32 && character.charCodeAt(0) <= 126)
            xtermRef.current?.terminal.write(character);
    };

    // In Line mode we need to explicitly write the date send to the terminal
    // In addition we need to also write the data we got from the serial back
    // to the terminal
    const handleUserInputLineMode = useCallback(
        (data: string) => {
            if (clearOnSend) setCmdLine('');

            const trimmedData = data.trim();
            dispatch(writeHistoryLine(trimmedData));

            const ret = commandCallback(trimmedData);
            if (ret) {
                xtermRef.current?.terminal.write(ret);
            }
        },
        [clearOnSend, dispatch, commandCallback]
    );

    const getIndexOfLastLine = () => {
        // If the active buffer is larger than the number of rows in the viewport,
        // it means that the user has the options to scroll, and it means that
        // the last line must be at buffer.length - 1.
        // Otherwise, just grab the cursorY, since it must be the last line, since
        // the user cannot have scrolled.
        const numberOfRowsInViewport = xtermRef.current?.terminal.rows;
        const activeBuffer = xtermRef.current?.terminal.buffer.active;

        if (numberOfRowsInViewport == null || activeBuffer == null) {
            return;
        }

        let lastLineIndex = 0;

        if (activeBuffer.length > numberOfRowsInViewport) {
            lastLineIndex = activeBuffer.length - 1;
        } else {
            lastLineIndex = activeBuffer.cursorY;
        }

        return lastLineIndex;
    };

    // In Shell mode we need to only write to the serial port
    // Shell mode will guarantee that data is echoed back and hence
    // all we need to do is write the data back to the terminal and let
    // the shell mode device do all the auto complete etc...
    const handleUserInputShellMode = useCallback(
        (character: string) => {
            if (character === '\n' || character === '\r') {
                const lastLineIndex = getIndexOfLastLine();

                if (lastLineIndex == null) {
                    return;
                }

                const activeBuffer = xtermRef.current?.terminal.buffer.active;

                if (activeBuffer == null) {
                    return;
                }

                const lastLine = activeBuffer
                    .getLine(lastLineIndex)
                    ?.translateToString();
                if (lastLine) {
                    dispatch(
                        writeHistoryLine(
                            lastLine.replace(/^[a-zA-Z]+:~\$/, '').trim()
                        )
                    );
                }
            }

            const ret = commandCallback(character);
            if (ret) {
                xtermRef.current?.terminal.write(ret);
            }
        },
        [commandCallback, dispatch]
    );

    // Prepare Terminal for new connection or mode
    useEffect(() => {
        serialPort?.isOpen().then(open => {
            if (open) {
                clearTerminal(xtermRef.current);
            }
        }); // init shell mode

        // we need New Page (Ascii 12) so not to create an empty line on top of shell
    }, [serialPort]);

    // Prepare Terminal for new connection or mode
    useEffect(() => {
        serialPort?.isOpen().then(open => {
            if (open) {
                clearTerminal(xtermRef.current);
                if (!lineMode) {
                    commandCallback(`${String.fromCharCode(12)}`);
                }
            }
        }); // init shell mode

        // we need New Page (Ascii 12) so not to create an empty line on top of shell
    }, [commandCallback, lineMode, serialPort]);

    useEffect(() => {
        if (active) {
            if (lineMode) {
                lineModeInputRef.current?.focus();
            } else {
                xtermRef.current?.terminal.focus();
            }
        }
    }, [active, lineMode]);

    useEffect(() => {
        const action = () => {
            if (lineMode) {
                lineModeInputRef.current?.focus();
            } else {
                xtermRef.current?.terminal.focus();
            }
        };
        window.addEventListener('focus', action);
        // Specify how to clean up after this effect:
        return () => {
            window.removeEventListener('focus', action);
        };
    }, [lineMode]);

    useEffect(
        () =>
            onData(data => {
                if (data.length > 0) {
                    xtermRef.current?.terminal.write(data);
                }
            }),
        [onData]
    );

    useEffect(
        () =>
            onDataWritten(data => {
                if (data.byteLength === 0) return;

                if (!lineMode && !echoOnShell) {
                    writeShellModeEchoOffToXterm(data.toString());
                } else if (lineMode) {
                    writeLineModeToXterm(data.toString());
                }
            }),
        [lineMode, onDataWritten, echoOnShell]
    );

    useEffect(() => {
        if (writeLogToFile != null && xtermRef.current != null) {
            const indexOfLastEntry = getIndexOfLastLine();
            if (indexOfLastEntry == null) {
                return;
            }

            const myOwnBuffer: string[] = [];
            for (
                let bufferIndex = 0;
                bufferIndex <= indexOfLastEntry;
                bufferIndex += 1
            ) {
                const line = xtermRef.current.terminal.buffer.active
                    .getLine(bufferIndex)
                    ?.translateToString()
                    .trim();

                if (line != null && line !== '') {
                    myOwnBuffer.push(`${line}\n`);
                }
            }

            const writeContent = async (filePath: string, data: string[]) => {
                try {
                    await writeFile(filePath, data);
                    dispatch(clearWriteLogToFile());
                } catch (error) {
                    logger.error(
                        'Could not write the serial terminal session to file: ',
                        error
                    );
                }
            };

            writeContent(writeLogToFile.filePath, myOwnBuffer);
        }
    }, [writeLogToFile, dispatch]);

    const terminalOptions = {
        convertEol: false,
        theme: {
            foreground: styles.terminalForeground,
            background: styles.terminalBackground,
        },
        disableStdin: lineMode, // Line mode user needs to use the input field not the terminal
        scrollback,
    };

    if (
        xtermRef.current &&
        xtermRef.current?.terminal.options.scrollback !== scrollback
    ) {
        xtermRef.current.terminal.options.scrollback = scrollback;
    }

    useEffect(() => {
        if (xtermRef.current != null) {
            xtermRef.current?.terminal.attachCustomKeyEventHandler(event => {
                const selection = xtermRef.current?.terminal.getSelection();
                const hasSelection =
                    selection !== undefined && selection.length > 0;
                const { platform } = process;
                const isMac = platform === 'darwin';
                if (
                    ((!isMac && event.ctrlKey) || (isMac && event.metaKey)) &&
                    !event.repeat &&
                    event.type === 'keydown'
                ) {
                    switch (event.code) {
                        case 'KeyC':
                            if (hasSelection) {
                                clipboard.writeText(
                                    selection.trim(),
                                    'clipboard'
                                );
                                xtermRef.current?.terminal.clearSelection();
                                event.preventDefault();
                            }
                            return !hasSelection;
                        case 'KeyV':
                            if (!lineMode) {
                                handleUserInputShellMode(
                                    clipboard.readText('clipboard')
                                );
                                event.preventDefault();
                            }
                            return false;
                        case 'KeyA':
                            xtermRef.current?.terminal.selectAll();
                            event.preventDefault();
                            return false;
                    }
                }
                return true;
            });
        }
    }, [xtermRef, lineMode, handleUserInputShellMode, cmdLine]);

    return (
        <div ref={resizeRef} style={{ height: '100%' }}>
            {lineMode && (
                <div className="commandPrompt">
                    <div className="input-group">
                        <input
                            ref={lineModeInputRef}
                            value={historyLine != null ? historyLine : cmdLine}
                            type="text"
                            placeholder="Type and press Enter to send"
                            onChange={({ target }) => {
                                resetHistoryScroll();
                                setHistoryLine(undefined);
                                setCmdLine(target.value);
                            }}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    if (historyLine) {
                                        handleUserInputLineMode(historyLine);
                                        if (!clearOnSend) {
                                            setCmdLine(historyLine);
                                        }
                                        setHistoryLine(undefined);
                                        resetHistoryScroll();
                                    } else {
                                        handleUserInputLineMode(cmdLine);
                                    }
                                }
                                if (event.key === 'ArrowUp') {
                                    // This is needed to prevent the cursor to go to start
                                    event.preventDefault();

                                    const history = scrollBack(cmdLine);
                                    if (history != null) {
                                        setHistoryLine(history);
                                    }
                                }
                                if (event.key === 'ArrowDown') {
                                    const history = scrollForward(cmdLine);
                                    setHistoryLine(history);
                                }

                                if (event.ctrlKey && event.key === 'u') {
                                    resetHistoryScroll();
                                    setCmdLine('');
                                    setHistoryLine(undefined);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleUserInputLineMode(cmdLine)}
                    >
                        Send
                    </button>
                </div>
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
                    <button
                        type="button"
                        className="clear-console"
                        onClick={() => clearTerminal(xtermRef.current)}
                    >
                        clear console
                    </button>
                )}
            </div>
        </div>
    );
};

## 1.2.0 - UNRELEASED

### Added

-   Custom baud rate support.
-   Option to edit the number of lines that can be scrolled back. The default
    `scrollback` is set to 1000 lines.
-   Save to file, which will save all data in the Terminal Buffer to a file. This
    is limited to the number of lines that can be viewed in the terminal, hence
    the amount that can be saved to file is directly affected by the `scrollback`
    value.
-   Command history for line mode, where up and down keys can be used to navigate the
    history in the command input field.
-   Support for devices with serial ports that does not have any serial number.

### Changed

-   From **nrf-device-lib-js** to **nrfutil device**, as a backend for
    interacting with devices.

## 1.1.1 - 2023-09-05

### Fixed

-   Opening the serial terminal app from another app could previously fail to
    connect and would require a manual reconnect

## 1.1.0 - 2023-07-27

### Added

-   Reconnecting status in the device selector.
-   Improved user experience by automatically focusing on the xTerm or line
    input field when returning to the application, allowing users to begin
    typing immediately.
-   Included a link to Infocenter documentation for the app.

### Fixed

-   Clear console click area.
-   Terminal content was lost when switching tabs.
-   Switching between Line mode and Shell mode resulted in typed text to be
    invisible in some cases.
-   `Restart application with verbose logging` button did not restart app.
-   Linux: `Ctrl+C` now copies text from xterm as expected.

## 1.0.1 - 2023-02-24

### Fixed

-   Pasting in shell will only paste once.

## 1.0.0 - 2023-02-13

-   Initial public release.

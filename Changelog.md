## 1.2.0 - 2023-12-07

### Added

-   Custom baud rate support.
-   Option to edit the number of lines that can be scrolled back. The default
    `scrollback` is set to 1000 lines.
-   Support device with serial ports but no serial number.
-   Command history for line mode. Up and down keys ca be used to navigate the
    history in the command input field

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

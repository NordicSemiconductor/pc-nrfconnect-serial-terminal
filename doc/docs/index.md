# {{app_name}}

The {{app_name}} is a cross-platform terminal emulator for serial port communications with Nordic Semiconductor devices over Universal Asynchronous Receiver/Transmitter (UART).
It can be used as an alternative to tools such as PuTTY and minicom.

{{app_name}} is installed and updated using [nRF Connect for Desktop](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/index.html).

## {{app_name}} features

- Configure, monitor, and communicate with virtual serial ports on Nordic Semiconductor devices.
- Check logging output and enter console inputs when programming or debugging applications.
- Use one of two available terminal modes: the shell mode for sending commands to a device running a shell, such as Zephyr™ shell, or the line mode.
- Quickly locate warnings and errors thanks to the ANSI escape code support.
- Resume interrupted work thanks to device auto-detection, auto-reconnection, and persistence of both the device settings and the terminal input and output.
- Use other nRF Connect for Desktop applications that require access to the serial port, for example [nRF Connect Cellular Monitor](https://docs.nordicsemi.com/bundle/nrf-connect-cellularmonitor/page/index.html), while you are working with the {{app_name}} by leveraging shared access to the connected device's serial port.

## Supported devices

The {{app_name}} supports Nordic Semiconductor Development Kits (DKs) and prototyping platforms. It is also compatible with all devices that have a USB-to-UART converter onboard that allows serial communication to a computer.

## Application source code

The code of the application is open source and [available on GitHub](https://github.com/NordicSemiconductor/pc-nrfconnect-serial-terminal).
Feel free to fork the repository and clone it for secondary development or feature contributions.
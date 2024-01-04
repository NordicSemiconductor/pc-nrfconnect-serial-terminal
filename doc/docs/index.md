# nRF Connect Serial Terminal

nRF Connect Serial Terminal is a cross-platform terminal emulator for serial port communications with Nordic Semiconductor devices over Universal Asynchronous Receiver/Transmitter (UART).

Serial Terminal allows you to configure, monitor, and communicate with virtual serial ports on Nordic Semiconductor devices. It is useful when programming or debugging applications as you can view logging output and enter console inputs. Terminal window supports shell mode for sending commands to a device running a shell, such as Zephyr™ shell, as well as line mode. It supports ANSI escape code, which makes it easy to find warnings and errors.

Serial Terminal is an alternative to tools such as PuTTY and minicom. It is designed for Nordic Semiconductor devices to support device auto-detection, auto-reconnect, and persistence of device settings. The terminal input and output persist after device disconnection. Serial Terminal is designed to share access to a connected device's serial port with other compatible nRF Connect for Desktop apps.

!!! note "Note"
      All Nordic development kits and prototyping platforms have a USB-to-UART converter onboard to allow serial communication to a computer.

Serial Terminal is installed and updated using [nRF Connect for Desktop](https://docs.nordicsemi.com/bundle/nrf-connect-desktop/page/index.html).
# Troubleshooting

Here are some basic troubleshooting steps to help you fix issues you might encounter when using Serial Terminal.

## No response from the device or the response is unexpected

- Test other commonly used baud rates. (The most commonly used baud rates are 115 200, 38 400, 19 200, and 9 600.)
- Ensure the serial settings in the Serial Terminal application match those in the onboard application.
- Try connecting to a different serial port, if available.
- Check if the correct [terminal mode](./configuration.md#terminal-mode) is selected.
- For device with shell, check that echo is configured correctly.

## Serial Terminal does not display all serial ports listed in the device's hardware user guide

- Reset the device.
- Reset Serial Terminal using CTRL+R on Windows and Linux or CMD+R on macOS.
- Check that the onboard application has enabled serial communications and UART logging for at least one UART on the board. See [Configuring serial port and logging](./configuring_serial_port.md) and [Selecting a serial port](./selecting_serial_port.md).
- Check that you have enabled all instances of UART peripheral you require. See [DevAcademy device driver model](https://academy.nordicsemi.com/topic/device-driver-model/) for more information.
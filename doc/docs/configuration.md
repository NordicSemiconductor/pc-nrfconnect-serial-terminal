# Serial Terminal configuration

Serial Terminal settings are explained here. Use the default settings unless the onboard application firmware uses other settings. See [DevAcademy Serial communication (UART)](https://academy.nordicsemi.com/topic/uart-driver/) for more information.

## Serial settings
| Setting         | Description                                                                                                              | Available Options      |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|-------------------------|
| **Baud rate**   | The speed at which data is transmitted between devices. Higher baud rates allow for faster data transfer but might be more prone to errors due to signal distortion. For information on supported baud rates, check the device's hardware user guide. The most commonly used baud rates are 115 200, 38 400, 19 200, and 9 600. | `50` to `1 000 000`           |
| **Data bits**   | The number of bits that carry data.                                                                                      | `8` (default), `7`          |
| **Stop bits**   | The number of stop bits.                                                                                                | `1` (default), `2`          |
| **Parity**      | An error-checking mechanism to detect errors in the data transmission. For example, even parity means that the number of 1s in the data byte and parity bit combined is even, while odd parity means that the number of 1s is odd. | `none` (default), `even`, `odd`, `mark` (Windows only), `space` (Windows only) |
| **rts/cts**     | Request to Send (RTS) and Clear to Send (CTS) use two cross-coupled wires between the devices. If hardware flow control is enabled, each end will use its RTS to indicate that it is ready to send new data and read its CTS to see if it is allowed to send data to the other end. | `off` (default), `on`       |
| **xOn**         | When using software flow control, **xOn** (transmission on) signals that the device is ready to accept data.                | `off` (default), `on`       |
| **xOff**        | When using software flow control, **xOff** (transmission off) signals that the device is unable to accept more data.         | `off` (default), `on`       |
| **xAny**        | Software flow control setting.                                                                                          | `off` (default), `on`       |

## Terminal mode

Serial Terminal can work in either line or shell mode.

### Line mode

Line mode sends each command to the connected device separately. The device processes each command and returns a response before waiting for the next command. This mode is commonly used for devices that are not running a shell, where each command is a discrete operation that the device can perform independently. For example, you can use it to enter modem AT commands.

| Terminal mode  | Setting            | Description                                                                      |
| -------------- | ------------------ | -------------------------------------------------------------------------------- |
| Line           | **Clear on Send**      | When **Clear on Send** is enabled, input text is cleared from the terminal input window after it has been transmitted. |
| Line           | **Line Ending**        | Use this to send an optional line ending to the command sent to the connected device. The alternatives are:</br> - `None`</br>- `LF` sends the newline character.</br> - ``CR`` for carriage return.</br> - ``CRLF`` sends carriage return and newline.     |

### Shell mode
Use Shell mode when the device you communicate with is running a shell, such as Zephyr™ shell. In this mode, the terminal sends the command or command series to the device for execution by the shell. The shell can return output or prompt the user for additional input. Shell mode allows you to execute more complex operations, navigate the file system, or perform other advanced tasks that are not possible in Line mode.

| Terminal mode | Setting            | Description                                                                      |
| ------------- | ------------------ | -------------------------------------------------------------------------------- |
| Shell         | **Device controls echo** | Toggle this on if echo is enabled on the device. Toggle off if it is not, in which case Serial Terminal echoes the command. In Zephyr shell, run `shell echo on` to turn echo on, and `shell echo off` to disable echo. |

## Write to file

Use the **Save to file** button to save the history of the terminal console to a file.

Until saved, the console output is saved in the buffer and a temporary history file that you can configure in the **Terminal Settings** tab.

## Terminal settings tab

In this tab, you can configure scrollback buffer for the console and the size of the temporary history file, in which the console output is kept until you **Save to file**.

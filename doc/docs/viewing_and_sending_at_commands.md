# Viewing and sending AT commands

When you are connected to a device programmed with firmware compatible with AT commands, for example [AT Client sample](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/at_client/README.html) from the {{NCS}}, you can switch to the [Terminal tab](overview.md#terminal-tab) to observe the AT communication with the modem and to send AT commands.

The terminal displays the AT communication with the modem.

![Serial Terminal AT commands view](./screenshots/serial_term_at_commands.png "Serial Terminal AT commands view")

To interact with the modem by sending AT commands, enter text in the command line located directly above the terminal and send it to the modem by pressing Enter or clicking **Send**. In the [Line mode](overview.md#line-mode), the selected line ending is automatically appended to the command.

Each command is sent separately to the device, and the device processes each command and returns a response before waiting for the next command. This is the standard behavior for AT command communication.

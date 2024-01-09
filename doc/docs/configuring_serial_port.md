# Configuring logging to the serial port

Serial Terminal supports Nordic Semiconductor Development Kits (DKs) and prototyping platforms. Your application must enable serial communications and logging over Universal Asynchronous Receiver/Transmitter (UART).

The following sections describe some alternatives for enabling logging to the serial port in the [nRF Connect SDK](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/index.html).

## Configure serial communications and logging over UART in your nRF Connect SDK application

See [DevAcademy Serial communication (UART)](https://academy.nordicsemi.com/topic/uart-driver/) for instructions on enabling serial communications over UART and use the following Kconfig option to enable logging over UART.

```
CONFIG_LOG_BACKEND_UART=y
```

See also [Logging in nRF Connect SDK](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/test_and_optimize/logging.html).

## Use a sample with logging over UART enabled

Alternatively, you can install a sample with logging enabled. See **Working with...** for the device in [Device configuration guides](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/device_guides.html) for more information. See also [Testing and debugging an application](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/test_and_optimize/testing.html).

## Use a shell sample

Nordic Semiconductor provides samples to enable shell functionality, such as [Cellular: Modem Shell](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/cellular/modem_shell/README.html), [Wi-Fi: Shell](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/wifi/shell/README.html), and [Zigbee® Shell](https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/samples/zigbee/shell/README.html).
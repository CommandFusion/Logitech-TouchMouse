# Logitech TouchMouse App iViewer Port

This is a port of the [Logitech TouchMouse](http://itunes.apple.com/it/app/touch-mouse/id338237450) app to send mouse events to a PC running the Logitech TouchMouse server.

This module uses Javascript to interpret Pan gestures and send the mouse events. It features a 3-button mouse and keyboard emulation.

## Supported Events

1. Mouse movement, left-middle-right click, double-click, click-and-drag
1. Keyboard emulation: letters, numbers, symbols, modifier keys (CTRL, ALT), Windows Key

## ToDo

1. Discovery with Bonjour
1. Scroll function (Pan gesture currently doesn't support multitouch)
1. Letters with accent
1. Improve acceleration

## Instructions

1. Download the [Logitech TouchMouse Server](http://www.logitech.com/en-us/494/6367)
1. In System Manager, change both the TCP and UDP systems IP address to your PC address as shown in the server information box

## Links

[Mycroes Touchmoused](https://github.com/mycroes/touchmoused) - Linux version of the Logitech TouchMouse server
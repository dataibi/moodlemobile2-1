#!/bin/bash

/home/david/Android/Sdk/emulator/emulator -avd 4.7_WXGA_API_25 -writable-system
./adb root
./adb remount
./adb push /home/david/Dokumente/hosts /etc/hosts

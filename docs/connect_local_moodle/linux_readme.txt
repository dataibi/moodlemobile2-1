you need a virtual name based Host with local moodle instance

To connect the moodle from the virtual device, you have to edit the hosts file in the virtual device every time after you started it.

After changing the hostname in the hostfile you can use theese comands:

/home/david/Android/Sdk/emulator/emulator -avd 4.7_WXGA_API_25 -writable-system

#then in the platform-tools folder:

./adb root
./adb remount
./adb push /home/david/Dokumente/hosts /etc/hosts

You must start the device every time with the command above. Otherwise the host file is not the same. Start with android studio don`t work.

 

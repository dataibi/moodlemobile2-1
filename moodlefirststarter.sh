#!/bin/bash

export JAVA_HOME="/usr/local/bin/develop/jdk1.8.0_172"
export PATH="/usr/local/bin/develop/jdk1.8.0_172:/home/david/bin/android-studio/gradle/gradle-4.1/bin:/usr/local/bin/develop/jdk1.8.0_172:/home/david/bin/android-studio/gradle/gradle-4.1/bin:/home/david/.nvm/versions/node/v9.8.0/bin:/usr/local/bin/develop/jdk1.8.0_172:/home/david/bin/android-studio/gradle/gradle-4.1/bin:/home/david/bin:/usr/local/bin/develop/apache-maven-3.3.9/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/david/www/impact-eu.local/htdocs/ka1/bin:/snap/bin:/home/david/Android/Sdk/tools:/home/david/Android/Sdk/platform-tools"
ionic cordova platform rm android
ionic cordova platform add android@6.3.0
ionic cordova prepare android
cordova plugin add cordova-android-support-gradle-release --variable ANDROID_SUPPORT_VERSION=27.+
ionic cordova emulate android -lc

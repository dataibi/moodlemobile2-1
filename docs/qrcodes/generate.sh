#!/bin/bash
while read line
do
  #Set the desired columns as a variable to use later
  #for more info see the manpage for cut
  
  var1=$(cut -f1 <<< "$line")
  # var2=$(cut -f2 <<< "$line")
  # url=$(cut -f3 <<< "$line")
  name=$(tr -cd "[:alnum:]" <<< "$var1")
  #display some visual output (not necessary)
  echo UID: $var1
  
  # generate the QR-code
  # for more info see manpage for qrencode
  # I set the error correction level to high so I can place a custom logo in the center later (-l H)
  qrencode -s 5 -l H -o "$name".png "$var1"
	
  #place a fancy logo in the center of the qr code
  #composite -gravity Center ../logo.png "$var1".png final/"$var1".png
	
  #remove the qr-code without the logo
  #rm "$var1".png

#which file to use
done < 100_199_en.csv

<?php
        //Enter your code here, enjoy!
$count = 5;
              
for( $i = 1; $i <= $count; $i++ ){
    if ($i !== $count) {
        echo '{"exhibit": {"room":1,"exponat":'. $i .'}, "qrType": "section"};';
    } else {
        echo '{"exhibit": {"room":1,"exponat":'. $i .'}, "qrType": "section"}';
    }
    
}
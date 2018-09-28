<?php
// http://moodle.mathetics.local/theme/badges/qr_loop.php?mode=user&userPrefix=visitor&passwordPrefix=aldenBiesen&visitorStart=1000&visitorEnd=1002
// http://moodle.mathetics.local/theme/badges/qr_loop.php?mode=topic&mapNumber=1&roomNumber=1&exhibitStart=1&exhibitEnd=10
// http://moodle.mathetics.local/theme/badges/qr_loop.php?mode=topic&roomNumber=1&exhibitStart=1&exhibitEnd=10
function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if (isset($_REQUEST['mode'])) {
$mode = test_input($_REQUEST['mode']);
}

if (isset($_REQUEST['userPrefix'])) {
$userPrefix = $_REQUEST['userPrefix'];
}

if (isset($_REQUEST['passwordPrefix'])) {
$passwordPrefix = $_REQUEST['passwordPrefix'];
}

if (isset($_REQUEST['visitorStart'])) {
$visitorStart = $_REQUEST['visitorStart'];
}

if (isset($_REQUEST['visitorEnd'])) {
$visitorEnd = $_REQUEST['visitorEnd'];
}

if (isset($_REQUEST['mapNumber'])) {
$mapNumber = $_REQUEST['mapNumber'];
}

if (isset($_REQUEST['roomNumber'])) {
$roomNumber = $_REQUEST['roomNumber'];
}

if (isset($_REQUEST['exhibitStart'])) {
$exhibitStart = $_REQUEST['exhibitStart'];
}

if (isset($_REQUEST['exhibitEnd'])) {
$exhibitEnd = $_REQUEST['exhibitEnd'];
}

if ($mode === 'user') {
    for( $i = $visitorStart; $i <= $visitorEnd; $i++ ){
        if ($i != $visitorEnd) {
            echo '{"username": "'. $userPrefix.$i. '", "password": "'. $passwordPrefix.$i. '!", "qrType": "login"};';
        } else {
            echo '{"username": "'. $userPrefix.$i. '", "password": "'. $passwordPrefix.$i. '!", "qrType": "login"}';
        }
        
    }
}

if ($mode === 'topic') {
    if (isset($mapNumber)) {
        for( $i = $exhibitStart; $i <= $exhibitEnd; $i++ ){
            if ($i != $exhibitEnd) {
                echo '{"exhibit": {"map":'.$mapNumber .',"room":'.$roomNumber .',"exponat":'.$i .'}, "qrType": "section"};';
            } else {
                echo '{"exhibit": {"map":'.$mapNumber .',"room":'.$roomNumber .',"exponat":'.$i .'}, "qrType": "section"}';
            }
            
        }
    } else {
        for( $i = $exhibitStart; $i <= $exhibitEnd; $i++ ){
            if ($i != $exhibitEnd) {
                echo '{"exhibit": {"room":'.$roomNumber .',"exponat":'.$i .'}, "qrType": "section"};';
            } else {
                echo '{"exhibit": {"room":'.$roomNumber .',"exponat":'.$i .'}, "qrType": "section"}';
            }
            
        }
    }
    
}

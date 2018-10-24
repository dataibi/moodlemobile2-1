<?php

class CsvHelper {
    private $mode = '';
    private $separator = '';
    private $userPrefix = '';
    private $firstNamePrefix = '';
    private $lastNamePrefix = '';
    private $emailSuffix = '';
    private $userStart = 0;
    private $userEnd = 0;
    private $courseName = '';
    private $mapNumber = 0;
    private $roomNumber = 0;
    private $exhibitStart = 0;
    private $exhibitEnd = 0;

    private $users = [];
    private $user_qrs = [];

    function __construct(
        $mode,
        $separator,
        $userPrefix,
        $firstNamePrefix,
        $lastNamePrefix,
        $emailSuffix,
        $userStart,
        $userEnd,
        $courseName,
        $mapNumber = -1,
        $roomNumber = 1,
        $exhibitStart = 1,
        $exhibitEnd = 1
    ) {
        $this->mode = $mode;
        $this->separator = $separator;
        $this->userPrefix = $userPrefix;
        $this->firstNamePrefix = $firstNamePrefix;
        $this->lastNamePrefix = $lastNamePrefix;
        $this->emailSuffix = $emailSuffix;
        $this->userStart = $userStart;
        $this->userEnd = $userEnd;
        $this->courseName = $courseName;
        $this->mapNumber = $mapNumber;
        $this->roomNumber = $roomNumber;
        $this->exhibitStart = $exhibitStart;
        $this->exhibitEnd = $exhibitEnd;
    }

    private function generatePassword($length = 16) {
        $genpassword = "";
        $characterArray = [
            "0123456789",
            "abcdefghijklmnopqrstuvwxyz",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "!_~",
        ];
        $i = 0;
        $whichCharacterSetIsUsed = 0;

        for ($i; $i < $length; $i++) {
            $char = substr($characterArray[$whichCharacterSetIsUsed], mt_rand(0, strlen($characterArray[$whichCharacterSetIsUsed]) - 1), 1);
            $genpassword .= $char;
            if ($whichCharacterSetIsUsed !== 3) {
                $whichCharacterSetIsUsed++;
            } else {
                $whichCharacterSetIsUsed = 0;
            }
        }
        $shuffledPassword = str_shuffle($genpassword);
        return $genpassword;
    }

    function generateUserCsv() {
        $header = 'username;password;firstname;lastname;email;course1<br>';

        for ($i = $this->userStart; $i <= $this->userEnd; $i++) {
            $password = $this->generatePassword();
            if ($i != $this->userEnd) {
                switch ($this->separator) {
                    case ';':
                        $this->user_qrs[$i] = '{"username": "' . $this->userPrefix . $i . '", "password": "' . $password . '", "qrType": "login"};';
                        break;
                    case 'line':
                        $this->user_qrs[$i] = '{"username": "' . $this->userPrefix . $i . '", "password": "' . $password . '", "qrType": "login"}<br>';
                        break;
                    default:
                        $this->user_qrs[$i] = '{"username": "' . $this->userPrefix . $i . '", "password": "' . $password . '", "qrType": "login"};';
                }
                $this->users[$i] = $this->userPrefix . $i . ';' . $password . ';' . $this->firstNamePrefix . $i . ';' . $this->lastNamePrefix . $i . ';' . $this->userPrefix . $i . '@' . $this->emailSuffix . ';' . $this->courseName . '<br>';
            } else {
                $this->user_qrs[$i] = '{"username": "' . $this->userPrefix . $i . '", "password": "' . $password . '", "qrType": "login"}';
                $this->users[$i] = $this->userPrefix . $i . ';' . $password . ';' . $this->firstNamePrefix . $i . ';' . $this->lastNamePrefix . $i . ';' . $this->userPrefix . $i . '@' . $this->emailSuffix . ';' . $this->courseName;
            }

        }
        echo ($header);
        foreach ($this->users as $user) {
            echo ($user);
        }
        echo '<br><hr><hr><br>';
        foreach ($this->user_qrs as $user_qr) {
            echo ($user_qr);
        }
    }

    function generateTopicCsv() {

        if ($this->mapNumber != -1) {
            for ($i = $this->exhibitStart; $i <= $this->exhibitEnd; $i++) {
                if ($i != $this->exhibitEnd) {
                    switch ($this->separator) {
                        case ';':
                            echo '{"exhibit": {"map":' . $this->mapNumber . ',"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"};';
                            break;
                        case 'line':
                            echo '{"exhibit": {"map":' . $this->mapNumber . ',"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"}<br>';
                            break;
                        default:
                            echo '{"exhibit": {"map":' . $this->mapNumber . ',"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"};';
                    }
                } else {
                    echo '{"exhibit": {"map":' . $this->mapNumber . ',"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"}';
                }

            }
        } else {
            for ($i = $this->exhibitStart; $i <= $this->exhibitEnd; $i++) {
                if ($i != $this->exhibitEnd) {
                    switch ($this->separator) {
                        case ';':
                        echo '{"exhibit": {"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"};';
                            break;
                        case 'line':
                        echo '{"exhibit": {"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"}<br>';
                            break;
                        default:
                        echo '{"exhibit": {"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"};';
                    }
                } else {
                    echo '{"exhibit": {"room":' . $this->roomNumber . ',"exponat":' . $i . '}, "qrType": "section"}';
                }

            }
        }
    }

}

function test_input($data) {
    if (strlen($data) > 100) {
        echo 'Bitte nirgendwo mehr als 100 Zeichen eingeben!';
        exit;
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['mode'])) {
        $mode = test_input($_POST['mode']);
    }

    if (isset($_POST['separator'])) {
        $separator = test_input($_POST['separator']);
    }

    if (isset($_POST['userPrefix'])) {
        $userPrefix = test_input($_POST['userPrefix']);
    }

    if (isset($_POST['firstNamePrefix'])) {
        $firstNamePrefix = test_input($_POST['firstNamePrefix']);
    }

    if (isset($_POST['lastNamePrefix'])) {
        $lastNamePrefix = test_input($_POST['lastNamePrefix']);
    }

    if (isset($_POST['userStart'])) {
        $userStart = test_input($_POST['userStart']);
    }

    if (isset($_POST['userEnd'])) {
        $userEnd = test_input($_POST['userEnd']);
    }

    if (isset($_POST['emailSuffix'])) {
        $emailSuffix = test_input($_POST['emailSuffix']);
    }

    if (isset($_POST['courseName'])) {
        $courseName = test_input($_POST['courseName']);
    }

    if (isset($_POST['mapNumber']) && $_POST['mapNumber'] != 0) {
        $mapNumber = test_input($_POST['mapNumber']);
    } else {
        $mapNumber = -1;
    }

    if (isset($_POST['roomNumber'])) {
        $roomNumber = test_input($_POST['roomNumber']);
    }

    if (isset($_POST['exhibitStart'])) {
        $exhibitStart = test_input($_POST['exhibitStart']);
    }

    if (isset($_POST['exhibitEnd'])) {
        $exhibitEnd = test_input($_POST['exhibitEnd']);
    }

    if ($mode === 'user') {
        $userCreatorObject = new CsvHelper(
            $mode,
            $separator,
            $userPrefix,
            $firstNamePrefix,
            $lastNamePrefix,
            $emailSuffix,
            $userStart,
            $userEnd,
            $courseName,
            0,
            0,
            0,
            0
        );
    
        $userCreatorObject->generateUserCsv();
    } else if ($mode === 'topic') {
        $topicQrCodeCreatorObject = new CsvHelper(
            $mode,
            $separator,
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            $mapNumber,
            $roomNumber,
            $exhibitStart,
            $exhibitEnd
        );
        $topicQrCodeCreatorObject->generateTopicCsv();
    }
} else {
    exit;
}

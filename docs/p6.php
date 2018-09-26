<?php
// We have to delete older cookies from the server. 
// Use the badgesproxy script (in this docs folder) in cron.daily to delete ervery cookie 
// older then 24 hours.

function getElementsByClass(&$parentNode, $tagName, $className)
{
    $nodes = array();

    $childNodeList = $parentNode->getElementsByTagName($tagName);
    for ($i = 0; $i < $childNodeList->length; $i++) {
        $temp = $childNodeList->item($i);
        if (stripos($temp->getAttribute('class'), $className) !== false) {
            $nodes[] = $temp;
        }
    }

    return $nodes;
}

$username = $_REQUEST['username'];
$password = $_REQUEST['password'];
$url = "https://moodle.mathetics.eu/login/index.php";
$postdata = "username=" . $username . "&password=" . $password;
$usernamePasswordString = $username.$password;
$cookieHashName = hash('sha256', $usernamePasswordString);
$path = realpath(dirname(__FILE__)).'/';
if (!file_exists($path. 'tmp/'. $cookieHashName)) {

    $cookieHandle = fopen($path. 'tmp/'. $cookieHashName, 'w');
    fclose($cookieHandle);
    $cookie = $path. 'tmp/'. $cookieHashName;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie);
    curl_setopt($ch, CURLOPT_REFERER, $url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postdata);
    curl_setopt($ch, CURLOPT_POST, 1);
    $result = curl_exec($ch);
    curl_close($ch);
    
} else {
    $cookie = $path. 'tmp/'. $cookieHashName;
}

$url = $_REQUEST['redir'];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6");
curl_setopt($ch, CURLOPT_TIMEOUT, 60);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie);
curl_setopt($ch, CURLOPT_REFERER, $url);
$result = curl_exec($ch);
curl_close($ch);

$dom = new DOMDocument;
libxml_use_internal_errors(true);
$dom->loadHTML($result);
$header = $dom->getElementById('page-header');

$header->parentNode->removeChild($header);

$footer = $dom->getElementById('page-footer');
$footer->parentNode->removeChild($footer);

$left_menu = $dom->getElementById('nav-drawer');
$left_menu->parentNode->removeChild($left_menu);

$bottom = getElementsByClass($dom, 'div', 'm-t-2');
$b = $bottom[0];
$b->parentNode->removeChild($b);

$top = getElementsByClass($dom, 'nav', 'fixed-top');
$t = $top[0];
$t->parentNode->removeChild($t);

$cards = getElementsByClass($dom, 'div', 'card');
$cards[0]->setAttribute("style", "min-height: 0");

$body = $dom->getElementsByTagName('body');
$body[0]->setAttribute("style", "height: 0");

$head = $dom->getElementsByTagName('head')->item(0);
$new_elm = $dom->createElement('style', ' li { visibility: hidden; } ');
$elm_type_attr = $dom->createAttribute('type');
$elm_type_attr->value = 'text/css';
$new_elm->appendChild($elm_type_attr);
$head->appendChild($new_elm);

print $dom->saveHTML();

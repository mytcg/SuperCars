<?php

include('dbconnection.php');
include('functions.php');
include('constants.php');

date_default_timezone_set('Africa/Johannesburg');

$retXml = '<output>';

$request = $_GET['request'];

// If this is a registration request, attempt to register the user.
if ($request=="register") {
	$username = $_GET['username'];
	$password = $_GET['password'];
	
	$retXml .= registerUser($username, $password);
	
	close($retXml);
}

// Check that the user is valid
$sUsername = 'james';//$_SERVER['HTTP_AUTH_USER'];
$sPassword = 'password';//$_SERVER['HTTP_AUTH_PW'];
$user_id = '';

$userDetails = myqu('SELECT * FROM users WHERE username = "'.$sUsername.'"');
$validUser = true;
if ($user=$userDetails[0]) {
	if ($user['password'] != $sPassword) {
		$retXml .= '<result>false</result><content>Invalid username/password.</content>';
		$validUser = false;
	}
	else {
		$user_id = $user['user_id'];
	}
}
else {
	$retXml .= '<result>false</result><content>User not found.</content>';
	$validUser = false;
}

if (!$validUser) {
	close($retXml);
}

// Main logic section. This is just a big swtich that check on the request sent through, and does something accordingly.
switch($request) {
	case "categories":
		$retXml .= getCategories($_GET['category_id']);
		break;
	case "cards":
		$retXml .= getUserCards($_GET['category_id'], $user_id);
		break;
	default:
		$retXml .= '<result>true</result><content>No request sent.</content>';
}

close($retXml);



?>
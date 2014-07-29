<?php

include('dbconnection.php');
include('functions.php');
include('constants.php');
include('productfunctions.php');

date_default_timezone_set('Africa/Johannesburg');

$retXml = '<output>';

$request = $_GET['request'];

// If this is a registration request, attempt to register the user.
if ($request==$REQUEST_REGISTER) {
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

// Check if it is the first time the user is logging in for the day, and if so, give them stuff!
dailyChecks($user_id);
// Then set their last request to now.
updateLastRequestDate($user_id);

// Main logic section. This is just a big swtich that check on the request sent through, and does something accordingly.
switch($request) {
	case $REQUEST_LOGIN:
		$retXml .= '<result>true</result><content>Log in success.</content>';
		break;
	case $REQUEST_CATEGORIES:
		$retXml .= getCategories($_GET['category_id']);
		break;
	case $REQUEST_ALBUMCARDS:
		$retXml .= getUserAlbumCards($_GET['category_id'], $user_id);
		break;
	case $REQUEST_SCRAPCARD:
		$retXml .= scrapUserCards($_GET['card_id'], $user_id);
		break;
	case $REQUEST_PRODUCTS:
		$retXml .= getProducts();
		break;
	case $REQUEST_PURCHASEPRODUCT:
		$retXml .= buyProduct($user_id, $_GET['product_id']);
		break;
	case $REQUEST_GETDECKS:
		$retXml .= getDecks($user_id);
		break;
	case $REQUEST_GETDECKCARDS:
		$retXml .= getDeckCards($_GET['deck_id']);
		break;
	case $REQUEST_GETUSERCARDSNOTINDECK:
		$retXml .= getUserCardsNotInDeck($user_id, $_GET['deck_id']);
		break;
	default:
		$retXml .= '<result>true</result><content>No request sent.</content>';
}

close($retXml);

?>
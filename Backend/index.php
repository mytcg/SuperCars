<?php

include('dbconnection.php');
include('functions.php');
include('constants.php');
include('productfunctions.php');
include('gamefunctions.php');

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
$sUsername = $_GET['PHP_AUTH_USER'];
$sPassword = $_GET['PHP_AUTH_PW'];
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
	$retXml .= ('<result>false</result><content>User not found.</content><random>'.$sUsername.' '.$sPassword.'</random>');
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
	// Check for normal requests
	case $REQUEST_LOGIN:
		$retXml .= '<result>true</result><content>Log in success.</content>';
		break;
	case $REQUEST_CATEGORIES:
		$retXml .= padReturnString(getCategories($_GET['category_id']));
		break;
	case $REQUEST_ALBUMCARDS:
		$retXml .= padReturnString(getUserAlbumCards($_GET['category_id'], $user_id));
		break;
	case $REQUEST_SCRAPCARD:
		$retXml .= scrapUserCards($_GET['card_id'], $user_id);
		break;
	case $REQUEST_PRODUCTS:
		$retXml .= padReturnString(getProducts());
		break;
	case $REQUEST_PURCHASEPRODUCT:
		$retXml .= buyProduct($user_id, $_GET['product_id']);
		break;
	case $REQUEST_GETDECKS:
		$retXml .= padReturnString(getDecks($user_id));
		break;
	case $REQUEST_GETDECKCARDS:
		$retXml .= padReturnString(getDeckCards($_GET['deck_id']));
		break;
	case $REQUEST_GETUSERCARDSNOTINDECK:
		$retXml .= padReturnString(getUserCardsNotInDeck($user_id, $_GET['deck_id']));
		break;
	case $REQUEST_ADDCARDTODECK:
		$retXml .= addCardToDeck($user_id, $_GET['deck_id'], $_GET['card_id']);
		break;
	case $REQUEST_REMOVECARDFROMDECK:
		$retXml .= removeCardFromDeck($_GET['deck_id'], $_GET['card_id']);
		break;
	
	// Check for game requests
	case $GAMEREQUEST_NEWGAME:
		$retXml .= newGame($user_id, $_GET['deck_id']);
		break;
	
	default:
		$retXml .= '<result>true</result><content>No request sent.</content>';
}

close($retXml);

?>
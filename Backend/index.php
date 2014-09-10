<?php

header('Access-Control-Allow-Origin: *');

include('dbconnection.php');
include('functions.php');
include('constants.php');
include('productfunctions.php');
include('gamefunctions.php');
include('voucherfunctions.php');

date_default_timezone_set('Africa/Johannesburg');

$request = $_GET['request'];

// If this is a registration request, attempt to register the user.
if ($request==$REQUEST_REGISTER) {
	$username = $_GET['username'];
	$password = $_GET['password'];
	
	$result = registerUser($username, $password);
}

// Check that the user is valid
$sUsername = $_GET['PHP_AUTH_USER'];
$sPassword = $_GET['PHP_AUTH_PW'];
$user_id = '';

$userDetails = myqu('SELECT * FROM users WHERE username = "'.$sUsername.'"');
$validUser = true;
if ($user=$userDetails[0]) {
	if ($user['password'] != $sPassword) {
		$result = array(
                    'result'    =>  false
                    ,'content'  =>  'Invalid username/password.'
                );
		$validUser = false;
	}
	else {
		$user_id = $user['user_id'];
	}
}
else {
        $result = array(
            'result'    =>  false
            ,'content'  =>  'User not found.'
            ,'random'   =>  $sUsername.' '.$sPassword
        );
	$validUser = false;
}

if (!$validUser) {
	print json_encode($result);
        exit;
}

// Check if it is the first time the user is logging in for the day, and if so, give them stuff!
dailyChecks($user_id);
// Then set their last request to now.
updateLastRequestDate($user_id);

// Main logic section. This is just a big swtich that check on the request sent through, and does something accordingly.
switch($request) {
	// Check for normal requests
	case $REQUEST_LOGIN:
		$result = array(
                    'result'    =>  true
                    ,'content'  =>  'Log in success.'
                    ,'user_id'  =>  $user_id
                );
		break;
	case $REQUEST_USER:
		$result = getUser($_GET['user_id']);
		break;
	case $REQUEST_CATEGORIES:
		$result = getCategories($_GET['category_id']);
		break;
	case $REQUEST_ALBUMCARDS:
		$result  = getUserAlbumCards($_GET['category_id'], $user_id);
		break;
	case $REQUEST_CARD:
		$result  = getCard($_GET['card_id'], $user_id);
		break;
	case $REQUEST_SCRAPCARD:
		$result = scrapUserCards($_GET['card_id'], $user_id);
		break;
	case $REQUEST_PRODUCTS:
		$result = getProducts();
		break;
	case $REQUEST_PURCHASEPRODUCT:
		$result = buyProduct($user_id, $_GET['product_id']);
		break;
	case $REQUEST_GETDECKS:
		$result = getDecks($user_id);
		break;
	case $REQUEST_GETDECKCARDS:
		$result = getDeckCards($_GET['deck_id']);
		break;
	case $REQUEST_GETUSERCARDSNOTINDECK:
		$result = getUserCardsNotInDeck($user_id, $_GET['deck_id']);
		break;
	case $REQUEST_ADDCARDTODECK:
		$result = addCardToDeck($user_id, $_GET['deck_id'], $_GET['card_id']);
		break;
	case $REQUEST_REMOVECARDFROMDECK:
		$result = removeCardFromDeck($_GET['deck_id'], $_GET['card_id']);
		break;
	case $REQUEST_REDEEMVOUCHER:
		$result  = redeemVoucher($user_id, $_GET['redeem_code']);
		break;
	
	// Check for game requests
	case $GAMEREQUEST_NEWGAME:
		$result = newGame($user_id, $_GET['deck_id']);
		break;
	
	default:
		$result = array(
                    'result'    =>  true
                    ,'content'  =>  'No request sent.'
                );
}

print json_encode($result);

<?php

include('../dbconnection.php');

function curPageURL() {
	$pageURL = 'http';
	if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
	$pageURL .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	}
	return $pageURL;
}

function addCreditsSMS($iUserID,$amount=350){
	if(intval($iUserID) > 0){
		$sql = "UPDATE users SET credits = IFNULL(credits,0) + ".$amount." WHERE user_id = ".$iUserID;
		myqu($sql);
		/*$sql = "INSERT INTO mytcg_transactionlog (user_id, description, date,
			val, transactionlogtype_id) VALUES (".$iUserID.", 'Purchased ".$amount." credits via SMS', NOW(),".$amount.", 2)";
		myqu($sql);
		$sql = "INSERT INTO mytcg_notifications (user_id, notification,
			notedate, notificationtype_id) VALUES (".$iUserID.",'Received ".$amount." credits via SMS purchase',now(), 3)";
		myqu($sql);*/
	}
}

//SEND MAIL FUNCTION
function sendEmail($sEmailAddress,$sFromEmailAddress,$sSubject,$sMessage){
	$sHeaders='From: '.$sFromEmailAddress;
	mail($sEmailAddress,$sSubject,$sMessage,$sHeaders);
	return;
}

$smsText = $_GET['text'];
$aSmsParts = explode(' ', trim($smsText));

$username = $aSmsParts[sizeof($aSmsParts) - 1];

$smsUser=myqu('SELECT user_id, email '
	.'FROM users '
	.'WHERE username="'.$username.'"');

$user = NULL;
if ($user = $smsUser[0]) {
	//if we got the user on a plain select
}
else {
	//try to select the user, ignoring case
	$smsUser=myqu('SELECT user_id, email '
		.'FROM users '
		.'WHERE UPPER(username)=UPPER("'.$username.'")');
	if ($user = $smsUser[0]) {
		//if we got the user on a case select
	
	}
	else {
		$aFileHandle=fopen('errors.txt','a+');
		fwrite($aFileHandle,date("l dS \of F Y h:i:s A").' : '.curPageURL()."\n");
		fwrite($aFileHandle,"Unable to find user.\n");
		fclose($aFileHandle);
		
		sendEmail('jsincl4ir@gmail.com','Automated _sms live','Add credits failed',
'SMS received, failed to add credits. Username not found.

'.print_r($_GET, true));
		
		exit;
	}
}

if ($user != NULL) {
	addCreditsSMS($user['user_id']);
	
	$aFileHandle=fopen('output.txt','a+');
	fwrite($aFileHandle,date("l dS \of F Y h:i:s A").' : '.curPageURL()."\n");
	fwrite($aFileHandle,"Credits added for user_id:".$user['user_id']."\n");
	fclose($aFileHandle);
	
	sendEmail('jsincl4ir@gmail.com','Automated _sms live','Add credits success',
'SMS received, credits added.

'.print_r($_GET, true));
	
	exit;
}

?>
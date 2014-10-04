<?php

include('../dbconnection.php');

//SEND MAIL FUNCTION
function sendEmail($sEmailAddress,$sFromEmailAddress,$sSubject,$sMessage){
	$sHeaders='From: '.$sFromEmailAddress;
	mail($sEmailAddress,$sSubject,$sMessage,$sHeaders);
	return;
}

// We need to get the code from the url, and if it is valid, allow the user to enter a new password.
if ($encodedCode = $_GET['code']) {
	$code = base64_decode($encodedCode);
	
	// Check that we got a valid code
	$result = myqu('select user_id from password_resets where valid = 1 password_reset_id = '.$code);
	
	if ($user = $result[0]) {
		echo $code;
	}
	else {
		echo 'Invalid reset url.';
	}
}
else {
	echo 'Invalid reset url.';
}

?>
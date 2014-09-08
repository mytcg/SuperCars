<?php

function redeemVoucher($user_id, $redeem_code) {
	// select the user data, to make sure that they have enough credits
	$sql = 'SELECT user_id
	  FROM users
	 WHERE user_id = '.$user_id;
	$result = myqu($sql);
	if ($user=$result[0]) {
		
	}
	else {
		return '<result>false</result><content>Invalid user.</content>';
	}
}

?>
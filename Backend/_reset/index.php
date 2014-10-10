<?php

include('../dbconnection.php');

// We need to get the code from the url, and if it is valid, allow the user to enter a new password.
if ($encodedCode = $_GET['code']) {
	$code = base64_decode($encodedCode);
	
	// Check that we got a valid code
	$result = myqu('select pr.user_id, u.username, pr.valid
		from password_resets pr
		join users u
		on u.user_id = pr.user_id
		and pr.password_reset_id = '.$code);
	
	if ($user = $result[0]) {
	
		if ($user['valid'] == 1) {
			$valid = false;
			if ($_GET['submitted']) {
				$password = $_GET['password'];
				$repeatPassword = $_GET['repeat_password'];
				
				if (strlen($password) < 5) {
					echo '<p>Your password needs to be at least 5 characters long.</p> ';
				}
				else if ($password != $repeatPassword) {
					echo '<p>The passwords need to match.</p> ';
				}
				else {
					$valid = true;
					
					myqu('update password_resets set valid = 0 where password_reset_id = '.$code);
					
					myqu('update users set password = "'.$password.'" where user_id = "'.$user['user_id'].'"');
					
					echo '<p>Password reset!</p> ';
				}
			}
		
			if (!$valid) {
				echo '<p>Username: '.$user['username'].'</p> 
					<form name="passwordForm">
					  Password: <input type="text" name="password"><br>
					  Repeat Password: <input type="text" name="repeat_password"><br>
					  <input type="hidden" name="code" value="'.$encodedCode.'">
					  <input type="hidden" name="submitted" value="true">
					  <input type="submit" value="Submit">
					</form>';
			}
		}
		else {
			echo 'Password reset request expired.';
		}
	}
	else {
		echo 'Invalid reset url.';
	}
}
else {
	echo 'Invalid reset url.';
}

?>
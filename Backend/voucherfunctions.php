<?php

function redeemVoucher($user_id, $redeem_code) {
	global $VOUCHER_PERPLAYER;
	global $VOUCHER_ONCEOFF;
	
	$result = false;
	$content = '';

	// select the user data
	$sql = 'SELECT user_id, credits
	  FROM users
	 WHERE user_id = '.$user_id;
	$sqlResult = myqu($sql);
	if ($user=$sqlResult[0]) {
		// select the redeem code data
		$sql = 'select v.voucher_id, vt.description type, v.description, count(rl.redeem_log_id) redeem_count
			from vouchers v
			join voucher_codes vc
			on vc.voucher_id = v.voucher_id
			join voucher_types vt
			on vt.voucher_type_id = v.voucher_type
			left join redeem_log rl
			on rl.voucher_id = v.voucher_id
			where vc.redeem_code = "'.$redeem_code.'"
			group by v.voucher_id';
		$sqlResult = myqu($sql);
		
		if ($voucher=$sqlResult[0]) {
			// If it is a legitimate voucher, check which type and treat it accordingly
			$canRedeem = false;
			
			// Check which type of voucher is being redeemed, and if they can redeem it.
			switch ($voucher['type']) {
				case $VOUCHER_PERPLAYER:
					$sql = 'select *
						from redeem_log rl
						where rl.voucher_id = '.$voucher['voucher_id'].'
						and rl.user_id = '.$user_id;
					$sqlResult = myqu($sql);
					if (!$hasRedeemed=$sqlResult[0]) {
						$canRedeem = true;
					}
					break;
				case $VOUCHER_ONCEOFF:
					if ($voucher['redeem_count'] == 0) {
						$canRedeem = true;
					}
					break;
			}
			
			if ($canRedeem) {
				addVoucherContents($user_id, $voucher['voucher_id']);
				$result = true;
				$content = 'Voucher redeemed.';
			}
			else {
				$result = false;
				$content = 'Invalid voucher.';
			}
		}
		else {
			$result = false;
			$content = 'Invalid voucher code.';
		}
	}
	else {
		$result = false;
		$content = 'Invalid user.';
	}
	
	return array(
                    'result'    =>  $result
                    ,'content'  =>  $content
                );
}

function addVoucherContents($user_id, $voucher_id) {
	global $CARDSTATUS_ALBUM;

	// Select all the entries in voucher credits for the voucher and give them to the user
	$sql = 'select credits 
		from voucher_credits vc
		where vc.voucher_id = '.$voucher_id;
	$sqlResult = myqu($sql);
	foreach ($sqlResult as $credits) {
		$sql = 'update users u set u.credits = u.credits + '.$credits['credits'].' where u.user_id = '.$user_id;
		myqu($sql);
	}
	
	// Select all the entries in voucher cards for the voucher and give them to the user
	$sql = 'insert into user_cards (user_id, card_id, date_created, user_card_status)
		select '.$user_id.', vc.card_id, now(), cs.card_status_id
		from voucher_cards vc, card_statuses cs
		where cs.description = "'.$CARDSTATUS_ALBUM.'"
		and vc.voucher_id = '.$voucher_id;
	myqu($sql);
	
	// Add an entry to the redeem log
	$sql = 'insert into redeem_log (voucher_id, user_id, redeem_date)
		values ('.$voucher_id.', '.$user_id.', now())';
	myqu($sql);
}

?>
<?php

function addCredits($user_id, $credits) {
	// Add credits to a user's account
	$sql = 'UPDATE users
	   SET credits = credits + '.$credits.'
	 WHERE user_id = '.$user_id;
	
	myqu($sql);
}

function dailyChecks($user_id) {
	global $DAILY_CREDITS;

	// Check that it is the next days since the user's last activity
	$sql = 'SELECT (YEAR(now()) - YEAR(last_request)) AS yeardiff,
		   (MONTH(now()) - MONTH(last_request)) AS monthdiff,
		   (DAYOFYEAR(now()) - DAYOFYEAR(last_request)) AS daydiff
	  FROM users
	 WHERE user_id = '.$user_id;
	
	$results = myqu($sql);
	if ($result=$results[0]) {
		// Check if the year, then the month, then the day are different
		if ($result['yeardiff'] > 0 || $result['monthdiff'] > 0 || $result['daydiff'] > 0) {
			addCredits($user_id, $DAILY_CREDITS);
		}
	}
}

function updateLastRequestDate($user_id) {
	// Update the user's last_request date to now.
	$sql = 'UPDATE users
	   SET last_request = now()
	 WHERE user_id = '.$user_id;
	
	myqu($sql);
}

function getDecks($user_id) {
	global $DECK_MAXIMUMCARDS;

	$sql = 'SELECT d.deck_id, d.description, ifnull(dc.cards_in_deck, 0) cards_in_deck
		  FROM decks d
			   LEFT OUTER JOIN (SELECT count(card_id) cards_in_deck, deck_id
								  FROM deck_cards
								GROUP BY deck_id) dc
				  ON dc.deck_id = d.deck_id
		 WHERE d.user_id = '.$user_id;
	
	$decks = myqu($sql);
	
	$deckArr = array();
	foreach ($decks as $deck) {
		$cardsInDeck =  $deck['cards_in_deck'];
		
		$deckArr[]    =   array(
			'deck_id'       =>  $deck['deck_id']
			,'description'  =>  $deck['description']
			,'cards_in_deck'=>  $cardsInDeck
			,'playable'     =>  ($cardsInDeck == $DECK_MAXIMUMCARDS ? 'true' : 'false')
		);
	}
	
	return $deckArr;
}

function getCategories($user_id, $parent = '') {
	global $SUPERCARS_CATEGORY;
	global $CARDSTATUS_ALBUM;
	
	$sql = 'SELECT c.category_id, c.description, (case when count(cd.card_id) = 0 then "false" else "true" end) as hascards,
		count(distinct cd.card_id) cards_in_category, count(distinct uc.card_id) cards_owned
		FROM categories c
		left OUTER JOIN cards cd ON cd.category_id = c.category_id
		left outer join (select uc.card_id 
		from user_cards uc
		join card_statuses cs
		on cs.card_status_id = uc.user_card_status
		where uc.user_id = '.$user_id.'
		and cs.description = "'.$CARDSTATUS_ALBUM.'") uc 
		on uc.card_id = cd.card_id
		WHERE c.category_parent = '.(($parent == '' || $parent == null) ? $SUPERCARS_CATEGORY : $parent).
		' GROUP BY c.category_id
		order by c.description asc';

    $categories = myqu($sql);
	
	$result = array();
    foreach ($categories as $category) {

        $result[] = array(
            'category_id'   =>  $category['category_id']
            ,'description'  =>  $category['description']
            ,'hascards'     =>  $category['hascards']
			,'cards_owned'     =>  $category['cards_owned']
			,'cards_in_category'     =>  $category['cards_in_category']
        );
    }

    return $result;
}

function getCategoriesNotInDeck($deck_id, $parent = '') {
    
	$sql = 'SELECT c.category_id, c.description, (case when count(uc.card_id) = 0 then "false" else "true" end) as hascards
		FROM categories c
		LEFT JOIN cards cd ON cd.category_id = c.category_id
		LEFT JOIN user_cards uc ON uc.card_id = cd.card_id
		WHERE '.(($parent == '' || $parent == null) ? ('c.category_parent is null') : ('c.category_parent = '.$parent.'
		AND cd.card_id NOT IN (SELECT dc.card_id FROM deck_cards dc WHERE dc.deck_id = '.$deck_id.')')).' 
		GROUP BY c.category_id';

    $categories = myqu($sql);
    foreach ($categories as $category) {

        $result[] = array(
            'category_id'   =>  $category['category_id']
            ,'description'  =>  $category['description']
        );
    }

    return $result;
}

function getDeckCards($deck_id) {
	$sql = 'select description 
		from decks
		where deck_id = '.$deck_id;
	$deckResult = myqu($sql);
	if ($deck = $deckResult[0]) {
		$sql = 'SELECT c.card_id, c.name
			  FROM deck_cards dc INNER JOIN cards c ON c.card_id = dc.card_id
			 WHERE dc.deck_id = '.$deck_id;
		
		$cards = myqu($sql);
		$result = array();
		$result['deck_name'] = $deck['description'];
		
		$cardsArray = array();
		foreach ($cards as $card) {
			$cardsArray[] = array(
				'card_id'   =>  $card['card_id']
				,'name'  	=>  $card['name']
			);
		}
		
		$result['cards'] = $cardsArray;
		return $result;
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'Invalid deck!'
			);
	}
}

function getUserCardsNotInDeck($user_id, $deck_id, $category_id) {
	
	$sql = 'SELECT DISTINCT c.card_id, c.name
		  FROM cards c INNER JOIN user_cards uc ON c.card_id = uc.card_id
		 WHERE uc.user_id = '.$user_id.'
		 AND c.category_id = '.$category_id.'
			   AND c.card_id NOT IN (SELECT card_id
									   FROM deck_cards
									  WHERE deck_id = '.$deck_id.')';
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$result[] = array(
			'card_id'   =>  $card['card_id']
            ,'name'  	=>  $card['name']
		);
	}
	
	return $result;
}

function getUserAlbumCards($category, $user_id) {
	global $CARDSTATUS_ALBUM;
	
    $sql = 'SELECT c.card_id,
                   c.name,
                   c.description,
                   c.scrap_value,
                   ifnull(uc.owned, 0) owned,
				   c.parts_cost
			  FROM cards c
				   LEFT JOIN
				   (SELECT uc.card_id, count(uc.user_card_id) owned
					  FROM user_cards uc
						   INNER JOIN card_statuses cs
							  ON cs.card_status_id = uc.user_card_status
					 WHERE uc.user_id = '.$user_id.' AND cs.description = "'.$CARDSTATUS_ALBUM.'"
					GROUP BY uc.card_id) uc
					  ON uc.card_id = c.card_id
			 WHERE c.category_id = '.$category.'
			GROUP BY c.card_id
			ORDER BY c.name;';
	
    $cardArr = myqu($sql);

    $cards = array();
    foreach ($cardArr as $cardElement) {
		$cards[] = array(
			'card_id'        =>  $cardElement['card_id']
			,'name'          =>  $cardElement['name']
			,'description'   =>  $cardElement['description']
			,'scrap_value'   =>  $cardElement['scrap_value']
			,'owned'         =>  $cardElement['owned']
			,'scrap_cost'    =>  $cardElement['parts_cost']
		);
    }

    return $cards;
}

function getCard($card_id, $user_id) {

    $sql = 'SELECT c.card_id,
                   c.name,
                   c.description,
                   c.scrap_value,
                   c.parts_cost,
                   c.rarity
			  FROM cards c
				   WHERE c.card_id = '.$card_id.';';

    $cardArr = myqu($sql);

    $cards = array();
    foreach ($cardArr as $cardElement) {
		$card = array(
			'card_id'       =>  $cardElement['card_id']
			,'name'         =>  $cardElement['name']
			,'description'  =>  $cardElement['description']
			,'category_id'  =>  $cardElement['category_id']
			,'scrap_value'  =>  $cardElement['scrap_value']
			,'parts_cost'   =>  $cardElement['parts_cost']
			,'rarity'       =>  $cardElement['rarity']
		);
    }

    return $card;
}

function registerUser($username, $password, $email) {
	global $BANNED_NAMES;
	
	// Check that the username and password are at least the minimum length.
	if (strlen($username) < 5) {
		return array(
            'result'    =>  false
			,'content'  =>  'Username less than 5 characters.'
        );
	}
	else if (strlen($password) < 5) {
		return array(
            'result'    =>  false
			,'content'  =>  'Password less than 5 characters.'
        );
	}
	
	// Check that the username isn't in the banned list
	if (in_array(strtolower($username), $BANNED_NAMES)) {
		return array(
            'result'    =>  false
			,'content'  =>  'Invalid username.'
        );
	}
	
	// Check that the username isnt taken.
	$sql = 'SELECT *
		FROM users
		WHERE UPPER(username) = UPPER("'.$username.'")';
	$result = myqu($sql);
	if ($user=$result[0]) {
		return array(
            'result'    =>  false
			,'content'  =>  'User already exists.'
        );
	}
	
	// Check that the email is valid
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		return array(
            'result'    =>  false
			,'content'  =>  'Invalid email address.'
        );
	}
	
	// Check that the email isnt taken
	$sql = 'SELECT *
		FROM users
		WHERE UPPER(email) = UPPER("'.$email.'")';
	$result = myqu($sql);
	if ($emailResult=$result[0]) {
		return array(
			'result'    =>  false
			,'content'  =>  'Email already in use.'
		);
	}
	
	// If we get this far, things are looking good. Create the user.
	$sql = 'INSERT INTO users(username, password, email, date_registered, credits)
		VALUES ("'.$username.'", "'.$password.'", "'.$email.'", now(), 1000)'; // TODO reset the starting credits to 0
	
	myqu($sql);
	
	$sql = 'SELECT user_id
		FROM users
		WHERE username = "'.$username.'"';
	$result = myqu($sql);
	if ($user=$result[0]) {
		sendEmail($email, 'The Supercars Team', 'Welcome to the Supercars App!', 'Dear '.$username.'

Welcome to Supercars! For your records, here are your login details:
Username: '.$username.'
Password: '.$password.'

We hope you enjoy the app, and share it with your friends!');
		
		return array(
            'result'    =>  true
			,'content'  =>  'User created.'
			,'user_id'  =>  $user['user_id']
        );
	}
	else {
		return array(
            'result'    =>  false
			,'content'  =>  'Registration failed. Please contact an administrator.'
        );
	}
}

function getUser($user_id) {
	if (strlen($user_id) < 1) {
		return $result = array(
                    'result'    =>  false
                    ,'content'  =>  'Invalid User.'
                );
	}

	// Check that the user exists
	$sql = 'SELECT u.user_id, u.username, u.credits, u.parts, u.ranking, u.email,
		count(distinct uc.card_id) cards_owned, count(distinct c.card_id) cards_total
		FROM users u
		left outer join user_cards uc
		on uc.user_id = u.user_id, cards c
		WHERE u.user_id = '.$user_id.' 
		group by u.user_id';
	
	$user = myqu($sql);
	if (!$userData = $user[0]) {
		return $result = array(
                    'result'    =>  false
                    ,'content'  =>  'Invalid User.'
                );
	} else {

            $user = array(
                'user_id'       =>  $userData['user_id']
                ,'username'     =>  $userData['username']
				,'email'     	=>  $userData['email']
                ,'credits'      =>  $userData['credits']
                ,'parts'        =>  $userData['parts']
				,'points'       =>  $userData['ranking']
				,'cards_owned'  =>  $userData['cards_owned']
				,'cards_total'  =>  $userData['cards_total']
            );
        }
        return $user;
}

function craftCard($card_id, $user_id) {
	global $CARDSTATUS_ALBUM;
	
	$sqlResult = myqu('select c.parts_cost, u.parts
		from cards c, users u
		where c.card_id = '.$card_id.'
		and u.user_id = '.$user_id);
		
	$cost;
	$parts;
	
	// Check that the card and the user exist
	if ($result = $sqlResult[0]) {
		$cost = $result['parts_cost'];
		$parts = $result['parts'];
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'Invalid card.'
			);
	}
	
	// Check that the user has enough parts to make the card
	if ($parts >= $cost) {
		// subtract the parts from the user
		myqu('update users u set u.parts = u.parts - '.$cost.' where u.user_id = '.$user_id);
		
		// Give the user their new card
		myqu('INSERT INTO user_cards(user_id,
				   card_id,
				   user_card_status,
				   date_created)
			   SELECT '.$user_id.',
					  '.$card_id.',
					  card_status_id,
					  now()
				 FROM card_statuses
				WHERE description = "'.$CARDSTATUS_ALBUM.'"');
		
		// Return outcome
		return array(
				'result'    	=>  true
				,'content'   	=>  'Card crafted.'
				,'new_parts'	=>  ($parts - $cost)
			);
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'You do not have enough parts! Scrap some more cards.'
			);
	}
}

function scrapUserCards($card_id, $user_id) {
	global $CARDSTATUS_ALBUM;
	global $CARDSTATUS_SCRAP;
	
	$sql = 'SELECT uc.user_card_id, c.scrap_value, c.name
		FROM user_cards uc
		INNER JOIN card_statuses cs 
		ON cs.card_status_id = uc.user_card_status
		INNER JOIN cards c
		ON c.card_id = uc.card_id
		WHERE uc.user_id = '.$user_id.' AND uc.card_id = '.$card_id.' AND cs.description = "'.$CARDSTATUS_ALBUM.'"
		LIMIT 1';
	
	$result = myqu($sql);
	if ($usercard=$result[0]) {
		$usercardId = $usercard['user_card_id'];
		$scrapValue = $usercard['scrap_value'];
		$cardName = $usercard['name'];
		
		myqu('UPDATE user_cards
		   SET user_card_status =
				  (SELECT card_status_id
					 FROM card_statuses
					WHERE description = "'.$CARDSTATUS_SCRAP.'")
		 WHERE user_card_id = '.$usercardId);
		
		myqu('UPDATE users
		   SET parts = parts + '.$scrapValue.'
		 WHERE user_id = '.$user_id);
		 
		$cardsResult = myqu('select count(uc.user_card_id) cards
			from user_cards uc
			inner join card_statuses cs
			on uc.user_card_status = cs.card_status_id
			where uc.card_id = '.$card_id.'
			and uc.user_id = '.$user_id.'
			and cs.description = "'.$CARDSTATUS_ALBUM.'"');
		
		// If they scrapped their last copy of the card, remove them from any deck they might be in.
		if ($usercard=$cardsResult[0]) {
			if ($usercard['cards'] == 0) {
				myqu($sql = 'DELETE FROM deck_cards
					WHERE card_id = '.$card_id.' and deck_id in (select d.deck_id from decks d where d.user_id = '.$user_id.')');
			}
		}
		
		return array('result' => true, 'content' => $cardName.' scrapped! You gained '.$scrapValue.' parts!');
	}
	else {
		return array('result' => false, 'content' => 'Failed to scrap car. Card not found.');
	}
}

function removeCardFromDeck($deck_id, $card_id) {
	$sql = 'DELETE FROM deck_cards
		WHERE deck_id = '.$deck_id.' AND card_id = '.$card_id;
	
	myqu($sql);
	
	return array('result' => true, 'content' => 'Card removed!');
}

function addCardToDeck($user_id, $deck_id, $card_id) {
	global $DECK_MAXIMUMCARDS;
	global $CARDSTATUS_ALBUM;

	// First make sure that there aren't already the maximum amount of cards in the deck
	$sql = 'SELECT count(*) cards
		  FROM deck_cards
		 WHERE deck_id = '.$deck_id;
	
	$result = myqu($sql);
	if ($result[0]['cards'] < $DECK_MAXIMUMCARDS) {
		// Then check that there isn't already a copy of this card in the deck.
		$sql = 'SELECT CASE WHEN count(*) > 0 THEN "true" ELSE "false" END has_card
			  FROM deck_cards
			 WHERE card_id = '.$card_id.' AND deck_id = '.$deck_id;
	
		$result = myqu($sql);
		if ($result[0]['has_card'] == 'false') {
			// Lastly, check that the user actually has a valid copy of the card.
			$sql = 'SELECT CASE WHEN count(uc.user_card_id) > 0 THEN "true" ELSE "false" END
					  has_card
			  FROM user_cards uc
				   INNER JOIN card_statuses cs ON cs.card_status_id = uc.user_card_status
			 WHERE uc.card_id = '.$card_id.' AND uc.user_id = '.$user_id.' AND cs.description = "'.$CARDSTATUS_ALBUM.'"';
	
			$result = myqu($sql);
			if ($result[0]['has_card'] == 'true') {
				// If all the conditions have been met, add the card to the deck.
				$sql = 'INSERT INTO deck_cards(deck_id, card_id)
						VALUES ('.$deck_id.', '.$card_id.')';
				
				myqu($sql);
				
				return array(
					'result'    =>  true
					,'content'  =>  'Card added!'
				);
			}
			else {
				return array(
					'result'    =>  false
					,'content'  =>  'You don\'t have that card!'
				);
			}
		}
		else {
			return array(
					'result'    =>  false
					,'content'  =>  'That card is already in the deck!'
				);
		}
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'The deck is full!'
			);
	}
}

function createDeck($user_id, $deck_name) {
	if (strlen($deck_name) > 0) {
		$sql = 'insert into decks (description, user_id) values ("'.$deck_name.'", '.$user_id.')';
		
		myqu($sql);
		
		// After creating the deck, we want to return the deck_id
		$deck_id = '';
		
		$deckIdResult = myqu('select max(d.deck_id) deck_id
			from decks d
			where d.user_id = '.$user_id.'
			and d.description = "'.$deck_name.'"');
			
		if ($deckId = $deckIdResult[0]) {
			$deck_id = $deckId['deck_id'];
		}
		
		return array('result' => true, 'content' => 'Deck created!', 'deck_id' => $deck_id);
	}
	else {
		return array('result' => false, 'content' => 'Please provide a name for your deck.');
	}
}

function deleteDeck($deck_id) {
	// remove any cards from the deck
	$sql = 'DELETE FROM deck_cards
		WHERE deck_id = '.$deck_id;
	
	myqu($sql);
	
	// delete the deck
	$sql = 'DELETE FROM decks
		WHERE deck_id = '.$deck_id;
	
	myqu($sql);
	
	return array('result' => true, 'content' => 'Deck deleted!');
}

function renameDeck($deck_id, $deck_name) {
	if (strlen($deck_name) > 0) {
		$sql = 'update decks set description = "'.$deck_name.'" where deck_id = '.$deck_id;
		
		myqu($sql);
		
		return array('result' => true, 'content' => 'Deck updated!');
	}
	else {
		return array('result' => false, 'content' => 'Please provide the new name.');
	}
}

function resetPassword($username) {
	if ($username != '' && $username != null) {
		$sql = 'SELECT user_id, email
		FROM users
		WHERE UPPER(username) = UPPER("'.$username.'")';
		$result = myqu($sql);
		if ($user=$result[0]) {
			if ($user['email'] != null && $user['email'] != '') {
				// Set existing requests for this user to invalid
				myqu('update password_resets set valid = 0 where user_id = '.$user['user_id']);
				
				// Create a new request
				myqu('insert into password_resets (user_id, date_created) values ('.$user['user_id'].', now())');
				
				// Select the ID of the new password reset entry, and base64 it to make the reset url
				$result = myqu('select password_reset_id from password_resets where user_id = '.$user['user_id'].' and valid = 1 limit 1');
				
				if ($resetData = $result[0]) {
					$encodedId = base64_encode($resetData['password_reset_id']);
					
					$message = 'A password reset was requested for the SuperCars account associated with this email address.
Proceed to this address to enter a new password:
http://topcarcards.co.za/_reset/?code='.$encodedId;
					
					// Send them an email with the url
					sendEmail($user['email'], 'SuperCars Support', 'Password Reset', $message);
						
					return array('result' => true, 'content' => 'Password reset email sent.');
				}
				else {
					return array('result' => false, 'content' => 'Error resetting password. Try again, or contact support.');
				}
			}
			else {
				return array('result' => false, 'content' => 'No email associated with this user, cannot reset password.');
			}
		}
		else {
			return array(
				'result'    =>  false
				,'content'  =>  'User not found.'
			);
		}
	}
}

function getLeaderboard($user_id) {
	$retArr = array();
	
	$sqlResult = myqu('select count(others.user_id) + 1 as place, u.username, u.ranking as points, "true" as own_score
		from users u, users others
		where u.user_id = '.$user_id.'
		and others.ranking > u.ranking');
	
	$userData = $sqlResult[0];
	
	$retArr [] = array(
					'place' => $userData['place'].ordinal($userData['place']),
					'username' => $userData['username'],
					'points' => $userData['points'],
					'own_score' => $userData['own_score']
					);
	
	$sqlResult = myqu('select u.username, u.ranking as points, "false" as own_score
		from users u
		where u.ai = 0
		order by u.ranking desc
		limit 10');
	
	$count = 1;
	foreach($sqlResult as $topRank) {
		$retArr [] = array(
					'place' => $count.ordinal($count),
					'username' => $topRank['username'],
					'points' => $topRank['points'],
					'own_score' => $topRank['own_score']
					);
		
		$count++;
	}
	
	return $retArr;
}

//SEND MAIL FUNCTION
function sendEmail($sEmailAddress,$sFromEmailAddress,$sSubject,$sMessage){
	$sHeaders='From: Supercars <noreply@media24.co.za>';
	mail($sEmailAddress,$sSubject,$sMessage,$sHeaders);
	return;
}

function ordinal($i) {
    $l = substr($i,-1);
    $s = substr($i,-2,-1);
     
    return (($l==1&&$s==1)||($l==2&&$s==1)||($l==3&&$s==1)||$l>3||$l==0?'th':($l==3?'rd':($l==2?'nd':'st')));
}

function padReturnString($retString) {
	$retXml = padXMLContent((strlen($retString) > 0 ? 'true' : 'false'), $retString);
	return $retXml;
}

function padXMLContent($result, $content) {
	$retXml = '<result>'.$result.'</result>';
	$retXml .= '<content>'.$content.'</content>';
	
	return $retXml;
}

function close($retXml) {
	$retXml .= '</output>';

	header('xml_length: '.strlen($retXml));
	echo $retXml;
	exit;
}
?>
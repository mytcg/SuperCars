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

function getCategories($parent = '') {
    
    $sql = 'SELECT c.category_id, c.description, (case when count(cd.card_id) = 0 then "false" else "true" end) as hascards
                      FROM categories c
                               left OUTER JOIN cards cd ON cd.category_id = c.category_id
                     WHERE '.(($parent == '' || $parent == null) ? 'c.category_parent is null' : 'c.category_parent = '.$parent).
                    ' GROUP BY c.category_id';

    $categories = myqu($sql);
    foreach ($categories as $category) {

        $result[] = array(
            'category_id'   =>  $category['category_id']
            ,'description'  =>  $category['description']
            ,'hascards'     =>  $category['hascards']
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
	
	$sql = 'SELECT c.card_id, c.name
		  FROM deck_cards dc INNER JOIN cards c ON c.card_id = dc.card_id
		 WHERE dc.deck_id = '.$deck_id;
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$result[] = array(
			'card_id'   =>  $card['card_id']
            ,'name'  	=>  $card['name']
		);
	}
	
	return $result;
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
	
    $sql = 'SELECT c.card_id,
                   c.name,
                   c.description,
                   c.scrap_value,
                   ifnull(uc.owned, 0) owned
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
			GROUP BY c.card_id;';
	
    $cardArr = myqu($sql);

    $cards = array();
    foreach ($cardArr as $cardElement) {
		$cards[] = array(
			'card_id'        =>  $cardElement['card_id']
			,'name'          =>  $cardElement['name']
			,'description'   =>  $cardElement['description']
			,'scrap_value'   =>  $cardElement['scrap_value']
			,'owned'         =>  $cardElement['owned']
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

function registerUser($username, $password) {
	// Check that the username and password are at least the minimum length.
	if (strlen($username) < 5) {
		return '<result>false</result><content>Username less than 5 characters.</content>';
	}
	else if (strlen($password) < 5) {
		return '<result>false</result><content>Password less than 5 characters.</content>';
	}
	
	// Check that the username isnt taken.
	$sql = 'SELECT *
		FROM users
		WHERE username = "'.$username.'"';
	$result = myqu($sql);
	if ($user=$result[0]) {
		return '<result>false</result><content>User already exists.</content>';
	}
	
	// If we get this far, things are looking good. Create the user.
	$sql = 'INSERT INTO users(username, password, date_registered)
		VALUES ("'.$username.'", "'.$password.'", now())';
	
	myqu($sql);
	
	$sql = 'SELECT *
		FROM users
		WHERE username = "'.$username.'"';
	$result = myqu($sql);
	if ($user=$result[0]) {
		return '<result>true</result><content>User created.</content>';
	}
	else {
		return '<result>false</result><content>Registration failed. Please contact an administrator.</content>';
	}
}

function getUser($user_id) {
	if (strlen($user_id) < 1) {
		return $result = array(
                    'result'    =>  false
                    ,'content'  =>  'Invalid User.'
                );
	}

	// Check that the username isnt taken.
	$sql = 'SELECT *
		FROM users
		WHERE user_id = "'.$user_id.'"';
	$user = myqu($sql);
	if (!$user[0]) {
		return $result = array(
                    'result'    =>  false
                    ,'content'  =>  'Invalid User.'
                );
	} else {

            $user = array(
                'user_id'       =>  $user[0]['user_id']
                ,'username'     =>  $user[0]['username']
                ,'credits'      =>  $user[0]['credits']
                ,'parts'        =>  $user[0]['parts']
            );
        }
        return $user;
}

function scrapUserCards($card_id, $user_id) {
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
	return '<result>true</result><content>Card removed!</content>';
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
				
				return '<result>true</result><content>Card added!</content>';
			}
			else {
				return '<result>false</result><content>You don\'t have that card!</content>';
			}
		}
		else {
			return '<result>false</result><content>That card is already in the deck!</content>';
		}
	}
	else {
		return '<result>false</result><content>The deck is full!</content>';
	}
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
<?php

function buyProduct($user_id, $product_id) {
	// Check that we got a legitimate product id.
	$sql = 'SELECT p.description,
		   pt.description product_type,
		   p.price,
		   p.pack_size
	  FROM products p
		   INNER JOIN product_types pt ON pt.product_type_id = p.product_type_id
	 WHERE product_id = '.$product_id;
	$result = myqu($sql);
	if ($product_data=$result[0]) {
		// select the user data, to make sure that they have enough credits
		$sql = 'SELECT credits
		  FROM users
		 WHERE user_id = '.$user_id;
		$result = myqu($sql);
		if ($user_credits=$result[0]) {
			if ($user_credits['credits'] >= $product_data['price']) {
				// Declare the product type constants
				global $PRODUCTTYPES_BOOSTER;
			
				// If the user has enough credits, and the product is valid, deduct their credits and give the the product.
				$sql = 'UPDATE users
				   SET credits = credits - '.$product_data['price'].'
				 WHERE user_id = 1';
				myqu($sql);
				// Then go through the product types, to make sure that the user gets their cards correctly.
				switch ($product_data['product_type']) {
					case $PRODUCTTYPES_BOOSTER:
						return buyBooster($user_id, $product_id);
						break;
				}
			}
			else {
				return '<result>false</result><content>You do not have enough credits to buy that.</content>';
			}
		}
		else {
			return '<result>false</result><content>Invalid user details.</content>';
		}
	}
	else {
		return '<result>false</result><content>Invalid product.</content>';
	}
}

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
	$deckXml = '<decks>';
	
	$sql = 'SELECT d.deck_id, d.description, ifnull(dc.cards_in_deck, 0) cards_in_deck
		  FROM decks d
			   LEFT OUTER JOIN (SELECT count(card_id) cards_in_deck, deck_id
								  FROM deck_cards
								GROUP BY deck_id) dc
				  ON dc.deck_id = d.deck_id
		 WHERE d.user_id = '.$user_id;
	
	$decks = myqu($sql);
	foreach ($decks as $deck) {
		$deckXml .= '<deck deck_id="'.$deck['deck_id'].'" description="'.$deck['description'].'" cards_in_deck="'.$deck['cards_in_deck'].'">';
		$deckXml .= '</deck>';
	}
	
	$deckXml .= '</decks>';
	
	return $deckXml;
}

function getCategories($parent = '') {
	$categoryXml = '<categories>';
	
	$sql = 'SELECT c.category_id, c.description, (case when count(cd.card_id) = 0 then "false" else "true" end) as hascards
			  FROM categories c
				   left OUTER JOIN cards cd ON cd.category_id = c.category_id
			 WHERE '.(($parent == '' || $parent == null) ? 'c.category_parent is null' : 'c.category_parent = '.$parent).
			' GROUP BY c.category_id';
	
	$categories = myqu($sql);
	foreach ($categories as $category) {
		$categoryXml .= '<category category_id="'.$category['category_id'].'" description="'.$category['description'].'" hascards="'.$category['hascards'].'">';
		$categoryXml .= '</category>';
	}
	
	$categoryXml .= '</categories>';
	
	return $categoryXml;
}

function getProducts() {
	$productXml = '<products>';
	
	$sql = 'SELECT p.product_id, p.price, p.description
			  FROM products p
			  ORDER BY p.description';
	
	$products = myqu($sql);
	foreach ($products as $product) {
		$productXml .= '<product product_id="'.$product['product_id'].'" price="'.$product['price'].'" description="'.$product['description'].'">';
		$productXml .= '</product>';
	}
	
	$productXml .= '</products>';
	
	return $productXml;
}

function getDeckCards($deck_id) {
	$categoryXml = '<cards>';
	
	$sql = 'SELECT c.card_id, c.name
		  FROM deck_cards dc INNER JOIN cards c ON c.card_id = dc.card_id
		 WHERE dc.deck_id = '.$deck_id;
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$categoryXml .= '<card card_id="'.$card['card_id'].'" name="'.$card['name'].'">';
		$categoryXml .= '</card>';
	}
	
	$categoryXml .= '</cards>';
	
	return $categoryXml;
}

function getUserCardsNotInDeck($user_id, $deck_id) {
	$cardXml = '<cards>';
	
	$sql = 'SELECT DISTINCT c.card_id, c.name
		  FROM cards c INNER JOIN user_cards uc ON c.card_id = uc.card_id
		 WHERE uc.user_id = '.$user_id.'
			   AND c.card_id NOT IN (SELECT card_id
									   FROM deck_cards
									  WHERE deck_id = '.$deck_id.')';
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$cardXml .= '<card card_id="'.$card['card_id'].'" name="'.$card['name'].'">';
		$cardXml .= '</card>';
	}
	
	$cardXml .= '</cards>';
	
	return $cardXml;
}

function getUserAlbumCards($category, $user_id) {
	$cardXml = '<cards>';
	
	$sql = 'SELECT c.card_id,
				   c.name,
				   c.description,
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
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$cardXml .= '<card card_id="'.$card['card_id'].'" name="'.$card['name'].'" description="'.$card['description'].'" owned="'.$card['owned'].'">';
		$cardXml .= '</card>';
	}
	
	$cardXml .= '</cards>';
	
	return $cardXml;
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
		
		return '<result>true</result><content>'.$cardName.' scrapped! You gained '.$scrapValue.' parts!</content>';
	}
	else {
		return '<result>false</result><content>Failed to scrap car. Card not found.</content>';
	}
}

function close($retXml) {
	$retXml .= '</output>';

	header('xml_length: '.strlen($retXml));
	echo $retXml;
	exit;
}

?>
<?php

function buyBooster($user_id, $product_id) {
	global $MAXIMUM_PROBABILITY;
	global $MINIMUM_PROBABILITY;
	global $CARDSTATUS_ALBUM;
	
	// This encapsulates the functionality of buying a booster.
	// It will randomly select cards from the booster, based on their probabilities, and add them to the user's account.
	
	// Select all the cards in the booster, along with their rarities.
	$sql = 'SELECT c.card_id, r.rarity_id, r.probability
		  FROM product_cards pc
			   INNER JOIN cards c ON c.card_id = pc.card_id
			   INNER JOIN rarities r ON r.rarity_id = c.rarity
		 WHERE pc.product_id = '.$product_id.'
		ORDER BY r.probability ASC';
	$result = myqu($sql);
	
	// Build a list of probabilities, which each have a list of the cards they fall under. 
	// The rarities should be sorted from least to most common.
	$rarities = array();
	$rarityCards;
	$currentRarity = null;
	$currentRarityId = '';
	$first = true;
	foreach ($result as $card) {
		if ($currentRarityId != $card['rarity_id']) {
			if (!$first) {
				$currentRarity['cards'] = $rarityCards;
				array_push($rarities, $currentRarity);
			}
			
			$first = false;
			$currentRarity = array();
			$currentRarityId = $card['rarity_id'];
			$currentRarity['rarity_id'] = $currentRarityId;
			$currentRarity['probability'] = $card['probability'];
			$rarityCards = array();
		}
		array_push($rarityCards, $card['card_id']);
	}
	if ($currentRarity != null) {
		$currentRarity['cards'] = $rarityCards;
		array_push($rarities, $currentRarity);
	}
	
	// Get the amount of cards in the booster.
	$sql = 'SELECT p.pack_size
		  FROM products p
		 WHERE p.product_id = '.$product_id;
	$result = myqu($sql);
	$packSize = $result[0]['pack_size'];
	
	for ($i = 0; $i < $packSize; $i++) {
		// For each card in the booster, generate a random probability, and get the top rarity based on that.
		$randomNumber = rand($MINIMUM_PROBABILITY, $MAXIMUM_PROBABILITY);
		$rarity = null;
		for ($j = 0; $j < count($rarities); $j++) {
			if ($rarities[$j]['probability'] >= $randomNumber) {
				$rarity = $rarities[$j];
				break;
			}
		}
		
		// Then randomly get a card from that rarity and give it to the user.
		if ($rarity != null) {
			$cards = $rarity['cards'];
			$cardId = $cards[rand(0, count($cards) - 1)];
			
			$sql = 'INSERT INTO user_cards(user_id,
                       card_id,
                       user_card_status,
                       date_created)
				   SELECT 1,
						  '.$cardId.',
						  card_status_id,
						  now()
					 FROM card_statuses
					WHERE description = "'.$CARDSTATUS_ALBUM.'"';
			myqu($sql);
		}
	}
	
	// Return success xml.
	return '<result>true</result><content>Purchase success!</content>';
}

?>
<?php

function newGame($user_id, $deck_id) {
	// Declare the global constants
	global $DECK_MAXIMUMCARDS;

	// Check that the deck is valid
	$sql = 'select count(card_id) cardsindeck from deck_cards where deck_id = '.$deck_id;
	
	$results = myqu($sql);
	if ($result=$results[0]) {
		// Check if the cards in the deck are at the required size for a game deck
		if ($result['cardsindeck'] != $DECK_MAXIMUMCARDS) {
			// If the deck doesnt have enough cards, return unhappy xml.
			return '<result>false</result><content>Invalid deck.</content>';
		}
	}
	
	// Check if this user already has an incomplete game
	$sql = 'select g.game_id, gp.game_player_id
		from games g
		join game_statuses gs 
		on gs.game_status_id = g.game_status
		join game_players gp
		on gp.game_id = g.game_id
		where gs.description != "complete"
		and user_id = '.$user_id;
		
	$results = myqu($sql);
	
	// If they do have an open incomplete game, update the last check date and return the game xml
	if ($result=$results[0]) {
		$sql = 'update game_players set last_check = now() where game_player_id = '.$result['game_player_id'];
		
		myqu($sql);
		
		return getGameXML($user_id, $result['game_id']);
	}
	
	// If they dont have an open game, check if there is an LFM game.
	$sql = 'select g.game_id
		from games g
		join game_statuses gs 
		on gs.game_status_id = g.game_status
		where gs.description = "LFM"
		and g.creator_id != '.$user_id;
		
	$results = myqu($sql);
	$game_id = -1;
	$joinedGame = false;
	
	// If there is an open game, set the game_id
	if ($result=$results[0]) {
		$game_id = $result["game_id"];
		
		$joinedGame = true;
	}
	
	// If there isnt an open LFM game, create one
	if (!$joinedGame) {
		$sql = 'insert into games (game_status, creator_id)
			select game_status_id , '.$user_id.'
			from game_statuses 
			where description = "LFM"';
		myqu($sql);
		
		// Get the game_id
		$sql = 'select g.game_id 
			from games g
			join game_statuses gs
			on g.game_status = gs.game_status_id
			where g.creator_id = '.$user_id.' 
			and gs.description = "LFM"';
		$results = myqu($sql);
		
		if ($result=$results[0]) {
			$game_id = $result["game_id"];
		}
		else {
			return '<result>false</result><content>Error creating game.</content>';
		}
	}
	
	// Add the user to the game_players table
	$gamePlayerId = createGamePlayer($user_id, $game_id);
	
	// Add the user's cards
	addGamePlayerCards($game_id, $gamePlayerId, $deck_id);
	
	// If a game was joined, set the active player and update the game status
	if ($joinedGame) {
		// Get the players
		$sql = 'select gp.game_player_id
			from game_players gp
			where game_id = 1';
		
		$results = myqu($sql);
		
		// Pick a random one
		$activePlayerIndex = rand(0, (count($results) - 1));
		$activeGamePlayerId;
		
		if ($result=$results[$activePlayerIndex]) {
			$activeGamePlayerId = $result["game_player_id"];
		}
		else {
			$result = $results[0];
			$activeGamePlayerId = $result["game_player_id"];
		}
		
		// Update the game with the active player and set it's status to "inprogress"
		$sql = 'update games g
			set g.game_status = (select gs.game_status_id from game_statuses gs where gs.description = "inprogress"),
			g.active_player = '.$activeGamePlayerId.' 
			where g.game_id = '.$game_id;
		
		myqu($sql);
	}
	
	// Return game XML
	return getGameXML($user_id, $game_id);
}

/**
* Inserts a user into the game_players table. Returns their game_player_id, or -1 if there was an issue inserting.
*/
function createGamePlayer($user_id, $game_id) {
	$sql = 'insert into game_players(game_id, user_id, last_check) values ('.$game_id.', '.$user_id.', now())';
	
	myqu($sql);
	
	$sql = 'select game_player_id from game_players where game_id = '.$game_id.' and user_id = '.$user_id;
	
	$results = myqu($sql);
	
	if ($result=$results[0]) {
		return $result["game_player_id"];
	}
	else {
		return -1;
	}
}

function addGamePlayerCards($game_id, $game_player_id, $deck_id) {
	// Select all the cards in the user's deck
	$sql = 'select card_id from deck_cards where deck_id = '.$deck_id;
	
	$cards = myqu($sql);
	
	// The index will start at 0;
	$index = 0;
	
	// Add them to the game_cards table for their owner, in a random order
	while (count($cards) > 0) {
		$randomCardIndex = rand(0, (count($cards) - 1));
		$randomCard = $cards[$randomCardIndex];
		
		$sql = 'insert into game_cards (game_player_id, card_id, game_id, `index`) 
			values ('.$game_player_id.', '.$randomCard['card_id'].', '.$game_id.', '.$index.')';
		
		myqu($sql);
		
		unset($cards[$randomCardIndex]);
		
		$cards = array_values($cards);
		
		// Increment the index
		$index++;
	}
}

function selectStat($game_id, $user_id, $stat_id) {
	// Check that the right user is making the move
	
	// If the incorrect user made the move, send response saying so
	
	// Select to cards and their values for the stat
	
	// If we get results, process them, otherwise return invalid stat selection
	
		// Check which stat is the winner and update game cards accordingly
		
		// Add an entry to game moves
		
		// Return current game state xml
	
	// Return invalid stat selection
}

function getGameXML($user_id, $game_id) {
	return '<result>false</result><content>GAME XML.</content>';
}

?>
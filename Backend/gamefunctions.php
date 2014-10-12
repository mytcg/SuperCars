<?php

function newGame($user_id, $deck_id, $computer = 'false') {
	// Declare the global constants
	global $DECK_MAXIMUMCARDS;

	// Check that the deck is valid
	$sql = 'select count(card_id) cardsindeck from deck_cards where deck_id = '.$deck_id;
	
	$results = myqu($sql);
	if ($result=$results[0]) {
		// Check if the cards in the deck are at the required size for a game deck
		if ($result['cardsindeck'] != $DECK_MAXIMUMCARDS) {
			// If the deck doesnt have enough cards, return unhappy result.
			return array(
				'result'    =>  false
				,'content'  =>  'Invalid deck.'
			);
		}
	}
	else {
		// If the deck did not exist, return unhappy result.
		return array(
			'result'    =>  false
			,'content'  =>  'Invalid deck.'
		);
	}
	
	// Commenting the below out for now. 
	/*
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
	
	// If they do have an open incomplete game, return the game xml
	if ($result=$results[0]) {
		return getGameData($user_id, $result['game_id']);
	}*/
	
	$game_id = -1;
	$joinedGame = false;
	
	// If the user is wanting to play against the AI, skip the check for an open game.
	if ($computer == "false") {
		// Check if this user already has an lfm game
		$sql = 'select g.game_id
			from games g
			join game_statuses gs 
			on gs.game_status_id = g.game_status
			where gs.description = "LFM"
			and g.creator_id = '.$user_id;
			
		$results = myqu($sql);
		
		// If they do have an open lfm game, return the game xml
		if ($result=$results[0]) {
			return getGameData($user_id, $result['game_id'], 'new');
		}
		
		// If they dont have an open game, check if there is an LFM game.
		$sql = 'select g.game_id
			from games g
			join game_statuses gs 
			on gs.game_status_id = g.game_status
			where gs.description = "LFM"
			and g.creator_id != '.$user_id;
			
		$results = myqu($sql);
		
		// If there is an open game, set the game_id
		if ($result=$results[0]) {
			$game_id = $result["game_id"];
			
			$joinedGame = true;
		}
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
			return array(
				'result'    =>  false
				,'content'  =>  'Error creating game.'
			);
		}
		
		// If playing against the AI, create the AI player here, and give it cards.
		if ($computer == "true") {
			// select an AI player at random, and a deck for them
			$aiResult = myqu('select count(dc.card_id) tot, d.deck_id, u.user_id
				from decks d
				join deck_cards dc
				on dc.deck_id = d.deck_id
				join users u
				on u.user_id = d.user_id
				where u.ai = 1
				group by d.deck_id
				having count(dc.card_id) = '.$DECK_MAXIMUMCARDS);
				
			$aiDetails = $aiResult[rand(0, count($aiResult) - 1)];
			
			// create the game player
			$aiPlayerId = createGamePlayer($aiDetails['user_id'], $game_id);
			
			// add their cards
			addGamePlayerCards($game_id, $aiPlayerId, $aiDetails['deck_id']);
			
			$joinedGame = true;
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
			where game_id = '.$game_id;
		
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
	
	// Return game data
	return getGameData($user_id, $game_id, 'new');
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
	global $GAMECARDSTATUS_NORMAL;
	
	// Select all the cards in the user's deck
	$sql = 'select card_id from deck_cards where deck_id = '.$deck_id;
	
	$cards = myqu($sql);
	
	// The index will start at 0;
	$index = 0;
	
	// Add them to the game_cards table for their owner, in a random order
	while (count($cards) > 0) {
		$randomCardIndex = rand(0, (count($cards) - 1));
		$randomCard = $cards[$randomCardIndex];
		
		$sql = 'insert into game_cards (game_player_id, card_id, game_id, `index`, game_card_status) 
			select '.$game_player_id.', '.$randomCard['card_id'].', '.$game_id.', '.$index.', gcs.game_card_status_id
			from game_card_statuses gcs
			where gcs.description = "'.$GAMECARDSTATUS_NORMAL.'"';
		
		myqu($sql);
		
		unset($cards[$randomCardIndex]);
		
		$cards = array_values($cards);
		
		// Increment the index
		$index++;
	}
}

function checkGame($user_id, $game_id) {
	// Get the status, active player, and whether the active player is AI or not.
	$sql = 'select gs.description game_status, u.ai, u.user_id
		from games g
		join game_statuses gs
		on gs.game_status_id = g.game_status
		join game_players gp
		on gp.game_player_id = g.active_player
		join users u
		on u.user_id = gp.user_id
		where g.game_id = '.$game_id;
		
	$sqlResult = myqu($sql);
	
	if ($gameData = $sqlResult[0]) {
		// If the active player is AI, have them select a stat.
		if ($gameData['ai'] == 1) {
			// Get all the stat ids from the database, then choose one at random.
			$statTypes = myqu('select stat_type_id from stat_types');
			
			// Get the random stat
			$aiStat = $statTypes[rand(0, count($statTypes) - 1)];
			
			// Call selectStat with the AI details, opting not to return data for the AI
			selectStat($game_id, $gameData['user_id'], $aiStat['stat_type_id'], false);
		}
		
		// Then return that game data
		return getGameData($user_id, $game_id);
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'Invalid game!'
			);
	}
}

function selectStat($game_id, $user_id, $stat_id, $returnGameData = true) {
	global $GAMESTATUS_INPROGRESS;
	global $GAMESTATUS_COMPLETE;
	
	global $GAMECARDSTATUS_NORMAL;
	global $GAMECARDSTATUS_LIMBO;

	// Select the current game state to make sure that it is in progress and it exists
	$sql = 'select gs.description game_status, gp.user_id as active_player 
		from games g
		join game_statuses gs
		on gs.game_status_id = g.game_status
		join game_players gp
		on gp.game_player_id = g.active_player
		where g.game_id = '.$game_id;
		
	$sqlResult = myqu($sql);
	
	if ($gameData = $sqlResult[0]) {
		if ($gameData['game_status'] != $GAMESTATUS_INPROGRESS) {
			// Check that the game is in the correct state
			return array(
					'result'    =>  false
					,'content'  =>  'Invalid game state.'
				);
		}
		else if ($gameData['active_player'] != $user_id) {
			// If the incorrect user made the move, send response saying so
			return array(
					'result'    =>  false
					,'content'  =>  'You are not the active player.'
				);
		}
		else {
			// Select the cards and their values for the stat
			$sql = 'select gs.description game_status, g.active_player, 
				gp.game_player_id, gc.game_card_id, gc.card_id, cs.value
				from games g
				join game_statuses gs
				on gs.game_status_id = g.game_status
				join game_players gp
				on gp.game_id = g.game_id
				join game_cards gc
				on gc.game_player_id = gp.game_player_id
				join (select min(gc.`index`) `index`, gp.user_id, gc.game_player_id
				from game_cards gc
				join game_players gp 
				on gp.game_player_id = gc.game_player_id
				join game_card_statuses gcs
				on gcs.game_card_status_id = gc.game_card_status
				where gc.game_id = '.$game_id.'
				and gcs.description = "'.$GAMECARDSTATUS_NORMAL.'"
				group by gc.game_player_id) userData
				on userData.game_player_id = gp.game_player_id
				join card_stats cs
				on cs.card_id = gc.card_id
				where g.game_id = '.$game_id.' 
				and cs.stat_id = '.$stat_id.' 
				and gc.`index` = userData.`index`
				group by gp.game_player_id';
				
			$sqlResult = myqu($sql);
			
			// If we get results, process them, otherwise return invalid stat selection
			if (count($sqlResult) == 2) {
				$card1 = $sqlResult[0];
				$card2 = $sqlResult[1];
				
				/*echo '$sqlResult: '.print_r($sqlResult);
				echo '$card1: '.print_r($card1);
				echo '$card2: '.print_r($card2);*/
				
				$draw = false;
				$winningPlayer = 0;
				
				$winningCard = 0;
				$losingCard = 0;
				// Check if it is a draw
				if ($card1['value'] == $card2['value']) {
					$draw = true;
					// In case of a draw, set both cards to be in limbo
					foreach ($sqlResult as $tempCard) {
						$sql = 'update game_cards gc 
							set gc.game_card_status = (select gcs.game_card_status_id 
							from game_card_statuses gcs where gcs.description = "'.$GAMECARDSTATUS_LIMBO.'")
							where gc.game_card_id = '.$tempCard['game_card_id'];
						
						myqu($sql);
					}
					$winningCard = $card1['game_card_id'];
					$losingCard = $card2['game_card_id'];
				}
				else {
					// Check which stat is the winner and update game cards accordingly
					$winnerIndex = ($card1['value'] > $card2['value'] ? 0 : 1);
					$winningPlayer = $sqlResult[$winnerIndex]['game_player_id'];
					
					$winningCard = $sqlResult[$winnerIndex]['game_card_id'];
					$losingCard = $sqlResult[1-$winnerIndex]['game_card_id'];
					
					// Get the winners highest card index
					$sql = 'select MAX(gc.`index`) as "index"
						from game_cards gc
						where gc.game_player_id = '.$winningPlayer;
					
					$indexResult = myqu($sql);
					
					$index = $indexResult[0]['index'];
					$index++;
					
					// Select any cards that are currently in limbo
					$sql = 'select gc.game_card_id
						from game_cards gc
						join game_card_statuses gcs
						on gcs.game_card_status_id = gc.game_card_status
						where gc.game_id = '.$game_id.'
						and gcs.description = "'.$GAMECARDSTATUS_LIMBO.'" order by gc.`index`';
						
					$limboResult = myqu($sql);
					
					// Update each limbo card to now be in the winner's pile
					foreach ($limboResult as $limboCard) {
						myqu('update game_cards gc 
							set gc.game_card_status = (select gcs.game_card_status_id 
							from game_card_statuses gcs where gcs.description = "'.$GAMECARDSTATUS_NORMAL.'"),
							gc.`index` = '.$index.', gc.game_player_id = '.$winningPlayer.'
							where gc.game_card_id = '.$limboCard['game_card_id']);
						
						$index++;
					}
					
					// Update each of the cards that were just played
					foreach ($sqlResult as $tempCard) {
						myqu('update game_cards gc 
							set gc.`index` = '.$index.', gc.game_player_id = '.$winningPlayer.'
							where gc.game_card_id = '.$tempCard['game_card_id']);
						
						$index++;
					}
					
					// Set the new active player
					myqu('update games g set g.active_player = '.$winningPlayer.' where g.game_id = '.$game_id);
				}
				
				// Add an entry to game moves
				myqu('insert into game_moves (game_id, winner, stat_id, date_created, winning_card, losing_card) 
					values ('.$game_id.', '.$winningPlayer.', '.$stat_id.', now(), '.$winningCard.', '.$losingCard.')');
				
				// Check if the game is over, and update it of that is the case
				$remainingResult = myqu('select count(gc.game_card_id) cards_left, gc.game_player_id
					from game_cards gc
					join game_card_statuses gcs 
					on gcs.game_card_status_id = gc.game_card_status
					where gcs.description = "'.$GAMECARDSTATUS_NORMAL.'"
					and gc.game_id = '.$game_id.'
					group by gc.game_player_id');
				
				if (count($remainingResult) < 2) {
					// The game is over. Update it's status.
					myqu('update games 
						set game_status = (select gs.game_status_id 
						from game_statuses gs where gs.description = "'.$GAMESTATUS_COMPLETE.'")
						where game_id = '.$game_id);
					
					// Select the winner and loser data so we can adjsut their rankings.
					$resultData = myqu('select gp.user_id, count(gc.game_card_id) as cards, u.ranking
						from game_players gp
						join game_cards gc 
						on gc.game_player_id = gp.game_player_id
						join users u on u.user_id = gp.user_id
						where gp.game_id = '.$game_id.' 
						group by gp.game_player_id
						order by cards desc');
					
					if (count($resultData) == 2) {
						global $BASE_RANK_CHANGE;
						$rankChange = $BASE_RANK_CHANGE;
						
						$winnerData = $resultData[0];
						$loserData = $resultData[1];
						
						// Work out the ranking adjustment.
						$diff = $loserData['ranking'] - $winnerData['ranking'];
						if ($diff > 0) {
							$rankChange += intval($diff / 25);
						}
						
						// When we have the rank change amount, do the updates
						myqu('update users set ranking = ranking + '.$rankChange.' where user_id = '.$winnerData['user_id']);
						myqu('update users set ranking = ranking - '.$rankChange.' where user_id = '.$loserData['user_id']);
					}
				}
				
				// Return current game state xml
				if ($returnGameData) {
					return getGameData($user_id, $game_id);
				}
				else {
					return;
				}
			}
			else {
				// Return invalid stat selection
				return array(
						'result'    =>  false
						,'content'  =>  'Invalid stat selection.'
					);
			}
		}
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'Invalid game!'
			);
	}
}

function getGameData($user_id, $game_id, $new_or_old = 'old') {
	global $GAMESTATUS_LFM;
	global $GAMESTATUS_INPROGRESS;
	global $GAMESTATUS_COMPLETE;
	
	global $GAMECARDSTATUS_NORMAL;
	global $GAMECARDSTATUS_LIMBO;

	// Select last check date + other core game data.
	$sqlResult = myqu('select active.user_id as active_player, user_data.game_player_id, gs.description,
		case when max(gm.date_created) > user_data.last_check then "true" else "false" end as moved,
		user_data.cards user_cards, opp_data.cards opp_cards
				from games g
				join game_statuses gs
				on gs.game_status_id = g.game_status
				left outer join game_moves gm
				on gm.game_id = g.game_id
				left outer join (select gp1.game_player_id, count(gc.game_card_id) cards, gp1.game_id, gp1.user_id, gp1.last_check
					from game_players gp1
					join game_cards gc
					on gc.game_player_id = gp1.game_player_id
					where gp1.user_id = '.$user_id.'
					group by gp1.game_player_id) user_data
				on user_data.game_id = g.game_id
				left outer join (select gp1.game_player_id, count(gc.game_card_id) cards, gp1.game_id, gp1.user_id, gp1.last_check
					from game_players gp1
					join game_cards gc
					on gc.game_player_id = gp1.game_player_id
					where gp1.user_id != '.$user_id.'
					group by gp1.game_player_id) opp_data
				on g.game_id = opp_data.game_id
				left outer join game_players active
				on active.game_player_id = g.active_player
				where g.game_id = '.$game_id.' 
				group by g.game_id');
		
	if ($gameData = $sqlResult[0]) {
		$retArray = array();
	
		// Update the user's last_check date
		myqu('update game_players set last_check = now() where game_player_id = '.$gameData['game_player_id']);
		
		// Check if there was a move since the user's last check
		if ($gameData['moved'] == 'true') {
			
			$sqlResult = myqu('select gp.user_id winner, gm.stat_id, winner.card_id winning_card, loser.card_id losing_card
				from game_moves gm 
				join game_cards winner
				on winner.game_card_id = gm.winning_card
				join game_cards loser
				on loser.game_card_id = gm.losing_card
				join game_players gp
				on gp.game_player_id = gm.winner
				where gm.game_id = '.$game_id.'
				order by gm.date_created desc
				limit 1');
				
			$moveData = $sqlResult[0];
				
			$retArray['moveData'] = array(
					'winner' => $moveData['winner'],
					'stat_id' => $moveData['stat_id'],
					'winning_card' => $moveData['winning_card'],
					'losing_card' => $moveData['losing_card']
			);
		}
		
		// Get the top card for each player
		$sqlResult = myqu('select gc.card_id, userData.`index`, userData.user_id
			from game_cards gc
			join (select min(gc.`index`) `index`, gp.user_id, gc.game_player_id
			from game_cards gc
			join game_players gp 
			on gp.game_player_id = gc.game_player_id
			join game_card_statuses gcs
			on gcs.game_card_status_id = gc.game_card_status
			where gc.game_id = '.$game_id.'
			and gcs.description = "'.$GAMECARDSTATUS_NORMAL.'"
			group by gc.game_player_id) userData
			on userData.game_player_id = gc.game_player_id
			where gc.`index` = userData.`index`');
			
		foreach ($sqlResult as $topcard) {
			if ($topcard['user_id'] == $user_id) {
				$retArray['card_id_user'] = $topcard['card_id'];
			}
			else {
				$retArray['card_id_opponent'] = $topcard['card_id'];
			}
		}
		
		// Return the active player, both top cards, and the current scores.
		$retArray['game_id'] = $game_id;
		$retArray['user_score'] = $gameData['user_cards'];
		$retArray['opponent_score'] = $gameData['opp_cards'];
		$retArray['moved'] = $gameData['moved'];
		$retArray['active_player'] = $gameData['active_player'];
		$retArray['new_or_old'] = $new_or_old;
		$retArray['game_status'] = $gameData['description'];
		
		return $retArray;
	}
	else {
		return array(
				'result'    =>  false
				,'content'  =>  'Invalid game.'
			);
	}
}

function gameInProgress($user_id) {
	global $GAMESTATUS_COMPLETE;
	$sqlResult = myqu('select g.game_id
		from games g
		join game_players gp
		on gp.game_id = g.game_id
		join game_statuses gs 
		on gs.game_status_id = g.game_status
		where gs.description != "'.$GAMESTATUS_COMPLETE.'"
		and gp.user_id = '.$user_id);
	
	if ($gameData = $sqlResult[0]) {
		return array(
				'in_game'    =>  true
				,'game_id'  =>  $gameData['game_id']
			);
	}
	else {
		return array(
				'in_game'    =>  false
			);
	}
}

?>
-- --------------------------------------------------------
-- Host:                         sql10.jnb1.host-h.net
-- Server version:               5.5.38-0+wheezy1 - (Debian)
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             8.3.0.4694
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table supercars_db.cards
CREATE TABLE IF NOT EXISTS `cards` (
  `card_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) DEFAULT NULL,
  `description` varchar(80) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `scrap_value` int(11) DEFAULT '0',
  `parts_cost` int(11) DEFAULT '0',
  `rarity` int(11) DEFAULT NULL,
  PRIMARY KEY (`card_id`),
  KEY `card_category_fk` (`category_id`),
  KEY `card_rarity_id` (`rarity`),
  CONSTRAINT `card_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `card_rarity_id` FOREIGN KEY (`rarity`) REFERENCES `rarities` (`rarity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.card_stats
CREATE TABLE IF NOT EXISTS `card_stats` (
  `card_id` int(11) NOT NULL,
  `stat_id` int(11) NOT NULL,
  `value` int(11) NOT NULL DEFAULT '0',
  `display_value` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`card_id`,`stat_id`),
  KEY `card_stat_stat_id` (`stat_id`),
  CONSTRAINT `card_stat_card_fk` FOREIGN KEY (`card_id`) REFERENCES `cards` (`card_id`),
  CONSTRAINT `card_stat_stat_id` FOREIGN KEY (`stat_id`) REFERENCES `stat_types` (`stat_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.card_statuses
CREATE TABLE IF NOT EXISTS `card_statuses` (
  `card_status_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`card_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.card_statuses: ~2 rows (approximately)
/*!40000 ALTER TABLE `card_statuses` DISABLE KEYS */;
INSERT IGNORE INTO `card_statuses` (`card_status_id`, `description`) VALUES
	(1, 'album'),
	(2, 'scrap');
/*!40000 ALTER TABLE `card_statuses` ENABLE KEYS */;


-- Dumping structure for table supercars_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) DEFAULT NULL,
  `category_parent` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `category_parent_fk` (`category_parent`),
  CONSTRAINT `category_parent_fk` FOREIGN KEY (`category_parent`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.decks
CREATE TABLE IF NOT EXISTS `decks` (
  `deck_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(20) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`deck_id`),
  KEY `deck_user_fk` (`user_id`),
  CONSTRAINT `deck_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;



-- Dumping structure for table supercars_db.deck_cards
CREATE TABLE IF NOT EXISTS `deck_cards` (
  `deck_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  PRIMARY KEY (`deck_id`,`card_id`),
  KEY `deckcard_card_fk` (`card_id`),
  CONSTRAINT `deckcard_card_fk` FOREIGN KEY (`card_id`) REFERENCES `cards` (`card_id`),
  CONSTRAINT `deckcard_deck_fk` FOREIGN KEY (`deck_id`) REFERENCES `decks` (`deck_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



-- Dumping structure for table supercars_db.games
CREATE TABLE IF NOT EXISTS `games` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_status` int(11) NOT NULL,
  `active_player` int(11) DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`game_id`),
  KEY `game_status_fk` (`game_status`),
  KEY `game_activeplayer_fk` (`active_player`),
  KEY `game_creator_fk` (`creator_id`),
  CONSTRAINT `game_creator_fk` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `game_activeplayer_fk` FOREIGN KEY (`active_player`) REFERENCES `game_players` (`game_player_id`),
  CONSTRAINT `game_status_fk` FOREIGN KEY (`game_status`) REFERENCES `game_statuses` (`game_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.games: ~0 rows (approximately)
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
/*!40000 ALTER TABLE `games` ENABLE KEYS */;


-- Dumping structure for table supercars_db.game_cards
CREATE TABLE IF NOT EXISTS `game_cards` (
  `game_card_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_player_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `index` int(11) DEFAULT '0',
  PRIMARY KEY (`game_card_id`),
  KEY `gamecard_game_fk` (`game_id`),
  KEY `gamecard_player_fk` (`game_player_id`),
  KEY `gamecard_card_fk` (`card_id`),
  CONSTRAINT `gamecard_game_fk` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`),
  CONSTRAINT `gamecard_player_fk` FOREIGN KEY (`game_player_id`) REFERENCES `game_players` (`game_player_id`),
  CONSTRAINT `gamecard_card_fk` FOREIGN KEY (`card_id`) REFERENCES `cards` (`card_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.game_cards: ~0 rows (approximately)
/*!40000 ALTER TABLE `game_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `game_cards` ENABLE KEYS */;


-- Dumping structure for table supercars_db.game_moves
CREATE TABLE IF NOT EXISTS `game_moves` (
  `game_move_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `winner` int(11) DEFAULT NULL,
  `stat_id` int(11) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  PRIMARY KEY (`game_move_id`),
  KEY `gamemoves_game_fk` (`game_id`),
  KEY `gamemoves_stat_fk` (`stat_id`),
  KEY `gamemoved_winner_fk` (`winner`),
  CONSTRAINT `gamemoved_winner_fk` FOREIGN KEY (`winner`) REFERENCES `game_players` (`game_player_id`),
  CONSTRAINT `gamemoves_game_fk` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`),
  CONSTRAINT `gamemoves_stat_fk` FOREIGN KEY (`stat_id`) REFERENCES `stat_types` (`stat_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.game_moves: ~0 rows (approximately)
/*!40000 ALTER TABLE `game_moves` DISABLE KEYS */;
/*!40000 ALTER TABLE `game_moves` ENABLE KEYS */;


-- Dumping structure for table supercars_db.game_players
CREATE TABLE IF NOT EXISTS `game_players` (
  `game_player_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `last_check` datetime DEFAULT NULL,
  PRIMARY KEY (`game_player_id`),
  KEY `gameplayer_game_fk` (`game_id`),
  KEY `gameplayer_user_fk` (`user_id`),
  CONSTRAINT `gameplayer_game_fk` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`),
  CONSTRAINT `gameplayer_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.game_players: ~0 rows (approximately)
/*!40000 ALTER TABLE `game_players` DISABLE KEYS */;
/*!40000 ALTER TABLE `game_players` ENABLE KEYS */;


-- Dumping structure for table supercars_db.game_statuses
CREATE TABLE IF NOT EXISTS `game_statuses` (
  `game_status_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`game_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.game_statuses: ~3 rows (approximately)
/*!40000 ALTER TABLE `game_statuses` DISABLE KEYS */;
INSERT IGNORE INTO `game_statuses` (`game_status_id`, `description`) VALUES
	(1, 'lfm'),
	(2, 'inprogress'),
	(3, 'complete');
/*!40000 ALTER TABLE `game_statuses` ENABLE KEYS */;


-- Dumping structure for table supercars_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) DEFAULT NULL,
  `product_type_id` int(11) NOT NULL,
  `price` int(11) DEFAULT NULL,
  `pack_size` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`product_id`),
  KEY `product_type_fk` (`product_type_id`),
  CONSTRAINT `product_type_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_types` (`product_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.product_cards
CREATE TABLE IF NOT EXISTS `product_cards` (
  `product_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  PRIMARY KEY (`product_id`,`card_id`),
  KEY `productcard_card_fk` (`card_id`),
  CONSTRAINT `productcards_product_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `productcard_card_fk` FOREIGN KEY (`card_id`) REFERENCES `cards` (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.product_types
CREATE TABLE IF NOT EXISTS `product_types` (
  `product_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) NOT NULL,
  PRIMARY KEY (`product_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.product_types: ~1 rows (approximately)
/*!40000 ALTER TABLE `product_types` DISABLE KEYS */;
INSERT IGNORE INTO `product_types` (`product_type_id`, `description`) VALUES
	(1, 'booster');
/*!40000 ALTER TABLE `product_types` ENABLE KEYS */;


-- Dumping structure for table supercars_db.rarities
CREATE TABLE IF NOT EXISTS `rarities` (
  `rarity_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(20) DEFAULT '40',
  `probability` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`rarity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.rarities: ~2 rows (approximately)
/*!40000 ALTER TABLE `rarities` DISABLE KEYS */;
INSERT IGNORE INTO `rarities` (`rarity_id`, `description`, `probability`) VALUES
	(1, 'Common', 100),
	(2, 'Rare', 10);
/*!40000 ALTER TABLE `rarities` ENABLE KEYS */;


-- Dumping structure for table supercars_db.stat_types
CREATE TABLE IF NOT EXISTS `stat_types` (
  `stat_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`stat_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.stat_types: ~2 rows (approximately)
/*!40000 ALTER TABLE `stat_types` DISABLE KEYS */;
INSERT IGNORE INTO `stat_types` (`stat_type_id`, `description`) VALUES
	(1, 'Top Speed'),
	(2, 'Acceleration');
/*!40000 ALTER TABLE `stat_types` ENABLE KEYS */;


-- Dumping structure for table supercars_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `date_registered` datetime DEFAULT NULL,
  `credits` int(11) NOT NULL DEFAULT '0',
  `parts` int(11) NOT NULL DEFAULT '0',
  `last_request` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users.username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.users: ~4 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT IGNORE INTO `users` (`user_id`, `username`, `password`, `date_registered`, `credits`, `parts`, `last_request`) VALUES
	(1, 'james', 'password', '2014-06-22 22:20:13', 1320, 35, '2014-09-04 09:47:30');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;


-- Dumping structure for table supercars_db.user_cards
CREATE TABLE IF NOT EXISTS `user_cards` (
  `user_card_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `date_created` datetime DEFAULT NULL,
  `user_card_status` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_card_id`),
  KEY `usercard_user_fk` (`user_id`),
  KEY `usercard_card_fk` (`card_id`),
  KEY `user_card_status_fk` (`user_card_status`),
  CONSTRAINT `user_card_status_fk` FOREIGN KEY (`user_card_status`) REFERENCES `card_statuses` (`card_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=latin1;


-- Dumping structure for table supercars_db.vouchers
CREATE TABLE IF NOT EXISTS `vouchers` (
  `voucher_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(50) DEFAULT '0',
  `content_string` varchar(200) DEFAULT '0',
  `voucher_type` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`voucher_id`),
  KEY `FK__voucher_types` (`voucher_type`),
  CONSTRAINT `FK__voucher_types` FOREIGN KEY (`voucher_type`) REFERENCES `voucher_types` (`voucher_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.vouchers: ~0 rows (approximately)
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;


-- Dumping structure for table supercars_db.voucher_cards
CREATE TABLE IF NOT EXISTS `voucher_cards` (
  `voucher_card_id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  PRIMARY KEY (`voucher_card_id`),
  KEY `FK__vouchers_voucher_card` (`voucher_id`),
  KEY `FK__cards_voucher_card` (`card_id`),
  CONSTRAINT `FK__vouchers_voucher_card` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`),
  CONSTRAINT `FK__cards_voucher_card` FOREIGN KEY (`card_id`) REFERENCES `cards` (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.voucher_cards: ~0 rows (approximately)
/*!40000 ALTER TABLE `voucher_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_cards` ENABLE KEYS */;


-- Dumping structure for table supercars_db.voucher_codes
CREATE TABLE IF NOT EXISTS `voucher_codes` (
  `voucher_code_id` int(11) NOT NULL AUTO_INCREMENT,
  `redeem_code` varchar(50) NOT NULL DEFAULT '0',
  `redeem_count` int(11) NOT NULL DEFAULT '0',
  `voucher_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`voucher_code_id`),
  UNIQUE KEY `Index 2` (`redeem_code`),
  KEY `FK__vouchers` (`voucher_id`),
  CONSTRAINT `FK__vouchers` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.voucher_codes: ~0 rows (approximately)
/*!40000 ALTER TABLE `voucher_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_codes` ENABLE KEYS */;


-- Dumping structure for table supercars_db.voucher_credits
CREATE TABLE IF NOT EXISTS `voucher_credits` (
  `voucher_credits_id` int(11) NOT NULL AUTO_INCREMENT,
  `voucher_id` int(11) NOT NULL,
  `credits` int(11) DEFAULT '0',
  PRIMARY KEY (`voucher_credits_id`),
  KEY `FK__vouchers_voucher_credits` (`voucher_id`),
  CONSTRAINT `FK__vouchers_voucher_credits` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.voucher_credits: ~0 rows (approximately)
/*!40000 ALTER TABLE `voucher_credits` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_credits` ENABLE KEYS */;


-- Dumping structure for table supercars_db.voucher_types
CREATE TABLE IF NOT EXISTS `voucher_types` (
  `voucher_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`voucher_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table supercars_db.voucher_types: ~0 rows (approximately)
/*!40000 ALTER TABLE `voucher_types` DISABLE KEYS */;
INSERT IGNORE INTO `voucher_types` (`voucher_type_id`, `description`) VALUES
	(1, 'per player'),
	(2, 'once off');
/*!40000 ALTER TABLE `voucher_types` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

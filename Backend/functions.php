<?php

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

function getUserCards($category, $user_id) {
	$categoryXml = '<cards>';
	
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
					 WHERE uc.user_id = '.$user_id.' AND cs.description = "album"
					GROUP BY uc.card_id) uc
					  ON uc.card_id = c.card_id
			 WHERE c.category_id = '.$category.'
			GROUP BY c.card_id;';
	
	$cards = myqu($sql);
	foreach ($cards as $card) {
		$categoryXml .= '<card card_id="'.$card['category_id'].'" name="'.$card['name'].'" description="'.$card['description'].'" owned="'.$card['owned'].'">';
		$categoryXml .= '</card>';
	}
	
	$categoryXml .= '</cards>';
	
	return $categoryXml;
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
}

function close($retXml) {
	$retXml .= '</output>';

	header('xml_length: '.strlen($retXml));
	echo $retXml;
	exit;
}

?>
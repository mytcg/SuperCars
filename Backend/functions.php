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

function close($retXml) {
	$retXml .= '</output>';

	header('xml_length: '.strlen($retXml));
	echo $retXml;
	exit;
}

?>
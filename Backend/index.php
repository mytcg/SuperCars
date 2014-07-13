<?php

include('dbconnection.php');

function myqu($sQuery) {
	$conn = new dbconnection();
	return $conn->_myqu($sQuery);
}

date_default_timezone_set('Africa/Johannesburg');

$retXml = '<users>';
$users = myqu('SELECT * FROM users;');
foreach($users as $user) {
	$retXml .= '<user>';
	$retXml .= '<user_id>'.$user['user_id'].'</user_id>';
	$retXml .= '<username>'.$user['username'].'</username>';
	$retXml .= '<password>'.$user['password'].'</password>';
	$retXml .= '<date_registered>'.$user['date_registered'].'</date_registered>';
	$retXml .= '<credits>'.$user['credits'].'</credits>';
	$retXml .= '</user>';
}
$retXml .= '</users>';

header('xml_length: '.strlen($retXml));
echo $retXml;
exit;



?>
<?php
	$content = db_select("SELECT * FROM content 
	WHERE content_url = '".$_GET['url']."'
	AND content_status = 1
	LIMIT 0,1");
	
	$parent = db_select("SELECT * FROM content WHERE content_id = '".$content[0]['content_parent_id']."'");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title><?=$content[0]['content_meta_title']?></title>
<meta name="Keywords" content="<?=$content[0]['content_meta_keywords']?>" />
<meta name="Description" content="<?=$content[0]['content_meta_description']?>" />
<? include("includes/site-scripts.php");?>
<!-- Hook up the FlexSlider -->
<script type="text/javascript">
    $(window).load(function() {
        $('.flexslider').flexslider();
    });
</script>
</head>
<body>
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<div id="superwrapper">
  <div id="super-wrap">
    <div class="wrap">
      <? include("includes/header.php");?>
      <div class="content-wrap">
        <div class="left">
          <? include("includes/left-bar.php");?>
        </div>
        <div class="right">
         <div class="content-block" style="margin: 0px 0px 0px 0px; width: 650px">
         
          <h1><?=$content[0]['content_heading']?></h1>
			<?=$content[0]['content_long_description']?>
            
            <? include("includes/forms.inc.php");?>
            <?
            	if($_GET['url'] == 'about-us/media/news'){
					$child = db_select("SELECT * FROM content WHERE content_parent_id = '".$content[0]['content_id']."' AND content_status = 1 ORDER BY content_date_created DESC");
					for($i = 0; $i < count($child); $i++){
						$year = date("Y", strtotime($child[$i]['content_date_created']));
						if(date("Y", strtotime($child[$i]['content_date_created'])) != date("Y", strtotime($child[$i-1]['content_date_created']))){
							echo "<h2>Articles from ".$year."</h2>";	
						}
						
						?>
						<a href="<?=urlMaker($child[$i]['content_url'])?>"><?=$child[$i]['content_heading']?></a><br/>
						<?
					}
				}
				
				if($_GET['url'] == 'about-us/media/press'){
					$child = db_select("SELECT * FROM content WHERE content_parent_id = '".$content[0]['content_id']."' AND content_status = 1 ORDER BY content_date_created DESC");
					for($i = 0; $i < count($child); $i++){
						$year = date("Y", strtotime($child[$i]['content_date_created']));
						if(date("Y", strtotime($child[$i]['content_date_created'])) != date("Y", strtotime($child[$i-1]['content_date_created']))){
							echo "<h2>Press Releases from ".date("Y")."</h2>";	
						}
						
						?>
						<a href="<?=urlMaker($child[$i]['content_url'])?>"><?=$child[$i]['content_heading']?></a><br/>
						<?
					}
					
					$child = db_select("SELECT * FROM media WHERE media_type_id = '1' ORDER BY media_last_edit DESC");
					for($i = 0; $i < count($child); $i++){
						$year = date("Y", strtotime($child[$i]['media_last_edit']));
						if(date("Y", strtotime($child[$i]['media_last_edit'])) != date("Y", strtotime($child[$i-1]['media_last_edit']))){
							echo "<h2>Press Releases from ".$year."</h2>";	
						}
						
						?>
						<a href="<?=$child[$i]['media_location']?>" target="_blank"><?=$child[$i]['media_name']?></a><br/>
						<?
					}
				}
            ?>
            
          </div>
        </div>
      </div>
      <? include("includes/footer.php");?>
    </div>
  </div>
</div>
<? include("includes/footer-scripts.php");?>
</body>
</html>

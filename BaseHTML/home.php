<?php

$content = db_select("SELECT * FROM content 
	LEFT JOIN content_type ON content.content_type_id = content_type.content_type_id
	WHERE content_type.content_type_name = 'Home Page'
	AND content_status = 1");

$news = db_select("SELECT * FROM media WHERE media_type_id = 1 ORDER BY media_id ASC LIMIT 0,10");

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
          <div class="flexslider">
            <ul class="slides">
            <? $banners = db_select("SELECT * FROM media WHERE media_type_id = '2' ORDER BY media_position");
			for($b = 0; $b < count($banners); $b++){?>
              <li><a href="<?=urlMaker($banners[$b]['media_url'])?>"><img src="<?=$banners[$b]['media_location']?>"/></a></li> 
            <?  }?>
            </ul>
          </div>
         
          <div class="right-items">
            <h2>Secondhand deals</h2>
            
            <a style="text-decoration:none;" href="/products/second-hand/sporting-equipment"> <span class="top">
            Sporting Equipment
            </span><br />
            <img src="/images/layout/category/sporting-equipment.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
             <a style="text-decoration:none;" href="/products/second-hand/computers-networking"> <span class="top">
            Computers & Networking
            </span><br />
            <img src="/images/layout/category/computers.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
             <a style="text-decoration:none;" href="/products/second-hand/audio"> <span class="top">
            Audio
            </span><br />
            <img src="/images/layout/category/audio.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
             <a style="text-decoration:none;" href="/products/second-hand/gaming"> <span class="top">
            Gaming
            </span><br />
            <img src="/images/layout/category/gaming.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
             <a style="text-decoration:none;" href="/products/second-hand/household"> <span class="top">
            Household
            </span><br />
            <img src="/images/layout/category/household.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
             <a style="text-decoration:none;" href="/products/second-hand/car-accessories" style="margin-right: 0px"> <span class="top">
            Car Accessories
            </span><br />
            <img src="/images/layout/category/car.png" width="100px" height="100px"/> <span class="bot">View Products</span> </a>
            
          </div>
          <div class="right-items">
            <h2>New Goods catalogue</h2>
           <a style="text-decoration:none;" href="/products/new-goods/dj-equipment"> <span class="top">
            DJ Equipment
            </span><br />
            <img src="/images/layout/category/dj-equipment.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
           
           <a style="text-decoration:none;" href="/products/new-goods/computers-networking"> <span class="top">
            Computers & Networking
            </span><br />
            <img src="/images/layout/category/computers-2.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
            
            <a style="text-decoration:none;" href="/products/new-goods/audio"> <span class="top">
            Audio
            </span><br />
            <img src="/images/layout/category/audio-2.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
            
            <a style="text-decoration:none;" href="/products/new-goods/consumer-electronics"> <span class="top">
            Consumer Electronics
            </span><br />
            <img src="/images/layout/category/electronics.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
           
           <a style="text-decoration:none;" href="/products/new-goods/household"> <span class="top">
            Household
            </span><br />
            <img src="/images/layout/category/household-2.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
           
            <a style="text-decoration:none;" href="/products/new-goods/car-audio" style="margin-right: 0px"> <span class="top">
            Car Audio
            </span><br />
            <img src="/images/layout/category/car-audio-2.png" width="100px" height="100px"/> <span class="bot2">View Products</span> </a>
           
          </div>
          <div class="right-items-3" style="border-bottom: 2px solid #CCC">
            <h2>Press Releases</h2>
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td valign="top"><? 
				for($i = 0; $i < 5; $i++){ 
					?>
                  <a href="<?=$news[$i]['media_location']?>" target="_blank">
                  <?=$news[$i]['media_name']?>
                  </a><br />
                  <? }?></td>
                <td valign="top"><? 
				for($i = 5; $i < 11; $i++){ 
					?>
                 <a href="<?=$news[$i]['media_location']?>" target="_blank">
                  <?=$news[$i]['media_name']?>
                  </a><br />
                  <? }?></td>
              </tr>
            </table>
          </div>
          <div class="content-block">
            <?=$content[0]['content_long_description']?>
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

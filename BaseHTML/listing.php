<?php
	$content = db_select("SELECT * FROM content 
	WHERE content_url = '".$_GET['url']."'
	LIMIT 0,1");
	
	//print_r($content);
	if($_GET['l2'] == 'second-hand'){
		$ptype = "Secondhand";
		$ptype2 = "second_hand";
		$desc_class = 'desc1';
	}elseif($_GET['l2'] == 'new-goods'){
		$ptype = "New Goods";
		$ptype2 = "new_goods";
		$desc_class = 'desc2';
	}else{
		$ptype = "Just Unpacked";
		$ptype2 = "just_unpacked";
		$desc_class = 'desc2';
	}
	
	if($_GET['s'] != ''){
		$start = $_GET['s'];	
	}else{
		$start = 0;
	}
	
	$sql = '';
	if($_GET['price'] != ''){
		$price = ' AND items.price BETWEEN '.$_GET['price'].'';
	}
	if($_GET['location'] != ''){
		$price .= ' AND locations.id = '.$_GET['location'].'';
	}
	if($_GET['sort'] != ''){
		$sort = ' ORDER BY '.$_GET['sort'].'';
	}
	else{
		$sort = ' ORDER BY items.created DESC';
	}
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
<script type="text/javascript">
		function searchResults()
		{
		var s = document.getElementById('price');
		var price =  s.options[s.selectedIndex].value;
		
		var s = document.getElementById('sort');
		var sorting =  s.options[s.selectedIndex].value;
		
		var s = document.getElementById('location');
		var location =  s.options[s.selectedIndex].value;
		
		$('#rightitemslist').empty().html('<center><img src="/images/loading.gif" style="float: left; width: 100%"/></center>');
		
		
		//alert(price + sorting + location);
		<? if($ptype == 'Secondhand'){?>
		$.get("/includes/searchResults.php?sort="+sorting+"&price="+price+"&location="+location+"&s=<?=$start?>&q=<?=$query?>", function(output) {
			$('#rightitemslist').html(output);
		});
		<? }else{?>
		$.get("/includes/searchResults-new.php?sort="+sorting+"&price="+price+"&location="+location+"&s=<?=$start?>&q=<?=$query?>", function(output) {
			$('#rightitemslist').html(output);
		});
		<? }?>
		
		}
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
         <div class="content-block">
          <div class="right-inner" style="float: left; width: 650px; margin-left: 10px;">
           <small><strong>Currently browsing: </strong> <?=$ptype?></small> 
          <h1><?=$ptype?></h1>
			<?=$content[0]['content_long_description']?>
     
           
           </div>
              <div class="right-items-list"> 
				  <? 
				  $allitems = db_select("SELECT items.id FROM items 
				  LEFT JOIN stores ON stores.id = items.store_id
				   LEFT JOIN locations ON locations.id = stores.province_id 
                  WHERE items.deleted = 0 AND items.recycle_bin = 0 
                  AND items.sold = 0 AND items.".$ptype2." = 1  ".$price." ".$sort."");
				  
				  $products = db_select("SELECT items.* FROM items 
				  LEFT JOIN stores ON stores.id = items.store_id
				  LEFT JOIN locations ON locations.id = stores.province_id 
                  WHERE  items.deleted = 0 AND items.recycle_bin = 0 
                  AND items.sold = 0 AND items.".$ptype2." = 1
                   ".$price." ".$sort."
                  LIMIT ".$start.", 25"); ?>
                  
                  <div class="search-filter">
            <form method="GET" action="" name="search_filter">
            <input type="hidden" name="q" value="<?=$_GET['q']?>" />
            	Filter Results: <br />

		        <select name="price" id="price" style="float: left; margin-right: 10px;" onchange="javascript: searchResults()">
        	        <option value="">Price Range...</option>
                    <option value="1 AND 99" <? if($_GET['price'] == '1 AND 99'){echo "selected";}?>>R 1 to R99</option>
                    <option value="100 AND 499" <? if($_GET['price'] == '100 AND 499'){echo "selected";}?>>R 100 to R499</option>
                    <option value="500 AND 999" <? if($_GET['price'] == '500 AND 999'){echo "selected";}?>>R 500 to R999</option>
                    <option value="1000 AND 1999" <? if($_GET['price'] == '1000 AND 1999'){echo "selected";}?>>R 1000 to R1999</option>
                    <option value="2000 AND 100000" <? if($_GET['price'] == '2000 AND 9999999999'){echo "selected";}?>>Greater than R 2000</option>
                </select>
                 <select name = "sort" id="sort" style="float: left; margin-right: 10px;"  onchange="javascript: searchResults()">
        	        <option value="">Ordering...</option>
                   <option value="items.name ASC" <? if($_GET['sort'] == 'items.name ASC'){echo "selected";}?>>A to Z</option>
                    <option value="items.name DESC" <? if($_GET['sort'] == 'items.name DESC'){echo "selected";}?>>Z to A</option>
                    <option value="items.created DESC" <? if($_GET['sort'] == 'items.created DESC'){echo "selected";}?>>Newest to Oldest</option>
                    <option value="items.created ASC" <? if($_GET['sort'] == 'items.created ASC'){echo "selected";}?>>Oldest to Newest</option>
                    <option value="items.price ASC, items.recommended_price ASC" <? if($_GET['sort'] == 'items.price ASC, items.recommended_price ASC'){echo "selected";}?>>Low Price to High Price</option>
                    <option value="items.price DESC, items.recommended_price DESC" <? if($_GET['sort'] == 'items.price DESC, items.recommended_price DESC'){echo "selected";}?>>High Price to Low Price</option>
                </select>
                <select name="location" id="location" style="float: left" onchange="javascript: searchResults()">
        	        <option value="">Location...</option>
                    <? 
					$store = db_select("SELECT locations.* FROM stores 
					LEFT JOIN locations ON stores.province_id = locations.id
					GROUP BY locations.name
					ORDER BY locations.name ASC");
					
					foreach($store as $row){
						?>
                        <option value="<?=$row['id']?>"  <? if($_GET['location'] == $row['id']){echo "selected";}?>><?=$row['name']?></option>
                        <?
					}
					?>
                </select>
            </form>
            <p>&nbsp;</p>
            </div>
            <div class="right-items-list" id="rightitemslist"> 
                  <?
                  for($p = 0; $p < count($products); $p++){
                      $store = db_select("SELECT * FROM stores WHERE id = '".$products[$p]['store_id']."'");
                      ?>
                          <a style="text-decoration:none;" href="/product/<?=$_GET['l2']?>/<?=$products[$p]['id']?>" > 
                            <span class="top" style="float: left; width: 100%; height: 60px"><?=$products[$p]['name']?></span><br />
                            <img src="<?=productImage($products[$p]['image_thumb'],"/images/".$products[$p]['image_thumb'],"/images/layout/thumb_no_image.png")?>"/> 
                            <span class="<?=$desc_class?>"><?=priceget($products[$p]['price'],$products[$p]['recommended_price'],$store[0]['name']) ?><br />
                            <? if($store[0]['name'] == 'Head Office'){echo "Available Nationwide"; }else{ echo $store[0]['name']; }?>&nbsp;</span> 
                          </a> 
                   <? }?> 
                    <p align="right" style="clear: both">Showing: <?=($start+1)?> - <?=($start+25)?> of <?=count($allitems)?></p>
                   <div class="pagination" style="float: left; width: 100%">
                  
                   <strong>&nbsp;&nbsp;Page: </strong><?
				   $pages = ceil(count($allitems) / 25);
				   for($i = 0; $i < $pages; $i++ ){
					   $s = $i * 25;
					   if($i == 0){
						  
							if($s == $_GET['s']){
								echo "<a href='?s=".$s."' class='selected'>".($i+1)."</a>&nbsp;&nbsp;";
							}else{
								echo "<a href='?s=".$s."'>".($i+1)."</a>&nbsp;&nbsp;";
							}
							if($_GET['s'] > 125){
								echo "...&nbsp;";
							}
					   }
					   
					   if($i != 0 && ($i > (($start/25)-5)) && ($i < (($start/25)+5))){
							
							if($s == $_GET['s']){
								echo "<a href='?s=".$s."' class='selected'>".($i+1)."</a>&nbsp;&nbsp;";
							}else{
								echo "<a href='?s=".$s."'>".($i+1)."</a>&nbsp;&nbsp;";
							}
					   }
					   
					   if($i == ($pages - 1) && $i > 7){
						 	if(($_GET['s']/25) < ($pages - 5)){
								echo "...&nbsp;";
							}
							if($s == $_GET['s']){
								echo "<a href='?s=".$s."' class='selected'>".($i+1)."</a>&nbsp;&nbsp;";
							}else{
								echo "<a href='?s=".$s."'>".($i+1)."</a>&nbsp;&nbsp;";
							}
					   }
				   }
					   
				   ?>
                   </div>   
                   
                  
           <p align="right"><a href="/online-shop/buy" style="float:right"><img src="/images/layout/search-logo.png" align="right" height="50px" /></a>&nbsp;<br/>
            <br/>
            Can’t find what you’re looking for? <br/>
            Let us help you find it! </p>                                       
              </div>
          </div>
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

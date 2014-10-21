var username = window.localStorage.getItem("username");
var password = window.localStorage.getItem("password");
var email = window.localStorage.getItem("email_add");
var user_id = window.localStorage.getItem("user_id");
var user_name = window.localStorage.getItem("user_name");
var credit = window.localStorage.getItem("credit");
var parts = window.localStorage.getItem("parts");
var points = window.localStorage.getItem("points");
var cards_owned = window.localStorage.getItem("cards_owned");
var cards_total = window.localStorage.getItem("cards_total");
var urlParams = queryParameters();
var deckCardCount = 0;
var cardsToDeck = [];

var menuButton = "icon_menu.jpg";

var appendToken = '&user_id='+user_id+'&PHP_AUTH_PW='+password+'&PHP_AUTH_USER='+username;


      
jQuery(document).ready(function() {

//    $("body").queryLoader2({
//        barColor: "#6e6d73",
//        backgroundColor: "#000",
//        percentage: true,
//        barHeight: 5,
//        completeAnimation: "grow",
//        minimumTime: 10000
//    });

    $('#username').val(username);
    $('#password').val(password);
    $('#user-credits').val(credit);

    $('#page-title').html(decodeURI(urlParams.header));
    $('#page-title').addClass(decodeURI(urlParams.header_color)+'-border');

    if (urlParams.ingame!='true') {
        navHtml();
    }    
   
   //Navigation Menu Slider
    $('#nav-expander').on('click',function(e){
  		e.preventDefault();
  		$('body').toggleClass('nav-expanded');
  		changeImage();
  	});
  	$('#nav-close').on('click',function(e){
  		e.preventDefault();
  		$('body').removeClass('nav-expanded');
  	});
  	
  	
  	// Initialize navgoco with default options
    $(".main-menu").navgoco({
        caret: '<span class="caret"></span>',
        accordion: false,
        openClass: 'open',
        save: true,
        cookie: {
            name: 'navgoco',
            expires: false,
            path: '/'
        },
        slide: {
            duration: 300,
            easing: 'swing'
            }
        });

    // jQuery no-double-tap-zoom plugin
    // Triple-licensed: Public Domain, MIT and WTFPL license - share and enjoy!

    (function($) {
      var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
      $.fn.nodoubletapzoom = function() {
        if (IS_IOS)
          $(this).bind('touchstart', function preventZoom(e) {
            var t2 = e.timeStamp
              , t1 = $(this).data('lastTouch') || t2
              , dt = t2 - t1
              , fingers = e.originalEvent.touches.length;
            $(this).data('lastTouch', t2);
            if (!dt || dt > 500 || fingers > 1) return; // not double-tap

            e.preventDefault(); // double tap - prevent the zoom
            // also synthesize click events we just swallowed up
            $(this).trigger('click').trigger('click');
          });
      };
    })(jQuery);

});



function changeImage() {
  if ( menuButton == "icon_menu.jpg" ) {
  	$("#menu_nav_btn").attr("src", "elements/icon_menu_sel.jpg");
    menuButton  = "icon_menu_sel.jpg";
  }
  else {
    $("#menu_nav_btn").attr("src", "elements/icon_menu.jpg");
    menuButton  = "icon_menu.jpg";
  }
}

function genericAjax(script, resultDiv, formID, js, waitForResult){

    var wait = (waitForResult=='true') ? false : true;

    var ajax = jQuery.ajax({
        async: wait,
        type: "POST",
        url: script,
        data : jQuery('#' + formID).serialize(),
        success: function(data) {

            if (jQuery('#' + resultDiv)) {

                //$('#' + resultDiv).html(data).show();
                jQuery('#' + resultDiv).html(data);

                if (js && js!=undefined) {
                    eval(''+js);
                }
            }
        }
    });
}

/******************************************* Login Functions ******************************************************************/

function doLogin () {

    window.localStorage.setItem("username", $('#username').val());
    window.localStorage.setItem("password", $('#password').val());

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=login&PHP_AUTH_PW='+$('#password').val()+'&PHP_AUTH_USER='+$('#username').val(),
        data : '',
        dataType: "json",
        success: function(res) {

                if (res['result']) {
                    window.localStorage.setItem("user_id", res['user_id']);
                    window.location = 'dashboard.html?header=Dashboard&header_color=none';
                } else {
                    alert(res['content']);
                }
        }
    });
}

/******************************************* END Login Functions ******************************************************************/


/******************************************* Registration Functions ******************************************************************/
function loadRegistration(){
	window.location.replace("register.html");
}
function doRegistration () {
	
	// window.location.replace("register.html");

    window.localStorage.setItem("username", $('#username').val());
    window.localStorage.setItem("password", $('#password').val());
    window.localStorage.setItem("email", $('#email_add').val());

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=register&password='+$('#password').val()+'&username='+$('#username').val()+'&email='+$('#email_add').val(),
        data : '',
        dataType: "json",
        success: function(res) {

                if (res['result']) {
                    window.localStorage.setItem("user_id", res['user_id']);
                    window.location = 'dashboard.html?header=Dashboard&header_color=none';
                } else {
                    alert(res['content']);
                }
        }
    });
}

/******************************************* END Registration Functions ******************************************************************/





/******************************************* User Details --Dashboard ******************************************************************/

function getuserDets (userid) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=user'+appendToken,
        data : '',
        dataType: "json",
        success: function(res) {

            $('#user-username').html(res['username']);
            $('#user-creds').html(res['credits']);
            $('#user-scrap').html(res['parts']);
            $('#user-points').html(res['points']);
            $(".knob").knob({
            	'min':0,
                'max':res['cards_total'],
                format : function (value) {
                    return res['cards_owned'] + '/'+res['cards_total'];
                }
            }).val(res['cards_owned']);

            window.localStorage.setItem("credit", res['credits']);
            window.localStorage.setItem("user_name", res['username']);
            window.localStorage.setItem("parts", res['parts']);
            window.localStorage.setItem("points", res['points']);
            window.localStorage.setItem("cards_owned", res['cards_owned']);
            window.localStorage.setItem("cards_total", res['cards_total']);

        }

    });
}

/******************************************* END User Details -- Dashboard ******************************************************************/

/******************************************* Categories start here -- ALBUM AND DECK ******************************************************************/

function getCardCategories (cat, deck_id) {

    var InDecks = (deck_id==undefined) ? false : true;
    var action = (InDecks) ? 'getusercategoriesnotindeck' : 'categories';

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request='+action+'&category_id='+cat+'&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(categories) {

            if (categories) {
                for(var i=0; i<categories.length; i++) {

                    if (InDecks) {
                        //var url = (cat=='') ? 'addToDeck&deck_id='+deck_id : 'deckCards';
                        var url = 'deckCards';
                    } else {
                        //var url = (cat=='') ? 'categories' : 'cards';
                        var url = 'cards';
                    }

                    $('.album-state').css('display','flex');
                    $('#model-make').css('border-bottom','3px solid #2c95f4').addClass('selected-album-view').addClass('blue-border');

                    $('#body_template').append(
                        '<div class="row-fluid grid" id="'+categories[i]['category_id']+'" onclick="window.location=\'grid-template.html?'+
                                                    'cat_id='+categories[i]['category_id']+
                                                    '&deck_id='+deck_id+
                                                    '&header='+categories[i]['description']+'&header_color='+urlParams.header_color+'&section='+url+'\'">'+
                            '<div class="padded">'+
                            categories[i]['description']+
                            ( (categories[i]['cards_owned'])?'<span class="secondary-sml">'+categories[i]['cards_owned']+'/'+categories[i]['cards_in_category']+'</span>':'')+
                            '</div>'+
                        '</div>'
                    );

                }
            }
        }
    });
}

/******************************************* END categories -- ALBUM AND DECK ******************************************************************/

/******************************************* Cards View is here -- ALBUM AND DECK ******************************************************************/

function getCards (cat, deck_id) {

    var InDecks = (deck_id==undefined) ? false : true;
    var action = (InDecks) ? 'getusercardsnotindeck' : 'albumcards';

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request='+action+'&category_id='+cat+'&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(cards) {

            if (cards) {
                for(var i=0; i<cards.length; i++) {

                    var owned = '';
                    var onclick = '';
                    var copies = '';
                    if (InDecks) {

                        onclick = 'addRemoveCardDecks('+cards[i]['card_id']+');';

                    } else {

                        onclick = (cards[i]['owned']=='0') ? "" : "window.location='card.html?card_id="+cards[i]['card_id']+"&header="+cards[i]['name']+"&header_color="+urlParams.header_color+"'";
                        owned = (cards[i]['owned']=='0') ? ' notowned' : '';
                        copies = (cards[i]['owned']=='0') ? '' : ' ('+cards[i]['owned']+' copies)';

                    }

                    $('.album-state').css('display','flex');
                    $('#model-all').css('border-bottom','3px solid #2c95f4').addClass('selected-album-view').addClass('blue-border');

                    $('#body_template').append(
                        '<div class="row grid'+owned+' cards vertical-align" id="'+cards[i]['card_id']+'" onclick="'+onclick+'">'+
                            '<div class="col-xs-4 vcenter">'+
                                '<img src="img/cards/'+cards[i]['card_id']+'-thumb.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-8 padded vcenter">'+
                                cards[i]['name']+
                                (
                                    (cards[i]['scrap_value']) ?
                                        '<span class="secondary-sml">'+
                                            cards[i]['scrap_value']+
                                            ((copies!='')?copies:'')+
                                        '</span>'
                                        :''
                                )+
                            '</div>'+
                        '</div>'
                    );

                }
            }
        }
    });
}

function addRemoveCardDecks (card_id) {

    var adding = ($('#'+card_id).hasClass('selectedCard')) ? false : true;
    
    if (adding) {
        if (parseInt(deckCardCount)<10) {

            $('#'+card_id).addClass('selectedCard');
            //adddeckCards (urlParams.deck_id, card_id);
            cardsToDeck.push(card_id);
            deckCardCount++;
            $('#deck-card-count').html(deckCardCount);

        } else {
            $('#modal-content').html($('#warning-confirmation').html());
            $('#myModal').modal();
        }
    } else {
        $('#'+card_id).removeClass('selectedCard');
        deckCardCount--;
        $('#deck-card-count').html(deckCardCount);
        var index = cardsToDeck.indexOf(card_id);
        cardsToDeck.splice(index, 1);
    }
    if (deckCardCount>0) {
        $('#save-button').show();
    } else {
        $('#save-button').hide();
    }
}

function addDeckToCards () {

    if (cardsToDeck) {
        for (var i = 0; i < cardsToDeck.length; i++) {
            adddeckCards (urlParams.deck_id, cardsToDeck[i]);
        }
    }
    if (deckCardCount<10) {
        window.location='grid-template.html?cat_id=1&deck_id='+urlParams.deck_id+'&header=Supercars&header_color=red&section=addToDeck';
    } else {
        window.location='grid-template.html?deck_id='+urlParams.deck_id+'&section=viewDeck&header_color=blue';
    }
}

/******************************************* END Cards View ******************************************************************/

/******************************************* CARD VIEW starts here ******************************************************************/

function getCardData (card_id) {
    
    var cardData;
    var ajax = jQuery.ajax({
        async: false,
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=card&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(data) {
            cardData = data;
        }
    });
    return cardData;
}

function getCard (card_id) {

    var cardData = getCardData(card_id);

    $('#card-parts').html(cardData['scrap_value']);
    $('#card-scrap-parts').html(cardData['scrap_value']);
    $('#card-img').attr('src', 'img/cards/'+cardData['card_id']+'-front.jpg');
    $('#card-img-bck').attr('src', 'img/cards/'+cardData['card_id']+'-back.jpg');
    $('#card-scrap-name').html(cardData['name']);
    $('#card-scrap-name2').html(cardData['name']);
}

function scrapCard (card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=scrapcard&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(res) {

            alert(res['content']);
        }
    });
}

function craftCard (card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=craftcard&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(res) {

            alert(res['content']);
        }
    });
}

function footerCardOptions() {
    $('#footer').html(
        '<div onclick="" class="row footer-options-holder">'+
                '<div class="col-xs-3 footer-options-div divider-right" id="card-wrench" onclick="$(\'#scrap-menu\').toggle();$(\'#card-wrench\').toggleClass(\'active\');">'+
                    '<span class="glyphicon glyphicon-wrench"></span>'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-ceter" id="card-flip" onclick="$(\'.quickflip-wrapper\').quickFlipper();">'+
                    '<span id="card-flip">TAP CARD TO FLIP</span>'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-ceter" id="craft-flip" onclick="craftCard('+urlParams.card_id+');">'+
                    '<span id="card-flip">CRAFT CARD</span>'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-left" id="card-flip" onclick="alert(\'Feature coming soon!\');">'+
                    '<i class="fa fa-share-alt-square">'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

/******************************************* END Card details ******************************************************************/

/******************************************* Decks View start here ******************************************************************/

function getChooseGame () {

    $('#body_template').append(
        '<div class="row grid deck" onclick="window.location=\'grid-template.html?section=challenge&header=Challenge&header_color=blue&computer=true\'">'+
            '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
                '<img src="elements/icon_game.jpg" />'+
            '</div>'+
            '<div class="col-xs-8 padded vcenter">'+
                'COMPUTER'+
            '</div>'+
        '</div>'+
        '<div class="row grid deck" onclick="window.location=\'grid-template.html?section=challenge&header=Challenge&header_color=blue&computer=false\'">'+
            '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
                '<span class="glyphicon glyphicon-user" style="text-align:center; color:#2c95f4;"></span>'+
            '</div>'+
            '<div class="col-xs-8 padded vcenter">'+
                'PLAYER'+
            '</div>'+
        '</div>'
    );

}

function newDeck (name, deck_id) {

    var rename = (deck_id==undefined) ? false : true;
    var action = (rename) ? 'renamedeck' : 'createdeck';

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request='+action+'&deck_name='+name+'&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(result) {

                if (result['result']) {

                    var url = (rename) ?
                        'grid-template.html?section=decks&header=Decks&header_color=blue' :
                        'grid-template.html?section=addToDeck&deck_id='+result['deck_id']+'&header='+name+'&header_color=blue&cat_id=1&header=Supercars';
                    window.location=url;
                } else {
                    alert(result['content']);
                }
        }
    });
}

function getdecks (user_id) {

    var isGame = (urlParams.section=='challenge') ? true : false;

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=getdecks'+appendToken,
        data : '',
        dataType: "json",
        success: function(decks) {

            for(var i=0; i<decks.length; i++) {

                var owned = (decks[i]['playable']=='true') ? '' : ' notowned';
                if (isGame) {
                    if (decks[i]['playable']!='true') {
                        var location = '';
                    } else {
                        //var location = 'window.location=\'grid-template.html?ingame=true&new_game=true&deck_id='+decks[i]['deck_id']+'&section=chooseGame&header=Game&header_color=blue\'';
                        var location = 'window.location=\'game.html?&header=Challenge&header_color=blue&ingame=true&new_game=true&deck_id='+decks[i]['deck_id']+'&computer='+urlParams.computer+'\'';
                    }
                } else {
                    var location = 'window.location=\'grid-template.html?deck_id='+decks[i]['deck_id']+'&section=viewDeck&header='+decks[i]['description']+'&header_color=blue\'';
                }

                $('#body_template').append(
                    '<div class="row grid'+owned+' decks vertical-align" id="'+decks[i]['deck_id']+'" onclick="'+location+'">'+
                        '<div class="col-xs-4 vcenter">'+
//                                '<img src="img/decks/'+decks[i]['deck_id']+'.jpg" />'+
                            '<img src="img/decks/placeholder.jpg" />'+
                        '</div>'+
                        '<div class="col-xs-8 padded vcenter">'+
                            '<div id="deck-name-'+decks[i]['deck_id']+'">'+decks[i]['description']+'</div>'
                            +'<span class="secondary"><span id="deck-count-'+decks[i]['deck_id']+'">'+decks[i]['cards_in_deck']+'</span> cards in deck</span>'+
                        '</div>'+
                    '</div>'
                );
            }

            $('#body_template').append(
                '<div class="row grid deck" onclick="window.location=\'create.html?section=decks&header=New Deck&header_color=blue\'">'+
                    '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
                        '<span class="glyphicon glyphicon-plus" style="text-align:center; color:#2c95f4;"></span>'+
                    '</div>'+
                    '<div class="col-xs-8 padded vcenter">'+
                        'Create New Deck'+
                    '</div>'+
                '</div>'
            );

            if (isGame) {
                $('#body_template').append($('#rules-container').html());
            }
        }
    });

    if (isGame) {

        var ajax = jQuery.ajax({
            type: "POST",
            crossDomain: true,
            url: 'http://topcarcards.co.za/?request=gameinprogress '+appendToken,
            data : '',
            dataType: "json",
            success: function(game) {

//                if (game['result']) {
//                    $('#body_template').append(
//                        '<div class="row grid deck" onclick="window.location=\'game.html?&header=Challenge&header_color=blue&ingame=true&new_game=false\'">'+
//                            '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
//                                '<span class="glyphicon glyphicon-play-circle" style="text-align:center; color:#2c95f4;"></span>'+
//                            '</div>'+
//                            '<div class="col-xs-8 padded vcenter">'+
//                                'Continue Game'+
//                            '</div>'+
//                        '</div>'
//                    );
//                }
            }
        });
    }
}

function footerDeckEdits() {
    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-4 footer-options-div divider-right" onclick="editDeck(\'trash\');">'+
                    '<span class="glyphicon glyphicon-trash" id="deck-card-trash"></span>'+
                '</div>'+
                '<div class="col-xs-4 footer-options-div divider-both" onclick="editDeck(\'edit\');">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit"></span>'+
                '</div>'+
                '<div class="col-xs-4 active-button divider-left" id="cancel-button" style="display:none;" onclick="uneditDeck();">'+
                    'CANCEL'+
                '</div>'+
        '</div>'
    );
}

function editDeck (action) {

    $('#deck-card-edit').addClass('inactive');
    $('#cancel-button').show();

    (action=='trash') ? $('#deck-card-edit').addClass('inactive') : $('#deck-card-trash').addClass('inactive');
        //onclick = 'deleteDeck();';
        //onclick = 'renameDeck();';

    $('.decks').each(
        function() {
            var onclick = '';
            if (action=='trash') {
                onclick = "$('#delete-confirmation #delete-confirmation-confirm').attr('onclick', 'deleteDeck(\\\'"+$(this).attr('id')+"\\\');');"+
                            "$('#modal-content').html($('#delete-confirmation').html());$('#myModal').modal();";
            } else {
                onclick = "window.location=\'create.html?deck_id="+$(this).attr('id')+"&deck_name="+$('#deck-name-'+$(this).attr('id')).html()+"&deck_id="+$(this).attr('id')+"&header="+$('#deck-name-'+$(this).attr('id')).html()+"&header_color=blue"+"\'";
            }
            $(this).attr('onclick', onclick);
        }
    );
}

function uneditDeck () {

    $('#deck-card-edit').removeClass('inactive');
    $('#deck-card-trash').removeClass('inactive');
    $('#cancel-button').hide();
    $('.decks').each(
        function() {
            var newonclick = 'window.location=\'grid-template.html?deck_id='+$(this).attr('id')+'&section=viewDeck&header=Deck&header_color=blue\'';
            $(this).attr('onclick', newonclick);
        }
    );

}

function deleteDeck (deck_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=deletedeck&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(result) {

                if (result['result']) {
                    window.location=window.location;
                }
        }
    });


}

/************************************ END Decks View start here ***********************************************************/

/******************************************* Products start here ******************************************************************/

function getproducts () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=products'+appendToken,
        data : '',
        dataType: "json",
        success: function(products) {

                for(var i=0; i<products.length; i++) {

                    $('#body_template').append(
                        '<div class="row grid shop vertical-align" id="'+products[i]['product_id']+'" onclick="window.location=\'product.html?'+
                                                        'product_id='+products[i]['product_id']+
                                                        '&description='+products[i]['description']+
                                                        '&price='+products[i]['price']+
                                                        '&pack_size='+products[i]['pack_size']+
                                                        '&header='+products[i]['description']+'&header_color=yellow'+
                                                        '\'">'+
                            '<div class="col-xs-4 vcenter">'+
//                                '<img src="img/products/'+products[i]['product_id']+'.jpg" />'+
                                '<img src="img/products/placeholder.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-8 padded vcenter">'+
                                products[i]['description']+'<br />'
                                +'<span class="secondary">'+products[i]['pack_size']+' cards in pack</span>'+
                            '</div>'+
                        '</div>'
                    );

                }
        }
    });
}

function buyproduct (product_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=purchaseproduct&product_id='+product_id+appendToken,
        data : '',
        dataType: "json",
        success: function(result) {

                if (result['result']) {
                    $('#modal-content').html($('#purchase-confirmation').html());
                    $('#myModal').modal();

                    var ajax = jQuery.ajax({
                        type: "POST",
                        crossDomain: true,
                        url: 'http://topcarcards.co.za/?request=user'+appendToken,
                        data : '',
                        dataType: "json",
                        success: function(res) {

                            $('#user-credits').html(res['credits']);
                            window.localStorage.setItem("credit", res['credits']);

                        }

                    });

                } else {
                    alert(result['content']);
                }
        }
    });
}

/******************************************* END products ******************************************************************/

/******************************************* Deck Cards ******************************************************************/

function getdeckCardCount () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        async: false,
        url: 'http://topcarcards.co.za/?request=getdeckcards&deck_id='+urlParams.deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(result) {

                deckCardCount = result.cards.length;
        }
    });
}

function getdeckCards (deck_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=getdeckcards&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(result) {

            if (result) {

                if (result.deck_name) {
                    $('#page-title').html(result.deck_name);
                }
                var cards = result.cards;
                if(cards) {
                    for(var i=0; i<cards.length; i++) {

                        $('#body_template').append(
                            '<div class="row grid cards vertical-align" id="'+cards[i]['card_id']+'" onclick="window.location=\'card.html?card_id='+cards[i]['card_id']+'&header='+cards[i]['name']+'&header_color=red\'">'+
                                '<div class="col-xs-4 vcenter">'+
                                    '<img src="img/cards/'+cards[i]['card_id']+'-front.jpg" />'+
                                '</div>'+
                                '<div class="col-xs-8 padded vcenter" id="card-name-'+cards[i]['name']+'">'+
                                    cards[i]['name']+
                                '</div>'+
                            '</div>'
                        );

                    }
                }
                $('#deck-card-count').html(cards.length);
                if (cards.length==10) {
                    $('#deck-card-add').addClass('inactive');
                    $('#deck-card-add').parent().attr('onclick','');
                }
            }
        }
    });
}

function removedeckCards (deck_id, card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=removecardfromdeck&deck_id='+deck_id+'&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(cards) {

        }
    });
}

function adddeckCards (deck_id, card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        async: false,
        url: 'http://topcarcards.co.za/?request=addcardtodeck&deck_id='+deck_id+'&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(cards) {

        }
    });
}

function removedeckCards (deck_id, card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=removecardfromdeck&deck_id='+deck_id+'&card_id='+card_id+appendToken,
        data : '',
        dataType: "json",
        success: function(cards) {

        }
    });
}

function footerDeckCardEdits() {
    
    getdeckCardCount();
    
    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-3 footer-options-div deck-edit-count divider-right">'+
                    '<span id="deck-card-count">'+deckCardCount+'</span>/10'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-both" onclick="window.location=\'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'&cat_id=1&header=Supercars&header_color=blue\'">'+
                    '<span class="glyphicon glyphicon-plus" id="deck-card-add"></span>'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-both" onclick="editDecksCards();">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit"></span>'+
                '</div>'+
                '<div class="col-xs-3 active-button divider-left" id="cancel-button" style="display:none;" onclick="uneditDecksCards();">'+
                    'CANCEL'+
                '</div>'+
        '</div>'
    );
}

function editDecksCards () {

    $('#deck-card-edit').removeClass('glyphicon-edit');
    $('#deck-card-edit').addClass('glyphicon-trash');
    $('#deck-card-edit').addClass('inactive');
    $('#cancel-button').show();
    $('.cards').each(
        function() {
            $(this).addClass('notowned');
            var newonclick = '$(this).toggleClass(\'selectedCard\');checkTrashButton();';
            $(this).attr('onclick', newonclick);
        }
    );
    $('#deck-card-edit').attr('onclick','deleteDecks();');
}

function uneditDecksCards () {

    $('#deck-card-edit').removeClass('glyphicon-trash');
    $('#deck-card-edit').addClass('glyphicon-edit');
    $('#deck-card-edit').removeClass('inactive');
    $('#deck-card-edit').attr('onclick','editDecksCards();');
    $('#cancel-button').hide();
    $('.cards').each(
        function() {
            $(this).removeClass('selectedCard');
            $(this).removeClass('notowned');
            var newonclick = 'window.location=\'card.html?card_id='+$(this).attr('id')+'&header='+$('#card-name-'+$(this).attr('id')).html()+'&header_color=red\'';
            $(this).attr('onclick', newonclick);
        }
    );

}

function deleteDecks () {

    $('.selectedCard').each(
        function() {
            $(this).removeClass('selectedCard');
            removedeckCards (urlParams.deck_id, $(this).attr('id'));
            $(this).remove();
        }
    );
}

/******************************************* END Deck Cards ******************************************************************/

/********************************************* Leaderboard *******************************************************************/

function getleaderboard () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=leaderboard'+appendToken,
        data : '',
        dataType: "json",
        success: function(users) {

                var userHtml = '';
                var boardHtml = '';
                for(var i=0; i<users.length; i++) {

                    if (users[i].own_score=='true') {

                        userHtml =
                            '<div class="row grid leaderboard vertical-align" id="'+users[i]['place']+'">'+
                                '<div class="col-xs-2 col-xs-offset-1 vcenter star place">'+
                                    '<span class="glyphicon glyphicon-star-empty" style="color:#20e58b;"></span>'+
                                '</div>'+
                                '<div class="col-xs-6 padded vcenter username">'+
                                    users[i]['place']+' place<br />'+
                                    '<span class="secondary">'+users[i]['points']+' points</span>'+
                                '</div>'+
                                '<div class="col-xs-3 padded vcenter points">'+
                                    ' points'+
                                '</div>'+
                            '</div>';

                    } else {

                        boardHtml +=
                            '<div class="row grid leaderboard vertical-align" id="'+users[i]['place']+'">'+
                                '<div class="col-xs-2 col-xs-offset-1 vcenter place">'+
                                    users[i]['place']+
                                '</div>'+
                                '<div class="col-xs-6 padded vcenter username">'+
                                    users[i]['username']+
                                '</div>'+
                                '<div class="col-xs-3 padded vcenter greenpoints">'+
                                    +users[i]['points']+
                                '</div>'+
                            '</div>';
                    }
                }
                $('#body_template').append(
                        userHtml+''+boardHtml
                    );
        }
    });
}

/******************************************* END Leaderboard *****************************************************************/

/**************************************** Start game functions ***************************************************************/

function init_game (computer) {

    $( "#user-points #progressbar1" ).progressbar({value: 100}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#user-points #progressbar2" ).progressbar({value: 0}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar1" ).progressbar({value: 100}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar2" ).progressbar({value: 0}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#game-score-user" ).html('10');
    $( "#game-score-opponent" ).html('10');

    start_game(computer);

}

function start_game (computer) {

    var comp = (computer=='true') ? 'true' : 'false';

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=newgame&deck_id='+urlParams.deck_id+'&computer='+comp+appendToken,
        data : '',
        dataType: "json",
        success: function(gameData) {

            $("#game-id-holder").html(gameData['game_id']);
            if (gameData['active_player']==user_id) {

                users_turn(gameData);
                
//            } else if (gameData['game_status']=='lfm') {
            } else {
                
                $( "#user-area" ).html('');
                $( "#game-instruction-message" ).html('<img src="img/loading.gif" class="loader" /> Waiting for opponent...');
                $( "#user-area" ).html($( "#game-message-div" ).html());
                setTimeout('checkGame()', 5000);

            }
        }
    });

}

function checkGame () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=continuegame&game_id='+$("#game-id-holder").html()+appendToken,
        data : '',
        dataType: "json",
        success: function(gameData) {

            if (gameData['game_status']=='lfm') {

                setTimeout('checkGame()', 5000);

            } else if (gameData['game_status']=='inprogress') {

                if (gameData['active_player']==user_id && !gameData['moveData']) {

                    //gameMoveAction(gameData);
                    users_turn();

                } else {

                    if (gameData['moveData']) {

                        gameMoveAction(gameData);

                    } else {
                        
                        $( "#user-area" ).html('');
                        $( "#challenger-area" ).html('');
                        $( "#game-instruction-message" ).html('<img src="img/loading.gif" class="loader" /> Waiting for opponent\'s move..');
                        $( "#user-area" ).html($( "#game-message-div" ).html());
                        $("#game-id-holder").html(gameData['game_id']);
                        setTimeout('checkGame()', 2000);
                    }
                }
            } else if (gameData['game_status']=='completed') {

                var endText;
                if (parseInt(gameData['user_score'])==parseInt(gameData['opponent_score'])) {
                    endText = 'Its a Draw!';
                } else if ( (parseInt(gameData['user_score'])>parseInt(gameData['opponent_score'])) || isNaN(parseInt(gameData['opponent_score'])) ) {
                    endText = 'YOU WON';
                } else {
                    endText = 'YOU LOSE';
                }
                $( "#user-area" ).addClass('game-overlay');
                $( "#user-area" ).prepend('<div class="overlay-message">'+endText+'</div>');

                setTimeout('window.location="grid-template.html?section=leaderboard&header=Leaderboard&header_color=green"', 7000);
            }
        }
    });
}

function users_turn() {

     var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=continuegame&game_id='+$("#game-id-holder").html()+appendToken,
        data : '',
        dataType: "json",
        success: function(gameData) {
            var cardData = getCardData(gameData['card_id_user']);

            $('#user-area').removeClass('game-overlay');

            $( "#game-id-holder" ).html(gameData['game_id']);
            $( "#game-score-user" ).html(gameData['user_score']);

            $( "#user-area" ).html($( "#user-card-div" ).html());
            $( "#user-card-img" ).attr('src', 'img/cards/'+cardData['card_id']+'-stats.jpg');
            $( "#game-card-model" ).html(cardData['name']);

            $( "#game-instruction-message" ).html('Select a high value on your card.');
            $( "#challenger-area" ).html($( "#game-message-div" ).html());
            $( "#game-message" ).html('');

            $('#new-game').hide();
        }
     });
}

function stat_select (stat) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=playgame&stat_id='+stat+'&game_id='+$( "#game-id-holder" ).html()+appendToken,
        data : '',
        dataType: "json",
        success: function(gameData) {

            gameMoveAction(gameData);
            
        }
    });
}

function gameMoveAction (gameData) {

    $( "#challenger-area" ).html($( "#challenger-card-div" ).html());

    if (gameData['game_status']=='complete') {

        var endText;
        if (parseInt(gameData['user_score'])==parseInt(gameData['opponent_score'])) {
            endText = 'Its a Draw!';
        } else if ( (parseInt(gameData['user_score'])>parseInt(gameData['opponent_score'])) || isNaN(parseInt(gameData['opponent_score'])) ) {
            endText = 'YOU WON';
        } else {
            endText = 'YOU LOSE';
        }
        $( "#user-area" ).addClass('game-overlay');
        $( "#user-area" ).prepend('<div class="overlay-message">'+endText+'</div>');

        setTimeout('window.location="grid-template.html?section=leaderboard&header=Leaderboard&header_color=green"', 7000);

    } else {

        var user_card;
        var challenger_card;
        var message;
        if (gameData['moveData']['winner']==user_id) {
            user_card = gameData['moveData']['winning_card'];
            challenger_card = gameData['moveData']['losing_card'];
            message = 'YOU WIN';
        } else {
            user_card = gameData['moveData']['losing_card'];
            challenger_card = gameData['moveData']['winning_card'];
            message = 'YOU LOSE';
        }

        $( "#game-score-user" ).html(gameData['user_score']);
        var barScore1 = (parseInt(gameData['user_score'])>10) ? 100 : parseInt(gameData['user_score'])*10;
        var barScore2 = (parseInt(gameData['user_score'])>10) ? (parseInt(gameData['user_score'])-10)*10 : 0;
        $( "#user-points #progressbar1" ).progressbar({value: barScore1}).append('<div class="game-progress-filler">&nbsp;</div>');
        $( "#user-points #progressbar2" ).progressbar({value: barScore2}).append('<div class="game-progress-filler">&nbsp;</div>');

        $( "#user-area" ).html($( "#user-card-div" ).html());
        $( "#user-card-img" ).attr('src', 'img/cards/'+user_card+'-stats.jpg');

        $( "#game-score-opponent" ).html(gameData['opponent_score']);
        barScore1 = (parseInt(gameData['opponent_score'])>10) ? 100 : parseInt(gameData['opponent_score'])*10;
        barScore2 = (parseInt(gameData['opponent_score'])>10) ? (parseInt(gameData['opponent_score'])-10)*10 : 0;
        $( "#challenger-points #progressbar1" ).progressbar({value: barScore1}).append('<div class="game-progress-filler">&nbsp;</div>');
        $( "#challenger-points #progressbar2" ).progressbar({value: barScore2}).append('<div class="game-progress-filler">&nbsp;</div>');

        $( "#challenger-area" ).html($( "#challenger-card-div" ).html());
        $( "#challenger-card-img" ).attr('src', 'img/cards/'+challenger_card+'-stats.jpg');

        $('#user-area #card-stat'+gameData['moveData']['stat_id']).addClass('highlighted-stat');
        $('#challenger-area #card-stat'+gameData['moveData']['stat_id']).addClass('highlighted-stat');


        $('#user-area .card-stats, #challenger-area .card-stats').each(function() {
                $(this).attr('onclick','');
        });

        $( "#user-area" ).addClass('game-overlay');
        $( "#user-area" ).prepend('<div class="overlay-message">'+message+'</div>');

        if (gameData['active_player']==user_id) {

            //setTimeout('users_turn();', 5000);
            $('#new-game').show();

        } else {

            setTimeout('checkGame()', 5000);
        }
    }
}

/****************************************** END Game Function ***************************************************************/

/****************************************** Credits section ***************************************************************/

function showCreditOptions () {

    $('#body_template').append(
        '<div class="row grid cards" id="" onclick="$(\'#modal-content\').html($(\'#coming-soon\').html());$(\'#myModal\').modal();">'+
        //'<div class="row grid cards" id="" onclick="window.location=\'credits-PayU.html?header=Premium SMS&header_color=purple\'">'+
            '<div class="col-xs-10 col-xs-offset-1 padded">'+
                'PayU'+
            '</div>'+
        '</div>'+
        '<div class="row grid cards" id="" onclick="window.location=\'credits-Premium-SMS.html?header=Premium SMS&header_color=purple\'">'+
            '<div class="col-xs-10 col-xs-offset-1 padded">'+
                'Premium SMS'+
            '</div>'+
        '</div>'
    );

}

/****************************************** END Credits section ***************************************************************/

function checkTrashButton () {

    if ($('.selectedCard').attr('id')) { // Make clickable
        $('#deck-card-edit').removeClass('inactive');
    } else {
        $('#deck-card-edit').addClass('inactive');
    }
}

function footerCardEdits() {

    getdeckCardCount();

    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-9 footer-options-div deck-edit-count">'+
                    '<span id="deck-card-count">'+deckCardCount+'</span>/10'+
                '</div>'+
                '<div class="col-xs-3 active-button" id="save-button" onclick="addDeckToCards();">'+
                    'DONE'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

function footerMoreCredits() {
    $('#footer').html(
        '<div class="row credits-div">'+
                '<div class="col-xs-8 credit-stat">'+
                    'You have <span id="user-credits">'+credit+'</span> credits'+
                '</div>'+
                '<div class="col-xs-4 credit-more active-button" onclick="window.location=\'credits.html?header=Credits&header_color=purple\'">'+
                    'GET MORE'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

function navHtml() {
    $('#nav').html(
        '<ul class="list-group main-menu">'+
            '<!--li class="text-right"><a href="#" id="nav-close"><img src="elements/supercars_logo.jpg" /></a></li-->'+
            '<li class="list-group-item orange-border-right"><a href="dashboard.html?header=Dashboard&header_color=none"><img src="elements/icon_dash.jpg" class="icon-dash" /><p class="nav-menu-text">DASHBOARD</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item red-border-right"><a href="grid-template.html?header=Album&header_color=red"><img src="elements/icon_album.jpg" class="icon-album" /><p class="nav-menu-text">ALBUM</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item yellow-border-right"><a href="grid-template.html?section=shop&header=Shop&header_color=yellow"><img src="elements/icon_shop.jpg" class="icon-shop" /><p class="nav-menu-text">SHOP</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item blue-border-right"><a href="grid-template.html?section=decks&header=Deck&header_color=blue"><img src="elements/icon_game.jpg" class="icon-deck" /><p class="nav-menu-text">DECKS</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item green-border-right"><a href="grid-template.html?section=chooseGame&header=Challenge&header_color=blue"><img src="elements/icon_game.jpg" class="icon-game" /><p class="nav-menu-text">GAME</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item green-border-right"><a href="grid-template.html?section=leaderboard&header=Leaderboard&header_color=green"><img src="elements/icon_leader.jpg" class="icon-leader" /><p class="nav-menu-text">LEADERBOARD</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item purple-border-right"><a href="grid-template.html?section=credits&header=Credits&header_color=purple"><img src="elements/icon_credits.jpg" class="icon-credits" /><p class="nav-menu-text">CREDITS</p></a></li>'+
            '<div class="menu_divider"></div>'+
            '<li class="list-group-item lime-border-right"><a href="profile.html?header=Profile&header_color=lime"><img src="elements/icon_profile.jpg" class="icon-profile" /><p class="nav-menu-text">PROFILE</p></a></li>'+
        	'<div class="menu_divider"></div>'+
        '</ul>'
    );
    $('#nav').show();
}

function queryParameters () {
    var result = {};

    var params = window.location.search.split(/\?|\&/);

    params.forEach( function(it) {
        if (it) {
            var param = it.split("=");
            result[param[0]] = param[1];
        }
    });

    return result;
}

function sleep( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
}
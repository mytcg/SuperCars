var username = window.localStorage.getItem("username");
var password = window.localStorage.getItem("password");
var email = window.localStorage.getItem("email_add");
var user_id = window.localStorage.getItem("user_id");
var credit = window.localStorage.getItem("credit");
var urlParams = queryParameters();

var appendToken = '&user_id='+user_id+'&PHP_AUTH_PW='+password+'&PHP_AUTH_USER='+username;


      
jQuery(document).ready(function() {

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
  	});
  	$('#nav-close').on('click',function(e){
  		e.preventDefault();
  		$('body').removeClass('nav-expanded');
  	});
  	
  	
  	// Initialize navgoco with default options
    // $(".main-menu").navgoco({
        // caret: '<span class="caret"></span>',
        // accordion: false,
        // openClass: 'open',
        // save: true,
        // cookie: {
            // name: 'navgoco',
            // expires: false,
            // path: '/'
        // },
        // slide: {
            // duration: 300,
            // easing: 'swing'
            // }
        // });
//         	

});

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

function doRegistration () {

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

            window.localStorage.setItem("credit", res['credits']);

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
                        var url = (cat=='') ? 'addToDeck&deck_id='+deck_id+'&deck_count='+urlParams.deck_count : 'deckCards';
                    } else {
                        var url = (cat=='') ? 'categories' : 'cards';
                    }

                    $('#body_template').append(
                        '<div class="row-fluid grid" id="'+categories[i]['category_id']+'" onclick="window.location=\'grid-template.html?'+
                                                    'cat_id='+categories[i]['category_id']+
                                                    '&deck_id='+deck_id+'&deck_count='+urlParams.deck_count+
                                                    '&header='+categories[i]['description']+'&header_color='+urlParams.header_color+'&section='+url+'\'">'+
                            '<div class="padded">'+
                            categories[i]['description']+
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
                    if (InDecks) {

                        onclick = 'addRemoveCardDecks('+cards[i]['card_id']+');';

                    } else {

                        onclick = "window.location='card.html?card_id="+cards[i]['card_id']+"&header="+cards[i]['name']+"&header_color="+urlParams.header_color+"'";
                        owned = (cards[i]['owned']=='0') ? ' notowned' : '';
                    }

                    $('#body_template').append(
                        '<div class="row grid'+owned+' cards vertical-align" id="'+cards[i]['card_id']+'" onclick="'+onclick+'">'+
                            '<div class="col-xs-4 vcenter">'+
                                '<img src="img/cards/'+cards[i]['card_id']+'-thumb.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-8 padded vcenter">'+
                                cards[i]['name']+'<br />'+
                                ((cards[i]['scrap_value'])?'<span class="secondary">'+cards[i]['scrap_value']+' credits</span>':'')+
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
            adddeckCards (urlParams.deck_id, card_id);
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
        removedeckCards (urlParams.deck_id, card_id);
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
    $('#card-img').attr('src', 'img/cards/'+cardData['card_id']+'-front.jpg');
    $('#card-img-bck').attr('src', 'img/cards/'+cardData['card_id']+'-back.jpg');
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

function footerCardOptions() {
    $('#footer').html(
        '<div onclick="getMoreCredits()" class="row footer-options-holder">'+
                '<div class="col-xs-6 footer-options-div divider-right" id="card-wrench">'+
                    '<span class="glyphicon glyphicon-wrench" onclick="$(\'#scrap-menu\').toggle();$(\'#card-wrench\').toggleClass(\'active\');"></span>'+
                '</div>'+
                '<div class="col-xs-6 footer-options-div divider-left" id="card-flip">'+
                    '<span class="glyphicon glyphicon-share-alt" id="card-flip" onclick="$(\'.quickflip-wrapper\').quickFlipper();"></span>'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

/******************************************* END Card details ******************************************************************/

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
                    $('#modal-content').html($('#parchase-confirmation').html());
                    $('#myModal').modal();
                } else {
                    alert(result['content']);
                }
        }
    });
}

/******************************************* END products ******************************************************************/

/******************************************* Decks View start here ******************************************************************/

function newDeck (name, deck_id, deck_count) {

    var deck_count = (urlParams.deck_count==undefined) ? '0' : urlParams.deck_count;
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
                        'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'&deck_count='+urlParams.deck_count+'&header='+name+'&header_color=blue' :
                        'grid-template.html?section=addToDeck&deck_id='+result['deck_id']+'&deck_count=0&header='+name+'&header_color=blue';

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

                var owned = (decks[i]['playable']=='0') ? ' notowned' : '';
                var location = (isGame) ? 'game.html?&header=Challenge&header_color=blue&ingame=true&new_game=true&deck_id='+decks[i]['deck_id'] : 'grid-template.html?deck_id='+decks[i]['deck_id']+'&deck_count='+decks[i]['cards_in_deck']+'&section=viewDeck&header='+decks[i]['description']+'&header_color=blue';

                $('#body_template').append(
                    '<div class="row grid'+owned+' decks vertical-align" id="'+decks[i]['deck_id']+'" onclick="window.location=\''+location+'\'">'+
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
                '<div class="row grid deck" onclick="window.location=\'create.html?section=decks\'">'+
                    '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
                        '<span class="glyphicon glyphicon-plus" style="text-align:center; color:#2c95f4;"></span>'+
                    '</div>'+
                    '<div class="col-xs-8 padded vcenter">'+
                        'Create New Deck'+
                    '</div>'+
                '</div>'
            );
        }
    });
    
    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=gameinprogress '+appendToken,
        data : '',
        dataType: "json",
        success: function(game) {

            if (game['result']) {
                $('#body_template').append(
                    '<div class="row grid deck" onclick="window.location=\'game.html?&header=Challenge&header_color=blue&ingame=true&new_game=false\'">'+
                        '<div class="col-xs-4 padded vcenter" style="text-align:center;">'+
                            '<span class="glyphicon glyphicon-play-circle" style="text-align:center; color:#2c95f4;"></span>'+
                        '</div>'+
                        '<div class="col-xs-8 padded vcenter">'+
                            'Continue Game'+
                        '</div>'+
                    '</div>'
                );
            }
            if (urlParams.section=='challenge') {
                $('#body_template').append($('#rules-container').html());
            }
        }
    });
}

function footerDeckEdits() {
    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-4 footer-options-div divider-right">'+
                    '<span class="glyphicon glyphicon-trash" id="deck-card-trash" onclick="editDeck(\'trash\');"></span>'+
                '</div>'+
                '<div class="col-xs-4 footer-options-div divider-both">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit" onclick="editDeck(\'edit\');"></span>'+
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
                onclick = "window.location=\'create.html?deck_id="+$(this).attr('id')+"&deck_name="+$('#deck-name-'+$(this).attr('id')).html()+"&deck_id="+$(this).attr('id')+"&deck_count="+$('#deck-count-'+$(this).attr('id')).html()+'&header=Deck&header_color=blue'+"\'";
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

/******************************************* Deck Cards ******************************************************************/

function getdeckCards (deck_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=getdeckcards&deck_id='+deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(cards) {

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
                $('#deck-card-count').html(cards.length);
                if (cards.length==10) {
                    $('#deck-card-add').addClass('inactive');
                    $('#deck-card-add').attr('onclick','');
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
    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-3 footer-options-div deck-edit-count divider-right">'+
                    '<span id="deck-card-count">***</span>/10'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-both">'+
                    '<span class="glyphicon glyphicon-plus" id="deck-card-add" onclick="window.location=\'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'&deck_count='+urlParams.deck_count+'\'"></span>'+
                '</div>'+
                '<div class="col-xs-3 footer-options-div divider-both">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit" onclick="editDecksCards();"></span>'+
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
        url: 'http://topcarcards.co.za/?request=null'+appendToken,
        data : '',
        dataType: "json",
        success: function(users) {

                var users = [
                    {"place":"234th","points":"23","own_score":true}
                    ,{"place":"1st","username":"John","points":"12331","own_score":false}
                    ,{"place":"2nd","username":"Zoe","points":"12312","own_score":false}
                    ,{"place":"3rd","username":"Shady","points":"12312","own_score":false}
                    ,{"place":"4th","username":"Jane","points":"1231","own_score":false}
                    ,{"place":"5th","username":"Doe","points":"123","own_score":false}
                    ,{"place":"6th","username":"Widey","points":"123123","own_score":false}
                    ,{"place":"7th","username":"xxxYxxx","points":"1312","own_score":false}
                    ,{"place":"8th","username":"assign","points":"1123","own_score":false}
                    ,{"place":"9th","username":"justin","points":"1321","own_score":false}
                    ,{"place":"10th","username":"People","points":"12242","own_score":false}
                ];

                var userHtml = '';
                var boardHtml = '';
                for(var i=0; i<users.length; i++) {

                    if (users[i].own_score) {

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
                            '</div>'

                    } else {

                        boardHtml +=
                            '<div class="row grid leaderboard vertical-align" id="'+users[i]['place']+'">'+
                                '<div class="col-xs-2 col-xs-offset-1 vcenter place">'+
                                    users[i]['place']+
                                '</div>'+
                                '<div class="col-xs-6 padded vcenter username">'+
                                    users[i]['username']+' place'+
                                '</div>'+
                                '<div class="col-xs-3 padded vcenter greenpoints">'+
                                    +users[i]['points']+
                                '</div>'+
                            '</div>'
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

function init_game () {

    $( "#user-points #progressbar1" ).progressbar({value: 100}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#user-points #progressbar2" ).progressbar({value: 0}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar1" ).progressbar({value: 100}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar2" ).progressbar({value: 0}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#game-score-user" ).html('10');
    $( "#game-score-opponent" ).html('10');
    $( "#user-area" ).html($( "#game-message-div" ).html());

    start_game();

}

function start_game () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=newgame&deck_id='+urlParams.deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(game) {

                //var cardData = getCardData(card_id);

        }
    });

}

function stat_select () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=playgame&deck_id='+urlParams.deck_id+appendToken,
        data : '',
        dataType: "json",
        success: function(game) {

        }
    });

    $( "#user-points #progressbar1" ).progressbar({value: 50}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#user-points #progressbar2" ).progressbar({value: 50}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar1" ).progressbar({value: 50}).append('<div class="game-progress-filler">&nbsp;</div>');
    $( "#challenger-points #progressbar2" ).progressbar({value: 50}).append('<div class="game-progress-filler">&nbsp;</div>');

}
//
//function showCard (card_id, prefix) {
//
//    var ajax = jQuery.ajax({
//        type: "POST",
//        crossDomain: true,
//        url: 'http://topcarcards.co.za/?request=card&card_id='+card_id+appendToken,
//        data : '',
//        dataType: "json",
//        success: function(car) {
//
//            if (car) {
//
////                $('#card-name').html(car['name']);
//                $('#card-parts').html(car['scrap_value']);
//                $('#card-img').attr('src', 'img/cards/'+car['card_id']+'-front.jpg');
//                $('#card-img-bck').attr('src', 'img/cards/'+car['card_id']+'-back.jpg');
//
//            }
//        }
//    });
//}

/****************************************** END Game Function ***************************************************************/

function checkTrashButton () {

    if ($('.selectedCard').attr('id')) { // Make clickable
        $('#deck-card-edit').removeClass('inactive');
    } else {
        $('#deck-card-edit').addClass('inactive');
    }
}

function footerCardEdits() {
    $('#footer').html(
        '<div class="row footer-options-holder">'+
                '<div class="col-xs-9 footer-options-div deck-edit-count">'+
                    '<span id="deck-card-count">'+urlParams.deck_count+'</span>/10'+
                '</div>'+
                '<div class="col-xs-3 active-button" id="save-button" onclick="window.location=\'grid-template.html?section=decks&deck_id='+urlParams.deck_id+'header=Deck&header_color=blue\'">'+
                    'DONE'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

function footerMoreCredits() {
    $('#footer').html(
        '<div onclick="getMoreCredits()" class="row credits-div">'+
                '<div class="col-xs-8 credit-stat">'+
                    'You have <span id="user-credits">'+credit+'</span> credits'+
                '</div>'+
                '<div class="col-xs-4 credit-more active-button">'+
                    'GET MORE'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

function navHtml() {
    $('#nav').html(
        '<ul class="list-group main-menu">'+
            '<li class="text-right"><a href="#" id="nav-close"><img src="elements/supercars_logo.jpg" /></a></li>'+
            '<li class="list-group-item orange-border-right"><a href="dashboard.html?header=Dashboard&header_color=none"><img src="elements/icon_dash.jpg" class="icon-dash" /><p class="nav-menu-text">DASHBOARD</p></a></li>'+
            '<li class="list-group-item red-border-right"><a href="grid-template.html?header=Album&header_color=red"><img src="elements/icon_album.jpg" class="icon-album" /><p class="nav-menu-text">ALBUM</p></a></li>'+
            '<li class="list-group-item yellow-border-right"><a href="grid-template.html?section=shop&header=Shop&header_color=yellow"><img src="elements/icon_shop.jpg" class="icon-shop" /><p class="nav-menu-text">SHOP</p></a></li>'+
            '<li class="list-group-item blue-border-right"><a href="grid-template.html?section=decks&header=Deck&header_color=blue"><img src="elements/icon_game.jpg" class="icon-deck" /><p class="nav-menu-text">DECKS</p></a></li>'+
            '<li class="list-group-item green-border-right"><a href="grid-template.html?section=challenge&header=Challenge&header_color=blue"><img src="elements/icon_game.jpg" class="icon-game" /><p class="nav-menu-text">GAME</p></a></li>'+
            '<li class="list-group-item green-border-right"><a href="grid-template.html?section=leaderboard&header=Leaderboard&header_color=green"><img src="elements/icon_leader.jpg" class="icon-leader" />LEADERBOARD</a></li>'+
            '<!--li class="list-group-item purple-border-right"><a href="credits.html"><img src="elements/icon_credits.jpg" class="icon-credits" />CREDITS</a></li>'+
            '<li class="list-group-item lime-border-right"><a href="profile.html"><img src="elements/icon_profile.jpg" class="icon-profile" />PROFILE</a></li>-->'+
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
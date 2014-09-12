var username = window.localStorage.getItem("username");
var password = window.localStorage.getItem("password");
var user_id = window.localStorage.getItem("user_id");
var credit = window.localStorage.getItem("credit");
var urlParams = queryParameters();

var appendToken = '&user_id='+user_id+'&PHP_AUTH_PW='+password+'&PHP_AUTH_USER='+username;


      
jQuery(document).ready(function() {

    $('#username').val(username);
    $('#password').val(password);
    $('#user-credits').val(credit);
    
   
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
        success: function(data) {

                eval('var res='+data);
                if (res['result']) {
                    window.localStorage.setItem("user_id", res['user_id']);
                    window.location = 'dashboard.html';
                } else {
                    alert(res['content']);
                }
        }
    });
}

/******************************************* END Login Functions ******************************************************************/

/******************************************* User Details --Dashboard ******************************************************************/

function getuserDets (userid) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=user'+appendToken,
        data : '',
        success: function(data) {

            eval('var res='+data);

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
        success: function(data) {

            eval('var categories='+data);
            if (categories) {
                for(var i=0; i<categories.length; i++) {

                    if (InDecks) {
                        var url = (cat=='') ? 'addToDeck&deck_id='+deck_id+'&deck_count='+urlParams.deck_count : 'deckCards';
                    } else {
                        var url = (cat=='') ? 'categories' : 'cards';
                    }

                    $('#body_template').append(
                        '<div class="row-fluid grid" id="'+categories[i]['category_id']+'" onclick="window.location=\'grid-template.html?cat_id='+categories[i]['category_id']+
                                                    '&deck_id='+deck_id+'&deck_count='+urlParams.deck_count+'&section='+url+'\'">'+
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
        success: function(data) {

            eval('var cards='+data);
            if (cards) {
                for(var i=0; i<cards.length; i++) {

                    var owned = '';
                    var onclick = '';
                    if (InDecks) {

                        onclick = 'addRemoveCardDecks('+cards[i]['card_id']+');';

                    } else {

                        onclick = window.location='card.html?card_id='+cards[i]['card_id'];
                        owned = (cards[i]['owned']=='0') ? ' notowned' : '';
                    }

                    $('#body_template').append(
                        '<div class="row grid'+owned+' cards" id="'+cards[i]['card_id']+'" onclick="'+onclick+'">'+
                            '<div class="col-xs-2">'+
                                '<img src="img/cards/'+cards[i]['card_id']+'.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-10 padded">'+
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

function getCard (card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=card&card_id='+card_id+appendToken,
        data : '',
        success: function(data) {

            eval('var car='+data);
            if (car) {
                
                $('#card-name').html(car['name']);
                $('#card-parts').html(car['scrap_value']);
                $('#card-img').attr('src', 'img/cards/'+car['card_id']+'.jpg');

            }
        }
    });
}

function scrapCard (card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=scrapcard&card_id='+card_id+appendToken,
        data : '',
        success: function(data) {

            eval('var res='+data);
            alert(res['content']);
        }
    });
}

/******************************************* END Card details ******************************************************************/

/******************************************* Products start here ******************************************************************/

function getproducts () {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=products'+appendToken,
        data : '',
        success: function(data) {

                eval('var products='+data);

                for(var i=0; i<products.length; i++) {

                    $('#body_template').append(
                        '<div class="row grid shop" id="'+products[i]['product_id']+'" onclick="window.location=\'product.html?'+
                                                        'product_id='+products[i]['product_id']+
                                                        '&description='+products[i]['description']+
                                                        '&price='+products[i]['price']+
                                                        '&pack_size='+products[i]['pack_size']+
                                                        '\'">'+
                            '<div class="col-xs-2">'+
                                '<img src="img/products/'+products[i]['product_id']+'.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-10 padded">'+
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
        success: function(data) {

                eval('var result='+data);
                alert(result['content']);
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
        success: function(data) {

                eval('var result='+data);
                if (result['result']) {

                    var url = (rename) ?
                        'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'&deck_count='+urlParams.deck_count :
                        'grid-template.html?section=addToDeck&deck_id='+result['deck_id']+'&deck_count=0';

                    window.location=url;
                } else {
                    alert(result['content']);
                }
        }
    });
}

function getdecks (user_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=getdecks'+appendToken,
        data : '',
        success: function(data) {

                eval('var decks='+data);

                for(var i=0; i<decks.length; i++) {

                    var owned = (decks[i]['playable']=='0') ? ' notowned' : '';

                    $('#body_template').append(
                        '<div class="row grid'+owned+' decks" id="'+decks[i]['deck_id']+'" onclick="window.location=\'grid-template.html?deck_id='+decks[i]['deck_id']+'&deck_count='+decks[i]['cards_in_deck']+'&section=viewDeck\'">'+
                            '<div class="col-xs-3">'+
                                '<img src="img/decks/'+decks[i]['deck_id']+'.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-9 padded">'+
                                '<div id="deck-name-'+decks[i]['deck_id']+'">'+decks[i]['description']+'</div>'
                                +'<span class="secondary"><span id="deck-count-'+decks[i]['deck_id']+'">'+decks[i]['cards_in_deck']+'</span> cards in deck</span>'+
                            '</div>'+
                        '</div>'
                    );

                }

                $('#body_template').append(
                    '<div class="row grid deck" onclick="window.location=\'create.html?section=decks\'">'+
                        '<div class="col-xs-3 padded" style="text-align:center;">'+
                            '<span class="glyphicon glyphicon-plus" style="text-align:center; color:#2c95f4;"></span>'+
                        '</div>'+
                        '<div class="col-xs-9 padded">'+
                            'Create New Deck'+
                        '</div>'+
                    '</div>'
                );
        }
    });
}

function footerDeckEdits() {
    $('#footer').html(
        '<div class="row deck-edit-holder">'+
                '<div class="col-xs-4 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-trash" id="deck-card-trash" onclick="editDeck(\'trash\');"></span>'+
                '</div>'+
                '<div class="col-xs-4 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit" onclick="editDeck(\'edit\');"></span>'+
                '</div>'+
                '<div class="col-xs-4 active-button" id="cancel-button" style="display:none;" onclick="uneditDeck();">'+
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
                onclick = "window.location=\'create.html?deck_id="+$(this).attr('id')+"&deck_name="+$('#deck-name-'+$(this).attr('id')).html()+"&deck_id="+$(this).attr('id')+"&deck_count="+$('#deck-count-'+$(this).attr('id')).html()+"\'";
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
            var newonclick = 'window.location=\'grid-template.html?deck_id='+$(this).attr('id')+'&section=viewDeck\'';
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
        success: function(data) {

                eval('var result='+data);
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
        success: function(data) {

                eval('var cards='+data);

                for(var i=0; i<cards.length; i++) {

                    $('#body_template').append(
                        '<div class="row grid cards" id="'+cards[i]['card_id']+'" onclick="window.location=\'card.html?card_id='+cards[i]['card_id']+'\'">'+
                            '<div class="col-xs-2">'+
                                '<img src="img/cards/'+cards[i]['card_id']+'.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-10 padded">'+
                                cards[i]['name']+
                            '</div>'+
                        '</div>'
                    );

                }
                $('#deck-card-count').html(cards.length);
                if (cards.length==10) {
                    $('#deck-card-add').addClass('inactive');
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
        success: function(data) {

                eval('var cards='+data);

        }
    });
}

function adddeckCards (deck_id, card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=addcardtodeck&deck_id='+deck_id+'&card_id='+card_id+appendToken,
        data : '',
        success: function(data) {

                eval('var cards='+data);

        }
    });
}

function removedeckCards (deck_id, card_id) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=removecardfromdeck&deck_id='+deck_id+'&card_id='+card_id+appendToken,
        data : '',
        success: function(data) {

                eval('var cards='+data);

        }
    });
}

function footerDeckCardEdits() {
    $('#footer').html(
        '<div class="row deck-edit-holder">'+
                '<div class="col-xs-3 deck-edit-div deck-edit-count">'+
                    '<span id="deck-card-count">***</span>/10'+
                '</div>'+
                '<div class="col-xs-3 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-plus" id="deck-card-add" onclick="window.location=\'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'&deck_count='+urlParams.deck_count+'\'"></span>'+
                '</div>'+
                '<div class="col-xs-3 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-edit" id="deck-card-edit" onclick="editDecksCards();"></span>'+
                '</div>'+
                '<div class="col-xs-3 active-button" id="cancel-button" style="display:none;" onclick="uneditDecksCards();">'+
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
            var newonclick = 'window.location=\'card.html?card_id='+$(this).attr('id')+'\'';
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

function checkTrashButton () {

    if ($('.selectedCard').attr('id')) { // Make clickable
        $('#deck-card-edit').removeClass('inactive');
    } else {
        $('#deck-card-edit').addClass('inactive');
    }
}

function footerCardEdits() {
    $('#footer').html(
        '<div class="row deck-edit-holder">'+
                '<div class="col-xs-9 deck-edit-div deck-edit-count">'+
                    '<span id="deck-card-count">'+urlParams.deck_count+'</span>/10'+
                '</div>'+
                '<div class="col-xs-3 active-button" id="save-button" onclick="window.location=\'grid-template.html?section=decks&deck_id='+urlParams.deck_id+'\'">'+
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
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
                        var url = (cat=='') ? 'addToDeck&deck_id='+deck_id : 'deckCards';
                    } else {
                        var url = (cat=='') ? 'categories' : 'cards';
                    }

                    $('#body_template').append(
                        '<div class="row-fluid grid" id="'+categories[i]['category_id']+'" onclick="window.location=\'grid-template.html?cat_id='+categories[i]['category_id']+
                                                    '&deck_id='+deck_id+'&section='+url+'\'">'+
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
                    var clickPrepend = '';
                    if (InDecks) {

                        var url = 'grid-template.html?section=viewDeck&addCard='+cards[i]['card_id']+'&';

                    } else {

                        var url = 'card.html?';
                        owned = (cards[i]['owned']=='0') ? ' notowned' : '';
                    }

                    $('#body_template').append(
                        '<div class="row grid'+owned+' cards" id="'+cards[i]['card_id']+'" onclick="window.location=\''+url+'card_id='+cards[i]['card_id']+'&deck_id='+deck_id+'\'">'+
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

function footerCardEdits() {
    $('#footer').html(
        '<div class="row deck-edit-holder">'+
                '<div class="col-xs-3 deck-edit-div deck-edit-count">'+
                    '<span id="deck-card-count">***</span>/10'+
                '</div>'+
                '<div class="col-xs-3 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-refresh"></span>'+
                '</div>'+
                '<div class="col-xs-3 scrap-edit-div">'+
                    '<span class="glyphicon glyphicon-wrench"></span>'+
                '</div>'+
        '</div>'
    );
    $('#footer').show();
}

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

/******************************************* Decks View start here ******************************************************************/

function newDeck (name) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=createdeck&deck_name='+name+appendToken,
        data : '',
        success: function(data) {

                eval('var result='+data);
                if (result['result']) {
                    window.location='grid-template.html?section=decks';
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
                        '<div class="row grid'+owned+' decks" id="'+decks[i]['deck_id']+'" onclick="window.location=\'grid-template.html?deck_id='+decks[i]['deck_id']+'&section=viewDeck\'">'+
                            '<div class="col-xs-3">'+
                                '<img src="img/decks/'+decks[i]['deck_id']+'.jpg" />'+
                            '</div>'+
                            '<div class="col-xs-9 padded">'+
                                decks[i]['description']+'<br />'
                                +'<span class="secondary">'+decks[i]['cards_in_deck']+' cards in deck</span>'+
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
    
    if (action=='trash') {

        $('#deck-card-edit').addClass('inactive');
        //onclick = 'deleteDeck();';
        $('#modal-content').html(
            'Are you sure you want to delete this deck?<button>Yes</button><button>Cancel</button>'
        );
        
    } else {

        $('#deck-card-trash').addClass('inactive');
        //onclick = 'renameDeck();';
        $('#model-heading').html('Are you sure you want to delete this Deck?');
        $('#modal-body').html(
            '<div class="row-fluid">'+
                '<div class="btn-group">'+
                    '<button type="button" class="btn btn-default">Yes</button>'+
                    '<button type="button" class="btn btn-default">Cancel</button>'+
                '</div>'+
            '</div>'
        );
    }

    $('.decks').each(
        function() {
            var newonclick = onclick;
            $(this).attr('onclick', "$('#myModal').modal();");
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
//
//function deleteDecks () {
//
//    $('.selectedCard').each(
//        function() {
//            $(this).removeClass('selectedCard');
//            removedeckCards (urlParams.deck_id, $(this).attr('id'));
//            $(this).remove();
//        }
//    );
//}

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

function footerDeckCardEdits() {
    $('#footer').html(
        '<div class="row deck-edit-holder">'+
                '<div class="col-xs-3 deck-edit-div deck-edit-count">'+
                    '<span id="deck-card-count">***</span>/10'+
                '</div>'+
                '<div class="col-xs-3 deck-edit-div">'+
                    '<span class="glyphicon glyphicon-plus" id="deck-card-add" onclick="window.location=\'grid-template.html?section=addToDeck&deck_id='+urlParams.deck_id+'\'"></span>'+
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
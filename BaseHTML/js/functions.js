var username = window.localStorage.getItem("username");
var password = window.localStorage.getItem("password");
var user_id = window.localStorage.getItem("user_id");
var urlParams = queryParameters();

var appendToken = '&user_id='+user_id+'&PHP_AUTH_PW='+password+'&PHP_AUTH_USER='+username;

jQuery(document).ready(function() {

    $('#username').val(username);
    $('#password').val(password);

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
                if (res['result']) {
                    $('#user-username').html(res['content']['username']);
                    $('#user-creds').html(result['content']['credits']);
                    $('#user-scrap').html(result['content']['parts']);
                }
        }
    });
}

function getCardCategories (cat) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=categories&category_id='+cat+appendToken,
        data : '',
        success: function(data) {

            eval('var categories='+data);
            if (categories) {
                for(var i=0; i<categories.length; i++) {

                    var url = (cat=='') ? 'categories' : 'cards';

                    $('#body_template').append(
                        '<div class="row-fluid grid" onclick="window.location=\'grid-template.html?cat_id='+categories[i]['category_id']+'&section='+url+'\'">'+
                            categories[i]['description']+
                        '</div>'
                    );

                }
            }
        }
    });
}

function getCards (cat) {

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=albumcards&category_id='+cat+appendToken,
        data : '',
        success: function(data) {

            eval('var cards='+data);
            if (cards) {
                for(var i=0; i<cards.length; i++) {

                    var owned = (cards[i]['owned']=='0') ? ' notowned' : '';

                    $('#body_template').append(
                        '<div class="row-fluid grid'+owned+' cars" onclick="window.location=\'card.html?card_id='+cards[i]['card_id']+'\'">'+
                            '<img src="img/cards/'+cards[i]['card_id']+'.jpg" />'+
                            '<div class="clear"></div>'+
                            cards[i]['name']+'<br />'
                            +'<span class="secondary">'+cards[i]['scrap_value']+'</span>'+
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
                        '<div class="row-fluid grid shop" onclick="window.location=\'product.html?product_id='+products[i]['product_id']+'\'">'+
                            '<img src="img/products/'+products[i]['product_id']+'.jpg" />'+
                            '<div class="clear"></div>'+
                            products[i]['description']+'<br />'
                            +'<span class="secondary">'+products[i]['pack_size']+' cards in pack</span>'+
                        '</div>'
                    );

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
                        '<div class="row-fluid grid'+owned+' cars" onclick="window.location=\'card.html?card_id='+decks[i]['deck_id']+'\'">'+
                            '<img src="img/decks/'+decks[i]['deck_id']+'.jpg" />'+
                            '<div class="clear"></div>'+
                            decks[i]['description']+'<br />'
                            +'<span class="secondary">'+decks[i]['cards_in_deck']+' cards in deck</span>'+
                        '</div>'
                    );

                }
        }
    });
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
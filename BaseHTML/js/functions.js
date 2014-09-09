jQuery(document).ready(function() {

    

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

    var ajax = jQuery.ajax({
        type: "POST",
        crossDomain: true,
        url: 'http://topcarcards.co.za/?request=login&PHP_AUTH_PW='+$('#password').val()+'&PHP_AUTH_USER='+$('#username').val(),
        data : '',
        success: function(data) {

                var result = xmlToArray(data);
                if (result['RESULT']=='true') {
                    window.location = 'dashboard.html';
                }
        }
    });
}

function xmlToArray (xml) {

    var thisArray = new Array();
    if($(xml).children().length > 0){
        $(xml).children().each(function(){
            if($(xml).find(this.nodeName).children().length > 0){

                //If it has children recursively get the inner array
                var NextNode = $(xml).find(this.nodeName);
                thisArray[this.nodeName] = xmlToArray(NextNode);

            } else {
                //If not then store the next value to the current array
                thisArray[this.nodeName] = $(xml).find(this.nodeName).text();
            }
        });
    }
    return thisArray;
}
var app = {
    // Application Constructor
    initialize: function() {
        var username = window.localStorage.getItem("username");
		document.getElementById('username').value = username;
		
		var password = window.localStorage.getItem("password");
		document.getElementById('password').value = password;
    }
};

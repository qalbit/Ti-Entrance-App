// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var DB = require("db");
var APP = require("utility");

/**
 * Loader Functions
 */
var doShowLoader = function() {
	$.act_loader.show();
};
var doHideLoader = function() {
	$.act_loader.hide();
};

/**
 * Additional Action Labels event listeners
 */
var doClickForgotPass = function() {
	var w_reset_password = Alloy.createController("w_reset_password").getView();
	w_reset_password.open();
	$.w_login.close();
};
var doClickRegister = function() {
	var w_register = Alloy.createController("w_register").getView();
	w_register.open();
	$.w_login.close();
};

/**
 * Server Callback function
 */
var onSuccessServerData = function(response) {
	try {
		var responseObj = JSON.parse(response);
		if (responseObj) {
			var status = responseObj.status || "ok";
			var message = responseObj.feedback || "";
			if (status != "ok") {
				Ti.App.Properties.setString('token', "");
				alert(message);
				doHideLoader();
				doHideLoginContainer(true);
				return;
			}

			var responseData = responseObj.data || null;
			if (responseData) {
				// Store DATA in DB
				DB.DAS.reset();
				DB.EMP.reset();
				DB.PLN.reset();
				DB.PRD.reset();
				DB.CLI.reset();
				if(Ti.App.Properties.getString("token", "") == "") {
					DB.DAT.reset();
				}
				// Rest SharedPreference 
				Ti.App.Properties.setString("user_info", "");
				var user = responseData.client || "";
				user = JSON.stringify(user);
				Ti.App.Properties.setString("user_info", user);
				
				var dasb = responseData.dashboard || {};
				var emps = responseData.employees || [];
				var plans = responseData.planning || [];
				var prods = responseData.products || [];
				var clients = responseData.clients || [];
				
				DB.DAS.setData(dasb);
				DB.EMP.setData(JSON.stringify(emps));
				DB.PLN.setData(JSON.stringify(plans));
				DB.CLI.setData(JSON.stringify(clients));
				
				var products = JSON.stringify(prods);
				var prdsArray = APP.convertIntoChunks(products, 2500);
				if(prdsArray && prdsArray.length > 0) {
					prdsArray.forEach(function(item) {
						DB.PRD.setData(item);
					});
				}
				
				/*
				for (var i = 0,
				    j = emps.length; i < j; i++) {
					var emp = emps[i];
					DB.EMP.setData(emp);
				};
				
				for (var k = 0,
				    l = plans.length; k < l; k++) {
					var plan = plans[k];
					DB.PLN.setData(plan);
				};
				
				for (var m = 0,
				    n = prods.length; m < n; m++) {
					var prod = prods[m];
					DB.PRD.setData(prod);
				};
			
				for (var o = 0,
				    p = clients.length; o < p; o++) {
					var client = clients[o];
					DB.CLI.setData(client);
				};
				*/
				
				var w_base = Alloy.createController("w_base").getView();
		 		$.w_login.close();
		 		doHideLoader();
			} else {
				doHideLoader();
			}
		} else {
			doHideLoader();
		}
	} catch(ex) {
		doHideLoader();
		Ti.API.error('Exception on Login ----> ' + ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.info('onErrorServerData --> ' + JSON.stringify(error));
	Ti.API.error(JSON.stringify(error));
	doHideLoader();
};

/**
 * Get data response from server
 */
var doGetServerData = function() {
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Data + Alloy.CFG.Debug;
	var data = {
		appid : Ti.App.Properties.getString("app_id", ""),
		token : Ti.App.Properties.getString("token", "")
	};
	new XHR().post(url, data, onSuccessServerData, onErrorServerData, {
		contentType : "application/x-www-form-urlencoded",
		timeout : '2000'
	});
};

/**
 * Validation function to validate all fields
 */
var doValidateFields = function() {
	// VALUES that need to be validate
	var username = ($.txf_username.value.toString()).trim() || "";
	var password = ($.txf_password.value.toString()).trim() || "";
	// Check Username here
	if (username == "") {
		alert("Please insert valid username.");
		return false;
	}
	if (password == "") {
		alert("Please insert password.");
		return false;
	} else if (password.length < 1) {
		alert("Please insert valid password. Must be required minimum 3 characters.");
		return false;
	}
	return true;
};

/**
 * Server Callback function for Login
 */
var onSuccessLogin = function(response) {
	Ti.API.info('Login Response from server ---> ' + JSON.stringify(response));
	try {
		var responseObj = JSON.parse(response);
		Ti.API.info('Response parsed ----> ' + JSON.stringify(responseObj));
		if (responseObj) {
			var status = responseObj.status || "ok";
			var message = responseObj.feedback || "";
			if (status != "ok") {
				alert(message);
				doHideLoader();
				return;
			}
			// Adding Token on the User data
			var token = responseObj.token || "";
			if (token != "") {
				Ti.App.Properties.setString('token', token);
			}
			Ti.API.info('Success Login [Token] -> ' + token);
			// Download Data
			doGetServerData();
		} else {
			doHideLoader();
		}
	} catch(ex) {
		Ti.API.info('Exception in Login -----> ' + JSON.stringify(ex));
		doHideLoader();
	}
};
var onErrorLogin = function(error) {
	Ti.API.info('Server error for login --> ' + JSON.stringify(error));
};

/**
 * Button 'Login' Event Listener
 */
var doClickLogin = function() {
	var isValid = doValidateFields();
	if (isValid) {
		if (Ti.Network.online) {
			doShowLoader();
			var username = ($.txf_username.value.toString()).trim() || "";
			var password = ($.txf_password.value.toString()).trim() || "";
			var data = {
				appid : Ti.App.Properties.getString('app_id') || "",
				username : username,
				password : password
			};

			// Temp Code
			if(username == "monteur" || username == "test") {
				Alloy.CFG.Url.Base = Alloy.CFG.Url.BaseDev;
			} else {
				Alloy.CFG.Url.Base = Alloy.CFG.Url.BaseLive;
			}
			var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Login; //  + Alloy.CFG.Debug
			console.log(url);
			new XHR().post(url, data, onSuccessLogin, onErrorLogin, {
				contentType : "application/x-www-form-urlencoded",
				timeout : '2000'
			});
		} else {
			alert(L("internet_required"));
		}
	}
};

var doTokenLogin = function(token) {
	if (Ti.Network.online) {
		doShowLoader();
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Login + Alloy.CFG.Debug;
		var data = {
			appid : Ti.App.Properties.getString('app_id') || "",
			token : token || ""
		};
		Ti.API.info('Login API ----> ' + data.toString())
		new XHR().post(url, data, onSuccessLogin, onErrorLogin, {
			contentType : "application/x-www-form-urlencoded",
			timeout : '2000'
		});
	} else {
		alert(L("internet_required"));
	}
};

/**
 * TextField's Event Listener
 */
var doFocusPassField = function() {
	$.txf_password.focus();
};

/**
 * Function to Show and Hide Login Container
 */
var doHideLoginContainer = function(visible) {
	if (visible) {
		$.v_loader.bottom = Alloy.CFG.Space.Normal;
		$.v_elem_holder.visible = true;
	} else {
		$.v_loader.bottom = null;
		$.v_elem_holder.visible = false;
	}
};

/**
 * Window's default Event Listener
 */
var doOpenWindow = function() {
	var token = Ti.App.Properties.getString("token", "");
	if (token != "") {
		// Open Base window and close Login window
		doHideLoginContainer(false);
		doShowLoader();
		doGetServerData();
		return;
	}
	// Initial focus for the Username field
	$.txf_username.focus();
};
var doCloseWindow = function() {
	$.destroy();
};

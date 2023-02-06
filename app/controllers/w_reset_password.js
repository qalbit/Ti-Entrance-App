// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;


/**
 * Additional Action Labels event listeners
 */
var doClickLoginBack = function() {
	var w_login = Alloy.createController("w_login").getView();
	w_login.open();
	$.w_reset_password.close();
};

/**
 * Validation function to validate all fields
 */
var doValidateFields = function() {
	// VALUES that need to be validate
	var username = ($.txf_username.value.toString()).trim() || "";
	if(username == "") {
		alert("Please insert valid username.");
		return false;
	}
	return true;
};

/**
 * Button 'Reset' Event Listener
 */
var doClickReset = function() {
	var isValid = doValidateFields();
	if(isValid) {
	}
};

/**
 * Window's default Event Listener
 */
var doOpenWindow = function() {
	// Initial focus for the Company Name field
	$.txf_username.focus();
};
var doCloseWindow = function() {
	$.destroy();
};
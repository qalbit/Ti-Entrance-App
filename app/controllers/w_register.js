// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

/**
 * Additional Action Labels event listeners
 */
var doClickLoginBack = function() {
	var w_login = Alloy.createController("w_login").getView();
	w_login.open();
	$.w_register.close();
};

/**
 * Validation function to validate all fields
 */
var doValidateFields = function() {
	// VALUES that need to be validate
	var companyName = ($.txf_companyname.value.toString()).trim() || "";
	var contactPerson = ($.txf_contactperson.value.toString()).trim() || "";
	var email = ($.txf_email.value.toString()).trim() || "";
	var contactNumber = ($.txf_phone.value.toString()).trim() || "";
	
	// Check Username here
	if(companyName == "") {
		alert("Please insert valid company name.");
		return false;
	}
	if(contactPerson == "") {
		alert("Please insert valid contact person name.");
		return false;
	}
	if(email == "") {
		alert("Please insert valid email address.");
		return false;
	}
	if(contactNumber == "") {
		alert("Please insert valid contact number.");
		return false;
	}
	return true;
};

/**
 * Button 'Register' Event Listener
 */
var doClickRegister = function() {
	$.txf_phone.blur();
	var isValid = doValidateFields();
	if(isValid) {
	}
};

/**
 * TextField's Event Listener
 */
var doFocusContactField = function() {
	$.txf_contactperson.focus();
};
var doFocusEmail = function() {
	$.txf_email.focus();
};
var doFocusPhone = function() {
	$.txf_phone.focus();
};

/**
 * Window's default Event Listener
 */
var doOpenWindow = function() {
	// Initial focus for the Company Name field
	$.txf_companyname.focus();
};
var doCloseWindow = function() {
	$.destroy();
};
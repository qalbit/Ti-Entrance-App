// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var LIST_DATA = [];
var FROM = args.from || "";

/**
 * IOS Navigation Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};

/**
 * Function to item click on Delivery
 */
var doItemClickDeliveryItem = function(arg) {
	var itemIndex = arg.itemIndex;
	var item = arg.section.getItemAt(itemIndex);
	if (( typeof item != "undefined") && ( typeof item != "null")) {
	}
};

/**
 * Button Send Failure Click Listener
 */
var doSendFailure = function() {
	var w_device_list_failure = Alloy.createController('w_device_list_failure').getView();
	if(OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_device_list_failure);
	} else {
		w_device_list_failure.open();
	}
};

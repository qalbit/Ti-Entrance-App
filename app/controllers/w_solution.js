// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");

var DATA = args.data || null;
Ti.API.info('Data received ---> ' + JSON.stringify(DATA));

/**
 * Update UI with Server Response received from w_error_device_list
 */
var doUpdateUIwithServerResponse = function(data) {
	if(data) {
		$.name_val.text = data.name || "";
		$.desc_val.text = data.description || "";
		$.sol_val.text = data.solution || "";
	}
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	doUpdateUIwithServerResponse(DATA);
	if (OS_ANDROID) {
		activity = $.w_solution.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_solution.close();
			};
		}
	}
};

var doCloseWindow = function() {
	$.destroy();
};
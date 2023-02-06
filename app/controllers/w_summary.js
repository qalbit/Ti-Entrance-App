// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;



/**
 * Window's event listeners
 */
var doOpenWindow 	= function() {
	if (OS_ANDROID) {
		activity = $.w_summary.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_summary.close();
			};
		}
	}
};
var doCloseWindow 	= function() {
	$.destroy();
};

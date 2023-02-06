// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

/**
 * IOS Navigation Button Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};
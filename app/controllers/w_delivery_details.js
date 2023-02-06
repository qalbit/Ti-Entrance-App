// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;


/**
 * Window's event listener
 */
var doOpenWindow = function() {};
var doCloseWindow = function() {
	$.destroy();
};

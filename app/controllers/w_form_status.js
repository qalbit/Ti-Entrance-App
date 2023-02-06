// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
$.w_form_status.transform = Titanium.UI.create2DMatrix().scale(0);

var a = Ti.UI.createAnimation({
    transform : Ti.UI.create2DMatrix().scale(1.1),
    duration : 700,
});
a.addEventListener('complete', function() {
    $.w_form_status.animate({
        transform: Ti.UI.create2DMatrix(),
        duration: 250
    });
});

function animateOpen() {
    $.w_form_status.animate(a);
}

/**
 * Window's Event Listener
 */
var doSwipeWindow = function(arg) {
	var direction = arg.direction || "";
	if(direction != "" && direction == "down") {
		$.w_form_status.close();
	}
};
var doCloseWindow = function() {
	$.destroy();
};

// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var IMAGE_FACTORY = require("ti.imagefactory");

// Function to Clear Paint
var doClearPaint = function() {
    $.paint.clear();
};

// Function to Save Paint
var doSavePaint = function() {
    var image = $.paint.toImage();
    var rotatedImage = IMAGE_FACTORY.imageWithRotation(image, {
        degrees: 90
    });
    args.doSaveSignature(image); //args.doSaveSignature(rotatedImage); -- Updated due to Client Concern
    $.w_add_signature.close();
};


// Window's Event Listener
var doOpenWin = function() {
	if (OS_ANDROID) {
        if (!$.w_add_signature.activity) {
        } else {
            var actionBar = $.w_add_signature.activity.actionBar;
            if (actionBar) {
                actionBar.displayHomeAsUp = true;
                actionBar.onHomeIconItemSelected = function() {
                    $.w_add_signature.close();
                };
            }
        }
    }
    Alloy.Globals.doStopToggle(true);
};
var doCloseWin = function() {
	Alloy.Globals.doStopToggle(false);
    $.destroy();
};
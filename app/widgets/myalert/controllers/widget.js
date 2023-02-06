$.init = function(arg) {
	$.alertdialog.title = arg.title || "Aantal";
	$.alertdialog.buttonNames = arg.buttons || ["Ok"];
	$.alertdialog.custId = arg.itemIndex;
	$.alertdialog.cancel = arg.cancel || 0;
	if(OS_ANDROID) {
		$.txf_android.value = arg.itemQty || 1;
	}
};

$.show = function() {
	$.alertdialog.show();
};

function doClickAlertDialog(e) {
	if(e.index === e.source.cancel) {
		return;
	}
	var qty = 1;
	if(OS_IOS) {
		qty = parseInt(e.text, 10) || 0;
	} else {
		qty = parseInt($.txf_android.value, 10) || 0;
	}
	$.trigger('valueAdded', {
		itemIndex: e.source.custId,
		itemQty: qty || 0
	});
};

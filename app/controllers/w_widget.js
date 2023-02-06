// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var P_WIDTH = Ti.Platform.displayCaps.platformWidth;

// Convert Pixel to DP Unit for Android
var pxToDp = function(px) {
	return (px / (Titanium.Platform.displayCaps.dpi / 160));
};
if(OS_ANDROID) {
	P_WIDTH = pxToDp(P_WIDTH);	
}

Ti.API.info('Widget Platform Width ---> ' + P_WIDTH);
$.mylist.init({
	header: {
		style: {
			width: Ti.UI.FILL,
			height: 60,
			backgroundColor: Alloy.CFG.Colors.colorPrimary,
			layout: 'horizontal'
		},
		data: [{
			text: "Artikelnummer",
			color: "white",
			width: (OS_IOS) ? P_WIDTH * 0.30 : P_WIDTH * 0.25,
			height: 60,
			backgroundColor: "transparent",
			font: {
				fontSize: 12,
				fontWeight: 'bold'
			}
		},{
			text: "Product",
			color: "white",
			width: (OS_IOS) ? P_WIDTH * 0.40 : P_WIDTH * 0.45,
			height: 60,
			backgroundColor: "transparent",
			font: {
				fontSize: 12,
				fontWeight: 'bold'
			}
		},{
			text: "Hoeveelheid",
			color: "white",
			width: (OS_IOS) ? P_WIDTH * 0.30 : P_WIDTH * 0.30,
			height: 60,
			backgroundColor: "transparent",
			font: {
				fontSize: 12,
				fontWeight: 'bold'
			}
		}]
	},
	items: {
		style: {
			top: 1,
			width: Ti.UI.FILL,
			height: 60,
			backgroundColor: "white",
			layout: "horizontal",
			semiBgColor: "#bfdfff"
		},
		dataStyle: [{
			color: "black",
			width: P_WIDTH * 0.25,
			height: 60,
			font: {
				fontSize: 14,
				fontWeight: 'normal'
			}
		}, {
			color: "black",
			width: P_WIDTH * 0.43,
			height: 60,
			font: {
				fontSize: 14,
				fontWeight: 'normal'
			}
		}, {
			color: "white",
			width: P_WIDTH * 0.32,
			height: 60,
			font: {
				fontSize: 12,
				fontWeight: 'bold'
			},
			backgroundColor: Alloy.CFG.Colors.colorPrimaryDark
		}]
	}
});

function doOpenQtyPopup(e) {
	Ti.API.info('Qty Popup ----> ' + JSON.stringify(e));
	$.myalert.init({
		title: "Select Quantity",
		message: "Please insert Quantity for selected product",
		buttons: ["Cancel", "Add"],
		cancel: 0,
		itemIndex: e.itemIndex || -1,
		itemQty: e.quantity || 1
	});
	$.myalert.show();
};

function doValueAddedQty(e) {
	Ti.API.info('Selected Qty ---> ' + JSON.stringify(e));
	$.mylist.doUpdateQtyPopupVal(e);
};

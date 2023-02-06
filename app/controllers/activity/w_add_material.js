// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require('db');
var XHR = require("xhr");
var APP = require("utility");
Ti.API.info('job_type ----> ' + args.job_type);
// Default Variables
var DATA = [];
var LIST_DATA = [];
var PRODUCT_IDS = [];
var PRODUCTS = [];

var SELECTED_PRODUCTS = [];
var SELECTED_MATERIALS = args.selectedMaterials || [];

var doSetListData = null;
var IS_FROM = args.isFrom || "material";

var tempData = [];

var MATERIAL_ITEMS = [];
var MATERIAL_DATA = DB.PRD.getData();
if (MATERIAL_DATA != null) {
	MATERIAL_DATA = APP.convertIntoString(MATERIAL_DATA);
	MATERIAL_DATA = JSON.parse(MATERIAL_DATA);
}

/**
 * Material items list
 */
if(args.job_type == "work_form") {
	Alloy.Globals.doGetListIdsMaterialsWorkForm = function() {
		return MATERIAL_ITEMS;
	};
}

/**
 * Make a list of all selected Materials
 */
if(args.job_type == "work_form") {
	Alloy.Globals.doGetListMaterialsWorkForm = function(data) {
		LIST_DATA = [];
		MATERIAL_ITEMS = [];
		if (data) {
			Ti.API.info('data -----> ' + JSON.stringify(data));
			for (var i = 0; i < data.length; i++) {
				var i1 = data[i];
				MATERIAL_ITEMS.push(i1);
			};;
		}
		$.list_activity.removeAllChildren();
		Ti.API.info('Material items ----> ' + JSON.stringify(MATERIAL_ITEMS));
		if (MATERIAL_ITEMS.length > 0) {
			for (var i = 0; i < MATERIAL_ITEMS.length; i++) {
				var item = MATERIAL_ITEMS[i];
				var mainItem = Ti.UI.createView({
					custData : item,
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE
				});
				var cont = Ti.UI.createView({
					custData : item,
					top : Alloy.CFG.Space.Small,
					bottom : Alloy.CFG.Space.Small,
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE
				});
				var itemQty = Ti.UI.createTextField({
					left : 0,
					width : 80,
					height : 40,
					textAlign : Titanium.UI.TEXT_ALIGNMENT_CENTER,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'bold'
					},
					keyboardType : Ti.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
					value : item.qty || "1",
					textAlign : Titanium.UI.TEXT_ALIGNMENT_CENTER,
					borderRadius : Alloy.CFG.Space.TwoDot,
					borderWidth : '1px',
					borderColor : Alloy.CFG.Colors.lblLightColor,
					hintTextColor : Alloy.CFG.Colors.tfLightColor,
					padding : {
						left : Alloy.CFG.Space.Normal,
						right : Alloy.CFG.Space.Normal
					},
					autocorrect : false,
					autocapitalization : false,
				});
				var itemProduct = Ti.UI.createLabel({
					left : 98,
					right : 150,
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'bold'
					},
					text : item.naam || "",
				});
				var itemNumber = Ti.UI.createLabel({
					right : 30,
					width : 110,
					height : Ti.UI.SIZE,
					textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'bold'
					},
					text : item.artikelnummer || "",
				});

				var itemRemove = Ti.UI.createImageView({
					right : 0,
					width : 26,
					height : 26,
					image : "/images/ic_delete.png",
					custData : item
				});
				itemRemove.addEventListener("click", function(arg) {
					Ti.API.info('Argument on Click ----> ' + JSON.stringify(arg));
					var dataObj = arg.source.custData || null;
					if (dataObj) {
						var id = dataObj.id || "";
						var replaceData = [];
						if (data && data.length > 0) {
							for (var i = 0; i < data.length; i++) {
								var dObj = data[i];
								if (dObj.id == id) {
								} else {
									replaceData.push(dObj);
								}
							};
						}
						if(args.job_type == "work_form") {
							Alloy.Globals.doGetListMaterialsWorkForm(replaceData);
						} else {
							Alloy.Globals.doGetListMaterials(replaceData);
						}
					}
				});
				cont.add(itemQty);
				cont.add(itemProduct);
				cont.add(itemNumber);
				cont.add(itemRemove);

				mainItem.add(cont);

				LIST_DATA.push(mainItem);
				$.list_activity.add(mainItem);
			};
			Ti.API.info('List size -----> ' + LIST_DATA.length);
		}
	};
}

console.log('[activity/w_add_material] job_type --->' + args.job_type);

var P_WIDTH = Ti.Platform.displayCaps.platformWidth;
// Convert Pixel to DP Unit for Android
var pxToDp = function(px) {
	return (px / (Titanium.Platform.displayCaps.dpi / 160));
};
if (OS_ANDROID) {
	P_WIDTH = pxToDp(P_WIDTH);
}
Ti.API.info('w_add_meterial P_WIDTH -------------> ' + P_WIDTH);

var selectedMaterials = ((args.job_type == "work_form")) ? Alloy.Globals.doGetListIdsMaterialsWorkForm() : Alloy.Globals.doGetListIdsMaterials();
if(IS_FROM == "add_device") {
	selectedMaterials = SELECTED_MATERIALS || [];
}
if (selectedMaterials && selectedMaterials.length > 0) {
	for (var i = 0,
	    j = selectedMaterials.length; i < j; i++) {
		var materialItem = selectedMaterials[i];
		if (materialItem && materialItem.custData) {
			materialItem.custData.qty = materialItem.qty || "01"; 
			tempData.push({
				id : materialItem.id || "",
				artikelnummer : materialItem.artikelnummer || "",
				naam : materialItem.naam || "",
				qty : materialItem.qty || "01",
				custData : materialItem.custData
			});
		} else {
			tempData.push({
				id : materialItem.id || "",
				artikelnummer : materialItem.artikelnummer || "",
				naam : materialItem.naam || "",
				qty : materialItem.qty || "01",
				custData : materialItem
			});
		}
	};
}

/**
 * Function for Client Search from API
 * onChange Listener for searchBar
 */
var doSearchChange = function(arg) {
	var text = ((OS_IOS) ? arg.value : arg.source.value) || "";
	if (text.length > 2) {
		doSearchData(text);
	}
};
var doSearchReturn = function(arg) {
	$.searchBar.blur();
};

/**
 * API function for fetching search data from Server
 * text will be used to search
 */
var doSearchData = function(text) {
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Search.Material || "";
	url = url.replace("SEARCH_FILTER", text);
	var debugSlug = Alloy.CFG.Debug;
	debugSlug = debugSlug.replace("?", "&");
	url += debugSlug;
	
	var data = {
		appid: Ti.App.Properties.getString("app_id", "") || "",
		token: Ti.App.Properties.getString("token", "") || ""
	};
	
	
	Ti.API.info('Url ---> ' + url);

	Ti.API.info('Sending before check[63] ---> ' + JSON.stringify(tempData));

	new XHR().post(url, data, function(result) {
		Ti.API.info('Search API Data ----> ' + JSON.stringify(result));
		try {
			var responseObj = JSON.parse(result);
			if (responseObj && responseObj.status == "ok") {
				var responseData = responseObj.data || [];
				$.mylist.doGetData(responseData, []);
			}
		} catch(ex) {
			Ti.API.error("Exception Search Client => " + ex);
		}
	}, function(error) {
		Ti.API.info('Server result error ---> ' + JSON.stringify(error));
	}, {
		contentType: "application/x-www-form-urlencoded",
		timeout: "2000"
	});
};

/**
 * Function to update selected Item from the list
 */
var onUpdateItemProduct = function(data) {
	Ti.API.info('Data refreshed ---> ' + JSON.stringify(data));
	if (tempData && tempData.length > 0) {
		var newData = [];
		tempData.forEach(function(item) {
			if (item.id == data.id && data.type == "remove") {
			} else {
				newData.push(item);
			}
		});
		tempData = newData;
		newData = null;
	}
};

/**
 * Function to clear list items from the list and clear search
 */
var onClearItemsProduct = function() {
};

/**
 * Function to get Material list items
 */
var doGetMaterialListItem = function() {
	SELECTED_PRODUCTS = (args.job_type == "work_form") ? Alloy.Globals.doGetListIdsMaterialsWorkForm() : Alloy.Globals.doGetListIdsMaterials();
};
doGetMaterialListItem();

/**
 * Function to add Materials
 */
var doAddMaterials = function() {
	// Get Selected Products with Qty
	$.mylist.doGetSelectedProducts(tempData, function(resp) {
		if (resp.success) {
			Ti.API.info('IS_FROM --> ' + IS_FROM);
			if(IS_FROM == "add_device") {
				args.doStoreMaterials(resp.data);
			} else {
				if(args.job_type == "work_form") {
					Alloy.Globals.doGetListMaterialsWorkForm(resp.data);
				} else {
					Alloy.Globals.doGetListMaterials(resp.data);
				}
			}
		}
		$.w_add_material.close();
	});
};

/**
 * Widget Events and initialization
 */

$.mylist.init({
	header : {
		style : {
			width : Ti.UI.FILL,
			height : 60,
			backgroundColor : Alloy.CFG.Colors.colorPrimary,
			layout : 'horizontal'
		},
		data : [{
			text : "Artikelnummer",
			color : "white",
			width : (OS_IOS) ? P_WIDTH * 0.30 : P_WIDTH * 0.25,
			height : 60,
			backgroundColor : "transparent",
			font : {
				fontSize : 12,
				fontWeight : 'bold'
			}
		}, {
			text : "Product",
			color : "white",
			width : (OS_IOS) ? P_WIDTH * 0.40 : P_WIDTH * 0.45,
			height : 60,
			backgroundColor : "transparent",
			font : {
				fontSize : 12,
				fontWeight : 'bold'
			}
		}, {
			text : "Aantal",
			color : "white",
			width : (OS_IOS) ? P_WIDTH * 0.30 : P_WIDTH * 0.30,
			height : 60,
			backgroundColor : "transparent",
			font : {
				fontSize : 12,
				fontWeight : 'bold'
			}
		}]
	},
	items : {
		style : {
			top : 1,
			width : Ti.UI.FILL,
			height : 60,
			backgroundColor : "white",
			layout : "horizontal",
			semiBgColor : "#bfdfff"
		},
		dataStyle : [{
			color : "black",
			width : P_WIDTH * 0.25,
			height : 60,
			font : {
				fontSize : 14,
				fontWeight : 'normal'
			}
		}, {
			color : "black",
			width : P_WIDTH * 0.43,
			height : 60,
			font : {
				fontSize : 14,
				fontWeight : 'normal'
			}
		}, {
			color : "white",
			width : P_WIDTH * 0.32,
			height : 60,
			font : {
				fontSize : 12,
				fontWeight : 'bold'
			},
			backgroundColor : Alloy.CFG.Colors.colorPrimaryDark
		}],
		data : []
	}
});

function doOpenQtyPopup(e) {
	Ti.API.info('Qty Popup ----> ' + JSON.stringify(e));
	if (e.itemIndex >= 0) {
		$.myalert.init({
			title : "Aantal",
			message : "Please insert Quantity for selected product",
			buttons : ["Annuleren", "Toevoegen"],
			cancel : 0,
			itemIndex : e.itemIndex,
			itemQty : e.quantity || 1
		});
		$.myalert.show();
	}
};

function doValueAddedQty(e) {
	Ti.API.info('Selected Qty ---> ' + JSON.stringify(e));
	$.mylist.doUpdateQtyPopupVal(e);
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	if (OS_ANDROID) {
		activity = $.w_add_material.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_add_material.close();
			};
			activity.onCreateOptionsMenu = function(e) {
				var menuItem = e.menu.add({
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
					icon : "images/ic_checkmark.png"
				});
				menuItem.addEventListener('click', function() {
					doAddMaterials();
				});
			};
			activity.invalidateOptionsMenu();
		}
	}
};
var doCloseAddMaterial = function() {
	$.destroy();
};

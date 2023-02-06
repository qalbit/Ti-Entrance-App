// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var APP = require("utility");

var LIST_DATA = [];
var MATERIAL_ITEMS = [];
var MATERIAL_DATA = DB.PRD.getData();
if (MATERIAL_DATA != null) {
	MATERIAL_DATA = APP.convertIntoString(MATERIAL_DATA);
	MATERIAL_DATA = JSON.parse(MATERIAL_DATA);
}

var SAVED_DATA = {};

/**
 * iOS Keyboard Events for Qty
 */
var doCancelKeyboardQty = function() {
	$.txf_item_qty.blur();
};
var doDoneKeyboardQty = function() {
	$.txf_item_qty.blur();
};

/**
 * TextField Value change listener
 */
var doChangeTextFieldValue = function(e) {
};

var doClickItemMaterial = function(e) {
	var index = e.itemIndex;
	var item = e.section.getItemAt(index);
};

/**
 * Material items list
 */
Alloy.Globals.doGetListIdsMaterials = function() {
	return MATERIAL_ITEMS;
};

/**
 * Make a list of all selected Materials
 */
Alloy.Globals.doGetListMaterials = function(data) {
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
					Alloy.Globals.doGetListMaterials(replaceData);
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

/**
 * Global function to Save Data
 */
Alloy.Globals.doSaveMaterial = function(_callback) {
	var items = $.list_activity.children;
	var DATA_SAVE = [];
	Ti.API.info('Save Material Items ====> ' + JSON.stringify(items));
	if (items) {
		for (var i = 0; i < items.length; i++) {
			var itemObj = items[i];
			var productId = itemObj.custData.id;
			var qty = itemObj.children[0].children[0].value || "0";
			if (qty != "0") {
				DATA_SAVE.push({
					product : itemObj.custData,
					productId : productId,
					qty : qty
				});
			}
		};
	}
	var d = {
		type : "material",
		data : DATA_SAVE
	};
	Ti.API.info('Material Save Callback ----> ' + JSON.stringify(d));
	_callback(d);
};

if (Alloy.Globals.SELECTED_ITEM) {
	Ti.API.info('Alloy.Globals.SELECTED_ITEM1 ---------> ' + JSON.stringify(Alloy.Globals.SELECTED_ITEM.data));
	var data = Alloy.Globals.SELECTED_ITEM.data;
	if (data != null) {
		var material = data.material || null;
		if (material && material.length > 0) {
			doLoadData(material);

			// Update MATERIAL Item Object
			for (var i = 0,
			    j = material.length; i < j; i++) {
				var item = material[i];
				var product = item.product || null;
				if(product) {
					product.qty = item.qty || "01";
					MATERIAL_ITEMS.push(product);
				}
			};
			Ti.API.info('Product Material[211] ---> ' + JSON.stringify(MATERIAL_ITEMS));
		}
	}
}

function doLoadData(data) {
	Ti.API.info('doLoadData ----> ' + JSON.stringify(data));
	LIST_DATA = [];

	$.list_activity.removeAllChildren();
	if (data && data.length > 0) {
		for (var i = 0; i < data.length; i++) {
			var item = data[i].product;
			var qty = data[i].qty || "1";
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
				value : qty || "1",
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
				text : item.naam,
			});
			var itemNumber = Ti.UI.createLabel({
				right : 0,
				width : 140,
				height : Ti.UI.SIZE,
				textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
				color : Alloy.CFG.Colors.lblDefaultColor,
				font : {
					fontSize : Alloy.CFG.FontSize.Small,
					fontWeight : 'bold'
				},
				text : item.artikelnummer,
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
						Ti.API.info('reload ----> ' + JSON.stringify(data));
						for (var k = 0; k < data.length; k++) {
							var dObj = data[k].product;
							Ti.API.info('reload dObj ----> ' + JSON.stringify(dObj));
							if (dObj.id == id) {
							} else {
								replaceData.push(data[k]);
							}
						};
					}
					Ti.API.info('Reloaded Data ====> ' + JSON.stringify(replaceData));
					doLoadData(replaceData);
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
	}
}

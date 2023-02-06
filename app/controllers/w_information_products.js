// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var PRODUCTS = args.data || [];
var DATA_INFO = args.dataInfo || null;
var IS_ALL_UPDATED = false;
var CLIENT_INFO = args.clientInfo || null;

/**
 * Close Window
 */
var doCloseWindowManually = function () {
	if (args.doCloseWindowManually) {
		args.doCloseWindowManually();
	}
	$.w_information_products.close();
};

/**
 * Prepare Products and open signature window
 */
var doPrepareProducts = function () {
	var HOLD_DATA = Ti.App.Properties.getString('info_products', '[]');
	HOLD_DATA = JSON.parse(HOLD_DATA);
	var data = [];
	if (HOLD_DATA && HOLD_DATA.length > 0) {
		HOLD_DATA.forEach(function (item) {
			if (item.id == DATA_INFO.id) {
				data.push(item);
			}
		});
	}

	if (data && data.length > 0) {
		// Check length for Data
		if (!IS_ALL_UPDATED) {
			// Alert Dialog Confirmation
			var d = Ti.UI.createAlertDialog({
				ok: 'Ok',
				message: 'U dient eerst alle producten te leveren alvorens deze afgesloten kunnen worden',
			});
			d.show();
			return;
		}

		var w_setting_date = Alloy.createController('w_setting_date', {
			sendData: data,
			custData: DATA_INFO,
			clientInfo: CLIENT_INFO,
			job_type: args.job_type || "",
			doCloseWindowManually: doCloseWindowManually
		}).getView();
		if (OS_IOS && Alloy.Globals.navWindow) {
			Alloy.Globals.navWindow.openWindow(w_setting_date);
		} else {
			w_setting_date.open();
		}

	} else {
		// Alert Dialog Confirmation
		var d = Ti.UI.createAlertDialog({
			ok: 'Ok',
			message: 'U dient eerst alle producten te leveren alvorens deze afgesloten kunnen worden',
		});
		d.show();
		return;
	}

};

/**
 * Hold Updated data here
 */
var doHoldData = function (id, data) {
	var HOLD_DATA = Ti.App.Properties.getString('info_products', '[]');
	HOLD_DATA = JSON.parse(HOLD_DATA);
	if (HOLD_DATA && HOLD_DATA.length > 0) {
		var isUpdated = false;
		HOLD_DATA.forEach(function (item, index) {
			if (item.id == data.id && item.product_id == data.product_id && item.delivery_item_id == data.delivery_item_id) {
				HOLD_DATA[index] = data;
				isUpdated = true;
			}
		});
		if (isUpdated == false) {
			HOLD_DATA.push(data);
		}
	} else {
		HOLD_DATA.push(data);
	}
	Ti.App.Properties.setString('info_products', JSON.stringify(HOLD_DATA));
	doInsertListItemsBasedOnProductsData(DATA_INFO.products);
};

/**
 * List Item Click Listener
 */
var doClickItemProduct = function (arg) {
	var itemIndex = arg.itemIndex;
	var clicked_item = arg.section.getItemAt(itemIndex);

	if (clicked_item && clicked_item != null && (typeof clicked_item != "undefined") && (typeof clicked_item != "null")) {
		var custData = clicked_item.properties.custData || null;
		if (custData) {
			var w_add_product_information = Alloy.createController("w_add_product_information", {
				data: custData,
				doHoldData: doHoldData,
				job_type: args.job_type || "",
				id: DATA_INFO.id || ""
			}).getView();
			if (OS_IOS && Alloy.Globals.navWindow) {
				Alloy.Globals.navWindow.openWindow(w_add_product_information);
			} else {
				w_add_product_information.open();
			}
		}
	}
};

/**
 * ListView Products Items Listing
 */
var doInsertListItemsBasedOnProductsData = function (data) {
	var HOLD_DATA = Ti.App.Properties.getString('info_products', '[]');
	HOLD_DATA = JSON.parse(HOLD_DATA);
	LIST_PRODUCTS = [];

	if (data && data.length > 0) {
		var count = 0;
		for (var i = 0,
				j = data.length; i < j; i++) {
			var product = data[i];

			// Check if the product is already filled
			Ti.API.info('Before Final Product ---> ' + JSON.stringify(product));
			var product_data = null;
			if (HOLD_DATA && HOLD_DATA.length > 0) {
				for (var k = 0,
						l = HOLD_DATA.length; k < l; k++) {
					var item = HOLD_DATA[k];
					if (item.id == DATA_INFO.id && item.product_id == product.product_id && item.delivery_item_id == product.delivery_item_id) {
						product.serial_number = item.serial || "";
						product.id_number = item.id_number || "";
						product.location_information = item.location || "";
						product.materials = item.materials || [];
						product.images = item.images || [];
						product.internal_description = item.internal_description || "";
						count++;
					}
				};
			} else {
				product.materials = [];
				product.images = [];
			}

			// Check product is filled each value or not
			var isFilled = false;
			if (product && product.id_number && product.serial_number && product.location_information) {
				isFilled = true;
			}

			LIST_PRODUCTS.push({
				template: "template_content_product",
				properties: {
					custData: product,
					type: "normal"
				},
				itemName: {
					text: product.name || ""
				},
				itemSerial: {
					text: "Artikelnummer: " + product.article_number + " | Serial: " + product.serial_number || ""
				},
				itemLocation: {
					text: "Locatie: " + product.location_information || ""
				},
				itemDescription: {
					text: "Beschrijving: " + product.description || ""
				},
				itemCompleted: {
					visible: (isFilled) ? true : false
				},
			});
		}

		if (count == LIST_PRODUCTS.length) {
			IS_ALL_UPDATED = true;
		} else {
			IS_ALL_UPDATED = false;
		}
	}
	Ti.API.info('Products ---> ' + LIST_PRODUCTS.length);
	$.listsec_product.setItems(LIST_PRODUCTS);
};

/**
 * Window's Event Listener
 */
var doOpenWindow = function () {
	doInsertListItemsBasedOnProductsData(DATA_INFO.products);
	if (OS_ANDROID) {
		var activity = $.w_information_products.activity,
			actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function () {
				$.w_information_products.close();
			};
		}
	}
};
var doCloseWindow = function () {
	$.destroy();
};
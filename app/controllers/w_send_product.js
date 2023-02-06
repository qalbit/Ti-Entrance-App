// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var moment = require("moment");
var XHR = require("xhr");

var dataSend = args.sendData || null;
var custData = args.custData || null;
var clientInfo = args.clientInfo || null;

var LIST_DATA = [];
var SIGNATURE_BLOB = null;


// Picker Default Variables
var PICKER_CONTAINER_ARRIVAL = null;
var PICKER_CONTAINER_DEPART = null;
var PICKER_CONTAINER_DATE = null;
var PICKER_OBJ_DATE = null;
var PICKER_OBJ_ARR_TIME = null;
var PICKER_OBJ_DEP_TIME = null;
var currentDate = moment().format("DD-MM-YYYY");
var currentTime = moment().format("HH:mm");
var currentTimeDep = moment().add(1, 'hour').format("HH:mm");

/**
 * Set default value
 */
 (function() {
	var settings = Ti.App.Properties.getString('settings_datetime', "");
	if(settings && settings != "") {
		settings = JSON.parse(settings);
		$.txf_date_val.text = settings.date;
		$.txf_arrival_val.text = settings.arrival;
		$.txf_depart_val.text = settings.depart;
	}
	if(clientInfo) {
		$.txf_name_del.value = clientInfo.name || "";
		$.txf_email_del.value = clientInfo.email || "";
	}
})();

function extend(obj, src) {
	for (var key in src) {
		if (src.hasOwnProperty(key))
			obj[key] = src[key];
	}
	return obj;
}

/**
 * Picker iOS click listener
 */
 function doCancelSelectedDateiOS() {
	if (PICKER_CONTAINER_DATE) { $.w_send_product.remove(PICKER_CONTAINER_DATE); }
}
function doSaveSelectedDateiOS() {
	if(PICKER_OBJ_DATE) {
		var val = PICKER_OBJ_DATE.value;
		var formatDate = moment(val).format("DD-MM-YYYY");
		$.txf_date_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DATE) { $.w_send_product.remove(PICKER_CONTAINER_DATE); }
}

function doCancelSelectedArrivaliOS() {
	if (PICKER_CONTAINER_ARRIVAL) { $.w_send_product.remove(PICKER_CONTAINER_ARRIVAL); }
}
function doSaveSelectedArrivaliOS() {
	if(PICKER_OBJ_ARR_TIME) {
		var val = PICKER_OBJ_ARR_TIME.value;
		var arrivalTime = moment(val);
		var nextTime 	= moment(val).add(1, 'hour');
		var formatDate 	= arrivalTime.format("HH:mm");
		var formatDate1 = nextTime.format("HH:mm");

		$.txf_depart_val.text = formatDate1;
		$.txf_arrival_val.text = formatDate;
	}
	if (PICKER_CONTAINER_ARRIVAL) { $.w_send_product.remove(PICKER_CONTAINER_ARRIVAL); }
}

function doCancelSelectedDepiOS() {
	if (PICKER_CONTAINER_DEPART) { $.w_send_product.remove(PICKER_CONTAINER_DEPART); }
}
function doSaveSelectedDepiOS() {
	if(PICKER_OBJ_DEP_TIME) {
		var val = PICKER_OBJ_DEP_TIME.value;
		var formatDate 	= moment(val).format("HH:mm");
		$.txf_depart_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DEPART) { $.w_send_product.remove(PICKER_CONTAINER_DEPART); }
}

/**
 * Picker click listener
 */
var doSetDate = function() {
	try {
		if(OS_IOS) {
			if(PICKER_CONTAINER_DATE == null) {
				PICKER_CONTAINER_DATE = Ti.UI.createView({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					bottom: 0,
					layout: 'vertical',
					backgroundColor: Alloy.CFG.Colors.lblLightColor
				});
				var toolbar = Ti.UI.createToolbar({
					top: 0,
					width: Ti.UI.FILL,
					height: 42,
					barColor: Alloy.CFG.Colors.lblLightColor
				});
				var cancel = Ti.UI.createButton({
					title: "annuleren",
					color: Alloy.CFG.Colors.colorPrimary
				});
				cancel.addEventListener('click', doCancelSelectedDateiOS);
				var send = Ti.UI.createButton({
					title: "Opslaan",
					color: Alloy.CFG.Colors.colorPrimary
				});
				send.addEventListener('click', doSaveSelectedDateiOS);
				var flexSpace = Ti.UI.createButton({
					systemButton: Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
				});
				toolbar.items = [cancel, flexSpace, send];
				PICKER_CONTAINER_DATE.add(toolbar);
				PICKER_OBJ_DATE = Ti.UI.createPicker({
					bottom: 0,
					backgroundColor: Alloy.CFG.Colors.lblLightColor,
					type: Ti.UI.PICKER_TYPE_DATE,
					datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
					locale: "nl-NL"
				});
				PICKER_CONTAINER_DATE.add(PICKER_OBJ_DATE);
			}
			if(PICKER_CONTAINER_DATE) { $.w_send_product.remove(PICKER_CONTAINER_DATE); }
			$.w_send_product.add(PICKER_CONTAINER_DATE);
		} else {
			var picker = Ti.UI.createPicker({
				type: Ti.UI.PICKER_TYPE_DATE,
				value: new Date(),
				locale: "nl-NL"
			});
			picker.showDatePickerDialog({
				value: new Date(),
				callback: function(e) {
					if(e.cancel) {} else {
						var formatDate = moment(e.value).format('DD-MM-YYYY');
						$.txf_date_val.text = formatDate;
					}
				}
			});
		}
	} catch(ex) {
		Ti.API.debug('Exception ---> ' + ex);
	}
};
var doArrivalTimeOpen = function() {
	try {
		if(OS_IOS) {
			if(PICKER_CONTAINER_ARRIVAL == null) {
				PICKER_CONTAINER_ARRIVAL = Ti.UI.createView({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					bottom: 0,
					layout: 'vertical',
					backgroundColor: Alloy.CFG.Colors.lblLightColor
				});
				var toolbar = Ti.UI.createToolbar({
					top: 0,
					width: Ti.UI.FILL,
					height: 42,
					barColor: Alloy.CFG.Colors.lblLightColor
				});
				var cancel = Ti.UI.createButton({
					title: "annuleren",
					color: Alloy.CFG.Colors.colorPrimary
				});
				cancel.addEventListener('click', doCancelSelectedArrivaliOS);
				var send = Ti.UI.createButton({
					title: "Opslaan",
					color: Alloy.CFG.Colors.colorPrimary
				});
				send.addEventListener('click', doSaveSelectedArrivaliOS);
				var flexSpace = Ti.UI.createButton({
					systemButton: Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
				});
				toolbar.items = [cancel, flexSpace, send];
				PICKER_CONTAINER_ARRIVAL.add(toolbar);
				PICKER_OBJ_ARR_TIME = Ti.UI.createPicker({
					bottom: 0,
					backgroundColor: Alloy.CFG.Colors.lblLightColor,
					type: Ti.UI.PICKER_TYPE_TIME,
					datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
					locale: "nl-NL",
					format24: true
				});
				PICKER_CONTAINER_ARRIVAL.add(PICKER_OBJ_ARR_TIME);
			}
			if(PICKER_CONTAINER_ARRIVAL) { $.w_send_product.remove(PICKER_CONTAINER_ARRIVAL); }
			$.w_send_product.add(PICKER_CONTAINER_ARRIVAL);
		} else {
			var picker = Ti.UI.createPicker({
				type: Ti.UI.PICKER_TYPE_TIME,
				value: new Date(),
				locale: "nl-NL",
				format24: true
			});
			picker.showTimePickerDialog({
				value: new Date(),
				locale : "nl-NL",
				format24: true,
				callback: function(e) {
					if(e.cancel) {} else {
						var arrivalTime = moment(e.value);
						var nextTime 	= moment(e.value).add(1, 'hour');
						var formatDate 	= arrivalTime.format("HH:mm");
						var formatDate1 = nextTime.format("HH:mm");
						$.txf_arrival_val.text = formatDate;
						$.txf_depart_val.text = formatDate1;
					}
				}
			});
		}
	} catch(ex) {
		Ti.API.debug('Exception ---> ' + ex);
	}
};
var doDepTimeOpen = function() {
	try {
		if(OS_IOS) {
			if(PICKER_CONTAINER_DEPART == null) {
				PICKER_CONTAINER_DEPART = Ti.UI.createView({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					bottom: 0,
					layout: 'vertical',
					backgroundColor: Alloy.CFG.Colors.lblLightColor
				});
				var toolbar = Ti.UI.createToolbar({
					top: 0,
					width: Ti.UI.FILL,
					height: 42,
					barColor: Alloy.CFG.Colors.lblLightColor
				});
				var cancel = Ti.UI.createButton({
					title: "annuleren",
					color: Alloy.CFG.Colors.colorPrimary
				});
				cancel.addEventListener('click', doCancelSelectedDepiOS);
				var send = Ti.UI.createButton({
					title: "Opslaan",
					color: Alloy.CFG.Colors.colorPrimary
				});
				send.addEventListener('click', doSaveSelectedDepiOS);
				var flexSpace = Ti.UI.createButton({
					systemButton: Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
				});
				toolbar.items = [cancel, flexSpace, send];
				PICKER_CONTAINER_DEPART.add(toolbar);
				PICKER_OBJ_DEP_TIME = Ti.UI.createPicker({
					bottom: 0,
					backgroundColor: Alloy.CFG.Colors.lblLightColor,
					type: Ti.UI.PICKER_TYPE_TIME,
					datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
					locale: "nl-NL",
					format24: true
				});
				PICKER_CONTAINER_DEPART.add(PICKER_OBJ_DEP_TIME);
			}
			if(PICKER_CONTAINER_DEPART) { $.w_send_product.remove(PICKER_CONTAINER_DEPART); }
			$.w_send_product.add(PICKER_CONTAINER_DEPART);
		} else {
			var picker = Ti.UI.createPicker({
				type: Ti.UI.PICKER_TYPE_TIME,
				value: new Date(),
				locale: "nl-NL",
				format24: true
			});
			picker.showTimePickerDialog({
				value: new Date(),
				locale : "nl-NL",
				format24: true,
				callback: function(e) {
					if(e.cancel) {} else {
						var formatDate = moment(e.value).format("HH:mm");
						$.txf_depart_val.text = formatDate;
					}
				}
			});
		}
	} catch(ex) {
		Ti.API.debug('Exception ---> ' + ex);
	}
};

/**
 * Server Callback function
 */
var onSuccessServerData = function(response) {
	try {
		Ti.API.info('Send Response ---.> ' + response);
		var responseObj = JSON.parse(response);
		if (responseObj) {
			Ti.API.info('Response Data ---> ' + JSON.stringify(responseObj));
			if(responseObj && responseObj.status == "ok") {
				Ti.App.Properties.setString('info_products', '[]');
				args.doCloseWindowManually();
				$.w_send_product.close();	
			} else {
				alert(responseObj.feedback);
			}
		}
	} catch(ex) {
		alert(ex.message);
		Ti.API.error('Exception on Send Product ----> ' + ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.error(JSON.stringify(error));
};

/**
 * Send data to server
 */
var doSendDataOnServer = function() {
	// Prepare data Send Object
	Ti.API.info('Data Send Object ====> ' + JSON.stringify(dataSend));
	var dataObj = {};
	var IMAGES = {};
	var dataObjArray = [];
	dataSend.forEach(function(item) {
		// Update Item Materials
		var materials = [];
		if(item.materials) {
			item.materials.forEach(function(material) {
				materials.push({
					id: material.id,
					qty: material.qty
				});
			});
		}
		dataObjArray.push({
			id: item.id,
			delivery_item_id: item.delivery_item_id,
			product_id: item.product_id,
			name: item.name,
			serial: item.serial,
			id_number: item.id_number,
			location: item.location,
			internal_description: item.internal_description || "",
			materials: materials
		});
		if(item.images && item.images.length > 0) {
			item.images.forEach(function(ig, index) {
				var filePath = ig.filePath || "";
				var file = Ti.Filesystem.getFile(filePath);
				IMAGES['ig_product_' + item.delivery_item_id + '_' + (index + 1)] = file;
			});
		}
	});
	dataObj['products'] = dataObjArray;
	var name = $.txf_name_del.value;
	if(name == "") {
		alert('Naam, e-mail en handtekening zijn verplicht om door te gaan');
		return;
	}
	var email = $.txf_email_del.value;
	if(email == "") {
		alert('Naam, e-mail en handtekening zijn verplicht om door te gaan');
		return;
	}
	if(SIGNATURE_BLOB == null) {
		alert('Naam, e-mail en handtekening zijn verplicht om door te gaan');
		return;
	}

	var date = $.txf_date_val.text || "";
	var arrival = $.txf_arrival_val.text || "";
	var depart = $.txf_depart_val.text || "";
	
	var dataSendObj = {
		token : Ti.App.Properties.getString("token", ""),
		appid : Ti.App.Properties.getString("app_id") || "",
		data : JSON.stringify(dataObj),
		name: name,
		email : email,
		id: custData.id || "",
		date: date || "",
		arrival: arrival || "",
		depart: depart || ""
	};
	
	IMAGES['ig_signature'] = Ti.Filesystem.getFile(SIGNATURE_BLOB) || null;

	if (_.isEmpty(IMAGES)) {
	} else {
		dataSendObj = extend(dataSendObj, IMAGES);
	}
	
	// Alert Dialog Confirmation
	var d = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['Ok', 'Annuleren'],
		message: 'U staat op het punt de levering af te sluiten wilt u doorgaan',
		title: 'Bevestigen'
	});
	d.addEventListener('click', function(e) {
		if(e.index == e.source.cancel) {
			return;
		}
		// API to Send Data
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Delivery + Alloy.CFG.Debug;
		Ti.API.info('Submit data url ---> '+ url);
		Ti.API.info('Submit data  ---> '+  JSON.stringify(dataSendObj));
		new XHR().post(url, dataSendObj, onSuccessServerData, onErrorServerData, {
			enctype : "multipart/form-data"
		});
	});
	d.show();
};

/**
 * Insert Signature
 */
var doInsertSignature = function(igBlob) {
	$.ig_signature.image = igBlob;
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "product-signature.png");
	file.write(igBlob);
	SIGNATURE_BLOB = file.nativePath;
};

/**
 * Paint Window
 */
var doOpenPaintWin = function() {
	var w_add_signature = Alloy.createController("w_add_signature", {
		doSaveSignature : doInsertSignature,
		job_type: args.job_type || "",
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		//Alloy.Globals.navWindow.openWindow(w_add_signature);
		w_add_signature.open();
	} else {
		w_add_signature.open();
	}
};

/**
 * Function to update listview
 */
var updateListView = function(data) {
	$.scrlist_products.removeAllChildren();
	if (data && data.length > 0) {
		for (var i = 0,
		    j = data.length; i < j; i++) {
			var product = data[i];
			var item = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				backgroundColor: 'transparent',
			});
			var itemCont = Ti.UI.createView({
				top: Alloy.CFG.Space.Tiny,
				bottom: Alloy.CFG.Space.Tiny,
				left: Alloy.CFG.Space.Normal,
				right: Alloy.CFG.Space.Normal,
				backgroundColor: Alloy.CFG.Colors.bgLightGray,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE
			});
			var itemHolder = Ti.UI.createView({
				top: Alloy.CFG.Space.Normal,
				left: Alloy.CFG.Space.Normal,
				right: Alloy.CFG.Space.Normal,
				bottom: Alloy.CFG.Space.Normal,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				layout: 'vertical'
			});
			var itemName = Ti.UI.createLabel({
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				font: {
					fontSize: Alloy.CFG.FontSize.Small,
					fontWeight: 'bold'
				},
				text: product.name || "",
				color: Alloy.CFG.Colors.lblDarkColor
			});
			itemHolder.add(itemName);
			var itemSerial = Ti.UI.createLabel({
				top: Alloy.CFG.Space.Tiny,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				font: {
					fontSize: Alloy.CFG.FontSize.Tiny,
					fontWeight: 'normal'
				},
				text: "Serial: " + product.serial || "",
				color: Alloy.CFG.Colors.lblSemiDarkColor
			});
			itemHolder.add(itemSerial);
			var itemLocation = Ti.UI.createLabel({
				top: Alloy.CFG.Space.Tiny,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				font: {
					fontSize: Alloy.CFG.FontSize.Tiny,
					fontWeight: 'normal'
				},
				text: "Location: " + product.location || "",
				color: Alloy.CFG.Colors.lblSemiDarkColor
			});
			itemHolder.add(itemLocation);
			// Top Seperator
			var topSeperator = Ti.UI.createView({
				top: Alloy.CFG.Space.Normal,
				width: Ti.UI.FILL,
				height: 1,
				backgroundColor: '#ACACAC'
			});
			itemHolder.add(topSeperator);
			var itemMaterialKey = Ti.UI.createLabel({
				top: Alloy.CFG.Space.Small,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				font: {
					fontSize: Alloy.CFG.FontSize.Small,
					fontWeight: 'normal'
				},
				text: "Gebruikte materialen",
				color: Alloy.CFG.Colors.lblDefaultColor
			});
			itemHolder.add(itemMaterialKey);
			// Bottom Seperator
			var bottomSeperator = Ti.UI.createView({
				top: Alloy.CFG.Space.Small,
				width: Ti.UI.FILL,
				height: 1,
				backgroundColor: '#ACACAC'
			});
			itemHolder.add(bottomSeperator);
			
			// List of all Materials
			var materialItem = Ti.UI.createView({
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				layout: 'vertical'
			});
			if(product.materials) {
				product.materials.forEach(function(item) {
					var itemMaterialCont = Ti.UI.createView({
						width: Ti.UI.FILL,
						height: Ti.UI.SIZE,
						top: Alloy.CFG.Space.Tiny,
						bottom: Alloy.CFG.Space.Tiny,
					});
					var itemMaterialName = Ti.UI.createLabel({
						width: Ti.UI.FILL,
						height: Ti.UI.SIZE,
						left: 0,
						right: 100,
						font: {
							fontSize: Alloy.CFG.FontSize.Small,
							fontWeight: 'normal'
						},
						text: item.custData.naam || "",
						color: Alloy.CFG.Colors.lblSemiDarkColor
					});
					itemMaterialCont.add(itemMaterialName);
					var itemMaterialQty = Ti.UI.createLabel({
						width: 100,
						height: Ti.UI.SIZE,
						textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
						right: 0,
						font: {
							fontSize: Alloy.CFG.FontSize.Small,
							fontWeight: 'normal'
						},
						text: parseInt(item.qty, 10) || "",
						color: Alloy.CFG.Colors.lblSemiDarkColor
					});
					itemMaterialCont.add(itemMaterialQty);
					materialItem.add(itemMaterialCont);
				});
			}
			itemHolder.add(materialItem);
			
			// Image Previews
			var imageItems = Ti.UI.createView({
				left: 0,
				right: 0,
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				layout: 'horizontal',
			});
			Ti.API.info('product.images[306] ----> ' + JSON.stringify(product));
			if(product.images) {
				product.images.forEach(function(item) {
					Ti.API.info('item[309] ----> ' + JSON.stringify(item));
					var filePath = item.filePath || "";
					var file = Ti.Filesystem.getFile(filePath);
					var itemIgOverlay = Ti.UI.createView({
						width: 120,
						height: 120,
					});
					var itemIg = Ti.UI.createImageView({
						width: 100,
						height: 100,
						top: 10,
						left: 10,
						image: file
					});
					itemIgOverlay.add(itemIg);
					imageItems.add(itemIgOverlay);
				});
			}
			itemHolder.add(imageItems);
			
			itemCont.add(itemHolder);
			item.add(itemCont);
			$.scrlist_products.add(item);
		}
	}
	// scrlist_products
};

/**
 * Window's Event Listener
 */
var doOpenWindow = function() {
	// Get Name, Email & Signature
	var infoSignature = Ti.App.Properties.getString('info_signature', "");
	if(infoSignature) {
		infoSignature = JSON.parse(infoSignature);
		if(infoSignature && infoSignature.name != "") {
			$.txf_name_del.value = infoSignature.name;
		}
		if(infoSignature && infoSignature.email != "") {
			$.txf_email_del.value = infoSignature.email;
		}
		SIGNATURE_BLOB = infoSignature.signature || null;
		if( SIGNATURE_BLOB ) {
			var file = Ti.Filesystem.getFile(SIGNATURE_BLOB);
			var blob = file.read();
			$.ig_signature.image = blob;	
		}
	}
	updateListView(dataSend);
	if (OS_ANDROID) {
		var activity = $.w_send_product.activity,
		    actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_send_product.close();
			};
		}
	}
};
var doCloseWindow = function() {
	// Auto Save Name, Email & Signature
	var name = $.txf_name_del.value;
	var email = $.txf_email_del.value;
	var dataSignature = {
		name: name,
		email: email,
		signature: SIGNATURE_BLOB
	};
	Ti.App.Properties.setString('info_signature', JSON.stringify(dataSignature));
	$.destroy();
};

// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var APP = require("utility");

var DATA = args.data || null;
var IMG_DATA = [];
var MATERIAL_LIST_DATA = [];
var MATERIAL_ITEMS = [];
var ID = args.id || "";
Ti.API.info('[w_add_product_information] job_type ---> ' + args.job_type);

// Update Product UI
var doUpdateProductInformation = function(data) {
	if(data) {
		Ti.API.info('w_add_product_information[16] data ---> ' + JSON.stringify(data));
		$.lbl_product_title.text 	= data.name || "";
		$.txf_serial.value 			= data.serial_number || "";
		$.txf_id.value 				= data.id_number || "";
		$.txf_location.value 		= data.location_information || "";
		$.txf_opmerking.value 		= data.internal_description || "";
		Ti.API.info('w_add_product_information[19] Materials ----> ' + JSON.stringify(data.materials));	
	}
	if( data && data.images ) {
		IMG_DATA = [];
		data.images.forEach(function(item) {
			IMG_DATA.push({
				name : item.name,
				image : item.image,
				filePath : item.filePath
			});
		});
		doUpdateImageList();
	}
	if( data && data.materials ) {
		doSetMaterialItems(data.materials);
	}
};

/**
 * Function to add Multiple Photos
 */
var doAddMultiplePhotos = function() {
	// Option Dialog
	var opts = {
		title : "Foto's toevoegen!"
	};
	if (OS_IOS) {
		opts.options = ['Gallery', 'Camera', 'Annuleren'];
	} else {
		opts.options = ['Gallery', 'Annuleren'];
		opts.buttonNames = ['Camera'];
	}
	var d = Ti.UI.createOptionDialog(opts);
		d.addEventListener('click', onOptionsDialogSelect);
		d.addEventListener('cancel', function(e) {
	});
	d.show();
};

/**
 * Function to add materials
 */
var doAddMultipleMaterial = function() {
	var w_add_material = Alloy.createController('/activity/w_add_material', {
		job_type: args.job_type || "",
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_add_material);
	} else {
		w_add_material.open();
	}
};

/**
 * Option Dialog Click Listener
 */
function onOptionsDialogSelect(e) {
	if (OS_ANDROID) {
		if (e.button === false && e.index === 0) {
			doOptionGallery();
		}
		if (e.button === true && e.index === 0) {
			doOptionCamera();
		}
	} else {
		if (e.index == 0) {
			doOptionGallery();
		}
		if (e.index == 1) {
			doOptionCamera();
		}
	}
};

/**
 * Gallery Option Clicked
 */
function doOptionGallery() {
	if (OS_IOS) {
		if (Ti.Media.hasPhotoGalleryPermissions()) {
			doSelectPhotoFromGallery();
		} else {
			Ti.Media.requestPhotoGalleryPermissions(function(e) {
				if (e.success) {
					doSelectPhotoFromGallery();
				}
			});
		}
	} else {
		var permissionRead = "android.permission.READ_EXTERNAL_STORAGE";
		var permissionWrite = "android.permission.WRITE_EXTERNAL_STORAGE";
		if ((!Ti.Android.hasPermission(permissionRead)) && (!Ti.Android.hasPermission(permissionWrite))) {
			Ti.Android.requestPermissions([permissionRead, permissionWrite], function(e) {
				if (e.success) {
					doSelectPhotoFromGallery();
				}
			});
		} else {
			doSelectPhotoFromGallery();
		}
	}
};

/**
 * Camera Option Clicked
 */
function doOptionCamera() {
	if (Ti.Media.hasCameraPermissions()) {
		doSelectCameraFromCamera();
	} else {
		Ti.Media.requestCameraPermissions(function(e) {
			if (e.success) {
				doSelectCameraFromCamera();
			}
		});
	}
};

/**
 * Select Photo from Gallery
 */
function doSelectPhotoFromGallery() {
	Ti.Media.openPhotoGallery({
		allowMultiple : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
		success : function(e) {
			var media = e.media || null;
			if (OS_ANDROID) {
				if (e.images && e.images.length > 0) {
					e.images.forEach(function(item) {
						var media1 = item.media || null;
						if (media1) {
							var date = new Date();
							var filename = date.getMilliseconds();
							var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + ".png");
							f.write(media1);
							IMG_DATA.push({
								name : filename,
								image : f.read(),
								filePath : f.nativePath
							});
						}
					});
				}
				doUpdateImageList();
				return;
			}
			var date = new Date();
			var filename = date.getMilliseconds();
			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + ".png");
			f.write(media);
			IMG_DATA.push({
				name : filename,
				image : f.read(),
				filePath : f.nativePath
			});
			doUpdateImageList();
		},
		error : function(e) {
		}
	});
};

/**
 * Select Camera from Gallery
 */
function doSelectCameraFromCamera() {
	Ti.Media.showCamera({
		mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
		success : function(e) {
			var media = e.media || null;
			var date = new Date();
			var filename = date.getMilliseconds();
			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + ".png");
			f.write(media);
			IMG_DATA.push({
				name : filename,
				image : f.read(),
				filePath : f.nativePath
			});
			doUpdateImageList();
		},
		error : function(e) {
		}
	});
};

/**
 * Function to remove selected image from array and refresh list
 */
function doRemoveSelectImageFromArray(e) {
	var custId = e.source.custId || e.custId || "";
	if(custId != "") {
		IMG_DATA = IMG_DATA.filter(function(item) { return item.name != custId; });
		doUpdateImageList();
	}
};

/**
 * Function to set all images in Scrollview
 */
function doUpdateImageList() {
	$.scr_ig_container.removeAllChildren();
	if (IMG_DATA.length > 0) {
		for (var i = 0; i < IMG_DATA.length; i++) {
			var igData = IMG_DATA[i];
			var imagePath = igData.filePath || "";
			var fileObj = null;
			if (imagePath != "") {
				fileObj = Ti.Filesystem.getFile(imagePath);
			}
			// Create Overview Container
			var v = Ti.UI.createView({
				width : Alloy.CFG.UI.Grid.three - 16,
				height : Alloy.CFG.UI.Grid.three - 16,
				backgroundColor : 'transparent'
			});
			var c = Ti.UI.createLabel({
				width : 24,
				height : 24,
				borderRadius : 12,
				top : 8,
				right : 8,
				custId : igData.name,
				textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
				backgroundColor : Alloy.CFG.Colors.lblWhiteColor,
				borderColor : Alloy.CFG.Colors.colorPrimaryDark,
				font : {
					fontSize : Alloy.CFG.FontSize.Small,
					fontWeight : "bold"
				},
				color : Alloy.CFG.Colors.colorPrimaryDark,
				text : "✕"
			});
			c.addEventListener('click', doRemoveSelectImageFromArray);
			var ig = Ti.UI.createImageView({
				left : 20,
				top : 20,
				right : 20,
				bottom : 20,
				width : Ti.UI.FILL,
				height : Ti.UI.FILL,
				image : fileObj
			});
			v.add(ig);
			v.add(c);
			$.scr_ig_container.add(v);
		};
	}
	// scr_ig_container
};

// Function to set Materials Items
function doSetMaterialItems(data) {
	// Remove All children from the scrollview
	$.list_activity.removeAllChildren();
	if( data.length > 0 ) {
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			var mainItem = Ti.UI.createView({
				custData : item,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE
			});
			var cont = Ti.UI.createView({
				custData : item.custData,
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
				text : item.custData.naam || "",
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
				text : item.custData.artikelnummer || "",
			});

			var itemRemove = Ti.UI.createImageView({
				right : 0,
				width : 26,
				height : 26,
				image : "/images/ic_delete.png",
				custData : item
			});
			itemRemove.addEventListener("click", function(arg) {
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
					doSetMaterialItems(replaceData);
				}
			});
			cont.add(itemQty);
			cont.add(itemProduct);
			cont.add(itemNumber);
			cont.add(itemRemove);

			mainItem.add(cont);

			$.list_activity.add(mainItem);
		};
	}
}

// Material Items Global Functions
Alloy.Globals.doGetListIdsMaterials = function() {
	return MATERIAL_ITEMS;
};
Alloy.Globals.doGetListMaterials = function(data) {
	MATERIAL_LIST_DATA = [];
	MATERIAL_ITEMS = [];
	if( data )  {
		for ( var i = 0; i < data.length; i++ ) {
			var i1 = data[i];
			MATERIAL_ITEMS.push(i1);
		};
	}
	// Remove All children from the scrollview
	$.list_activity.removeAllChildren();
	if( MATERIAL_ITEMS.length > 0 ) {
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

			MATERIAL_LIST_DATA.push(mainItem);
			$.list_activity.add(mainItem);
		};
	}
};

function extend(obj, src) {
	for (var key in src) {
		if (src.hasOwnProperty(key))
			obj[key] = src[key];
	}
	return obj;
}

// Product submit click listener
var doAddProduct = function() {
	try {
		var serial = $.txf_serial.value;
		var id_number = $.txf_id.value;
		var location = $.txf_location.value;
		var internal_description = $.txf_opmerking.value || "";
		// list_activity
		var materialsObj = $.list_activity.children;
		var materials = [];
		if(materialsObj) {
			materialsObj.forEach(function(item) {
				var childItem = item.children[0] || null;
				if(childItem) {
					var custData = childItem.custData || null;
					var qty = childItem.children[0].value || "0";
					var id = custData.id || "";
					materials.push({
						id: id,
						qty: qty,
						custData: custData
					});
				}
			});
		}
		// IMG_DATA	
		var IMAGES = {};
		if(IMG_DATA) {
			IMG_DATA.forEach(function(item, index) {
				var filePath = item.filePath || "";
				var file = Ti.Filesystem.getFile(filePath);
				IMAGES['ig_product_' + DATA.delivery_item_id + '_' + (index + 1)] = file;
			});
		}
		Ti.API.info('DATA ====> ' + JSON.stringify(DATA));
		var dataObj = {
			id: ID,
			delivery_item_id: DATA.delivery_item_id || "",
			product_id: DATA.product_id || "",
			name: DATA.name || "",
			serial: serial,
			id_number: id_number,
			location: location,
			materials: materials,
			internal_description: internal_description || "",
			images: IMG_DATA
		};
		
		Ti.API.info('Product Information ---> ' + JSON.stringify(dataObj));
		args.doHoldData(ID, dataObj);
		$.w_add_product_information.close();
	} catch (e) {
		Ti.API.debug('Exception : ' + JSON.stringify(e));
	}
};


// Window's event listener
var doOpenWindow = function() {
	doUpdateProductInformation(DATA);
	if(OS_ANDROID) {
		activity = $.w_add_product_information.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_add_product_information.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};

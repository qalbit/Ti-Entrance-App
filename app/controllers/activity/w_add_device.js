// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var IMG_DATA = [];
var MODE = args.mode || "add";
var activities = [];
var MATERIALS = [];
var MATERIAL_LIST_DATA = [];

/**
 * Add Tellerstand if that job_type is work_form
 */
(function() {
	Ti.API.info('Add Device [JobType] is -> ' + args.job_type);
	if(args.job_type != "") {
		if(args.job_type == "work_form") {
			$.v_workform_item_tellerstand.bottom = Alloy.CFG.Space.Normal;
			$.v_workform_item_tellerstand.height = Ti.UI.SIZE;
			$.v_material_cont.height = Ti.UI.SIZE;
			$.v_material_cont.top = Alloy.CFG.Space.Small;
		} else {
			$.v_workform_item_tellerstand.bottom = 0;
			$.v_workform_item_tellerstand.height = 0;
			$.v_material_cont.height = 0;
			$.v_material_cont.top = 0;
		}
	}
})();

/**
 * Function to add Multiple Photos
 */
var doAddMultiplePhotos = function() {
	// Option Dialog
	var opts = {
		title : "Foto's toevoegen!"
	};
	if (OS_IOS) {
		opts.options = ['Gallery', 'Camera', 'Cancel'];
	} else {
		opts.options = ['Gallery', 'Cancel'];
		opts.buttonNames = ['Camera'];
	}
	var d = Ti.UI.createOptionDialog(opts);
	d.addEventListener('click', onOptionsDialogSelect);
	d.addEventListener('cancel', function(e) {
	});
	d.show();
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
				width : Alloy.CFG.UI.Grid.three,
				height : Alloy.CFG.UI.Grid.three,
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

/**
 * Function to add options dialog Device Contaminated
 */
var doAddOptionsDeviceContaminated = function() {
	var opts = {
		title : "Apparaat vervuild",
		options : ['ja', 'nee']
	};
	var d = Ti.UI.createOptionDialog(opts);
	d.addEventListener('click', function(e) {

		// if (e.index == 0) {
		// 	$.lbl_device_contaminated_val.text = 'ja';
		// } else {
		// 	$.lbl_device_contaminated_val.text = 'nee';
		// }
	});
	d.show();
};

/**
 * Function to add options dialog Device Molest
 */
var doAddOptionsDeviceMolest = function() {
	var opts = {
		title : "Conditie",
		options : ['1) Uitstekende conditie', '2) Goede conditie', '3) Redelijke conditie', '4) Matige conditie', '5) Slechte conditie', '6) Zeer slechte conditie']
	};
	var d = Ti.UI.createOptionDialog(opts);
	d.addEventListener('click', function(e) {
		switch(e.index) {
			case 0: 
				$.lbl_device_molest_val.text = '1) Uitstekende conditie';
				break;
			case 1:
				$.lbl_device_molest_val.text = '2) Goede conditie';
				break;
			case 2:
				$.lbl_device_molest_val.text = '3) Redelijke conditie';
				break;
			case 3:
				$.lbl_device_molest_val.text = '4) Matige conditie';
				break;
			case 4:
				$.lbl_device_molest_val.text = '5) Slechte conditie';
				break;
			case 5:
				$.lbl_device_molest_val.text = '6) Zeer slechte conditie';
				break;
			default:
				$.lbl_device_molest_val.text = '---GEEN---';
				break;
		}
	});
	d.show();
};

/**
 * Function to add options dialog Device Agreement
 */
var doAddOptionsDeviceAgreement = function() {
	var agreement_data = ['---GEEN---', 'Afgerond', 'Opnieuw inplannen'];
	var opts = {
		title : "Akkoord",
		options : agreement_data
	};
	var d = Ti.UI.createOptionDialog(opts);
	d.addEventListener('click', function(e) {
		$.lbl_agreement_val.text = agreement_data[e.index];
	});
	d.show();
};

/**
 * Function to Save Device Selected Information
 */
var doSaveAllDeviceInfo = function() {
	var activity = "";
	// var activity = activities.toString();
	var malfunction = $.txf_descr_malfunc.value;
	var workPerformance = $.txa_work_performed.value;
	var workRemark = $.txa_remark.value;
	var workRemarkIn = $.txa_remark_int.value;
	var cliningAgent = ""; 
	var typeAgent = "";
	var deviceContaminated = ""; //$.lbl_device_contaminated_val.text;
	var deviceMolest = $.lbl_device_molest_val.text;
	var agreement = $.lbl_agreement_val.text;
	var images = IMG_DATA;
	
	cliningAgent = (cliningAgent == "ja") ? "1" : "2";
	deviceContaminated = (deviceContaminated == "ja") ? "1" : "2";
	if(deviceMolest !== "---GEEN---") {
		switch(deviceMolest) {
			case "1) Uitstekende conditie":
				deviceMolest = "1";
				break;
			case "2) Goede conditie":
				deviceMolest = "2";
				break;
			case "3) Redelijke conditie":
				deviceMolest = "3";
				break;
			case "4) Matige conditie":
				deviceMolest = "4";
				break;
			case "5) Slechte conditie":
				deviceMolest = "5";
				break;
			case "6) Zeer slechte conditie":
				deviceMolest = "6";
				break;
			default:
				deviceMolest = "";
				break;
		}
	}


	if(agreement == "---GEEN---") { agreement = "0"; }
	else if(agreement == "Afgerond") { agreement = "3"; } 
	else if(agreement == "Opnieuw inplannen") { agreement = "5"; }
	
	Ti.API.info('Alloy.Globals.SELECTED_DEVICE.ID ----> ' + JSON.stringify(Alloy.Globals.SELECTED_DEVICE));

	Alloy.Globals.SELECTED_DEVICE = {
		product : $.txf_item_name.value,
		ID : $.txf_item_id.value,
		Serienummer : "", //$.txf_item_serial.value,
		model : "",
		clients_articles_ext_id: (Alloy.Globals.SELECTED_DEVICE && Alloy.Globals.SELECTED_DEVICE.clients_articles_ext_id != "") ? Alloy.Globals.SELECTED_DEVICE.clients_articles_ext_id : "",
		materials: MATERIALS || [],
		tellerstand: $.txf_item_tellerstand.value || "",
		// model : $.txf_item_model.value
	};

	var data = {
		device : Alloy.Globals.SELECTED_DEVICE,
		info : {
			activity : activity,
			malfunction : malfunction,
			workPerformance : workPerformance,
			workRemark : workRemark,
			workRemarkInt : workRemarkIn,
			cliningAgent : cliningAgent,
			typeAgent : typeAgent,
			deviceContaminated : deviceContaminated,
			deviceMolest : deviceMolest,
			agreement : agreement
		},
		images : images
	};
	args.doRefreshData(data);
	$.w_add_device.close();
};

/**
 * Function to Set Device Information
 */
var doSetDeviceInformation = function() {
	Ti.API.info('Device w_add_device.js ---> Line: 448');
	if (MODE == "edit") {
		if (args.data) {
			Ti.API.info('w_add_device[454] ---> ' + JSON.stringify(args.data));
			var device = args.data.device || null;
			var info = args.data.info || null;
			var images = args.data.images || null;
			if (device) {
				Ti.API.info('device[454] ----> ' + JSON.stringify(device));
				MATERIALS = device.materials || [];
				Alloy.Globals.SELECTED_DEVICE = device;
				$.txf_item_name.value = Alloy.Globals.SELECTED_DEVICE.product;
				// $.txf_item_model.value = Alloy.Globals.SELECTED_DEVICE.model;
				$.txf_item_id.value = Alloy.Globals.SELECTED_DEVICE.ID;
				// $.txf_item_serial.value = Alloy.Globals.SELECTED_DEVICE.Serienummer;
				doStoreMaterials(MATERIALS);
			}

			if (info) {
				if (info.activity != "") {
					activities = "";
					// activities = info.activity.split(",");
					// doRefreshListActivity();
				}
				Ti.API.info('Information to add device ----> ' + JSON.stringify(info));
				$.txf_descr_malfunc.value = info.malfunction || "";
				$.txa_work_performed.value = info.workPerformance || "";
				$.txa_remark.value = info.workRemark || "";
				$.txa_remark_int.value = info.workRemarkInt || "";

				// if(info.deviceContaminated == "1") {
				// 	$.lbl_device_contaminated_val.text = "ja";	
				// } else {
				// 	$.lbl_device_contaminated_val.text = "nee";
				// }
				info.deviceMolest = parseInt(info.deviceMolest, 10) || 0;
				if( info.deviceMolest >= 0 ) {
					switch(info.deviceMolest) {
						case 1: 
							$.lbl_device_molest_val.text = '1) Uitstekende conditie';
							break;
						case 2:
							$.lbl_device_molest_val.text = '2) Goede conditie';
							break;
						case 3:
							$.lbl_device_molest_val.text = '3) Redelijke conditie';
							break;
						case 4:
							$.lbl_device_molest_val.text = '4) Matige conditie';
							break;
						case 5:
							$.lbl_device_molest_val.text = '5) Slechte conditie';
							break;
						case 6:
							$.lbl_device_molest_val.text = '6) Zeer slechte conditie';
							break;
						default:
							$.lbl_device_molest_val.text = '---GEEN---';
							break;
					}
				}
				var agreement_data = ['---GEEN---', 'Afgerond', 'Opnieuw inplannen'];
				var agreement = info.agreement || 0;
				agreement = parseInt(agreement, 10);
				var agreement_status = "";
				var agreement_status_txt = "";
				if(agreement == "0") { agreement_status = "0"; agreement_status_txt = "---GEEN---"; }
				else if(agreement == "3") { agreement_status = "3"; agreement_status_txt = "Afgerond"; } 
				else if(agreement == "5") { agreement_status = "5"; agreement_status_txt = "Opnieuw inplannen"; }
				else { agreement_status = "0"; agreement_status_txt = "---GEEN---"; }
				$.lbl_agreement_val.text = agreement_status_txt;
			}

			if (images) {
				IMG_DATA = images;
				doUpdateImageList();
			}
		}
	} else {
		if (MODE == "new") {

		} else {
			$.txf_item_name.value = Alloy.Globals.SELECTED_DEVICE.product;
			// $.txf_item_model.value = Alloy.Globals.SELECTED_DEVICE.model;
			$.txf_item_id.value = Alloy.Globals.SELECTED_DEVICE.ID;
			// $.txf_item_serial.value = Alloy.Globals.SELECTED_DEVICE.Serienummer;
		}
	}
};

/**
 * Function to store materials for each device
 */
var doStoreMaterials = function(data) {
	MATERIALS = [];
	MATERIAL_LIST_DATA = [];
	Ti.API.info(JSON.stringify(data));
	if( data ) {
		for( var i = 0; i < data.length; i++ ) {
			var i1 = data[i];
			MATERIALS.push(i1);
		}
	}
	// MATERIALS
	$.list_activity.removeAllChildren();
	if( MATERIALS.length > 0 ) {
		for (var i = 0; i < MATERIALS.length; i++) {
			var item = MATERIALS[i];
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
					Ti.API.info(JSON.stringify(dataObj));
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
					doStoreMaterials(replaceData);
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

/**
 * Function to add materials
 */
 var doAddMultipleMaterial = function() {
	var w_add_material = Alloy.createController('/activity/w_add_material', {
		isFrom: 'add_device',
		selectedMaterials: MATERIALS,
		doStoreMaterials: doStoreMaterials,
		job_type: args.job_type || "",
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_add_material);
	} else {
		w_add_material.open();
	}
};


/**
 * Window's event listener
 */
var doOpenWindow = function() {
	if (OS_ANDROID) {
		activity = $.w_add_device.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_add_device.close();
			};
			activity.onCreateOptionsMenu = function(e) {
				var menuItem = e.menu.add({
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
					icon : "images/ic_checkmark.png"
				});
				menuItem.addEventListener('click', function() {
					doSaveAllDeviceInfo();
				});
			};
			activity.invalidateOptionsMenu();
		}
	}
	setTimeout(function() {
		doSetDeviceInformation();
	}, 500);
};
var doCloseWindow = function() {
	$.destroy();
};

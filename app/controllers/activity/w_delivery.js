// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var moment = require("moment");
var APP = require("utility");
// Default variables
var EMPLOYEES = [];
var PICKER_CONTAINER_DATE = null;
var PICKER_OBJ_DATE = null;
var PICKER_CONTAINER = null;
var PICKER_OBJ = null;
var PICKER_CONTAINER_ARRIVAL = null;
var PICKER_OBJ_ARRIAVAL = null;
var PICKER_CONTAINER_DEPART = null;
var PICKER_OBJ_DEPART = null;
var PICKER_VALUES = [];

var MATERIAL_DATA = DB.PRD.getData();
if (MATERIAL_DATA != null) {
	MATERIAL_DATA = APP.convertIntoString(MATERIAL_DATA);
	MATERIAL_DATA = JSON.parse(MATERIAL_DATA);
}

var currentDate = moment().format("DD-MM-YYYY");
var currentTime = moment().format("HH:mm");

var SIGNATURE_BLOB = null;
var WORK_ORDER_ID = args.work_order_id || "";
var PLAN_ID = args.plan_id || "";
console.log("Work Order Id ITEM [w_delivery] --> " + WORK_ORDER_ID);
console.log("Pla Id ITEM [w_delivery] --> " + PLAN_ID);
var data = {};

/**
 * Self calling function to get Employees values
 */
(function() {
	EMPLOYEES = DB.EMP.getData();
	if (EMPLOYEES != null) {
		EMPLOYEES = JSON.parse(EMPLOYEES);
		Ti.API.info('Employee-----> ' + JSON.stringify(EMPLOYEES));
	}
	// Set Items into PickerView
	doSetItemsPicker();
	doSetDatePicker();
	doSetArriavalPicker();
	doSetDepartPicker();
	if (OS_IOS) {
		$.txf_date_val.text = currentDate;
		$.txf_arrival_val.text = currentTime;
		$.txf_depart_val.text = currentTime;
	}

	// Set Client Email and all
	// Alloy.Globals.CLIENT_WORK_DET
	if(Alloy.Globals.CLIENT_WORK_DET) {
		$.txf_name_del.value = Alloy.Globals.CLIENT_WORK_DET.name || "";
		$.txf_email_del.value = Alloy.Globals.CLIENT_WORK_DET.email || "";
		Alloy.Globals.CLIENT_WORK_DET = null;
	}
})();

if (Alloy.Globals.doGetDataObj) {
	var delivery = Alloy.Globals.doGetDataObj("delivery");
	Ti.API.info('delivery -----> ' + JSON.stringify(delivery));
	if (delivery != null) {
		$.txf_name_del.value = (delivery.name || "");
		$.txf_email_del.value = (delivery.email || "");

		var path = delivery.signature || "";
		if (( typeof path != "undefined") && ( typeof path != "null") && (path != undefined) && (path != null) && (path != "")) {
			path = decodeURIComponent(path);
			var fileObj = Ti.Filesystem.getFile(path);
			$.ig_signature.image = fileObj;
			SIGNATURE_BLOB = path;
		}

		WORK_ORDER_ID = delivery.work_order_id || "";
		PLAN_ID = delivery.plan_id || ""
	}
}

/**
 * Global function to get the data concepts
 */
Alloy.Globals.doShowOverall = function(data) {
	if (data) {
		var workOrder = data.work_order;
		var materials = data.material;
		var activitys = data.activity;
		var delivery = data.delivery || null;
		if (workOrder) {
			if (workOrder.client) {
				$.lbl_client_name.text = workOrder.client || "";
			} else {
				$.lbl_client_name.text = "";
			}
			if (workOrder.clientLocation && workOrder.clientLocation.name != "") {
				$.lbl_client_location.text = workOrder.clientLocation.name || "";
			} else {
				$.lbl_client_location.text = "";
			}
			// $.lbl_2_eng_val.text = workOrder.engineer.name;
			$.txf_date_val.text = workOrder.date;
			$.txf_arrival_val.text = workOrder.arrivalTime;
			$.txf_depart_val.text = workOrder.departTime;
			// $.txf_parking_cost.text = workOrder.parking;
		}
		var listData = [];
		if (materials && materials.length > 0) {
			var items = [];
			for (var i = 0; i < materials.length; i++) {
				var materialObj = materials[i];
				var material = materialObj.product;
				var material_qty = materialObj.qty;

				listData.push({
					template : "template_item_material",
					qty : {
						text : material_qty || "1"
					},
					name : {
						text : material.naam || ""
					},
					number : {
						text : material.artikelnummer || ""
					}
				});
			};
		} else {
			if(args.job_type == "work_form") {
				$.v_material_header.height = 0;
				$.v_material_header.top = 0;
				$.v_material_header.bottom = 0;
				$.list_materials.height = 0;
				$.list_materials.top = 0;
				$.list_materials.bottom = 0;
			}
		}
		$.list_section_materials.setItems(listData);

		// New Code at 10-05-22-20:50
		$.list_activities_data.removeAllChildren();
		if(activitys && activitys.length > 0) {
			for (var j = 0; j < activitys.length; j++) {
				var activity = activitys[j];
				var deviceObj = activity.device;
				var infoObj = activity.info;

				var agreement_data = ['---GEEN---', 'Afgerond', 'Opnieuw inplannen'];
				var agreement = parseInt(infoObj.agreement, 10) || 0;
				var agreement_status_txt = "";
				if (agreement == "0") {
					agreement_status = "0";
					agreement_status_txt = "---GEEN---";
				} else if (agreement == "3") {
					agreement_status = "3";
					agreement_status_txt = "Afgerond";
				} else if (agreement == "5") {
					agreement_status = "5";
					agreement_status_txt = "Opniew inplannen";
				} else {
					agreement_status = "0";
					agreement_status_txt = "---GEEN---";
				}

				var activity_item = Ti.UI.createView({
					top: Alloy.CFG.Space.Small,
					bottom: Alloy.CFG.Space.Small,
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					backgroundColor: "transparent",
				});
				var v_item_container_act = Ti.UI.createView({
					left: Alloy.CFG.Space.Small,
					right: Alloy.CFG.Space.Small,
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					layout: 'vertical'
				});
				activity_item.add(v_item_container_act);

				var lbl_item_title_product = Ti.UI.createLabel({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					font: {
						fontSize: Alloy.CFG.FontSize.Normal,
						fontWeight: 'bold'
					},
					color: Alloy.CFG.Colors.lblDarkColor,
					text: deviceObj.product
				});
				v_item_container_act.add(lbl_item_title_product);
				var lbl_item_desc_id = Ti.UI.createLabel({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					font: {
						fontSize: Alloy.CFG.FontSize.Small,
						fontWeight: 'normal'
					},
					color: Alloy.CFG.Colors.lblDefaultColor,
					text: "ID: " + deviceObj.ID
				});
				v_item_container_act.add(lbl_item_desc_id);
				// var lbl_item_desc_serial = Ti.UI.createLabel({
				// 	width: Ti.UI.FILL,
				// 	height: Ti.UI.SIZE,
				// 	font: {
				// 		fontSize: Alloy.CFG.FontSize.Small,
				// 		fontWeight: 'normal'
				// 	},
				// 	color: Alloy.CFG.Colors.lblDefaultColor,
				// 	text: "Serienummer: " + deviceObj.Serienummer
				// });
				// v_item_container_act.add(lbl_item_desc_serial);
				var lbl_item_desc_store = Ti.UI.createLabel({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					font: {
						fontSize: Alloy.CFG.FontSize.Small,
						fontWeight: 'normal'
					},
					color: Alloy.CFG.Colors.lblDefaultColor,
					text: "Omschrijving storing: " + infoObj.malfunction
				});
				v_item_container_act.add(lbl_item_desc_store);
				var lbl_item_desc_status = Ti.UI.createLabel({
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
					font: {
						fontSize: Alloy.CFG.FontSize.Small,
						fontWeight: 'normal'
					},
					color: Alloy.CFG.Colors.lblDefaultColor,
					text: agreement_status_txt
				});
				v_item_container_act.add(lbl_item_desc_status);
				
				if(args.job_type == "work_form") {
					if(activity.device && activity.device.materials && activity.device.materials.length > 0) {
						// Add Title for Materials
						var material_item = Ti.UI.createView({
							top: Alloy.CFG.Space.Tiny,
							width: Ti.UI.FILL,
							height: Ti.UI.SIZE,
							layout: 'vertical'
						});
						var material_item_sep_1 = Ti.UI.createView({
							width: Ti.UI.FILL,
							height: 1,
							backgroundColor: Alloy.CFG.Colors.lblDefaultColor
						});
						material_item.add(material_item_sep_1);
						var material_header = Ti.UI.createLabel({
							top: Alloy.CFG.Space.Tiny,
							bottom: Alloy.CFG.Space.Tiny,
							width: Ti.UI.FILL,
							height: Ti.UI.SIZE,
							font: {
								fontSize: Alloy.CFG.FontSize.Small,
								fontWeight: 'bold'
							},
							color: Alloy.CFG.Colors.lblDefaultColor,
							text: "Gebruikte materialen"
						});
						material_item.add(material_header);
						var material_item_sep_2 = Ti.UI.createView({
							width: Ti.UI.FILL,
							height: 1,
							backgroundColor: Alloy.CFG.Colors.lblDefaultColor
						});
						material_item.add(material_item_sep_2);
						v_item_container_act.add(material_item);
						activity.device.materials.forEach(it => {
							var material_item_v = Ti.UI.createView({
								top: Alloy.CFG.Space.Tiny,
								bottom: Alloy.CFG.Space.Tiny,
								width: Ti.UI.FILL,
								height: Ti.UI.SIZE,
							});
							var material_item_name = Ti.UI.createLabel({
								left: 0,
								right: 100,
								width: Ti.UI.FILL,
								height: Ti.UI.SIZE,
								font: {
									fontSize: Alloy.CFG.FontSize.Small,
									fontWeight: 'bold'
								},
								color: Alloy.CFG.Colors.lblDefaultColor,
								text: it.naam || ""
							});
							material_item_v.add(material_item_name);
							var material_item_qty = Ti.UI.createLabel({
								right: 0,
								width: 100,
								height: Ti.UI.SIZE,
								textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
								font: {
									fontSize: Alloy.CFG.FontSize.Small,
									fontWeight: 'bold'
								},
								color: Alloy.CFG.Colors.lblDefaultColor,
								text: it.qty || ""
							});
							material_item_v.add(material_item_qty);
							material_item.add(material_item_v);
						});
					}
				}

				$.list_activities_data.add(activity_item);
			}
		}
		// New Code end here

		var listData1 = [];
		if (activitys && activitys.length > 0) {
			for (var j = 0; j < activitys.length; j++) {
				// var activity = activitys[j];
				// var deviceObj = activity.device;
				// var infoObj = activity.info;

				// var agreement_data = ['---GEEN---', 'Afgerond', 'Opnieuw inplannen'];
				// var agreement = parseInt(infoObj.agreement, 10) || 0;
				// var agreement_status_txt = "";
				// if (agreement == "0") {
				// 	agreement_status = "0";
				// 	agreement_status_txt = "---GEEN---";
				// } else if (agreement == "3") {
				// 	agreement_status = "3";
				// 	agreement_status_txt = "Afgerond";
				// } else if (agreement == "5") {
				// 	agreement_status = "5";
				// 	agreement_status_txt = "Opniew inplannen";
				// } else {
				// 	agreement_status = "0";
				// 	agreement_status_txt = "---GEEN---";
				// }

				// listData1.push({
				// 	template : "template_item",
				// 	product : {
				// 		text : deviceObj.product
				// 	},
				// 	id : {
				// 		text : "IN: " + deviceObj.ID
				// 	},
				// 	serial : {
				// 		text : "Serienummer: " + deviceObj.Serienummer
				// 	},
				// 	store : {
				// 		text : "Omschrijving storing: " + infoObj.malfunction
				// 	},
				// 	status : {
				// 		text : agreement_status_txt
				// 	}
				// });
			};
		}
		// $.list_section_activities.setItems(listData1);

		if (delivery) {
			$.txf_name_del.value = (delivery.name);
			$.txf_email_del.value = (delivery.email);
			var path = delivery.signature || "";
			if (( typeof path != "undefined") && ( typeof path != "null") && (path != undefined) && (path != null) && (path != "")) {
				path = decodeURIComponent(path);
				var fileObj = Ti.Filesystem.getFile(path);
				$.ig_signature.image = fileObj;
				SIGNATURE_BLOB = path;
			}
			WORK_ORDER_ID = delivery.work_order_id || "";
			PLAN_ID = delivery.plan_id || ""
		}
	}
};

/**
 * Function to set Departure Time Picker
 */
function doSetDepartPicker() {
	if (OS_IOS) {
		PICKER_CONTAINER_DEPART = Ti.UI.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			bottom : 0,
			layout : 'vertical',
			backgroundColor : Alloy.CFG.Colors.lblLightColor
		});
		var toolbar = Ti.UI.createToolbar({
			top : 0,
			width : Ti.UI.FILL,
			height : 42,
			barColor : Alloy.CFG.Colors.lblLightColor
		});
		var cancel = Ti.UI.createButton({
			title : "annuleren",
			color : Alloy.CFG.Colors.colorPrimary
		});
		cancel.addEventListener('click', doCancelSelectedDepartiOS);

		var send = Ti.UI.createButton({
			title : 'Opslaan',
			color : Alloy.CFG.Colors.colorPrimary
		});
		send.addEventListener('click', doSaveSelectedDepartiOS);

		var flexSpace = Ti.UI.createButton({
			systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
		});

		toolbar.items = [cancel, flexSpace, send];

		PICKER_CONTAINER_DEPART.add(toolbar);

		PICKER_OBJ_DEPART = Ti.UI.createPicker({
			bottom : 0,
			backgroundColor : Alloy.CFG.Colors.lblLightColor,
			type : Ti.UI.PICKER_TYPE_TIME,
			datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS
		});
		PICKER_CONTAINER_DEPART.add(PICKER_OBJ_DEPART);
	}
};

/**
 * Function to set Arrival Time Picker
 */
function doSetArriavalPicker() {
	if (OS_IOS) {
		PICKER_CONTAINER_ARRIVAL = Ti.UI.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			bottom : 0,
			layout : 'vertical',
			backgroundColor : Alloy.CFG.Colors.lblLightColor
		});
		var toolbar = Ti.UI.createToolbar({
			top : 0,
			width : Ti.UI.FILL,
			height : 42,
			barColor : Alloy.CFG.Colors.lblLightColor
		});
		var cancel = Ti.UI.createButton({
			title : "annuleren",
			color : Alloy.CFG.Colors.colorPrimary
		});
		cancel.addEventListener('click', doCancelSelectedArrivaliOS);

		var send = Ti.UI.createButton({
			title : 'Opslaan',
			color : Alloy.CFG.Colors.colorPrimary
		});
		send.addEventListener('click', doSaveSelectedArrivaliOS);

		var flexSpace = Ti.UI.createButton({
			systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
		});

		toolbar.items = [cancel, flexSpace, send];

		PICKER_CONTAINER_ARRIVAL.add(toolbar);

		PICKER_OBJ_ARRIAVAL = Ti.UI.createPicker({
			bottom : 0,
			backgroundColor : Alloy.CFG.Colors.lblLightColor,
			type : Ti.UI.PICKER_TYPE_TIME,
			datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS
		});
		PICKER_CONTAINER_ARRIVAL.add(PICKER_OBJ_ARRIAVAL);
	}
};

/**
 * Function to set Date Picker
 */
function doSetDatePicker() {
	if (OS_IOS) {
		PICKER_CONTAINER_DATE = Ti.UI.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			bottom : 0,
			layout : 'vertical',
			backgroundColor : Alloy.CFG.Colors.lblLightColor
		});
		var toolbar = Ti.UI.createToolbar({
			top : 0,
			width : Ti.UI.FILL,
			height : 42,
			barColor : Alloy.CFG.Colors.lblLightColor
		});
		var cancel = Ti.UI.createButton({
			title : "annuleren",
			color : Alloy.CFG.Colors.colorPrimary
		});
		cancel.addEventListener('click', doCancelSelectedDateiOS);

		var send = Ti.UI.createButton({
			title : 'Opslaan',
			color : Alloy.CFG.Colors.colorPrimary
		});
		send.addEventListener('click', doSaveSelectedDateiOS);

		var flexSpace = Ti.UI.createButton({
			systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
		});

		toolbar.items = [cancel, flexSpace, send];

		PICKER_CONTAINER_DATE.add(toolbar);

		PICKER_OBJ_DATE = Ti.UI.createPicker({
			bottom : 0,
			backgroundColor : Alloy.CFG.Colors.lblLightColor,
			type : Ti.UI.PICKER_TYPE_DATE,
			datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
		});
		PICKER_CONTAINER_DATE.add(PICKER_OBJ_DATE);
	}
};

/**
 * Function to set Picker Items
 */
function doSetItemsPicker() {
	PICKER_VALUES = [];
	if (EMPLOYEES && EMPLOYEES.length > 0) {
		for (var i = 0,
		    j = EMPLOYEES.length; i < j; i++) {
			var employee = EMPLOYEES[i];
			PICKER_VALUES.push(Ti.UI.createPickerRow({
				custId : employee.id,
				title : employee.name
			}));
		};
	}

	if (PICKER_OBJ) {
		$.w_delivery.remove(PICKER_OBJ);
		PICKER_OBJ = null;
	}

	if (OS_IOS) {
		PICKER_CONTAINER = Ti.UI.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			bottom : 0,
			layout : 'vertical',
			backgroundColor : Alloy.CFG.Colors.lblDefaultColor
		});
		var toolbar = Ti.UI.createToolbar({
			top : 0,
			width : Ti.UI.FILL,
			height : 42,
			barColor : Alloy.CFG.Colors.lblDefaultColor
		});
		var cancel = Ti.UI.createButton({
			title : "annuleren",
			color : Alloy.CFG.Colors.colorPrimary
		});
		cancel.addEventListener('click', doCancelSelectedEngineeriOS);

		var send = Ti.UI.createButton({
			title : 'Opslaan',
			color : Alloy.CFG.Colors.colorPrimary
		});
		send.addEventListener('click', doSaveSelectedEngineeriOS);

		var flexSpace = Ti.UI.createButton({
			systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
		});

		toolbar.items = [cancel, flexSpace, send];

		PICKER_CONTAINER.add(toolbar);

		PICKER_OBJ = Ti.UI.createPicker({
			bottom : 0,
			backgroundColor : Alloy.CFG.Colors.lblDefaultColor,
			useSpinner : true
		});
		if (PICKER_VALUES && PICKER_VALUES.length > 0) {
			PICKER_OBJ.add(PICKER_VALUES);
			PICKER_OBJ.selectionIndicator = true;
		}

		PICKER_CONTAINER.add(PICKER_OBJ);
	}
}

/**
 * Picker Click Listener
 */
function doSaveSelectedEngineeriOS() {
	if (PICKER_OBJ) {
		var row = PICKER_OBJ.getSelectedRow(0);
		// $.lbl_2_eng_val.text = row.title;
	}
	if (PICKER_CONTAINER) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
};
function doCancelSelectedEngineeriOS() {
	if (PICKER_CONTAINER) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
};

function doSaveSelectedDateiOS() {
	if (PICKER_OBJ_DATE) {
		var val = PICKER_OBJ_DATE.value;
		var formatDate = moment(val).format("DD-MM-YYYY");
		$.txf_date_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DATE) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
};
function doCancelSelectedDateiOS() {
	if (PICKER_CONTAINER_DATE) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
};

function doSaveSelectedArrivaliOS() {
	if (PICKER_OBJ_ARRIAVAL) {
		var val = PICKER_OBJ_ARRIAVAL.value;
		var formatDate = moment(val).format("HH:mm");
		$.txf_arrival_val.text = formatDate;
	}
	if (PICKER_CONTAINER_ARRIVAL) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
};
function doCancelSelectedArrivaliOS() {
	if (PICKER_CONTAINER_ARRIVAL) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
};

function doSaveSelectedDepartiOS() {
	if (PICKER_OBJ_DEPART) {
		var val = PICKER_OBJ_DEPART.value;
		var formatDate = moment(val).format("HH:mm");
		$.txf_depart_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DEPART) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
};
function doCancelSelectedDepartiOS() {
	if (PICKER_CONTAINER_DEPART) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
};

/**
 * Picker Open Event for iOS
 */
var doEngineerListOpen = function() {

	if (OS_IOS) {
		$.w_delivery.add(PICKER_CONTAINER);
	}
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
};

var doDateOpen = function() {

	if (PICKER_CONTAINER && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
	if (OS_IOS) {
		$.w_delivery.add(PICKER_CONTAINER_DATE);
	}
};

var doArrivalTimeOpen = function() {

	if (PICKER_CONTAINER && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
	if (OS_IOS) {
		$.w_delivery.add(PICKER_CONTAINER_ARRIVAL);
	}
};

var doDepartTimeOpen = function() {

	if (PICKER_CONTAINER && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (OS_IOS) {
		$.w_delivery.add(PICKER_CONTAINER_DEPART);
	}
};

/**
 * TextField Focus
 */
var doFocusClient = function() {
	if (PICKER_CONTAINER && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER);
	}
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_delivery.remove(PICKER_CONTAINER_DEPART);
	}
};

/**
 * Insert Signature
 */
var doInsertSignature = function(igBlob) {
	$.ig_signature.image = igBlob;
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "signature.png");
	file.write(igBlob);
	SIGNATURE_BLOB = file.nativePath;
};

/**
 * Paint Window
 */
var doOpenPaintWin = function() {
	var w_add_signature = Alloy.createController("w_add_signature", {
		doSaveSignature : doInsertSignature
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		//Alloy.Globals.navWindow.openWindow(w_add_signature);
		w_add_signature.open();
	} else {
		w_add_signature.open();
	}
};

/**
 * Function to save all data into one object
 */
var doSaveDeliveryData = function() {
	Alloy.Globals.doCloseDelivery();
};
var doSubmitDeliveryData = function() {
	var d = Ti.UI.createAlertDialog({
		cancel : 1,
		buttonNames : [L("txt_confirm", "Bevestigen"), L("txt_cancel", "Annuleer")],
		message : L("txt_send_data_confirm", "Wilt u gegevens verzenden?"),
		title : L("txt_confirmation", "Bevestiging")
	});
	d.addEventListener('click', function(e) {
		if (e.index === e.source.cancel) {
			return;
		}
		Alloy.Globals.doSubmitDelivery();
	});
	d.show();
};

/**
 * Global function to save name, email & signature
 */
Alloy.Globals.doSaveDelivery = function(_callback) {
	var path = SIGNATURE_BLOB || "";
	var d = {
		type : "delivery",
		data : {
			name : $.txf_name_del.value || "",
			email : $.txf_email_del.value || "",
			signature : path,
			work_order_id: WORK_ORDER_ID || "",
			plan_id: PLAN_ID || ""
		}
	};
	console.log(d);
	_callback(d);
};

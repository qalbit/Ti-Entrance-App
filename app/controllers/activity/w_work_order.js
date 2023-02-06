// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var moment = require("moment");
// Default Argument
var DEFAULT_DATA = args || null;
// Default variables
var EMPLOYEES = [];
var PICKER_CONTAINER_DATE = null;
var PICKER_OBJ_DATE = null;
// var PICKER_CONTAINER = null;
var PICKER_OBJ = null;
var PICKER_CONTAINER_ARRIVAL = null;
var PICKER_OBJ_ARRIAVAL = null;
var PICKER_CONTAINER_DEPART = null;
var PICKER_OBJ_DEPART = null;
var PICKER_VALUES = [];
var ENGINNER_ID = null;

var currentDate = (DEFAULT_DATA && DEFAULT_DATA.date) ? DEFAULT_DATA.date : moment().format("DD-MM-YYYY");
var currentTime = (DEFAULT_DATA && DEFAULT_DATA.arrival) ? DEFAULT_DATA.arrival : moment().format("HH:mm");
var currentTimeDep = (DEFAULT_DATA && DEFAULT_DATA.depart) ? DEFAULT_DATA.depart : moment().add(1, 'hour').format("HH:mm");

var SAVED_DATA = {};

/**
 * Self calling function to get Employees values
 */
(function() {
	EMPLOYEES = DB.EMP.getData();
	if (EMPLOYEES != null) {
		EMPLOYEES = JSON.parse(EMPLOYEES);
	}
	Ti.API.info('Employeess --------> ' + JSON.stringify(EMPLOYEES));
	// Set Items into PickerView
	// doSetItemsPicker();
	doSetDatePicker();
	doSetArriavalPicker();
	doSetDepartPicker();
	$.txf_date_val.text = currentDate;
	$.txf_arrival_val.text = currentTime;
	$.txf_depart_val.text = currentTimeDep;
	// Set Selected Client
	$.lbl_client_name.text = Alloy.Globals.SELECTED_CLIENT.name;
	if (Alloy.Globals.SELECTED_CLIENT_LOCATION && Alloy.Globals.SELECTED_CLIENT_LOCATION.name != "") {
		$.lbl_client_location_main.text = Alloy.Globals.SELECTED_CLIENT_LOCATION.name;
	} else {
		$.lbl_client_location_main.text = "";
	}
	if (Alloy.Globals.SELECTED_ITEM) {
		var data = Alloy.Globals.SELECTED_ITEM.data;
		if (data != null) {
			var workOrder = data.work_order || null;
			if (workOrder) {
				if (workOrder.clientLocation && workOrder.clientLocation.name != "" && workOrder.clientLocation.id != "") {
					$.lbl_client_location_main.text = workOrder.clientLocation.name;
					Alloy.Globals.SELECTED_CLIENT_LOCATION = workOrder.clientLocation;
				} else if (Alloy.Globals.SELECTED_CLIENT_LOCATION && Alloy.Globals.SELECTED_CLIENT_LOCATION.name != "" && Alloy.Globals.SELECTED_CLIENT_LOCATION.id != "") {
					$.lbl_client_location_main.text = Alloy.Globals.SELECTED_CLIENT_LOCATION.name || "";
				}
				$.txf_date_val.text = workOrder.date;
				$.txf_arrival_val.text = workOrder.arrivalTime;
				$.txf_depart_val.text = workOrder.departTime;
				Ti.API.info('Item WORK ORDER ------> ' + JSON.stringify(workOrder));
				ENGINNER_ID = workOrder.engineer.id;
				// if (OS_IOS) {
					// $.lbl_2_eng_val.text = workOrder.engineer.name;
				// } else {
					// Select Employee
					// var column = $.pickr_2_eng.columns[0];
					// var rows = column.rows || [];
					// if (rows && rows.length > 0) {
						// rows.forEach(function(item, index) {
							// Ti.API.info('Item CustID =====> ' + item.custId);
							// Ti.API.info('Item EngID ======> ' + ENGINNER_ID);
							// Ti.API.info('Item Index ======> ' + index);
							// if (item.custId == ENGINNER_ID) {
								// $.pickr_2_eng.setSelectedRow(0, index);
							// }
						// });
					// }
				// }
				// $.txf_parking_time.value = workOrder.parking;
			}
		}
	}
})();

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
			type : Ti.UI.PICKER_TYPE_TIME,
			datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
			backgroundColor: Alloy.CFG.Colors.lblLightColor,
			color: Alloy.CFG.Colors.searchbarTintColor,
			locale : "nl-NL"
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
			type : Ti.UI.PICKER_TYPE_TIME,
			datePickerStyle: Titanium.UI.DATE_PICKER_STYLE_WHEELS,
			backgroundColor: Alloy.CFG.Colors.lblLightColor,
			locale : "nl-NL",
			format24: true
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
			locale : "nl-NL"
		});
		PICKER_CONTAINER_DATE.add(PICKER_OBJ_DATE);
	}
};

/**
 * Function to set Picker Items
 */
// function doSetItemsPicker() {
	// try {
		// PICKER_VALUES = [];
		// if(OS_ANDROID) {
			// PICKER_VALUES.push(Ti.UI.createPickerRow({
				// custId : "0",
				// title : "---GEEN---"
			// }));
		// }
		// if (EMPLOYEES && EMPLOYEES.length > 0) {
			// for (var i = 0,
			    // j = EMPLOYEES.length; i < j; i++) {
				// var employee = EMPLOYEES[i];
				// PICKER_VALUES.push(Ti.UI.createPickerRow({
					// custId : employee.id,
					// title : employee.name
				// }));
			// };
		// }
// 
		// if (OS_IOS) {
			// if (PICKER_OBJ) {
				// $.w_work_order.remove(PICKER_OBJ);
				// PICKER_OBJ = null;
			// }
			// PICKER_CONTAINER = Ti.UI.createView({
				// width : Ti.UI.FILL,
				// height : Ti.UI.SIZE,
				// bottom : 0,
				// layout : 'vertical',
				// backgroundColor : Alloy.CFG.Colors.lblDefaultColor
			// });
			// var toolbar = Ti.UI.createToolbar({
				// top : 0,
				// width : Ti.UI.FILL,
				// height : 42,
				// barColor : Alloy.CFG.Colors.lblDefaultColor
			// });
			// var cancel = Ti.UI.createButton({
				// title : "annuleren",
				// color : Alloy.CFG.Colors.colorPrimary
			// });
			// cancel.addEventListener('click', doCancelSelectedEngineeriOS);
			// var send = Ti.UI.createButton({
				// title : 'Opslaan',
				// color : Alloy.CFG.Colors.colorPrimary
			// });
			// send.addEventListener('click', doSaveSelectedEngineeriOS);
// 
			// var flexSpace = Ti.UI.createButton({
				// systemButton : Ti.UI.iOS.SystemButton.FLEXIBLE_SPACE
			// });
			// toolbar.items = [cancel, flexSpace, send];
			// PICKER_CONTAINER.add(toolbar);
// 
			// PICKER_OBJ = Ti.UI.createPicker({
				// bottom : 0,
				// backgroundColor : Alloy.CFG.Colors.lblDefaultColor,
				// useSpinner : true
			// });
			// Ti.API.info('Start PICKER_VALUES ------> ' + (PICKER_VALUES && PICKER_VALUES.length > 0));
			// if (PICKER_VALUES && PICKER_VALUES.length > 0) {
				// Ti.API.info('1 Start PICKER_VALUES ------> ' + (PICKER_VALUES && PICKER_VALUES.length > 0));
				// PICKER_OBJ.add(PICKER_VALUES);
				// PICKER_OBJ.selectionIndicator = true;
			// }
			// Ti.API.info('End PICKER_VALUES');
// 
			// PICKER_CONTAINER.add(PICKER_OBJ);
		// } else {
// 			
			// if (PICKER_VALUES && PICKER_VALUES.length > 0) {
				// $.pickr_2_eng.add(PICKER_VALUES);
			// }
			// // pickr_2_eng
		// }
	// } catch(ex) {
		// Ti.API.info('Exception on picker ---> ' + ex);
	// }
// }

/**
 * Picker Click Listener
 */
// function doSaveSelectedEngineeriOS() {
	// if (PICKER_OBJ) {
		// var row = PICKER_OBJ.getSelectedRow(0);
		// $.lbl_2_eng_val.text = row.title;
		// ENGINNER_ID = row.custId;
	// }
	// if (PICKER_CONTAINER) {
		// $.w_work_order.remove(PICKER_CONTAINER);
	// }
// };
// var doPicker2EngChange = function() {
	// var row = $.pickr_2_eng.getSelectedRow(0);
	// if (row) {
		// ENGINNER_ID = row.custId;
	// }
// };
var doPickerDateType = function() {
	$.pickr_date.showDatePickerDialog({
		value : new Date()
	});
};
// function doCancelSelectedEngineeriOS() {
	// if (PICKER_CONTAINER) {
		// $.w_work_order.remove(PICKER_CONTAINER);
	// }
// };

function doSaveSelectedDateiOS() {
	if (PICKER_OBJ_DATE) {
		var val = PICKER_OBJ_DATE.value;
		var formatDate = moment(val).format("DD-MM-YYYY");
		$.txf_date_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DATE) {
		$.w_work_order.remove(PICKER_CONTAINER_DATE);
	}
};
function doCancelSelectedDateiOS() {
	if (PICKER_CONTAINER_DATE) {
		$.w_work_order.remove(PICKER_CONTAINER_DATE);
	}
};

function doSaveSelectedArrivaliOS() {
	if (PICKER_OBJ_ARRIAVAL) {
		var val = PICKER_OBJ_ARRIAVAL.value;
		var arrivalTime = moment(val);
		var nextTime 	= moment(val).add(1, 'hour');
		
		var formatDate 	= arrivalTime.format("HH:mm");
		var formatDate1 = nextTime.format("HH:mm");
		$.txf_arrival_val.text = formatDate;
		$.txf_depart_val.text = formatDate1;
		$.txf_arrival_val.text = formatDate;
	}
	if (PICKER_CONTAINER_ARRIVAL) {
		$.w_work_order.remove(PICKER_CONTAINER_ARRIVAL);
	}
};
function doCancelSelectedArrivaliOS() {
	if (PICKER_CONTAINER_ARRIVAL) {
		$.w_work_order.remove(PICKER_CONTAINER_ARRIVAL);
	}
};

function doSaveSelectedDepartiOS() {
	if (PICKER_OBJ_DEPART) {
		var val = PICKER_OBJ_DEPART.value;
		var formatDate = moment(val).format("HH:mm");
		$.txf_depart_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DEPART) {
		$.w_work_order.remove(PICKER_CONTAINER_DEPART);
	}
};
function doCancelSelectedDepartiOS() {
	if (PICKER_CONTAINER_DEPART) {
		$.w_work_order.remove(PICKER_CONTAINER_DEPART);
	}
};

/**
 * Picker Open Event for iOS
 */
// var doEngineerListOpen = function() {
	// // $.txf_client.blur();
	// $.txf_parking_time.blur();
// 
	// if (OS_IOS) {
		// $.w_work_order.add(PICKER_CONTAINER);
	// }
// 
	// if (PICKER_CONTAINER_DATE && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER_DATE);
	// }
	// if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER_ARRIVAL);
	// }
	// if (PICKER_CONTAINER_DEPART && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER_DEPART);
	// }
// };

var doDateOpen = function() {
	// $.txf_client.blur();
	// $.txf_parking_time.blur();

	// if (PICKER_CONTAINER && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER);
	// }
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_DEPART);
	}
	if (OS_IOS) {
		$.w_work_order.add(PICKER_CONTAINER_DATE);
	} else {
		var picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_DATE,
			value : new Date(),
			locale : "nl-NL"
		});

		picker.showDatePickerDialog({
			value : new Date(),
			callback : function(e) {
				if (e.cancel) {
				} else {
					var formatDate = moment(e.value).format("DD-MM-YYYY");
					$.txf_date_val.text = formatDate;
				}
			}
		});
	}
};

var doArrivalTimeOpen = function() {
	// $.txf_client.blur();

	// if (PICKER_CONTAINER && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER);
	// }
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_DEPART && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_DEPART);
	}
	if (OS_IOS) {
		$.w_work_order.add(PICKER_CONTAINER_ARRIVAL);
	} else {
		var picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_TIME,
			value : new Date(),
			locale : "nl-NL",
			format24: true
		});

		picker.showTimePickerDialog({
			value : new Date(),
			locale : "nl-NL",
			format24: true,
			callback : function(e) {
				if (e.cancel) {
				} else {
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
};

var doDepartTimeOpen = function() {
	// $.txf_client.blur();

	// if (PICKER_CONTAINER && OS_IOS) {
		// $.w_work_order.remove(PICKER_CONTAINER);
	// }
	if (PICKER_CONTAINER_DATE && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_DATE);
	}
	if (PICKER_CONTAINER_ARRIVAL && OS_IOS) {
		$.w_work_order.remove(PICKER_CONTAINER_ARRIVAL);
	}
	if (OS_IOS) {
		$.w_work_order.add(PICKER_CONTAINER_DEPART);
	} else {
		var picker = Ti.UI.createPicker({
			type : Ti.UI.PICKER_TYPE_TIME,
			value : new Date(),
			locale : "nl-NL",
			format24: true
		});

		picker.showTimePickerDialog({
			value : new Date(),
			locale : "nl-NL",
			format24: true,
			callback : function(e) {
				if (e.cancel) {
				} else {
					var formatDate = moment(e.value).format("HH:mm");
					$.txf_depart_val.text = formatDate;
				}
			}
		});
	}
};

/**
 * TextField Client Click
 */
var doClickClient = function() {
	var w_clients = Alloy.createController("w_clients", {
		from : "work_order",
		doRefreshWorkPage : function() {
			$.lbl_client_name.text = Alloy.Globals.SELECTED_CLIENT.name;
			if (Alloy.Globals.SELECTED_CLIENT_LOCATION && Alloy.Globals.SELECTED_CLIENT_LOCATION.name != "") {
				$.lbl_client_location_main.text = Alloy.Globals.SELECTED_CLIENT_LOCATION.name;
			} else {
				$.lbl_client_location_main.text = "";
			}
			Alloy.Globals.doClearSelectedDevices();
		}
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_clients);
	} else {
		w_clients.open();
	}
};

/**
 * Global function to Save Data
 */
Alloy.Globals.doSaveWorkOrder = function(_callback) {
	var engineerObj = {};
	// if (OS_IOS) {
		// engineerObj = {
			// name : $.lbl_2_eng_val.text,
			// id : ENGINNER_ID
		// };
	// } else {
		// var row = $.pickr_2_eng.getSelectedRow(0);
		// if (row) {
			// engineerObj = {
				// name : row.title,
				// id : row.custId
			// };
		// }
	// }
	var d = {
		type : "work_order",
		data : {
			client : $.lbl_client_name.text,
			clientLocation : Alloy.Globals.SELECTED_CLIENT_LOCATION,
			engineer : engineerObj,
			date : $.txf_date_val.text,
			arrivalTime : $.txf_arrival_val.text,
			departTime : $.txf_depart_val.text,
			parking : "", //$.txf_parking_time.value,
			selClient : Alloy.Globals.SELECTED_CLIENT
		}
	};
	_callback(d);
};

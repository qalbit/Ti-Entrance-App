// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require("moment");
// Picker Default Variables
var PICKER_CONTAINER_ARRIVAL = null;
var PICKER_CONTAINER_DEPART = null;
var PICKER_CONTAINER_DATE = null;
var PICKER_OBJ_DATE = null;
var PICKER_OBJ_ARR_TIME = null;
var PICKER_OBJ_DEP_TIME = null;

var client = args.client || null;
var location = args.location || null;
var failure = args.failure || null;
var clientWork = args.clientWork || null;
var currentDate = moment().format("DD-MM-YYYY");
var currentTime = moment().format("HH:mm");
var currentTimeDep = moment().add(1, 'hour').format("HH:mm");

/**
 * Set default value
 */
(function() {
	$.txf_date_val.text = currentDate;
	$.txf_arrival_val.text = currentTime;
	$.txf_depart_val.text = currentTimeDep;
	
	if(client) {
		$.lbl_client_name.text = client.name || "";
		$.lbl_client_location_main.text = client.loc || "";
	}
})();

/**
 * Picker iOS click listener
 */
function doCancelSelectedDateiOS() {
	if (PICKER_CONTAINER_DATE) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DATE); }
}
function doSaveSelectedDateiOS() {
	if(PICKER_OBJ_DATE) {
		var val = PICKER_OBJ_DATE.value;
		var formatDate = moment(val).format("DD-MM-YYYY");
		$.txf_date_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DATE) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DATE); }
}

function doCancelSelectedArrivaliOS() {
	if (PICKER_CONTAINER_ARRIVAL) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_ARRIVAL); }
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
	if (PICKER_CONTAINER_ARRIVAL) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_ARRIVAL); }
}

function doCancelSelectedDepiOS() {
	if (PICKER_CONTAINER_DEPART) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DEPART); }
}
function doSaveSelectedDepiOS() {
	if(PICKER_OBJ_DEP_TIME) {
		var val = PICKER_OBJ_DEP_TIME.value;
		var formatDate 	= moment(val).format("HH:mm");
		$.txf_depart_val.text = formatDate;
	}
	if (PICKER_CONTAINER_DEPART) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DEPART); }
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
			if(PICKER_CONTAINER_DATE) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DATE); }
			$.w_setting_dateworkform.add(PICKER_CONTAINER_DATE);
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
			if(PICKER_CONTAINER_ARRIVAL) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_ARRIVAL); }
			$.w_setting_dateworkform.add(PICKER_CONTAINER_ARRIVAL);
		} else {
			var picker = Ti.UI.createPicker({
				type: Ti.UI.PICKER_TYPE_TIME,
				value: new Date(),
				locale: "nl-NL",
				format24: true
			});
			picker.showTimePickerDialog({
				value: new Date(),
				locale: "nl-NL",
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
			if(PICKER_CONTAINER_DEPART) { $.w_setting_dateworkform.remove(PICKER_CONTAINER_DEPART); }
			$.w_setting_dateworkform.add(PICKER_CONTAINER_DEPART);
		} else {
			var picker = Ti.UI.createPicker({
				type: Ti.UI.PICKER_TYPE_TIME,
				value: new Date(),
				locale: "nl-NL",
				format24: true
			});
			picker.showTimePickerDialog({
				value: new Date(),
				locale: "nl-NL",
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
 * Function to close Setting Window
 */
function doCloseWindowManually() {
	args.doCloseWindowManually();
	$.w_setting_dateworkform.close();
};

// Button Save Click Listener
var doSaveSettings = function() {
	var date = $.txf_date_val.text || "";
	var arrival_time = $.txf_arrival_val.text || "";
	var depart_time = $.txf_depart_val.text || "";
	
	// Save settings on globally
	var data = {
		'date': date,
		'arrival': arrival_time,
		'depart': depart_time
	};
	Ti.App.Properties.setString('settings_datetimework', JSON.stringify(data));

    
    var w_delivery = Alloy.createController("w_delivery", {
		client : client,
		location : location,
		failure: failure,
		clientWork: clientWork,
        dateObj: data,
		job_type: args.job_type || "",
		doCloseWindowManually: doCloseWindowManually
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_delivery);
	} else {
		w_delivery.open();
	}

};

/**
 * Window's Event Listener
 */
var doOpenWindow = function() {
	if(OS_ANDROID) {
		var activity = $.w_setting_dateworkform.activity,
			actionBar = activity.actionBar;
		if(actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_setting_dateworkform.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};
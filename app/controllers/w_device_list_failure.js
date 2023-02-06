// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var LIST_DATA = [];
var SELECTED_DEVICE = [];
var PREV_SELECTED_DEVICE_INDEX = null;

/**
 * Select device/devices
 */
var doAddDevice = function() {
	// Check Device Selected List
	var selectedDevices = [];
	if (SELECTED_DEVICE.length > 0) {
		for (var i = 0; i < LIST_DATA.length; i++) {
			var item = LIST_DATA[i];
			var custId = item.properties.custId || "";
			if(SELECTED_DEVICE.indexOf(custId) >= 0) {
				selectedDevices.push(item.properties.custData);
			}
		};
	}
	if(selectedDevices.length <= 0) return;
	var w_error_device_list = Alloy.createController("w_error_device_list", {
		devices: selectedDevices || []
	}).getView();
	if(OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_error_device_list);
	} else {
		w_error_device_list.open();
	}
};

/**
 * ListVIew Items click listener
 * Used for Single device selection case
 */
var doItemClickDevices = function(arg) {
	// Select Device single or multiple
	var index = arg.itemIndex;
	var item = arg.section.getItemAt(index);
	
	// Check Previous Index has the value
	if(PREV_SELECTED_DEVICE_INDEX != null && PREV_SELECTED_DEVICE_INDEX >= 0) {
		var prevItem = arg.section.getItemAt(PREV_SELECTED_DEVICE_INDEX);
		if(prevItem) {
			prevItem.isSelected = false;
			prevItem.properties.isSelected = false;
			prevItem.properties.backgroundColor = "transparent";
			SELECTED_DEVICE = [];
			
			arg.section.updateItemAt(PREV_SELECTED_DEVICE_INDEX, prevItem);
		}
	}
	if (item) {
		item.properties.isSelected = true;
		item.properties.backgroundColor = Alloy.CFG.Colors.colorAccent;
		SELECTED_DEVICE.push(item.properties.custId);
		arg.section.updateItemAt(index, item);
		PREV_SELECTED_DEVICE_INDEX = index;
	}
};

// Used for Multiple device selection case
/*
var doItemClickDevices = function(arg) {
	// Select Device single or multiple
	var index = arg.itemIndex;
	var item = arg.section.getItemAt(index);
		
	if (item) {
		if (item.properties.isSelected) {
			item.properties.isSelected = false;
			item.properties.backgroundColor = "transparent";
			SELECTED_DEVICE.splice(SELECTED_DEVICE.indexOf(item.properties.custId), 1);
			// SELECTED_DEVICE = [];
		} else {
			item.properties.isSelected = true;
			item.properties.backgroundColor = Alloy.CFG.Colors.colorAccent;
			SELECTED_DEVICE.push(item.properties.custId);
		}
		arg.section.updateItemAt(index, item);
	}
};
*/

/**
 * Function to load devices into Listview
 */
var doSetListData = function(data) {
	Ti.API.info('Devices received ---> ' + JSON.stringify(data));
	LIST_DATA = [];
	SELECTED_DEVICE = [];

	if (data && data.length > 0) {
		data.forEach(function(item, index) {
			item.index = index;
			Ti.API.info('item.index ----> ' + item.index);
			LIST_DATA.push({
				properties : {
					custData : item,
					custId : (item.index + "") || "",
					searchableText : item.product + " " + item.dossier,
					isSelected : false,
					backgroundColor : "transparent"
				},
				name : {
					text : item.product || ""
				},
				model : {
					text : ((item.model || "") != "") ? ("Model: " + item.model) : "",
					width : ((item.model || "") != "") ? Ti.UI.FILL : 0,
					height : ((item.model || "") != "") ? Ti.UI.SIZE : 0
				},
				type : {
					text : ((item.type || "") != "") ? ("Type: " + item.type) : "",
					width : ((item.type || "") != "") ? Ti.UI.FILL : 0,
					height : ((item.type || "") != "") ? Ti.UI.SIZE : 0
				},
				id : {
					text : ((item.id || "") != "") ? ("ID: " + item.id) : "",
					width : ((item.id || "") != "") ? Ti.UI.FILL : 0,
					height : ((item.id || "") != "") ? Ti.UI.SIZE : 0
				},
				serial : {
					text : ((item.Serienummer || "") != "") ? ("Serienummer: " + item.Serienummer) : "",
					width : ((item.Serienummer || "") != "") ? Ti.UI.FILL : 0,
					height : ((item.Serienummer || "") != "") ? Ti.UI.SIZE : 0
				}
			});
		});
	}

	$.list_section_devices.setItems(LIST_DATA);
};

/**
 * Server callback for function to get articals list
 */
var onSuccessArticals = function(response) {
	Ti.API.info('Server response on Articals ---> ' + JSON.stringify(response));
	try {
		var responseObj = JSON.parse(response);
		if (responseObj && responseObj.status == "ok") {
			var data = responseObj.data || [];
			doSetListData(data);
		} else {
			// close all window and go to logout
			doSetListData(null);
		}
	} catch (ex) {
		Ti.API.error('Exception artical --> ' + ex);
	}
};
var onErrorArticals = function(error) {
	Ti.API.error('Artical list error -> ' + JSON.stringify(error));
};

/**
 * Function to get all articals
 */
var doGrabList = function() {
	if (Ti.Network.online) {
		var user = Ti.App.Properties.getString("user_info", "");
		if(user != "") {
			user = JSON.parse(user);
		}
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Artical;
		if(user != null) {
			url +=  user.id || "";
		}
		url += Alloy.CFG.Debug;
		// url += "/?debug=true";
		Ti.API.info('Url -----> ' + url);
		var data = {
			appid : Ti.App.Properties.getString("app_id") || "",
			token : Ti.App.Properties.getString("token") || ""
		};
		Ti.API.info('Data posted ---> ' + JSON.stringify(data));
		new XHR().post(url, data, onSuccessArticals, onErrorArticals, {
			contentType : "application/x-www-form-urlencoded",
			timeout : 2000
		});
	}
};

/**
 * Window's Event Listener
 */
var doOpenWindow = function() {
	doGrabList();
	if (OS_ANDROID) {
		activity = $.w_device_list_failure.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_device_list_failure.close();
			};
			activity.onCreateOptionsMenu = function(e) {
				var menuItem = e.menu.add({
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
					icon : "images/ic_checked.png"
				});
				menuItem.addEventListener('click', function() {
					doAddDevice();
				});
			};
			activity.invalidateOptionsMenu();
		}
	}
};

var doCloseWindow = function() {
	$.destroy();
}; 
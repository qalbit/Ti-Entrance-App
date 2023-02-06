// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var XHR = require("xhr");
var LIST_DATA = [];

/**
 * Add device 
 */
var doAddDevice = function() {
	Alloy.Globals.SELECTED_DEVICE = null;
	args.refreshPage('new');
	$.w_device_list.close();
};

/**
 * Item's click listener on listview
 */
var doItemClickDevices = function(arg) {
	Ti.API.info("doItemClickDevices line-20");
	var index = arg.itemIndex;
	var item = arg.section.getItemAt(index);
	if (( typeof item != "undefined") && ( typeof item != "null") && (item != undefined) && (item != null)) {
		var custData = item.properties.custData || null;
		Alloy.Globals.SELECTED_DEVICE = custData;
		args.refreshPage('old');
		$.w_device_list.close();
	}
};

/**
 * Function to Get List data and load into ListView
 */
var doSetListData = function(data) {
	LIST_DATA = [];
	if (data && data.length > 0) {
		for (var i = 0,
		    j = data.length; i < j; i++) {
			var clientObj = data[i];

			// Check it is already available in the selected list
			var isSelected = false;
			if (Alloy.Globals.SELECTED_DEVICE && Alloy.Globals.SELECTED_DEVICE.length > 0) {
				for (var k = 0; k < Alloy.Globals.SELECTED_DEVICE.length; k++) {
					var selectedDevice = Alloy.Globals.SELECTED_DEVICE[k];
					if (selectedDevice.ID == clientObj.ID) {
						isSelected = true;
						break;
					}
				};
			}
			
			LIST_DATA.push({
				properties : {
					custData : clientObj,
					searchableText : clientObj.product + " " + clientObj.dossier,
					isSelected : isSelected,
					backgroundColor: (isSelected) ? Alloy.CFG.Colors.colorAccent : 'transparent'
				},
				name : {
					text : clientObj.product || ""
				},
				type : {
					text : ((clientObj.type || "") != "") ? ("Type: " + clientObj.type) : "",
					width : ((clientObj.type || "") != "") ? Ti.UI.FILL : 0,
					height : ((clientObj.type || "") != "") ? Ti.UI.SIZE : 0
				},
				id : {
					text : ((clientObj.ID || "") != "") ? ("IN: " + clientObj.ID) : "",
					width : ((clientObj.ID || "") != "") ? Ti.UI.FILL : 0,
					height : ((clientObj.ID || "") != "") ? Ti.UI.SIZE : 0
				},
				serial : {
					text : ((clientObj.Serienummer || "") != "") ? ("Serienummer: " + clientObj.Serienummer) : "",
					width : ((clientObj.Serienummer || "") != "") ? Ti.UI.FILL : 0,
					height : ((clientObj.Serienummer || "") != "") ? Ti.UI.SIZE : 0
				}
			});
		};
	}

	$.list_section_devices.setItems(LIST_DATA);
};

/**
 * Server callback for function to get articals list
 */
var onSuccessArticals = function(response) {
	try {
		var responseObj = JSON.parse(response);
		Ti.API.info('responseObj -----> ' + JSON.stringify(responseObj));
		if (responseObj && responseObj.status == "ok") {
			var data = responseObj.data || [];
			doSetListData(data);
		} else {
			// close all window and go to logout
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
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Artical + Alloy.Globals.SELECTED_CLIENT.id + "/" + Alloy.CFG.Debug;
		Ti.API.info('Url ---> ' + url);
		var data = {
			appid : Ti.App.Properties.getString("app_id") || "",
			token : Ti.App.Properties.getString("token") || ""
		};
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
		activity = $.w_device_list.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_device_list.close();
			};
			activity.onCreateOptionsMenu = function(e) {
				var menuItem = e.menu.add({
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
					icon : "images/ic_add.png"
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

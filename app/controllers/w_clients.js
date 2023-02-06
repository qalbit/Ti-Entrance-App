// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var XHR = require("xhr");
var LIST_DATA = [];
var FROM = args.from || "";
var SELECT_CLIENT = null;

if (FROM == "delivery_list_edit") {
	$.w_clients.title = "Cliënten bewerken";
}

/**
 * Loader Functions
 */
var doShowLoader = function() {
	$.act_loader.show();
	$.v_loader.visible = true;
};
var doHideLoader = function() {
	$.act_loader.hide();
	$.v_loader.visible = false;
};


/**
 * Function for Client Search from API
 * onChange Listener for searchBar
 */
var doSearchChange = function(arg) {
	var text = ((OS_IOS) ? arg.value : arg.source.value) || "";
	if(text.length > 2) {
		doSearchData(text);
	}
};
var doSearchReturn = function(arg) {
	$.searchBar.blur();
};

/**
 * API function for fetching search data from Server 
 * text will be used to search
 */
var doSearchData = function(text) {
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Search.Client || "";
	url = url.replace("SEARCH_FILTER", text);
	var debugSlug = Alloy.CFG.Debug;
	debugSlug = debugSlug.replace("?", "&");
	url += debugSlug;
	
	Ti.API.info('doSearchData[48] : URL ---> ' + url);
	
	var data = {
		appid: Ti.App.Properties.getString("app_id", "") || "",
		token: Ti.App.Properties.getString("token", "") || ""
	};
	
	new XHR().post(url, data, function(result) {
		try {
			var responseObj = JSON.parse(result);
			Ti.API.info('doSearchData[53] : ResponseObj ---> ' + JSON.stringify(responseObj));
			if(responseObj && responseObj.status == "ok") {
				var responseData = responseObj.data || [];
				doSetListData(responseData);
			}
		} catch(ex) {
			Ti.API.error("Exception Search Client => " + ex);
		}
	}, function(error) {
		Ti.API.info('Server result error ---> ' + JSON.stringify(error));
	}, {
		contentType: "application/x-www-form-urlencoded",
		timeout: "2000"
	});
};

/**
 * Function to save location and close the window
 */
var doSaveItem = function(loc) {
	Ti.API.info('Location -----> ' + JSON.stringify(loc));
	Alloy.Globals.SELECTED_CLIENT_LOCATION = loc;
	if (Alloy.Globals.SELECTED_ITEM && Alloy.Globals.SELECTED_ITEM.data && Alloy.Globals.SELECTED_ITEM.data.work_order) {
		Alloy.Globals.SELECTED_ITEM.data.work_order.clientLocation = loc;
	}
	var w_delivery = null;
	if (FROM == "delivery_list_edit") {
		if (args.data.data && args.data.data.work_order) {
			args.data.data.work_order.clientLocation = loc;
			args.data.data.work_order.selClient = SELECT_CLIENT;
			args.data.data.work_order.client = SELECT_CLIENT.name || "";
		}
		w_delivery = Alloy.createController("w_delivery", {
			mode : 'edit',
			client : SELECT_CLIENT,
			data : args.data,
			location : loc,
			job_type: args.job_type || ""
		}).getView();
	} else {
		Ti.API.info('Selected Client ----> ' + JSON.stringify(SELECT_CLIENT));
		w_delivery = Alloy.createController("w_delivery", {
			client : SELECT_CLIENT,
			location : loc,
			job_type: args.job_type || ""
		}).getView();
	}
	if (FROM == "delivery_list" || FROM == "delivery_list_edit") {
		if (OS_IOS && Alloy.Globals.navWindow) {
			Alloy.Globals.navWindow.openWindow(w_delivery);
		} else {
			w_delivery.open();
		}
	}
	$.w_clients.close();
};

/**
 * Location API callback functions
 */
var onSuccessLocationLoad = function(response) {
	try {
		var responseObj = JSON.parse(response);
		Ti.API.info('OnSuccessLocationLoad ---> ' + JSON.stringify(responseObj));
		if (responseObj) {
			var data = responseObj.data || null;
			if (data && data.length > 0) {
				var w_locations = Alloy.createController("w_locations", {
					data : data,
					saveItem : doSaveItem,
					job_type: args.job_type || ""
				}).getView();
				w_locations.open();
			} else {
				var locationName = "";
				var locationId = "";
				var loc = {
					name : locationName,
					id : locationId
				};
				doSaveItem(loc);
			}
		} else {
			var locationName = "";
			var locationId = "";
			var loc = {
				name : locationName,
				id : locationId
			};
			doSaveItem(loc);
		}
		doHideLoader();
	} catch(ex) {
		Ti.API.info('OnExceptionLocationLoad ---> ' + JSON.stringify(ex));
		doHideLoader();	
	}
};
var onErrorLocationLoad = function(error) {
	Ti.API.info('OnErrorLocationLoad ---> ' + JSON.stringify(error));
	doHideLoader();
};

/**
 * Function to load Location
 */
var doLoadLocation = function(data) {
	if (Ti.Network.online) {
		doShowLoader();
		var clientId = data.id || "";
		var data = {
			appid : Ti.App.Properties.getString("app_id", "") || "",
			token : Ti.App.Properties.getString("token", "") || ""
		};
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Location;
		url = url.replace("LOC_ID", clientId);
		url += Alloy.CFG.Debug;
		Ti.API.info('URL ---->  ' + url);
		Ti.API.info('Post Data ---> ' + JSON.stringify(data));
		new XHR().post(url, data, onSuccessLocationLoad, onErrorLocationLoad, {
			contentType : "application/x-www-form-urlencoded",
			timeout : '2000'
		});
	} else {
		doHideLoader();
	}
};

/**
 * Item's click listener on listview
 */
var doItemClickClient = function(arg) {
	$.searchBar.blur();
	
	var index = arg.itemIndex;
	var item = arg.section.getItemAt(index);
	if (( typeof item != "undefined") && ( typeof item != "null") && (item != undefined) && (item != null)) {
		var custData = item.properties.custData || null;
		var data = {
			id : custData.id || "",
			clientNumber : custData.Klantnummer || "",
			type : custData.type || "",
			name : custData.client || "",
			place : custData.plaats || "",
			customerGroup : custData.Klantgroep || ""
		};
		
		Ti.API.info('data -------> ' + JSON.stringify(data));

		SELECT_CLIENT = data;
		doLoadLocation(data);
		return;
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
			LIST_DATA.push({
				properties : {
					custData : clientObj
				},
				name : {
					text : clientObj.client || ""
				},
				group : {
					text : clientObj.plaats || ""
				},
				status : {
					backgroundColor : (clientObj.status == "Actief") ? "#409C4F" : "#9C4043"
				}
			});
		};
	}

	$.list_section_clients.setItems(LIST_DATA);
};

/**
 * Window's Event Listener
 */
var doOpenWindow = function() {
	doSetListData([]);
	if (OS_ANDROID) {
		var activity = $.w_clients.activity,
		    actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_clients.close();
			};
		}
	}
};
var doCloseWindow = function() {
	if (args.doRefreshWorkPage) {
		args.doRefreshWorkPage();
	}
	$.destroy();
};

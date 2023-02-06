// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var MOMENT = require("moment.min");
var id = args.id || "";
var LOCATION = "";
var PLANNING_TYPE = args.type || "";
var DATA_INFO = null;
var mainTitle = args.mainTitle || "Werk order";
var FROM = args.from || 'dashboard';

var WORK_ORDER_ID = "";
var LIST_DATA = [];

var PLAN_ID = args.planId || "";

var WORK_CLIENT_NAME = "";
var WORK_CLIENT_EMAIL = "";
Ti.API.info('[w_information] job_type ---> ' + args.job_type);
// Main Title change
if (true) {
	$.item_title.text = mainTitle;
	$.v_event_info.width = Ti.UI.FILL;
	$.v_event_info.height = Ti.UI.SIZE;
	$.v_event_info.top = Alloy.CFG.Space.Normal;
	$.v_event_info.bottom = Alloy.CFG.Space.Normal;

	$.lbl_title.top = 0;
	$.lbl_title.width = 0;
	$.lbl_title.height = 0;
	if (args.custData) {
		Ti.API.info('args.custData1111 -----> ' + JSON.stringify(args.custData));
		var startDate = MOMENT(args.custData.start).format('DD-MM-YYYY');
		var startTime = args.custData.time_start;
		var endTime = args.custData.time_end;

		$.lbl_start.text = startTime;
		$.lbl_end.text = endTime;
		$.item_date.text = startDate;
	}
}

/**
 * Function to open externel link for Google Place
 */
var doOpenRouteMap = function() {
	LOCATION = encodeURI(LOCATION);
	var url = "https://www.google.com/maps/place/" + LOCATION;
	if (OS_IOS && Ti.Platform.canOpenURL(url)) {
		Ti.Platform.openURL(url);
	} else {
		Ti.Platform.openURL(url);
	}
};

/**
 * Function to add new work
 */
var doAddNewWork = function() {
	var location_name = (DATA_INFO && DATA_INFO.location_name) ? DATA_INFO.location_name : "";
	var location_address = (DATA_INFO && DATA_INFO.location_address) ? DATA_INFO.location_address : "";
	var client = {
		"id" : DATA_INFO.clients_ext_id || "",
		"clientNumber" : (DATA_INFO.work_orders_priorities_ext_id || "") + "" + (DATA_INFO.clients_ext_id || "" ),
		"type" : "Klant",
		"name" : DATA_INFO.client_name || "",
		"place" : "",
		"customerGroup" : "",
		"work_order_id": WORK_ORDER_ID,
		"plan_id": PLAN_ID
	};
	var location = {
		name : DATA_INFO.location_name || "",
		id : DATA_INFO.clients_locations_ext_id || ""
	};
	var failure = DATA_INFO.failures || [];
	var clientWork = {
		"name": WORK_CLIENT_NAME,
		"email": WORK_CLIENT_EMAIL
	};
	Alloy.Globals.CLIENT_WORK_DET = clientWork || null;
	var w_setting_dateworkform = Alloy.createController('w_setting_dateworkform', {
		client : client,
		location : location,
		failure: failure,
		clientWork: clientWork,
		job_type: args.job_type || "",
		doCloseWindowManually: doCloseWindowManually
	}).getView();
	if(OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_setting_dateworkform);
	} else {
		w_setting_dateworkform.open();
	}
};

/**
 * Function close Window Manually
 */
function doCloseWindowManually() {
	if(args.doCloseWindowManually) {
		args.doCloseWindowManually();
	}
	$.w_information.close();
};

/**
 * Function to Open Email dialog
 */
var doOpenEmailDialog = function(e) {
	var email = e.source.custEmail || "";
	var eD = Ti.UI.createEmailDialog();
	eD.toRecipients = [email];
	eD.open();
};

/**
 * Function to Open Phone
 */
var doOpenPhoneDialog = function(e) {
	var phone = e.source.custPhone || "";
	var url = "tel:" + phone;
	if (OS_IOS && Ti.Platform.canOpenURL(url)) {
		Ti.Platform.openURL(url);
	} else {
		Ti.Platform.openURL(url);
	}
};

/**
 * ListItem Click Listener
 */
var doClickTemplateItem = function(arg) {
	var itemIndex = arg.itemIndex;
	var clicked_item = arg.section.getItemAt(itemIndex);

	if (clicked_item && clicked_item != null && ( typeof clicked_item != "undefined") && ( typeof clicked_item != "null")) {
		var custData = clicked_item.properties.custData || null;
		if (custData) {
			var w_history_information = Alloy.createController("w_history_information", {
				information : custData,
				job_type: args.job_type || "",
			}).getView();
			if (OS_IOS && Alloy.Globals.navWindow) {
				Alloy.Globals.navWindow.openWindow(w_history_information);
			} else {
				w_history_information.open();
			}
		}
	}
};

/**
 * ListView Failures items listing
 */
var doInsertListItemsBasedOnFailureData = function(data) {
	var DATA = [];
	if (data) {
		if (data && data.length > 0) {
			for (var i = 0,
			    j = data.length; i < j; i++) {
				var event = data[i];
				DATA.push({
					template : "template_content_failure",
					properties : {
						custData : event,
						type : "normal",
					},
					itemName : {
						text : event.name || ""
					},
					itemDesc : {
						text : event.description || ""
					}
				});
			};
		}
	}
	$.listsec_failure.setItems(DATA);
};

/**
 * ListView History items listing
 */
var doInsertListItemsBasedOnHistoryData = function(data) {
	LIST_DATA = [];
	if (data) {
		if (data && data.length > 0) {
			for (var i = 0,
			    j = data.length; i < j; i++) {
				var event = data[i];
				LIST_DATA.push({
					template : "template_content",
					properties : {
						custData : event,
						type : "normal",
					},
					timeStart : {
						text : event.start || ""
					},
					timeEnd : {
						text : event.end || ""
					},
					itemType : {
						text : event.name || ""
					},
					itemTitle : {
						text : event.fail_description || ""
					},
					itemDate : {
						text : event.date || ""
					}
				});
			};
		}
	}
	$.listsec_events.setItems(LIST_DATA);
};

/**
 * Server callback functions
 */
var onSuccessServerData = function(response) {
	try {
		var responseObj = JSON.parse(response);
		Ti.API.info('Response Object [218] ----> ' + JSON.stringify(responseObj));
		if (responseObj && responseObj.data) {
			var data = responseObj.data || null;
			if (data) {
				WORK_CLIENT_NAME = data.contactperson || "";
				WORK_CLIENT_EMAIL = data.email || "";
				DATA_INFO = data;
				WORK_ORDER_ID = data.id || "";
				if (data.client_name != "") {
					$.v_client.width = Ti.UI.FILL;
					$.v_client.height = Ti.UI.SIZE;
					var name = data.client_name || "";
					name = name.split("/")[0];
					$.lbl_cname.text = name || "";
				}
				if (data.contactperson != "") {
					$.v_contact.width = Ti.UI.FILL;
					$.v_contact.height = Ti.UI.SIZE;
					$.lbl_contact.text = data.contactperson || "";
					if(data.location_information != "") {
						$.lbl_location_info.text = data.location_information || "";
						$.lbl_location_info.top = Alloy.CFG.Space.Tiny;
					}
				}
				if (data.email != "") {
					$.v_email.width = Ti.UI.FILL;
					$.v_email.height = Ti.UI.SIZE;
					$.lbl_email.text = data.email || "";
					$.v_email.custEmail = data.email || "";
					$.lbl_email_key.custEmail = data.email || "";
					$.lbl_email.custEmail = data.email || "";
				}
				if (data.phone_1 != "") {
					$.v_phone_1.width = Ti.UI.FILL;
					$.v_phone_1.height = Ti.UI.SIZE;
					$.lbl_phone_1.text = data.phone_1 || "";
					$.v_phone_1.custPhone = data.phone_1 || "";
					$.lbl_phone_1_key.custPhone = data.phone_1 || "";
					$.lbl_phone_1.custPhone = data.phone_1 || "";
				}
				if (data.phone_2 != "") {
					$.v_phone_2.width = Ti.UI.FILL;
					$.v_phone_2.height = Ti.UI.SIZE;
					$.lbl_phone_2.text = data.phone_2 || "";
					$.v_phone_2.custPhone = data.phone_2 || "";
					$.lbl_phone_2_key.custPhone = data.phone_2 || "";
					$.lbl_phone_2.custPhone = data.phone_2 || "";
				}
				if (data.location_name != "") {
					$.v_loca.width = Ti.UI.FILL;
					$.v_loca.height = Ti.UI.SIZE;
					$.lbl_loca.text = data.location_name || "";
				}
				if (data.location_address != "") {
					$.v_loca_add.width = Ti.UI.FILL;
					$.v_loca_add.height = Ti.UI.SIZE;
					$.lbl_loca_add.text = data.location_address || "";
					LOCATION = data.location_address || "";
					$.v_loca_btn.width = Ti.UI.FILL;
					$.v_loca_btn.height = Ti.UI.SIZE;
				}

				if (data.name != "") {
					$.v_store.width = Ti.UI.FILL;
					$.v_store.height = Ti.UI.SIZE;
					$.lbl_name.text = data.name || "";
				}
				if (data.description != "") {
					$.v_desc.width = Ti.UI.FILL;
					$.v_desc.height = Ti.UI.SIZE;
					$.lbl_desc.text = data.description || "";
				}

				// History data
				var historyData = data.history || [];
				if(historyData && historyData.length > 0) {
					$.v_history.width = Ti.UI.FILL;
					$.v_history.height = Ti.UI.SIZE;
					doInsertListItemsBasedOnHistoryData(historyData);
				}
				
				// Failure data
				var failuresData = data.failures || [];
				if(failuresData && failuresData.length > 0) {
					$.v_failure.width = Ti.UI.FILL;
					$.v_failure.height = Ti.UI.SIZE;
					doInsertListItemsBasedOnFailureData(failuresData);
				}
			}
		}
	} catch(ex) {
		Ti.API.info('Exception server data ----> ' + ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.info('Error Server data -----> ' + JSON.stringify(error));
};

/**
 * Function to get Server Information to retrieve data
 */
var doGrabData = function(id) {
	var data = {
		appid : Ti.App.Properties.getString("app_id", "") || "",
		token : Ti.App.Properties.getString("token", "") || ""
	};
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Inform + id + "/" + Alloy.CFG.Debug;
	new XHR().post(url, data, onSuccessServerData, onErrorServerData, {
		contentType : "application/x-www-form-urlencoded",
		timeout : '2000'
	});
};

/**
 * Function to show Planning button based on the button
 */
function doShowPlanningButton() {
	if (PLANNING_TYPE == "1") {
		$.btn_add_work.visible = true;
	}
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	doGrabData(id);
	doShowPlanningButton();
	if (OS_ANDROID) {
		var activity = $.w_information.activity,
		    actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_information.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};

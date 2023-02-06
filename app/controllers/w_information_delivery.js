// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var MOMENT = require("moment.min");
var id = args.id || "";
var deliveryId = args.deliveryId || "";
var PLANNING_TYPE = args.type || "";
var mainTitle = args.mainTitle || "Levering";
var CUST_DATA = args.custData || null;
var PLAN_ID = args.planId || "";
var FROM = args.from || "dashboard";
var LOCATION = "";
Ti.API.info('[w_information_delivery] job_type ---> ' + args.job_type);

var DATA_INFO = null;

var PRODUCTS = [];

var CLIENT_NAME = "";
var CLIENT_LOC = "";
var CONTACT_INFO = {};

// Main Title Change
$.item_title.text = mainTitle;
$.v_event_info.width = Ti.UI.FILL;
$.v_event_info.height = Ti.UI.SIZE;
$.v_event_info.top = Alloy.CFG.Space.Normal;
$.v_event_info.bottom = Alloy.CFG.Space.Normal;

$.lbl_title.top = 0;
$.lbl_title.width = 0;
$.lbl_title.height = 0;

if(args.custData) {
	var startDate = MOMENT(args.custData.start).format('DD-MM-YYYY');
	var startTime = args.custData.time_start;
	var endTime = args.custData.time_end;
	
	$.lbl_start.text 	= startTime;
	$.lbl_end.text 		= endTime;
	$.item_date.text 	= startDate;
}

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
 * Function close Window Manually
 */
function doCloseWindowManually() {
	if(args.doCloseWindowManually) {
		args.doCloseWindowManually();
	}
	$.w_information_delivery.close();
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
 * Function to open external link for Google Place
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

function doOpenProducts() {
	var w_information_products = Alloy.createController("w_information_products", {
		data: PRODUCTS,
		dataInfo: DATA_INFO,
		clientInfo: CONTACT_INFO,
		job_type: args.job_type || "",
		doCloseWindowManually: doCloseWindowManually
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_information_products);
	} else {
		w_information_products.open();
	}
};

/**
 * Function to show Planning button based on the button
 */
function doShowProductButton() {
	$.btn_list_products.visible = true;
};


var onSuccessServerData = function(response) {
	try {
		var responseObj = JSON.parse(response);
		if(responseObj && responseObj.data) {
			var data = responseObj.data || null;
			if(data) {
				DATA_INFO = data;
				
				if(data.client_name != "") {
					$.v_client.width = Ti.UI.FILL;
					$.v_client.height = Ti.UI.SIZE;
					var name = data.client_name || "";
					name = name.split("/")[0];
					$.lbl_cname.text = name || "";
					CLIENT_NAME = name || "";
				}
				if (data.contactperson != "") {
					$.v_contact.width = Ti.UI.FILL;
					$.v_contact.height = Ti.UI.SIZE;
					$.lbl_contact.text = data.contactperson || "";
					if(data.location_information != "") {
						$.lbl_location_info.text = data.location_information || "";
						$.lbl_location_info.top = Alloy.CFG.Space.Tiny;
					}
					CONTACT_INFO.name = data.contactperson || "";
				}
				if(data.email != "") {
					$.v_email.width = Ti.UI.FILL;
					$.v_email.height = Ti.UI.SIZE;
					$.lbl_email.text = data.email || "";
					$.v_email.custEmail = data.email || "";
					$.lbl_email_key.custEmail = data.email || "";
					$.lbl_email.custEmail = data.email || "";
					CONTACT_INFO.email = data.email || "";
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
					CLIENT_LOC = data.location_address || "";
				}
				
				if (data.name != "") {
					// $.v_store.width = Ti.UI.FILL;
					// $.v_store.height = Ti.UI.SIZE;
					// $.lbl_name.text = data.name || "";
				}
				
				if (data.description != "") {
					$.v_desc.width = Ti.UI.FILL;
					$.v_desc.height = Ti.UI.SIZE;
					$.lbl_desc.text = data.description || "";
				}
				
				var products = data.products || [];
				if(products && products.length > 0) {
					PRODUCTS = products || [];
					doShowProductButton();
				}
			}
		}
	} catch(ex) {
		Ti.API.debug('Exception onSuccessServerData ----> ' + ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.info('Error server data ----> ' + JSON.stringify(error));
};

/**
 * Function to get server information to retrieve product data
 */
var doGrabProducts = function(id) {
	var data = {
		appid: Ti.App.Properties.getString("app_id", "") || "",
		token: Ti.App.Properties.getString("token", "") || ""
	};
	// https://so.hsbh.app/webservices/app/data/delivery/view/1/?debug=true
	var url = Alloy.CFG.Url.Base + 
			Alloy.CFG.Url.EndPoint.DeliveryProducts + id + "/" + Alloy.CFG.Debug;
		
	Ti.API.info('Information URL -----> ' + url);
	Ti.API.info('Information Data ----> ' + JSON.stringify(data));
	new XHR().post(url, data, onSuccessServerData, onErrorServerData, {
		contentType: "application/x-www-form-urlencoded",
		timeout: "2000"
	});
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	doGrabProducts(deliveryId);
	if (OS_ANDROID) {
		var activity = $.w_information_delivery.activity,
		    actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_information_delivery.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};

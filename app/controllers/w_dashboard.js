// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var DB = require("db");
var APP = require("utility");
// Default Variables
var DATA = null;
var LIST_DATA = [];

/**
 * Self calling function to grab values from DB
 */
(function() {
	doSetDashboardUI();
})();

/**
 * Server Callback function
 */
var onSuccessServerData = function(response) {
	try {
		var responseObj = JSON.parse(response);
		if (responseObj) {
			var status = responseObj.status || "ok";
			var message = responseObj.feedback || "";
			if (status != "ok") {
				alert(message);
				return;
			}

			var responseData = responseObj.data || null;
			if (responseData) {
				// Store DATA in DB
				DB.DAS.reset();
				DB.EMP.reset();
				DB.PLN.reset();
				DB.PRD.reset();
				DB.CLI.reset();
				if(Ti.App.Properties.getString("token", "") == "") {
					DB.DAT.reset();
				}
				// Rest SharedPreference 
				Ti.App.Properties.setString("user_info", "");
				var user = responseData.client || "";
				user = JSON.stringify(user);
				Ti.App.Properties.setString("user_info", user);
				
				var dasb = responseData.dashboard || {};
				var emps = responseData.employees || [];
				var plans = responseData.planning || [];
				var prods = responseData.products || [];
				var clients = responseData.clients || [];
				
				DB.DAS.setData(dasb);
				DB.EMP.setData(JSON.stringify(emps));
				DB.PLN.setData(JSON.stringify(plans));
				DB.CLI.setData(JSON.stringify(clients));
				
				var products = JSON.stringify(prods);
				var prdsArray = APP.convertIntoChunks(products, 2500);
				if(prdsArray && prdsArray.length > 0) {
					prdsArray.forEach(function(item) {
						DB.PRD.setData(item);
					});
				}
			}
			
			doSetDashboardUI();
		}
	} catch(ex) {
		Ti.API.error('Exception on Login ----> ' + ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.error(JSON.stringify(error));
};

/**
 * Get data response from server
 */
var doGetServerData = function() {
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Data + Alloy.CFG.Debug;
	var data = {
		appid : Ti.App.Properties.getString("app_id", ""),
		token : Ti.App.Properties.getString("token", "")
	};
	new XHR().post(url, data, onSuccessServerData, onErrorServerData, {
		contentType : "application/x-www-form-urlencoded",
		timeout : '2000'
	});
};

/**
 * Function to grab data
 */
function doCloseWindowManually() {
	doGetServerData();
};

/**
 * Function to Set dashboard UI
 */
function doSetDashboardUI() {
	var data = DB.DAS.getData();
	if (data && data.length > 0) {
		DATA = data[0];
		// Set Values accordingly
		$.lbl_welcome.text = DATA.welcome_title || "Welcome home,";
		$.lbl_clientname.text = DATA.welcome_text || "User,";
		doSetTodaysEventsList();
	}
}

Alloy.Globals.refreshDashboard = function() {
	doSetDashboardUI();
};

/**
 * Template item click listener
 */
var doClickTemplateItem = function(arg) {
	var itemIndex = arg.itemIndex;
	var item = arg.section.getItemAt(itemIndex);
	if (item) {
		var isClickable = item.properties.isClickable || false;
		var custData = item.properties.custData || null;
		var cwo = item.properties.cwo || "";
		var type = item.properties.type || "";
		var title = item.properties.title || "";
		var plan_id = custData.plan_id || "";
		var job_type = custData.job_type || "";
		if (cwo != "" && job_type == "work_form") {
			var w_information = Alloy.createController("w_information", {
				id : cwo,
				type: type,
				mainTitle: title,
				custData: custData,
				planId: plan_id,
				job_type: job_type,
				doCloseWindowManually: doCloseWindowManually
			}).getView();
			if (OS_IOS && Alloy.Globals.navWindow) {
				Alloy.Globals.navWindow.openWindow(w_information);
			} else {
				w_information.open();
			}
		} else {
			if(job_type == "delivery") {
				var w_information_delivery = Alloy.createController("w_information_delivery", {
					id : cwo,
					deliveryId: custData.delivery_id,
					type : type,
					mainTitle: title,
					custData: custData,
					planId: plan_id,
					job_type: job_type,
					doCloseWindowManually: doCloseWindowManually
				}).getView();
				if (OS_IOS && Alloy.Globals.navWindow) {
					Alloy.Globals.navWindow.openWindow(w_information_delivery);
				} else {
					w_information_delivery.open();
				}
			}
		}
	}
};

/**
 * Function to set events list for today into listview
 */
function doSetTodaysEventsList() {
	LIST_DATA = [];
	if (DATA) {
		if (DATA.today && DATA.today.length > 0) {
			for (var i = 0,
			    j = DATA.today.length; i < j; i++) {
				var event = DATA.today[i];
				var cwo = event.cwo || "";
				LIST_DATA.push({
					template : "template_content",
					properties : {
						custData : event,
						cwo : cwo,
						type: event.planning_type || "",
						isClickable : (cwo == "") ? false : true
					},
					timeStart : {
						text : event.time_start || ""
					},
					timeEnd : {
						text : event.time_end || ""
					},
					itemType : {
						text : event.name || ""
					},
					itemTitle : {
						text : event.title || ""
					},
					itemSubtitle: {
						text: event.description || "",
						top: ((event.description || "") != "") ? Alloy.CFG.Space.Tiny : 0,
						height: ((event.description || "") != "") ? Ti.UI.SIZE : 0
					},
					itemLocation: {
						text: event.location_information || "",
						top: ((event.location_information || "") != "") ? Alloy.CFG.Space.Tiny : 0,
						height: ((event.location_information || "") != "") ? Ti.UI.SIZE : 0
					},
					itemPriority: {
						image: (event.priority && event.priority == "4") ? "/images/ic_alert.png" : ""
					}
				});
			};
		}
	}
	$.listsec_events.setItems(LIST_DATA);
	if (LIST_DATA.length <= 0) {
		$.lbl_header.text = "Geen afspraken vandaag";
	} else {
		$.lbl_header.text = "Vandaag";
	}
};

/**
 * IOS Navigation Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};
var doClickRefreshAPI = function() {
	doGetServerData();
};
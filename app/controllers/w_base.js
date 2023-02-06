// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
Alloy.Globals.navWindow = null;
var XHR = require("xhr");
var DB = require("db");
var moment = require('moment.min');
var DRAWER = (OS_IOS) ? require('dk.napp.drawer') : null;
var APP = require("utility");
var wBase = null;
var CURRNT_WIN = null;
var actionBar = null;
var activity = null;
var ln = Ti.Locale.currentLanguage;
moment.locale(ln);


/**
 * Function to Set Drawer UI
 */
function doSetDashboardUI() {
	var data = DB.DAS.getData();
	if (data && data.length > 0) {
		DATA = data[0];
		// Set Values accordingly
		$.lbl_user_name.text = DATA.welcome_text || "";
		$.ig_profile.image = "images/ic_no_user.png";
	}
}

doSetDashboardUI();

/**
 * Setup Drawer Window
 */
if (OS_IOS) {
	wBase = DRAWER.createDrawer({
		centerWindow : Ti.UI.createNavigationWindow({window: $.centerWindow}),
		leftWindow : Ti.UI.createNavigationWindow({window: $.leftWindow}),
		leftDrawerWidth : (!Alloy.isTablet) ? 200 : 300,
		statusBarStyle: DRAWER.STATUSBAR_WHITE,
		closeDrawerGestureMode: DRAWER.CLOSE_MODE_ALL,
		openDrawerGestureMode: DRAWER.OPEN_MODE_ALL,
		orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT],
		showShadow: false
	});
	wBase.open();
} else {
	DRAWER = Ti.UI.Android.createDrawerLayout({
		leftView : $.leftWindow,
		centerView : $.centerWindow,
		leftWidth : 280
	});
	wBase = Ti.UI.createWindow();
	wBase.add(DRAWER);
	wBase.open();
}
setTimeout(function() {
	doOpenDashboard(false);
}, 400);



/**
 * Toggle Window to Left or Right
 */
function toggleLeft() {
	if (OS_IOS) {
		wBase.toggleLeftWindow();
	} else {
		DRAWER.toggleLeft();
	}
};
Alloy.Globals.toggleDrawer = function() {
	toggleLeft();
};
Alloy.Globals.doStopToggle = function(require) {
	if (OS_IOS) {
		// if (require) {
		// 	wBase.setCenterhiddenInteractivity("TouchDisabled");
		// } else {
		// 	wBase.setCenterhiddenInteractivity("TouchEnabled");
		// }
	}
};

/**
 * List Menu Click Listener
 */
$.list_nav_menu.addEventListener("itemclick", function(e) {
	var index = e.itemIndex;
	switch(index) {
	case 0:
		doOpenDashboard(true);
		break;
	case 1:
		doOpenAgenda(true);
		break;
	case 2:
		doOpenDeliveryList(true);
		break;
	case 3:
		doOpenSendFailure(true);
		break;
	case 4:
		// doOpenDeliveryList(true);
		break;
	}
});
/**
 * Open Dashboard Window
 */
function doOpenDashboard(toggleRequired) {
	var w_dashboard = Alloy.createController('w_dashboard').getView();
	if (OS_IOS) {
		wBase.centerWindow = w_dashboard;
		Alloy.Globals.navWindow = w_dashboard;
	} else {
		DRAWER.centerView = w_dashboard;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	if (OS_ANDROID && activity != null) {
		activity.onCreateOptionsMenu = function(e) {
			var menuItemRefresh = e.menu.add({
				title: "Refresh",
				showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon: "images/ic_refresh.png"
			});
			menuItemRefresh.addEventListener('click', function() {
				doGetServerData();
			});
		};
		activity.invalidateOptionsMenu();
	}
	CURRNT_WIN = "dashboard";

};
/**
 * Open Agenda Window
 */
var menuItemMonthTitle = null;
function doOpenAgenda(toggleRequired) {
	var w_agenda = Alloy.createController('w_agenda').getView();
	if (OS_IOS) {
		wBase.centerWindow = w_agenda;
		Alloy.Globals.navWindow = w_agenda;
	} else {
		DRAWER.centerView = w_agenda;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	CURRNT_WIN = "agenda";
	// Do create agenda menu for Android
	if (OS_ANDROID) {
		activity.onCreateOptionsMenu = function(e) {
			var menuItem = e.menu.add({
				title : "Open/Close Agenda",
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : "images/ic_dropdown_down.png"
			});
			menuItem.addEventListener("click", function(e) {
				if (Alloy.Globals.doVisibleMonthView) {
					Alloy.Globals.doVisibleMonthView();
				}
			});
			menuItemMonthTitle = e.menu.add({
				title : moment().format("MMMM"),
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			});
			menuItemMonthTitle.addEventListener("click", function(e) {
				if (Alloy.Globals.doVisibleMonthView) {
					Alloy.Globals.doVisibleMonthView();
				}
			});
			
			var menuItemRefresh = e.menu.add({
				title: "Refresh",
				showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon: "images/ic_refresh.png"
			});
			menuItemRefresh.addEventListener('click', function() {
				doGetServerData();
			});
		};
		activity.invalidateOptionsMenu();
	}
};

Alloy.Globals.doChangeMonthTitle = function(val) {
	if (menuItemMonthTitle) {
		menuItemMonthTitle.title = val;
	}
};
/**
 * Open Form Window
 */
function doOpenForm(toggleRequired) {
	var w_form = Alloy.createController('w_form').getView();
	if (OS_IOS) {
		wBase.centerWindow = w_form;
		Alloy.Globals.navWindow = w_form;
	} else {
		DRAWER.centerView = w_form;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	CURRNT_WIN = "form";
	// Do create agenda menu for Android
	if (OS_ANDROID) {
		activity.onCreateOptionsMenu = function(e) {
		};
		activity.invalidateOptionsMenu();
	}
};
/**
 * Open Planner Window
 */
function doOpenPlanner(toggleRequired) {
	var w_planner = Alloy.createController('w_planner').getView();
	if (OS_IOS) {
		wBase.centerWindow = w_planner;
		Alloy.Globals.navWindow = w_planner;
	} else {
		DRAWER.centerView = w_planner;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	CURRNT_WIN = "planner";
	// Do create agenda menu for Android
	if (OS_ANDROID) {
		activity.onCreateOptionsMenu = function(e) {
		};
		activity.invalidateOptionsMenu();
	}
};
/**
 * Open Delivery List Window
 */
function doOpenDeliveryList(toggleRequired) {
	var w_delivery_list = Alloy.createController('w_delivery_list', {
		job_type: '' // work_form
	}).getView();
	if (OS_IOS) {
		wBase.centerWindow = w_delivery_list;
		Alloy.Globals.navWindow = w_delivery_list;
	} else {
		DRAWER.centerView = w_delivery_list;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	CURRNT_WIN = "delivery";
	// Do create agenda menu for Android
	if (OS_ANDROID) {
		activity.onCreateOptionsMenu = function(e) {
		};
		activity.invalidateOptionsMenu();
	}
};

/**
 * Open Failure Window
 */
function doOpenSendFailure(toggleRequired) {
	var w_overviewer = Alloy.createController('w_overviewer').getView();
	if (OS_IOS) {
		wBase.centerWindow = w_overviewer;
		Alloy.Globals.navWindow = w_overviewer;
	} else {
		DRAWER.centerView = w_overviewer;
	}
	if (toggleRequired) {
		toggleLeft();
	}
	CURRNT_WIN = "overviewer";
	// Do create agenda menu for Android
	if (OS_ANDROID) {
		activity.onCreateOptionsMenu = function(e) {
		};
		activity.invalidateOptionsMenu();
	}
};

/**
 * Global function to open delivery list
 */
Alloy.Globals.doOpenDeliveryList = function() {
	var w_delivery_list = Alloy.createController('w_delivery_list', {
		from : 'information'
	}).getView();
	if (OS_IOS) {
		wBase.centerWindow = w_delivery_list;
		Alloy.Globals.navWindow = w_delivery_list;
	} else {
		DRAWER.centerView = w_delivery_list;
	}
	CURRNT_WIN = "delivery";
};

/**
 * Logout User
 */
var doLogoutUser = function() {
	DB.DAS.reset();
	DB.EMP.reset();
	DB.PLN.reset();
	DB.PRD.reset();
	DB.CLI.reset();
	DB.DAT.reset();
	Ti.App.Properties.setString("token", "");
	Ti.App.Properties.setString("user_info", "");
	var w_login = Alloy.createController("w_login").getView();
	w_login.open();
	wBase.close();
};

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
				Ti.App.Properties.setString('token', "");
				alert(message);
				doLogoutUser();
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
				DB.DAT.reset();
				
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

			// Globals function will fire from here
			if (CURRNT_WIN == "dashboard" && Alloy.Globals.refreshDashboard) {
				Alloy.Globals.refreshDashboard();
			}
			if (CURRNT_WIN == "agenda" && Alloy.Globals.refreshAgenda) {
				Alloy.Globals.refreshAgenda();
			}
			if (CURRNT_WIN == "delivery" && Alloy.Globals.refreshDeliveryList) {
				Alloy.Globals.refreshDeliveryList();
			}
			doSetServiceVerzoeken();
		}
	} catch(ex) {
		Ti.API.info(ex);
	}
};
var onErrorServerData = function(error) {
	Ti.API.error(JSON.stringify(error));
};

/**
 * Get data response from server
 */
function doGetServerData() {
	var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Data + Alloy.CFG.Debug;
	var data = {
		appid : Ti.App.Properties.getString("app_id") || "",
		token : Ti.App.Properties.getString("token", "") || ""
	};
	Ti.API.info('w_base[399] URL ---> ' + url);
	Ti.API.info('w_base[400] Data ---> ' + JSON.stringify(data));
	new XHR().post(url, data, onSuccessServerData, onErrorServerData, {
		contentType : "application/x-www-form-urlencoded",
		timeout : '2000'
	});
};

/**
 * Current Window's Event Listeners
 */
Ti.App.addEventListener('open', function() {
});
Ti.App.addEventListener('resumed', function() {
	Ti.API.info('w_base[413] ---> Resumed clicked');
	doGetServerData();
});

/**
 * Set Service verzoeken visibility based on the client info
 */
function doSetServiceVerzoeken() {
	var user = Ti.App.Properties.getString("user_info", "");
	if(user != "") {
		var listItem = {
			template: "template_menu",
			properties: {
				custData: user,
			},
			itemImage: {
				image: "images/menu/ic_delivery.png"
			},
			itemTitle: {
				text: "Service verzoeken"
			}
		};
		var items = $.list_sec_nav_menu.items || [];
		if(items.length == 3) {
			$.list_sec_nav_menu.insertItemsAt(items.length, [listItem]);	
		} else {
			$.list_sec_nav_menu.updateItemAt(items.length, listItem);
		}
	}
	// list_sec_nav_menu
};
doSetServiceVerzoeken();

/**
 * Window's Open Event Listener
 */
if (OS_ANDROID) {
	wBase.addEventListener('open', function() {
		activity = wBase.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				toggleLeft();
			};
		}
	});
}

var doClickRefreshAPI = function() {
	doGetServerData();
};

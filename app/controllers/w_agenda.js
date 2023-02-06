// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var moment = require('moment.min');
var CALENDER = require('calender');
var XHR = require("xhr");
var DB = require("db");
var APP = require("utility");
var ln = Ti.Locale.currentLanguage;
moment.locale(ln);
/**
 * Default Variables
 */
var MONTH_VIEWS = [];
var MONTH_LIST_ITEMS;
var LIST_ITEMS = [];

/**
 * Animation Flags
 */
var CURRENT_ANIMATE_STATE = 0;

/**
 * Used Animation definations
 */
var animate_height_true = Ti.UI.createAnimation({
	top : 0,
	duration : 400
});
var animate_height_false = Ti.UI.createAnimation({
	top : '-375',
	duration : 300
});
var animate_top_true = Ti.UI.createAnimation({
	top : 0,
	duration : 400
});
var animate_top_false = Ti.UI.createAnimation({
	top : 383,
	duration : 300
});
/**
 * IOS Navigation Button Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};

var doClickMonthNavBtn = function() {
	if ($.btn_left_month.image == "/images/ic_dropdown_down.png") {
		$.btn_left_month.image = "/images/ic_dropdown_up.png";
		doAnimateWeekEventHeight(true);
	} else {
		$.btn_left_month.image = "/images/ic_dropdown_down.png";
		doAnimateWeekEventHeight(false);
	}
};
var isVisible = false;
Alloy.Globals.doVisibleMonthView = function() {
	if (isVisible) {
		isVisible = false;
		doAnimateWeekEventHeight(false);
	} else {
		isVisible = true;
		doAnimateWeekEventHeight(true);
	}
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
			
			doGetEvents();
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
 * iOS Function to refresh api data
 */
function doClickRefreshAPI() {
	doGetServerData();
};

/**
 * Function to grab data
 */
function doCloseWindowManually() {
	doGetServerData();
};

/**
 * ListView Item Click Listener
 */
var doItemClickEvents = function(e) {
	try {
		var itemIndex = e.itemIndex;
		var clickedItem = e.section.getItemAt(itemIndex);
		if (( typeof clickedItem != "undefined") && ( typeof clickedItem != "null")) {
			var custData = clickedItem.properties.custData || null;
			if (custData) {
				var cwo = clickedItem.properties.cwo || "";
				var type = clickedItem.properties.type || "";
				var title = clickedItem.properties.title || "";
				var plan_id = custData.plan_id || "";
				var job_type = custData.job_type || "";
				
				if (cwo != "" && job_type == "work_form") {
					var w_information = Alloy.createController("w_information", {
						id : cwo,
						type : type,
						mainTitle: title,
						custData: custData,
						planId: plan_id,
						from: 'agenda',
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
							from: 'agenda',
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
		}
	} catch (ex) {
		Ti.API.debug('Exception on item click event ---> ' + ex);
	}
};

/**
 * Animate Week Event View Animation
 */
function doAnimateWeekEventHeight(isHeightRequired) {
	if (isHeightRequired) {
		// Animate to Height
		if (CURRENT_ANIMATE_STATE == 0) {
			$.v_week_events_cont.animate(animate_height_true);
			$.list_month_events.animate(animate_top_false);
		}
		CURRENT_ANIMATE_STATE = 1;
	} else {
		// Animate to ZERO
		if (CURRENT_ANIMATE_STATE == 1) {
			$.v_week_events_cont.animate(animate_height_false);
			$.list_month_events.animate(animate_top_true);
		}
		CURRENT_ANIMATE_STATE = 0;
	}
};

/**
 * Function to Generate Event Date UI
 */
function doGenerateMonthUI(events) {
	var currentMonth = moment();
	// Set Current Month Name
	// lbl_left_month
	if (OS_IOS) {
		$.lbl_left_month.text = currentMonth.format("MMMM");
	} else {
		if (Alloy.Globals.doChangeMonthTitle) {
			setTimeout(function() {
				Alloy.Globals.doChangeMonthTitle(currentMonth.format("MMMM"));
			}, 500);
		}
	}
	var calenderView = new CALENDER().createView(currentMonth, events, null, {
		textObj : (OS_IOS) ? $.lbl_left_month : null
	});
	$.v_week_events_holder_cont.removeAllChildren();
	$.v_week_events_holder_cont.add(calenderView);
}

/**
 * Global function to get List values from Month and Year
 * @param {month} events Month
 * @param {year} events Year
 */
Alloy.Globals.doChangeList = function(month, year) {
	LIST_ITEMS = [];
	var qMy = month + "-" + year;
	var evts = (MONTH_LIST_ITEMS) ? MONTH_LIST_ITEMS[qMy] : [];
	if (evts && evts.length > 0) {
		var evts = _.sortBy(evts, function(o) {
			return o.timestamp;
		});
		var evtsn = _.groupBy(evts, 'date');
		for (var key in evtsn) {
			if (evtsn.hasOwnProperty(key)) {
				var events = evtsn[key];
				for (var i = 0,
				    j = events.length; i < j; i++) {
					var event = events[i];
					Ti.API.debug('EVENT['+i+'] => ' + JSON.stringify(event));
					var d = moment(event.start).format("DD");
					var w = moment(event.start).format("ddd");
					var id = event.id;
					var t = event.title || "";
					var n = event.name;
					var de = event.description || "";
					var cwo = event.cwo || "";
					var l = event.location_information || "";

					var listItemObj = {
						template : "template_month_list",
						properties : {
							custData : event,
							cwo : cwo,
							type : event.planning_type || "",
							isClickable : (cwo == "") ? false : true,
							title: t
						},
						itemDay : {
							text : (i == 0) ? d : ""
						},
						itemDayWeek : {
							text : (i == 0) ? w : ""
						},
						itemEventTypeCont : {
							bottom : (i == events.length - 1) ? Alloy.CFG.Space.AgendaBottom : 0
						},
						itemEventTitle : {
							text : t || ""
						},
						itemEventType : {
							text : n || ""
						},
						itemEventSubtitle: {
							text: de || "",
							height: ((de || "") != "") ? Ti.UI.SIZE : 0
						},
						itemLocation: {
							text: l || "",
							height: ((l || "") != "") ? Ti.UI.SIZE : 0,
							bottom: ((l || "") != "") ? Alloy.CFG.Space.Tiny : 0
						}
					};
					LIST_ITEMS.push(listItemObj);
				};
			}
		}
	} else {
		LIST_ITEMS = [];
		LIST_ITEMS.push({
			template : "template_no_data",
			properties : {
				custId : 'no_data'
			}
		});
	}
	$.list_sec_event.setItems(LIST_ITEMS);
};

var doGenerateMonthList = function(events) {
	var data = DB.PLN.getData();
	if(data != null) {
		data = JSON.parse(data);
	}
	MONTH_LIST_ITEMS = null;
	MONTH_LIST_ITEMS = _.groupBy(events, 'month');
	Alloy.Globals.doChangeList(moment().format("M"), moment().format("YYYY"));
};

// Get total Event
var doGetEvents = function() {
	var data = DB.PLN.getData();
	if(data != null) {
		data = JSON.parse(data);
	}
	if (data && data.length > 0) {
		var events = [];
		for (var i = 0,
		    j = data.length; i < j; i++) {
			var evt = data[i];
			var timestamp = moment(evt.start).format("X");
			var date = moment(evt.start).format("D");
			var month = moment(evt.start).format("M");
			var year = moment(evt.start).format("YYYY");
			evt.timestamp = timestamp;
			evt.date = date;
			evt.month = month + "-" + year;
			events.push(evt);
		};
		doGenerateMonthUI(events);
		doGenerateMonthList(events);
	} else {
		doGenerateMonthUI(null);
		doGenerateMonthList(null);
	}
};

doGetEvents();

/**
 * Refresh function for Agenda
 */
Alloy.Globals.refreshAgenda = function() {
	doGetEvents();
};

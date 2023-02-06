// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");
var LIST_DATA = [];
var FROM = args.from || "";

/**
 * IOS Navigation Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};

/**
 * Function to item click on Delivery
 */
var doItemClickDeliveryItem = function(arg) {
	var itemIndex = arg.itemIndex;
	var item = arg.section.getItemAt(itemIndex);
	if (( typeof item != "undefined") && ( typeof item != "null")) {
		var id = item.properties.custId;
		var custData = item.properties.custData;
		if (arg.bindId == "delete") {
			var d = Ti.UI.createAlertDialog({
				cancel : 1,
				buttonNames : ['ja', 'annuleren'],
				message : 'Weet je zeker dat je deze werkbon wilt verwijderen?',
				title : 'Verwijderen'
			});
			d.addEventListener('click', function(e) {
				if (e.index === e.source.cancel) {
					return;
				}
				DB.DAT.removeItem(id);
				doRefreshList();
			});
			d.show();
		}
		if (arg.bindId == "edit") {
			if(custData.work_order && custData.work_order.clientLocation) {
				Alloy.Globals.SELECTED_CLIENT_LOCATION = custData.work_order.clientLocation;
			}
			var w_delivery = Alloy.createController("w_delivery", {
				mode : 'edit',
				client : custData.data.work_order.selClient,
				data : custData,
				location: custData.data.work_order.clientLocation,
				job_type: args.job_type || ""
			}).getView();
			if (OS_IOS && Alloy.Globals.navWindow) {
				Alloy.Globals.navWindow.openWindow(w_delivery);
			} else {
				w_delivery.open();
			}
		}
		
		if(arg.bindId == "name") {
			/* if(custData.data && custData.data.activity) {
				var dataObj = custData;
				dataObj.data.activity = [];
				// Open Client Window
				var w_clients = Alloy.createController("w_clients", {
					from: 'delivery_list_edit',
					data: dataObj
				}).getView();
				if (OS_IOS && Alloy.Globals.navWindow) {
					Alloy.Globals.navWindow.openWindow(w_clients);
				} else {
					w_clients.open();
				}
			} */
		}
	}
};

/**
 * Function to refresh the list of all delivery
 */
var doRefreshList = function() {
	var data = DB.DAT.getData();
	LIST_DATA = [];
	if (data && data.length > 0) {
		for (var i = 0,
		    j = data.length; i < j; i++) {
			var dataObj = data[i];
			if (dataObj && dataObj.data && dataObj.data != null && dataObj.data.work_order) {
				LIST_DATA.push({
					template : "template_item",
					properties : {
						custData : dataObj,
						custId : dataObj.id
					},
					name : {
						text : dataObj.data.work_order.client || ""
					},
					model : {
						text : dataObj.data.work_order.date || ""
					},
					edit : {
						custId : dataObj.id
					},
					delete : {
						custId : dataObj.id
					}
				});
			}
		};
	}

	$.list_section_items.setItems(LIST_DATA);
};
doRefreshList();
/**
 * Refresh data for list
 */
Alloy.Globals.doRefreshDelivery = function() {
	doRefreshList();
};
Ti.App.addEventListener('resumed', function() {
	doRefreshList();
});

/**
 * Fab Action Add new client Click Listener
 */
var doClickAddClient = function() {	
	Ti.API.info('w_delievery_list doClickAddClient Job Type ---> ' + args.job_type);
	var w_clients = Alloy.createController("w_clients", {
		from : "delivery_list",
		job_type: args.job_type || ""
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_clients);
	} else {
		w_clients.open();
	}
};

var doClickAddDelivery = function() {
	var w_delivery = Alloy.createController("w_delivery").getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_delivery);
	} else {
		w_delivery.open();
	}
};

if (FROM == "information") {
	setTimeout(function() {
		doClickAddClient();
	}, 800);
}
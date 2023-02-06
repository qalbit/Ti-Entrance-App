// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require('db');
var XHR = require('xhr');
// Default Variables
var LIST_DATA_ACTIVITY = [];
Ti.API.info('[activity/w_activity] job_type ---> ' + args.job_type);
/**
 * Function to Refresh data inserted
 */
var doRefreshDataDeviceActivity = function (data) {
	Ti.API.info('Device Updated -----> ' + JSON.stringify(data));
	var deviceId = data.device.ID || "";
	if (deviceId != "") {
		var selDevices = Alloy.Globals.doGetSelectedDevices;
		selDevices.forEach(function (item, index) {
			if (item.ID == deviceId) {
				Alloy.Globals.doUpdateSelectedDevices(index, data);
			}
		});
	}
};

/**
 * Server Callback for History 
 */
var onSuccessHistoryData = function(result) {
	try {
		var responseObj = JSON.parse(result);
		if(responseObj && responseObj.status == "ok") {
			var responseData = responseObj.data || [];
			console.log(responseData);
			if(responseData && responseData.length > 0) {
				var d_history = Alloy.createController("d_history", {
					data: responseData
				}).getView();
				d_history.open();
			} else {
				alert('Geen historie gevonden');
			}
		} else {
			alert('Geen historie gevonden');
		}
	} catch(ex) {
		console.log(ex);
	}
};
var onErrorHistoryData = function(error) {
	console.error(error);
};

/**
 * Template Item click listener
 */
var doClickTemplateItem = function (arg) {
	var itemIndex = arg.itemIndex;
	var item = arg.section.getItemAt(itemIndex);
	if (item) {
		var custData = item.properties.custData;
		if (arg.bindId == "editAction") {
			var w_add_device = Alloy.createController('/activity/w_add_device', {
				mode: 'edit',
				data: custData,
				job_type: args.job_type || "",
				doRefreshData: function (data) { //doRefreshDataDeviceActivity
					var devices = Alloy.Globals.doGetSelectedDevices;
					devices.forEach(function (item, index) {
						if (custData.device.id == item.device.id && custData.device.Serienummer == item.device.Serienummer) {
							Alloy.Globals.doUpdateSelectedDevices(index, data);
							doLoadDataActivityDevices(Alloy.Globals.doGetSelectedDevices);
						}
					});
				}
			}).getView();
			if (OS_IOS && Alloy.Globals.navWindow) {
				Alloy.Globals.navWindow.openWindow(w_add_device);
			} else {
				w_add_device.open();
			}
		}
		if (arg.bindId == "deleteAction") {
			var devices = Alloy.Globals.doGetSelectedDevices;
			var selectedIndex = -1;
			devices.forEach(function (item, index) {
				if (custData.device.ID == item.device.ID && custData.device.product == item.device.product) {
					selectedIndex = index;
				}
			});
			if (selectedIndex != -1) {
				var d = Ti.UI.createAlertDialog({
					cancel: 1,
					buttonNames: ['ja', 'Nee'],
					message: 'Weet u zeker dat u deze werkzaamheden wilt verwijderen?',
					title: 'Verwijderen'
				});
				d.addEventListener('click', function (e) {
					if (e.index === e.source.cancel) {
						doLoadDataActivityDevices(Alloy.Globals.doGetSelectedDevices);
						return;
					}
					Alloy.Globals.doDeleteSelectedDevices(selectedIndex, 1);
					doLoadDataActivityDevices(Alloy.Globals.doGetSelectedDevices);
				});
				d.show();
			}
		}
		if (arg.bindId == "historyAction") {
			// Get History List from the API
			if (Ti.Network.online) {
				var failur_id = custData.device.clients_articles_ext_id || "";
				var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.FailureHistory + failur_id + '/' + Alloy.CFG.Debug;
				console.log(url);
				var data = {
					appid: Ti.App.Properties.getString("app_id", "") || "",
					token: Ti.App.Properties.getString("token", "") || 	""
				};
				new XHR().post(url, data, onSuccessHistoryData, onErrorHistoryData, {
					contentType: "application/x-www-form-urlencoded",
					timeout: "2000"
				});
			}
		}
	}
};

/**
 * Function to get List of ALl Data in ListView
 */
function doLoadDataActivityDevices(data) {
	var list_data = [];
	if (data && data.length > 0) {
		for (var i = 0,
				j = data.length; i < j; i++) {
			var dataObj = data[i];
			var deviceObj = dataObj.device;
			var infoObj = dataObj.info;

			var agreement_data = ['---GEEN---', 'Afgerond', 'Opnieuw inplannen'];
			var agreement = infoObj.agreement || 0;
			agreement = parseInt(agreement, 10);

			var agreement_status = "";
			var agreement_status_txt = "";

			if (agreement == "0") {
				agreement_status = "0";
				agreement_status_txt = "---GEEN---";
			} else if (agreement == "3") {
				agreement_status = "3";
				agreement_status_txt = "Afgerond";
			} else if (agreement == "5") {
				agreement_status = "5";
				agreement_status_txt = "Opniew inplannen";
			} else {
				agreement_status = "0";
				agreement_status_txt = "---GEEN---";
			}
			Ti.API.info('Device Obj --> ' + JSON.stringify(deviceObj));
			Ti.API.info('Info Obj --> ' + JSON.stringify(infoObj));

			list_data.push({
				template: "template_item_activity",
				properties: {
					custData: dataObj,
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE
				},
				product: {
					text: deviceObj.product
				},
				id: {
					text: "ID: " + deviceObj.ID
				},
				// serial: {
				// 	text: "Serienummer: " + deviceObj.Serienummer
				// },
				store: {
					text: "Omschrijving storing: " + infoObj.malfunction
				},
				location: {
					text: (deviceObj.location) ? ("Location: " + (deviceObj.location || "")) : ""
				},
				status: {
					text: agreement_status_txt || ""
				},
				editAction: {
					custData: dataObj
				},
				deleteAction: {
					custData: dataObj
				}
			});
		};
	}
	$.list_section_activities_main.setItems(list_data);
};

/**
 * Global function to Save Data
 */
Alloy.Globals.doSaveActivity = function (_callback) {
	Ti.API.info('Selected activity on----> ' + JSON.stringify(Alloy.Globals.doGetSelectedDevices));
	var d = {
		type: "activity",
		data: Alloy.Globals.doGetSelectedDevices
	};
	_callback(d);
};

/**
 * Function to Load Refresh Product List
 */
Alloy.Globals.doGetListDevices = function (data) {
	Ti.API.info('[activity/w_activity] Selected Devices ----> ' + JSON.stringify(data));
	doLoadDataActivityDevices(Alloy.Globals.doGetSelectedDevices);
};
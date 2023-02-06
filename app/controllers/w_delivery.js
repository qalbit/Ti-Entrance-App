// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DB = require("db");

var CLIENT = args.client || {};
var LOCATION = args.location || null;
Alloy.Globals.SELECTED_CLIENT = CLIENT;
Alloy.Globals.SELECTED_CLIENT_LOCATION = LOCATION;
Alloy.Globals.SELECTED_DEVICE = null;
var CLIENT_PREV_DATE_CONT = args.dateObj || null;

var MODE = args.mode || "add";

var DATA_HOLDER 	= {};
var CLIENT_ID 		= "";
var WORK_ORDER_ID 	= args.client.work_order_id || "";
var PLAN_ID 		= args.client.plan_id || "";
var isFromSuccess 	= false;
var activity 		= null,
    actionBar 		= null;

var selectedDevices = [];

if (MODE == "edit") {
	Alloy.Globals.SELECTED_ITEM = args.data;
	if (args.data.data) {
		DATA_HOLDER = args.data.data || {};
	}
	if (args.data.data && args.data.data.activity) {
		selectedDevices = args.data.data.activity || [];
		Alloy.Globals.doGetSelectedDevices = selectedDevices;
	}
	CLIENT_ID = Alloy.Globals.SELECTED_ITEM.id || "";
} else {
	DATA_HOLDER = {};
}

if (args.failure && args.failure.length > 0) {
	// Fill below entries if we received any failure
	args.failure.forEach(function(item) {
		var data = {
			device : {
				product : item.name || "",
				ID : item.id_number || "",
				Serienummer : item.serial_number || "",
				model : "",
				clients_articles_ext_id: item.id || "",
				location: item.location || "",
				material: []
			},
			info : {
				activity : "",
				malfunction : item.description,
				workPerformance : "",
				workRemark : "",
				workRemarkInt : "",
				cliningAgent : "",
				typeAgent : "",
				deviceContaminated : "",
				deviceMolest : "",
				agreement : ""
			},
			images : null
		};

		selectedDevices.push(data);
	});

	Alloy.Globals.doGetSelectedDevices = selectedDevices;
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
 * MENU Holder
 */
Ti.API.info('w_delivery Job Type is ---------> ' + args.job_type);
if(args.job_type == "work_form") {
	var SCR_MENU = [{
		title : "Werkbon",
		id : "work_order",
		job_type: args.job_type || "",
		path : "/activity/w_work_order"
	}, {
		title : "Werkzaamheden",
		id : "activity",
		job_type: args.job_type || "",
		path : "/activity/w_activity"
	}, {
		title : "Oplevering",
		id : "delivery",
		job_type: args.job_type || "",
		path : "/activity/w_delivery"
	}];
} else {
	var SCR_MENU = [{
		title : "Werkbon",
		id : "work_order",
		job_type: args.job_type || "",
		path : "/activity/w_work_order"
	}, {
		title : "Werkzaamheden",
		id : "activity",
		job_type: args.job_type || "",
		path : "/activity/w_activity"
	}, {
		title : "Materialen",
		id : "material",
		job_type: args.job_type || "",
		path : "/activity/w_material"
	}, {
		title : "Oplevering",
		id : "delivery",
		job_type: args.job_type || "",
		path : "/activity/w_delivery"
	}];
}

/**
 * Create Scrollable View
 */
var doCreateScrollViews = function() {
	var SCROLL_VIEWS = [];
	for (var i = 0,
	    j = SCR_MENU.length; i < j; i++) {
		var path = SCR_MENU[i].path;
		var data = null;
		if(i == 0) {
			data = CLIENT_PREV_DATE_CONT;
			Ti.API.info('[w_delivery] data1 ---> ' + data);
			if(data == null) {
				data = {};
			}
			data['job_type'] = args.job_type || "";
		} else {
			data = {};
			Ti.API.info('[w_delivery] data2 ---> ' + data);
			data['job_type'] = args.job_type || "";
		}
		data['work_order_id'] = args.client.work_order_id || "";
		data['plan_id'] = args.client.plan_id || "";
		Ti.API.info('[w_setting_dateworkform] Scrollviews ---> ' + JSON.stringify(data));
		var item = Alloy.createController(path, data).getView();
		$.scb_holder.addView(item);
	};
	Ti.API.info('Argument Job Type is ---> ' + args.job_type);
	if( args.job_type == "work_form" ) {
		setTimeout(function() {
			doScrollPageNext()
		}, 300)
	}
};
doCreateScrollViews();

/**
 * ScrollableView Prev/Next Click Listener
 */
function doScrollPagePrevious() {
	var currentPage = $.scb_holder.currentPage;
	if (currentPage > 0) {
		var nextPage = currentPage - 1;
		$.scb_holder.scrollToView(nextPage);
	}
};
function doScrollPageNext() {
	var currentPage = $.scb_holder.currentPage;
	var totalPage = $.scb_holder.views.length;
	if (currentPage < totalPage) {
		var nextPage = currentPage + 1;
		$.scb_holder.scrollToView(nextPage);
		// Save all for Temp to show on Third page
		if(args.job_type == "work_form") {
			if (nextPage > 1) {
				var data = Alloy.Globals.doGetData();
				Alloy.Globals.doShowOverall(data);
			}
		} else {
			if (nextPage > 2) {
				var data = Alloy.Globals.doGetData();
				Alloy.Globals.doShowOverall(data);
			}
		}
		if (nextPage == 1) {
			if (Alloy.Globals.doGetListDevices) {
				Alloy.Globals.doGetListDevices(selectedDevices);
			}
		}
	}
};
var doScrollableEndView = function() {
	doSetPageTitle();
};

/**
 * Function to Save Data / Update Data Object
 */
Alloy.Globals.doGetDataObj = function(type) {
	if (type) {
		if (DATA_HOLDER) {
			return DATA_HOLDER[type];
		} else {
			return null;
		}
	}
};

/**
 * Function to Set Page Title
 */
var doSetPageTitle = function() {
	var currentPage = $.scb_holder.currentPage;
	var pageData = SCR_MENU[currentPage];
	$.lbl_title.text = (pageData.title || "");

	if (currentPage == 0) {
		$.lbl_page_prev.text = "";
	} else {
		var prevPage = currentPage - 1;
		var prevData = SCR_MENU[prevPage];
		$.lbl_page_prev.text = (prevData.title || "");
	}
	var totalPage = $.scb_holder.views.length;
	if (currentPage == totalPage - 1) {
		$.lbl_page_next.text = "";
	} else {
		var nextPage = currentPage + 1;
		var nextData = SCR_MENU[nextPage];
		$.lbl_page_next.text = (nextData.title || "");
	}
	if(args.job_type == "work_form") {
		if (currentPage == 1) {
			if (OS_IOS) {
				$.fab_action_add.visible = true;
			}
		} else {
			if (OS_IOS) {
				$.fab_action_add.visible = false;
			}
		}
	} else {
		if (currentPage == 1 || currentPage == 2) {
			if (OS_IOS) {
				$.fab_action_add.visible = true;
			}
		} else {
			if (OS_IOS) {
				$.fab_action_add.visible = false;
			}
		}
	}
	if(args.job_type == "work_form") {
		if (currentPage == 2) {
			$.v_strip_action.visible = false;
			$.scb_holder.bottom = 0;
		} else {
			$.v_strip_action.visible = true;
			$.scb_holder.bottom = 80;
		}
	} else {
		if (currentPage == 3) {
			$.v_strip_action.visible = false;
			$.scb_holder.bottom = 0;
		} else {
			$.v_strip_action.visible = true;
			$.scb_holder.bottom = 80;
		}
	}

	if (currentPage == 1) {
		if (OS_IOS) {
			$.fab_action_add.image = "images/ic_add.png";
		} else {
			// Add Menu here
			if (OS_ANDROID) {
				if (!activity) {
					return;
				}
				activity.onCreateOptionsMenu = function(e) {
					var menuItem = e.menu.add({
						showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
						icon : "images/ic_add.png"
					});
					menuItem.addEventListener('click', function() {
						var w_device_list = Alloy.createController('/activity/w_device_list', {
							refreshPage : doRefreshDeviceList,
							job_type: args.job_type || "",
						}).getView();
						w_device_list.open();
					});
				};
				activity.invalidateOptionsMenu();
			}
		}
	}
	if(args.job_type != "work_form") {
		if (currentPage == 2) {
			if (OS_IOS) {
				$.fab_action_add.image = "images/ic_add_material.png";
			} else {
				if (OS_ANDROID) {
					if (!activity) {
						return;
					}
					activity.onCreateOptionsMenu = function(e) {
						var menuItem1 = e.menu.add({
							showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
							icon : "images/ic_add_material.png"
						});
						menuItem1.addEventListener('click', function() {
							var w_add_material = Alloy.createController('/activity/w_add_material', {
								job_type: args.job_type || "",
							}).getView();
							w_add_material.open();
						});
					};
					activity.invalidateOptionsMenu();
				}
			}
		}
	}
	if(args.job_type == "work_form") {
		if (currentPage > 2) {
			// Disable Menu here
			if (OS_ANDROID) {
				if (!activity) {
					return;
				}
				activity.onCreateOptionsMenu = function(e) {
				};
				activity.invalidateOptionsMenu();
			}
		}
	} else {
		if (currentPage > 2) {
			// Disable Menu here
			if (OS_ANDROID) {
				if (!activity) {
					return;
				}
				activity.onCreateOptionsMenu = function(e) {
				};
				activity.invalidateOptionsMenu();
			}
		}
	}
};
doSetPageTitle();

/**
 * Refresh for Device List
 */
var doAddSelectedDevice = function(obj) {
	selectedDevices.push(obj);
	Alloy.Globals.doGetSelectedDevices = selectedDevices;
	Alloy.Globals.doGetListDevices(selectedDevices);
};
Alloy.Globals.doUpdateSelectedDevices = function(index, data) {
	selectedDevices[index] = data;
	Alloy.Globals.doGetSelectedDevices = selectedDevices;
};
Alloy.Globals.doDeleteSelectedDevices = function(index) {
	selectedDevices.splice(index, 1);
	Alloy.Globals.doGetSelectedDevices = selectedDevices;
};
Alloy.Globals.doClearSelectedDevices = function() {
	selectedDevices = [];
	Alloy.Globals.doGetSelectedDevices = selectedDevices;
};

/**
 * Function to Refresh the List
 */
var doRefreshDeviceList = function(mode) {
	var w_add_device = Alloy.createController('/activity/w_add_device', {
		doRefreshData : doAddSelectedDevice,
		mode : mode,
		job_type: args.job_type || "",
	}).getView();
	if (OS_IOS && Alloy.Globals.navWindow) {
		Alloy.Globals.navWindow.openWindow(w_add_device);
	} else {
		w_add_device.open();
	}
};

// Function to add device
var doAddDevice = function() {
	var currentPage = $.scb_holder.currentPage;
	if (currentPage == "2") {
		var w_add_material = Alloy.createController('/activity/w_add_material', {
			job_type: args.job_type || ""
		}).getView();
		if (OS_IOS && Alloy.Globals.navWindow) {
			Alloy.Globals.navWindow.openWindow(w_add_material);
		} else {
			w_add_material.open();
		}
	}
	if (currentPage == "1") {
		var w_device_list = Alloy.createController('/activity/w_device_list', {
			refreshPage : doRefreshDeviceList,
			job_type: args.job_type || "",
		}).getView();
		if (OS_IOS && Alloy.Globals.navWindow) {
			Alloy.Globals.navWindow.openWindow(w_device_list);
		} else {
			w_device_list.open();
		}
	}
};

/**
 * Window's Event Listener
 */
var doOpenWindow = function() {
	if (OS_ANDROID) {
		activity = $.w_delivery.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_delivery.close();
			};
		}
	}
};

/**
 * Global function for Save Data
 */
Alloy.Globals.doGetData = function() {
	var D_OBJ = {};
	console.log('doGetData 350');
	Alloy.Globals.doSaveWorkOrder(function(d) {
		D_OBJ["work_order"] = d.data;
	});
	Alloy.Globals.doSaveActivity(function(d) {
		D_OBJ["activity"] = d.data;
	});
	if(Alloy.Globals.doSaveMaterial) {
		Alloy.Globals.doSaveMaterial(function(d) {
			D_OBJ["material"] = d.data;
		});
	}
	Alloy.Globals.doSaveDelivery(function(d) {
		D_OBJ["delivery"] = d.data;
	});

	return D_OBJ;
};
Alloy.Globals.doSaveData = function() {
	var D_OBJ = {};
	Alloy.Globals.doSaveWorkOrder(function(d) {
		D_OBJ["work_order"] = d.data || null;
	});
	Alloy.Globals.doSaveActivity(function(d) {
		D_OBJ["activity"] = d.data;
	});
	if(Alloy.Globals.doSaveMaterial) {
		Alloy.Globals.doSaveMaterial(function(d) {
			D_OBJ["material"] = d.data;
		});
	}
	Alloy.Globals.doSaveDelivery(function(d) {
		Ti.API.info('Saving Data Object ====> ' + JSON.stringify(d));
		D_OBJ["delivery"] = d.data;
	});
	return D_OBJ;
};
Alloy.Globals.doCloseDelivery = function() {
	$.w_delivery.close();
};
function extend(obj, src) {
	for (var key in src) {
		if (src.hasOwnProperty(key))
			obj[key] = src[key];
	}
	return obj;
}

var onSuccess = function(response) {
	Ti.API.info('Server received delivery success response ----> ' + JSON.stringify(response));
	try {
		var responseObj = JSON.parse(response);
		if (responseObj) {
			Ti.API.error('Delivery Response Object -----> ' + JSON.stringify(responseObj));
			doHideLoader();
			if (responseObj.status == "ok") {
				Alloy.Globals.SELECTED_CLIENT = null;
				Alloy.Globals.SELECTED_CLIENT_LOCATION = null;
				Alloy.Globals.SELECTED_DEVICE = null;
				Alloy.Globals.doGetSelectedDevices = null;
				DATA_HOLDER = null;
				isFromSuccess = true;
				$.w_delivery.close();
			} else {
				alert(responseObj.feedback);
			}
		}
	} catch (ex) {
		Alloy.Globals.doCloseDelivery();
		doHideLoader();
	}
};
var onError = function(error) {
	Alloy.Globals.doCloseDelivery();
	doHideLoader();
};

Alloy.Globals.doSubmitDelivery = function() {
	Ti.API.info('Submitting Delivery page');
	try {
		doShowLoader();
		var D_OBJ = {};
		Alloy.Globals.doSaveWorkOrder(function(d) {
			D_OBJ["work_order"] = d.data;
		});
		Alloy.Globals.doSaveActivity(function(d) {
			D_OBJ["activity"] = d.data;
		});
		if(Alloy.Globals.doSaveMaterial) {
			Alloy.Globals.doSaveMaterial(function(d) {
				D_OBJ["material"] = d.data;
			});
		}
		Alloy.Globals.doSaveDelivery(function(d) {
			D_OBJ["delivery"] = d.data;
		});
		DATA_HOLDER = D_OBJ;
		// Modified Data
		var dataSend = {};
		var images = {};
		if (DATA_HOLDER) {
			dataSend['work_order'] = {
				clientId : DATA_HOLDER["work_order"].selClient.id || "",
				clientLocation : DATA_HOLDER["work_order"].clientLocation || "",
				engineer : DATA_HOLDER["work_order"].engineer.id || "",
				date : DATA_HOLDER["work_order"].date || "",
				arrivalTime : DATA_HOLDER["work_order"].arrivalTime || "",
				departTime : DATA_HOLDER["work_order"].departTime || "",
				parking : DATA_HOLDER["work_order"].parking || "",
			};
			var activities = [];
			if( DATA_HOLDER['activity'] && DATA_HOLDER['activity'].length > 0 ) {
				DATA_HOLDER['activity'].forEach(function(item, mainindex) {
					Ti.API.info("item['device'] ----> " + JSON.stringify(item['device']));
					var productList = [];
					if(item['device'].materials) {
						item['device'].materials.forEach(function(item) {
							productList.push({
								id: item.id || "",
								qty: item.qty,
								artikelnummer: item.artikelnummer || "",
								bestelnummer: item.bestelnummer || "",
							})
						});
					}
					activities.push({
						ID : item['device'].ID || "",
						product : item['device'].product || "",
						model : item['device'].model || "",
						Serienummer : item['device'].Serienummer || "",
						tellerstand: item['device'].tellerstand || "",
						clients_articles_ext_id: item['device'].clients_articles_ext_id || "",
						location: item['device'].location || "",
						activity : item['info'].activity || "",
						malfunction : item['info'].malfunction || "",
						workPerformance : item['info'].workPerformance || "",
						workRemark : item['info'].workRemark || "",
						workRemarkInt : item['info'].workRemarkInt || "",
						cliningAgent : item['info'].cliningAgent || "",
						typeAgent : item['info'].typeAgent || "",
						deviceContaminated : item['info'].deviceContaminated || "",
						deviceMolest : item['info'].deviceMolest || "",
						agreement : item['info'].agreement || "",
						materials: productList
					});

					if (item.images && item.images.length > 0) {
						item.images.forEach(function(ig, index) {
							var fileObj = Ti.Filesystem.getFile(ig.filePath);
							images['ig_activity_' + (mainindex) + '_' + (index + 1)] = fileObj;
						});
					}
				});
			}
			
			var materials = [];
			if( DATA_HOLDER['material'] && DATA_HOLDER['material'].length > 0 ) {
				DATA_HOLDER['material'].forEach(function(item, mainindex) {
					materials.push({
						productId: item.product.id,
						qty: item.qty
					});
				});
			}
			
			
			dataSend['activity'] = activities || [];
			Ti.API.info('dataSend["activity"] --> ' + JSON.stringify(dataSend['activity']));
			dataSend['material'] = materials || [];
			dataSend['delivery'] = {
				name : DATA_HOLDER['delivery'].name || "",
				email : DATA_HOLDER['delivery'].email || ""
			};
			dataSend['work_order_id'] 	= DATA_HOLDER['delivery'].work_order_id || "";
			dataSend['plan_id']			= DATA_HOLDER['delivery'].plan_id || "";
			if ((DATA_HOLDER['delivery'].signature || "") != "") {
				var fileObjSignature = Ti.Filesystem.getFile(DATA_HOLDER['delivery'].signature);
				images['ig_signature'] = fileObjSignature || null;
			}
		}
		var url = Alloy.CFG.Url.Base + Alloy.CFG.Url.EndPoint.Data + Alloy.CFG.Debug;

		var dataSendObj = {
			token : Ti.App.Properties.getString("token", ""),
			appid : Ti.App.Properties.getString("app_id") || "",
			data : JSON.stringify(dataSend)
		};
		
		Ti.API.info('Data Sending for Submitting ----> ');
		Ti.API.info(JSON.stringify(dataSendObj));

		if (_.isEmpty(images)) {
		} else {
			dataSendObj = extend(dataSendObj, images);
		}
		if (Ti.Network.online) {
			new XHR().post(url, dataSendObj, onSuccess, onError, {
				enctype : "multipart/form-data"
			});
		} else {
			Alloy.Globals.doCloseDelivery();
			doHideLoader();
		}
	} catch(ex) {
		Ti.API.info('w_delivery[Exception] ---> ' + JSON.stringify(ex));
		Alloy.Globals.doCloseDelivery();
		doHideLoader();
	}
	// Submit data

	// If success remove object and close window
	// else save object as concept and close window
};

var doCloseWindow = function() {
	Ti.API.error('Is From Success ---> ' + isFromSuccess);
	Ti.API.error('Client ID ---------> ' + CLIENT_ID);
	if (!isFromSuccess) {
		var data = Alloy.Globals.doSaveData();
		if (data) {
			if (CLIENT_ID && CLIENT_ID != "") {
				DB.DAT.updateItem(CLIENT_ID, data);
			} else {
				DB.DAT.setData(data);
			}
		}
		Ti.API.warn('Data Object --------> ' + JSON.stringify(data));
		Ti.API.warn('DATA_HOLDER --------> ' + JSON.stringify(DATA_HOLDER));
	} else {
		if (CLIENT_ID && CLIENT_ID != "") {
			DB.DAT.removeItem(CLIENT_ID);
		}
	}
	if (Alloy.Globals.doRefreshDelivery) {
		Alloy.Globals.doRefreshDelivery();
	}
	Alloy.Globals.SELECTED_CLIENT = null;
	Alloy.Globals.SELECTED_CLIENT_LOCATION = null;
	Alloy.Globals.SELECTED_DEVICE = null;
	Alloy.Globals.SELECTED_ITEM = null;
	
	if( args.doCloseWindowManually ) {
		args.doCloseWindowManually();
	}
	
	$.destroy();
};

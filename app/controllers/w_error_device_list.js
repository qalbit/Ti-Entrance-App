// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var LIST_DATA = [];
var DATA = args.devices || [];

/**
 * Widget Functions for Photo Selection
 * Refresh
 */
var doRefreshImages = function(arg) {
	Ti.API.info('Refresh arguments ---> ' + JSON.stringify(arg));
};
$.photoSelection.init();

/**
 * Server Callback function
 */
var onSuccess = function(response) {
	Ti.API.info('Response ====>  ' + response);
	try {
		var responseObj = JSON.parse(response);
		if (responseObj && responseObj.status == "ok") {
			var data = responseObj.data || null;
			if (data && data != null && data.status != null) {
				Ti.API.info('Data found here  ' + JSON.stringify(data));
				if (data.status == "ok") {
					// Do Open Solution Window
					var w_solution = Alloy.createController("w_solution", {
						data : data
					}).getView();
					if (OS_IOS && Alloy.Globals.navWindow) {
						Alloy.Globals.navWindow.openWindow(w_solution);
					} else {
						w_solution.open();
					}
				} else {

				}
			} else {
				Ti.API.info('No data found here');
				// Do Open Summary window
				var w_summary = Alloy.createController("w_summary").getView();
				if (OS_IOS && Alloy.Globals.navWindow) {
					Alloy.Globals.navWindow.openWindow(w_summary);
				} else {
					w_summary.open();
				}
			}
		}
	} catch (ex) {
		Ti.API.debug('Exception -> ' + ex);
	}
};
var onError = function(error) {
	Ti.API.info('Errorr ----> ' + error);
};

/**
 * Function to Share Error code on server
 */
var doSendErrorCode = function() {
	var scrollChild = $.scr_items.getChildren();
	var basePoint = Alloy.CFG.Url.EndPoint.ErrorCode;
	var url = Alloy.CFG.Url.Base + basePoint;
	if (scrollChild && scrollChild.length > 0) {
		var firstChild = scrollChild[0];
		var custData = firstChild.custData || null;
		var wrapperView = firstChild.children[0];
		var wrapperChild = wrapperView.children;

		var errorCodeCont = wrapperChild[wrapperChild.length - 2];
		var errorDescCont = wrapperChild[wrapperChild.length - 1];

		var errorCode = errorCodeCont.children[1];
		var errorDesc = errorDescCont.children[1];
		var code = errorCode.value || "";
		var desc = errorDesc.value || "";

		var id = encodeURI(custData.id);
		basePoint = basePoint.replace("ERROR_CODE", code);
		basePoint = basePoint.replace("DEVICE_ID", id);
		url = Alloy.CFG.Url.Base + basePoint;
		url+= Alloy.CFG.Debug;
		if (Ti.Network.online) {
			Ti.API.info('ERROR Device List ---> ' + url);
			new XHR().get(url, onSuccess, onError, {
				contentType : "application/x-www-form-urlencoded",
				timeout : 2000
			});
		} else {
			alert("Internet connection required!");
		}
	}
};

/**
 * Function to set Devices list
 */
var doSetDevicesList = function() {
	LIST_DATA = [];
	if (DATA && DATA.length > 0) {
		DATA.forEach(function(item) {
			// Create List Item
			Ti.API.info('ITEM -----?> ' + JSON.stringify(item));
			var v_item = Ti.UI.createView({
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				custData : item
			});

			var v_wrapper = Ti.UI.createView({
				top : Alloy.CFG.Space.Normal,
				bottom : Alloy.CFG.Space.Normal,
				left : Alloy.CFG.Space.Normal,
				right : Alloy.CFG.Space.Normal,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				layout : 'vertical'
			});

			var l_title = Ti.UI.createLabel({
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
				color : Alloy.CFG.Colors.lblDarkColor,
				font : {
					fontSize : Alloy.CFG.FontSize.Normal,
					fontWeight : 'bold'
				},
				text : item.product
			});
			v_wrapper.add(l_title);

			if (item.model && item.model != "") {
				var l_model = Ti.UI.createLabel({
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'normal'
					},
					text : "Model: " + item.model
				});
				v_wrapper.add(l_model);
			}

			if (item.type && item.type != "") {
				var l_type = Ti.UI.createLabel({
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'normal'
					},
					text : "Type: " + item.type
				});
				v_wrapper.add(l_type);
			}

			if (item.id && item.id != "") {
				var l_id = Ti.UI.createLabel({
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'normal'
					},
					text : "ID: " + item.id
				});
				v_wrapper.add(l_id);
			}

			if (item.Serienummer && item.Serienummer != "") {
				var l_serial = Ti.UI.createLabel({
					width : Ti.UI.FILL,
					height : Ti.UI.SIZE,
					textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
					color : Alloy.CFG.Colors.lblDefaultColor,
					font : {
						fontSize : Alloy.CFG.FontSize.Small,
						fontWeight : 'normal'
					},
					text : "Serienummer: " + item.Serienummer
				});
				v_wrapper.add(l_serial);
			}

			// Add Error Code
			var v_error_code = Ti.UI.createView({
				top : Alloy.CFG.Space.Small,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				layout : 'vertical',
				custId : 'errorCode'
			});
			var l_error_code_key = Ti.UI.createLabel({
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
				color : Alloy.CFG.Colors.colorPrimaryDark,
				font : {
					fontSize : Alloy.CFG.FontSize.Tiny,
					fontWeight : 'bold'
				},
				text : "Foutcode"
			});
			var e_code = Ti.UI.createTextArea({
				top : Alloy.CFG.Space.TwoDot,
				left : 0,
				right : 0,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				backgroundColor : 'transparent',
				color : Alloy.CFG.Colors.lblDarkColor,
				borderColor : Alloy.CFG.Colors.lblDefaultColor,
				font : {
					fontSize : Alloy.CFG.FontSize.Small,
					fontWeight : 'normal'
				},
				padding : {
					left : Alloy.CFG.Space.Normal,
					right : Alloy.CFG.Space.Normal,
					top : Alloy.CFG.Space.Normal,
					bottom : Alloy.CFG.Space.Normal
				},
				hintText : "Foutcode"
			});
			v_error_code.add(l_error_code_key);
			v_error_code.add(e_code);
			v_wrapper.add(v_error_code);

			// Add Error Description
			var v_error_desc = Ti.UI.createView({
				top : Alloy.CFG.Space.Small,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				layout : 'vertical',
				custId : 'errorDesc'
			});
			var l_error_desc_key = Ti.UI.createLabel({
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
				color : Alloy.CFG.Colors.colorPrimaryDark,
				font : {
					fontSize : Alloy.CFG.FontSize.Tiny,
					fontWeight : 'bold'
				},
				text : "Omschrijving"
			});
			var e_desc = Ti.UI.createTextArea({
				top : Alloy.CFG.Space.TwoDot,
				width : Ti.UI.FILL,
				height : 120,
				backgroundColor : 'transparent',
				color : Alloy.CFG.Colors.lblDarkColor,
				borderColor : Alloy.CFG.Colors.lblDefaultColor,
				font : {
					fontSize : Alloy.CFG.FontSize.Small,
					fontWeight : 'normal'
				},
				padding : {
					left : Alloy.CFG.Space.Normal,
					right : Alloy.CFG.Space.Normal,
					top : Alloy.CFG.Space.Normal,
					bottom : Alloy.CFG.Space.Normal
				},
				hintText : "Omschrijving"
			});
			v_error_desc.add(l_error_desc_key);
			v_error_desc.add(e_desc);
			v_wrapper.add(v_error_desc);

			v_item.add(v_wrapper);

			$.scr_items.add(v_item);
			LIST_DATA.push(v_item);
		});
	}
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	doSetDevicesList();
	if (OS_ANDROID) {
		activity = $.w_error_device_list.activity,
		actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_error_device_list.close();
			};
		}
	}
};

var doCloseWindow = function() {
	$.destroy();
};

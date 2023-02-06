const currentStyle =  Ti.UI.userInterfaceStyle;
/**
 * Dark/Light Mode Style iOS Only for now
 */
if( OS_IOS ) {
	Ti.App.iOS.addEventListener('traitcollectionchange', doUserInterfaceStyleChanged);

	function doUserInterfaceStyleChanged(e) {
	
		var isColorChanged = false;

		if(currentStyle == Ti.UI.USER_INTERFACE_STYLE_LIGHT ) {
			isColorChanged = true;
		} else if (currentStyle == Ti.UI.USER_INTERFACE_STYLE_DARK ) {
			isColorChanged = true;
		}
		
		if( isColorChanged ) {
			Alloy.CFG.Colors = {
				"colorPrimary": Ti.UI.fetchSemanticColor("colorPrimary").toHex(),
				"colorPrimaryDark": Ti.UI.fetchSemanticColor("colorPrimaryDark").toHex(),
				"colorAccent": Ti.UI.fetchSemanticColor("colorAccent").toHex(),
				"winBg": Ti.UI.fetchSemanticColor("winBg").toHex(),
				"winBgDark": Ti.UI.fetchSemanticColor("winBgDark").toHex(),
				"bgLightGray": Ti.UI.fetchSemanticColor("bgLightGray").toHex(),
				"bgDarkGray": Ti.UI.fetchSemanticColor("bgDarkGray").toHex(),
				"tintColor": Ti.UI.fetchSemanticColor("tintColor").toHex(),
				"colorPrimaryLight": Ti.UI.fetchSemanticColor("colorPrimaryLight").toHex(),
				"tfLightBgColor": Ti.UI.fetchSemanticColor("tfLightBgColor").toHex(),
				"tfLightBgColorPrimary": Ti.UI.fetchSemanticColor("tfLightBgColorPrimary").toHex(),
				"tfLightColor": Ti.UI.fetchSemanticColor("tfLightColor").toHex(),
				"tfDarkColor": Ti.UI.fetchSemanticColor("tfDarkColor").toHex(),
				"lblDefaultColor": Ti.UI.fetchSemanticColor("lblDefaultColor").toHex(),
				"lblLightColor": Ti.UI.fetchSemanticColor("lblLightColor").toHex(),
				"lblSemiLightColor": Ti.UI.fetchSemanticColor("lblSemiLightColor").toHex(),
				"lblDarkColor": Ti.UI.fetchSemanticColor("lblDarkColor").toHex(),
				"lblSemiDarkColor": Ti.UI.fetchSemanticColor("lblSemiDarkColor").toHex(),
				"semiDarkShadowColor": Ti.UI.fetchSemanticColor("semiDarkShadowColor").toHex(),
				"semiDarkColor": Ti.UI.fetchSemanticColor("semiDarkColor").toHex(),
				"lblWhiteColor": Ti.UI.fetchSemanticColor("lblWhiteColor").toHex(),
				"calDatePrevColor": Ti.UI.fetchSemanticColor("calDatePrevColor").toHex(),
				"calDateCurrentColor": Ti.UI.fetchSemanticColor("calDateCurrentColor").toHex(),
				"priorityColor": Ti.UI.fetchSemanticColor("priorityColor").toHex(),
				"searchBarTintColor": Ti.UI.fetchSemanticColor("searchBarTintColor").toHex()
			};
		}
	}
	doUserInterfaceStyleChanged();
}

/**
 * Get Device Information and Store appropriate Constant in iPhone
 */
var pHeight = Ti.Platform.displayCaps.platformHeight;
var pWidth = Ti.Platform.displayCaps.platformWidth;
Alloy.Globals.I_5 = (pHeight == 568 && OS_IOS) ? true : false;
Alloy.Globals.I_6 = (pHeight == 667 && OS_IOS) ? true : false;
Alloy.Globals.I_P = (pHeight == 736 && OS_IOS) ? true : false;
Alloy.Globals.I_X = (pHeight == 812 && OS_IOS) ? true : false;
Alloy.Globals.T_P = (Alloy.isTablet) ? true : false;

/**
 * Set Device fonts Size as per Device Configuration
 */
if (Alloy.isTablet) {
	Alloy.CFG.FontSize = Alloy.CFG.FontSize_T;
} else if (Alloy.Globals.I_P && OS_IOS) {
	Alloy.CFG.FontSize = Alloy.CFG.FontSize_6p;
} else if (Alloy.Globals.I_6 && OS_IOS) {
	Alloy.CFG.FontSize = Alloy.CFG.FontSize_6;
}

/**
 * Status Bar Style Based on Theme Selection
 */
Alloy.CFG.StatusBarStyle = (OS_IOS) ? Ti.UI.iOS.StatusBar.LIGHT_CONTENT : "";

/**
 * Set Device component default Width & Height
 */
Alloy.CFG.UI = {};
Alloy.CFG.UI = {
	Date: {
		normalWidth: (pWidth / 7) - 0.001,
		normalHeight: (!Alloy.isTablet) ? (pWidth / 7) : (pWidth / 14),
		longWidth: (pWidth / 7),
		longHeight: (pHeight / 6)
	},
	Grid: {
		two: (pWidth / 2) - 17,
		three: (pWidth / 3)
	}
};
// Android Point Calculation Functions
var PixelsToDPUnits = function(ThePixels) {
	return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
};
var DPUnitsToPixels = function(TheDPUnits) {
	return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
};
if(OS_ANDROID) {
	Alloy.CFG.UI.Date.normalWidth = PixelsToDPUnits(Alloy.CFG.UI.Date.normalWidth);
	Alloy.CFG.UI.Date.normalHeight = PixelsToDPUnits(Alloy.CFG.UI.Date.normalHeight);
	Alloy.CFG.UI.Grid.two = PixelsToDPUnits(Alloy.CFG.UI.Grid.two);
	Alloy.CFG.UI.Grid.three = PixelsToDPUnits(Alloy.CFG.UI.Grid.three);

	console.log('Normal Height ----> ' + Alloy.CFG.UI.Date.normalHeight);
	if(Alloy.isTablet) {
		Alloy.CFG.UI.Date.normalHeight = 55;
	}
}

/**
 * Push Notification integration
 * for iOS & Android
 */
var core = require('firebase.core');
var cloud = require('firebase.cloudmessaging')

if(OS_IOS) {
	core.configure({
		googleAppID : '1:307321918115:ios:c9a23a0462956ee8986516',
		file : 'gs.plist'
	});

	// Listen to the notification settings event
	Ti.App.iOS.addEventListener('usernotificationsettings', function userNotifySettings() {
		Ti.App.iOS.removeEventListener('usernotificationsettings', userNotifySettings);
		Ti.Network.registerForPushNotifications({
			success : function(response) {
				Ti.API.info('iOS Device Token ----> ' + response.deviceToken);
				deviceTokenSuccess(response)
			},
			error : function(response) {
			},
			callback : receivePush
		});
	});
	Ti.App.iOS.registerUserNotificationSettings({
		types : [Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE]
	});
	cloud.addEventListener('didRefreshRegistrationToken', deviceTokenSuccess);
	// Called when direct messages arrive. Note that these are different from push notifications
	cloud.addEventListener('didReceiveMessage', receivePush);
} else {
	core.configure({
		googleAppID : '1:307321918115:android:d6280b4b3d29d510986516',
		file: 'gs.json'
	})
	cloud.addEventListener('didRefreshRegistrationToken', deviceTokenSuccess);
	// Called when direct messages arrive. Note that these are different from push notifications
	cloud.addEventListener('didReceiveMessage', receivePush);
	// notifications when app is in the background
	cloud.createNotificationChannel({
		sound : 'warn_sound',
		channelId : 'general',
		channelName : 'General Notifications',
		importance : 'high' //will pop in from the top and make a sound
	});
	cloud.registerForPushNotifications();
}

// subscribe to topic
if (OS_ANDROID) {
	cloud.subscribeToTopic('updates-android');
} else {
	cloud.subscribeToTopic('updates-ios');
}

/**
 * Handling the Push Notification Callback functions
 */
 function receivePush(e) {
	Ti.API.info('TRY Push notification on Received Push ----> ' + JSON.stringify(e));
	try {
		var data = e.data || e.message || null;
		// Creating Notification
		if (OS_ANDROID) {
			var actionData = data.data || null;
			var title = data.title || L("app_name", "HSB");
			var body = data.body || "";
			var notification = Titanium.Android.createNotification({
				// icon is passed as an Android resource ID -- see Ti.App.Android.R.
				icon : Ti.App.Android.R.drawable.ic_notification,
				contentTitle : title,
				contentText : body,
			});
			// Send the notification.
			Titanium.Android.NotificationManager.notify(1, notification);
		}
	} catch(ex) {
		Ti.API.info('Exception on push notification: ' + ex);
	}
};
function deviceTokenSuccess(e) {
	Ti.API.info('Device token success : ' + JSON.stringify(e));
	Ti.App.Properties.setString("push_id", e.fcmToken);
};

/**
 * Get Device Unique AppId | DeviceType | Token in properties
 */
if(!Ti.App.Properties.hasProperty('app_id')) {
	var appId = Ti.Platform.createUUID();
	Ti.App.Properties.setString('app_id', appId);
}
if(!Ti.App.Properties.hasProperty('device_type')) {
	var deviceType = (OS_IOS) ? 'ios' : 'android';
	Ti.App.Properties.setString('device_type', deviceType);
}
if(!Ti.App.Properties.hasProperty('os_version')) {
	var osVersion = Ti.Platform.version;
	Ti.App.Properties.setString('os_version', osVersion);
}
if(!Ti.App.Properties.hasProperty('device_model')) {
	var deviceModel = Ti.Platform.model;
	Ti.App.Properties.setString('device_model', deviceModel);
}
if(!Ti.App.Properties.hasProperty('push_id')) {
	var pushId = "RTESFFSFSFASFSJKFSKFJAHSFKJSHFKJSAFHK";
	Ti.App.Properties.setString('push_id', pushId);
}
if(!Ti.App.Properties.hasProperty('token')) {
	Ti.App.Properties.setString('token', "");
}

/** Incomming arguments **/
var _args = arguments[0] || {};

/** Default Variables **/
var _selected_images = [];
var _PERMISSION_CAMERA = 0;
var _PERMISSION_PHOTO = 0;

var pWidth = Ti.Platform.displayCaps.platformWidth;
var gridSize = (pWidth - 34) / 3;

/**
 * Widget Initialisation
 * @param {Object} _arg for Intial Response
 */
$.init = function(_arg) {
	Ti.API.debug('Widget qalbit.photoselection initialisation');
	// Check Gallery & Camera Permission
	doRequestCameraPermission();
	doRequestGalleryPermission();
	doRequestStoragePermission();
};

/**
 * Permission request methods
 */
function doRequestCameraPermission() {
	if (!Ti.Media.hasCameraPermissions()) {
		Ti.Media.requestCameraPermissions(function(e) {
			if (e.success) {
				_PERMISSION_CAMERA = 1;
			}
		});
	} else {
		_PERMISSION_CAMERA = 1;
	}
};
function doRequestGalleryPermission() {
	if (OS_IOS && !Ti.Media.hasPhotoGalleryPermissions()) {
		Ti.Media.requestPhotoGalleryPermissions(function(e) {
			if (e.success) {
				_PERMISSION_PHOTO = 1;
			}
		});
	} else {
		_PERMISSION_PHOTO = 1;
	}
};
function doRequestStoragePermission() {
	var pRead = "android.permission.READ_EXTERNAL_STORAGE";
	var pWrite = "android.permission.WRITE_EXTERNAL_STORAGE";
	if (OS_ANDROID) {
		if (!Ti.Android.hasPermission(pRead) && !Ti.Android.hasPermission(pWrite)) {
			Ti.Android.requestPermissions([pRead, pWrite], function(e) {
				if(e.success) {
					return true;
				} else {
					return false;
				}
			});
		} else {
			return true;
		}
	}
	return true;
};

/**
 * Widget function to select/capture photo as per requirement1
 */
function doClickSelectImage() {
	var opts = {
		cancel : 2,
		options : ['Camera', 'Gallery', 'Cancel'],
		selectedIndex : 2,
		destructive : 0,
		title : 'Select/Capture Image'
	};
	var d = Ti.UI.createOptionDialog(opts);
	d.addEventListener('click', function(_arg) {
		if (_arg.index == _arg.cancel) {
			return;
		}
		if (_arg.index === 0) {
			// Camera Clicked
			if (_PERMISSION_CAMERA === 1) {
				Ti.Media.showCamera({
					success : function(e) {
						var media = e.media;
						doStoreMediaInScroll(media);
					},
					cancel : function(e) {
						alert("User cancelled the request");
						return;
					},
					error : function(e) {
						alert("Unable to open camera");
						return;
					},
					mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
					saveToPhotoGallery : false
				});
			} else {
				// Check Gallery & Camera Permission
				doRequestCameraPermission();
				doRequestGalleryPermission();
				doRequestStoragePermission();
			}
		}
		if (_arg.index === 1) {
			// Gallery Clicked
			if (_PERMISSION_PHOTO === 1) {
				Ti.Media.openPhotoGallery({
					success : function(e) {
						var media = e.media;
						doStoreMediaInScroll(media);
					},
					cancel : function(e) {
						alert("User cancelled the request");
						return;
					},
					error : function(e) {
						alert("Unable to open photo gallery");
						return;
					},
					mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
					allowEditing : false
				});
			} else {
				// Check Gallery & Camera Permission
				doRequestCameraPermission();
				doRequestGalleryPermission();
				doRequestStoragePermission();
			}
		}
	});

	d.show();
};

/**
 * Function to Store Image Media into ScrollView
 */
function doStoreMediaInScroll(media) {
	doRequestStoragePermission();
	// Create Filename
	var igName = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var k = 0; k < 5; k++)
		igName += possible.charAt(Math.floor(Math.random() * possible.length));


	// Save Media into Document Directory
	var fileObj = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, igName + ".png");
	fileObj.write(media);

	// Save File Object into Array
	_selected_images.push({
		id: igName,
		file: fileObj.resolve()
	});

	// Show File into Image and store into Scrollview
	doUpdateScrollView();
};


/**
 * Function to Update Scrollview 
 */
function doUpdateScrollView() {
	$._scr.removeAllChildren();
	if(_selected_images && _selected_images.length > 0) {
		_selected_images.forEach(function(item) {
			var _vcont = Ti.UI.createView({
				width: gridSize,
				height: gridSize,
				backgroundColor: 'transparent',
				custItem: item
			});
			var _ig = Ti.UI.createImageView({
				left: 14,
				top: 14,
				bottom: 14,
				right: 14,
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				custItem: item,
				image: item.file
			});
			_vcont.add(_ig);
			
			$._scr.add(_vcont);
		});
	}
	
	$.trigger('refresh', {
		data: _selected_images
	});
};


/**
 * Widget get method to grap data images
 */
$.doGetImages = function() {
	return _selected_images;
};

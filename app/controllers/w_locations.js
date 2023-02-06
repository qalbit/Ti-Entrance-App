// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var XHR = require("xhr");
var LIST_DATA = [];

var doCloseClick = function() {
	$.w_locations.close();
};

var doTemplateItemClick = function(arg) {
	var itemIndex = arg.itemIndex;
	var item = arg.section.getItemAt(itemIndex);
	if (item) {
		var locationName = item.properties.custData.name || "";
		var locationId = item.properties.custData.id || "";
		var loc = {
			name : locationName,
			id : locationId
		};
		args.saveItem(loc);
		$.w_locations.close();
	}

};

var doLoadData = function(data) {
	LIST_DATA = [];
	if (data && data.length > 0) {
		for (var i = 0,
		    j = data.length; i < j; i++) {
			var dataObj = data[i];
			LIST_DATA.push({
				template : "template_name",
				properties : {
					custData : dataObj
				},
				name : {
					text : dataObj.name
				}
			});
		};
	}
	$.list_section_locations.setItems(LIST_DATA);
};

/**
 * Window's Events listener
 */
var doOpenWindow = function() {
	doLoadData(args.data);
};
var doCloseWindow = function() {
	$.destroy();
};

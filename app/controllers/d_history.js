// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var data = args.data || [];

var LIST_DATA = [];

if(data && data.length > 0) {
    data.forEach(item => {
        LIST_DATA.push({
            template: "template_item",
            properties: {
                custData: item,
                linkPreview: item.link || ""
            },
            "date": {
                text: item.date || ""
            },
            "user": {
                text: item.user || ""
            },
            "desc": {
                text: item.fail_description || ""
            },
            "link": {
                linkPreview: item.link || "",
                visible: (item.link == "") ? false : true
            },
        })
    });

    $.list_section_history.setItems(LIST_DATA);
}

/**
 * Function on click of List Item 
 */
var doItemClickListener = function(arg) {
    var index = arg.itemIndex || 0;
    var item = arg.section.getItemAt(index) || null;
    if(item) {
        var link = item.properties.linkPreview || "";
        if(link) {
            if( OS_IOS && Ti.Platform.canOpenURL(link) ) {
                Ti.Platform.openURL(link);
            } else {
                Ti.Platform.openURL(link);
            }
        }
    }
};


/**
 * Window's Event Listener
 */
 var doOpenWindow = function() {
	if(OS_ANDROID) {
		var activity = $.d_history.activity,
			actionBar = activity.actionBar;
		if(actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.d_history.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};
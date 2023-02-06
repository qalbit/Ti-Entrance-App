// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var DATA = args.information || null;


/**
 * Function to show information on display
 */
var doSetData = function(data) {
	var title 	= data.work_form_id || "";
	var name 	= data.name || "";
	var date 	= data.date || "";
	var start 	= data.start || "";
	var end 	= data.end || "";
	var fail_description 	= data.fail_description || "";
	var work_description 	= data.work_description || "";
	var description			= data.description || "";
	
	$.item_title_val.text = title;
	$.item_name_val.text = name;
	$.item_date_val.text = date;
	$.item_start_val.text = start;
	$.item_end_val.text = end;
	$.item_faildesc_val.text = fail_description;
	$.item_workdesc_val.text = work_description;
	$.item_desc_val.text = description;
};

/**
 * Window's event listener
 */
var doOpenWindow = function() {
	doSetData(DATA);
	if (OS_ANDROID) {
		var activity = $.w_history_information.activity,
		    actionBar = activity.actionBar;
		if (actionBar) {
			actionBar.displayHomeAsUp = true;
			actionBar.onHomeIconItemSelected = function() {
				$.w_history_information.close();
			};
		}
	}
};
var doCloseWindow = function() {
	$.destroy();
};

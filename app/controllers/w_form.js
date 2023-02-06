// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

/**
 * IOS Navigation Button Click Listener
 */
var doClickToggle = function() {
	Alloy.Globals.toggleDrawer();
};

/**
 * Tab's Click Listener
 */
var doClickTabs = function(arg) {
	var index = arg.clickedTab || 0;
	$.scrb_holder.scrollToView(index);
};
var doChangeTabs = function(arg) {
};

/**
 * Tab Widget Initialisation
 */
$.tabs.init({
	titles: ["Pending", "Fullfiled", "Canceled"],
	titleFontSize: Alloy.CFG.FontSize.Small,
	titleFontWeight: 'bold',
	badge: [true, false, false],
	badgeFontSize: Alloy.CFG.FontSize.Small,
	badgeFontWeight: 'bold',
	badgeColor: Alloy.CFG.Colors.colorAccent
});

$.tabs.doUpdateBadge({
	tab: 0,
	counter: 2
});

/**
 * Scrollable View Scroll End Listener
 */
var doScrollEndCalled = function(arg) {
	var currentPage = arg.currentPage || 0;
	$.tabs.doSelectTab({
		tab: currentPage
	});
};

/**
 * ListView Item Click Listener
 */
var doListItemClick = function() {
	var w_form_status = Alloy.createController("w_form_status").getView();
	w_form_status.open();
};

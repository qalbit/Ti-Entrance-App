// DEFAULT Variables
var moment = require('moment');
var DEFAULT_TODAY = moment();
var CALENDER_MAIN_VIEW = null;
var CALENDER_SCROLL_VIEW = null;
var CURRENT_SCROLL_INDEX = -1;
var CURRENT_MONTH_SELECTED = -1;
var MAX_SCROLL_PAGE = 0;
var MIN_SCROLL_PAGE = 0;
var MONTH_TITLE_TEXT_VIEW = null;
var EVENTS = null;
var OVERLAY_CALENDER = null;
var CLICKED_DATE = null;

var ln = Ti.Locale.currentLanguage;
moment.locale(ln);

CALENDER = function() {};

CALENDER.prototype.createView = function(date, events, _onClick, extraParams) {
	console.log('I am at createView in CALENDER Module');
	var _onClick = _onClick ||
	function() {
	};
	EVENTS = events;
	var prevMonth = moment(date).subtract(1, 'months');
	var nextMonth = moment(date).add(1, 'months');
	MONTH_TITLE_TEXT_VIEW = extraParams.textObj || null;
	/**
	 * Main Calendar Month View Container
	 */
	generateMainContainer();
	var prevMonthView = createInitialViews(prevMonth, events);
	var currentMonthView = createInitialViews(date, events);
	var nextMonthView = createInitialViews(nextMonth, events);
	var views = [prevMonthView, currentMonthView, nextMonthView];
	if (CALENDER_SCROLL_VIEW != null) {
		CALENDER_SCROLL_VIEW.views = views;
	} else {
		generateMainContainer();
		if (CALENDER_SCROLL_VIEW != null) {
			CALENDER_SCROLL_VIEW.views = views;
		}
	}
	CURRENT_SCROLL_INDEX = 1;
	CURRENT_MONTH_SELECTED = date.month();
	MAX_SCROLL_PAGE = 2;
	MIN_SCROLL_PAGE = 0;

	if (CALENDER_SCROLL_VIEW.views.length > 0) {
		CALENDER_SCROLL_VIEW.scrollToView(currentMonthView);
	}
	return CALENDER_MAIN_VIEW;
};

/**
 * Function to Generate Main Container View as Scrollable to both ends.
 */
generateMainContainer = function() {
	// Clear Previous State of Object
	if (CALENDER_MAIN_VIEW != null) {
		CALENDER_MAIN_VIEW = null;
	}
	if (CALENDER_SCROLL_VIEW != null) {
		CALENDER_SCROLL_VIEW = null;
	}
	/**
	 * Create Main View
	 */
	CALENDER_MAIN_VIEW = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
	});
	/**
	 * Create Scrollable View
	 */
	CALENDER_SCROLL_VIEW = Ti.UI.createScrollableView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});
	CALENDER_MAIN_VIEW.add(CALENDER_SCROLL_VIEW);
	CALENDER_SCROLL_VIEW.addEventListener('scrollend', doScrollCalenderView);
};

/**
 * Function to Add Layout on ScrollableView
 *
 */
doShowOverlay = function() {
	if (OVERLAY_CALENDER != null) {
		CALENDER_MAIN_VIEW.remove(OVERLAY_CALENDER);
		OVERLAY_CALENDER = null;
	}

	OVERLAY_CALENDER = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		backgroundColor : Alloy.CFG.Colors.colorPrimaryDark,
		zIndex : 9
	});

	var activity_indicator = Ti.UI.createActivityIndicator({
		style : Ti.UI.ActivityIndicatorStyle.BIG,
		indicatorColor : Alloy.CFG.Colors.colorPrimary,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE
	});
	OVERLAY_CALENDER.add(activity_indicator);
	activity_indicator.show();
	CALENDER_MAIN_VIEW.add(OVERLAY_CALENDER);
};
doHideOverlay = function() {
	if (OVERLAY_CALENDER != null) {
		CALENDER_MAIN_VIEW.remove(OVERLAY_CALENDER);
		OVERLAY_CALENDER = null;
	}
};
/**
 * Scrollable View Scroll End Event Listener
 */
doScrollCalenderView = function(arg) {
	var pageIndex = arg.currentPage;
	var currentView = arg.view || null;
	var currentDateObj = null;
	var currentMonth = 0;
	var views = CALENDER_SCROLL_VIEW.views || null;
	if (currentView != null) {
		currentDateObj = currentView.custDateObj || null;
		currentMonth = currentView.custMonth || 0;
	}
	if (pageIndex === MAX_SCROLL_PAGE) {
		doShowOverlay();
		var nMonth = moment(currentDateObj).add(1, 'months');
		var nextMonthView = createInitialViews(nMonth, EVENTS);
		views.splice(views.length, 0, nextMonthView);
		CURRENT_SCROLL_INDEX = views.length - 1;
		CALENDER_SCROLL_VIEW.views = views;
		if (CALENDER_SCROLL_VIEW.views.length > 0) {
			CALENDER_SCROLL_VIEW.scrollToView(CURRENT_SCROLL_INDEX - 1);
		}
	}
	if (pageIndex === MIN_SCROLL_PAGE) {
		doShowOverlay();
		var pMonth = moment(currentDateObj).subtract(1, 'months');
		var prevMonthView = createInitialViews(pMonth, EVENTS);
		views.splice(0, 0, prevMonthView);
		CURRENT_SCROLL_INDEX = 1;
		CALENDER_SCROLL_VIEW.views = views;
		if (CALENDER_SCROLL_VIEW.views.length > 0) {
			CALENDER_SCROLL_VIEW.scrollToView(1);
		}
	}
	CURRENT_SCROLL_INDEX = pageIndex;
	setTimeout(function() {
		doHideOverlay();
		var finalVisibleView = CALENDER_SCROLL_VIEW.views[CURRENT_SCROLL_INDEX];
		var currentDate = finalVisibleView.custDateObj;
		var currentMonthName = moment(currentDate).startOf("month").format('MMMM');
		var currentMonthNumber = moment(currentDate).startOf("month").format('M');
		var currentViewableYear = moment(currentDate).year();
		var currentViewYear = moment(currentDate).format("YY");
		var defaultViewableYear = DEFAULT_TODAY.year();
		if (currentViewableYear !== defaultViewableYear) {
			if (MONTH_TITLE_TEXT_VIEW) {
				MONTH_TITLE_TEXT_VIEW.text = currentMonthName + ", " + currentViewYear;
			} else {
				if(OS_ANDROID) {
					Alloy.Globals.doChangeMonthTitle(currentMonthName + ", " + currentViewYear);
				}
			}

			if (Alloy.Globals.doChangeList) {
				Alloy.Globals.doChangeList(currentMonthNumber, currentViewableYear);
			}
		} else {
			if (MONTH_TITLE_TEXT_VIEW) {
				MONTH_TITLE_TEXT_VIEW.text = currentMonthName;
			} else {
				if(OS_ANDROID) {
					Alloy.Globals.doChangeMonthTitle(currentMonthName);
				}
			}
			if (Alloy.Globals.doChangeList) {
				Alloy.Globals.doChangeList(currentMonthNumber, currentViewableYear);
			}
		}
	}, 500);

	MIN_SCROLL_PAGE = 0;
	MAX_SCROLL_PAGE = CALENDER_SCROLL_VIEW.views.length - 1 || 0;
};

/**
 * Generate Calender Month UI view
 */
createInitialViews = function(date, events) {
	var cMonth = date != null ? moment(date) : moment();
	cMonth.date(1);
	var pMonth = moment(cMonth).subtract(1, 'months');
	var nMonth = moment(cMonth).add(1, 'months');

	var daysDisplayInView = 42;
	var currentDisplayInView = 0;

	var dayOfWeek = cMonth.day();
	var dayOfMonth = cMonth.daysInMonth();
	var dayDisplayNextMonth = 0;
	/**
	 * Generate View Which Holds the UI of Calendar Dates
	 */
	var monthViewCont = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		layout : 'horizontal',
		custDateObj : moment(date),
		custMonth : moment(date).month()
	});
	/**
	 * Add Days tile View in Calendar View
	 */
	if (dayOfWeek != null) {
		// Add Previous Month Dates
		for (var i = dayOfWeek - 1; i >= 0; i--) {
			var cDate = (pMonth.daysInMonth() - i);
			var dateO = moment(pMonth).date(cDate);
			cDate = (cDate < 10) ? "0" + cDate : cDate;
			var dView = getDateTileView(dateO, cDate, true, events, false);
			monthViewCont.add(dView);
			currentDisplayInView++;
		};
		// Add Current Month Dates
		for (var j = 0; j < dayOfMonth; j++) {
			var cDate = j + 1;
			var dateO = moment(cMonth).date(cDate);
			var isCDate = ((cDate === DEFAULT_TODAY.date()) && (cMonth.month() === DEFAULT_TODAY.month()) && (cMonth.year() === DEFAULT_TODAY.year())) ? true : false;
			cDate = (cDate < 10) ? "0" + cDate : cDate;
			var dView = getDateTileView(dateO, cDate, false, events, isCDate);
			monthViewCont.add(dView);
			currentDisplayInView++;
		};
		// Get remaining Days value
		dayDisplayNextMonth = daysDisplayInView - currentDisplayInView;
		// Add Next Month Dates
		for (var k = 0; k < dayDisplayNextMonth; k++) {
			var cDate = k + 1;
			var dateO = moment(nMonth).date(cDate);
			cDate = (cDate < 10) ? "0" + cDate : cDate;
			var dView = getDateTileView(dateO, cDate, true, null, false);
			monthViewCont.add(dView);
			currentDisplayInView++;
		};
	}
	return monthViewCont;
};

/**
 * Function to Generate Date with Tiles View Structure
 * @param dO current Date Object for Tiles
 * @param d current Date of Tiles
 * @param p show the tiles as Previous/Next or current
 * @param e show the event on tiles
 * @param c show the currrent System date
 * @return Ti.Ui.View to add in Main Container of Calender
 */
getDateTileView = function(dO, d, p, e, c) {
	var dFt = dO.format("DD-MM-YYYY");
	var hasEvent = false;
	if (e != null && e.length > 0) {
		for (var i = 0,
		    j = e.length; i < j; i++) {
			var evt = e[i];
			var evtDate = moment.unix(evt.timestamp).format("DD-MM-YYYY");
			if (dFt == evtDate) {
				hasEvent = true;
			}
		};
	}
	var tileView = Ti.UI.createView({
		width : Alloy.CFG.UI.Date.normalWidth,
		height : Alloy.CFG.UI.Date.normalHeight,
		touchEnabled : true,
		clickedDate : d,
		custDateObj : dO,
		isPrev : p,
		current : c,
		hasEvent : hasEvent
	});
	var tileD = Ti.UI.createView({
		left : 2,
		top : 2,
		right : 2,
		bottom : 2,
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		backgroundColor : (p) ? Alloy.CFG.Colors.calDatePrevColor : ((c) ? Alloy.CFG.Colors.colorPrimary : Alloy.CFG.Colors.calDateCurrentColor),
		touchEnabled : false
	});
	if (c) {
		tileD.borderRadius = (!Alloy.isTablet) ? ((Alloy.CFG.UI.Date.normalWidth / 2) - 1) : 12;
	}
	tileView.add(tileD);

	var lD = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		font : {
			fontSize : (p) ? Alloy.CFG.FontSize.Tiny : Alloy.CFG.FontSize.Small,
			fontWeight : 'bold'
		},
		color : (p) ? Alloy.CFG.Colors.lblSemiLightColor : Alloy.CFG.Colors.lblWhiteColor,
		text : d,
		touchEnabled : false
	});
	tileD.add(lD);
	// Adding Fixed Event here
	if (hasEvent) {
		var eventView = Ti.UI.createView({
			bottom : 2,
			width : 6,
			height : 6,
			borderRadius : 3,
			backgroundColor : (p) ? 'transparent' : Alloy.CFG.Colors.colorAccent
		});
		tileD.add(eventView);
	}
	tileView.addEventListener('click', doClickDate);
	return tileView;
};

function doClickDate(e) {
	if (CLICKED_DATE) {
		CLICKED_DATE.source.children[0].backgroundColor = 'transparent';
	}
	if (!e.source.isPrev && !e.source.current) {
		e.source.children[0].backgroundColor = Alloy.CFG.Colors.colorAccent;
		e.source.children[0].borderRadius = (!Alloy.isTablet) ? ((Alloy.CFG.UI.Date.normalWidth / 2) - 1) : 12;
		CLICKED_DATE = e;
	}
};

module.exports = CALENDER;
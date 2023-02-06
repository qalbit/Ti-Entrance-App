/**
 * Default SIZE for Components
 */
var pWidth = Ti.Platform.displayCaps.platformWidth;
var tabWidth = 0;
if (OS_IOS) {
	tabWidth = pWidth / 3;
}

$.tab1.width = tabWidth;
$.tab2.width = tabWidth;
$.tab3.width = tabWidth;
$.seperator1.backgroundColor = Alloy.CFG.Colors.lblLightColor;

/**
 * Default Animations
 */
var DEF_ANIM_FADE_OUT = Ti.UI.createAnimation({
	duration : 150,
	backgroundColor : 'transparent'
});
var DEF_ANIM_FADE_IN = Ti.UI.createAnimation({
	duration : 250,
	backgroundColor : Alloy.CFG.Colors.lblLightColor
});

/***
 *  Default Variable Declaration
 */
var DEF_TAB = [];
var DEF_FONT_SIZE = Alloy.CFG.FontSize.Normal;
var DEF_FONT_WEIGHT = 'bold';
var DEF_BADGE_VISIBILITY = [];
var DEF_BADGE_COLOR = "#AA0000";
var DEF_BADGE_FONT_SIZE = Alloy.CFG.FontSize.Small;
var DEF_BADGE_FONT_WEIGHT = 'bold';

/**
 * Tab Group Click Listener
 */
var doClickTabGroup = function(arg) {
	var tabId = arg.source.id || "";
	if (tabId != "") {
		switch(tabId) {
		case "tab1":
			$.seperator1.animate(DEF_ANIM_FADE_IN);
			$.seperator2.animate(DEF_ANIM_FADE_OUT);
			$.seperator3.animate(DEF_ANIM_FADE_OUT);

			$.trigger('click', {
				clickedTab : 0,
				tabId : tabId
			});
			break;
		case "tab2":
			$.seperator1.animate(DEF_ANIM_FADE_OUT);
			$.seperator2.animate(DEF_ANIM_FADE_IN);
			$.seperator3.animate(DEF_ANIM_FADE_OUT);

			$.trigger('click', {
				clickedTab : 1,
				tabId : tabId
			});
			break;
		case "tab3":
			$.seperator1.animate(DEF_ANIM_FADE_OUT);
			$.seperator2.animate(DEF_ANIM_FADE_OUT);
			$.seperator3.animate(DEF_ANIM_FADE_IN);

			$.trigger('click', {
				clickedTab : 2,
				tabId : tabId
			});
			break;
		}
	}
};

/**
 * Widget Initialisation
 * @param {Object} args for Intial Properties
 */
$.init = function(arg) {
	DEF_TAB = arg.titles || [];
	DEF_FONT_SIZE = arg.titleFontSize || DEF_FONT_SIZE;
	DEF_FONT_WEIGHT = arg.titleFontWeight || DEF_FONT_WEIGHT;
	DEF_BADGE_VISIBILITY = arg.badge || [];
	DEF_BADGE_COLOR = arg.badgeColor || DEF_BADGE_COLOR;
	DEF_BADGE_FONT_SIZE = arg.badgeFontSize || DEF_BADGE_FONT_SIZE;
	DEF_BADGE_FONT_WEIGHT = arg.badgeFontWeight || DEF_BADGE_FONT_WEIGHT;

	/**
	 * Change Titles for All Tabs
	 */
	$.title_1.font = {
		fontSize : DEF_FONT_SIZE,
		fontWeight : DEF_FONT_WEIGHT
	};
	$.title_2.font = {
		fontSize : DEF_FONT_SIZE,
		fontWeight : DEF_FONT_WEIGHT
	};
	$.title_3.font = {
		fontSize : DEF_FONT_SIZE,
		fontWeight : DEF_FONT_WEIGHT
	};

	$.title_1.text = DEF_TAB[0];
	$.title_2.text = DEF_TAB[1];
	$.title_3.text = DEF_TAB[2];

	/**
	 * Set Badge for All Tabs
	 */
	$.v_badge_cont_1.visible = DEF_BADGE_VISIBILITY[0];
	$.v_badge_cont_1.backgroundColor = DEF_BADGE_COLOR;
	$.v_badge_cont_2.visible = DEF_BADGE_VISIBILITY[1];
	$.v_badge_cont_2.backgroundColor = DEF_BADGE_COLOR;
	$.v_badge_cont_3.visible = DEF_BADGE_VISIBILITY[2];
	$.v_badge_cont_3.backgroundColor = DEF_BADGE_COLOR;
	$.lbl_badge_1.font = {
		fontSize : DEF_BADGE_FONT_SIZE,
		fontWeight : DEF_BADGE_FONT_WEIGHT
	};
	$.lbl_badge_2.font = {
		fontSize : DEF_BADGE_FONT_SIZE,
		fontWeight : DEF_BADGE_FONT_WEIGHT
	};
	$.lbl_badge_3.font = {
		fontSize : DEF_BADGE_FONT_SIZE,
		fontWeight : DEF_BADGE_FONT_WEIGHT
	};
};

/**
 * Update Badge Value base on Tab Index and Counter to be updated
 * @param {Object} arg for Tab Index & Counter
 */
$.doUpdateBadge = function(arg) {
	var tabIndex = arg.tab || 0;
	var counter = arg.counter || 0;
	if (counter > 0) {
		switch(tabIndex) {
		case 0:
			$.v_badge_cont_1.visible = true;
			$.lbl_badge_1.text = counter;
			DEF_BADGE_VISIBILITY[0] = true;
			break;
		case 1:
			$.v_badge_cont_2.visible = true;
			$.lbl_badge_2.text = counter;
			DEF_BADGE_VISIBILITY[1] = true;
			break;
		case 2:
			$.v_badge_cont_3.visible = true;
			$.lbl_badge_3.text = counter;
			DEF_BADGE_VISIBILITY[2] = true;
			break;
		}
	} else {
		switch(tabIndex) {
		case 0:
			$.v_badge_cont_1.visible = false;
			$.lbl_badge_1.text = counter;
			DEF_BADGE_VISIBILITY[0] = false;
			break;
		case 1:
			$.v_badge_cont_2.visible = false;
			$.lbl_badge_2.text = counter;
			DEF_BADGE_VISIBILITY[1] = false;
			break;
		case 2:
			$.v_badge_cont_3.visible = false;
			$.lbl_badge_3.text = counter;
			DEF_BADGE_VISIBILITY[2] = false;
			break;
		}
	}
};

$.doSelectTab = function(arg) {
	var tabIndex = arg.tab || 0;
	switch(tabIndex) {
	case 0:
		$.seperator1.animate(DEF_ANIM_FADE_IN);
		$.seperator2.animate(DEF_ANIM_FADE_OUT);
		$.seperator3.animate(DEF_ANIM_FADE_OUT);

		$.trigger('change', {
			clickedTab : 1,
			tabId : "tab1"
		});
		break;
	case 1:
		$.seperator1.animate(DEF_ANIM_FADE_OUT);
		$.seperator2.animate(DEF_ANIM_FADE_IN);
		$.seperator3.animate(DEF_ANIM_FADE_OUT);
		
		$.trigger('change', {
			clickedTab : 2,
			tabId : "tab2"
		});
		break;
	case 2:
		$.seperator1.animate(DEF_ANIM_FADE_OUT);
		$.seperator2.animate(DEF_ANIM_FADE_OUT);
		$.seperator3.animate(DEF_ANIM_FADE_IN);
		
		$.trigger('change', {
			clickedTab : 3,
			tabId : "tab3"
		});
		break;
	}
};

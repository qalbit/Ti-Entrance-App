/**
 * Default Variables
 * Animation, Constant, Size & Data Variables
 */
var dataResponse = null;
var HEADER_STYLE = null;
var ITEMS_STYLE = null;
var DATA_ITEMS_STYLE = null;
var DATA_ITEM_0_STYLE = null;
var DATA_ITEM_1_STYLE = null;
var DATA_ITEM_2_STYLE = null;

var SELECTED_ITEMS = [];

/**
 * Designing Widget Components
 */

/**
 * Widget Functions
 */

/**
 * Widget Events
 */
$.doUpdateQtyPopupVal = function(arg) {
	if (arg.itemIndex != null && arg.itemIndex != -1) {
		var selectedItem = $.listsection.getItemAt(arg.itemIndex);
		try {

			if (arg.itemQty > 0) {
				var qty = arg.itemQty || "01";
				qty = parseInt(qty, 10);
				qty = (qty < 10) ? ("" + qty) : ("" + qty);

				var custObj = selectedItem.properties.custObj || null;
				custObj.qty = qty;

				var id = custObj.id || "";

				if (SELECTED_ITEMS.length > 0) {
					var SEL_ID = _.pluck(SELECTED_ITEMS, "id");
					if (SEL_ID && SEL_ID.length > 0) {
						if (SEL_ID.indexOf(id) >= 0) {
							// Just Update it
							var index = SEL_ID.indexOf(id);
							SELECTED_ITEMS[index].qty = parseInt(custObj.qty, 10) + parseInt(SELECTED_ITEMS[index].qty, 10);
							SELECTED_ITEMS[index].qty = SELECTED_ITEMS[index].qty + "";
						} else {
							// Just Insert it
							SELECTED_ITEMS.push(custObj);
						}
					} else {
						SELECTED_ITEMS.push(custObj);
					}
				} else {
					SELECTED_ITEMS.push(custObj);
				}
				// Update Value
				selectedItem.itemContainer.backgroundColor = Alloy.CFG.Colors.colorPrimaryLight;
				$.listsection.updateItemAt(arg.itemIndex, selectedItem);
			} else {
				// Update Value
				selectedItem.itemContainer.backgroundColor = "#FFFFFF";
				$.listsection.updateItemAt(arg.itemIndex, selectedItem);
			}
			Ti.API.info('Item Property going to clear ---> ' + JSON.stringify(SELECTED_ITEMS));
			$.trigger("clearItems", {});
			return;
		} catch(ex) {
			Ti.API.debug('Exception qty popup --> ' + ex);
		}
	}
};

$.doGetSelectedProducts = function(prevData, _callback) {
	var DATA = [];
	var REMAIN_D = [];
	var SEL_ID = _.pluck(SELECTED_ITEMS, "id");
	if (SEL_ID && prevData && prevData.length > 0) {
		for (var i = 0,
		    j = prevData.length; i < j; i++) {
			var item = prevData[i];
			var selIndex = SEL_ID.indexOf(item.id);
			if (selIndex >= 0) {
				var qty = (parseInt(SELECTED_ITEMS[selIndex].qty, 10) + parseInt(item.qty, 10)) + "";
				item.custData.qty = qty;
				SELECTED_ITEMS[selIndex] = item.custData;
			} else {
				item.custData.qty = item.qty;
				REMAIN_D.push(item.custData);
			}
		};
	}
	if (REMAIN_D && REMAIN_D.length > 0) {
		REMAIN_D.forEach(function(item) {
			SELECTED_ITEMS.push(item);
		});
	}

	if(SELECTED_ITEMS && SELECTED_ITEMS.length > 0) {
		_callback({
			success : true,
			data : SELECTED_ITEMS
		});
	} else {
		_callback({
			success : false,
			data : SELECTED_ITEMS
		});
	}
	return;

	var items = $.listsection.items || [];
	if (items && items.length > 0) {
		var selectedItems = [];
		for (var i = 0,
		    j = items.length; i < j; i++) {

			var itemObj = items[i];
			var itemProperties = itemObj.properties || null;

			if (itemProperties) {
				var itemQty = itemProperties.custQty || "0";
				itemQty = parseInt(itemQty, 10);
				if (itemQty > 0) {
					var itemData = itemProperties.custObj || null;
					if (itemData) {
						var id = itemData.id || "";
						var artikelnummer = itemData.artikelnummer || "";
						var naam = itemData.naam || "";
						itemData.qty = itemQty + "";
						selectedItems.push(itemData);
					}
				}
			}
		};

		// Check for Selected Items contain same as previous or not
		// if has the previous then ignore it and if not then add it.
		var SEL_ID = _.pluck(selectedItems, "id");
		var prevTempData = prevData;
		var remainData = [];
		if (SEL_ID && prevTempData && prevTempData.length > 0) {
			for (var i = 0,
			    j = prevTempData.length; i < j; i++) {
				var item = prevTempData[i];
				var selIndex = SEL_ID.indexOf(item.id);
				if (selIndex >= 0) {
				} else {
					remainData.push(item);
				}
			};
		}
		if (remainData && remainData.length > 0) {
			remainData.forEach(function(item) {
				selectedItems.push(item);
			});
		}

		_callback({
			success : true,
			data : selectedItems
		});
	} else {
		_callback({
			success : false,
			data : selectedItems
		});
	}
};

$.doGetSelectedData = function(_callback) {
	var items = $.listsection.items || [];
	if (items && items.length > 0) {
		var selectedItems = [];
		for (var i = 0,
		    j = items.length; i < j; i++) {
			var itemObj = items[i];
			var itemProperties = itemObj.properties || null;
			if (itemProperties) {
				var itemQty = itemProperties.custQty || "0";
				itemQty = parseInt(itemQty, 10);
				if (itemQty > 0) {
					var itemData = itemProperties.custObj || null;
					if (itemData) {
						var id = itemData.id || "";
						var artikelnummer = itemData.artikelnummer || "";
						var naam = itemData.naam || "";
						selectedItems.push({
							id : id,
							artikelnummer : artikelnummer,
							naam : naam,
							qty : itemQty,
							custData : itemData
						});
					}
				}
			}
		};

		_callback({
			success : true,
			data : selectedItems
		});
	} else {
		_callback({
			success : false,
			data : selectedItems
		});
	}
};

$.doGetData = function(dataObj, selDataObj) {
	// Grab ID From selected Data Object
	// var SEL_ID = _.pluck(selDataObj, "id");

	var data = [];
	if (dataObj && dataObj.length > 0) {
		for (var i = 0; i < dataObj.length; i++) {
			var dataItem = dataObj[i];

			data.push({
				template : "template_three",
				properties : {
					isAdded : false,
					custQty : "0",
					custBg : DATA_ITEMS_STYLE.backgroundColor || "white",
					semiCustBg : DATA_ITEMS_STYLE.semiBgColor || "white",
					custObj : dataItem || null
				},
				itemContainer : {
					top : DATA_ITEMS_STYLE.top || 1,
					width : DATA_ITEMS_STYLE.width || Ti.UI.FILL,
					height : DATA_ITEMS_STYLE.height || Ti.UI.SIZE,
					backgroundColor : DATA_ITEMS_STYLE.backgroundColor || "white",
					layout : DATA_ITEMS_STYLE.layout || "horizontal"
				},
				vItemContainer1 : {
					width : DATA_ITEM_0_STYLE.width || Ti.UI.SIZE,
					height : DATA_ITEM_0_STYLE.height || 60,
					backgroundColor : 'transparent'
				},
				itemArtical : {
					text : dataItem.artikelnummer || "",
					color : DATA_ITEM_0_STYLE.color || "black",
					font : DATA_ITEM_0_STYLE.font || {
						fontSize : 14,
						fontWeight : 'normal'
					}
				},
				vItemContainer2 : {
					width : DATA_ITEM_1_STYLE.width || Ti.UI.SIZE,
					height : DATA_ITEM_1_STYLE.height || 60,
					backgroundColor : 'transparent'
				},
				itemProduct : {
					text : dataItem.naam || "",
					color : DATA_ITEM_1_STYLE.color || "black",
					font : DATA_ITEM_1_STYLE.font || {
						fontSize : 14,
						fontWeight : 'normal'
					}
				},
				vItemContainer3 : {
					width : DATA_ITEM_2_STYLE.width || Ti.UI.SIZE,
					height : DATA_ITEM_2_STYLE.height || 60,
					backgroundColor : 'transparent'
				},
				itemAddProduct : {
					backgroundColor : DATA_ITEM_2_STYLE.backgroundColor || "transparent",
					height : 36,
					visible : true
				},
				itemAddProductTitle : {
					color : DATA_ITEM_2_STYLE.color || "black",
					font : DATA_ITEM_2_STYLE.font || {
						fontSize : 14,
						fontWeight : 'normal'
					},
				},
				itemActionQtyCont : {
					height : 0,
					visible : false
				},
				itemRemoveQty : {},
				itemQty : {
					text : "01"
				},
				itemAddQty : {},
			});

			// if (SEL_ID && SEL_ID.indexOf(dataItem.id) >= 0) {
			// data.push({
			// template : "template_three",
			// properties : {
			// isAdded : true,
			// custQty : "" + selDataObj[SEL_ID.indexOf(dataItem.id)].qty || "0",
			// custBg : DATA_ITEMS_STYLE.backgroundColor || "white",
			// semiCustBg : DATA_ITEMS_STYLE.semiBgColor || "white",
			// custObj : dataItem || null
			// },
			// itemContainer : {
			// top : DATA_ITEMS_STYLE.top || 1,
			// width : DATA_ITEMS_STYLE.width || Ti.UI.FILL,
			// height : DATA_ITEMS_STYLE.height || Ti.UI.SIZE,
			// backgroundColor : DATA_ITEMS_STYLE.semiBgColor || "white",
			// layout : DATA_ITEMS_STYLE.layout || "horizontal"
			// },
			// vItemContainer1 : {
			// width : DATA_ITEM_0_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_0_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemArtical : {
			// text : dataItem.artikelnummer || "",
			// color : DATA_ITEM_0_STYLE.color || "black",
			// font : DATA_ITEM_0_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// }
			// },
			// vItemContainer2 : {
			// width : DATA_ITEM_1_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_1_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemProduct : {
			// text : dataItem.naam || "",
			// color : DATA_ITEM_1_STYLE.color || "black",
			// font : DATA_ITEM_1_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// }
			// },
			// vItemContainer3 : {
			// width : DATA_ITEM_2_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_2_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemAddProduct : {
			// backgroundColor : DATA_ITEM_2_STYLE.backgroundColor || "transparent",
			// height : 0,
			// visible : false
			// },
			// itemAddProductTitle : {
			// color : DATA_ITEM_2_STYLE.color || "black",
			// font : DATA_ITEM_2_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// },
			// },
			// itemActionQtyCont : {
			// height : 36,
			// visible : true
			// },
			// itemRemoveQty : {},
			// itemQty : {
			// text : "" + selDataObj[SEL_ID.indexOf(dataItem.id)].qty || "01"
			// },
			// itemAddQty : {},
			// });
			// } else {
			// data.push({
			// template : "template_three",
			// properties : {
			// isAdded : false,
			// custQty : "0",
			// custBg : DATA_ITEMS_STYLE.backgroundColor || "white",
			// semiCustBg : DATA_ITEMS_STYLE.semiBgColor || "white",
			// custObj : dataItem || null
			// },
			// itemContainer : {
			// top : DATA_ITEMS_STYLE.top || 1,
			// width : DATA_ITEMS_STYLE.width || Ti.UI.FILL,
			// height : DATA_ITEMS_STYLE.height || Ti.UI.SIZE,
			// backgroundColor : DATA_ITEMS_STYLE.backgroundColor || "white",
			// layout : DATA_ITEMS_STYLE.layout || "horizontal"
			// },
			// vItemContainer1 : {
			// width : DATA_ITEM_0_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_0_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemArtical : {
			// text : dataItem.artikelnummer || "",
			// color : DATA_ITEM_0_STYLE.color || "black",
			// font : DATA_ITEM_0_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// }
			// },
			// vItemContainer2 : {
			// width : DATA_ITEM_1_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_1_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemProduct : {
			// text : dataItem.naam || "",
			// color : DATA_ITEM_1_STYLE.color || "black",
			// font : DATA_ITEM_1_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// }
			// },
			// vItemContainer3 : {
			// width : DATA_ITEM_2_STYLE.width || Ti.UI.SIZE,
			// height : DATA_ITEM_2_STYLE.height || 60,
			// backgroundColor : 'transparent'
			// },
			// itemAddProduct : {
			// backgroundColor : DATA_ITEM_2_STYLE.backgroundColor || "transparent",
			// height : 36,
			// visible : true
			// },
			// itemAddProductTitle : {
			// color : DATA_ITEM_2_STYLE.color || "black",
			// font : DATA_ITEM_2_STYLE.font || {
			// fontSize : 14,
			// fontWeight : 'normal'
			// },
			// },
			// itemActionQtyCont : {
			// height : 0,
			// visible : false
			// },
			// itemRemoveQty : {},
			// itemQty : {
			// text : "01"
			// },
			// itemAddQty : {},
			// });
			// }
		}
	}

	$.listsection.setItems(data);
};

/**
 * Widget Helper functions
 */
var doSetListHeader = function(data) {
	// Set Header View Style
	var headerStyle = data.style || null;
	if (headerStyle) {
		$.lh_cont.width = headerStyle.width || Ti.UI.FILL;
		$.lh_cont.height = headerStyle.height || Ti.UI.SIZE;
		$.lh_cont.backgroundColor = headerStyle.backgroundColor || "white";
		$.lh_cont.layout = headerStyle.layout || "horizontal";
	}
	// Set Header Items
	var headerItems = data.data || [];
	if (headerItems && headerItems.length > 0) {
		for (var i = 0; i < headerItems.length; i++) {
			var item = headerItems[i];
			var vItem = Ti.UI.createView({
				width : item.width || Ti.UI.SIZE,
				height : item.height || Ti.UI.SIZE,
				backgroundColor : item.backgroundColor || "transparent",
			});
			var lItem = Ti.UI.createLabel({
				left : 8,
				right : 8,
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				color : item.color || "black",
				text : item.text || "Header Title",
				font : item.font || {
					fontSize : 14,
					fontWeight : 'bold'
				}
			});
			vItem.add(lItem);
			$.lh_cont.add(vItem);
		};
	}
};

var doSetListItems = function(resultObj) {
	// Setting ListItem Style
	var itemStyle = resultObj.style || null;
	var dataStyle = resultObj.dataStyle || [];
	var dataObj = resultObj.data || [];
	DATA_ITEMS_STYLE = itemStyle || null;
	DATA_ITEM_0_STYLE = dataStyle[0] || null;
	DATA_ITEM_1_STYLE = dataStyle[1] || null;
	DATA_ITEM_2_STYLE = dataStyle[2] || null;

	// Setting Data Section Items
	var data = [];
	for (var i = 0; i < dataObj.length; i++) {
		Ti.API.info('dataStyle[0].width 0000-0-----00----> ' + JSON.stringify(dataStyle[0]));
		data.push({
			template : "template_three",
			properties : {
				isAdded : false,
				custQty : "0",
				custBg : itemStyle.backgroundColor || "white",
				semiCustBg : itemStyle.semiBgColor || "white",
				custObj : dataObj[i] || null
			},
			itemContainer : {
				top : itemStyle.top || 1,
				width : itemStyle.width || Ti.UI.FILL,
				height : itemStyle.height || Ti.UI.SIZE,
				backgroundColor : itemStyle.backgroundColor || "white",
				layout : itemStyle.layout || "horizontal"
			},
			vItemContainer1 : {
				width : dataStyle[0].width || Ti.UI.SIZE,
				height : dataStyle[0].height || 60,
				backgroundColor : 'transparent'
			},
			itemArtical : {
				text : "Test 1 1",
				color : dataStyle[0].color || "black",
				font : dataStyle[0].font || {
					fontSize : 14,
					fontWeight : 'normal'
				}
			},
			vItemContainer2 : {
				width : dataStyle[1].width || Ti.UI.SIZE,
				height : dataStyle[1].height || 60,
				backgroundColor : 'transparent'
			},
			itemProduct : {
				text : "Test 1 2",
				color : dataStyle[1].color || "black",
				font : dataStyle[1].font || {
					fontSize : 14,
					fontWeight : 'normal'
				}
			},
			vItemContainer3 : {
				width : dataStyle[2].width || Ti.UI.SIZE,
				height : dataStyle[2].height || 60,
				backgroundColor : 'transparent'
			},
			itemAddProduct : {
				backgroundColor : dataStyle[2].backgroundColor || "transparent",
				height : 36,
				visible : true
			},
			itemAddProductTitle : {
				color : dataStyle[2].color || "black",
				font : dataStyle[2].font || {
					fontSize : 14,
					fontWeight : 'normal'
				},
			},
			itemActionQtyCont : {
				height : 0,
				visible : false
			},
			itemRemoveQty : {},
			itemQty : {
				text : "01"
			},
			itemAddQty : {},
		});
	}

	$.listsection.setItems(data);

};

function doListviewItemClick(e) {
	var itemIndex = e.itemIndex;
	var clickedItem = e.section.getItemAt(itemIndex);
	try {
		var isAdded = clickedItem.properties.isAdded || false;
		var itemQty = clickedItem.properties.custQty || "0";
		var itemBg = clickedItem.properties.custBg || "white";
		var itemSelBg = clickedItem.properties.semiCustBg || "white";
		var custObj = clickedItem.properties.custObj || null;
		var bindId = e.bindId || "";
		if (bindId && (bindId == "itemAddProduct" || bindId == "itemAddProductTitle")) {

			var qty = clickedItem.itemQty.text || "0";
			qty = parseInt(qty, 10);
			$.trigger('qtypopup', {
				itemIndex : itemIndex,
				quantity : qty
			});

			/*
			 if (isAdded) {
			 clickedItem.properties.isAdded = false;
			 clickedItem.properties.custQty = "0";
			 clickedItem.itemContainer.backgroundColor = itemBg;
			 // Hide Qty Part
			 clickedItem.itemActionQtyCont.height = 0;
			 clickedItem.itemActionQtyCont.visible = false;
			 // Visible Button Part
			 clickedItem.itemAddProduct.height = 36;
			 clickedItem.itemAddProduct.visible = true;
			 // Trigger event here
			 $.trigger("updateItem", {
			 id: custObj.id || "",
			 qty: 0,
			 type: "remove"
			 });
			 } else {
			 clickedItem.properties.isAdded = true;
			 clickedItem.properties.custQty = "1";
			 clickedItem.itemContainer.backgroundColor = itemSelBg;
			 // Visible Qty Part
			 clickedItem.itemActionQtyCont.height = 36;
			 clickedItem.itemActionQtyCont.visible = true;
			 // Hide Button Part
			 clickedItem.itemAddProduct.height = 0;
			 clickedItem.itemAddProduct.visible = false;
			 }
			 e.section.updateItemAt(itemIndex, clickedItem);
			 */
		} else if (bindId == "itemRemoveQty") {
			var qty = clickedItem.itemQty.text || "0";
			qty = parseInt(qty, 10);
			if (qty <= 1) {
				clickedItem.properties.isAdded = false;
				clickedItem.properties.custQty = "0";
				clickedItem.itemContainer.backgroundColor = itemBg;
				// Hide Qty Part
				clickedItem.itemActionQtyCont.height = 0;
				clickedItem.itemActionQtyCont.visible = false;
				// Visible Button Part
				clickedItem.itemAddProduct.height = 36;
				clickedItem.itemAddProduct.visible = true;
				// Change Qty
				clickedItem.itemQty.text = "1";
				e.section.updateItemAt(itemIndex, clickedItem);
				// Trigger event here
				$.trigger("updateItem", {
					id : custObj.id || "",
					qty : 0,
					type : "remove"
				});
			} else {
				qty = qty - 1;
				qty = (qty < 10) ? ("" + qty) : ("" + qty);
				clickedItem.properties.isAdded = true;
				clickedItem.properties.custQty = qty;
				clickedItem.itemContainer.backgroundColor = itemSelBg;
				// Show Qty Part
				clickedItem.itemActionQtyCont.height = 36;
				clickedItem.itemActionQtyCont.visible = true;
				// Visible Button Part
				clickedItem.itemAddProduct.height = 0;
				clickedItem.itemAddProduct.visible = false;
				// Change Qty
				clickedItem.itemQty.text = qty;
				e.section.updateItemAt(itemIndex, clickedItem);
			}
		} else if (bindId == "itemAddQty") {
			var qty = clickedItem.itemQty.text || "00";
			qty = parseInt(qty, 10);
			if (qty > 0) {
				qty = qty + 1;
				qty = (qty < 10) ? ("" + qty) : ("" + qty);
				clickedItem.properties.isAdded = true;
				clickedItem.properties.custQty = qty;
				clickedItem.itemContainer.backgroundColor = itemSelBg;
				// Show Qty Part
				clickedItem.itemActionQtyCont.height = 36;
				clickedItem.itemActionQtyCont.visible = true;
				// Visible Button Part
				clickedItem.itemAddProduct.height = 0;
				clickedItem.itemAddProduct.visible = false;
				// Change Qty
				clickedItem.itemQty.text = qty;
				e.section.updateItemAt(itemIndex, clickedItem);
			}
		} else if (bindId == "itemActionQtyCont" || bindId == "itemQty") {
			var qty = clickedItem.itemQty.text || "0";
			qty = parseInt(qty, 10);
			$.trigger('qtypopup', {
				itemIndex : itemIndex,
				quantity : qty
			});
			// doOpenQtyPopup();
		}
	} catch(ex) {
		Ti.API.debug('Exception on Widget listitem Click ---> ' + ex);
	}
};

function doOpenQtyPopup() {
	var dialog = Ti.UI.createAlertDialog({
		title : 'Enter text',
		style : Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
		buttonNames : ['Toevoegen']
	});
	dialog.addEventListener('click', function(e) {
		Ti.API.info('e.text: ' + e.text);
	});
	dialog.show();
};

/**
 * Widget Initialisation
 */
$.init = function(arg) {
	HEADER_STYLE = arg.header;
	ITEMS_STYLE = arg.items;
	doSetListHeader(arg.header);
	doSetListItems(arg.items);
};

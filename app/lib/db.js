// DATABASE NAME
var DB_NAME = "vocales.db";
// TABLE NAME
var T_NAME_DAS = "vocalesdashboard";
var T_NAME_EMP = "vocalesemployee";
var T_NAME_PLN = "vocalesplan";
var T_NAME_PRD = "vocalesproduct";
var T_NAME_CLI = "vocalesclients";
var T_NAME_DAT = "vocalesdata";
// DASHBOARD TABLE FIELDS
var COL_DAS_ID = "id";
var COL_DAS_DATA = "data";
// EMPLOYEE TABLE FIELDS
var COL_EMP_ID = "id";
var COL_EMP_DATA = "data";
// PLANNING TABLE FIELDS
var COL_PLN_ID = "id";
var COL_PLN_DATA = "data";
// PRODUCT TABLE FIELDS
var COL_PRD_ID = "id";
var COL_PRD_DATA = "data";
// CLIENT TABLE FIELDS
var COL_CLI_ID = "id";
var COL_CLI_DATA = "data";
// DATA TABLE FIELDS
var COL_DAT_ID = "id";
var COL_DAT_DATA = "data";

// Creating table SELF COLLING FUNCTION
(function() {
	var DB = Ti.Database.open(DB_NAME);
	var C_TAB_DAS = "CREATE TABLE IF NOT EXISTS " + T_NAME_DAS + "(" + COL_DAS_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_DAS_DATA + " TEXT NOT NULL);";
	var C_TAB_EMP = "CREATE TABLE IF NOT EXISTS " + T_NAME_EMP + "(" + COL_EMP_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_EMP_DATA + " TEXT NOT NULL);";
	var C_TAB_PLN = "CREATE TABLE IF NOT EXISTS " + T_NAME_PLN + "(" + COL_PLN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_PLN_DATA + " TEXT NOT NULL);";
	var C_TAB_PRD = "CREATE TABLE IF NOT EXISTS " + T_NAME_PRD + "(" + COL_PRD_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_PRD_DATA + " TEXT NOT NULL);";
	var C_TAB_CLI = "CREATE TABLE IF NOT EXISTS " + T_NAME_CLI + "(" + COL_CLI_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_CLI_DATA + " TEXT NOT NULL);";
	var C_TAB_DAT = "CREATE TABLE IF NOT EXISTS " + T_NAME_DAT + "(" + COL_DAT_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " + COL_DAT_DATA + " TEXT NOT NULL);";

	DB.execute(C_TAB_DAS);
	DB.execute(C_TAB_EMP);
	DB.execute(C_TAB_PLN);
	DB.execute(C_TAB_PRD);
	DB.execute(C_TAB_CLI);
	DB.execute(C_TAB_DAT);

	DB.close();
	DB = null;
})();

/**
 * Dashboard table functions
 */
exports.DAS = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_DAS);
		DB.close();
		DB = null;
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_DAS);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_DAS_DATA);
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_DAS + "(" + COL_DAS_DATA  +") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	}
};

/**
 * Employee table functions
 */
exports.EMP = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_EMP);
		DB.close();
		DB = null;
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_EMP);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_EMP_DATA);
				
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_EMP + "(" + COL_EMP_DATA + ") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	}
};

/**
 * Planning table functions
 */
exports.PLN = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_PLN);
		DB.close();
		DB = null;
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_PLN);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_PLN_DATA);
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_PLN + "(" + COL_PLN_DATA + ") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	}
};

/**
 * Product table functions
 */
exports.PRD = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_PRD);
		DB.close();
		DB = null;
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_PRD);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_PRD_DATA);
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_PRD + "(" + COL_PRD_DATA + ") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	}
};

/**
 * Clients table functions
 */
exports.CLI = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_CLI);
		DB.close();
		DB = null;
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_CLI);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_CLI_DATA);
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_CLI + "(" + COL_CLI_DATA + ") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	}
};

/**
 * Data table functions
 */
exports.DAT = {
	reset : function() {
		var DB = Ti.Database.open(DB_NAME);
		DB.execute("DELETE FROM " + T_NAME_DAT);
		DB.close();
		DB = null;
	},
	getDataId : function(id) {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_DAT + " WHERE " + COL_DAT_ID + "=" + id);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_DAT_DATA);
				d = Ti.Utils.base64decode(d);
				data.push(JSON.parse(d));
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return (data.length > 0) ? data[0] : {};
	},
	getData : function() {
		var data = [];
		var DB = Ti.Database.open(DB_NAME);
		var RS = DB.execute("SELECT * FROM " + T_NAME_DAT);
		if (RS.rowCount > 0) {
			while (RS.isValidRow()) {
				var d = RS.fieldByName(COL_DAT_DATA);
				var i = RS.fieldByName(COL_DAT_ID);
				d = Ti.Utils.base64decode(d);
				if (d != "{}") {
					data.push({
						id : i,
						data : JSON.parse(d)
					});
				}
				RS.next();
			}
		}
		RS.close();
		RS = null;
		DB.close();
		DB = null;
		return data;
	},
	setData : function(data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var INSERT = "INSERT INTO " + T_NAME_DAT + "(" + COL_DAT_DATA + ") VALUES ('" + data + "');";
		DB.execute(INSERT);
		DB.close();
		DB = null;
	},
	removeItem : function(id) {
		var DB = Ti.Database.open(DB_NAME);
		var DELETE = "DELETE FROM " + T_NAME_DAT + " WHERE " + COL_DAT_ID + "=" + id;
		DB.execute(DELETE);
		DB.close();
		DB = null;
	},
	updateItem : function(id, data) {
		data = Ti.Utils.base64encode(JSON.stringify(data));
		var DB = Ti.Database.open(DB_NAME);
		var UPDATE = "UPDATE " + T_NAME_DAT + " SET " + COL_DAT_DATA + "='" + data + "' WHERE " + COL_DAT_ID + "=" + id;
		DB.execute(UPDATE);
		DB.close();
		DB = null;
	}
}; 
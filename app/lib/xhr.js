// Create the cache manager (a shared object)
var cacheManager = Titanium.App.Properties.getObject("cachedXHRDocuments", {});

XHR = function() {
};

// Public functions
// ================

// GET
// @url (string) URL to fetch
// @onSuccess (function) success callback
// @onError (function) error callback
// @extraParams (object)
XHR.prototype.get = function(url, onSuccess, onError, extraParams) {
    // Debug
    // Create some default params
    var onSuccess = onSuccess ||
    function() {
    };
    var onError = onError ||
    function() {
    };
    var extraParams = extraParams || {};
    extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
    extraParams.ttl = extraParams.ttl || false;
    extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
    // if you set this to true, pass "username" and "password" as well
    extraParams.contentType = extraParams.contentType || "application/json";

    var cache = readCache(url);
    // If there is nothing cached, send the request
    if (!extraParams.ttl || cache == 0) {

        // Create the HTTP connection
        var xhr = Titanium.Network.createHTTPClient({
            enableKeepAlive : false
        });
        // Create the result object
        var result = {};

        // Open the HTTP connection
        xhr.open("GET", url, extraParams.async);
        xhr.setRequestHeader('Content-Type', extraParams.contentType);

        // If we need to authenticate
        if (extraParams.shouldAuthenticate) {
            var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
            xhr.setRequestHeader('Authorization', authstr);
        }

        // When the connection was successful
        xhr.onload = function() {
            // Check the status of this
            result.status = xhr.status == 200 ? "ok" : xhr.status;

            // Check the type of content we should serve back to the user
            if (extraParams.contentType.indexOf("application/json") != -1) {
                result.data = xhr.responseText;
            } else if (extraParams.contentType.indexOf("text/xml") != -1) {
                result.data = xhr.responseXML;
            } else {
                result.data = xhr.responseData;
            }

            onSuccess(result.data);

            // Cache this response
            writeCache(result.data, url, extraParams.ttl);
        };

        // When there was an error
        xhr.onerror = function(e) {
            // Check the status of this
            result.status = "error";
            result.data = e;
            result.code = xhr.status;
            onError(result);
        };

        xhr.send();
    } else {
        var result = {};

        result.status = "cache";
        result.data = cache;

        onSuccess(result);
    }
};

// POST requests
// @url (string) URL to fetch
// @data (object)
// @onSuccess (function) success callback
// @onError (function) error callback
// @extraParams (object)
XHR.prototype.post = function(url, data, onSuccess, onError, extraParams) {

    // Debug
    // Create some default params
    var onSuccess = onSuccess ||
    function() {
    };
    var onError = onError ||
    function() {
    };
    var extraParams = extraParams || {};
    extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
    extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
    // if you set this to true, pass "username" and "password" as well
    if (!extraParams.hasOwnProperty('enctype')) {
        extraParams.contentType = extraParams.contentType || "application/json";
    }

    // Create the HTTP connection
    var xhr = Titanium.Network.createHTTPClient({
        enableKeepAlive : false
    });
    // Create the result object
    var result = {};

    // Open the HTTP connection
    xhr.open("POST", url, extraParams.async);
    if (extraParams.hasOwnProperty('enctype')) {
        xhr.setRequestHeader('enctype', extraParams.enctype);
    } else {
        xhr.setRequestHeader('Content-Type', extraParams.contentType);
    }
    // If we need to authenticate
    if (extraParams.shouldAuthenticate) {
        var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
        xhr.setRequestHeader('Authorization', authstr);
    }

    // When the connection was successful
    xhr.onload = function() {
        // Check the status of this
        result.status = xhr.status == 200 ? "ok" : xhr.status;
        result.data = xhr.responseText;
        if (onSuccess) {
            onSuccess(result.data);
        }
    };

    // When there was an error
    xhr.onerror = function(e) {
        // Check the status of this
        result.status = "error";
        result.data = e.error;
        result.code = xhr.status;
        if (onError) {
            onError(result);
        }
    };

    // Set Push Data
    data.devicetype = Ti.App.Properties.getString('device_type') || "";
    data.osversion = Ti.App.Properties.getString('os_version') || "";
    data.devicemodel = Ti.App.Properties.getString('device_model') || "";
    data.pushid = Ti.App.Properties.getString('push_id') || "";
    Ti.API.warn('POST REQUEST DATA ----> ' + JSON.stringify(data))
    xhr.send(data);
};

// PUT requests
// @url (string) URL to fetch
// @data (object)
// @onSuccess (function) success callback
// @onError (function) error callback
// @extraParams (object)
XHR.prototype.put = function(url, data, onSuccess, onError, extraParams) {
    // Create some default params
    var onSuccess = onSuccess ||
    function() {
    };
    var onError = onError ||
    function() {
    };
    var extraParams = extraParams || {};
    extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
    extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
    // if you set this to true, pass "username" and "password" as well
    extraParams.contentType = extraParams.contentType || "application/json";

    // Create the HTTP connection
    var xhr = Titanium.Network.createHTTPClient({
        enableKeepAlive : false
    });
    // Create the result object
    var result = {};

    // Open the HTTP connection
    xhr.open("PUT", url, extraParams.async);
    xhr.setRequestHeader('Content-Type', extraParams.contentType);

    // If we need to authenticate
    if (extraParams.shouldAuthenticate) {
        var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
        xhr.setRequestHeader('Authorization', authstr);
    }

    // When the connection was successful
    xhr.onload = function() {
        // Check the status of this
        result.status = xhr.status == 200 ? "ok" : xhr.status;
        result.data = xhr.responseText;

        onSuccess(result);
    };

    // When there was an error
    xhr.onerror = function(e) {
        // Check the status of this
        result.status = "error";
        result.data = e.error;
        result.code = xhr.status;
        onError(result);
    };

    xhr.send(data);
};

// DELETE requests
// @url (string) URL to fetch
// @onSuccess (function) success callback
// @onError (function) error callback
// @extraParams (object)
XHR.prototype.destroy = function(url, onSuccess, onError, extraParams) {
    // Debug

    // Create some default params
    var onSuccess = onSuccess ||
    function() {
    };
    var onError = onError ||
    function() {
    };
    var extraParams = extraParams || {};
    extraParams.async = (extraParams.hasOwnProperty('async')) ? extraParams.async : true;
    extraParams.shouldAuthenticate = extraParams.shouldAuthenticate || false;
    // if you set this to true, pass "username" and "password" as well
    extraParams.contentType = extraParams.contentType || "application/json";

    // Create the HTTP connection
    var xhr = Titanium.Network.createHTTPClient({
        enableKeepAlive : false
    });
    // Create the result object
    var result = {};

    // Open the HTTP connection
    xhr.open("DELETE", url, extraParams.async);
    xhr.setRequestHeader('Content-Type', extraParams.contentType);

    // If we need to authenticate
    if (extraParams.shouldAuthenticate) {
        var authstr = 'Basic ' + Titanium.Utils.base64encode(extraParams.username + ':' + extraParams.password);
        xhr.setRequestHeader('Authorization', authstr);
    }

    // When the connection was successful
    xhr.onload = function() {
        // Check the status of this
        result.status = xhr.status == 200 ? "ok" : xhr.status;
        result.data = xhr.responseText;

        onSuccess(result);
    };

    // When there was an error
    xhr.onerror = function(e) {
        // Check the status of this
        result.status = "error";
        result.data = e.error;
        result.code = xhr.status;
        onError(result);
    };

    xhr.send();
};

// Helper functions
// =================

// Removes the cached content of a given URL (this is useful if you are not satisfied with the data returned that time)
XHR.prototype.clear = function(url) {

    if (url) {
        // Hash the URL
        var hashedURL = Titanium.Utils.md5HexDigest(url);
        // Check if the file exists in the manager
        var cache = cacheManager[hashedURL];

        // If the file was found
        if (cache) {
            // Delete references and file
            var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);
            // Delete the record and file
            delete cacheManager[hashedURL];
            file.deleteFile();

            // Update the cache manager
            updateCacheManager();

        }
    }

};

// Removes all the expired documents from the manager and the file system
XHR.prototype.clean = function() {

    var nowInMilliseconds = new Date().getTime();
    var expiredDocuments = 0;

    for (var key in cacheManager) {
        var cache = cacheManager[key];

        if (cache.timestamp <= nowInMilliseconds) {
            // Delete references and file
            var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, key);
            // Delete the record and file
            delete cacheManager[key];
            file.deleteFile();

            // Update the cache manager
            updateCacheManager();

            // Update the deleted documents count
            expiredDocuments = expiredDocuments + 1;

        }

    }

    // Return the number of files deleted
    return expiredDocuments;
};

// Removes all documents from the manager and the file system
XHR.prototype.purge = function() {

    var purgedDocuments = 0;

    for (var key in cacheManager) {
        var cache = cacheManager[key];
        // Delete references and file
        var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, key);
        // Delete the record and file
        delete cacheManager[key];
        file.deleteFile();

        // Update the cache manager
        updateCacheManager();

        // Update the deleted documents count
        purgedDocuments = purgedDocuments + 1;


    }

    // Return the number of files deleted
    return purgedDocuments;
};

// Private functions
// =================

readCache = function(url) {
    // Hash the URL
    var hashedURL = Titanium.Utils.md5HexDigest(url);

    // Check if the file exists in the manager
    var cache = cacheManager[hashedURL];
    // Default the return value to false
    var result = false;


    // If the file was found
    if (cache) {
        // Fetch a reference to the cache file
        var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);

        // Check that the TTL is further than the current date
        if (cache.timestamp >= new Date().getTime()) {

            // Return the content of the file
            result = file.read();

        } else {

            // Delete the record and file
            delete cacheManager[hashedURL];
            file.deleteFile();

            // Update the cache manager
            updateCacheManager();
        }
    } else {
    }

    return result;
};

updateCacheManager = function() {
    Titanium.App.Properties.setObject("cachedXHRDocuments", cacheManager);
};

writeCache = function(data, url, ttl) {


    // hash the url
    var hashedURL = Titanium.Utils.md5HexDigest(url);

    // Write the file to the disk
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, hashedURL);

    // Write the file to the disk
    // below always return false when dealing with binary files
    file.write(data);

    // Insert the cached object in the cache manager
    cacheManager[hashedURL] = {
        "timestamp" : (new Date().getTime()) + (ttl * 60 * 1000)
    };
    updateCacheManager();

};

// Return everything
module.exports = XHR;

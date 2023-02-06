/**
 * Function to create string into chunks based on size
 * @param str String we need to delived into string
 * @param n Total pieace we need to create
 */
exports.convertIntoChunks0 = function(str, n) {
	var numChunks = Math.ceil(str.length / n);
	var chunks = [];

	for (var i = 0,
	    o = 0; i < numChunks; ++i, o += n) {
		chunks[i] = str.substr(o, n);
		console.log(chunks[i]);
	}
	console.log(chunks.length);
	return chunks;
};
exports.convertIntoChunks = function(string, chunkLength) {
	// var a = string.match(new RegExp('.{1,' + chunkLength + '}', 'g'));
	var a = string.split(new RegExp('/(.{' + chunkLength + '})/'));
	// for (var i = 0; i < a.length; i++) {
		// if (i % 2 == 0) {
			// Ti.API.info(a[i]);
		// } else {
			// Ti.API.error(a[i]);
		// }
	// };
	// Ti.API.info(a.length);
	return a;
};

/**
 * Function to merge array into string
 * @param array Need to convert this array into string
 * @return String value
 */
exports.convertIntoString = function(array) {
	var s1 = "";
	if (array && array.length > 0) {
		array.forEach(function(i1) {
			s1 += i1.toString();
		});
	}
	return s1;
};

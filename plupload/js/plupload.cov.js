if (typeof __$coverObject === "undefined"){
	if (typeof window !== "undefined") window.__$coverObject = {};
	else if (typeof global !== "undefined") global.__$coverObject = {};
	else throw new Error("cannot find the global scope");
}
var __$coverInit = function(name, code){
	if (!__$coverObject[name]) __$coverObject[name] = {__code: code};
};
var __$coverInitRange = function(name, range){
	if (!__$coverObject[name][range]) __$coverObject[name][range] = 0;
};
var __$coverCall = function(name, range){
	__$coverObject[name][range]++;
};
__$coverInit("Plupload", "/**\n * Plupload.js\n *\n * Copyright 2013, Moxiecode Systems AB\n * Released under GPL License.\n *\n * License: http://www.plupload.com/license\n * Contributing: http://www.plupload.com/contributing\n */\n\n/*global mOxie:true */\n\n;(function(window, o, undef) {\n\nvar delay = window.setTimeout\n, fileFilters = {}\n;\n\n// convert plupload features to caps acceptable by mOxie\nfunction normalizeCaps(settings) {\t\t\n\tvar features = settings.required_features, caps = {};\n\n\tfunction resolve(feature, value, strict) {\n\t\t// Feature notation is deprecated, use caps (this thing here is required for backward compatibility)\n\t\tvar map = { \n\t\t\tchunks: 'slice_blob',\n\t\t\tresize: 'send_binary_string',\n\t\t\tjpgresize: 'send_binary_string',\n\t\t\tpngresize: 'send_binary_string',\n\t\t\tprogress: 'report_upload_progress',\n\t\t\tmulti_selection: 'select_multiple',\n\t\t\tmax_file_size: 'access_binary',\n\t\t\tdragdrop: 'drag_and_drop',\n\t\t\tdrop_element: 'drag_and_drop',\n\t\t\theaders: 'send_custom_headers',\n\t\t\tcanSendBinary: 'send_binary',\n\t\t\ttriggerDialog: 'summon_file_dialog'\n\t\t};\n\n\t\tif (map[feature]) {\n\t\t\tcaps[map[feature]] = value;\n\t\t} else if (!strict) {\n\t\t\tcaps[feature] = value;\n\t\t}\n\t}\n\n\tif (typeof(features) === 'string') {\n\t\tplupload.each(features.split(/\\s*,\\s*/), function(feature) {\n\t\t\tresolve(feature, true);\n\t\t});\n\t} else if (typeof(features) === 'object') {\n\t\tplupload.each(features, function(value, feature) {\n\t\t\tresolve(feature, value);\n\t\t});\n\t} else if (features === true) {\n\t\t// check settings for required features\n\t\tif (!settings.multipart) { // special care for multipart: false\n\t\t\tcaps.send_binary_string = true;\n\t\t}\n\n\t\tif (settings.chunk_size > 0) {\n\t\t\tcaps.slice_blob = true;\n\t\t}\n\t\t\n\t\tplupload.each(settings, function(value, feature) {\n\t\t\tresolve(feature, !!value, true); // strict check\n\t\t});\n\t}\n\t\n\treturn caps;\n}\n\n/** \n * @module plupload\t\n * @static\n */\nvar plupload = {\n\t/**\n\t * Plupload version will be replaced on build.\n\t *\n\t * @property VERSION\n\t * @for Plupload\n\t * @static\n\t * @final\n\t */\n\tVERSION : '@@version@@',\n\n\t/**\n\t * Inital state of the queue and also the state ones it's finished all it's uploads.\n\t *\n\t * @property STOPPED\n\t * @static\n\t * @final\n\t */\n\tSTOPPED : 1,\n\n\t/**\n\t * Upload process is running\n\t *\n\t * @property STARTED\n\t * @static\n\t * @final\n\t */\n\tSTARTED : 2,\n\n\t/**\n\t * File is queued for upload\n\t *\n\t * @property QUEUED\n\t * @static\n\t * @final\n\t */\n\tQUEUED : 1,\n\n\t/**\n\t * File is being uploaded\n\t *\n\t * @property UPLOADING\n\t * @static\n\t * @final\n\t */\n\tUPLOADING : 2,\n\n\t/**\n\t * File has failed to be uploaded\n\t *\n\t * @property FAILED\n\t * @static\n\t * @final\n\t */\n\tFAILED : 4,\n\n\t/**\n\t * File has been uploaded successfully\n\t *\n\t * @property DONE\n\t * @static\n\t * @final\n\t */\n\tDONE : 5,\n\n\t// Error constants used by the Error event\n\n\t/**\n\t * Generic error for example if an exception is thrown inside Silverlight.\n\t *\n\t * @property GENERIC_ERROR\n\t * @static\n\t * @final\n\t */\n\tGENERIC_ERROR : -100,\n\n\t/**\n\t * HTTP transport error. For example if the server produces a HTTP status other than 200.\n\t *\n\t * @property HTTP_ERROR\n\t * @static\n\t * @final\n\t */\n\tHTTP_ERROR : -200,\n\n\t/**\n\t * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.\n\t *\n\t * @property IO_ERROR\n\t * @static\n\t * @final\n\t */\n\tIO_ERROR : -300,\n\n\t/**\n\t * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.\n\t *\n\t * @property SECURITY_ERROR\n\t * @static\n\t * @final\n\t */\n\tSECURITY_ERROR : -400,\n\n\t/**\n\t * Initialization error. Will be triggered if no runtime was initialized.\n\t *\n\t * @property INIT_ERROR\n\t * @static\n\t * @final\n\t */\n\tINIT_ERROR : -500,\n\n\t/**\n\t * File size error. If the user selects a file that is too large it will be blocked and an error of this type will be triggered.\n\t *\n\t * @property FILE_SIZE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_SIZE_ERROR : -600,\n\n\t/**\n\t * File extension error. If the user selects a file that isn't valid according to the filters setting.\n\t *\n\t * @property FILE_EXTENSION_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_EXTENSION_ERROR : -601,\n\n\t/**\n\t * Duplicate file error. If prevent_duplicates is set to true and user selects the same file again.\n\t *\n\t * @property FILE_DUPLICATE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_DUPLICATE_ERROR : -602,\n\n\t/**\n\t * Runtime will try to detect if image is proper one. Otherwise will throw this error.\n\t *\n\t * @property IMAGE_FORMAT_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_FORMAT_ERROR : -700,\n\n\t/**\n\t * While working on the image runtime will try to detect if the operation may potentially run out of memeory and will throw this error.\n\t *\n\t * @property IMAGE_MEMORY_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_MEMORY_ERROR : -701,\n\n\t/**\n\t * Each runtime has an upper limit on a dimension of the image it can handle. If bigger, will throw this error.\n\t *\n\t * @property IMAGE_DIMENSIONS_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_DIMENSIONS_ERROR : -702,\n\n\t/**\n\t * Mime type lookup table.\n\t *\n\t * @property mimeTypes\n\t * @type Object\n\t * @final\n\t */\n\tmimeTypes : o.mimes,\n\n\t/**\n\t * In some cases sniffing is the only way around :(\n\t */\n\tua: o.ua,\n\n\t/**\n\t * Gets the true type of the built-in object (better version of typeof).\n\t * @credits Angus Croll (http://javascriptweblog.wordpress.com/)\n\t *\n\t * @method typeOf\n\t * @static\n\t * @param {Object} o Object to check.\n\t * @return {String} Object [[Class]]\n\t */\n\ttypeOf: o.typeOf,\n\n\t/**\n\t * Extends the specified object with another object.\n\t *\n\t * @method extend\n\t * @static\n\t * @param {Object} target Object to extend.\n\t * @param {Object..} obj Multiple objects to extend with.\n\t * @return {Object} Same as target, the extended object.\n\t */\n\textend : o.extend,\n\n\t/**\n\t * Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.\n\t * The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages\n\t * to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.\n\t * It's more probable for the earth to be hit with an ansteriod. You can also if you want to be 100% sure set the plupload.guidPrefix property\n\t * to an user unique key.\n\t *\n\t * @method guid\n\t * @static\n\t * @return {String} Virtually unique id.\n\t */\n\tguid : o.guid,\n\n\t/**\n\t * Executes the callback function for each item in array/object. If you return false in the\n\t * callback it will break the loop.\n\t *\n\t * @method each\n\t * @static\n\t * @param {Object} obj Object to iterate.\n\t * @param {function} callback Callback function to execute for each item.\n\t */\n\teach : o.each,\n\n\t/**\n\t * Returns the absolute x, y position of an Element. The position will be returned in a object with x, y fields.\n\t *\n\t * @method getPos\n\t * @static\n\t * @param {Element} node HTML element or element id to get x, y position from.\n\t * @param {Element} root Optional root element to stop calculations at.\n\t * @return {object} Absolute position of the specified element object with x, y fields.\n\t */\n\tgetPos : o.getPos,\n\n\t/**\n\t * Returns the size of the specified node in pixels.\n\t *\n\t * @method getSize\n\t * @static\n\t * @param {Node} node Node to get the size of.\n\t * @return {Object} Object with a w and h property.\n\t */\n\tgetSize : o.getSize,\n\n\t/**\n\t * Encodes the specified string.\n\t *\n\t * @method xmlEncode\n\t * @static\n\t * @param {String} s String to encode.\n\t * @return {String} Encoded string.\n\t */\n\txmlEncode : function(str) {\n\t\tvar xmlEncodeChars = {'<' : 'lt', '>' : 'gt', '&' : 'amp', '\"' : 'quot', '\\'' : '#39'}, xmlEncodeRegExp = /[<>&\\\"\\']/g;\n\n\t\treturn str ? ('' + str).replace(xmlEncodeRegExp, function(chr) {\n\t\t\treturn xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;\n\t\t}) : str;\n\t},\n\n\t/**\n\t * Forces anything into an array.\n\t *\n\t * @method toArray\n\t * @static\n\t * @param {Object} obj Object with length field.\n\t * @return {Array} Array object containing all items.\n\t */\n\ttoArray : o.toArray,\n\n\t/**\n\t * Find an element in array and return it's index if present, otherwise return -1.\n\t *\n\t * @method inArray\n\t * @static\n\t * @param {mixed} needle Element to find\n\t * @param {Array} array\n\t * @return {Int} Index of the element, or -1 if not found\n\t */\n\tinArray : o.inArray,\n\n\t/**\n\t * Extends the language pack object with new items.\n\t *\n\t * @method addI18n\n\t * @static\n\t * @param {Object} pack Language pack items to add.\n\t * @return {Object} Extended language pack object.\n\t */\n\taddI18n : o.addI18n,\n\n\t/**\n\t * Translates the specified string by checking for the english string in the language pack lookup.\n\t *\n\t * @method translate\n\t * @static\n\t * @param {String} str String to look for.\n\t * @return {String} Translated string or the input string if it wasn't found.\n\t */\n\ttranslate : o.translate,\n\n\t/**\n\t * Checks if object is empty.\n\t *\n\t * @method isEmptyObj\n\t * @static\n\t * @param {Object} obj Object to check.\n\t * @return {Boolean}\n\t */\n\tisEmptyObj : o.isEmptyObj,\n\n\t/**\n\t * Checks if specified DOM element has specified class.\n\t *\n\t * @method hasClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\thasClass : o.hasClass,\n\n\t/**\n\t * Adds specified className to specified DOM element.\n\t *\n\t * @method addClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\taddClass : o.addClass,\n\n\t/**\n\t * Removes specified className from specified DOM element.\n\t *\n\t * @method removeClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\tremoveClass : o.removeClass,\n\n\t/**\n\t * Returns a given computed style of a DOM element.\n\t *\n\t * @method getStyle\n\t * @static\n\t * @param {Object} obj DOM element like object.\n\t * @param {String} name Style you want to get from the DOM element\n\t */\n\tgetStyle : o.getStyle,\n\n\t/**\n\t * Adds an event handler to the specified object and store reference to the handler\n\t * in objects internal Plupload registry (@see removeEvent).\n\t *\n\t * @method addEvent\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Name to add event listener to.\n\t * @param {Function} callback Function to call when event occurs.\n\t * @param {String} (optional) key that might be used to add specifity to the event record.\n\t */\n\taddEvent : o.addEvent,\n\n\t/**\n\t * Remove event handler from the specified object. If third argument (callback)\n\t * is not specified remove all events with the specified name.\n\t *\n\t * @method removeEvent\n\t * @static\n\t * @param {Object} obj DOM element to remove event listener(s) from.\n\t * @param {String} name Name of event listener to remove.\n\t * @param {Function|String} (optional) might be a callback or unique key to match.\n\t */\n\tremoveEvent: o.removeEvent,\n\n\t/**\n\t * Remove all kind of events from the specified object\n\t *\n\t * @method removeAllEvents\n\t * @static\n\t * @param {Object} obj DOM element to remove event listeners from.\n\t * @param {String} (optional) unique key to match, when removing events.\n\t */\n\tremoveAllEvents: o.removeAllEvents,\n\n\t/**\n\t * Cleans the specified name from national characters (diacritics). The result will be a name with only a-z, 0-9 and _.\n\t *\n\t * @method cleanName\n\t * @static\n\t * @param {String} s String to clean up.\n\t * @return {String} Cleaned string.\n\t */\n\tcleanName : function(name) {\n\t\tvar i, lookup;\n\n\t\t// Replace diacritics\n\t\tlookup = [\n\t\t\t/[\\300-\\306]/g, 'A', /[\\340-\\346]/g, 'a',\n\t\t\t/\\307/g, 'C', /\\347/g, 'c',\n\t\t\t/[\\310-\\313]/g, 'E', /[\\350-\\353]/g, 'e',\n\t\t\t/[\\314-\\317]/g, 'I', /[\\354-\\357]/g, 'i',\n\t\t\t/\\321/g, 'N', /\\361/g, 'n',\n\t\t\t/[\\322-\\330]/g, 'O', /[\\362-\\370]/g, 'o',\n\t\t\t/[\\331-\\334]/g, 'U', /[\\371-\\374]/g, 'u'\n\t\t];\n\n\t\tfor (i = 0; i < lookup.length; i += 2) {\n\t\t\tname = name.replace(lookup[i], lookup[i + 1]);\n\t\t}\n\n\t\t// Replace whitespace\n\t\tname = name.replace(/\\s+/g, '_');\n\n\t\t// Remove anything else\n\t\tname = name.replace(/[^a-z0-9_\\-\\.]+/gi, '');\n\n\t\treturn name;\n\t},\n\n\t/**\n\t * Builds a full url out of a base URL and an object with items to append as query string items.\n\t *\n\t * @method buildUrl\n\t * @static\n\t * @param {String} url Base URL to append query string items to.\n\t * @param {Object} items Name/value object to serialize as a querystring.\n\t * @return {String} String with url + serialized query string items.\n\t */\n\tbuildUrl : function(url, items) {\n\t\tvar query = '';\n\n\t\tplupload.each(items, function(value, name) {\n\t\t\tquery += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);\n\t\t});\n\n\t\tif (query) {\n\t\t\turl += (url.indexOf('?') > 0 ? '&' : '?') + query;\n\t\t}\n\n\t\treturn url;\n\t},\n\n\t/**\n\t * Formats the specified number as a size string for example 1024 becomes 1 KB.\n\t *\n\t * @method formatSize\n\t * @static\n\t * @param {Number} size Size to format as string.\n\t * @return {String} Formatted size string.\n\t */\n\tformatSize : function(size) {\n\t\tif (size === undef || /\\D/.test(size)) {\n\t\t\treturn plupload.translate('N/A');\n\t\t}\n\n\t\t// TB\n\t\tif (size > 1099511627776) {\n\t\t\treturn Math.round(size / 1099511627776, 1) + \" \" + plupload.translate('tb');\n\t\t}\n\n\t\t// GB\n\t\tif (size > 1073741824) {\n\t\t\treturn Math.round(size / 1073741824, 1) + \" \" + plupload.translate('gb');\n\t\t}\n\n\t\t// MB\n\t\tif (size > 1048576) {\n\t\t\treturn Math.round(size / 1048576, 1) + \" \" + plupload.translate('mb');\n\t\t}\n\n\t\t// KB\n\t\tif (size > 1024) {\n\t\t\treturn Math.round(size / 1024, 1) + \" \" + plupload.translate('kb');\n\t\t}\n\n\t\treturn size + \" \" + plupload.translate('b');\n\t},\n\n\n\t/**\n\t * Parses the specified size string into a byte value. For example 10kb becomes 10240.\n\t *\n\t * @method parseSize\n\t * @static\n\t * @param {String|Number} size String to parse or number to just pass through.\n\t * @return {Number} Size in bytes.\n\t */\n\tparseSize : o.parseSizeStr,\n\n\n\t/**\n\t * A way to predict what runtime will be choosen in the current environment with the\n\t * specified settings.\n\t *\n\t * @method predictRuntime\n\t * @static\n\t * @param {Object|String} config Plupload settings to check\n\t * @param {String} [runtimes] Comma-separated list of runtimes to check against\n\t * @return {String} Type of compatible runtime\n\t */\n\tpredictRuntime : function(config, runtimes) {\n\t\tvar up, runtime; \n\t\tif (runtimes) {\n\t\t\tconfig.runtimes = runtimes;\n\t\t}\n\t\tup = new plupload.Uploader(config);\n\t\truntime = up.runtime;\n\t\tup.destroy();\n\t\treturn runtime;\n\t},\n\n\t/**\n\t * Registers a filter that will be executed for each file added to the queue.\n\t * If callback returns false, file will not be added.\n\t *\n\t * Callback receives two arguments: a value for the filter as it was specified in settings.filters\n\t * and a file to be filtered. Callback is executed in the context of uploader instance.\n\t *\n\t * @method addFileFilter\n\t * @static\n\t * @param {String} name Name of the filter by which it can be referenced in settings.filters\n\t * @param {String} cb Callback - the actual routine that every added file must pass\n\t */\n\taddFileFilter: function(name, cb) {\n\t\tfileFilters[name] = cb;\n\t}\n};\n\n\nplupload.addFileFilter('mime_types', (function() {\n\tvar _filters, _extRegExp;\n\n\t// Convert extensions to regexp\n\tfunction getExtRegExp(filters) {\n\t\tvar extensionsRegExp = [];\n\n\t\tplupload.each(filters, function(filter) {\n\t\t\tplupload.each(filter.extensions.split(/,/), function(ext) {\n\t\t\t\tif (/^\\s*\\*\\s*$/.test(ext)) {\n\t\t\t\t\textensionsRegExp.push('\\\\.*');\n\t\t\t\t} else {\n\t\t\t\t\textensionsRegExp.push('\\\\.' + ext.replace(new RegExp('[' + ('/^$.*+?|()[]{}\\\\'.replace(/./g, '\\\\$&')) + ']', 'g'), '\\\\$&'));\n\t\t\t\t}\n\t\t\t});\n\t\t});\n\n\t\treturn new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');\n\t}\n\n\treturn function(filters, file) {\n\t\tif (!_extRegExp || filters != _filters) { // make sure we do it only once, unless filters got changed\n\t\t\t_extRegExp = getExtRegExp(filters);\n\t\t\t_filters = [].slice.call(filters);\n\t\t}\n\n\t\tif (!_extRegExp.test(file.name)) {\n\t\t\tthis.trigger('Error', {\n\t\t\t\tcode : plupload.FILE_EXTENSION_ERROR,\n\t\t\t\tmessage : plupload.translate('File extension error.'),\n\t\t\t\tfile : file\n\t\t\t});\n\t\t\treturn false;\n\t\t}\n\t\treturn true;\n\t};\n}()));\n\n\nplupload.addFileFilter('max_file_size', function(maxSize, file) {\n\tvar undef;\n\n\t// Invalid file size\n\tif (file.size !== undef && maxSize && file.size > maxSize) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_SIZE_ERROR,\n\t\t\tmessage : plupload.translate('File size error.'),\n\t\t\tfile : file\n\t\t});\n\t\treturn false;\n\t}\n\treturn true;\n});\n\n\nplupload.addFileFilter('prevent_duplicates', function(value, file) {\n\tif (value) {\n\t\tvar ii = this.files.length;\n\t\twhile (ii--) {\n\t\t\t// Compare by name and size (size might be 0 or undefined, but still equivalent for both)\n\t\t\tif (file.name === this.files[ii].name && file.size === this.files[ii].size) {\n\t\t\t\tthis.trigger('Error', {\n\t\t\t\t\tcode : plupload.FILE_DUPLICATE_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Duplicate file error.'),\n\t\t\t\t\tfile : file\n\t\t\t\t});\n\t\t\t\treturn false;\n\t\t\t}\n\t\t}\n\t}\n\treturn true;\n});\n\n\n/**\n@class Uploader\n@constructor\n\n@param {Object} settings For detailed information about each option check documentation.\n\t@param {String|DOMElement} settings.browse_button id of the DOM element or DOM element itself to use as file dialog trigger.\n\t@param {String} settings.url URL of the server-side upload handler.\n\t@param {String} settings.method The method to use when uploading data\n\t@param {Number|String} [settings.chunk_size=0] Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or \"204800b\" or \"200kb\"`. By default - disabled.\n\t@param {String} [settings.container] id of the DOM element to use as a container for uploader structures. Defaults to document.body.\n\t@param {String|DOMElement} [settings.drop_element] id of the DOM element or DOM element itself to use as a drop zone for Drag-n-Drop.\n\t@param {String} [settings.file_data_name=\"file\"] Name for the file field in Multipart formated message.\n\t@param {Array} [settings.filters=[]] Set of file type filters, each one defined by hash of title and extensions. `e.g. {title : \"Image files\", extensions : \"jpg,jpeg,gif,png\"}`. Dispatches `plupload.FILE_EXTENSION_ERROR`\n\t@param {String} [settings.flash_swf_url] URL of the Flash swf.\n\t@param {Object} [settings.headers] Custom headers to send with the upload. Hash of name/value pairs.\n\t@param {Number|String} [settings.max_file_size] Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes. `e.g. \"10mb\" or \"1gb\"`. By default - not set. Dispatches `plupload.FILE_SIZE_ERROR`.\n\t@param {Number} [settings.max_retries=0] How many times to retry the chunk or file, before triggering Error event.\n\t@param {Boolean} [settings.multipart=true] Whether to send file and additional parameters as Multipart formated message.\n\t@param {Object} [settings.multipart_params] Hash of key/value pairs to send with every file upload.\n\t@param {Boolean} [settings.multi_selection=true] Enable ability to select multiple files at once in file dialog.\n\t@param {Boolean} [settings.prevent_duplicates=false] Do not let duplicates into the queue. Dispatches `plupload.FILE_DUPLICATE_ERROR`.\n\t@param {String|Object} [settings.required_features] Either comma-separated list or hash of required features that chosen runtime should absolutely possess.\n\t@param {Object} [settings.resize] Enable resizng of images on client-side. Applies to `image/jpeg` and `image/png` only. `e.g. {width : 200, height : 200, quality : 90, crop: true}`\n\t\t@param {Number} [settings.resize.width] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.height] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.quality=90] Compression quality for jpegs (1-100).\n\t\t@param {Boolean} [settings.resize.crop=false] Whether to crop images to exact dimensions. By default they will be resized proportionally.\n\t@param {String} [settings.runtimes=\"html5,flash,silverlight,html4\"] Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails.\n\t@param {String} [settings.silverlight_xap_url] URL of the Silverlight xap.\n\t@param {Boolean} [settings.unique_names=false] If true will generate unique filenames for uploaded files.\n*/\nplupload.Uploader = function(settings) {\n\t/**\n\t * Fires when the current RunTime has been initialized.\n\t *\n\t * @event Init\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires after the init event incase you need to perform actions there.\n\t *\n\t * @event PostInit\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when the silverlight/flash or other shim needs to move.\n\t *\n\t * @event Refresh\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when the overall state is being changed for the upload queue.\n\t *\n\t * @event StateChanged\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when a file is to be uploaded by the runtime.\n\t *\n\t * @event UploadFile\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\t * Fires when just before a file is uploaded. This event enables you to override settings\n\t * on the uploader instance before the file is uploaded.\n\t *\n\t * @event BeforeUpload\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File to be uploaded.\n\t */\n\t\n\t/**\n\t * Fires when just before a chunk is uploaded. This event enables you to override settings\n\t * on the uploader instance before the chunk is uploaded.\n\t *\n\t * @event BeforeChunkUpload\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\t * Fires when the file queue is changed. In other words when files are added/removed to the files array of the uploader instance.\n\t *\n\t * @event QueueChanged\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires while a file is being uploaded. Use this event to update the current file upload progress.\n\t *\n\t * @event UploadProgress\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that is currently being uploaded.\n\t */\n\n\t/**\n\t * Fires while a file was removed from queue.\n\t *\n\t * @event FilesRemoved\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of files that got removed.\n\t */\n\n\t /**\n\t * Fires while when the user selects files to upload.\n\t *\n\t * @event BeforeAdd\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that is being added to the queue.\n\t */\n\n\t/**\n\t * Fires after files were filtered and added to the queue.\n\t *\n\t * @event FilesAdded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of file objects that were added to queue by the user.\n\t */\n\n\t/**\n\t * Fires when a file is successfully uploaded.\n\t *\n\t * @event FileUploaded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that was uploaded.\n\t * @param {Object} response Object with response properties.\n\t */\n\n\t/**\n\t * Fires when file chunk is uploaded.\n\t *\n\t * @event ChunkUploaded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that the chunk was uploaded for.\n\t * @param {Object} response Object with response properties.\n\t */\n\n\t/**\n\t * Fires when all files in a queue are uploaded.\n\t *\n\t * @event UploadComplete\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of file objects that was added to queue/selected by the user.\n\t */\n\n\t/**\n\t * Fires when a error occurs.\n\t *\n\t * @event Error\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Object} error Contains code, message and sometimes file and other details.\n\t */\n\n\t/**\n\t * Fires when destroy method is called.\n\t *\n\t * @event Destroy\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\tvar files = [], events = {}, required_caps = {},\n\t\tstartTime, total, disabled = false,\n\t\tfileInput, fileDrop, xhr;\n\n\n\t// Private methods\n\tfunction uploadNext() {\n\t\tvar file, count = 0, i;\n\n\t\tif (this.state == plupload.STARTED) {\n\t\t\t// Find first QUEUED file\n\t\t\tfor (i = 0; i < files.length; i++) {\n\t\t\t\tif (!file && files[i].status == plupload.QUEUED) {\n\t\t\t\t\tfile = files[i];\n\t\t\t\t\tif (this.trigger(\"BeforeUpload\", file)) {\n\t\t\t\t\t\tfile.status = plupload.UPLOADING;\n\t\t\t\t\t\tthis.trigger(\"UploadFile\", file);\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tcount++;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t// All files are DONE or FAILED\n\t\t\tif (count == files.length) {\n\t\t\t\tif (this.state !== plupload.STOPPED) {\n\t\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\t\tthis.trigger(\"StateChanged\");\n\t\t\t\t}\n\t\t\t\tthis.trigger(\"UploadComplete\", files);\n\t\t\t}\n\t\t}\n\t}\n\n\tfunction calcFile(file) {\n\t\tfile.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;\n\t\tcalc();\n\t}\n\n\tfunction calc() {\n\t\tvar i, file;\n\n\t\t// Reset stats\n\t\ttotal.reset();\n\n\t\t// Check status, size, loaded etc on all files\n\t\tfor (i = 0; i < files.length; i++) {\n\t\t\tfile = files[i];\n\n\t\t\tif (file.size !== undef) {\n\t\t\t\t// We calculate totals based on original file size\n\t\t\t\ttotal.size += file.origSize;\n\n\t\t\t\t// Since we cannot predict file size after resize, we do opposite and\n\t\t\t\t// interpolate loaded amount to match magnitude of total\n\t\t\t\ttotal.loaded += file.loaded * file.origSize / file.size;\n\t\t\t} else {\n\t\t\t\ttotal.size = undef;\n\t\t\t}\n\n\t\t\tif (file.status == plupload.DONE) {\n\t\t\t\ttotal.uploaded++;\n\t\t\t} else if (file.status == plupload.FAILED) {\n\t\t\t\ttotal.failed++;\n\t\t\t} else {\n\t\t\t\ttotal.queued++;\n\t\t\t}\n\t\t}\n\n\t\t// If we couldn't calculate a total file size then use the number of files to calc percent\n\t\tif (total.size === undef) {\n\t\t\ttotal.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;\n\t\t} else {\n\t\t\ttotal.bytesPerSec = Math.ceil(total.loaded / ((+new Date() - startTime || 1) / 1000.0));\n\t\t\ttotal.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;\n\t\t}\n\t}\n\n\tfunction initControls() {\n\t\tvar self = this, initialized = 0;\n\n\t\t// common settings\n\t\tvar options = {\n\t\t\taccept: settings.filters.mime_types,\n\t\t\truntime_order: settings.runtimes,\n\t\t\trequired_caps: required_caps,\n\t\t\tswf_url: settings.flash_swf_url,\n\t\t\txap_url: settings.silverlight_xap_url\n\t\t};\n\n\t\t// add runtime specific options if any\n\t\tplupload.each(settings.runtimes.split(/\\s*,\\s*/), function(runtime) {\n\t\t\tif (settings[runtime]) {\n\t\t\t\toptions[runtime] = settings[runtime];\n\t\t\t}\n\t\t});\n\n\t\to.inSeries([\n\t\t\tfunction(cb) {\n\t\t\t\t// Initialize file dialog trigger\n\t\t\t\tif (settings.browse_button) {\n\t\t\t\t\tfileInput = new o.FileInput(plupload.extend({}, options, {\n\t\t\t\t\t\tname: settings.file_data_name,\n\t\t\t\t\t\tmultiple: settings.multi_selection,\n\t\t\t\t\t\tcontainer: settings.container,\n\t\t\t\t\t\tbrowse_button: settings.browse_button\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileInput.onready = function() {\n\t\t\t\t\t\tvar info = o.Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\t// for backward compatibility\n\t\t\t\t\t\to.extend(self.features, {\n\t\t\t\t\t\t\tchunks: info.can('slice_blob'),\n\t\t\t\t\t\t\tmultipart: info.can('send_multipart'),\n\t\t\t\t\t\t\tmulti_selection: info.can('select_multiple')\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\tinitialized++;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.onchange = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.bind('mouseenter mouseleave mousedown mouseup', function(e) {\n\t\t\t\t\t\tif (!disabled) {\n\t\t\t\t\t\t\tvar bButton = o.get(settings.browse_button);\n\t\t\t\t\t\t\tif (bButton) {\n\t\t\t\t\t\t\t\tif (settings.browse_button_hover) {\n\t\t\t\t\t\t\t\t\tif ('mouseenter' === e.type) {\n\t\t\t\t\t\t\t\t\t\to.addClass(bButton, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t\t} else if ('mouseleave' === e.type) {\n\t\t\t\t\t\t\t\t\t\to.removeClass(bButton, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\tif (settings.browse_button_active) {\n\t\t\t\t\t\t\t\t\tif ('mousedown' === e.type) {\n\t\t\t\t\t\t\t\t\t\to.addClass(bButton, settings.browse_button_active);\n\t\t\t\t\t\t\t\t\t} else if ('mouseup' === e.type) {\n\t\t\t\t\t\t\t\t\t\to.removeClass(bButton, settings.browse_button_active);\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tbButton = null;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileInput = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.init();\n\t\t\t\t} else {\n\t\t\t\t\tcb();\n\t\t\t\t}\n\t\t\t},\n\n\t\t\tfunction(cb) {\n\t\t\t\t// Initialize drag/drop interface if requested\n\t\t\t\tif (settings.drop_element) {\n\t\t\t\t\tfileDrop = new o.FileDrop(plupload.extend({}, options, {\n\t\t\t\t\t\tdrop_zone: settings.drop_element\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileDrop.onready = function() {\n\t\t\t\t\t\tvar info = o.Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\tself.features.dragdrop = info.can('drag_and_drop');\n\n\t\t\t\t\t\tinitialized++;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.ondrop = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileDrop = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileDrop.init();\n\t\t\t\t} else {\n\t\t\t\t\tcb();\n\t\t\t\t}\n\t\t\t}\n\t\t],\n\t\tfunction() {\n\t\t\tif (typeof(settings.init) == \"function\") {\n\t\t\t\tsettings.init(self);\n\t\t\t} else {\n\t\t\t\tplupload.each(settings.init, function(func, name) {\n\t\t\t\t\tself.bind(name, func);\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tif (initialized) {\n\t\t\t\tself.trigger('PostInit');\n\t\t\t} else {\n\t\t\t\tself.trigger('Error', {\n\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t});\n\t\t\t}\n\t\t});\n\t}\n\n\tfunction runtimeCan(file, cap) {\n\t\tif (file.ruid) {\n\t\t\tvar info = o.Runtime.getInfo(file.ruid);\n\t\t\tif (info) {\n\t\t\t\treturn info.can(cap);\n\t\t\t}\n\t\t}\n\t\treturn false;\n\t}\n\n\tfunction resizeImage(blob, params, cb) {\n\t\tvar img = new o.Image();\n\n\t\ttry {\n\t\t\timg.onload = function() {\n\t\t\t\timg.downsize(params.width, params.height, params.crop, params.preserve_headers);\n\t\t\t};\n\n\t\t\timg.onresize = function() {\n\t\t\t\tcb(this.getAsBlob(blob.type, params.quality));\n\t\t\t\tthis.destroy();\n\t\t\t};\n\n\t\t\timg.onerror = function() {\n\t\t\t\tcb(blob);\n\t\t\t};\n\n\t\t\timg.load(blob);\n\t\t} catch(ex) {\n\t\t\tcb(blob);\n\t\t}\n\t}\n\n\n\t// Inital total state\n\ttotal = new plupload.QueueProgress();\n\n\t// Default settings\n\tsettings = plupload.extend({\n\t\truntimes: o.Runtime.order,\n\t\tmax_retries: 0,\n\t\tmultipart : true,\n\t\tmulti_selection : true,\n\t\tfile_data_name : 'file',\n\t\tflash_swf_url : 'js/Moxie.swf',\n\t\tsilverlight_xap_url : 'js/Moxie.xap',\n\t\tsend_chunk_number: true, // whether to send chunks and chunk numbers, or total and offset bytes\n\t\tmethod : 'post'\n\t}, settings);\n\n\t// Resize defaults\n\tif (settings.resize) {\n\t\tsettings.resize = plupload.extend({\n\t\t\tpreserve_headers: true,\n\t\t\tcrop: false\n\t\t}, settings.resize);\n\t}\n\n\t// Convert settings\n\tsettings.chunk_size = plupload.parseSize(settings.chunk_size) || 0;\n\n\t// Set file filters\n\tif (plupload.typeOf(settings.filters) === 'array') {\n\t\tsettings.filters = {\n\t\t\tmime_types: settings.filters\n\t\t};\n\t}\n\tsettings.filters = plupload.extend({\n\t\tmime_types: [],\n\t\tprevent_duplicates: !!settings.prevent_duplicates,\n\t\tmax_file_size: plupload.parseSize(settings.max_file_size) || 0\n\t}, settings.filters);\n\n\t\n\tsettings.required_features = required_caps = normalizeCaps(plupload.extend({}, settings));\n\n\n\t// Add public methods\n\tplupload.extend(this, {\n\n\t\t/**\n\t\t * Unique id for the Uploader instance.\n\t\t *\n\t\t * @property id\n\t\t * @type String\n\t\t */\n\t\tid : plupload.guid(),\n\n\t\t/**\n\t\t * Current state of the total uploading progress. This one can either be plupload.STARTED or plupload.STOPPED.\n\t\t * These states are controlled by the stop/start methods. The default value is STOPPED.\n\t\t *\n\t\t * @property state\n\t\t * @type Number\n\t\t */\n\t\tstate : plupload.STOPPED,\n\n\t\t/**\n\t\t * Map of features that are available for the uploader runtime. Features will be filled\n\t\t * before the init event is called, these features can then be used to alter the UI for the end user.\n\t\t * Some of the current features that might be in this map is: dragdrop, chunks, jpgresize, pngresize.\n\t\t *\n\t\t * @property features\n\t\t * @type Object\n\t\t */\n\t\tfeatures : {},\n\n\t\t/**\n\t\t * Current runtime name.\n\t\t *\n\t\t * @property runtime\n\t\t * @type String\n\t\t */\n\t\truntime : o.Runtime.thatCan(required_caps, settings.runtimes), // predict runtime\n\n\t\t/**\n\t\t * Current upload queue, an array of File instances.\n\t\t *\n\t\t * @property files\n\t\t * @type Array\n\t\t * @see plupload.File\n\t\t */\n\t\tfiles : files,\n\n\t\t/**\n\t\t * Object with name/value settings.\n\t\t *\n\t\t * @property settings\n\t\t * @type Object\n\t\t */\n\t\tsettings : settings,\n\n\t\t/**\n\t\t * Total progess information. How many files has been uploaded, total percent etc.\n\t\t *\n\t\t * @property total\n\t\t * @type plupload.QueueProgress\n\t\t */\n\t\ttotal : total,\n\n\n\t\t/**\n\t\t * Initializes the Uploader instance and adds internal event listeners.\n\t\t *\n\t\t * @method init\n\t\t */\n\t\tinit : function() {\n\t\t\tvar self = this;\n\n\t\t\tsettings.browse_button = o.get(settings.browse_button);\n\t\t\t\n\t\t\t// Check if drop zone requested\n\t\t\tsettings.drop_element = o.get(settings.drop_element);\n\n\n\t\t\tif (typeof(settings.preinit) == \"function\") {\n\t\t\t\tsettings.preinit(self);\n\t\t\t} else {\n\t\t\t\tplupload.each(settings.preinit, function(func, name) {\n\t\t\t\t\tself.bind(name, func);\n\t\t\t\t});\n\t\t\t}\n\n\n\t\t\t// Check for required options\n\t\t\tif (!settings.browse_button || !settings.url) {\n\t\t\t\tthis.trigger('Error', {\n\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t});\n\t\t\t\treturn;\n\t\t\t}\n\n\n\t\t\tself.bind(\"BeforeAdd\", function(up, file) {\n\t\t\t\tvar name, rules = up.settings.filters;\n\t\t\t\tfor (name in rules) {\n\t\t\t\t\tif (fileFilters[name] && !fileFilters[name].call(this, rules[name], file)) {\n\t\t\t\t\t\treturn false;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t});\n\n\n\t\t\tself.bind(\"FilesAdded\", function(up, filteredFiles) {\n\t\t\t\t// Add files to queue\t\t\t\t\n\t\t\t\t[].push.apply(files, filteredFiles);\n\n\t\t\t\tdelay(function() {\n\t\t\t\t\tself.trigger(\"QueueChanged\");\n\t\t\t\t\tself.refresh();\n\t\t\t\t}, 1);\t\t\n\t\t\t});\n\n\t\t\tself.bind(\"CancelUpload\", function() {\n\t\t\t\tif (xhr) {\n\t\t\t\t\txhr.abort();\n\t\t\t\t}\n\t\t\t});\n\n\t\t\t// Generate unique target filenames\n\t\t\tif (settings.unique_names) {\n\t\t\t\tself.bind(\"BeforeUpload\", function(up, file) {\n\t\t\t\t\tvar matches = file.name.match(/\\.([^.]+)$/), ext = \"part\";\n\t\t\t\t\tif (matches) {\n\t\t\t\t\t\text = matches[1];\n\t\t\t\t\t}\n\t\t\t\t\tfile.target_name = file.id + '.' + ext;\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tself.bind(\"UploadFile\", function(up, file) {\n\t\t\t\tvar url = up.settings.url, features = up.features, chunkSize = settings.chunk_size,\n\t\t\t\t\tretries = settings.max_retries,\n\t\t\t\t\tblob, offset = 0;\n\n\t\t\t\t// make sure we start at a predictable offset\n\t\t\t\tif (file.loaded) {\n\t\t\t\t\toffset = file.loaded = chunkSize * Math.floor(file.loaded / chunkSize);\n\t\t\t\t}\n\n\t\t\t\tfunction handleError() {\n\t\t\t\t\tif (retries-- > 0) {\n\t\t\t\t\t\tdelay(uploadNextChunk, 1);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tfile.loaded = offset; // reset all progress\n\n\t\t\t\t\t\tup.trigger('Error', {\n\t\t\t\t\t\t\tcode : plupload.HTTP_ERROR,\n\t\t\t\t\t\t\tmessage : plupload.translate('HTTP Error.'),\n\t\t\t\t\t\t\tfile : file,\n\t\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\tself.bind(\"UploadChunk\", function() {\n\t\t\t\t\tvar chunkBlob, formData, args, curChunkSize;\n\n\t\t\t\t\t// File upload finished\n\t\t\t\t\tif (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}\n\n\t\t\t\t\t// Standard arguments\n\t\t\t\t\targs = {name : file.target_name || file.name};\n\n\t\t\t\t\tif (chunkSize && features.chunks && blob.size > chunkSize) { // blob will be of type string if it was loaded in memory \n\t\t\t\t\t\tcurChunkSize = Math.min(chunkSize, blob.size - offset);\n\t\t\t\t\t\tchunkBlob = blob.slice(offset, offset + curChunkSize);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tcurChunkSize = blob.size;\n\t\t\t\t\t\tchunkBlob = blob;\n\t\t\t\t\t}\n\n\t\t\t\t\t// If chunking is enabled add corresponding args, no matter if file is bigger than chunk or smaller\n\t\t\t\t\tif (chunkSize && features.chunks) {\n\t\t\t\t\t\t// Setup query string arguments\n\t\t\t\t\t\tif (settings.send_chunk_number) {\n\t\t\t\t\t\t\targs.chunk = Math.ceil(offset / chunkSize);\n\t\t\t\t\t\t\targs.chunks = Math.ceil(blob.size / chunkSize);\n\t\t\t\t\t\t} else { // keep support for experimental chunk format, just in case\n\t\t\t\t\t\t\targs.offset = offset;\n\t\t\t\t\t\t\targs.total = blob.size;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\n\t\t\t\t\txhr = new o.XMLHttpRequest();\n\n\t\t\t\t\t// Do we have upload progress support\n\t\t\t\t\tif (xhr.upload) {\n\t\t\t\t\t\txhr.upload.onprogress = function(e) {\n\t\t\t\t\t\t\tfile.loaded = Math.min(file.size, offset + e.loaded);\n\t\t\t\t\t\t\tup.trigger('UploadProgress', file);\n\t\t\t\t\t\t};\n\t\t\t\t\t}\n\n\t\t\t\t\txhr.onload = function() {\n\t\t\t\t\t\t// check if upload made itself through\n\t\t\t\t\t\tif (xhr.status >= 400) {\n\t\t\t\t\t\t\thandleError();\n\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\t// Handle chunk response\n\t\t\t\t\t\tif (curChunkSize < blob.size) {\n\t\t\t\t\t\t\tchunkBlob.destroy();\n\n\t\t\t\t\t\t\toffset += curChunkSize;\n\t\t\t\t\t\t\tfile.loaded = Math.min(offset, blob.size);\n\n\t\t\t\t\t\t\tup.trigger('ChunkUploaded', file, {\n\t\t\t\t\t\t\t\toffset : file.loaded,\n\t\t\t\t\t\t\t\ttotal : blob.size,\n\t\t\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\tfile.loaded = file.size;\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\tchunkBlob = formData = null; // Free memory\n\n\t\t\t\t\t\t// Check if file is uploaded\n\t\t\t\t\t\tif (!offset || offset >= blob.size) {\n\t\t\t\t\t\t\t// If file was modified, destory the copy\n\t\t\t\t\t\t\tif (file.size != file.origSize) {\n\t\t\t\t\t\t\t\tblob.destroy();\n\t\t\t\t\t\t\t\tblob = null;\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tup.trigger('UploadProgress', file);\n\n\t\t\t\t\t\t\tfile.status = plupload.DONE;\n\n\t\t\t\t\t\t\tup.trigger('FileUploaded', file, {\n\t\t\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t// Still chunks left\n\t\t\t\t\t\t\tdelay(uploadNextChunk, 1); // run detached, otherwise event handlers interfere\n\t\t\t\t\t\t}\n\t\t\t\t\t};\n\n\t\t\t\t\txhr.onerror = function() {\n\t\t\t\t\t\thandleError();\n\t\t\t\t\t};\n\n\t\t\t\t\txhr.onloadend = function() {\n\t\t\t\t\t\tthis.destroy();\n\t\t\t\t\t\txhr = null;\n\t\t\t\t\t};\n\n\t\t\t\t\t// Build multipart request\n\t\t\t\t\tif (up.settings.multipart && features.multipart) {\n\n\t\t\t\t\t\targs.name = file.target_name || file.name;\n\n\t\t\t\t\t\txhr.open(up.settings.method, url, true);\n\n\t\t\t\t\t\t// Set custom headers\n\t\t\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\tformData = new o.FormData();\n\n\t\t\t\t\t\t// Add multipart params\n\t\t\t\t\t\tplupload.each(plupload.extend(args, up.settings.multipart_params), function(value, name) {\n\t\t\t\t\t\t\tformData.append(name, value);\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\t// Add file and send it\n\t\t\t\t\t\tformData.append(up.settings.file_data_name, chunkBlob);\n\t\t\t\t\t\txhr.send(formData, {\n\t\t\t\t\t\t\truntime_order: up.settings.runtimes,\n\t\t\t\t\t\t\trequired_caps: required_caps,\n\t\t\t\t\t\t\tswf_url: up.settings.flash_swf_url,\n\t\t\t\t\t\t\txap_url: up.settings.silverlight_xap_url\n\t\t\t\t\t\t});\n\t\t\t\t\t} else {\n\t\t\t\t\t\t// if no multipart, send as binary stream\n\t\t\t\t\t\turl = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));\n\n\t\t\t\t\t\txhr.open(up.settings.method, url, true);\n\n\t\t\t\t\t\txhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Binary stream header\n\n\t\t\t\t\t\t// Set custom headers\n\t\t\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\txhr.send(chunkBlob, {\n\t\t\t\t\t\t\truntime_order: up.settings.runtimes,\n\t\t\t\t\t\t\trequired_caps: required_caps,\n\t\t\t\t\t\t\tswf_url: up.settings.flash_swf_url,\n\t\t\t\t\t\t\txap_url: up.settings.silverlight_xap_url\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t\t\n\t\t\t\tfunction uploadNextChunk(){\n\t\t\t\t\tif(self.trigger('BeforeUploadChunk',file)){\n\t\t\t\t\t\tself.trigger('UploadChunk');\n\t\t\t\t\t}\n\t\t\t\t}\n\n\t\t\t\tblob = file.getSource();\n\n\t\t\t\t// Start uploading chunks\n\t\t\t\tif (!o.isEmptyObj(up.settings.resize) && runtimeCan(blob, 'send_binary_string') && !!~o.inArray(blob.type, ['image/jpeg', 'image/png'])) {\n\t\t\t\t\t// Resize if required\n\t\t\t\t\tresizeImage.call(this, blob, up.settings.resize, function(resizedBlob) {\n\t\t\t\t\t\tblob = resizedBlob;\n\t\t\t\t\t\tfile.size = resizedBlob.size;\n\t\t\t\t\t\tuploadNextChunk();\n\t\t\t\t\t});\n\t\t\t\t} else {\n\t\t\t\t\tuploadNextChunk();\n\t\t\t\t}\n\t\t\t});\n\n\t\t\tself.bind('UploadProgress', function(up, file) {\n\t\t\t\tcalcFile(file);\n\t\t\t});\n\n\t\t\tself.bind('StateChanged', function(up) {\n\t\t\t\tif (up.state == plupload.STARTED) {\n\t\t\t\t\t// Get start time to calculate bps\n\t\t\t\t\tstartTime = (+new Date());\n\t\t\t\t} else if (up.state == plupload.STOPPED) {\n\t\t\t\t\t// Reset currently uploading files\n\t\t\t\t\tfor (var i = up.files.length - 1; i >= 0; i--) {\n\t\t\t\t\t\tif (up.files[i].status == plupload.UPLOADING) {\n\t\t\t\t\t\t\tup.files[i].status = plupload.QUEUED;\n\t\t\t\t\t\t\tcalc();\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t});\n\n\t\t\tself.bind('QueueChanged', calc);\n\n\t\t\tself.bind(\"Error\", function(up, err) {\n\t\t\t\t// Set failed status if an error occured on a file\n\t\t\t\tif (err.file) {\n\t\t\t\t\terr.file.status = plupload.FAILED;\n\n\t\t\t\t\tcalcFile(err.file);\n\n\t\t\t\t\t// Upload next file but detach it from the error event\n\t\t\t\t\t// since other custom listeners might want to stop the queue\n\t\t\t\t\tif (up.state == plupload.STARTED) {\n\t\t\t\t\t\tdelay(function() {\n\t\t\t\t\t\t\tuploadNext.call(self);\n\t\t\t\t\t\t}, 1);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t});\n\n\t\t\tself.bind(\"FileUploaded\", function() {\n\t\t\t\tcalc();\n\n\t\t\t\t// Upload next file but detach it from the error event\n\t\t\t\t// since other custom listeners might want to stop the queue\n\t\t\t\tdelay(function() {\n\t\t\t\t\tuploadNext.call(self);\n\t\t\t\t}, 1);\n\t\t\t});\n\n\t\t\t// some dependent scripts hook onto Init to alter configuration options, raw UI, etc (like Queue Widget),\n\t\t\t// therefore we got to fire this one, before we dive into the actual initializaion\n\t\t\tself.trigger('Init', { runtime: this.runtime });\n\n\t\t\tinitControls.call(this);\n\t\t},\n\n\t\t/**\n\t\t * Refreshes the upload instance by dispatching out a refresh event to all runtimes.\n\t\t * This would for example reposition flash/silverlight shims on the page.\n\t\t *\n\t\t * @method refresh\n\t\t */\n\t\trefresh : function() {\n\t\t\tif (fileInput) {\n\t\t\t\tfileInput.trigger(\"Refresh\");\n\t\t\t}\n\t\t\tthis.trigger(\"Refresh\");\n\t\t},\n\n\t\t/**\n\t\t * Starts uploading the queued files.\n\t\t *\n\t\t * @method start\n\t\t */\n\t\tstart : function() {\n\t\t\tif (this.state != plupload.STARTED) {\n\t\t\t\tthis.state = plupload.STARTED;\n\t\t\t\tthis.trigger(\"StateChanged\");\n\n\t\t\t\tuploadNext.call(this);\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Stops the upload of the queued files.\n\t\t *\n\t\t * @method stop\n\t\t */\n\t\tstop : function() {\n\t\t\tif (this.state != plupload.STOPPED) {\n\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\tthis.trigger(\"StateChanged\");\n\t\t\t\tthis.trigger(\"CancelUpload\");\n\t\t\t}\n\t\t},\n\n\n\t\t/**\n\t\t * Disables/enables browse button on request.\n\t\t *\n\t\t * @method disableBrowse\n\t\t * @param {Boolean} disable Whether to disable or enable (default: true)\n\t\t */\n\t\tdisableBrowse : function() {\n\t\t\tdisabled = arguments[0] !== undef ? arguments[0] : true;\n\n\t\t\tif (fileInput) {\n\t\t\t\tfileInput.disable(disabled);\n\t\t\t}\n\n\t\t\tthis.trigger(\"DisableBrowse\", disabled);\n\t\t},\n\n\t\t/**\n\t\t * Returns the specified file object by id.\n\t\t *\n\t\t * @method getFile\n\t\t * @param {String} id File id to look for.\n\t\t * @return {plupload.File} File object or undefined if it wasn't found;\n\t\t */\n\t\tgetFile : function(id) {\n\t\t\tvar i;\n\t\t\tfor (i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn files[i];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Adds file to the queue programmatically. Can be native file, instance of Plupload.File,\n\t\t * instance of mOxie.File, input[type=\"file\"] element, or array of these. Fires FilesAdded, \n\t\t * if any files were added to the queue. Otherwise nothing happens.\n\t\t *\n\t\t * @method addFile\n\t\t * @param {plupload.File|mOxie.File|File|Node|Array} file File or files to add to the queue.\n\t\t * @param {String} [fileName] If specified, will be used as a name for the file\n\t\t */\n\t\taddFile : function(file, fileName) {\n\t\t\tvar self = this \n\t\t\t, files = []\n\t\t\t, ruid\n\t\t\t;\n\n\t\t\tfunction getRUID() {\n\t\t\t\tvar ctrl = fileDrop || fileInput;\n\t\t\t\tif (ctrl) {\n\t\t\t\t\treturn ctrl.getRuntime().uid;\n\t\t\t\t}\n\t\t\t\treturn false;\n\t\t\t}\n\n\t\t\tfunction resolveFile(file) {\n\t\t\t\tvar type = o.typeOf(file);\n\n\t\t\t\tif (file instanceof o.File) { \n\t\t\t\t\tif (!file.ruid) {\n\t\t\t\t\t\tif (!ruid) { // weird case\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tfile.ruid = ruid;\n\t\t\t\t\t\tfile.connectRuntime(ruid);\n\t\t\t\t\t}\n\t\t\t\t\tresolveFile(new plupload.File(file));\n\t\t\t\t} else if (file instanceof o.Blob) {\n\t\t\t\t\tresolveFile(file.getSource());\n\t\t\t\t\tfile.destroy();\n\t\t\t\t} else if (file instanceof plupload.File) { // final step for other branches\n\t\t\t\t\tif (fileName) {\n\t\t\t\t\t\tfile.name = fileName;\n\t\t\t\t\t}\n\t\t\t\t\t// run through the internal and user-defined filters if any\n\t\t\t\t\tif (self.trigger(\"BeforeAdd\", file)) {\n\t\t\t\t\t\tfiles.push(file);\n\t\t\t\t\t}\n\t\t\t\t} else if (o.inArray(type, ['file', 'blob']) !== -1) {\n\t\t\t\t\tresolveFile(new o.File(null, file));\n\t\t\t\t} else if (type === 'node' && o.typeOf(file.files) === 'filelist') {\n\t\t\t\t\t// if we are dealing with input[type=\"file\"]\n\t\t\t\t\to.each(file.files, resolveFile);\n\t\t\t\t} else if (type === 'array') {\n\t\t\t\t\t// mixed array\n\t\t\t\t\tfileName = null; // should never happen, but unset anyway to avoid funny situations\n\t\t\t\t\to.each(file, resolveFile);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\truid = getRUID();\n\n\t\t\tresolveFile(file);\n\n\t\t\t// Trigger FilesAdded event if we added any\n\t\t\tif (files.length) {\n\t\t\t\tthis.trigger(\"FilesAdded\", files);\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes a specific file.\n\t\t *\n\t\t * @method removeFile\n\t\t * @param {plupload.File|String} file File to remove from queue.\n\t\t */\n\t\tremoveFile : function(file) {\n\t\t\tvar id = typeof(file) === 'string' ? file : file.id;\n\n\t\t\tfor (var i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn this.splice(i, 1)[0];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes part of the queue and returns the files removed. This will also trigger the FilesRemoved and QueueChanged events.\n\t\t *\n\t\t * @method splice\n\t\t * @param {Number} start (Optional) Start index to remove from.\n\t\t * @param {Number} length (Optional) Lengh of items to remove.\n\t\t * @return {Array} Array of files that was removed.\n\t\t */\n\t\tsplice : function(start, length) {\n\t\t\t// Splice and trigger events\n\t\t\tvar removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);\n\n\t\t\tthis.trigger(\"FilesRemoved\", removed);\n\t\t\tthis.trigger(\"QueueChanged\");\n\n\t\t\t// Dispose any resources allocated by those files\n\t\t\tplupload.each(removed, function(file) {\n\t\t\t\tfile.destroy();\n\t\t\t});\n\n\t\t\treturn removed;\n\t\t},\n\n\t\t/**\n\t\t * Dispatches the specified event name and it's arguments to all listeners.\n\t\t *\n\t\t *\n\t\t * @method trigger\n\t\t * @param {String} name Event name to fire.\n\t\t * @param {Object..} Multiple arguments to pass along to the listener functions.\n\t\t */\n\t\ttrigger : function(name) {\n\t\t\tvar list = events[name.toLowerCase()], i, args;\n\n\t\t\t// console.log(name, arguments);\n\n\t\t\tif (list) {\n\t\t\t\t// Replace name with sender in args\n\t\t\t\targs = Array.prototype.slice.call(arguments);\n\t\t\t\targs[0] = this;\n\n\t\t\t\t// Dispatch event to all listeners\n\t\t\t\tfor (i = 0; i < list.length; i++) {\n\t\t\t\t\t// Fire event, break chain if false is returned\n\t\t\t\t\tif (list[i].func.apply(list[i].scope, args) === false) {\n\t\t\t\t\t\treturn false;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\n\t\t\treturn true;\n\t\t},\n\n\t\t/**\n\t\t * Check whether uploader has any listeners to the specified event.\n\t\t *\n\t\t * @method hasEventListener\n\t\t * @param {String} name Event name to check for.\n\t\t */\n\t\thasEventListener : function(name) {\n\t\t\treturn !!events[name.toLowerCase()];\n\t\t},\n\n\t\t/**\n\t\t * Adds an event listener by name.\n\t\t *\n\t\t * @method bind\n\t\t * @param {String} name Event name to listen for.\n\t\t * @param {function} func Function to call ones the event gets fired.\n\t\t * @param {Object} scope Optional scope to execute the specified function in.\n\t\t */\n\t\tbind : function(name, func, scope) {\n\t\t\tvar list;\n\n\t\t\tname = name.toLowerCase();\n\t\t\tlist = events[name] || [];\n\t\t\tlist.push({func : func, scope : scope || this});\n\t\t\tevents[name] = list;\n\t\t},\n\n\t\t/**\n\t\t * Removes the specified event listener.\n\t\t *\n\t\t * @method unbind\n\t\t * @param {String} name Name of event to remove.\n\t\t * @param {function} func Function to remove from listener.\n\t\t */\n\t\tunbind : function(name) {\n\t\t\tname = name.toLowerCase();\n\n\t\t\tvar list = events[name], i, func = arguments[1];\n\n\t\t\tif (list) {\n\t\t\t\tif (func !== undef) {\n\t\t\t\t\tfor (i = list.length - 1; i >= 0; i--) {\n\t\t\t\t\t\tif (list[i].func === func) {\n\t\t\t\t\t\t\tlist.splice(i, 1);\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tlist = [];\n\t\t\t\t}\n\n\t\t\t\t// delete event list if it has become empty\n\t\t\t\tif (!list.length) {\n\t\t\t\t\tdelete events[name];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes all event listeners.\n\t\t *\n\t\t * @method unbindAll\n\t\t */\n\t\tunbindAll : function() {\n\t\t\tvar self = this;\n\n\t\t\tplupload.each(events, function(list, name) {\n\t\t\t\tself.unbind(name);\n\t\t\t});\n\t\t},\n\n\t\t/**\n\t\t * Destroys Plupload instance and cleans after itself.\n\t\t *\n\t\t * @method destroy\n\t\t */\n\t\tdestroy : function() {\n\t\t\tthis.stop();\n\n\t\t\t// Purge the queue\n\t\t\tplupload.each(files, function(file) {\n\t\t\t\tfile.destroy();\n\t\t\t});\n\t\t\tfiles = [];\n\n\t\t\tif (fileInput) {\n\t\t\t\tfileInput.destroy();\n\t\t\t\tfileInput = null;\n\t\t\t}\n\n\t\t\tif (fileDrop) {\n\t\t\t\tfileDrop.destroy();\n\t\t\t\tfileDrop = null;\n\t\t\t}\n\n\t\t\trequired_caps = {};\n\t\t\tstartTime = total = disabled = xhr = null;\n\n\t\t\tthis.trigger('Destroy');\n\n\t\t\t// Clean-up after uploader itself\n\t\t\tthis.unbindAll();\n\t\t\tevents = {};\n\t\t}\n\t});\n};\n\n/**\n * Constructs a new file instance.\n *\n * @class File\n * @constructor\n * \n * @param {Object} file Object containing file properties\n * @param {String} file.name Name of the file.\n * @param {Number} file.size File size.\n */\nplupload.File = (function() {\n\tvar filepool = {};\n\n\tfunction PluploadFile(file) {\n\n\t\tplupload.extend(this, {\n\n\t\t\t/**\n\t\t\t * File id this is a globally unique id for the specific file.\n\t\t\t *\n\t\t\t * @property id\n\t\t\t * @type String\n\t\t\t */\n\t\t\tid: plupload.guid(),\n\n\t\t\t/**\n\t\t\t * File name for example \"myfile.gif\".\n\t\t\t *\n\t\t\t * @property name\n\t\t\t * @type String\n\t\t\t */\n\t\t\tname: file.name || file.fileName,\n\n\t\t\t/**\n\t\t\t * File type, `e.g image/jpeg`\n\t\t\t *\n\t\t\t * @property type\n\t\t\t * @type String\n\t\t\t */\n\t\t\ttype: file.type || '',\n\n\t\t\t/**\n\t\t\t * File size in bytes (may change after client-side manupilation).\n\t\t\t *\n\t\t\t * @property size\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tsize: file.size || file.fileSize,\n\n\t\t\t/**\n\t\t\t * Original file size in bytes.\n\t\t\t *\n\t\t\t * @property origSize\n\t\t\t * @type Number\n\t\t\t */\n\t\t\torigSize: file.size || file.fileSize,\n\n\t\t\t/**\n\t\t\t * Number of bytes uploaded of the files total size.\n\t\t\t *\n\t\t\t * @property loaded\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tloaded: 0,\n\n\t\t\t/**\n\t\t\t * Number of percentage uploaded of the file.\n\t\t\t *\n\t\t\t * @property percent\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tpercent: 0,\n\n\t\t\t/**\n\t\t\t * Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.\n\t\t\t *\n\t\t\t * @property status\n\t\t\t * @type Number\n\t\t\t * @see plupload\n\t\t\t */\n\t\t\tstatus: plupload.QUEUED,\n\n\t\t\t/**\n\t\t\t * Returns native window.File object, when it's available.\n\t\t\t *\n\t\t\t * @method getNative\n\t\t\t * @return {window.File} or null, if plupload.File is of different origin\n\t\t\t */\n\t\t\tgetNative: function() {\n\t\t\t\tvar file = this.getSource().getSource();\n\t\t\t\treturn o.inArray(o.typeOf(file), ['blob', 'file']) !== -1 ? file : null;\n\t\t\t},\n\n\t\t\t/**\n\t\t\t * Returns mOxie.File - unified wrapper object that can be used across runtimes.\n\t\t\t *\n\t\t\t * @method getSource\n\t\t\t * @return {mOxie.File} or null\n\t\t\t */\n\t\t\tgetSource: function() {\n\t\t\t\tif (!filepool[this.id]) {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t\treturn filepool[this.id];\n\t\t\t},\n\n\t\t\t/**\n\t\t\t * Destroys plupload.File object.\n\t\t\t *\n\t\t\t * @method destroy\n\t\t\t */\n\t\t\tdestroy: function() {\n\t\t\t\tvar src = this.getSource();\n\t\t\t\tif (src) {\n\t\t\t\t\tsrc.destroy();\n\t\t\t\t\tdelete filepool[this.id];\n\t\t\t\t}\n\t\t\t}\n\t\t});\n\n\t\tfilepool[this.id] = file;\n\t}\n\n\treturn PluploadFile;\n}());\n\n\n/**\n * Constructs a queue progress.\n *\n * @class QueueProgress\n * @constructor\n */\n plupload.QueueProgress = function() {\n\tvar self = this; // Setup alias for self to reduce code size when it's compressed\n\n\t/**\n\t * Total queue file size.\n\t *\n\t * @property size\n\t * @type Number\n\t */\n\tself.size = 0;\n\n\t/**\n\t * Total bytes uploaded.\n\t *\n\t * @property loaded\n\t * @type Number\n\t */\n\tself.loaded = 0;\n\n\t/**\n\t * Number of files uploaded.\n\t *\n\t * @property uploaded\n\t * @type Number\n\t */\n\tself.uploaded = 0;\n\n\t/**\n\t * Number of files failed to upload.\n\t *\n\t * @property failed\n\t * @type Number\n\t */\n\tself.failed = 0;\n\n\t/**\n\t * Number of files yet to be uploaded.\n\t *\n\t * @property queued\n\t * @type Number\n\t */\n\tself.queued = 0;\n\n\t/**\n\t * Total percent of the uploaded bytes.\n\t *\n\t * @property percent\n\t * @type Number\n\t */\n\tself.percent = 0;\n\n\t/**\n\t * Bytes uploaded per second.\n\t *\n\t * @property bytesPerSec\n\t * @type Number\n\t */\n\tself.bytesPerSec = 0;\n\n\t/**\n\t * Resets the progress to it's initial values.\n\t *\n\t * @method reset\n\t */\n\tself.reset = function() {\n\t\tself.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;\n\t};\n};\n\nwindow.plupload = plupload;\n\n}(window, mOxie));\n");
__$coverInitRange("Plupload", "223:223");
__$coverInitRange("Plupload", "224:52554");
__$coverInitRange("Plupload", "255:303");
__$coverInitRange("Plupload", "304:304");
__$coverInitRange("Plupload", "364:1794");
__$coverInitRange("Plupload", "1838:14897");
__$coverInitRange("Plupload", "14901:15941");
__$coverInitRange("Plupload", "15945:16279");
__$coverInitRange("Plupload", "16283:16789");
__$coverInitRange("Plupload", "20068:48920");
__$coverInitRange("Plupload", "49149:51332");
__$coverInitRange("Plupload", "51420:52505");
__$coverInitRange("Plupload", "52508:52534");
__$coverInitRange("Plupload", "402:454");
__$coverInitRange("Plupload", "458:1147");
__$coverInitRange("Plupload", "1151:1776");
__$coverInitRange("Plupload", "1781:1792");
__$coverInitRange("Plupload", "606:1036");
__$coverInitRange("Plupload", "1041:1144");
__$coverInitRange("Plupload", "1064:1090");
__$coverInitRange("Plupload", "1119:1140");
__$coverInitRange("Plupload", "1190:1282");
__$coverInitRange("Plupload", "1254:1276");
__$coverInitRange("Plupload", "1331:1414");
__$coverInitRange("Plupload", "1385:1408");
__$coverInitRange("Plupload", "1493:1594");
__$coverInitRange("Plupload", "1599:1659");
__$coverInitRange("Plupload", "1666:1773");
__$coverInitRange("Plupload", "1560:1590");
__$coverInitRange("Plupload", "1633:1655");
__$coverInitRange("Plupload", "1720:1751");
__$coverInitRange("Plupload", "7398:7516");
__$coverInitRange("Plupload", "7521:7667");
__$coverInitRange("Plupload", "7589:7655");
__$coverInitRange("Plupload", "11316:11329");
__$coverInitRange("Plupload", "11358:11658");
__$coverInitRange("Plupload", "11663:11756");
__$coverInitRange("Plupload", "11785:11817");
__$coverInitRange("Plupload", "11848:11892");
__$coverInitRange("Plupload", "11897:11908");
__$coverInitRange("Plupload", "11707:11752");
__$coverInitRange("Plupload", "12308:12322");
__$coverInitRange("Plupload", "12327:12469");
__$coverInitRange("Plupload", "12474:12543");
__$coverInitRange("Plupload", "12548:12558");
__$coverInitRange("Plupload", "12375:12463");
__$coverInitRange("Plupload", "12490:12539");
__$coverInitRange("Plupload", "12823:12903");
__$coverInitRange("Plupload", "12916:13026");
__$coverInitRange("Plupload", "13039:13143");
__$coverInitRange("Plupload", "13156:13254");
__$coverInitRange("Plupload", "13267:13359");
__$coverInitRange("Plupload", "13364:13407");
__$coverInitRange("Plupload", "12867:12899");
__$coverInitRange("Plupload", "12947:13022");
__$coverInitRange("Plupload", "13067:13139");
__$coverInitRange("Plupload", "13181:13250");
__$coverInitRange("Plupload", "13289:13355");
__$coverInitRange("Plupload", "14100:14115");
__$coverInitRange("Plupload", "14120:14169");
__$coverInitRange("Plupload", "14173:14207");
__$coverInitRange("Plupload", "14211:14231");
__$coverInitRange("Plupload", "14235:14247");
__$coverInitRange("Plupload", "14251:14265");
__$coverInitRange("Plupload", "14139:14165");
__$coverInitRange("Plupload", "14869:14891");
__$coverInitRange("Plupload", "14953:14977");
__$coverInitRange("Plupload", "15014:15485");
__$coverInitRange("Plupload", "15489:15934");
__$coverInitRange("Plupload", "15049:15074");
__$coverInitRange("Plupload", "15079:15414");
__$coverInitRange("Plupload", "15419:15482");
__$coverInitRange("Plupload", "15124:15408");
__$coverInitRange("Plupload", "15188:15401");
__$coverInitRange("Plupload", "15223:15252");
__$coverInitRange("Plupload", "15272:15395");
__$coverInitRange("Plupload", "15524:15705");
__$coverInitRange("Plupload", "15710:15915");
__$coverInitRange("Plupload", "15919:15930");
__$coverInitRange("Plupload", "15629:15663");
__$coverInitRange("Plupload", "15668:15701");
__$coverInitRange("Plupload", "15748:15894");
__$coverInitRange("Plupload", "15899:15911");
__$coverInitRange("Plupload", "16012:16021");
__$coverInitRange("Plupload", "16047:16261");
__$coverInitRange("Plupload", "16264:16275");
__$coverInitRange("Plupload", "16110:16242");
__$coverInitRange("Plupload", "16246:16258");
__$coverInitRange("Plupload", "16353:16771");
__$coverInitRange("Plupload", "16774:16785");
__$coverInitRange("Plupload", "16368:16394");
__$coverInitRange("Plupload", "16398:16768");
__$coverInitRange("Plupload", "16509:16764");
__$coverInitRange("Plupload", "16591:16741");
__$coverInitRange("Plupload", "16747:16759");
__$coverInitRange("Plupload", "24158:24271");
__$coverInitRange("Plupload", "24296:24946");
__$coverInitRange("Plupload", "24950:25068");
__$coverInitRange("Plupload", "25072:26183");
__$coverInitRange("Plupload", "26187:29409");
__$coverInitRange("Plupload", "29413:29576");
__$coverInitRange("Plupload", "29580:29991");
__$coverInitRange("Plupload", "30019:30055");
__$coverInitRange("Plupload", "30080:30432");
__$coverInitRange("Plupload", "30456:30583");
__$coverInitRange("Plupload", "30608:30674");
__$coverInitRange("Plupload", "30699:30813");
__$coverInitRange("Plupload", "30816:31010");
__$coverInitRange("Plupload", "31016:31105");
__$coverInitRange("Plupload", "31133:48917");
__$coverInitRange("Plupload", "24322:24344");
__$coverInitRange("Plupload", "24349:24943");
__$coverInitRange("Plupload", "24419:24703");
__$coverInitRange("Plupload", "24744:24939");
__$coverInitRange("Plupload", "24460:24698");
__$coverInitRange("Plupload", "24516:24531");
__$coverInitRange("Plupload", "24538:24665");
__$coverInitRange("Plupload", "24586:24618");
__$coverInitRange("Plupload", "24626:24658");
__$coverInitRange("Plupload", "24685:24692");
__$coverInitRange("Plupload", "24777:24891");
__$coverInitRange("Plupload", "24897:24934");
__$coverInitRange("Plupload", "24821:24850");
__$coverInitRange("Plupload", "24857:24885");
__$coverInitRange("Plupload", "24978:25055");
__$coverInitRange("Plupload", "25059:25065");
__$coverInitRange("Plupload", "25092:25103");
__$coverInitRange("Plupload", "25125:25138");
__$coverInitRange("Plupload", "25192:25775");
__$coverInitRange("Plupload", "25873:26180");
__$coverInitRange("Plupload", "25232:25247");
__$coverInitRange("Plupload", "25253:25604");
__$coverInitRange("Plupload", "25610:25771");
__$coverInitRange("Plupload", "25339:25366");
__$coverInitRange("Plupload", "25508:25563");
__$coverInitRange("Plupload", "25581:25599");
__$coverInitRange("Plupload", "25650:25666");
__$coverInitRange("Plupload", "25720:25734");
__$coverInitRange("Plupload", "25752:25766");
__$coverInitRange("Plupload", "25904:25989");
__$coverInitRange("Plupload", "26005:26092");
__$coverInitRange("Plupload", "26097:26176");
__$coverInitRange("Plupload", "26215:26247");
__$coverInitRange("Plupload", "26273:26479");
__$coverInitRange("Plupload", "26525:26674");
__$coverInitRange("Plupload", "26679:29406");
__$coverInitRange("Plupload", "26598:26668");
__$coverInitRange("Plupload", "26627:26663");
__$coverInitRange("Plupload", "26752:28372");
__$coverInitRange("Plupload", "26787:27014");
__$coverInitRange("Plupload", "27022:27358");
__$coverInitRange("Plupload", "27366:27438");
__$coverInitRange("Plupload", "27446:28217");
__$coverInitRange("Plupload", "28225:28318");
__$coverInitRange("Plupload", "28326:28342");
__$coverInitRange("Plupload", "27061:27100");
__$coverInitRange("Plupload", "27145:27316");
__$coverInitRange("Plupload", "27325:27338");
__$coverInitRange("Plupload", "27346:27350");
__$coverInitRange("Plupload", "27406:27430");
__$coverInitRange("Plupload", "27524:28208");
__$coverInitRange("Plupload", "27548:27591");
__$coverInitRange("Plupload", "27600:28200");
__$coverInitRange("Plupload", "27623:27890");
__$coverInitRange("Plupload", "27901:28167");
__$coverInitRange("Plupload", "28177:28191");
__$coverInitRange("Plupload", "27668:27880");
__$coverInitRange("Plupload", "27709:27758");
__$coverInitRange("Plupload", "27817:27869");
__$coverInitRange("Plupload", "27947:28157");
__$coverInitRange("Plupload", "27987:28037");
__$coverInitRange("Plupload", "28093:28146");
__$coverInitRange("Plupload", "28281:28297");
__$coverInitRange("Plupload", "28305:28309");
__$coverInitRange("Plupload", "28362:28366");
__$coverInitRange("Plupload", "28454:29007");
__$coverInitRange("Plupload", "28488:28592");
__$coverInitRange("Plupload", "28600:28778");
__$coverInitRange("Plupload", "28786:28855");
__$coverInitRange("Plupload", "28863:28954");
__$coverInitRange("Plupload", "28962:28977");
__$coverInitRange("Plupload", "28638:28677");
__$coverInitRange("Plupload", "28686:28736");
__$coverInitRange("Plupload", "28745:28758");
__$coverInitRange("Plupload", "28766:28770");
__$coverInitRange("Plupload", "28823:28847");
__$coverInitRange("Plupload", "28918:28933");
__$coverInitRange("Plupload", "28941:28945");
__$coverInitRange("Plupload", "28997:29001");
__$coverInitRange("Plupload", "29037:29212");
__$coverInitRange("Plupload", "29218:29400");
__$coverInitRange("Plupload", "29084:29103");
__$coverInitRange("Plupload", "29121:29207");
__$coverInitRange("Plupload", "29178:29199");
__$coverInitRange("Plupload", "29241:29265");
__$coverInitRange("Plupload", "29283:29395");
__$coverInitRange("Plupload", "29448:29557");
__$coverInitRange("Plupload", "29561:29573");
__$coverInitRange("Plupload", "29468:29507");
__$coverInitRange("Plupload", "29512:29553");
__$coverInitRange("Plupload", "29528:29548");
__$coverInitRange("Plupload", "29623:29646");
__$coverInitRange("Plupload", "29651:29988");
__$coverInitRange("Plupload", "29660:29775");
__$coverInitRange("Plupload", "29781:29884");
__$coverInitRange("Plupload", "29890:29935");
__$coverInitRange("Plupload", "29941:29955");
__$coverInitRange("Plupload", "29690:29769");
__$coverInitRange("Plupload", "29813:29858");
__$coverInitRange("Plupload", "29864:29878");
__$coverInitRange("Plupload", "29921:29929");
__$coverInitRange("Plupload", "29976:29984");
__$coverInitRange("Plupload", "30481:30580");
__$coverInitRange("Plupload", "30754:30810");
__$coverInitRange("Plupload", "32694:32709");
__$coverInitRange("Plupload", "32715:32769");
__$coverInitRange("Plupload", "32813:32865");
__$coverInitRange("Plupload", "32872:33056");
__$coverInitRange("Plupload", "33096:33277");
__$coverInitRange("Plupload", "33284:33517");
__$coverInitRange("Plupload", "33524:33747");
__$coverInitRange("Plupload", "33753:33836");
__$coverInitRange("Plupload", "33881:34132");
__$coverInitRange("Plupload", "34138:39872");
__$coverInitRange("Plupload", "39878:39952");
__$coverInitRange("Plupload", "39958:40392");
__$coverInitRange("Plupload", "40398:40429");
__$coverInitRange("Plupload", "40435:40869");
__$coverInitRange("Plupload", "40875:41118");
__$coverInitRange("Plupload", "41319:41366");
__$coverInitRange("Plupload", "41372:41395");
__$coverInitRange("Plupload", "32922:32944");
__$coverInitRange("Plupload", "32962:33051");
__$coverInitRange("Plupload", "33022:33043");
__$coverInitRange("Plupload", "33148:33260");
__$coverInitRange("Plupload", "33266:33272");
__$coverInitRange("Plupload", "33332:33369");
__$coverInitRange("Plupload", "33375:33510");
__$coverInitRange("Plupload", "33402:33504");
__$coverInitRange("Plupload", "33485:33497");
__$coverInitRange("Plupload", "33612:33647");
__$coverInitRange("Plupload", "33654:33738");
__$coverInitRange("Plupload", "33678:33706");
__$coverInitRange("Plupload", "33713:33727");
__$coverInitRange("Plupload", "33796:33829");
__$coverInitRange("Plupload", "33812:33823");
__$coverInitRange("Plupload", "33914:34127");
__$coverInitRange("Plupload", "33966:34023");
__$coverInitRange("Plupload", "34030:34074");
__$coverInitRange("Plupload", "34081:34119");
__$coverInitRange("Plupload", "34051:34067");
__$coverInitRange("Plupload", "34187:34329");
__$coverInitRange("Plupload", "34386:34486");
__$coverInitRange("Plupload", "34493:34914");
__$coverInitRange("Plupload", "34921:39283");
__$coverInitRange("Plupload", "39294:39417");
__$coverInitRange("Plupload", "39424:39447");
__$coverInitRange("Plupload", "39484:39865");
__$coverInitRange("Plupload", "34410:34480");
__$coverInitRange("Plupload", "34523:34908");
__$coverInitRange("Plupload", "34550:34575");
__$coverInitRange("Plupload", "34597:34617");
__$coverInitRange("Plupload", "34648:34901");
__$coverInitRange("Plupload", "34964:35007");
__$coverInitRange("Plupload", "35044:35165");
__$coverInitRange("Plupload", "35200:35245");
__$coverInitRange("Plupload", "35253:35571");
__$coverInitRange("Plupload", "35684:36052");
__$coverInitRange("Plupload", "36060:36088");
__$coverInitRange("Plupload", "36139:36319");
__$coverInitRange("Plupload", "36327:37612");
__$coverInitRange("Plupload", "37620:37674");
__$coverInitRange("Plupload", "37682:37757");
__$coverInitRange("Plupload", "37797:39275");
__$coverInitRange("Plupload", "35152:35158");
__$coverInitRange("Plupload", "35379:35433");
__$coverInitRange("Plupload", "35441:35494");
__$coverInitRange("Plupload", "35516:35540");
__$coverInitRange("Plupload", "35548:35564");
__$coverInitRange("Plupload", "35764:36045");
__$coverInitRange("Plupload", "35805:35847");
__$coverInitRange("Plupload", "35856:35902");
__$coverInitRange("Plupload", "35986:36006");
__$coverInitRange("Plupload", "36015:36037");
__$coverInitRange("Plupload", "36163:36312");
__$coverInitRange("Plupload", "36208:36260");
__$coverInitRange("Plupload", "36269:36303");
__$coverInitRange("Plupload", "36404:36472");
__$coverInitRange("Plupload", "36512:36938");
__$coverInitRange("Plupload", "36947:36974");
__$coverInitRange("Plupload", "37033:37604");
__$coverInitRange("Plupload", "36436:36449");
__$coverInitRange("Plupload", "36458:36464");
__$coverInitRange("Plupload", "36551:36570");
__$coverInitRange("Plupload", "36580:36602");
__$coverInitRange("Plupload", "36611:36652");
__$coverInitRange("Plupload", "36662:36883");
__$coverInitRange("Plupload", "36907:36930");
__$coverInitRange("Plupload", "37127:37213");
__$coverInitRange("Plupload", "37223:37257");
__$coverInitRange("Plupload", "37267:37294");
__$coverInitRange("Plupload", "37304:37467");
__$coverInitRange("Plupload", "37169:37183");
__$coverInitRange("Plupload", "37193:37204");
__$coverInitRange("Plupload", "37519:37544");
__$coverInitRange("Plupload", "37653:37666");
__$coverInitRange("Plupload", "37717:37731");
__$coverInitRange("Plupload", "37739:37749");
__$coverInitRange("Plupload", "37855:37896");
__$coverInitRange("Plupload", "37905:37944");
__$coverInitRange("Plupload", "37981:38090");
__$coverInitRange("Plupload", "38099:38126");
__$coverInitRange("Plupload", "38165:38301");
__$coverInitRange("Plupload", "38340:38394");
__$coverInitRange("Plupload", "38402:38603");
__$coverInitRange("Plupload", "38047:38080");
__$coverInitRange("Plupload", "38263:38291");
__$coverInitRange("Plupload", "38673:38766");
__$coverInitRange("Plupload", "38775:38814");
__$coverInitRange("Plupload", "38823:38887");
__$coverInitRange("Plupload", "38948:39057");
__$coverInitRange("Plupload", "39066:39268");
__$coverInitRange("Plupload", "39014:39047");
__$coverInitRange("Plupload", "39327:39411");
__$coverInitRange("Plupload", "39377:39404");
__$coverInitRange("Plupload", "39655:39822");
__$coverInitRange("Plupload", "39734:39752");
__$coverInitRange("Plupload", "39760:39788");
__$coverInitRange("Plupload", "39796:39813");
__$coverInitRange("Plupload", "39842:39859");
__$coverInitRange("Plupload", "39931:39945");
__$coverInitRange("Plupload", "40003:40385");
__$coverInitRange("Plupload", "40084:40109");
__$coverInitRange("Plupload", "40203:40379");
__$coverInitRange("Plupload", "40258:40372");
__$coverInitRange("Plupload", "40313:40349");
__$coverInitRange("Plupload", "40358:40364");
__$coverInitRange("Plupload", "40533:40862");
__$coverInitRange("Plupload", "40554:40587");
__$coverInitRange("Plupload", "40595:40613");
__$coverInitRange("Plupload", "40747:40856");
__$coverInitRange("Plupload", "40789:40849");
__$coverInitRange("Plupload", "40815:40836");
__$coverInitRange("Plupload", "40918:40924");
__$coverInitRange("Plupload", "41055:41111");
__$coverInitRange("Plupload", "41079:41100");
__$coverInitRange("Plupload", "41632:41686");
__$coverInitRange("Plupload", "41691:41714");
__$coverInitRange("Plupload", "41653:41681");
__$coverInitRange("Plupload", "41824:41962");
__$coverInitRange("Plupload", "41866:41895");
__$coverInitRange("Plupload", "41901:41929");
__$coverInitRange("Plupload", "41936:41957");
__$coverInitRange("Plupload", "42073:42217");
__$coverInitRange("Plupload", "42115:42144");
__$coverInitRange("Plupload", "42150:42178");
__$coverInitRange("Plupload", "42184:42212");
__$coverInitRange("Plupload", "42427:42482");
__$coverInitRange("Plupload", "42488:42541");
__$coverInitRange("Plupload", "42547:42586");
__$coverInitRange("Plupload", "42509:42536");
__$coverInitRange("Plupload", "42827:42832");
__$coverInitRange("Plupload", "42837:42940");
__$coverInitRange("Plupload", "42883:42935");
__$coverInitRange("Plupload", "42914:42929");
__$coverInitRange("Plupload", "43463:43508");
__$coverInitRange("Plupload", "43509:43509");
__$coverInitRange("Plupload", "43515:43652");
__$coverInitRange("Plupload", "43658:44768");
__$coverInitRange("Plupload", "44774:44790");
__$coverInitRange("Plupload", "44796:44813");
__$coverInitRange("Plupload", "44866:44928");
__$coverInitRange("Plupload", "43540:43572");
__$coverInitRange("Plupload", "43578:43629");
__$coverInitRange("Plupload", "43635:43647");
__$coverInitRange("Plupload", "43595:43623");
__$coverInitRange("Plupload", "43691:43716");
__$coverInitRange("Plupload", "43723:44763");
__$coverInitRange("Plupload", "43759:43901");
__$coverInitRange("Plupload", "43908:43944");
__$coverInitRange("Plupload", "43783:43837");
__$coverInitRange("Plupload", "43845:43861");
__$coverInitRange("Plupload", "43869:43894");
__$coverInitRange("Plupload", "43817:43829");
__$coverInitRange("Plupload", "43992:44021");
__$coverInitRange("Plupload", "44028:44042");
__$coverInitRange("Plupload", "44130:44179");
__$coverInitRange("Plupload", "44251:44319");
__$coverInitRange("Plupload", "44152:44172");
__$coverInitRange("Plupload", "44296:44312");
__$coverInitRange("Plupload", "44385:44420");
__$coverInitRange("Plupload", "44550:44581");
__$coverInitRange("Plupload", "44643:44658");
__$coverInitRange("Plupload", "44732:44757");
__$coverInitRange("Plupload", "44890:44923");
__$coverInitRange("Plupload", "45109:45160");
__$coverInitRange("Plupload", "45166:45285");
__$coverInitRange("Plupload", "45216:45280");
__$coverInitRange("Plupload", "45247:45274");
__$coverInitRange("Plupload", "45714:45811");
__$coverInitRange("Plupload", "45817:45854");
__$coverInitRange("Plupload", "45859:45887");
__$coverInitRange("Plupload", "45946:46011");
__$coverInitRange("Plupload", "46017:46031");
__$coverInitRange("Plupload", "45990:46004");
__$coverInitRange("Plupload", "46321:46367");
__$coverInitRange("Plupload", "46410:46763");
__$coverInitRange("Plupload", "46769:46780");
__$coverInitRange("Plupload", "46466:46510");
__$coverInitRange("Plupload", "46516:46530");
__$coverInitRange("Plupload", "46576:46758");
__$coverInitRange("Plupload", "46670:46752");
__$coverInitRange("Plupload", "46733:46745");
__$coverInitRange("Plupload", "46997:47032");
__$coverInitRange("Plupload", "47358:47366");
__$coverInitRange("Plupload", "47372:47397");
__$coverInitRange("Plupload", "47402:47427");
__$coverInitRange("Plupload", "47432:47479");
__$coverInitRange("Plupload", "47484:47503");
__$coverInitRange("Plupload", "47735:47760");
__$coverInitRange("Plupload", "47766:47813");
__$coverInitRange("Plupload", "47819:48137");
__$coverInitRange("Plupload", "47835:48027");
__$coverInitRange("Plupload", "48082:48132");
__$coverInitRange("Plupload", "47862:47992");
__$coverInitRange("Plupload", "47909:47985");
__$coverInitRange("Plupload", "47945:47962");
__$coverInitRange("Plupload", "47972:47977");
__$coverInitRange("Plupload", "48012:48021");
__$coverInitRange("Plupload", "48107:48126");
__$coverInitRange("Plupload", "48249:48264");
__$coverInitRange("Plupload", "48270:48343");
__$coverInitRange("Plupload", "48319:48336");
__$coverInitRange("Plupload", "48474:48485");
__$coverInitRange("Plupload", "48513:48576");
__$coverInitRange("Plupload", "48581:48591");
__$coverInitRange("Plupload", "48597:48664");
__$coverInitRange("Plupload", "48670:48734");
__$coverInitRange("Plupload", "48740:48758");
__$coverInitRange("Plupload", "48763:48804");
__$coverInitRange("Plupload", "48810:48833");
__$coverInitRange("Plupload", "48876:48892");
__$coverInitRange("Plupload", "48897:48908");
__$coverInitRange("Plupload", "48555:48569");
__$coverInitRange("Plupload", "48618:48637");
__$coverInitRange("Plupload", "48643:48659");
__$coverInitRange("Plupload", "48690:48708");
__$coverInitRange("Plupload", "48714:48729");
__$coverInitRange("Plupload", "49180:49197");
__$coverInitRange("Plupload", "49201:51303");
__$coverInitRange("Plupload", "51307:51326");
__$coverInitRange("Plupload", "49234:51271");
__$coverInitRange("Plupload", "51276:51300");
__$coverInitRange("Plupload", "50648:50687");
__$coverInitRange("Plupload", "50693:50764");
__$coverInitRange("Plupload", "50967:51015");
__$coverInitRange("Plupload", "51021:51045");
__$coverInitRange("Plupload", "50998:51009");
__$coverInitRange("Plupload", "51162:51188");
__$coverInitRange("Plupload", "51194:51260");
__$coverInitRange("Plupload", "51210:51223");
__$coverInitRange("Plupload", "51230:51254");
__$coverInitRange("Plupload", "51459:51474");
__$coverInitRange("Plupload", "51620:51633");
__$coverInitRange("Plupload", "51715:51730");
__$coverInitRange("Plupload", "51818:51835");
__$coverInitRange("Plupload", "51929:51944");
__$coverInitRange("Plupload", "52040:52055");
__$coverInitRange("Plupload", "52153:52169");
__$coverInitRange("Plupload", "52261:52281");
__$coverInitRange("Plupload", "52365:52502");
__$coverInitRange("Plupload", "52393:52498");
__$coverCall('Plupload', '223:223');
;
__$coverCall('Plupload', '224:52554');
(function (window, o, undef) {
    __$coverCall('Plupload', '255:303');
    var delay = window.setTimeout, fileFilters = {};
    __$coverCall('Plupload', '304:304');
    ;
    __$coverCall('Plupload', '364:1794');
    function normalizeCaps(settings) {
        __$coverCall('Plupload', '402:454');
        var features = settings.required_features, caps = {};
        __$coverCall('Plupload', '458:1147');
        function resolve(feature, value, strict) {
            __$coverCall('Plupload', '606:1036');
            var map = {
                    chunks: 'slice_blob',
                    resize: 'send_binary_string',
                    jpgresize: 'send_binary_string',
                    pngresize: 'send_binary_string',
                    progress: 'report_upload_progress',
                    multi_selection: 'select_multiple',
                    max_file_size: 'access_binary',
                    dragdrop: 'drag_and_drop',
                    drop_element: 'drag_and_drop',
                    headers: 'send_custom_headers',
                    canSendBinary: 'send_binary',
                    triggerDialog: 'summon_file_dialog'
                };
            __$coverCall('Plupload', '1041:1144');
            if (map[feature]) {
                __$coverCall('Plupload', '1064:1090');
                caps[map[feature]] = value;
            } else if (!strict) {
                __$coverCall('Plupload', '1119:1140');
                caps[feature] = value;
            }
        }
        __$coverCall('Plupload', '1151:1776');
        if (typeof features === 'string') {
            __$coverCall('Plupload', '1190:1282');
            plupload.each(features.split(/\s*,\s*/), function (feature) {
                __$coverCall('Plupload', '1254:1276');
                resolve(feature, true);
            });
        } else if (typeof features === 'object') {
            __$coverCall('Plupload', '1331:1414');
            plupload.each(features, function (value, feature) {
                __$coverCall('Plupload', '1385:1408');
                resolve(feature, value);
            });
        } else if (features === true) {
            __$coverCall('Plupload', '1493:1594');
            if (!settings.multipart) {
                __$coverCall('Plupload', '1560:1590');
                caps.send_binary_string = true;
            }
            __$coverCall('Plupload', '1599:1659');
            if (settings.chunk_size > 0) {
                __$coverCall('Plupload', '1633:1655');
                caps.slice_blob = true;
            }
            __$coverCall('Plupload', '1666:1773');
            plupload.each(settings, function (value, feature) {
                __$coverCall('Plupload', '1720:1751');
                resolve(feature, !!value, true);
            });
        }
        __$coverCall('Plupload', '1781:1792');
        return caps;
    }
    __$coverCall('Plupload', '1838:14897');
    var plupload = {
            VERSION: '@@version@@',
            STOPPED: 1,
            STARTED: 2,
            QUEUED: 1,
            UPLOADING: 2,
            FAILED: 4,
            DONE: 5,
            GENERIC_ERROR: -100,
            HTTP_ERROR: -200,
            IO_ERROR: -300,
            SECURITY_ERROR: -400,
            INIT_ERROR: -500,
            FILE_SIZE_ERROR: -600,
            FILE_EXTENSION_ERROR: -601,
            FILE_DUPLICATE_ERROR: -602,
            IMAGE_FORMAT_ERROR: -700,
            IMAGE_MEMORY_ERROR: -701,
            IMAGE_DIMENSIONS_ERROR: -702,
            mimeTypes: o.mimes,
            ua: o.ua,
            typeOf: o.typeOf,
            extend: o.extend,
            guid: o.guid,
            each: o.each,
            getPos: o.getPos,
            getSize: o.getSize,
            xmlEncode: function (str) {
                __$coverCall('Plupload', '7398:7516');
                var xmlEncodeChars = {
                        '<': 'lt',
                        '>': 'gt',
                        '&': 'amp',
                        '"': 'quot',
                        '\'': '#39'
                    }, xmlEncodeRegExp = /[<>&\"\']/g;
                __$coverCall('Plupload', '7521:7667');
                return str ? ('' + str).replace(xmlEncodeRegExp, function (chr) {
                    __$coverCall('Plupload', '7589:7655');
                    return xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;
                }) : str;
            },
            toArray: o.toArray,
            inArray: o.inArray,
            addI18n: o.addI18n,
            translate: o.translate,
            isEmptyObj: o.isEmptyObj,
            hasClass: o.hasClass,
            addClass: o.addClass,
            removeClass: o.removeClass,
            getStyle: o.getStyle,
            addEvent: o.addEvent,
            removeEvent: o.removeEvent,
            removeAllEvents: o.removeAllEvents,
            cleanName: function (name) {
                __$coverCall('Plupload', '11316:11329');
                var i, lookup;
                __$coverCall('Plupload', '11358:11658');
                lookup = [
                    /[\300-\306]/g,
                    'A',
                    /[\340-\346]/g,
                    'a',
                    /\307/g,
                    'C',
                    /\347/g,
                    'c',
                    /[\310-\313]/g,
                    'E',
                    /[\350-\353]/g,
                    'e',
                    /[\314-\317]/g,
                    'I',
                    /[\354-\357]/g,
                    'i',
                    /\321/g,
                    'N',
                    /\361/g,
                    'n',
                    /[\322-\330]/g,
                    'O',
                    /[\362-\370]/g,
                    'o',
                    /[\331-\334]/g,
                    'U',
                    /[\371-\374]/g,
                    'u'
                ];
                __$coverCall('Plupload', '11663:11756');
                for (i = 0; i < lookup.length; i += 2) {
                    __$coverCall('Plupload', '11707:11752');
                    name = name.replace(lookup[i], lookup[i + 1]);
                }
                __$coverCall('Plupload', '11785:11817');
                name = name.replace(/\s+/g, '_');
                __$coverCall('Plupload', '11848:11892');
                name = name.replace(/[^a-z0-9_\-\.]+/gi, '');
                __$coverCall('Plupload', '11897:11908');
                return name;
            },
            buildUrl: function (url, items) {
                __$coverCall('Plupload', '12308:12322');
                var query = '';
                __$coverCall('Plupload', '12327:12469');
                plupload.each(items, function (value, name) {
                    __$coverCall('Plupload', '12375:12463');
                    query += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
                });
                __$coverCall('Plupload', '12474:12543');
                if (query) {
                    __$coverCall('Plupload', '12490:12539');
                    url += (url.indexOf('?') > 0 ? '&' : '?') + query;
                }
                __$coverCall('Plupload', '12548:12558');
                return url;
            },
            formatSize: function (size) {
                __$coverCall('Plupload', '12823:12903');
                if (size === undef || /\D/.test(size)) {
                    __$coverCall('Plupload', '12867:12899');
                    return plupload.translate('N/A');
                }
                __$coverCall('Plupload', '12916:13026');
                if (size > 1099511627776) {
                    __$coverCall('Plupload', '12947:13022');
                    return Math.round(size / 1099511627776, 1) + ' ' + plupload.translate('tb');
                }
                __$coverCall('Plupload', '13039:13143');
                if (size > 1073741824) {
                    __$coverCall('Plupload', '13067:13139');
                    return Math.round(size / 1073741824, 1) + ' ' + plupload.translate('gb');
                }
                __$coverCall('Plupload', '13156:13254');
                if (size > 1048576) {
                    __$coverCall('Plupload', '13181:13250');
                    return Math.round(size / 1048576, 1) + ' ' + plupload.translate('mb');
                }
                __$coverCall('Plupload', '13267:13359');
                if (size > 1024) {
                    __$coverCall('Plupload', '13289:13355');
                    return Math.round(size / 1024, 1) + ' ' + plupload.translate('kb');
                }
                __$coverCall('Plupload', '13364:13407');
                return size + ' ' + plupload.translate('b');
            },
            parseSize: o.parseSizeStr,
            predictRuntime: function (config, runtimes) {
                __$coverCall('Plupload', '14100:14115');
                var up, runtime;
                __$coverCall('Plupload', '14120:14169');
                if (runtimes) {
                    __$coverCall('Plupload', '14139:14165');
                    config.runtimes = runtimes;
                }
                __$coverCall('Plupload', '14173:14207');
                up = new plupload.Uploader(config);
                __$coverCall('Plupload', '14211:14231');
                runtime = up.runtime;
                __$coverCall('Plupload', '14235:14247');
                up.destroy();
                __$coverCall('Plupload', '14251:14265');
                return runtime;
            },
            addFileFilter: function (name, cb) {
                __$coverCall('Plupload', '14869:14891');
                fileFilters[name] = cb;
            }
        };
    __$coverCall('Plupload', '14901:15941');
    plupload.addFileFilter('mime_types', function () {
        __$coverCall('Plupload', '14953:14977');
        var _filters, _extRegExp;
        __$coverCall('Plupload', '15014:15485');
        function getExtRegExp(filters) {
            __$coverCall('Plupload', '15049:15074');
            var extensionsRegExp = [];
            __$coverCall('Plupload', '15079:15414');
            plupload.each(filters, function (filter) {
                __$coverCall('Plupload', '15124:15408');
                plupload.each(filter.extensions.split(/,/), function (ext) {
                    __$coverCall('Plupload', '15188:15401');
                    if (/^\s*\*\s*$/.test(ext)) {
                        __$coverCall('Plupload', '15223:15252');
                        extensionsRegExp.push('\\.*');
                    } else {
                        __$coverCall('Plupload', '15272:15395');
                        extensionsRegExp.push('\\.' + ext.replace(new RegExp('[' + '/^$.*+?|()[]{}\\'.replace(/./g, '\\$&') + ']', 'g'), '\\$&'));
                    }
                });
            });
            __$coverCall('Plupload', '15419:15482');
            return new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');
        }
        __$coverCall('Plupload', '15489:15934');
        return function (filters, file) {
            __$coverCall('Plupload', '15524:15705');
            if (!_extRegExp || filters != _filters) {
                __$coverCall('Plupload', '15629:15663');
                _extRegExp = getExtRegExp(filters);
                __$coverCall('Plupload', '15668:15701');
                _filters = [].slice.call(filters);
            }
            __$coverCall('Plupload', '15710:15915');
            if (!_extRegExp.test(file.name)) {
                __$coverCall('Plupload', '15748:15894');
                this.trigger('Error', {
                    code: plupload.FILE_EXTENSION_ERROR,
                    message: plupload.translate('File extension error.'),
                    file: file
                });
                __$coverCall('Plupload', '15899:15911');
                return false;
            }
            __$coverCall('Plupload', '15919:15930');
            return true;
        };
    }());
    __$coverCall('Plupload', '15945:16279');
    plupload.addFileFilter('max_file_size', function (maxSize, file) {
        __$coverCall('Plupload', '16012:16021');
        var undef;
        __$coverCall('Plupload', '16047:16261');
        if (file.size !== undef && maxSize && file.size > maxSize) {
            __$coverCall('Plupload', '16110:16242');
            this.trigger('Error', {
                code: plupload.FILE_SIZE_ERROR,
                message: plupload.translate('File size error.'),
                file: file
            });
            __$coverCall('Plupload', '16246:16258');
            return false;
        }
        __$coverCall('Plupload', '16264:16275');
        return true;
    });
    __$coverCall('Plupload', '16283:16789');
    plupload.addFileFilter('prevent_duplicates', function (value, file) {
        __$coverCall('Plupload', '16353:16771');
        if (value) {
            __$coverCall('Plupload', '16368:16394');
            var ii = this.files.length;
            __$coverCall('Plupload', '16398:16768');
            while (ii--) {
                __$coverCall('Plupload', '16509:16764');
                if (file.name === this.files[ii].name && file.size === this.files[ii].size) {
                    __$coverCall('Plupload', '16591:16741');
                    this.trigger('Error', {
                        code: plupload.FILE_DUPLICATE_ERROR,
                        message: plupload.translate('Duplicate file error.'),
                        file: file
                    });
                    __$coverCall('Plupload', '16747:16759');
                    return false;
                }
            }
        }
        __$coverCall('Plupload', '16774:16785');
        return true;
    });
    __$coverCall('Plupload', '20068:48920');
    plupload.Uploader = function (settings) {
        __$coverCall('Plupload', '24158:24271');
        var files = [], events = {}, required_caps = {}, startTime, total, disabled = false, fileInput, fileDrop, xhr;
        __$coverCall('Plupload', '24296:24946');
        function uploadNext() {
            __$coverCall('Plupload', '24322:24344');
            var file, count = 0, i;
            __$coverCall('Plupload', '24349:24943');
            if (this.state == plupload.STARTED) {
                __$coverCall('Plupload', '24419:24703');
                for (i = 0; i < files.length; i++) {
                    __$coverCall('Plupload', '24460:24698');
                    if (!file && files[i].status == plupload.QUEUED) {
                        __$coverCall('Plupload', '24516:24531');
                        file = files[i];
                        __$coverCall('Plupload', '24538:24665');
                        if (this.trigger('BeforeUpload', file)) {
                            __$coverCall('Plupload', '24586:24618');
                            file.status = plupload.UPLOADING;
                            __$coverCall('Plupload', '24626:24658');
                            this.trigger('UploadFile', file);
                        }
                    } else {
                        __$coverCall('Plupload', '24685:24692');
                        count++;
                    }
                }
                __$coverCall('Plupload', '24744:24939');
                if (count == files.length) {
                    __$coverCall('Plupload', '24777:24891');
                    if (this.state !== plupload.STOPPED) {
                        __$coverCall('Plupload', '24821:24850');
                        this.state = plupload.STOPPED;
                        __$coverCall('Plupload', '24857:24885');
                        this.trigger('StateChanged');
                    }
                    __$coverCall('Plupload', '24897:24934');
                    this.trigger('UploadComplete', files);
                }
            }
        }
        __$coverCall('Plupload', '24950:25068');
        function calcFile(file) {
            __$coverCall('Plupload', '24978:25055');
            file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
            __$coverCall('Plupload', '25059:25065');
            calc();
        }
        __$coverCall('Plupload', '25072:26183');
        function calc() {
            __$coverCall('Plupload', '25092:25103');
            var i, file;
            __$coverCall('Plupload', '25125:25138');
            total.reset();
            __$coverCall('Plupload', '25192:25775');
            for (i = 0; i < files.length; i++) {
                __$coverCall('Plupload', '25232:25247');
                file = files[i];
                __$coverCall('Plupload', '25253:25604');
                if (file.size !== undef) {
                    __$coverCall('Plupload', '25339:25366');
                    total.size += file.origSize;
                    __$coverCall('Plupload', '25508:25563');
                    total.loaded += file.loaded * file.origSize / file.size;
                } else {
                    __$coverCall('Plupload', '25581:25599');
                    total.size = undef;
                }
                __$coverCall('Plupload', '25610:25771');
                if (file.status == plupload.DONE) {
                    __$coverCall('Plupload', '25650:25666');
                    total.uploaded++;
                } else if (file.status == plupload.FAILED) {
                    __$coverCall('Plupload', '25720:25734');
                    total.failed++;
                } else {
                    __$coverCall('Plupload', '25752:25766');
                    total.queued++;
                }
            }
            __$coverCall('Plupload', '25873:26180');
            if (total.size === undef) {
                __$coverCall('Plupload', '25904:25989');
                total.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;
            } else {
                __$coverCall('Plupload', '26005:26092');
                total.bytesPerSec = Math.ceil(total.loaded / ((+new Date() - startTime || 1) / 1000));
                __$coverCall('Plupload', '26097:26176');
                total.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;
            }
        }
        __$coverCall('Plupload', '26187:29409');
        function initControls() {
            __$coverCall('Plupload', '26215:26247');
            var self = this, initialized = 0;
            __$coverCall('Plupload', '26273:26479');
            var options = {
                    accept: settings.filters.mime_types,
                    runtime_order: settings.runtimes,
                    required_caps: required_caps,
                    swf_url: settings.flash_swf_url,
                    xap_url: settings.silverlight_xap_url
                };
            __$coverCall('Plupload', '26525:26674');
            plupload.each(settings.runtimes.split(/\s*,\s*/), function (runtime) {
                __$coverCall('Plupload', '26598:26668');
                if (settings[runtime]) {
                    __$coverCall('Plupload', '26627:26663');
                    options[runtime] = settings[runtime];
                }
            });
            __$coverCall('Plupload', '26679:29406');
            o.inSeries([
                function (cb) {
                    __$coverCall('Plupload', '26752:28372');
                    if (settings.browse_button) {
                        __$coverCall('Plupload', '26787:27014');
                        fileInput = new o.FileInput(plupload.extend({}, options, {
                            name: settings.file_data_name,
                            multiple: settings.multi_selection,
                            container: settings.container,
                            browse_button: settings.browse_button
                        }));
                        __$coverCall('Plupload', '27022:27358');
                        fileInput.onready = function () {
                            __$coverCall('Plupload', '27061:27100');
                            var info = o.Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '27145:27316');
                            o.extend(self.features, {
                                chunks: info.can('slice_blob'),
                                multipart: info.can('send_multipart'),
                                multi_selection: info.can('select_multiple')
                            });
                            __$coverCall('Plupload', '27325:27338');
                            initialized++;
                            __$coverCall('Plupload', '27346:27350');
                            cb();
                        };
                        __$coverCall('Plupload', '27366:27438');
                        fileInput.onchange = function () {
                            __$coverCall('Plupload', '27406:27430');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '27446:28217');
                        fileInput.bind('mouseenter mouseleave mousedown mouseup', function (e) {
                            __$coverCall('Plupload', '27524:28208');
                            if (!disabled) {
                                __$coverCall('Plupload', '27548:27591');
                                var bButton = o.get(settings.browse_button);
                                __$coverCall('Plupload', '27600:28200');
                                if (bButton) {
                                    __$coverCall('Plupload', '27623:27890');
                                    if (settings.browse_button_hover) {
                                        __$coverCall('Plupload', '27668:27880');
                                        if ('mouseenter' === e.type) {
                                            __$coverCall('Plupload', '27709:27758');
                                            o.addClass(bButton, settings.browse_button_hover);
                                        } else if ('mouseleave' === e.type) {
                                            __$coverCall('Plupload', '27817:27869');
                                            o.removeClass(bButton, settings.browse_button_hover);
                                        }
                                    }
                                    __$coverCall('Plupload', '27901:28167');
                                    if (settings.browse_button_active) {
                                        __$coverCall('Plupload', '27947:28157');
                                        if ('mousedown' === e.type) {
                                            __$coverCall('Plupload', '27987:28037');
                                            o.addClass(bButton, settings.browse_button_active);
                                        } else if ('mouseup' === e.type) {
                                            __$coverCall('Plupload', '28093:28146');
                                            o.removeClass(bButton, settings.browse_button_active);
                                        }
                                    }
                                    __$coverCall('Plupload', '28177:28191');
                                    bButton = null;
                                }
                            }
                        });
                        __$coverCall('Plupload', '28225:28318');
                        fileInput.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '28281:28297');
                            fileInput = null;
                            __$coverCall('Plupload', '28305:28309');
                            cb();
                        });
                        __$coverCall('Plupload', '28326:28342');
                        fileInput.init();
                    } else {
                        __$coverCall('Plupload', '28362:28366');
                        cb();
                    }
                },
                function (cb) {
                    __$coverCall('Plupload', '28454:29007');
                    if (settings.drop_element) {
                        __$coverCall('Plupload', '28488:28592');
                        fileDrop = new o.FileDrop(plupload.extend({}, options, { drop_zone: settings.drop_element }));
                        __$coverCall('Plupload', '28600:28778');
                        fileDrop.onready = function () {
                            __$coverCall('Plupload', '28638:28677');
                            var info = o.Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '28686:28736');
                            self.features.dragdrop = info.can('drag_and_drop');
                            __$coverCall('Plupload', '28745:28758');
                            initialized++;
                            __$coverCall('Plupload', '28766:28770');
                            cb();
                        };
                        __$coverCall('Plupload', '28786:28855');
                        fileDrop.ondrop = function () {
                            __$coverCall('Plupload', '28823:28847');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '28863:28954');
                        fileDrop.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '28918:28933');
                            fileDrop = null;
                            __$coverCall('Plupload', '28941:28945');
                            cb();
                        });
                        __$coverCall('Plupload', '28962:28977');
                        fileDrop.init();
                    } else {
                        __$coverCall('Plupload', '28997:29001');
                        cb();
                    }
                }
            ], function () {
                __$coverCall('Plupload', '29037:29212');
                if (typeof settings.init == 'function') {
                    __$coverCall('Plupload', '29084:29103');
                    settings.init(self);
                } else {
                    __$coverCall('Plupload', '29121:29207');
                    plupload.each(settings.init, function (func, name) {
                        __$coverCall('Plupload', '29178:29199');
                        self.bind(name, func);
                    });
                }
                __$coverCall('Plupload', '29218:29400');
                if (initialized) {
                    __$coverCall('Plupload', '29241:29265');
                    self.trigger('PostInit');
                } else {
                    __$coverCall('Plupload', '29283:29395');
                    self.trigger('Error', {
                        code: plupload.INIT_ERROR,
                        message: plupload.translate('Init error.')
                    });
                }
            });
        }
        __$coverCall('Plupload', '29413:29576');
        function runtimeCan(file, cap) {
            __$coverCall('Plupload', '29448:29557');
            if (file.ruid) {
                __$coverCall('Plupload', '29468:29507');
                var info = o.Runtime.getInfo(file.ruid);
                __$coverCall('Plupload', '29512:29553');
                if (info) {
                    __$coverCall('Plupload', '29528:29548');
                    return info.can(cap);
                }
            }
            __$coverCall('Plupload', '29561:29573');
            return false;
        }
        __$coverCall('Plupload', '29580:29991');
        function resizeImage(blob, params, cb) {
            __$coverCall('Plupload', '29623:29646');
            var img = new o.Image();
            __$coverCall('Plupload', '29651:29988');
            try {
                __$coverCall('Plupload', '29660:29775');
                img.onload = function () {
                    __$coverCall('Plupload', '29690:29769');
                    img.downsize(params.width, params.height, params.crop, params.preserve_headers);
                };
                __$coverCall('Plupload', '29781:29884');
                img.onresize = function () {
                    __$coverCall('Plupload', '29813:29858');
                    cb(this.getAsBlob(blob.type, params.quality));
                    __$coverCall('Plupload', '29864:29878');
                    this.destroy();
                };
                __$coverCall('Plupload', '29890:29935');
                img.onerror = function () {
                    __$coverCall('Plupload', '29921:29929');
                    cb(blob);
                };
                __$coverCall('Plupload', '29941:29955');
                img.load(blob);
            } catch (ex) {
                __$coverCall('Plupload', '29976:29984');
                cb(blob);
            }
        }
        __$coverCall('Plupload', '30019:30055');
        total = new plupload.QueueProgress();
        __$coverCall('Plupload', '30080:30432');
        settings = plupload.extend({
            runtimes: o.Runtime.order,
            max_retries: 0,
            multipart: true,
            multi_selection: true,
            file_data_name: 'file',
            flash_swf_url: 'js/Moxie.swf',
            silverlight_xap_url: 'js/Moxie.xap',
            send_chunk_number: true,
            method: 'post'
        }, settings);
        __$coverCall('Plupload', '30456:30583');
        if (settings.resize) {
            __$coverCall('Plupload', '30481:30580');
            settings.resize = plupload.extend({
                preserve_headers: true,
                crop: false
            }, settings.resize);
        }
        __$coverCall('Plupload', '30608:30674');
        settings.chunk_size = plupload.parseSize(settings.chunk_size) || 0;
        __$coverCall('Plupload', '30699:30813');
        if (plupload.typeOf(settings.filters) === 'array') {
            __$coverCall('Plupload', '30754:30810');
            settings.filters = { mime_types: settings.filters };
        }
        __$coverCall('Plupload', '30816:31010');
        settings.filters = plupload.extend({
            mime_types: [],
            prevent_duplicates: !!settings.prevent_duplicates,
            max_file_size: plupload.parseSize(settings.max_file_size) || 0
        }, settings.filters);
        __$coverCall('Plupload', '31016:31105');
        settings.required_features = required_caps = normalizeCaps(plupload.extend({}, settings));
        __$coverCall('Plupload', '31133:48917');
        plupload.extend(this, {
            id: plupload.guid(),
            state: plupload.STOPPED,
            features: {},
            runtime: o.Runtime.thatCan(required_caps, settings.runtimes),
            files: files,
            settings: settings,
            total: total,
            init: function () {
                __$coverCall('Plupload', '32694:32709');
                var self = this;
                __$coverCall('Plupload', '32715:32769');
                settings.browse_button = o.get(settings.browse_button);
                __$coverCall('Plupload', '32813:32865');
                settings.drop_element = o.get(settings.drop_element);
                __$coverCall('Plupload', '32872:33056');
                if (typeof settings.preinit == 'function') {
                    __$coverCall('Plupload', '32922:32944');
                    settings.preinit(self);
                } else {
                    __$coverCall('Plupload', '32962:33051');
                    plupload.each(settings.preinit, function (func, name) {
                        __$coverCall('Plupload', '33022:33043');
                        self.bind(name, func);
                    });
                }
                __$coverCall('Plupload', '33096:33277');
                if (!settings.browse_button || !settings.url) {
                    __$coverCall('Plupload', '33148:33260');
                    this.trigger('Error', {
                        code: plupload.INIT_ERROR,
                        message: plupload.translate('Init error.')
                    });
                    __$coverCall('Plupload', '33266:33272');
                    return;
                }
                __$coverCall('Plupload', '33284:33517');
                self.bind('BeforeAdd', function (up, file) {
                    __$coverCall('Plupload', '33332:33369');
                    var name, rules = up.settings.filters;
                    __$coverCall('Plupload', '33375:33510');
                    for (name in rules) {
                        __$coverCall('Plupload', '33402:33504');
                        if (fileFilters[name] && !fileFilters[name].call(this, rules[name], file)) {
                            __$coverCall('Plupload', '33485:33497');
                            return false;
                        }
                    }
                });
                __$coverCall('Plupload', '33524:33747');
                self.bind('FilesAdded', function (up, filteredFiles) {
                    __$coverCall('Plupload', '33612:33647');
                    [].push.apply(files, filteredFiles);
                    __$coverCall('Plupload', '33654:33738');
                    delay(function () {
                        __$coverCall('Plupload', '33678:33706');
                        self.trigger('QueueChanged');
                        __$coverCall('Plupload', '33713:33727');
                        self.refresh();
                    }, 1);
                });
                __$coverCall('Plupload', '33753:33836');
                self.bind('CancelUpload', function () {
                    __$coverCall('Plupload', '33796:33829');
                    if (xhr) {
                        __$coverCall('Plupload', '33812:33823');
                        xhr.abort();
                    }
                });
                __$coverCall('Plupload', '33881:34132');
                if (settings.unique_names) {
                    __$coverCall('Plupload', '33914:34127');
                    self.bind('BeforeUpload', function (up, file) {
                        __$coverCall('Plupload', '33966:34023');
                        var matches = file.name.match(/\.([^.]+)$/), ext = 'part';
                        __$coverCall('Plupload', '34030:34074');
                        if (matches) {
                            __$coverCall('Plupload', '34051:34067');
                            ext = matches[1];
                        }
                        __$coverCall('Plupload', '34081:34119');
                        file.target_name = file.id + '.' + ext;
                    });
                }
                __$coverCall('Plupload', '34138:39872');
                self.bind('UploadFile', function (up, file) {
                    __$coverCall('Plupload', '34187:34329');
                    var url = up.settings.url, features = up.features, chunkSize = settings.chunk_size, retries = settings.max_retries, blob, offset = 0;
                    __$coverCall('Plupload', '34386:34486');
                    if (file.loaded) {
                        __$coverCall('Plupload', '34410:34480');
                        offset = file.loaded = chunkSize * Math.floor(file.loaded / chunkSize);
                    }
                    __$coverCall('Plupload', '34493:34914');
                    function handleError() {
                        __$coverCall('Plupload', '34523:34908');
                        if (retries-- > 0) {
                            __$coverCall('Plupload', '34550:34575');
                            delay(uploadNextChunk, 1);
                        } else {
                            __$coverCall('Plupload', '34597:34617');
                            file.loaded = offset;
                            __$coverCall('Plupload', '34648:34901');
                            up.trigger('Error', {
                                code: plupload.HTTP_ERROR,
                                message: plupload.translate('HTTP Error.'),
                                file: file,
                                response: xhr.responseText,
                                status: xhr.status,
                                responseHeaders: xhr.getAllResponseHeaders()
                            });
                        }
                    }
                    __$coverCall('Plupload', '34921:39283');
                    self.bind('UploadChunk', function () {
                        __$coverCall('Plupload', '34964:35007');
                        var chunkBlob, formData, args, curChunkSize;
                        __$coverCall('Plupload', '35044:35165');
                        if (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {
                            __$coverCall('Plupload', '35152:35158');
                            return;
                        }
                        __$coverCall('Plupload', '35200:35245');
                        args = { name: file.target_name || file.name };
                        __$coverCall('Plupload', '35253:35571');
                        if (chunkSize && features.chunks && blob.size > chunkSize) {
                            __$coverCall('Plupload', '35379:35433');
                            curChunkSize = Math.min(chunkSize, blob.size - offset);
                            __$coverCall('Plupload', '35441:35494');
                            chunkBlob = blob.slice(offset, offset + curChunkSize);
                        } else {
                            __$coverCall('Plupload', '35516:35540');
                            curChunkSize = blob.size;
                            __$coverCall('Plupload', '35548:35564');
                            chunkBlob = blob;
                        }
                        __$coverCall('Plupload', '35684:36052');
                        if (chunkSize && features.chunks) {
                            __$coverCall('Plupload', '35764:36045');
                            if (settings.send_chunk_number) {
                                __$coverCall('Plupload', '35805:35847');
                                args.chunk = Math.ceil(offset / chunkSize);
                                __$coverCall('Plupload', '35856:35902');
                                args.chunks = Math.ceil(blob.size / chunkSize);
                            } else {
                                __$coverCall('Plupload', '35986:36006');
                                args.offset = offset;
                                __$coverCall('Plupload', '36015:36037');
                                args.total = blob.size;
                            }
                        }
                        __$coverCall('Plupload', '36060:36088');
                        xhr = new o.XMLHttpRequest();
                        __$coverCall('Plupload', '36139:36319');
                        if (xhr.upload) {
                            __$coverCall('Plupload', '36163:36312');
                            xhr.upload.onprogress = function (e) {
                                __$coverCall('Plupload', '36208:36260');
                                file.loaded = Math.min(file.size, offset + e.loaded);
                                __$coverCall('Plupload', '36269:36303');
                                up.trigger('UploadProgress', file);
                            };
                        }
                        __$coverCall('Plupload', '36327:37612');
                        xhr.onload = function () {
                            __$coverCall('Plupload', '36404:36472');
                            if (xhr.status >= 400) {
                                __$coverCall('Plupload', '36436:36449');
                                handleError();
                                __$coverCall('Plupload', '36458:36464');
                                return;
                            }
                            __$coverCall('Plupload', '36512:36938');
                            if (curChunkSize < blob.size) {
                                __$coverCall('Plupload', '36551:36570');
                                chunkBlob.destroy();
                                __$coverCall('Plupload', '36580:36602');
                                offset += curChunkSize;
                                __$coverCall('Plupload', '36611:36652');
                                file.loaded = Math.min(offset, blob.size);
                                __$coverCall('Plupload', '36662:36883');
                                up.trigger('ChunkUploaded', file, {
                                    offset: file.loaded,
                                    total: blob.size,
                                    response: xhr.responseText,
                                    status: xhr.status,
                                    responseHeaders: xhr.getAllResponseHeaders()
                                });
                            } else {
                                __$coverCall('Plupload', '36907:36930');
                                file.loaded = file.size;
                            }
                            __$coverCall('Plupload', '36947:36974');
                            chunkBlob = formData = null;
                            __$coverCall('Plupload', '37033:37604');
                            if (!offset || offset >= blob.size) {
                                __$coverCall('Plupload', '37127:37213');
                                if (file.size != file.origSize) {
                                    __$coverCall('Plupload', '37169:37183');
                                    blob.destroy();
                                    __$coverCall('Plupload', '37193:37204');
                                    blob = null;
                                }
                                __$coverCall('Plupload', '37223:37257');
                                up.trigger('UploadProgress', file);
                                __$coverCall('Plupload', '37267:37294');
                                file.status = plupload.DONE;
                                __$coverCall('Plupload', '37304:37467');
                                up.trigger('FileUploaded', file, {
                                    response: xhr.responseText,
                                    status: xhr.status,
                                    responseHeaders: xhr.getAllResponseHeaders()
                                });
                            } else {
                                __$coverCall('Plupload', '37519:37544');
                                delay(uploadNextChunk, 1);
                            }
                        };
                        __$coverCall('Plupload', '37620:37674');
                        xhr.onerror = function () {
                            __$coverCall('Plupload', '37653:37666');
                            handleError();
                        };
                        __$coverCall('Plupload', '37682:37757');
                        xhr.onloadend = function () {
                            __$coverCall('Plupload', '37717:37731');
                            this.destroy();
                            __$coverCall('Plupload', '37739:37749');
                            xhr = null;
                        };
                        __$coverCall('Plupload', '37797:39275');
                        if (up.settings.multipart && features.multipart) {
                            __$coverCall('Plupload', '37855:37896');
                            args.name = file.target_name || file.name;
                            __$coverCall('Plupload', '37905:37944');
                            xhr.open(up.settings.method, url, true);
                            __$coverCall('Plupload', '37981:38090');
                            plupload.each(up.settings.headers, function (value, name) {
                                __$coverCall('Plupload', '38047:38080');
                                xhr.setRequestHeader(name, value);
                            });
                            __$coverCall('Plupload', '38099:38126');
                            formData = new o.FormData();
                            __$coverCall('Plupload', '38165:38301');
                            plupload.each(plupload.extend(args, up.settings.multipart_params), function (value, name) {
                                __$coverCall('Plupload', '38263:38291');
                                formData.append(name, value);
                            });
                            __$coverCall('Plupload', '38340:38394');
                            formData.append(up.settings.file_data_name, chunkBlob);
                            __$coverCall('Plupload', '38402:38603');
                            xhr.send(formData, {
                                runtime_order: up.settings.runtimes,
                                required_caps: required_caps,
                                swf_url: up.settings.flash_swf_url,
                                xap_url: up.settings.silverlight_xap_url
                            });
                        } else {
                            __$coverCall('Plupload', '38673:38766');
                            url = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));
                            __$coverCall('Plupload', '38775:38814');
                            xhr.open(up.settings.method, url, true);
                            __$coverCall('Plupload', '38823:38887');
                            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                            __$coverCall('Plupload', '38948:39057');
                            plupload.each(up.settings.headers, function (value, name) {
                                __$coverCall('Plupload', '39014:39047');
                                xhr.setRequestHeader(name, value);
                            });
                            __$coverCall('Plupload', '39066:39268');
                            xhr.send(chunkBlob, {
                                runtime_order: up.settings.runtimes,
                                required_caps: required_caps,
                                swf_url: up.settings.flash_swf_url,
                                xap_url: up.settings.silverlight_xap_url
                            });
                        }
                    });
                    __$coverCall('Plupload', '39294:39417');
                    function uploadNextChunk() {
                        __$coverCall('Plupload', '39327:39411');
                        if (self.trigger('BeforeUploadChunk', file)) {
                            __$coverCall('Plupload', '39377:39404');
                            self.trigger('UploadChunk');
                        }
                    }
                    __$coverCall('Plupload', '39424:39447');
                    blob = file.getSource();
                    __$coverCall('Plupload', '39484:39865');
                    if (!o.isEmptyObj(up.settings.resize) && runtimeCan(blob, 'send_binary_string') && !!~o.inArray(blob.type, [
                            'image/jpeg',
                            'image/png'
                        ])) {
                        __$coverCall('Plupload', '39655:39822');
                        resizeImage.call(this, blob, up.settings.resize, function (resizedBlob) {
                            __$coverCall('Plupload', '39734:39752');
                            blob = resizedBlob;
                            __$coverCall('Plupload', '39760:39788');
                            file.size = resizedBlob.size;
                            __$coverCall('Plupload', '39796:39813');
                            uploadNextChunk();
                        });
                    } else {
                        __$coverCall('Plupload', '39842:39859');
                        uploadNextChunk();
                    }
                });
                __$coverCall('Plupload', '39878:39952');
                self.bind('UploadProgress', function (up, file) {
                    __$coverCall('Plupload', '39931:39945');
                    calcFile(file);
                });
                __$coverCall('Plupload', '39958:40392');
                self.bind('StateChanged', function (up) {
                    __$coverCall('Plupload', '40003:40385');
                    if (up.state == plupload.STARTED) {
                        __$coverCall('Plupload', '40084:40109');
                        startTime = +new Date();
                    } else if (up.state == plupload.STOPPED) {
                        __$coverCall('Plupload', '40203:40379');
                        for (var i = up.files.length - 1; i >= 0; i--) {
                            __$coverCall('Plupload', '40258:40372');
                            if (up.files[i].status == plupload.UPLOADING) {
                                __$coverCall('Plupload', '40313:40349');
                                up.files[i].status = plupload.QUEUED;
                                __$coverCall('Plupload', '40358:40364');
                                calc();
                            }
                        }
                    }
                });
                __$coverCall('Plupload', '40398:40429');
                self.bind('QueueChanged', calc);
                __$coverCall('Plupload', '40435:40869');
                self.bind('Error', function (up, err) {
                    __$coverCall('Plupload', '40533:40862');
                    if (err.file) {
                        __$coverCall('Plupload', '40554:40587');
                        err.file.status = plupload.FAILED;
                        __$coverCall('Plupload', '40595:40613');
                        calcFile(err.file);
                        __$coverCall('Plupload', '40747:40856');
                        if (up.state == plupload.STARTED) {
                            __$coverCall('Plupload', '40789:40849');
                            delay(function () {
                                __$coverCall('Plupload', '40815:40836');
                                uploadNext.call(self);
                            }, 1);
                        }
                    }
                });
                __$coverCall('Plupload', '40875:41118');
                self.bind('FileUploaded', function () {
                    __$coverCall('Plupload', '40918:40924');
                    calc();
                    __$coverCall('Plupload', '41055:41111');
                    delay(function () {
                        __$coverCall('Plupload', '41079:41100');
                        uploadNext.call(self);
                    }, 1);
                });
                __$coverCall('Plupload', '41319:41366');
                self.trigger('Init', { runtime: this.runtime });
                __$coverCall('Plupload', '41372:41395');
                initControls.call(this);
            },
            refresh: function () {
                __$coverCall('Plupload', '41632:41686');
                if (fileInput) {
                    __$coverCall('Plupload', '41653:41681');
                    fileInput.trigger('Refresh');
                }
                __$coverCall('Plupload', '41691:41714');
                this.trigger('Refresh');
            },
            start: function () {
                __$coverCall('Plupload', '41824:41962');
                if (this.state != plupload.STARTED) {
                    __$coverCall('Plupload', '41866:41895');
                    this.state = plupload.STARTED;
                    __$coverCall('Plupload', '41901:41929');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '41936:41957');
                    uploadNext.call(this);
                }
            },
            stop: function () {
                __$coverCall('Plupload', '42073:42217');
                if (this.state != plupload.STOPPED) {
                    __$coverCall('Plupload', '42115:42144');
                    this.state = plupload.STOPPED;
                    __$coverCall('Plupload', '42150:42178');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '42184:42212');
                    this.trigger('CancelUpload');
                }
            },
            disableBrowse: function () {
                __$coverCall('Plupload', '42427:42482');
                disabled = arguments[0] !== undef ? arguments[0] : true;
                __$coverCall('Plupload', '42488:42541');
                if (fileInput) {
                    __$coverCall('Plupload', '42509:42536');
                    fileInput.disable(disabled);
                }
                __$coverCall('Plupload', '42547:42586');
                this.trigger('DisableBrowse', disabled);
            },
            getFile: function (id) {
                __$coverCall('Plupload', '42827:42832');
                var i;
                __$coverCall('Plupload', '42837:42940');
                for (i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '42883:42935');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '42914:42929');
                        return files[i];
                    }
                }
            },
            addFile: function (file, fileName) {
                __$coverCall('Plupload', '43463:43508');
                var self = this, files = [], ruid;
                __$coverCall('Plupload', '43509:43509');
                ;
                __$coverCall('Plupload', '43515:43652');
                function getRUID() {
                    __$coverCall('Plupload', '43540:43572');
                    var ctrl = fileDrop || fileInput;
                    __$coverCall('Plupload', '43578:43629');
                    if (ctrl) {
                        __$coverCall('Plupload', '43595:43623');
                        return ctrl.getRuntime().uid;
                    }
                    __$coverCall('Plupload', '43635:43647');
                    return false;
                }
                __$coverCall('Plupload', '43658:44768');
                function resolveFile(file) {
                    __$coverCall('Plupload', '43691:43716');
                    var type = o.typeOf(file);
                    __$coverCall('Plupload', '43723:44763');
                    if (file instanceof o.File) {
                        __$coverCall('Plupload', '43759:43901');
                        if (!file.ruid) {
                            __$coverCall('Plupload', '43783:43837');
                            if (!ruid) {
                                __$coverCall('Plupload', '43817:43829');
                                return false;
                            }
                            __$coverCall('Plupload', '43845:43861');
                            file.ruid = ruid;
                            __$coverCall('Plupload', '43869:43894');
                            file.connectRuntime(ruid);
                        }
                        __$coverCall('Plupload', '43908:43944');
                        resolveFile(new plupload.File(file));
                    } else if (file instanceof o.Blob) {
                        __$coverCall('Plupload', '43992:44021');
                        resolveFile(file.getSource());
                        __$coverCall('Plupload', '44028:44042');
                        file.destroy();
                    } else if (file instanceof plupload.File) {
                        __$coverCall('Plupload', '44130:44179');
                        if (fileName) {
                            __$coverCall('Plupload', '44152:44172');
                            file.name = fileName;
                        }
                        __$coverCall('Plupload', '44251:44319');
                        if (self.trigger('BeforeAdd', file)) {
                            __$coverCall('Plupload', '44296:44312');
                            files.push(file);
                        }
                    } else if (o.inArray(type, [
                            'file',
                            'blob'
                        ]) !== -1) {
                        __$coverCall('Plupload', '44385:44420');
                        resolveFile(new o.File(null, file));
                    } else if (type === 'node' && o.typeOf(file.files) === 'filelist') {
                        __$coverCall('Plupload', '44550:44581');
                        o.each(file.files, resolveFile);
                    } else if (type === 'array') {
                        __$coverCall('Plupload', '44643:44658');
                        fileName = null;
                        __$coverCall('Plupload', '44732:44757');
                        o.each(file, resolveFile);
                    }
                }
                __$coverCall('Plupload', '44774:44790');
                ruid = getRUID();
                __$coverCall('Plupload', '44796:44813');
                resolveFile(file);
                __$coverCall('Plupload', '44866:44928');
                if (files.length) {
                    __$coverCall('Plupload', '44890:44923');
                    this.trigger('FilesAdded', files);
                }
            },
            removeFile: function (file) {
                __$coverCall('Plupload', '45109:45160');
                var id = typeof file === 'string' ? file : file.id;
                __$coverCall('Plupload', '45166:45285');
                for (var i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '45216:45280');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '45247:45274');
                        return this.splice(i, 1)[0];
                    }
                }
            },
            splice: function (start, length) {
                __$coverCall('Plupload', '45714:45811');
                var removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);
                __$coverCall('Plupload', '45817:45854');
                this.trigger('FilesRemoved', removed);
                __$coverCall('Plupload', '45859:45887');
                this.trigger('QueueChanged');
                __$coverCall('Plupload', '45946:46011');
                plupload.each(removed, function (file) {
                    __$coverCall('Plupload', '45990:46004');
                    file.destroy();
                });
                __$coverCall('Plupload', '46017:46031');
                return removed;
            },
            trigger: function (name) {
                __$coverCall('Plupload', '46321:46367');
                var list = events[name.toLowerCase()], i, args;
                __$coverCall('Plupload', '46410:46763');
                if (list) {
                    __$coverCall('Plupload', '46466:46510');
                    args = Array.prototype.slice.call(arguments);
                    __$coverCall('Plupload', '46516:46530');
                    args[0] = this;
                    __$coverCall('Plupload', '46576:46758');
                    for (i = 0; i < list.length; i++) {
                        __$coverCall('Plupload', '46670:46752');
                        if (list[i].func.apply(list[i].scope, args) === false) {
                            __$coverCall('Plupload', '46733:46745');
                            return false;
                        }
                    }
                }
                __$coverCall('Plupload', '46769:46780');
                return true;
            },
            hasEventListener: function (name) {
                __$coverCall('Plupload', '46997:47032');
                return !!events[name.toLowerCase()];
            },
            bind: function (name, func, scope) {
                __$coverCall('Plupload', '47358:47366');
                var list;
                __$coverCall('Plupload', '47372:47397');
                name = name.toLowerCase();
                __$coverCall('Plupload', '47402:47427');
                list = events[name] || [];
                __$coverCall('Plupload', '47432:47479');
                list.push({
                    func: func,
                    scope: scope || this
                });
                __$coverCall('Plupload', '47484:47503');
                events[name] = list;
            },
            unbind: function (name) {
                __$coverCall('Plupload', '47735:47760');
                name = name.toLowerCase();
                __$coverCall('Plupload', '47766:47813');
                var list = events[name], i, func = arguments[1];
                __$coverCall('Plupload', '47819:48137');
                if (list) {
                    __$coverCall('Plupload', '47835:48027');
                    if (func !== undef) {
                        __$coverCall('Plupload', '47862:47992');
                        for (i = list.length - 1; i >= 0; i--) {
                            __$coverCall('Plupload', '47909:47985');
                            if (list[i].func === func) {
                                __$coverCall('Plupload', '47945:47962');
                                list.splice(i, 1);
                                __$coverCall('Plupload', '47972:47977');
                                break;
                            }
                        }
                    } else {
                        __$coverCall('Plupload', '48012:48021');
                        list = [];
                    }
                    __$coverCall('Plupload', '48082:48132');
                    if (!list.length) {
                        __$coverCall('Plupload', '48107:48126');
                        delete events[name];
                    }
                }
            },
            unbindAll: function () {
                __$coverCall('Plupload', '48249:48264');
                var self = this;
                __$coverCall('Plupload', '48270:48343');
                plupload.each(events, function (list, name) {
                    __$coverCall('Plupload', '48319:48336');
                    self.unbind(name);
                });
            },
            destroy: function () {
                __$coverCall('Plupload', '48474:48485');
                this.stop();
                __$coverCall('Plupload', '48513:48576');
                plupload.each(files, function (file) {
                    __$coverCall('Plupload', '48555:48569');
                    file.destroy();
                });
                __$coverCall('Plupload', '48581:48591');
                files = [];
                __$coverCall('Plupload', '48597:48664');
                if (fileInput) {
                    __$coverCall('Plupload', '48618:48637');
                    fileInput.destroy();
                    __$coverCall('Plupload', '48643:48659');
                    fileInput = null;
                }
                __$coverCall('Plupload', '48670:48734');
                if (fileDrop) {
                    __$coverCall('Plupload', '48690:48708');
                    fileDrop.destroy();
                    __$coverCall('Plupload', '48714:48729');
                    fileDrop = null;
                }
                __$coverCall('Plupload', '48740:48758');
                required_caps = {};
                __$coverCall('Plupload', '48763:48804');
                startTime = total = disabled = xhr = null;
                __$coverCall('Plupload', '48810:48833');
                this.trigger('Destroy');
                __$coverCall('Plupload', '48876:48892');
                this.unbindAll();
                __$coverCall('Plupload', '48897:48908');
                events = {};
            }
        });
    };
    __$coverCall('Plupload', '49149:51332');
    plupload.File = function () {
        __$coverCall('Plupload', '49180:49197');
        var filepool = {};
        __$coverCall('Plupload', '49201:51303');
        function PluploadFile(file) {
            __$coverCall('Plupload', '49234:51271');
            plupload.extend(this, {
                id: plupload.guid(),
                name: file.name || file.fileName,
                type: file.type || '',
                size: file.size || file.fileSize,
                origSize: file.size || file.fileSize,
                loaded: 0,
                percent: 0,
                status: plupload.QUEUED,
                getNative: function () {
                    __$coverCall('Plupload', '50648:50687');
                    var file = this.getSource().getSource();
                    __$coverCall('Plupload', '50693:50764');
                    return o.inArray(o.typeOf(file), [
                        'blob',
                        'file'
                    ]) !== -1 ? file : null;
                },
                getSource: function () {
                    __$coverCall('Plupload', '50967:51015');
                    if (!filepool[this.id]) {
                        __$coverCall('Plupload', '50998:51009');
                        return null;
                    }
                    __$coverCall('Plupload', '51021:51045');
                    return filepool[this.id];
                },
                destroy: function () {
                    __$coverCall('Plupload', '51162:51188');
                    var src = this.getSource();
                    __$coverCall('Plupload', '51194:51260');
                    if (src) {
                        __$coverCall('Plupload', '51210:51223');
                        src.destroy();
                        __$coverCall('Plupload', '51230:51254');
                        delete filepool[this.id];
                    }
                }
            });
            __$coverCall('Plupload', '51276:51300');
            filepool[this.id] = file;
        }
        __$coverCall('Plupload', '51307:51326');
        return PluploadFile;
    }();
    __$coverCall('Plupload', '51420:52505');
    plupload.QueueProgress = function () {
        __$coverCall('Plupload', '51459:51474');
        var self = this;
        __$coverCall('Plupload', '51620:51633');
        self.size = 0;
        __$coverCall('Plupload', '51715:51730');
        self.loaded = 0;
        __$coverCall('Plupload', '51818:51835');
        self.uploaded = 0;
        __$coverCall('Plupload', '51929:51944');
        self.failed = 0;
        __$coverCall('Plupload', '52040:52055');
        self.queued = 0;
        __$coverCall('Plupload', '52153:52169');
        self.percent = 0;
        __$coverCall('Plupload', '52261:52281');
        self.bytesPerSec = 0;
        __$coverCall('Plupload', '52365:52502');
        self.reset = function () {
            __$coverCall('Plupload', '52393:52498');
            self.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;
        };
    };
    __$coverCall('Plupload', '52508:52534');
    window.plupload = plupload;
}(window, mOxie));
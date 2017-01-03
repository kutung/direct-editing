define(function helperLoader() {
    var isFunction = function isFunction(fn) {
            return typeof fn === 'function';
        },
        isNull = function isNull(str) {
            return str === null;
        },
        isString = function isString(str) {
            return typeof str === 'string';
        },
        isObject = function isObject(obj) {
            return obj !== null && typeof obj === 'object';
        },
        isNumber = function isNumber(num) {
            return typeof num === 'number';
        },
        isUndefined = function isUndefined(data) {
            return typeof data === 'undefined';
        },
        isEmptyString = function isEmptyString(str) {
            if (isUndefined(str) === true || isString(str) === false) {
                return false;
            }
            return str.length === 0;
        },
        emptyNode = function emptyNodeFn(node) {
            while (node.firstChild !== null) {
                node.removeChild(node.firstChild);
            }
        },
        objectHasKey = function objectHasKey(obj, key) {
            return isObject(obj) && obj.hasOwnProperty(key);
        },
        getUrlParams = function getUrlParams(key) {
            var query, vars, pair, i;

            query = window.location.search.substring(1);
            vars = query.split('&');
            for (i = 0; i < vars.length; i += 1) {
                pair = vars[i].split('=');
                if (pair[0] === key) {
                    return pair[1];
                }
            }
            return '';
        },
        getUniqueId = function getUniqueId(prefix) {
            var uniqueNumber = Math.floor(Math.random() * 4323253432) + 3223279,
                uniqueId = (prefix + uniqueNumber);

            return uniqueId;
        },
        formatBytes = function formatBytes(bytes, precison) {
            var k = 1024,
                i = 0,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

            if (!bytes || isNaN(bytes) === true) {
                bytes = 0;
            }
            if (!precison || isNaN(precison) === true) {
                precison = 0;
            }
            if (bytes === 0) {
                return '0 Byte';
            }
            i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(precison)).toString() + ' ' + sizes[i];
        },
        uniqueArray = function uniqueArray(array) {
            return array.filter(function eachItem(elem, pos) {
                return array.indexOf(elem) === pos;
            });
        },
        stringTrim = function stringTrim(str) {
            return str.replace(/&nbsp;/gi, '').trim();
        },
        removeValFromArray = function removeValFromArrayFn(array, value) {
            var index = array.indexOf(value);

            if (index > -1) {
                array.splice(index, 1);
                removeValFromArray(array, value);
            }

            return array;
        },
        replaceLocaleString = function replaceLocaleString(str, locale) {
            var replacer = function localeReplacer(match) {
                var key = match.substring(2, match.length - 2);

                if (key in locale && typeof locale[key] === 'string') {
                    return locale[key];
                }

                return key;
            };

            return str.replace(/\{\{[a-z\.1-9]+\}\}/g, replacer);
        },
        addRulesToStyleSheet = function addRulesToStyleSheet(doc, styleSheet, rules) {
            var rule, selector, propStr, cssStr = [];

            for (selector in rules) {
                if (rules.hasOwnProperty(selector) === true) {
                    propStr = '';
                    for (rule in rules[selector]) {
                        if (rules[selector].hasOwnProperty(rule) === true) {
                            propStr += '    ' + rule + ': ' + rules[selector][rule] + ';\n';
                        }
                    }

                    if (propStr !== '') {
                        cssStr.push((selector + ' {\n' + propStr + '}'));
                    }
                }
            }

            if (cssStr.length > 0) {
                styleSheet.appendChild(doc.createTextNode(cssStr.join('\n')));
            }
        },
        Helper = {
            'isFunction': isFunction,
            'isString': isString,
            'isNull': isNull,
            'isObject': isObject,
            'isNumber': isNumber,
            'isUndefined': isUndefined,
            'isEmptyString': isEmptyString,
            'emptyNode': emptyNode,
            'objectHasKey': objectHasKey,
            'getUrlParams': getUrlParams,
            'getUniqueId': getUniqueId,
            'formatBytes': formatBytes,
            'uniqueArray': uniqueArray,
            'stringTrim': stringTrim,
            'removeValFromArray': removeValFromArray,
            'replaceLocaleString': replaceLocaleString,
            'addRulesToStyleSheet': addRulesToStyleSheet
        };

    return Helper;
});

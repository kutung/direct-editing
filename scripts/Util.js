define([
    'scripts/Helper', 'customer/Config'
],
function utilLoader(Helper, CustomerConfig) {
    var removeWrapperClass = ['.rangySelectionBoundary', '.cursor'];

    function Util(Win) {
        this.win = Win;
    }
    function getClassToSelector(customerSelector) {
        var selectorClass = Helper.stringTrim(customerSelector),
            spaceSplitSelector = selectorClass.split(' ');

        if (Helper.isNull(selectorClass) === true ||
            spaceSplitSelector.length > 1
        ) {
            return null;
        }
        return '.' + spaceSplitSelector;
    }

    function getSelectorValue(key) {
        var selectors = CustomerConfig.get('selectors');

        if (Helper.objectHasKey(selectors, key) === false) {
            throw new Error('error.selector.key.missing ' + key);
        }
        return selectors[key];
    }

    Util.selectorToClass = function selectorToClass(selectorKey) {
        return getSelectorValue(selectorKey);
    };

    Util.getSelector = function getSelector(selectorKey) {
        var selector;

        selector = getSelectorValue(selectorKey);
        if (Helper.isNull(selector) === false) {
            return getClassToSelector(selector);
        }
        return null;
    };

    Util.selectorToClassArray = function selectorToClassArray(
        KeyArray, outputArray
    ) {
        var selector;

        if (Helper.isUndefined(outputArray) === true) {
            outputArray = [];
        }
        KeyArray.forEach(function eachSelector(key) {
            selector = getSelectorValue(key);
            if (Helper.isNull(selector) === false) {
                outputArray.push(selector);
            }
        });
        return outputArray;
    };

    Util.selectorToArray = function selectorToArray(KeyArray, outputArray) {
        var selector, selectorClass;

        if (Helper.isUndefined(outputArray) === true) {
            outputArray = [];
        }
        KeyArray.forEach(function eachSelector(key) {
            selector = getSelectorValue(key);
            if (Helper.isNull(selector) === false) {
                selectorClass = getClassToSelector(selector);
                outputArray.push(selectorClass);
            }
        });
        return outputArray;
    };

    Util.checkCKEditorEmpty = function checkCKEditorEmpty(data, doc) {
        var htmlContent, dataContent;

        if (Helper.isEmptyString(data) === true) {
            return true;
        }
        htmlContent = doc.createElement('div');
        htmlContent.innerHTML = data;
        dataContent = htmlContent.textContent;

        if (Helper.isEmptyString(dataContent) === true) {
            return true;
        }
        return false;
    };

    Util.getAllAtributes = function getAllAtributes(node) {
        var attr,
            i = 0,
            data = {},
            attributes = node.attributes,
            attrLen = attributes.length;

        for (; i < attrLen; i += 1) {
            attr = attributes[i];
            data[attr.name] = attr.value;
        }
        return data;
    };

    Util.encode = function encodeFn(win, content) {
        if (Helper.isFunction(win.btoa) === false) {
            return null;
        }
        return win.btoa(unescape(encodeURIComponent(content)));
    };

    Util.decode = function decodeFn(win, content) {
        if (Helper.isFunction(win.atob) === false) {
            return null;
        }
        return decodeURIComponent(escape(win.atob(content)));
    };

    Util.deepFreeze = function deepFreezeFn(obj) {
        var prop, propNames,
            freeze = function freezeFn(object) {
                propNames = Object.getOwnPropertyNames(object);
                propNames.forEach(function eachName(name) {
                    prop = object[name];

                    if (typeof prop === 'object' && prop !== null) {
                        freeze(prop);
                    }
                });

                return Object.freeze(object);
            };

        return freeze(obj);
    };

    Util.appendParamsToUrl = function appendParamsToUrl(url, params) {
        var i = 0,
            len = params.length,
            qs = [];

        if (params.length === 0) {
            return url;
        }

        for (; i < len; i += 1) {
            qs.push(params[i][0] + '=' + encodeURIComponent(params[i][1]));
        }

        url += ((url.indexOf('?') >= 0) ? '&' : '?');
        url += qs.join('&');
        return url;
    };

    Util.checkNodeContains = function checkNodeContains(doc, selector, target) {
        var selectorNode, nodeLength, i = 0, isExist = false;

        selectorNode = doc.querySelectorAll(selector);
        nodeLength = selectorNode.length;
        for (; i < nodeLength; i += 1) {
            if (selectorNode[i].contains(target) === true) {
                isExist = true;
                break;
            }
        }
        return isExist;
    };

    Util.getFirstArrayUnmatchedValues = function getFirstArrayUnmatchedValuesFn(
        array1, array2
    ) {
        var len, annotationClass,
            i = 0;

        len = array2.length;
        for (;i < len; i += 1) {
            annotationClass = array2[i];
            Helper.removeValFromArray(array1, annotationClass);
        }
        return array1;
    };

    return Util;
});

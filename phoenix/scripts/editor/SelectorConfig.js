define([], function formattingConfigLoader() {
    'use strict';

    var singleton = {},
        instance = null,
        selectors = [],
        undoElementSelector = null,
        undoAttrSelector = null;

    function SelectorConfig() {
        var obj = this;

        Object.defineProperty(obj, 'selectors', {
            'value': selectors,
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'undoElementSelector', {
            'value': undoElementSelector,
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'undoAttrSelector', {
            'value': undoAttrSelector,
            'writable': false,
            'configurable': false
        });
    }

    singleton.setCommonSelectors = function setCommonSelectors(commonSelectors) {
        selectors = commonSelectors;
    };

    singleton.setUndoElementSelector = function setUndoElementSelector(elementSelector) {
        undoElementSelector = elementSelector;
    };

    singleton.setUndoAttrSelector = function setUndoAttrSelector(attrSelector) {
        undoAttrSelector = attrSelector;
    };

    singleton.get = function get() {
        if (instance === null) {
            instance = new SelectorConfig();
        }

        return instance;
    };

    return singleton;
});

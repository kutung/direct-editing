define(['scripts/editor/AbstractConfig'], function editorConfigLoader(
    AbstractConfig
) {
    'use strict';

    function EditorConfig() {}

    EditorConfig.prototype = new AbstractConfig();

    EditorConfig.prototype.getCommonSelectors = function getCommonSelectors() {
        return [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'p', 'dl', 'li', 'dt', 'dd', 'div'
        ];
    };

    EditorConfig.prototype.getUniqueAttributeSelector = function getUniqueAttributeSelector() {
        return 'name';
    };

    EditorConfig.prototype.getSectionSelector = function getSectionSelector() {
        return 'div';
    };

    EditorConfig.prototype.getWrapperAttributes = function getWrapperAttributes() {
        return {
            'actor': 'au',
            'stage': 1
        };
    };

    return EditorConfig;
});

define([], function CommentLoader() {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance Comment Instance
     * @return {void}
     */
    function initVariables(instance) {
        var obj = instance;

        Object.defineProperty(obj, 'win', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'doc', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'editor', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'panel', {
            'value': null,
            'writable': true
        });
    }

    function CommentList(win, doc, panel, editor) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.panel = panel;
        this.editor = editor;
    }

    function generateList(doc) {
        return doc.createElement('ul');
    }

    CommentList.prototype.setUp = function setUp() {
        var blockElements = this.editor.querySelectorAll('*[data-block-element-id]'),
            i = 0, len = blockElements.length, list;

        for (; i < len; i += 1) {
            list = generateList(this.doc);
            list.dataset.listId = blockElements[i].dataset.blockElementId;
            this.panel.appendChild(list);
        }
    };

    CommentList.prototype.destroy = function destroy() {
        initVariables(this);
    };

    return CommentList;
});


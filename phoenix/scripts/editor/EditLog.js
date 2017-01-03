define([
    'scripts/editor/FormattingConfig', 'scripts/Panel', 'scripts/EventBus'
], function editLogLoader(FormattingConfig, Panel, EventBus) {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance Action Instance
     * @return {void}
     */
    function initVariables(instance) {
        /**
         * Global Window object
         * @property {Window} win
         * @private
         */
        Object.defineProperty(instance, 'win', {
            'value': null,
            'writable': true
        });
        /**
         * Global Document object
         * @property {HTMLDocument} doc
         * @private
         */
        Object.defineProperty(instance, 'doc', {
            'value': null,
            'writable': true
        });
        /**
         * Editor element to attach events to
         * @property {HTMLElement} editor
         * @private
         */
        Object.defineProperty(instance, 'editor', {
            'value': null,
            'writable': true
        });
        /**
         * EditLogPanel instance
         * @property {Object} editLogPanel
         * @private
         */
        Object.defineProperty(instance, 'editLogPanel', {
            'value': null,
            'writable': true
        });
        /**
         * FormattingConfig instance
         * @property {FormattingConfig} formatConfig
         * @private
         */
        Object.defineProperty(instance, 'formatConfig', {
            'value': null,
            'writable': true
        });
    }

    function EditLog(editor, editLogPanel, win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.editor = editor;
        this.editLogPanel = editLogPanel;
        this.fomatConfig = FormattingConfig.get(this.win);
    }

    function renderEditList(instance, formattedTags) {
        var ol = instance.doc.createElement('ol'),
            i = 0, len = formattedTags.length, list;

        instance.editLogPanel.innerHTML = '';
        for (; i < len; i += 1) {
            list = instance.doc.createElement('li');
            list.appendChild(formattedTags[i]);
            ol.appendChild(list);
        }
        if (ol.children.length > 0) {
            instance.editLogPanel.classList.add('show-log');
            instance.panel = new Panel(
                instance.editLogPanel, instance.doc, instance.win, EventBus
            );
            instance.panel.render();
            instance.panel.setTitle('Edit Log List');
            instance.panel.add(ol);
            instance.panel.ignoreHeaderClick(true);
        }
    }

    function treeWalker(instance, node) {
        var walker;

        walker = instance.doc.createTreeWalker(
            node, instance.win.NodeFilter.SHOW_ELEMENT, null, false
        );

        return walker;
    }

    function onFocusEditor() {
        if (this.editLogPanel.classList.contains('show-log') === true) {
            this.hide();
        }
    }

    EditLog.prototype.execute = function execute() {
        var walker = treeWalker(this, this.editor),
            currNode = walker.nextNode(),
            formattedTags = [];

        while (currNode !== null) {
            if (this.fomatConfig.hasAnyFormatting(currNode) === true) {
                formattedTags.push(currNode.cloneNode(true));
                walker.currentNode = currNode.lastChild;
            }
            currNode = walker.nextNode();
        }
        renderEditList(this, formattedTags);

        this.editor.addEventListener('click', onFocusEditor.bind(this), false)
    };

    EditLog.prototype.hide = function hide() {
        this.editLogPanel.classList.remove('show-log');
    };

    return EditLog;
});

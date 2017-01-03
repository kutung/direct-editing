define([
    'scripts/editor/FormattingConfig', 'scripts/editor/EditLog', 'scripts/editor/Selection'
],
function toolbarLoader(FormattingConfig, EditLog, Selection) {
    'use strict';
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
        Object.defineProperty(obj, 'toolBar', {
            'value': null,
            'writable': true
        });
    }

    function ToolBar(editorElement, editLogPanel, toolBarpanel, editor, win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.editor = editor;
        this.editorElement = editorElement;
        this.editLogPanel = editLogPanel;
        this.toolBar = toolBarpanel;
        this.selection = Selection;
    }

    function onClickToolBar(e) {
        var instance = this, targetClass = e.target.classList[0],
            classSplitValues, key, command, selection, editLog,
            editorEl = document.querySelector('#editor');

        editorEl.focus();
        if (e.target.classList.contains('reject-icon') === true) {
            instance.editor.executeCommand('delete', 'reject', instance.editor);
        }
        else if (e.target.classList.contains('icon-prop') === true) {
            classSplitValues = targetClass.split('-');
            key = classSplitValues[0];
            command = classSplitValues[0];
            selection = instance.selection.get(instance.win);

            if (selection.collapsed === true) {
                throw new Error('no.selection');
            }

            instance.editor.executeCommand(command, key, instance.editor);
        }
        else if (e.target.classList.contains('editLog') === true) {
            editLog = new EditLog(
                instance.editorElement, instance.editLogPanel, instance.win, instance.doc
            );
            editLog.execute();
        }
        else {
            return;
        }
    }

    function preventSelectStart(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ToolBar.prototype.setUp = function setUp() {
        this.toolBar.addEventListener('click', onClickToolBar.bind(this), false);
        this.toolBar.addEventListener('selectstart', preventSelectStart, false);
    };

    return ToolBar;
});

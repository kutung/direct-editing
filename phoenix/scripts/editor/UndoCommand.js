define(['scripts/libs/undo', 'scripts/libs/diff', 'scripts/editor/Selection',
    'scripts/editor/EditorConfigReader', 'scripts/editor/ActionCompleteHandler'
],
function UndoCommandLoader(
    Undo, Diff, Selection, EditorConfigReader, ActionCompleteHandler
) {
    'use strict';
    var UndoCommand;

    function initVariables(obj) {
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
        Object.defineProperty(obj, 'undoManager', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'undoPatches', {
            'value': [],
            'writable': true
        });
        Object.defineProperty(obj, 'redoPatches', {
            'value': [],
            'writable': true
        });
        Object.defineProperty(obj, 'selection', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'editorConfig', {
            'value': null,
            'writable': true
        });
    }

    UndoCommand = Undo.Command.extend({
        'constructor': function construct(win, doc, undoManager, editor) {
            var undoCommand = this;

            initVariables(this);
            this.win = win;
            this.doc = doc;
            this.undoManager = undoManager;
            this.editor = editor;
            this.selection = Selection.get(this.win);
            this.editorConfig = EditorConfigReader.get();
            this.undoManager.getModifiedSections().forEach(function eachSection(section) {
                var editorConfig = undoManager.editorConfig,
                    undoSelector = editorConfig.getUniqueAttributeSelector(),
                    oldHtml = section.old.innerHTML,
                    newHtml = section.recent.innerHTML,
                    patch = Diff.createPatch(null, newHtml, oldHtml, null, null, {'context': 2}),
                    sectionId = section.id,
                    selector = '[' + undoSelector + '="' + sectionId + '"]';

                undoCommand.undoPatches.push({
                    'patch': patch,
                    'selector': selector
                });
                patch = Diff.createPatch(null, oldHtml, newHtml, null, null);
                undoCommand.redoPatches.push({
                    'patch': patch,
                    'selector': selector
                });
            });
        },
        'execute': function execute() {
        },
        'undo': function undo() {
            var undoCommand = this, range = undoCommand.doc.createRange(), sel = undoCommand.selection;

            this.undoManager.stopObserving();
            this.undoPatches.forEach(function eachPatch(patch) {
                var section = undoCommand.editor.querySelector(patch.selector),
                    html = null;

                html = Diff.applyPatch(section.innerHTML, patch.patch);

                section.innerHTML = html;
                range.setStart(section, 0);
                range.collapse = false;
                sel.removeAllRanges();
                sel.addRange(range);
                ActionCompleteHandler.actionComplete(section);
            });
            this.undoManager.startObserving();
        },
        'redo': function redo() {
            var undoCommand = this, range = undoCommand.doc.createRange(), sel = undoCommand.selection;

            this.undoManager.stopObserving();
            this.redoPatches.forEach(function eachPatch(patch) {
                var section = undoCommand.editor.querySelector(patch.selector),
                    html = Diff.applyPatch(section.innerHTML, patch.patch);

                section.innerHTML = html;
                range.setStart(section, 0);
                range.collapse = false;
                sel.removeAllRanges();
                sel.addRange(range);
                ActionCompleteHandler.actionComplete(section);
            });
            this.undoManager.startObserving();
        }

    });

    return UndoCommand;
});

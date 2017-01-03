define([
    'scripts/libs/diff', 'scripts/editor/UndoCommand', 'scripts/libs/undo',
    'scripts/editor/EditorConfigReader'
], function UndoManagerLoader(Diff, UndoCommand, Undo, EditorConfigReader) {
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
        Object.defineProperty(obj, 'diff', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'observingInterval', {
            'value': 1000,
            'writable': false
        });
        Object.defineProperty(obj, 'observeTimer', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'observer', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'undoStack', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'initialized', {
            'value': false,
            'writable': true
        });
        Object.defineProperty(obj, 'editorChanged', {
            'value': false,
            'writable': true
        });
        Object.defineProperty(obj, 'patchInProgress', {
            'value': false,
            'writable': true
        });
        Object.defineProperty(obj, 'editor', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'modifiedSections', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'modifiedSectionsSnapshot', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'snapShotContainer', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'editorConfig', {
            'value': null,
            'writable': true
        });
    }

    function createSnapShotConatiner(instance) {
        instance.snapShotContainer = instance.doc.createElement('snapshot');
    }

    function UndoManager(win, doc, editor) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.editor = editor;
        this.diff = Diff;
        this.modifiedSections = new win.Set();
        this.undoStack = new Undo.Stack();
        this.editorConfig = EditorConfigReader.get();
        createSnapShotConatiner(this);
    }

    function getSectionSelector(instance, sectionId) {
        var editorConfig = instance.editorConfig,
            undoSelector = editorConfig.getUniqueAttributeSelector();

        return '[' + undoSelector + '="' + sectionId + '"]';
    }

    function snapShotWholeContent(instance) {
        var editor = instance.editor,
            content = editor.cloneNode(true);

        instance.snapShotContainer.appendChild(content);
    }

    function snapShotContent(modifiedSections, instance) {
        var editor = instance.editor;

        modifiedSections.forEach(function eachSection(sectionId) {
            var sectionSelector = getSectionSelector(instance, sectionId),
                section = editor.querySelector(sectionSelector),
                snapShotSection = instance.snapShotContainer.querySelector(sectionSelector);

            section = section.cloneNode(true);
            snapShotSection.parentNode.replaceChild(section, snapShotSection);
        });
    }

    UndoManager.prototype.getModifiedSections = function getModifiedSections() {
        var sections = [], undoManager = this;

        this.modifiedSectionsSnapshot.forEach(function eachSectionId(sectionId) {
            var sectionSelector = getSectionSelector(undoManager, sectionId),
                newData = undoManager.editor.querySelector(sectionSelector),
                oldData = undoManager.snapShotContainer.querySelector(sectionSelector);

            sections.push({
                'old': oldData,
                'recent': newData,
                'id': sectionId
            });
        });

        return sections;
    };

    UndoManager.prototype.undo = function undo() {
        if (this.undoStack.canUndo() === true) {
            this.undoStack.undo();
            snapShotContent(this.modifiedSectionsSnapshot, this);
        }
    };

    UndoManager.prototype.redo = function redo() {
        if (this.undoStack.canRedo() === true) {
            this.undoStack.redo();
            snapShotContent(this.modifiedSectionsSnapshot, this);
        }
    };

    function createObserver(undoManager) {
        undoManager.observer = new undoManager.win.MutationObserver(function mutationObserver(mutations) {
            if (mutations.length > 0) {
                undoManager.editorChanged = true;
            }
            undoManager.modifiedSections = new undoManager.win.Set();
            mutations.forEach(function eachMutation(mutation) {
                var section = null, sectionId = null, target = null,
                    selector = undoManager.editorConfig.getUniqueAttributeSelector(),
                    baseSelector = undoManager.editorConfig.getSectionSelector();

                if (mutation.target.nodeType === undoManager.win.Node.TEXT_NODE) {
                    target = mutation.target.parentNode;
                }
                else {
                    target = mutation.target;
                }
                // FIX IT: find why target is getting null??
                if (target === null) {
                    return;
                }

                section = target.closest(baseSelector + '[' + selector + ']');

                if (section !== null) {
                    sectionId = section.dataset.sectionId;

                    if (typeof sectionId === 'undefined') {
                        sectionId = section.attributes[selector].value;
                    }
                    undoManager.modifiedSections.add(sectionId);
                }
            });
        });
    }

    function setupTimer(undoManager) {
        undoManager.observeTimer = undoManager.win.setInterval(function enableUndoObserver() {
            if (undoManager.editorChanged === true && undoManager.patchInProgress === false) {
                undoManager.modifiedSectionsSnapshot = undoManager.modifiedSections;
                undoManager.editorChanged = false;
                undoManager.undoStack.execute(new UndoCommand(
                    undoManager.win, undoManager.doc, undoManager, undoManager.editor
                ));
                snapShotContent(undoManager.modifiedSectionsSnapshot, undoManager);
            }
        }, undoManager.observingInterval);
    }

    UndoManager.prototype.setUp = function setUp() {
        if (this.initialized === true) {
            return;
        }
        snapShotWholeContent(this);
        createObserver(this);
        setupTimer(this);
        this.startObserving();
        this.initialized = true;
    };

    UndoManager.prototype.startObserving = function startObserving() {
        this.observer.observe(this.editor, {
            'subtree': true,
            'childList': true,
            'attributes': false,
            'characterData': true
        });
    };

    UndoManager.prototype.stopObserving = function stopObserving() {
        this.observer.disconnect();
    };

    UndoManager.prototype.destroy = function destroy() {
        this.observer.disconnect();
        this.win.clearInterval(this.observeTimer);
        initVariables.call(this);
    };

    return UndoManager;
});

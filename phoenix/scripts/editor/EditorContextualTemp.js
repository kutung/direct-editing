define([
    'scripts/editor/Selection',
    'scripts/editor/GenericFormatCommand', 'scripts/editor/BoldCommand',
    'scripts/editor/ItalicCommand', 'scripts/editor/SubScriptCommand',
    'scripts/editor/SuperScriptCommand', 'scripts/editor/DeleteCommand',
    'scripts/editor/Util',
    'scripts/ContextualMenu', 'scripts/Helper', 'scripts/EventBus'
], function EditorContextualLoader(
    Selection, GenericFormatCommand, BoldCommand, ItalicCommand, SubScriptCommand,
    SuperScriptCommand, DeleteCommand, Util, ContextualMenu, Helper, EventBus
) {
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
        Object.defineProperty(obj, 'selectionContext', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'util', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'contextualMenu', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'contextualMenuContainer', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'textRange', {
            'value': null,
            'writable': true
        });
    }

    function createMenuItem(instance, label, Command) {
        var commandInstance,
            template = [
                '<button title="{{label}}" class="ui-button {{label}}_menu">',
                    '<span class="ui-button-text">',
                        '<i class="icon-{{label}}"></i>',
                    '</span>',
                '</button>'
            ],
            selection,
            menuItem = {
                'render': function renderFn() {
                    var container,
                        tmpNode = instance.doc.createElement('span');

                    tmpNode.innerHTML = Helper.replaceLocaleString(template.join(''), {'label': label});
                    container = tmpNode.firstChild;
                    container.addEventListener('click', function clickFn(e) {
                        selection = instance.selectionContext.get(instance.win);
                        selection.removeAllRanges();
                        selection.addRange(instance.textRange);
                        instance.textRange = null;

                        if (label === 'delete') {
                            commandInstance = new Command(instance.win, instance.doc);
                        }
                        else {
                            commandInstance = new Command(new GenericFormatCommand(instance.win, instance.doc));
                        }
                        commandInstance.execute();
                    });
                    return container;
                },
                'destroy': function destroyFn() {
                    return null;
                },
                'setContextualMenu': function setContextualMenuFn() {
                    return null;
                },
                'setActive': function setActiveFn() {
                    return null;
                }
            };

        return menuItem;
    }

    function EditorContextual(Win, Doc, container) {
        initVariables(this);
        this.win = Win;
        this.doc = Doc;
        this.selectionContext = Selection;
        this.container = container;
        this.util = new Util(this.win, this.doc);
    }

    function showContextualMenu(instance, event) {
        var editorMetrics, position, textRangeRect, topPos, leftPos,
            domFrag = instance.doc.createDocumentFragment(),
            selection = instance.selectionContext.get(instance.win);

        if (instance.util.isValidSelection(selection) === false) {
            instance.contextualMenu.hide();
            throw new Error('multiple.section.formatting.not.allowed');
        }
        editorMetrics = {
            'height': instance.container.clientHeight,
            'width': instance.container.clientWidth,
            'top': instance.container.offsetTop,
            'left': instance.container.offsetLeft,
            'scrollTop': instance.container.scrollTop
        };

        event.preventDefault();
        event.stopPropagation();

        instance.textRange = selection.range;
        if (instance.textRange.collapsed === true ||
            event.target.closest('[contenteditable="false"]') !== null
        ) {
            instance.contextualMenu.hide();
            return false;
        }
        textRangeRect = instance.textRange.getBoundingClientRect();
        if (textRangeRect !== null) {
            topPos = textRangeRect.top;
            if (textRangeRect.top < 100) {
                topPos = textRangeRect.top + textRangeRect.height;
            }
            leftPos = textRangeRect.left + (textRangeRect.width / 2);
        }
        position = {
            'left': leftPos - 120,
            'top': topPos - 30
        };
        instance.contextualMenu.show(position, editorMetrics, domFrag, {});
        return false;
    }

    EditorContextual.prototype.execute = function executeFn() {
        var self = this;

        this.contextualMenu = new ContextualMenu(this.win, this.doc, EventBus, {});
        this.contextualMenu.add('bold', createMenuItem(this, 'bold', BoldCommand));
        this.contextualMenu.add('italic', createMenuItem(this, 'italic', ItalicCommand));
        this.contextualMenu.add('superScript', createMenuItem(this, 'superscript', SuperScriptCommand));
        this.contextualMenu.add('subScript', createMenuItem(this, 'subscript', SubScriptCommand));
        //this.contextualMenu.add('delete', createMenuItem(this, 'delete', DeleteCommand));
        this.contextualMenuContainer = this.contextualMenu.render();
        this.container.appendChild(this.contextualMenuContainer);
        this.container.addEventListener('mouseup', function mouseupFn(e) {
            if (self.contextualMenuContainer.contains(e.target) === true) {
                self.contextualMenu.hide();
                return;
            }
            showContextualMenu(self, e);
        }, false);
        this.container.addEventListener('keyup', function keyupFn(e) {
            var selection;

            if (e.shiftKey === true &&
                (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 ||
                e.keyCode === 40)
            ) {
                showContextualMenu(self, e);
            }
            else {
                selection = self.selectionContext.get(self.win);
                if (selection.range.collapsed === true) {
                    self.contextualMenu.hide();
                }
            }
        }, false);
    };

    return EditorContextual;
});

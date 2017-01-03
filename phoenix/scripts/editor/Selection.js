define([
    'scripts/editor/FormattingConfig', 'scripts/editor/Helper', 'scripts/editor/Util',
    'scripts/editor/EditorConfigReader'
], function selectionLoader(FormattingConfig, EditorHelper, Util, EditorConfigReader) {
    'use strict';

    var singleton = {};

    function initRangeProperties(instance) {
        instance.startContainer = null;
        instance.startOffset = null;
        instance.endContainer = null;
        instance.endOffset = null;
        instance.collapsed = false;
        instance.commonAncestorContainer = null;
        instance.range = null;
        instance.styleGrandParent = null;
        instance.commonFormattingAncestors = [];
        instance.util = null;
        instance.selectors = null;
        instance.sectionParent = null;
        instance.closestBlockParent = null;
    }

    function Selection() {
        this.selection = null;
        this.win = null;
        this.doc = null;
        this.helper = null;
        this.editorConfig = null;
        this.baseSelector = null;
        initRangeProperties(this);
    }

    function setCommonFormattingAncestors(node, context, win) {
        var formattingConfig = context.formattingConfig,
            editorConfig = context.editorConfig;

        while (node.matches(context.baseSelector) === false) {
            /* istanbul ignore else */
            if (node.nodeType === win.Node.ELEMENT_NODE) {
                if (formattingConfig.isBold(node) === true) {
                    context.commonFormattingAncestors.push('bold');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isItalic(node) === true) {
                    context.commonFormattingAncestors.push('italic');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isSup(node) === true) {
                    context.commonFormattingAncestors.push('sup');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isSub(node) === true) {
                    context.commonFormattingAncestors.push('sub');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isDelete(node) === true) {
                    context.commonFormattingAncestors.push('delete');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isInsert(node) === true) {
                    context.commonFormattingAncestors.push('insert');
                    context.styleGrandParent = node;
                }
                else if (formattingConfig.isInstruct(node) === true) {
                    context.commonFormattingAncestors.push('instruct');
                    context.styleGrandParent = node;
                }
            }

            if (node.matches(editorConfig.getArticleElementSelector()) === true) {
                return;
            }

            node = node.parentNode;
        }
    }

    function setBaseSelector(node, context) {
        var config = context.editorConfig;

        if (node.closest(config.getArticleElementSelector()) !== null) {
            context.baseSelector = context.util.getNodeName(
                node.closest(config.getSectionSelector())
            );
        }
        if (node.closest(config.getInstructionPanelSelector()) !== null) {
            /* istanbul ignore else */
            if (node.matches(config.getInstructionBaseSelector()) === true) {
                context.baseSelector = context.util.getNodeName(node);
            }
            else {
                context.baseSelector = context.util.getNodeName(
                   config.getInstructionBaseSelector()
                );
            }
        }
    }

    function getElement(context, selectors) {
        var node = context.commonAncestorContainer;

        while (node.matches(selectors) === false) {
            node = node.parentNode;
        }

        return node;
    }

    function assignRangeProperties(context, range) {
        var win = context.win,
            config = context.editorConfig;

        context.util = new Util(context.win, context.win.document);
        context.range = range;
        context.collapsed = range.collapsed;
        context.startContainer = range.startContainer;
        context.endContainer = range.endContainer;
        context.startOffset = range.startOffset;
        context.endOffset = range.endOffset;
        context.selectors = config.selectors;
        if (range.commonAncestorContainer.nodeType === win.Node.TEXT_NODE) {
            context.commonAncestorContainer = range.commonAncestorContainer.parentNode;
        }
        else {
            context.commonAncestorContainer = range.commonAncestorContainer;
        }

        context.sectionParent = getElement(
            context, config.getSectionSelector()
        );
        context.closestBlockParent = getElement(
            context, config.getCommonSelectors()
        );
        setBaseSelector(context.commonAncestorContainer, context);
        setCommonFormattingAncestors(context.commonAncestorContainer, context, win);
    }

    Selection.prototype.cloneContents = function cloneContents() {
        return this.range.cloneContents();
    };

    Selection.prototype.cloneRange = function cloneRange() {
        return this.range.cloneRange();
    };

    Selection.prototype.insertNode = function insertNode(node) {
        return this.range.insertNode(node);
    };

    Selection.prototype.deleteContents = function deleteContents() {
        return this.range.deleteContents();
    };

    Selection.prototype.addRange = function addRange(range) {
        this.selection.addRange(range);
        assignRangeProperties(this, range);
    };

    Selection.prototype.removeAllRanges = function removeAllRanges() {
        this.selection.removeAllRanges();
        initRangeProperties(this);
    };

    Selection.prototype.setStart = function setStart(startNode, startOffset) {
        this.range.setStart(startNode, startOffset);
        this.startOffset = startOffset;
    };

    Selection.prototype.setEnd = function setEnd(endNode, endOffset) {
        this.range.setEnd(endNode, endOffset);
        this.endOffset = endOffset;
    };

    Selection.prototype.selectNode = function selectNode(referenceNode) {
        this.range.selectNode(referenceNode);
        assignRangeProperties(this, this.range);
    };

    Selection.prototype.surroundContents = function surroundContents(
        referenceNode
    ) {
        return this.range.surroundContents(referenceNode);
    };

    Selection.prototype.hasAnyFormattingParent = function hasAnyFormattingParent() {
        return this.commonFormattingAncestors.length > 0;
    };

    Selection.prototype.hasFormattingParentOf = function hasFormattingParentOf(
        formattingParentType
    ) {
        var ancestors = this.commonFormattingAncestors;

        if (typeof formattingParentType === 'undefined') {
            return false;
        }

        if (ancestors.indexOf(formattingParentType) !== -1) {
            return true;
        }

        return false;
    };

    singleton.get = function get(win) {
        var sel = win.getSelection(),
            context = new Selection();

        if (sel.rangeCount === 0) {
            throw new Error('no.selection');
        }
        if (typeof sel.getRangeAt !== 'function') {
            throw new Error('selection.get.range.at.method.not.supported');
        }

        context.selection = sel;
        context.win = win;
        context.formattingConfig = FormattingConfig.get(win);
        context.helper = EditorHelper.get(win);
        context.editorConfig = EditorConfigReader.get();
        assignRangeProperties(context, sel.getRangeAt(0));

        return context;
    };

    return singleton;
});

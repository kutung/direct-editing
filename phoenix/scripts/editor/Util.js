define([
    'scripts/editor/FormattingConfig', 'scripts/editor/EditorConfigReader', 'scripts/Helper'
], function UtilLoader(FormattingConfig, EditorConfigReader, Helper) {
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
        Object.defineProperty(obj, 'stopElementSelector', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'formatConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'editorConfig', {
            'value': null,
            'writable': true
        });
    }

    function Util(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.formatConfig = FormattingConfig.get(this.win);
        this.editorConfig = EditorConfigReader.get();
        this.stopElementSelector = this.editorConfig.getSectionSelector();
    }

    function hasFormattingParent(formattingAncestors) {
        return formattingAncestors.length > 0;
    }

    function isTextNode(node, win) {
        return node.nodeType === win.Node.TEXT_NODE;
    }

    function getLastChild(node) {
        while (node.hasChildNodes() === true) {
            node = node.lastChild;
        }
        return node;
    }

    function createRange(startNode, startPos, endNode, endPos, instance) {
        var range = instance.doc.createRange();

        if (startPos === 0) {
            range.selectNode(startNode);
        }
        else {
            range.setStart(startNode, startPos);
        }

        if (isTextNode(endNode, instance.win) === true) {
            range.setEnd(endNode, endPos);
        }
        else {
            range.setEndAfter(endNode);
        }

        return range;
    }

    function applyFormatTags(fragment, formattingAncestors) {
        var elementNode = null;

        elementNode = formattingAncestors.cloneNode(false);
        elementNode.appendChild(fragment);

        return elementNode;
    }

    function getFormatParentNode(node, instance) {
        var nodeName = node.nodeName.toLowerCase(), formatNode = node;

        while (nodeName !== instance.stopElementSelector) {
            if (instance.formatConfig.hasAnyFormatting(node) === true) {
                formatNode = node;
            }
            node = node.parentNode;
            nodeName = node.nodeName.toLowerCase();
        }
        return formatNode;
    }

    function assignEndNode(startNode, startContainer) {
        var endNode = startNode;

        if (startContainer.childNodes.length > 0) {
            endNode = startContainer.childNodes[startContainer.childNodes.length - 1];
        }
        else {
            endNode = startContainer;
        }

        return endNode;
    }

    function isFormattingNode(instance, node, win) {
        if (isTextNode(node, win) === true) {
            node = node.parentNode;
        }

        if (instance.formatConfig.isBold(node) === true ||
            instance.formatConfig.isItalic(node) === true ||
            instance.formatConfig.isSup(node) === true ||
            instance.formatConfig.isSub(node) === true ||
            instance.formatConfig.isDelete(node) === true
        ) {
            return true;
        }

        return false;
    }

    function splitNodesPreceedingSelection(context, instance) {
        var startOffset = 0, endOffset = context.startOffset,
            startNode, endNode, range, formattedNode,
            startContainer = context.startContainer, parentNode;

        if (hasFormattingParent(context.commonFormattingAncestors) === true) {
            startNode = context.styleGrandParent;
            endNode = assignEndNode(
                startNode, startContainer
            );
            range = createRange(
                startNode, startOffset, endNode, endOffset, instance
            );
            formattedNode = range.cloneContents();
            range.deleteContents();
            range.insertNode(formattedNode);
        }
        else if (
            isFormattingNode(instance, startContainer, instance.win) === true &&
            endOffset !== 0
        ) {
            startNode = getFormatParentNode(startContainer, instance);
            endNode = context.startContainer;
            range = createRange(startNode, startOffset, endNode, endOffset, instance);

            /* istanbul ignore else */
            if (isTextNode(startContainer, instance.win) === true) {
                startContainer = startContainer.parentNode;
            }
            formattedNode = range.cloneContents();
            range.deleteContents();
            range.insertNode(formattedNode);
        }
    }

    function splitNodesNextToSelection(context, instance) {
        var startOffset = context.endOffset, startNode, endNode = null,
            range, formattedNode, endContainer = context.endContainer, childNodes;

        if (hasFormattingParent(context.commonFormattingAncestors) === true) {
            endNode = getLastChild(context.styleGrandParent.lastChild);
            startNode = context.endContainer;
            childNodes = context.styleGrandParent.childNodes;
            range = createRange(
                startNode, startOffset, context.styleGrandParent, childNodes.length, instance
            );
            formattedNode = range.cloneContents();
            range.deleteContents();
            context.styleGrandParent.parentNode.insertBefore(
                formattedNode, context.styleGrandParent.nextSibling
            );
        }
        else if (
            isFormattingNode(instance, endContainer, instance.win) === true &&
            startOffset !== endContainer.length
        ) {
            startNode = endContainer;
            endNode = endContainer;
            range = createRange(startNode, startOffset, endNode, endNode.length, instance);

            /* istanbul ignore else */
            if (isTextNode(endContainer, instance.win) === true) {
                endContainer = endContainer.parentNode;
            }

            formattedNode = applyFormatTags(range.cloneContents(), endContainer);
            range.deleteContents();
            endContainer.parentNode.insertBefore(formattedNode, endContainer.nextSibling);
        }
    }

    function setSelectionRange(context, instance) {
        var topMostFormattingParent, range;

        if (context.commonFormattingAncestors.length > 0) {
            range = instance.doc.createRange();
            topMostFormattingParent = context.styleGrandParent;
            context.previousSibling = topMostFormattingParent.previousSibling;
            context.nextSibling = topMostFormattingParent.nextSibling;
            range.selectNode(topMostFormattingParent);
        }
        else {
            range = context.range;
        }

        context.removeAllRanges();
        context.addRange(range);
    }

    function removeDataAttrsInFragment(fragment, instance) {
        var walker = instance.doc.createTreeWalker(
                fragment, instance.win.NodeFilter.SHOW_ALL, null, false
            ),
            currentNode;

        currentNode = walker.nextNode();
        while (currentNode !== null) {
            if (currentNode.nodeType === instance.win.Node.ELEMENT_NODE) {
                if (currentNode.hasAttribute('data-parent') === true) {
                    currentNode.removeAttribute('data-parent');
                }
                if (currentNode.hasAttribute('data-child') === true) {
                    currentNode.removeAttribute('data-child');
                }
            }
            currentNode = walker.nextNode();
        }
    }

    Util.prototype.splitTags = function splitTags(selectionContext) {
        splitNodesNextToSelection(selectionContext, this);
        splitNodesPreceedingSelection(selectionContext, this);
        setSelectionRange(selectionContext, this);
        return selectionContext;
    };

    Util.prototype.getNodeName = function getNodeName(node) {
        return node.nodeName.toLowerCase();
    };

    Util.prototype.getClosestParentFromSelectors = function getClosestParentFromSelectors(
        selectionContext
    ) {
        var node = selectionContext.commonAncestorContainer,
            selectors = this.editorConfig.getCommonSelectors();

        while (node.matches(selectors) === false) {
            node = node.parentNode;
        }

        return node;
    };

    Util.prototype.getSectionElementFromSelectors = function getSectionElementFromSelectors(
        selectionContext
    ) {
        var node = selectionContext.commonAncestorContainer,
            selectors = this.editorConfig.getSectionSelector();

        while (node.matches(selectors) === false) {
            node = node.parentNode;
        }

        return node;
    };

    Util.prototype.isValidSelection = function isValidSelection(selection) {
        var fragment = selection.cloneContents(),
            selectors = this.editorConfig.getCommonSelectors(),
            elements = fragment.querySelectorAll(selectors);

        if (elements.length > 0) {
            return false;
        }
        return true;
    };

    Util.prototype.generateUniqueKey = function generateUniqueKey() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    };

    Util.prototype.cleanNode = function cleanNode(node) {
        var walker, currentNode, arr = [], i, parent, len;

        walker = this.doc.createTreeWalker(
            node, this.win.NodeFilter.SHOW_ALL, null, false
        );
        currentNode = walker.currentNode;

        while (currentNode !== null) {
            if (currentNode.nodeType === 3 && currentNode.textContent.trim() === '') {
                arr.push(currentNode);
            }
            currentNode = walker.nextNode();
        }

        len = arr.length;

        for (i = len - 1; i >= 0; i -= 1) {
            parent = arr[i].parentNode;

            parent.removeChild(arr[i]);
        }
    };

    Util.prototype.getCorrectionId = function getCorrectionId() {
        var correctionIdPrefix = this.editorConfig.getCorrectionIdPrefix();

        return Helper.getUniqueId(correctionIdPrefix);
    };

    Util.prototype.arrangeNodes = function arrangeNodes(
        fragment, arrangeNodeFragment
    ) {
        var walker = this.doc.createTreeWalker(
                fragment, this.win.NodeFilter.SHOW_ALL, null, false
            ),
            currentNode, parentNode, childId;

        currentNode = walker.nextNode();
        while (currentNode !== null) {
            if (currentNode.hasAttribute('data-child') === true) {
                childId = currentNode.dataset.child;
                parentNode = arrangeNodeFragment.querySelector(
                    '[data-parent="' + childId + '"]'
                );
                parentNode.appendChild(currentNode.cloneNode(true));
            }
            else {
                arrangeNodeFragment.appendChild(currentNode.cloneNode(true));
            }
            currentNode = walker.nextSibling();
        }
        removeDataAttrsInFragment(arrangeNodeFragment, this);
    };

    Util.prototype.isNonEditableNode = function isNonEditableNode(node) {
        if (node.nodeType === this.win.Node.ELEMENT_NODE &&
            node.hasAttribute('contenteditable') === true
        ) {
            return true;
        }

        return false;
    };

    Util.prototype.isParentNonEditable = function isParentNonEditable(seletion) {
        var node = seletion.startContainer;

        if (node.nodeType === this.win.Node.TEXT_NODE) {
            node = node.parentNode;
        }

        if (node.closest('[contenteditable="false"]') !== null) {
            return true;
        }

        return false;
    };

    return Util;
});

define([
    'scripts/editor/FormattingConfig', 'scripts/editor/Selection',
    'scripts/editor/Util', 'scripts/editor/Normalizer',
    'scripts/editor/ActionCompleteHandler', 'scripts/editor/EditorConfigReader',
    'scripts/editor/ReOrder'
], function DeleteCommandLoader(
    FormattingConfig, SelectionContext, Util, Normalizer, ActionCompleteHandler,
    EditorConfigReader, ReOrder
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
        Object.defineProperty(obj, 'stopSelector', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'formatConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'util', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'normalizer', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'commentsMapper', {
            'value': null,
            'writable': true
        });
    }

    function DeleteCommand(win, doc, commentsMapper) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.commentsMapper = commentsMapper;
        this.formatConfig = FormattingConfig.get(this.win);
        this.util = new Util(this.win, this.doc);
        this.normalizer = new Normalizer(this.win, this.doc);
        this.editorConfig = EditorConfigReader.get();
        this.reOrder = new ReOrder(this.win, this.doc);
    }

    function getDeleteParent(node, instance) {
        while (node !== instance.stopSelector) {
            if (instance.formatConfig.isDelete(node) === true) {
                return node;
            }

            node = node.parentNode;
        }
        return null;
    }

    function getInstructParent(node, instance) {
        while (node !== instance.stopSelector) {
            if (instance.formatConfig.isInstruct(node) === true) {
                return node;
            }

            node = node.parentNode;
        }
        return null;
    }

    function hasContainerLengthAndItsOffsetEqual(context, containerType) {
        if (containerType === 'start') {
            return context.startContainer.length === context.startOffset;
        }

        return context.endContainer.length === context.endOffset;
    }

    function getNextNode(node) {
        return node.nextSibling;
    }

    function getPrevNode(node) {
        return node.previousSibling;
    }

    function isElementNode(node, win) {
        return node.nodeType === win.Node.ELEMENT_NODE;
    }

    function selectionWithInDelete(selectionContext) {
        var i = 0, len = selectionContext.commonFormattingAncestors.length;

        for (; i < len; i += 1) {
            if (selectionContext.commonFormattingAncestors[i] === 'delete') {
                return true;
            }
        }

        return false;
    }

    function getNextTextNode(node, instance) {
        var parent, walker, currentNode, foundNode = false;

        if (node.nodeType === instance.win.Node.TEXT_NODE) {
            if (node.parentNode.matches(instance.stopSelector) === true) {
                parent = node.parentNode;
            }
            else {
                parent = node.parentNode.closest(instance.stopSelector);
            }
        }
        else {
            parent = node.closest(instance.stopSelector);
        }

        if (parent === null || typeof parent === 'undefined') {
            return null;
        }

        walker = instance.doc.createTreeWalker(
            parent, instance.win.NodeFilter.SHOW_TEXT, null, false
        );
        currentNode = walker.nextNode();

        while (currentNode !== null) {
            if (node !== currentNode && foundNode === false) {
                currentNode = walker.nextNode();
            }
            else if (currentNode === node) {
                foundNode = true;
                currentNode = walker.nextNode();
            }
            else if (foundNode === true && currentNode.nodeType !== instance.win.Node.TEXT_NODE) {
                currentNode = walker.nextNode();
            }
            else if (foundNode === true && currentNode.nodeType === instance.win.Node.TEXT_NODE &&
                currentNode.nodeValue.length === 0
            ) {
                currentNode = walker.nextNode();
            }
            else {
                return currentNode;
            }
        }

        return null;
    }

    function getPrevTextNode(node, instance) {
        var para, walker, currentNode, foundNode = false;

        /* istanbul ignore else */
        if (node.nodeType === instance.win.Node.TEXT_NODE) {
            if (node.parentNode.matches(instance.stopSelector) === true) {
                para = node.parentNode;
            }
            else {
                para = node.parentNode.closest(instance.stopSelector);
            }
        }
        else {
            para = node.closest(instance.stopSelector);
        }

        if (para === null || typeof para === 'undefined') {
            return null;
        }

        walker = instance.doc.createTreeWalker(
            para, instance.win.NodeFilter.SHOW_TEXT, null, false
        );

        currentNode = walker.lastChild();

        if (isElementNode(currentNode, instance.win)) {
            currentNode = getNextTextNode(currentNode, instance);
        }

        while (currentNode !== null) {
            if (node !== currentNode && foundNode === false) {
                currentNode = walker.previousNode();
            }
            else if (currentNode === node) {
                foundNode = true;
                currentNode = walker.previousNode();
            }
            else if (foundNode === true && currentNode.nodeType !== instance.win.Node.TEXT_NODE) {
                currentNode = walker.previousNode();
            }
            else if (foundNode === true && currentNode.nodeType === instance.win.Node.TEXT_NODE &&
                currentNode.nodeValue.length === 0
            ) {
                currentNode = walker.previousNode();
            }
            else {
                return currentNode;
            }
        }

        return null;
    }

    function moveCursorLeftByOneChar(selectionContext, instance) {
        var offset = 0, node = selectionContext.startContainer, range;

        /* istanbul ignore else */
        if (selectionContext.startOffset > 0) {
            offset = selectionContext.startOffset - 1;
        }

        range = instance.doc.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);

        selectionContext.removeAllRanges();
        selectionContext.addRange(range);
    }

    function moveCursorRightByOneChar(selectionContext, instance) {
        var offset = selectionContext.startOffset + 1,
            node = selectionContext.startContainer, range;

        range = instance.doc.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset);

        selectionContext.removeAllRanges();
        selectionContext.addRange(range);
    }

    function selectOneCharFromLeft(selectionContext, node, instance, offset) {
        var range = instance.doc.createRange();

        if (typeof offset === 'undefined') {
            offset = node.length;
        }

        range.setStart(node, offset);
        range.setEnd(node, offset);
        selectionContext.removeAllRanges();
        selectionContext.addRange(range);
    }

    function selectOneCharFromRight(selectionContext, node, instance, offset) {
        var range = instance.doc.createRange();

        if (typeof offset === 'undefined') {
            offset = 0;
        }

        range.setStart(node, offset);
        range.setEnd(node, offset);
        selectionContext.removeAllRanges();
        selectionContext.addRange(range);
    }

    function setDeleteNodeCursorPosition(selectionContext, node, instance, deleteType) {
        var range = instance.doc.createRange(), offset = 0;

        if (deleteType === 'delete') {
            offset = node.textContent.length;
        }

        range.setStart(node, offset);
        range.setEnd(node, offset);
        selectionContext.removeAllRanges();
        selectionContext.addRange(range);
    }

    function doBackSpaceDelete(selectionContext, instance, deleteType) {
        var deleteWrapper = instance.formatConfig.getDeleteWrapper(),
            previousSibling = getPrevNode(selectionContext.startContainer),
            node, nextTextNode, prevTextNode, deleteNode, range, contents,
            correctionIdAttr = instance.editorConfig.getCorrectionIdAttribute(),
            correctionId = instance.util.getCorrectionId();

        if (getPrevTextNode(selectionContext.startContainer, instance) === null &&
            selectionContext.startOffset === 0 ||
                instance.util.isParentNonEditable(selectionContext, instance) === true
        ) {
            return;
        }

        if (selectionWithInDelete(selectionContext) === true) {
            node = selectionContext.startContainer;
            deleteNode = getDeleteParent(node, instance);
            prevTextNode = getPrevTextNode(node, instance);
            previousSibling = deleteNode.previousSibling;

            if (selectionContext.startOffset !== 0) {
                moveCursorLeftByOneChar(selectionContext, instance);
            }
            else if (selectionContext.startOffset === 0 && previousSibling === null) {
                selectOneCharFromLeft(selectionContext, prevTextNode, instance);
                doBackSpaceDelete(selectionContext, instance, deleteType);
            }
            else if (selectionContext.startOffset === 0 &&
                previousSibling.nodeType === instance.win.Node.ELEMENT_NODE
            ) {
                selectOneCharFromLeft(selectionContext, prevTextNode, instance);
                doBackSpaceDelete(selectionContext, instance, deleteType);
            }
            else {
                range = instance.doc.createRange();
                range.setStart(prevTextNode, prevTextNode.length - 1);
                range.setEndBefore(deleteNode);
                contents = range.cloneContents();
                range.deleteContents();
                deleteNode.insertBefore(contents, deleteNode.firstChild);
                node = deleteNode.childNodes[0];
                setDeleteNodeCursorPosition(selectionContext, node, instance, deleteType);
            }
        }
        else if (selectionContext.hasFormattingParentOf('insert') === true) {
            selectionContext.setStart(
                selectionContext.startContainer, selectionContext.startOffset - 1
            );
            selectionContext.deleteContents();

            if (selectionContext.startOffset === 0) {
                prevTextNode = getPrevTextNode(selectionContext.startContainer, instance);

                if (prevTextNode !== null) {
                    selectOneCharFromLeft(selectionContext, prevTextNode, instance);
                }
                else {
                    nextTextNode = getNextTextNode(selectionContext.startContainer, instance);
                    selectOneCharFromRight(selectionContext, nextTextNode, instance);
                }
            }
        }
        else if ((previousSibling === null &&
            selectionContext.startOffset === 0) || (previousSibling !== null &&
            previousSibling.nodeType === instance.win.Node.ELEMENT_NODE &&
            selectionContext.startOffset === 0)
        ) {
            prevTextNode = getPrevTextNode(selectionContext.startContainer, instance);
            selectOneCharFromLeft(selectionContext, prevTextNode, instance);
            doBackSpaceDelete(selectionContext, instance, deleteType);
        }
        else {
            node = selectionContext.startContainer;
            selectionContext.setStart(node, selectionContext.startOffset - 1);
            deleteWrapper.dataset[correctionIdAttr] = correctionId;
            selectionContext.surroundContents(deleteWrapper);
            nextTextNode = getNextTextNode(node, instance);
            setDeleteNodeCursorPosition(selectionContext, nextTextNode, instance, deleteType);
        }
    }

    function doDelete(selectionContext, instance, deleteType) {
        var deleteWrapper = instance.formatConfig.getDeleteWrapper(),
            nextSibling = getNextNode(selectionContext.endContainer),
            node, nextTextNode, deleteNode, range, contents,
            prevTextNode;

        if (getNextTextNode(selectionContext.endContainer, instance) === null &&
            hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === true ||
                instance.util.isParentNonEditable(selectionContext, instance) === true
        ) {
            return;
        }

        if (selectionWithInDelete(selectionContext) === true) {
            node = selectionContext.endContainer;
            deleteNode = getDeleteParent(node, instance);
            nextTextNode = getNextTextNode(node, instance);
            nextSibling = deleteNode.nextSibling;

            if (hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === false) {
                moveCursorRightByOneChar(selectionContext, instance);
            }
            else if (hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === true && nextSibling === null) {
                selectOneCharFromRight(selectionContext, nextTextNode, instance);
                doDelete(selectionContext, instance, deleteType);
            }
            else if (hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === true &&
                nextSibling.nodeType === instance.win.Node.ELEMENT_NODE
            ) {
                selectOneCharFromRight(selectionContext, nextTextNode, instance);
                doDelete(selectionContext, instance, deleteType);
            }
            else {
                range = instance.doc.createRange();
                range.setStartAfter(deleteNode);
                range.setEnd(nextTextNode, 1);
                contents = range.cloneContents();
                range.deleteContents();
                deleteNode.appendChild(contents);
                node = deleteNode.childNodes[deleteNode.childNodes.length - 1];
                setDeleteNodeCursorPosition(selectionContext, node, instance, deleteType);
            }
        }
        else if (selectionContext.hasFormattingParentOf('insert') === true) {
            selectionContext.setEnd(
                selectionContext.endContainer, selectionContext.endOffset + 1
            );
            selectionContext.deleteContents();

            if (hasContainerLengthAndItsOffsetEqual(selectionContext, 'start') === true) {
                nextTextNode = getNextTextNode(selectionContext.endContainer, instance);

                if (nextTextNode !== null) {
                    selectOneCharFromRight(selectionContext, nextTextNode, instance);
                }
                else {
                    prevTextNode = getPrevTextNode(selectionContext.endContainer, instance);
                    selectOneCharFromLeft(selectionContext, prevTextNode, instance);
                }
            }
        }
        else if ((nextSibling === null &&
            hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === true) ||
            (nextSibling !== null &&
            nextSibling.nodeType === instance.win.Node.ELEMENT_NODE &&
            hasContainerLengthAndItsOffsetEqual(selectionContext, 'end') === true
        )) {
            nextTextNode = getNextTextNode(selectionContext.endContainer, instance);
            selectOneCharFromRight(selectionContext, nextTextNode, instance);
            doDelete(selectionContext, instance, deleteType);
        }
        else {
            node = selectionContext.endContainer;
            selectionContext.setEnd(node, selectionContext.startOffset + 1);
            selectionContext.surroundContents(deleteWrapper);
            nextTextNode = getNextTextNode(node, instance);
            setDeleteNodeCursorPosition(selectionContext, nextTextNode, instance, deleteType);
        }
    }

    function doDeleteSelectedContents(instance, selection) {
        var node = selection.cloneContents(),
            walker = instance.doc.createTreeWalker(
                node, instance.win.NodeFilter.SHOW_ALL, null, false
            ),
            currentNode, range,
            fragment = instance.doc.createDocumentFragment(),
            arrangeNodeFragment = instance.doc.createDocumentFragment(),
            count = 0, tempNode, nextSibling,
            correctionIdAttr = instance.editorConfig.getCorrectionIdAttribute(),
            correctionId = instance.util.getCorrectionId();

        currentNode = walker.nextNode();

        while (currentNode !== null) {
            if (instance.util.isParentNonEditable(selection, instance) === true) {
                return;
            }
            else if (
                instance.formatConfig.isDelete(currentNode) === true ||
                instance.util.isNonEditableNode(currentNode, instance) === true
            ) {
                currentNode.dataset.parent = count;
                if (currentNode.parentNode !== null &&
                    currentNode.parentNode.nodeType !== instance.win.Node.DOCUMENT_FRAGMENT_NODE
                ) {
                    currentNode.dataset.child = currentNode.parentNode.dataset.parent;
                }
                fragment.appendChild(currentNode.cloneNode(true));
                count += 1;
                nextSibling = walker.nextSibling();
                if (nextSibling === null &&
                    currentNode.parentNode !== null &&
                    currentNode.parentNode.nodeType !== instance.win.Node.DOCUMENT_FRAGMENT_NODE
                ) {
                    walker.currentNode = currentNode.parentNode;
                    currentNode = walker.nextSibling();
                }
                else {
                    currentNode = nextSibling;
                }
            }
            else if (currentNode.nodeType === instance.win.Node.ELEMENT_NODE) {
                currentNode.dataset.parent = count;
                if (currentNode.parentNode !== null &&
                    currentNode.parentNode.nodeType !== instance.win.Node.DOCUMENT_FRAGMENT_NODE
                ) {
                    currentNode.dataset.child = currentNode.parentNode.dataset.parent;
                }
                fragment.appendChild(currentNode.cloneNode());
                count += 1;
                currentNode = walker.nextNode();
            }
            else if (currentNode.nodeType === instance.win.Node.TEXT_NODE) {
                range = instance.doc.createRange();
                range.selectNode(currentNode);
                tempNode = instance.formatConfig.wrapDelete(range.cloneContents());
                if (currentNode.parentNode !== null &&
                    currentNode.parentNode.nodeType !== instance.win.Node.DOCUMENT_FRAGMENT_NODE
                ) {
                    tempNode.dataset.child = currentNode.parentNode.dataset.parent;
                }
                tempNode.dataset[correctionIdAttr] = correctionId;
                fragment.appendChild(tempNode);
                currentNode = walker.nextNode();
            }
        }

        instance.util.arrangeNodes(fragment, arrangeNodeFragment, instance);
        selection.deleteContents();
        selection.insertNode(arrangeNodeFragment);
    }

    DeleteCommand.prototype.execute = function execute(deleteType) {
        var closestBlockParent, sectionParent;

        this.selectionContext = SelectionContext.get(this.win);
        if (this.util.isValidSelection(this.selectionContext) === false) {
            throw new Error('multiple.section.formatting.not.allowed');
        }

        closestBlockParent = this.selectionContext.closestBlockParent;
        sectionParent = this.selectionContext.sectionParent;
        this.stopSelector = this.selectionContext.baseSelector;
        /* istanbul ignore else */
        if (this.selectionContext.collapsed === true) {
            if (deleteType === 'backspace') {
                doBackSpaceDelete(this.selectionContext, this, deleteType);
            }
            else {
                doDelete(this.selectionContext, this, deleteType);
            }
        }
        else if (this.selectionContext.hasFormattingParentOf('insert') === true) {
            this.selectionContext.deleteContents();
        }
        else {
            if (this.selectionContext.hasFormattingParentOf('instruct') === false) {
                this.util.splitTags(this.selectionContext);
            }
            doDeleteSelectedContents(this, this.selectionContext);
        }
        closestBlockParent.normalize();
        this.normalizer.normalize(closestBlockParent);
        ActionCompleteHandler.actionComplete(sectionParent);
    };

    DeleteCommand.prototype.doReplace = function doReplace(selection) {
        var range, deleteNode, deleteWrapper = this.formatConfig.getDeleteWrapper(),
            selectors, cloneContents, i = 0,
            correctionIdAttr = this.editorConfig.getCorrectionIdAttribute(),
            correctionId = this.util.getCorrectionId();

        /* istanbul ignore else */
        if (selection.hasFormattingParentOf('instruct') === false) {
            this.util.splitTags(selection);
        }
        cloneContents = selection.cloneContents();
        deleteWrapper.dataset[correctionIdAttr] = correctionId;
        selectors = cloneContents.querySelectorAll('span[data-format-insert="true"]');
        for (; i < selectors.length; i += 1) {
            selectors[i].remove();
        }
        selection.deleteContents();
        selection.insertNode(deleteWrapper);
        deleteWrapper.appendChild(cloneContents);
        deleteNode = deleteWrapper.firstChild;
        range = this.doc.createRange();
        range.selectNode(deleteNode);
        selection.removeAllRanges();
        selection.addRange(range);

        return selection;
    };

    DeleteCommand.prototype.destroy = function destroy() {
        initVariables(this);
    };

    return DeleteCommand;
});

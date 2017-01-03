define([
    'scripts/editor/FormattingConfig', 'scripts/editor/Selection', 'scripts/editor/Util',
    'scripts/editor/DeleteCommand', 'scripts/editor/ActionCompleteHandler',
    'scripts/editor/EditorConfigReader', 'scripts/editor/Normalizer'
], function insertCommandLoader(
    FormattingConfig, SelectionContext, Util, DeleteCommand, ActionCompleteHandler,
    EditorConfigReader, Normalizer
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
        Object.defineProperty(obj, 'deleteCommand', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'options', {
            'value': {},
            'writable': true
        });
        Object.defineProperty(obj, 'baseNode', {
            'value': 'section',
            'writable': false
        });
        Object.defineProperty(obj, 'formatConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'util', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'commentsMapper', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'editorConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'normalizer', {
            'value': null,
            'writable': true
        });
    }

    function InsertCommand(win, doc, commentsMapper) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.commentsMapper = commentsMapper;
        this.util = new Util(this.win, this.doc);
        this.formatConfig = FormattingConfig.get(this.win);
        this.deleteCommand = new DeleteCommand(this.win, this.doc);
        this.editorConfig = EditorConfigReader.get();
        this.normalizer = new Normalizer(this.win, this.doc);
    }

    function hasInsertParent(formattingAncestors) {
        var len = formattingAncestors.length, i = 0;

        for (;i < len; i += 1) {
            if (formattingAncestors[i] === 'insert') {
                return true;
            }
        }
        return false;
    }

    function hasFormattingParent(formattingAncestors) {
        return formattingAncestors.length > 0;
    }

    function getLastElementChild(node) {
        while (node.hasChildNodes() === true) {
            node = node.lastChild;
        }
        return node.parentNode;
    }

    function selectionIsDeleteNode(selection, instance) {
        var cloneContent = selection.cloneContents();

        if (instance.formatConfig.isDelete(cloneContent.firstChild) === true) {
            return true;
        }

        return false;
    }

    function moveCursorToLastPosition(node, sel, instance) {
        var range;

        range = instance.doc.createRange();
        range.setStart(node.firstChild, node.firstChild.length);
        range.setEnd(node.firstChild, node.firstChild.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function insertNode(selection, insertWrapper, instance) {
        var spaceNode, range;

        selection.insertNode(insertWrapper);
        spaceNode = insertWrapper.firstChild;
        range = instance.doc.createRange();
        range.setStart(spaceNode, 1);
        range.setEnd(spaceNode, 1);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function getDeleteNode(selection, instance) {
        var node = selection.startContainer,
            deleteNode, nodeList;

        if (node.nodeType === instance.win.Node.TEXT_NODE) {
            node = node.parentNode;
        }
        deleteNode = node.closest('[data-format-delete="true"]');

        nodeList = selection.closestBlockParent.querySelectorAll(
            '[data-format-delete="true"][data-actor="' + deleteNode.dataset.actor + '"]'
        );

        return nodeList[nodeList.length - 1];
    }

    InsertCommand.prototype.execute = function execute(e) {
        var insertWrapper = this.formatConfig.getInsertWrapper(),
            selection = SelectionContext.get(this.win),
            formattingAncestors = selection.commonFormattingAncestors,
            range, lastElementChild, startContainer,
            correctionIdAttr = this.editorConfig.getCorrectionIdAttribute(),
            correctionId = this.util.getCorrectionId(), deleteNode, nextSibling;

        insertWrapper.dataset[correctionIdAttr] = correctionId;

        if (selection.collapsed === true) {
            if (hasFormattingParent(formattingAncestors) === false) {
                insertNode(selection, insertWrapper, this);
            }
            else if (selection.hasFormattingParentOf('instruct') === true) {
                /* istanbul ignore else */
                if (hasInsertParent(formattingAncestors) === false) {
                    insertNode(selection, insertWrapper, this);
                }
            }
            /* istanbul ignore else */
            else if (selection.hasFormattingParentOf('delete') === true) {
                deleteNode = getDeleteNode(selection, this);
                nextSibling = deleteNode.nextSibling;

                if (nextSibling === null) {
                    nextSibling = this.doc.createTextNode(String.fromCharCode(8203));
                    deleteNode.parentNode.appendChild(nextSibling);
                }

                range = this.doc.createRange();
                range.setEndAfter(deleteNode);
                range.setStartBefore(nextSibling);
                selection.removeAllRanges();
                selection.addRange(range);
                insertNode(selection, insertWrapper, this);
            }
            else if (hasFormattingParent(formattingAncestors) === true &&
                hasInsertParent(formattingAncestors) === false
            ) {
                this.util.splitTags(selection);
                selection = SelectionContext.get(this.win);
                if (selectionIsDeleteNode(selection, this) === false) {
                    selection.surroundContents(insertWrapper);
                }
                else {
                    selection.insertNode(insertWrapper);
                }
                lastElementChild = getLastElementChild(insertWrapper);
                lastElementChild.innerHTML = '&#8203';
                range = this.doc.createRange();
                range.setStart(lastElementChild.lastChild, 1);
                range.setEnd(lastElementChild.lastChild, 1);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        else {
            if (selection.hasFormattingParentOf('delete') === true) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            selection = this.deleteCommand.doReplace(selection);
            startContainer = selection.startContainer;
            startContainer.parentNode.insertBefore(insertWrapper, startContainer.nextSibling);
            lastElementChild = getLastElementChild(insertWrapper);
            lastElementChild.innerHTML = '&#8203';
            insertWrapper.normalize();
            range = this.doc.createRange();
            range.setStart(lastElementChild.lastChild, 1);
            range.setEnd(lastElementChild.lastChild, 1);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        this.normalizer.normalize(selection.closestBlockParent);
        ActionCompleteHandler.actionComplete(selection.sectionParent);
    };

    InsertCommand.prototype.pasteHtml = function pasteHtml(node) {
        var insertWrapper = this.formatConfig.getInsertWrapper(),
            selection = SelectionContext.get(this.win),
            formattingAncestors = selection.commonFormattingAncestors,
            startContainer,
            correctionIdAttr = this.editorConfig.getCorrectionIdAttribute(),
            correctionId = this.util.getCorrectionId();

        if (node.textContent.length === 0) {
            return;
        }
        insertWrapper.dataset[correctionIdAttr] = correctionId;

        if (selection.collapsed === true) {
            if (hasFormattingParent(formattingAncestors) === false) {
                selection.insertNode(insertWrapper);
                while (node.firstChild !== null) {
                    insertWrapper.appendChild(node.firstChild);
                }
                insertWrapper.appendChild(node);
                insertWrapper.normalize();
                moveCursorToLastPosition(insertWrapper, selection, this);
            }
            /* istanbul ignore else */
            else if (hasFormattingParent(formattingAncestors) === true) {
                this.util.splitTags(selection);
                selection = SelectionContext.get(this.win);
                selection.insertNode(insertWrapper);
                while (node.firstChild !== null) {
                    insertWrapper.appendChild(node.firstChild);
                }
                insertWrapper.normalize();
                moveCursorToLastPosition(insertWrapper, selection, this);
            }
        }
        else {
            selection = this.deleteCommand.doReplace(selection);
            startContainer = selection.startContainer;
            startContainer.parentNode.insertBefore(insertWrapper, startContainer.nextSibling);
            while (node.firstChild !== null) {
                insertWrapper.appendChild(node.firstChild);
            }
            insertWrapper.normalize();
            moveCursorToLastPosition(insertWrapper, selection, this);
        }
        this.commentsMapper.reOrderComments();
        this.normalizer.normalize(selection.closestBlockParent);
        ActionCompleteHandler.actionComplete(selection.sectionParent);
    };

    InsertCommand.prototype.destroy = function destroy() {
        initVariables();
    };

    return InsertCommand;
});

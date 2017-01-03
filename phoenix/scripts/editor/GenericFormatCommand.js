define([
    'scripts/editor/FormattingConfig', 'scripts/Helper', 'scripts/editor/Normalizer',
    'scripts/editor/Util', 'scripts/editor/Selection', 'scripts/editor/EditorConfigReader',
    'scripts/editor/ActionCompleteHandler'
], function GenericFormatCommandLoader(
    FormattingConfig, Helper, Normalizer, Util, Selection, EditorConfigReader,
    ActionCompleteHandler
) {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance GenericCommand Instance
     * @return {void}
     */
    function initVariables(instance) {
        var obj = instance;

        /**
         * Global Window object
         * @property {Window} win
         * @private
         */
        Object.defineProperty(obj, 'win', {
            'value': null,
            'writable': true
        });
        /**
         * Global Document object
         * @property {HTMLDocument} doc
         * @private
         */
        Object.defineProperty(obj, 'doc', {
            'value': null,
            'writable': true
        });
        /**
         * Selection class instance
         * @property {Selection} selectionContext
         * @private
         */
        Object.defineProperty(obj, 'selectionContext', {
            'value': null,
            'writable': true
        });
        /**
         * FormattingConfig instance
         * @property {FormattingConfig} formatConfig
         * @private
         */
        Object.defineProperty(obj, 'formatConfig', {
            'value': null,
            'writable': true
        });
        /**
         * EditorHelper class instance
         * @property {EditorHelper} helper
         * @private
         */
        Object.defineProperty(obj, 'helper', {
            'value': null,
            'writable': true
        });
        /**
         * Document fragment
         * @property {DocumentFragment} fragment
         * @private
         */
        Object.defineProperty(obj, 'fragment', {
            'value': null,
            'writable': true
        });
        /**
         * Normalizer class instance
         * @property {Normalizer} normalizer
         * @private
         */
        Object.defineProperty(obj, 'normalizer', {
            'value': null,
            'writable': true
        });
    }

    /**
     * Wraps a selection with Generic format tag
     *
     * @class GenericFormatCommand
     * @constructor
     * @param {Window} win - window global object
     * @param {HTMLDocument} doc - document global object
     *
     * @example
     *     require(['scripts/Selection', 'scripts/Util'], function onLoad(Selection, Util) {
     *         var genericFormatCommand = new GenericFormatCommand(window, document);
     *
     *         // Select html using keyboard or mouse, then call 'execute'
     *         // this will throw error unless decorated with a concrete command
     *         genericFormatCommand.execute();
     *     });
     */
    function GenericFormatCommand(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.selectionContext = Selection;
        this.formatConfig = FormattingConfig.get(this.win);
        this.util = new Util(win, doc);
        this.normalizer = new Normalizer(this.win, this.doc);
        this.editorConfig = EditorConfigReader.get();
    }

    function treeWalker(instance, node) {
        var walker;

        walker = instance.doc.createTreeWalker(
            node, instance.win.NodeFilter.SHOW_ALL, null, false
        );

        return walker;
    }

    function clearFormat(selection, instance) {
        var cloneContents, childNodes, formatParentNode, i = 0, formatNode, node,
            selector = instance.getRemoveFormatCssSelector();

        cloneContents = selection.cloneContents();
        childNodes = cloneContents.querySelectorAll(selector);
        for (; i < childNodes.length; i += 1) {
            formatNode = childNodes[i];
            node = instance.formatConfig.unFormatWrapper(formatNode);
            formatParentNode = formatNode.parentNode;
            formatParentNode.replaceChild(node, formatNode);
        }
        selection.deleteContents();
        selection.insertNode(cloneContents);
    }

    function insertPreserveSelectionNodes(fragment, instance) {
        var startEl = instance.doc.createElement('span'),
            endEl = instance.doc.createElement('span');

        startEl.setAttribute('class', 'selection-start');
        endEl.setAttribute('class', 'selection-end');
        fragment.insertBefore(startEl, fragment.firstChild);
        fragment.appendChild(endEl);
    }

    function clearPartialSelection(instance, selection) {
        var cloneContents, childNodes, formatParentNode, i = 0, formatNode, node,
            selector = instance.getFormatCssSelector();

        cloneContents = selection.cloneContents();
        childNodes = cloneContents.querySelectorAll(selector);
        for (; i < childNodes.length; i += 1) {
            formatNode = childNodes[i];
            node = instance.formatConfig.unFormatWrapper(formatNode);
            formatParentNode = formatNode.parentNode;
            formatParentNode.replaceChild(node, formatNode);
        }
        selection.deleteContents();
        insertPreserveSelectionNodes(cloneContents, instance);
        selection.insertNode(cloneContents);
        clearFormat(selection, instance);
    }

    function splitAndClearFormatOnSelection(instance, selection) {
        var childNodes, i = 0, formatNode, formatParentNode, currentNode, range,
            selector = instance.getFormatCssSelector(), node;

        if (selection.styleGrandParent !== null) {
            childNodes = selection.styleGrandParent.childNodes;
            instance.util.splitTags(selection);
            /* istanbul ignore else */
            if (selection.startOffset > 0) {
                //selection = instance.selectionContext;
                clearPartialSelection(instance, selection);
            }
            //TODO : Need to check
            /* istanbul ignore else */
            else if (childNodes.length > 0) {
                for (; i < childNodes.length; i += 1) {
                    currentNode = childNodes[i];
                    if (currentNode.nodeType === instance.doc.TEXT_NODE) {
                        currentNode = currentNode.parentNode;
                    }
                    else if (instance.isFormatNode(currentNode) === true) {
                        formatNode = currentNode;
                        formatParentNode = formatNode.parentNode;
                        instance.fragment = instance.formatConfig.unFormatWrapper(formatNode);
                        formatParentNode.replaceChild(instance.fragment, formatNode);
                    }
                    else {
                        childNodes = currentNode.querySelectorAll(selector);
                        for (; i < childNodes.length; i += 1) {
                            formatNode = childNodes[i];
                            node = instance.formatConfig.unFormatWrapper(formatNode);
                            formatParentNode = formatNode.parentNode;
                            formatParentNode.replaceChild(node, formatNode);
                            instance.fragment.appendChild(formatParentNode);
                        }
                    }
                }
                range = instance.doc.createRange();
                range.selectNode(formatParentNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        else {
            clearPartialSelection(instance, selection);
        }
    }

    function preserveSelection(selection, instance) {
        var range = instance.doc.createRange(), commonAncestorContainer, selectionStart,
            selectionEnd, startContainer = selection.startContainer;

        if (startContainer.nodeType === instance.win.Node.TEXT_NODE) {
            startContainer = startContainer.parentNode;
        }
        commonAncestorContainer = selection.commonAncestorContainer;
        selectionStart = commonAncestorContainer.querySelector('span.selection-start');
        selectionEnd = commonAncestorContainer.querySelector('span.selection-end');
        /* istanbul ignore else */
        if (selectionStart !== null && selectionEnd !== null) {
            range.setStartAfter(selectionStart);
            range.setEndBefore(selectionEnd);
            selection.removeAllRanges();
            selection.addRange(range);
            selectionStart.parentNode.removeChild(selectionStart);
            selectionEnd.parentNode.removeChild(selectionEnd);
        }
    }

    function wrapFormatOnSelection(instance, selection) {
        var node = selection.cloneContents(),
            walker = treeWalker(instance, node),
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
                instance.isFormatNode(currentNode) === true ||
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
                tempNode = instance.wrapWithFormat(range.cloneContents());
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
        insertPreserveSelectionNodes(arrangeNodeFragment, instance);
        selection.deleteContents();
        selection.insertNode(arrangeNodeFragment);
        clearFormat(selection, instance);
    }

    GenericFormatCommand.prototype.isFormatNode = function isFormatNode(node) {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.createFormatWrapper = function createFormatWrapper() {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.hasFormattingParent = function hasFormattingParent(selection) {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.getFormatCssSelector = function getFormatCssSelector() {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.wrapWithFormat = function wrapWithFormat(node) {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.hasUnFormatNode = function hasUnFormatNode(fragment) {
        throw new Error('override.this.in.decorator');
    };

    GenericFormatCommand.prototype.getRemoveFormatCssSelector =
    function getRemoveFormatCssSelector(
    ) {
        throw new Error('override.this.in.decorator');
    };

    /**
     * Executes wrapping of Generic format task
     *
     * @method execute
     * @return {void}
     */
    GenericFormatCommand.prototype.execute = function execute() {
        var selection = this.selectionContext.get(this.win),
            cloneContents = selection.cloneContents(),
            unFormatNode = this.hasUnFormatNode(cloneContents);

        if (this.util.isValidSelection(selection) === false) {
            throw new Error('multiple.section.formatting.not.allowed');
        }

        if (selection.collapsed === false) {
            if (selection.hasFormattingParentOf('delete') === true) {
                return;
            }
            if (this.hasFormattingParent(selection) === false &&
                unFormatNode === true
            ) {
                this.util.splitTags(selection);
                wrapFormatOnSelection(this, selection);
            }
            else {
                splitAndClearFormatOnSelection(this, selection);
            }

            this.normalizer.normalize(selection.closestBlockParent);
            ActionCompleteHandler.actionComplete(selection.sectionParent);
        }
        preserveSelection(selection, this);
    };

    /**
     * Cleans up created instances. Moves the state back to clean slate.
     *
     * @method destroy
     * @return {void}
     */
    GenericFormatCommand.prototype.destroy = function destroy() {
        initVariables.call(this);
    };

    return GenericFormatCommand;
});

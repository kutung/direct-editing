define([], function SubScriptCommandLoader() {
    'use strict';

    function initVariables(instance) {
        var obj = instance;

        Object.defineProperty(obj, 'genericCommand', {
            'value': null,
            'writable': true
        });
    }

    function SubScriptCommand(genericCommand) {
        initVariables(this);
        this.genericCommand = genericCommand;
        this.genericCommand.isFormatNode = function isFormatNode(node) {
            return this.formatConfig.isSub(node);
        };
        this.genericCommand.isFormatNode.bind(this.genericCommand);
        this.genericCommand.wrapWithFormat = function wrapWithFormat(node) {
            return this.formatConfig.wrapSubScript(node);
        };
        this.genericCommand.wrapWithFormat.bind(this.genericCommand);
        this.genericCommand.createFormatWrapper = function createFormatWrapper() {
            return this.formatConfig.getSubScriptWrapper();
        };
        this.genericCommand.createFormatWrapper.bind(this.genericCommand);
        this.genericCommand.hasFormattingParent = function hasFormattingParent(selection) {
            return selection.hasFormattingParentOf('sub');
        };
        this.genericCommand.hasFormattingParent.bind(this.genericCommand);
        this.genericCommand.getFormatCssSelector = function getFormatCssSelector() {
            return 'span[data-format-sub="true"]';
        };
        this.genericCommand.getFormatCssSelector.bind(this.genericCommand);
        this.genericCommand.hasUnFormatNode = function hasUnFormatNode(fragment) {
            var walker = this.doc.createTreeWalker(
                    fragment, this.win.NodeFilter.SHOW_ALL, null, false
                ),
                currentNode = walker.nextNode(),
                nextSibling;

            while (currentNode !== null) {
                if (currentNode.nodeType === this.win.Node.TEXT_NODE &&
                   currentNode.textContent.length > 0
                ) {
                    return true;
                }
                //TODO : Need to remove the below condition once normalizer issue has been fixed
                else if (currentNode.nodeType === this.win.Node.TEXT_NODE &&
                   currentNode.textContent.length === 0
                ) {
                    currentNode = currentNode.nextElementSibling;
                }
                /* istanbul ignore else */
                else if (currentNode.nodeType === this.win.Node.ELEMENT_NODE) {
                    if (this.formatConfig.isDelete(currentNode) === true) {
                        currentNode = walker.nextSibling();
                    }
                    else if ((this.formatConfig.isBold(currentNode) === true ||
                        this.formatConfig.isItalic(currentNode) === true ||
                        this.formatConfig.isSup(currentNode) === true ||
                        this.formatConfig.isInsert(currentNode) === true) &&
                        currentNode.childElementCount === 0
                    ) {
                        return true;
                    }
                    else if (this.formatConfig.isSub(currentNode) === true) {
                        nextSibling = walker.nextSibling();
                        if (nextSibling === null &&
                            currentNode.parentNode !== null &&
                            currentNode.parentNode.nodeType !== this.win.Node.DOCUMENT_FRAGMENT_NODE
                        ) {
                            walker.currentNode = currentNode.parentNode;
                            currentNode = walker.nextSibling();
                        }
                        else {
                            currentNode = nextSibling;
                        }
                    }
                    else {
                        currentNode = walker.nextNode();
                    }
                }
            }
            return false;
        };
        this.genericCommand.hasUnFormatNode.bind(this.genericCommand);
        this.genericCommand.getRemoveFormatCssSelector = function getRemoveFormatCssSelector() {
            return 'span[data-format-sup="true"]';
        };
        this.genericCommand.getRemoveFormatCssSelector.bind(this.genericCommand);
    }

    SubScriptCommand.prototype.execute = function execute() {
        this.genericCommand.execute();
    };

    return SubScriptCommand;
});

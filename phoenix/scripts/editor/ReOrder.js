define([
    'scripts/editor/FormattingConfig', 'scripts/editor/EditorConfigReader'
],
function reOrderLoader(FormattingConfig, EditorConfigReader) {
    'use strict';
    function initializeVariables(instance) {
        instance.doc = null;
        instance.win = null;
        instance.formattingConfig = null;
        instance.orderingArray = null;
        instance.editorConfig = null;
        instance.completed = [];
    }

    function ReOrder(win, doc) {
        initializeVariables(this);
        this.win = win;
        this.doc = doc;
        this.formattingConfig = FormattingConfig.get(win);
        this.editorConfig = EditorConfigReader.get();
        this.orderingArray = this.editorConfig.getOrderingArray();
    }

    function getFormatSelector(format) {
        return '[data-format-' + format + '="true"]';
    }

    function load(instance, node, format) {
        var formatNode, parentFormattingNode, currentTextNode, wrapper, tempNode,
            treeWalker, tempParentNode,
            formatSelector = getFormatSelector(format),
            formatNodes = node.querySelectorAll(formatSelector),
            len = formatNodes.length,
            formattingConfig = instance.formattingConfig,
            i = 0;

        for (;i < len; i += 1) {
            formatNode = formatNodes[i];
            parentFormattingNode = formatNode.parentNode;
            while (formattingConfig.hasAnyFormatting(parentFormattingNode) === true) {
                if (instance.completed.length === 0 ||
                    parentFormattingNode.matches(instance.completed.join(',')) === false
                ) {
                    treeWalker = instance.doc.createTreeWalker(
                        parentFormattingNode, instance.win.NodeFilter.SHOW_TEXT, null, false
                    );

                    currentTextNode = treeWalker.nextNode();
                    while (currentTextNode !== null) {
                        wrapper = parentFormattingNode.cloneNode(false);
                        wrapper.appendChild(currentTextNode.cloneNode(true));
                        currentTextNode.parentNode.insertBefore(wrapper, currentTextNode);

                        currentTextNode = treeWalker.nextNode();
                        tempNode = wrapper.nextSibling;
                        tempNode.parentNode.removeChild(tempNode);
                    }
                    tempParentNode = parentFormattingNode.parentNode;
                    while (parentFormattingNode.firstChild !== null) {
                        parentFormattingNode.parentNode.insertBefore(
                            parentFormattingNode.firstChild, parentFormattingNode
                        );
                    }
                    parentFormattingNode.parentNode.removeChild(parentFormattingNode);
                    parentFormattingNode = tempParentNode;
                    continue;
                }
                parentFormattingNode = parentFormattingNode.parentNode;
            }
            instance.completed.push(formatSelector);
        }
        return node;
    }

    ReOrder.prototype.orderNodes = function orderNodes(node) {
        var len = this.orderingArray.length,
            i = 0;

        this.completed = [];
        for (;i < len; i += 1) {
            node = load(this, node, this.orderingArray[i]);
        }
        return node;
    };

    return ReOrder;
});

define([
    'scripts/editor/FormattingConfig', 'scripts/editor/Helper', 'scripts/EventBus',
    'scripts/editor/EditorConfigReader', 'scripts/editor/ReOrder'
],
function NormalizeLoader(
    FormattingConfig, EditorHelper, EventBus, EditorConfigReader, ReOrder
) {
    'use strict';
    var prevNode, timer,
        delay = 1000;

    function initVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.helper = null;
        instance.reRun = false;
        instance.editorConfig = null;
        instance.reOrder = null;
    }

    function Normalizer(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.helper = EditorHelper.get(this.win);
        this.editorConfig = EditorConfigReader.get();
        this.reOrder = new ReOrder(this.win, this.doc);
    }

    function treeWalker(instance, node) {
        var walker;

        walker = instance.doc.createTreeWalker(
            node, instance.win.NodeFilter.SHOW_ALL, null, false
        );

        return walker;
    }

    function getNextElementNode(walker, instance) {
        var currentNode = walker.nextNode(), zwsp = String.fromCharCode(8203);

        if (currentNode.nodeType === instance.win.Node.TEXT_NODE) {
            if (currentNode.textContent.indexOf(zwsp) !== -1) {
                currentNode.textContent = currentNode.textContent.replace(zwsp, '');
            }
            return walker.nextNode();
        }
        return walker.currentNode;
    }

    function getAttribute(node, instance) {
        var dataset = node.dataset, i = 0,
            formats = [
                'formatBold', 'formatItalic', 'formatSup', 'formatSub', 'formatDelete',
                'formatInsert', 'formatInstruct'
            ], len = formats.length;

        if (instance.helper.isElementNode(node) === true && node.hasAttributes() === true) {
            for (; i < len; i += 1) {
                if (formats[i] in dataset === true) {
                    return formats[i];
                }
            }

            if (node.hasAttribute('class') === true) {
                return node.getAttribute('class');
            }
        }

        return null;
    }

    function hasSameFormatting(prevNode, currentNode, instance) {
        var prevNodeAttr, currentNodeAttr;

        prevNodeAttr = getAttribute(prevNode, instance);
        currentNodeAttr = getAttribute(currentNode, instance);

        if (prevNodeAttr === currentNodeAttr && prevNode.nodeName === currentNode.nodeName) {
            return true;
        }
        return false;
    }

    function areNodesEqual(prevNode, currentNode, instance) {
        var i = 0, currChildNode, prevChildNode,
            prevNodeLen = prevNode.childNodes.length,
            currentNodeLen = currentNode.childNodes.length;

        if (prevNodeLen !== currentNodeLen) {
            return false;
        }

        if (prevNodeLen === 1) {
            if (instance.helper.isElementNode(currentNode) === true &&
                instance.helper.isElementNode(prevNode) === true
            ) {
                return hasSameFormatting(prevNode, currentNode, instance);
            }
        }
        else {
            for (; i < prevNodeLen; i += 1) {
                prevChildNode = prevNode.childNodes[i];
                currChildNode = currentNode.childNodes[i];

                if (instance.helper.isElementNode(currChildNode) === false ||
                    instance.helper.isElementNode(prevChildNode) === false ||
                    prevChildNode.nodeType !== prevChildNode.nodeType
                ) {
                    return false;
                }

                if (instance.helper.isElementNode(currChildNode) === true &&
                    instance.helper.isElementNode(prevChildNode) === true &&
                    hasSameFormatting(prevChildNode, currChildNode, instance) === false
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    function isEmptyNode(currentNode) {
        if (currentNode.nodeType === 1 &&
            currentNode.classList.contains('selection-start') === false &&
            currentNode.classList.contains('selection-end') === false
        ) {
            if (currentNode.textContent.length === 0) {
                return true;
            }
        }
        return false;
    }

    function isSingleSpanWithTextNode(node, instance) {
        if (instance.helper.isElementNode(node) === true &&
            node.nodeName.toLowerCase() === 'span' && node.textContent.length > 0 &&
            node.childElementCount === 0 && node.hasAttributes() === false
        ) {
            return true;
        }

        return false;
    }

    function processSingleSpanWithTextNode(node, instance) {
        var i = 0, len = node.childNodes.length;

        for (; i < len; i += 1) {
            if (isSingleSpanWithTextNode(node.childNodes[i], instance) === true) {
                node.replaceChild(
                    document.createTextNode(node.childNodes[i].textContent),
                    node.childNodes[i]
                );
                instance.reRun = true;
            }
        }
    }

    function groupSameNodeSiblings(currentNode, instance) {
        var prevNode = currentNode, i = 0;

        currentNode = prevNode.nextSibling;

        if (currentNode === null || prevNode === null) {
            return;
        }

        if (currentNode.nodeType === instance.win.Node.ELEMENT_NODE &&
            prevNode.nodeType === instance.win.Node.ELEMENT_NODE &&
            areNodesEqual(prevNode, currentNode, instance) === true
        ) {
            //TODO : Need to fix
            for (; i < currentNode.childNodes.length; i += 1) {
                prevNode.appendChild(currentNode.childNodes[i]);
                instance.reRun = true;
            }
        }
    }

    function replaceZeroWidthSpaceCharacter(node, instance) {
        var zwsp = String.fromCharCode(8203);

        if (node.nodeType === instance.win.Node.ELEMENT_NODE &&
            node.textContent.indexOf(zwsp) !== -1
        ) {
            node.innerHTML = node.innerHTML.replace(zwsp, '');
            instance.reRun = true;
        }
        else if (node.textContent.indexOf(zwsp) !== -1) {
            node.textContent = node.textContent.replace(zwsp, '');
            instance.reRun = true;
        }
    }

    function groupChildNodes(prevNode, currentNode, instance) {
        var i = 0, len = currentNode.childNodes.length;

        if (currentNode.nodeType === instance.win.Node.ELEMENT_NODE) {
            if (hasSameFormatting(prevNode, currentNode, instance) === true &&
                (currentNode.textContent.length > 0 || currentNode.childNodes.length > 1)
            ) {
                for (; i < len; i += 1) {
                    if (isEmptyNode(currentNode.firstChild) === false) {
                        currentNode.parentNode.insertBefore(currentNode.firstChild, currentNode);
                    }
                }
                instance.reRun = true;
            }
        }
    }

    function hasLeaf(node, instance) {
        if (instance.helper.isElementNode(node) === true && node.children.length > 0) {
            return true;
        }
        return false;
    }

    function removeEmptyNodes(node, instance) {
        var i = 0;

        //TODO : Need to fix
        for (; i < node.childNodes.length; i += 1) {
            if (isEmptyNode(node.childNodes[i]) === true) {
                node.removeChild(node.childNodes[i]);
                instance.reRun = true;
            }
        }
    }

    function execute(node, instance) {
        var walker = treeWalker(instance, node), currentNode, prevNode,
            selctionSelector = instance.editorConfig.getSectionSelector();

        walker.firstChild();
        currentNode = walker.currentNode;
        while (currentNode !== null && currentNode.nodeName !== selctionSelector) {
            currentNode.normalize();
            replaceZeroWidthSpaceCharacter(currentNode, instance);
            processSingleSpanWithTextNode(currentNode, instance);
            groupSameNodeSiblings(currentNode, instance);
            if (isEmptyNode(currentNode) === true) {
                currentNode.parentNode.removeChild(currentNode);
                currentNode = walker.nextNode();
                instance.reRun = true;
            }
            else if (hasLeaf(currentNode, instance) === true) {
                prevNode = currentNode;
                currentNode = getNextElementNode(walker, instance);
                if (currentNode !== null && currentNode.parentNode === prevNode) {
                    groupChildNodes(prevNode, currentNode, instance);
                    processSingleSpanWithTextNode(currentNode, instance);
                    removeEmptyNodes(currentNode, instance);
                }
            }
            else {
                currentNode = walker.nextNode();
            }
        }
    }

    Normalizer.prototype.normalize = function normalize(node) {
        var self = this;

        if (node === null) {
            return;
        }

        if (prevNode === node) {
            clearTimeout(timer);
        }
        timer = setTimeout(function timerFn() {
            do {
                self.reRun = false;
                node.normalize();
                execute(node, self);
            } while (self.reRun === true);

            self.reOrder.orderNodes(node);
        }, delay);
        prevNode = node;
    };

    return Normalizer;
});

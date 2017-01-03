define([], function formattingConfigLoader() {
    'use strict';

    var singleton = {},
        instance = null;

    function InstructFormattingConfig(win) {
        var obj = this;

        this.win = win;
        this.doc = win.document;

        Object.defineProperty(obj, 'boldWrapper', {
            'value': 'b',
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'italicWrapper', {
            'value': 'i',
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'supWrapper', {
            'value': 'sup',
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'subWrapper', {
            'value': 'sub',
            'writable': false,
            'configurable': false
        });
    }

    function isNodeNameEquals(node, wrapper) {
        return node.nodeName.toLowerCase() === wrapper.tag;
    }

    function getFormattingAttrKey(attr) {
        var attrKey = Object.keys(attr)[0],
            splitArray = attrKey.split('-');

        /* istanbul ignore else */
        if (splitArray[0] === 'data') {
            splitArray.shift();
        }

        return splitArray.join('');
    }

    function nodeHasFormattingAttr(node, wrapper) {
        var attr = wrapper.attr,
            key = getFormattingAttrKey(attr),
            dataset = node.dataset, dataAttr;

        for (dataAttr in dataset) {
            /* istanbul ignore else */
            if (dataset.hasOwnProperty(dataAttr) === true) {
                if (dataAttr.toLowerCase() === key) {
                    return true;
                }
            }
        }

        return false;
    }

    function isFormattingNode(node, wrapper) {
        if (node === null) {
            return false;
        }

        if (isNodeNameEquals(node, wrapper) === true &&
            nodeHasFormattingAttr(node, wrapper) === true
        ) {
            return true;
        }

        return false;
    }

    function generateNodeFromWrapper(wrapper, doc) {
        var wrapperElement = doc.createElement(wrapper.tag),
            attr, attrs = wrapper.attr;

        for (attr in attrs) {
            /* istanbul ignore else */
            if (attrs.hasOwnProperty(attr) === true) {
                wrapperElement.setAttribute(attr, attrs[attr]);
            }
        }
        wrapperElement.appendChild(doc.createTextNode(String.fromCharCode(8203)));

        return wrapperElement;
    }

    function formatNode(cloneContent, wrapper, win, doc) {
        var wrapperElement = generateNodeFromWrapper(wrapper, doc),
            childNodes = cloneContent.childNodes,
            childNode, i = 0;

        for (i; i < childNodes.length; i += 1) {
            childNode = childNodes[i];

            if (childNode.nodeType === win.Node.TEXT_NODE ||
                childNode.nodeType === win.Node.ELEMENT_NODE
            ) {
                wrapperElement.appendChild(childNode.cloneNode(true));
            }
        }

        return wrapperElement;
    }

    function removeFormattingWrapper(node, doc) {
        var currentNode = node.firstChild,
            fragment = doc.createDocumentFragment();

        if (currentNode === null) {
            fragment = null;
        }
        else {
            while (currentNode !== null) {
                fragment.appendChild(currentNode.cloneNode(true));
                currentNode = currentNode.nextSibling;
            }
        }

        return fragment;
    }

    function nonFormattedNodeList(fragment, instance) {
        var walker = instance.doc.createTreeWalker(
                fragment, instance.win.NodeFilter.SHOW_ALL, null, false
            ),
            currentNode = walker.nextNode(),
            nodeList = [], tempNode;

        while (currentNode !== null) {
            if (currentNode.nodeType === instance.win.Node.TEXT_NODE &&
               currentNode.textContent.length > 0
            ) {
                nodeList.push(currentNode);
            }
            else if (currentNode.nodeType === instance.win.Node.ELEMENT_NODE) {
                if (instance.hasAnyFormatting(currentNode) !== true) {
                    nodeList.push(currentNode.cloneNode(false));
                }
            }
            currentNode = walker.nextNode();
        }

        return nodeList;
    }

    function clearAllFormatting(fragment, instance) {
        var tempFragment = instance.doc.createDocumentFragment(),
            nodeList = nonFormattedNodeList(fragment, instance),
            i = nodeList.length - 1;

        for(; i >= 0; i--) {
            if (nodeList[i].nodeType === instance.win.Node.TEXT_NODE) {
                continue;
            }
            else {
                nodeList[i].appendChild(nodeList[i + 1]);
            }
        }

        return tempFragment.appendChild(nodeList[0]);
    }

    InstructFormattingConfig.prototype.isBold = function isBold(node) {
        return isFormattingNode(node, this.boldWrapper);
    };

    InstructFormattingConfig.prototype.isItalic = function isItalic(node) {
        return isFormattingNode(node, this.italicWrapper);
    };

    InstructFormattingConfig.prototype.isSup = function isSup(node) {
        return isFormattingNode(node, this.supWrapper);
    };

    InstructFormattingConfig.prototype.isSub = function isSub(node) {
        return isFormattingNode(node, this.subWrapper);
    };

    InstructFormattingConfig.prototype.getBoldWrapper = function getBoldWrapper() {
        return generateNodeFromWrapper(this.boldWrapper, this.doc);
    };

    InstructFormattingConfig.prototype.getItalicWrapper = function getItalicWrapper() {
        return generateNodeFromWrapper(this.italicWrapper, this.doc);
    };

    InstructFormattingConfig.prototype.getSuperScriptWrapper = function getSuperScriptWrapper() {
        return generateNodeFromWrapper(this.supWrapper, this.doc);
    };

    InstructFormattingConfig.prototype.getSubScriptWrapper = function getSubScriptWrapper() {
        return generateNodeFromWrapper(this.subWrapper, this.doc);
    };

    InstructFormattingConfig.prototype.wrapBold = function wrapBold(node) {
        return formatNode(node, this.boldWrapper, this.win, this.doc);
    };

    InstructFormattingConfig.prototype.wrapItalic = function wrapItalic(node) {
        return formatNode(node, this.italicWrapper, this.win, this.doc);
    };

    InstructFormattingConfig.prototype.wrapSubScript = function wrapSubScript(node) {
        return formatNode(node, this.subWrapper, this.win, this.doc);
    };

    InstructFormattingConfig.prototype.wrapSuperScript = function wrapSuperScript(node) {
        return formatNode(node, this.supWrapper, this.win, this.doc);
    };

    InstructFormattingConfig.prototype.unFormatWrapper = function unFormatWrapper(fragment) {
        return removeFormattingWrapper(fragment, this.doc);
    };

    InstructFormattingConfig.prototype.removeAllFormatting = function removeAllFormatting(fragment) {
        return clearAllFormatting(fragment, this);
    };

    InstructFormattingConfig.prototype.hasAnyFormatting = function hasAnyFormatting(node) {
        if (this.isBold(node) === true || this.isItalic(node) === true ||
            this.isSub(node) === true || this.isSup(node) === true
        ) {
            return true;
        }

        return false;
    };

    InstructFormattingConfig.prototype.getFormattingAttrName = function getFormattingAttrName(node) {
        if (nodeHasFormattingAttr(node, this.boldWrapper) === true) {
            return getFormattingAttrKey(this.boldWrapper.attr);
        }
        if (nodeHasFormattingAttr(node, this.italicWrapper) === true) {
            return getFormattingAttrKey(this.italicWrapper.attr);
        }
        if (nodeHasFormattingAttr(node, this.supWrapper) === true) {
            return getFormattingAttrKey(this.supWrapper.attr);
        }
        if (nodeHasFormattingAttr(node, this.subWrapper) === true) {
            return getFormattingAttrKey(this.subWrapper.attr);
        }

        return null;
    };

    singleton.get = function get(win) {
        if (instance === null) {
            instance = new InstructFormattingConfig(win);
        }

        return instance;
    };

    return singleton;
});

define(['scripts/editor/EditorConfigReader'], function formattingConfigLoader(EditorConfigReader) {
    'use strict';

    var singleton = {},
        formatConfig = null;

    function deepFreeze(obj) {
        var propNames = Object.getOwnPropertyNames(obj),
            prop;

        // Freeze properties before freezing self
        propNames.forEach(function eachProp(name) {
            prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop === 'object' && prop !== null) {
                deepFreeze(prop);
            }
        });

        // Freeze self (no-op if already frozen)
        return Object.freeze(obj);
    }

    function FormattingConfig(win) {
        var obj = this;

        this.win = win;
        this.doc = win.document;
        this.editorConfig = EditorConfigReader.get();

        Object.defineProperty(obj, 'boldWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-bold': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'italicWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-italic': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'supWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-sup': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'subWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-sub': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'delWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-delete': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'insertWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-insert': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'instructWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-instruct': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'cpeInsertWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-cpeins': 'true'
                }
            }),
            'writable': false,
            'configurable': false
        });
        Object.defineProperty(obj, 'cpeDeleteWrapper', {
            'value': deepFreeze({
                'tag': 'span',
                'attr': {
                    'data-format-cpedel': 'true'
                }
            }),
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

    function applyWrapperAttributes(element, config) {
        var attrs = config.getWrapperAttributes(),
            attr;

        for (attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                element.dataset[attr] = attrs[attr];
            }
        }
    }

    function generateNodeFromWrapper(wrapper, instance) {
        var doc = instance.doc,
            wrapperElement = doc.createElement(wrapper.tag),
            attr, attrs = wrapper.attr;

        for (attr in attrs) {
            /* istanbul ignore else */
            if (attrs.hasOwnProperty(attr) === true) {
                wrapperElement.setAttribute(attr, attrs[attr]);
            }
        }

        applyWrapperAttributes(wrapperElement, instance.editorConfig);
        wrapperElement.appendChild(doc.createTextNode(String.fromCharCode(8203)));

        return wrapperElement;
    }

    function formatNode(cloneContent, wrapper, instance) {
        var wrapperElement = generateNodeFromWrapper(wrapper, instance),
            childNodes = cloneContent.childNodes,
            childNode, i = 0;

        for (i; i < childNodes.length; i += 1) {
            childNode = childNodes[i];

            if (childNode.nodeType === instance.win.Node.TEXT_NODE ||
                childNode.nodeType === instance.win.Node.ELEMENT_NODE
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
            nodeList = [];

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

        for (; i >= 0; i -= 1) {
            if (nodeList[i].nodeType === instance.win.Node.TEXT_NODE) {
                continue;
            }
            else {
                nodeList[i].appendChild(nodeList[i + 1]);
            }
        }

        return tempFragment.appendChild(nodeList[0]);
    }

    FormattingConfig.prototype.isBold = function isBold(node) {
        return isFormattingNode(node, this.boldWrapper);
    };

    FormattingConfig.prototype.isItalic = function isItalic(node) {
        return isFormattingNode(node, this.italicWrapper);
    };

    FormattingConfig.prototype.isSup = function isSup(node) {
        return isFormattingNode(node, this.supWrapper);
    };

    FormattingConfig.prototype.isSub = function isSub(node) {
        return isFormattingNode(node, this.subWrapper);
    };

    FormattingConfig.prototype.isDelete = function isDelete(node) {
        return isFormattingNode(node, this.delWrapper);
    };

    FormattingConfig.prototype.isInsert = function isInsert(node) {
        return isFormattingNode(node, this.insertWrapper);
    };

    FormattingConfig.prototype.isInstruct = function isInstruct(node) {
        return isFormattingNode(node, this.instructWrapper);
    };

    FormattingConfig.prototype.getBoldWrapper = function getBoldWrapper() {
        return generateNodeFromWrapper(this.boldWrapper, this);
    };

    FormattingConfig.prototype.getItalicWrapper = function getItalicWrapper() {
        return generateNodeFromWrapper(this.italicWrapper, this);
    };

    FormattingConfig.prototype.getSuperScriptWrapper = function getSuperScriptWrapper() {
        return generateNodeFromWrapper(this.supWrapper, this);
    };

    FormattingConfig.prototype.getSubScriptWrapper = function getSubScriptWrapper() {
        return generateNodeFromWrapper(this.subWrapper, this);
    };

    FormattingConfig.prototype.getDeleteWrapper = function getDeleteWrapper() {
        return generateNodeFromWrapper(this.delWrapper, this);
    };

    FormattingConfig.prototype.getInsertWrapper = function getInsertWrapper() {
        return generateNodeFromWrapper(this.insertWrapper, this);
    };

    FormattingConfig.prototype.getInstructWrapper = function getInstructWrapper() {
        return generateNodeFromWrapper(this.instructWrapper, this);
    };

    FormattingConfig.prototype.wrapBold = function wrapBold(node) {
        return formatNode(node, this.boldWrapper, this);
    };

    FormattingConfig.prototype.wrapItalic = function wrapItalic(node) {
        return formatNode(node, this.italicWrapper, this);
    };

    FormattingConfig.prototype.wrapSubScript = function wrapSubScript(node) {
        return formatNode(node, this.subWrapper, this);
    };

    FormattingConfig.prototype.wrapSuperScript = function wrapSuperScript(node) {
        return formatNode(node, this.supWrapper, this);
    };

    FormattingConfig.prototype.wrapDelete = function wrapDelete(node) {
        return formatNode(node, this.delWrapper, this);
    };

    FormattingConfig.prototype.wrapInsert = function wrapInsert(node) {
        return formatNode(node, this.insertWrapper, this);
    };

    FormattingConfig.prototype.wrapInstruct = function wrapInstruct(node) {
        return formatNode(node, this.instructWrapper, this);
    };

    FormattingConfig.prototype.unFormatWrapper = function unFormatWrapper(fragment) {
        return removeFormattingWrapper(fragment, this.doc);
    };

    FormattingConfig.prototype.removeAllFormatting = function removeAllFormatting(fragment) {
        return clearAllFormatting(fragment, this);
    };

    FormattingConfig.prototype.hasAnyFormatting = function hasAnyFormatting(node) {
        if (this.isBold(node) === true || this.isItalic(node) === true ||
            this.isSub(node) === true || this.isSup(node) === true ||
            this.isDelete(node) === true || this.isInsert(node) === true ||
            this.isInstruct(node) === true
        ) {
            return true;
        }

        return false;
    };

    FormattingConfig.prototype.getFormattingAttrName = function getFormattingAttrName(node) {
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
        if (nodeHasFormattingAttr(node, this.delWrapper) === true) {
            return getFormattingAttrKey(this.delWrapper.attr);
        }
        if (nodeHasFormattingAttr(node, this.insertWrapper) === true) {
            return getFormattingAttrKey(this.insertWrapper.attr);
        }
        if (nodeHasFormattingAttr(node, this.instructWrapper) === true) {
            return getFormattingAttrKey(this.instructWrapper.attr);
        }

        return null;
    };

    singleton.get = function get(win) {
        if (formatConfig === null) {
            formatConfig = new FormattingConfig(win);
        }

        return formatConfig;
    };

    return singleton;
});

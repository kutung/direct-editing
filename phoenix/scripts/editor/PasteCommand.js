define(['scripts/editor/FormattingConfig', 'scripts/editor/InsertCommand',
       'scripts/editor/Selection', 'scripts/editor/Util'],
function PasteCommandLoader(FormattingConfig, InsertCommand, Selection, Util) {
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
        Object.defineProperty(obj, 'html', {
            'value': '',
            'writable': true
        });
        Object.defineProperty(obj, 'text', {
            'value': '',
            'writable': true
        });
        Object.defineProperty(obj, 'formatConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'commentsMapper', {
            'value': null,
            'writable': true
        });
    }

    function PasteCommand(html, text, win, doc, commentsMapper) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.html = html;
        this.text = text;
        this.commentsMapper = commentsMapper;
        this.formatConfig = FormattingConfig.get(win);
        this.selectionContext = Selection.get(this.win);
    }

    function replaceTags(instance, div, tag) {
        var parent, config = {
                'b': instance.formatConfig.getBoldWrapper,
                'i': instance.formatConfig.getItalicWrapper,
                'sup': instance.formatConfig.getSuperScriptWrapper,
                'sub': instance.formatConfig.getSubScriptWrapper
            },
            elems = div.getElementsByTagName(tag),
            i = elems.length - 1, node = null, wrapper = null;

        for (; i >= 0; i -= 1) {
            node = elems.item(i);
            parent = node.parentNode;
            wrapper = config[tag].call(instance.formatConfig);
            wrapper.innerHTML = '';
            while (node.firstChild !== null) {
                wrapper.appendChild(node.firstChild);
            }
            parent.replaceChild(wrapper, node);
        }
    }

    function replaceUnwantedTags(instance, node) {
        var whiteListedTags = ['span', 'a', 'ul', 'li', 'ol'],
            whiteListedAttrs = [
                'data-format-bold', 'data-format-italic', 'data-format-sub', 'data-format-sup'
            ],
            tags = node.querySelectorAll('*'), i = tags.length - 1,
            parent, wrapper, tagName = null,
            tagsToRemove = [], attrs = null, j = 0;

        for (; i >= 0; i -= 1) {
            node = tags.item(i);
            tagName = node.nodeName.toLowerCase();
            parent = node.parentNode;

            if (tagName === 'meta' || tagName === 'style' || tagName === 'script') {
                tagsToRemove.push(node);
                continue;
            }
            if (whiteListedTags.indexOf(tagName) === -1) {
                wrapper = instance.doc.createElement('span');
                while (node.firstChild !== null) {
                    wrapper.appendChild(node.firstChild);
                }
                if (wrapper.childNodes.length === 0) {
                    tagsToRemove.push(node);
                    continue;
                }
                parent.replaceChild(wrapper, node);
            }
            else {
                attrs = node.attributes;
                j = attrs.length - 1;

                for (; j >= 0; j -= 1) {
                    if (whiteListedAttrs.indexOf(attrs[j].name.toLowerCase()) === -1) {
                        node.removeAttribute(attrs[j].name);
                    }
                }
            }
        }

        tagsToRemove.forEach(function eachNode(tag) {
            tag.parentNode.removeChild(tag);
        });
    }

    function normalizeSpaces(value) {
        var space = String.fromCharCode(32);

        // Refer [ https://www.w3.org/TR/CSS21/text.html#white-space-model ]
        value = value.replace(/([\r\n])\t/g, '$1');
        value = value.replace(/\t([\r\n])/g, '$1');
        value = value.replace(/[\r\n]/g, space);
        value = value.replace(/\t/g, space);

        // Space following a Tab
        value = value.replace(/\xa0\x20/g, space);

        // More than one continuous Space
        value = value.replace(/[\x20]+/g, space);

        return value;
    }

    function lightenMarkup(instance, node) {
        var walker = instance.doc.createTreeWalker(node, instance.win.NodeFilter.SHOW_ALL);

        while (walker.nextNode() !== null) {
            /* istanbul ignore else */
            if (walker.currentNode.nodeType === instance.win.Node.TEXT_NODE) {
                walker.currentNode.nodeValue = normalizeSpaces(walker.currentNode.nodeValue);
            }
        }

        return node;
    }

    PasteCommand.prototype.execute = function execute() {
        var element = this.doc.createElement('span'),
            insertCommand = new InsertCommand(this.win, this.doc, this.commentsMapper);

        if (this.selectionContext.hasFormattingParentOf('delete') === true) {
            return;
        }

        element.innerHTML = this.html;
        replaceTags(this, element, 'b');
        replaceTags(this, element, 'i');
        replaceTags(this, element, 'sup');
        replaceTags(this, element, 'sub');
        replaceUnwantedTags(this, element);
        element.normalize();
        lightenMarkup(this, element);
        insertCommand.pasteHtml(element);
    };

    PasteCommand.prototype.destroy = function destroy() {
        initVariables(this);
    };

    return PasteCommand;
});

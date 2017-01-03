// FIXME: Replace this whole stuff with XMLSerializer [https://developer.mozilla.org/en-US/docs/XMLSerializer]

define(['he'], function dom2XmlLoader(he) {
    var voidElements = [
            'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
            'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr',
            // MathMl
            'mspace'
        ],
        ret = {};

    function dom2Json(node) {
        var obj = {'attributes': {}, 'children': []}, j = 0, attribute, i = 0, item,
            nodeName, children, len;

        if (node.nodeType === Node.ELEMENT_NODE) {
            obj.type = 'element';
            obj.name = node.nodeName.toLowerCase();
            if (node.attributes.length > 0) {
                obj.attributes = {};
                for (; j < node.attributes.length; j += 1) {
                    attribute = node.attributes[j];
                    obj.attributes[attribute.name.toLowerCase()] = attribute.value;
                }
            }
        }
        else if (node.nodeType === Node.TEXT_NODE) {
            obj.type = 'text';
            obj.value = node.nodeValue;
        }

        if (node.hasChildNodes() === true) {
            children = node.childNodes;
            len = children.length;
            for (; i < len; i += 1) {
                item = children.item(i);
                nodeName = item.nodeName;
                obj.children.push(dom2Json(item));
            }
        }

        return obj;
    }

    function attrs(obj) {
        var attr, attributes = [];

        for (attr in obj) {
            if (obj.hasOwnProperty(attr) === true) {
                attributes.push(attr + '="' + he.encode(obj[attr], {'useNamedReferences': false}) + '"');
            }
        }

        if (attributes.length > 0) {
            return ' ' + attributes.join(' ');
        }

        return '';
    }

    function dom2Xml(elem) {
        var xml = [], i = 0, len = elem.children.length, isVoidElem, val;

        if (elem.type === 'element') {
            isVoidElem = voidElements.indexOf(elem.name) !== -1;
            xml.push('<' + elem.name + attrs(elem.attributes));
            if (isVoidElem === true) {
                if (len > 0) {
                    throw new Error('selfclosing.tags.cannot.have.children');
                }
                xml.push('/>');
            }
            else {
                xml.push('>');
                for (; i < len; i += 1) {
                    xml = xml.concat(dom2Xml(elem.children[i]));
                }
            }
            if (isVoidElem === false) {
                xml.push('</' + elem.name + '>');
            }
        }
        else if (elem.type === 'text') {
            val = elem.value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
            val = val.replace(/>/g, '&gt;');
            xml.push(val);
        }

        return xml;
    }

    ret.toJson = dom2Json;
    ret.toXml = function toXml(node) {
        var json = dom2Json(node);

        return dom2Xml(json).join('');
    };

    return ret;
});

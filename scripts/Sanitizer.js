define(['sax', 'he'], function(sax, he) {
    var whitelistedAttrs = [
        'class', 'mathvariant', 'version', 'data-name', 'name', 'id', 'title', 'type',
        //Common to MathMl and HTML
        'href', 'src', 'width', 'height', 'editable', 'ref', 'rel',
        // Table Attributes
        'border', 'rowspan', 'colspan', 'char',
        // MathMl Attributes
        'accent', 'accentunder', 'actiontype', 'align', 'alignmentscope',
        'altimg', 'altimg-width', 'altimg-height', 'altimg-valign',
        'alttext', 'bevelled', 'charalign', 'close', 'columnalign',
        'columnlines', 'columnspacing', 'columnspan', 'columnwidth',
        'crossout', 'decimalpoint', 'denomalign', 'depth', 'dir', 'display',
        'displaystyle', 'edge', 'equalcolumns', 'equalrows', 'fence', 'form',
        'frame', 'framespacing', 'groupalign', 'indentalign', 'indentalignfirst',
        'indentalignlast', 'indentshift', 'indentshiftfirst', 'indentshiftlast',
        'indenttarget', 'infixlinebreakstyle', 'largeop', 'length',
        'linebreak', 'linebreakmultchar', 'linebreakstyle', 'lineleading',
        'linethickness', 'location', 'longdivstyle', 'lspace', 'lquote',
        'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize',
        'minlabelspacing', 'minsize', 'movablelimits', 'notation',
        'numalign', 'open', 'overflow', 'position', 'rowalign', 'rowlines',
        'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel',
        'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator',
        'separators', 'shift', 'side', 'stackalign', 'stretchy',
        'subscriptshift', 'supscriptshift', 'symmetric', 'voffset',
        'xlink:href', 'namespace', 'refid', 'data-id', 'data-latex', 'data-empty',
        'data-heading-level'
    ],
    whitelistedTags = [
        'span', 'div', 'img', 'b', 'i', 'sub', 'sup', 'a',
        // Table tags
        'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'caption',
        'colgroup', 'col',
        // MathMl tags
        'math', 'mi', 'mphantom', 'msub', 'msup', 'msubsup', 'maction',
        'maligngroup', 'malignmark', 'mlabeledtr', 'mlongdiv', 'mroot',
        'mrow', 'mtable', 'mtd', 'mtext', 'mtr', 'menclose', 'merror',
        'mmultiscripts', 'ms', 'mscarries', 'mscarry', 'msgroup', 'msline',
        'mstack', 'mspace', 'msqrt', 'msrow', 'mstyle', 'munder',
        'munderover', 'mfenced', 'mfrac', 'mn', 'mglyph', 'mo', 'mover',
        'mpadded', 'semantics', 'annotation', 'annotation-xml'
    ],
    voidElements = [
        'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
        'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr',
        // MathMl
        'mspace'
    ],
    blackListedClasses = ['tooltip-bottom', 'scrollEffect'],
    retObj = {};

    function sanitize(data, mustSanitize, encodeHtml, win, extraAllowedTags) {
        var error = false, encodedStr = [],
            parser = win.sax.parser(false), stringifyAttrs,
            allowedTags = whitelistedTags, encodeData;

        if (extraAllowedTags) {
            allowedTags = allowedTags.concat(extraAllowedTags);
        }

        encodeHtml = !!encodeHtml;

        filterClasses = function (classStr) {
            var classes = classStr.split(' '), filteredClasses = [];

            classes.forEach(function (cls) {
                if (blackListedClasses.indexOf(cls) === -1) {
                    filteredClasses.push(cls);
                }
            });

            return filteredClasses.join(' ');
        };

        encodeData = function (text) {
            if (encodeHtml === true) {
                return he.encode(text, {useNamedReferences: false});
            }
            else {
                text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
                text = text.replace(/>/g, '&gt;');
                text = text.replace(/\u00A0/g, '&nbsp;');

                return text;
            }
        };

        stringifyAttrs = function (attrs) {
            var attr, lattr, val;

            for (attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    lattr = attr.toLowerCase();
                    val = attrs[attr];
                    if (lattr === 'class' && whitelistedAttrs.indexOf(lattr) !== -1) {
                        val = filterClasses(val);
                    }
                    if (mustSanitize === true) {
                        if (whitelistedAttrs.indexOf(lattr) !== -1) {
                            encodedStr.push(
                                ' ' + attr.toLowerCase() + '="' + encodeData(val) + '"'
                            );
                        }
                    }
                    else {
                        encodedStr.push(
                            ' ' + attr.toLowerCase() + '="' + encodeData(val) + '"'
                        );
                    }
                }
            }
        };
        parser.onopentag = function (node) {
            var tagName = node.name.toLowerCase(),
                attrs = node.attributes,
                isSelfClosing = node.isSelfClosing;

            if (mustSanitize === true) {
                if (allowedTags.indexOf(tagName) !== -1) {
                    encodedStr.push('<' + tagName);
                    stringifyAttrs(attrs);
                    if (isSelfClosing === true ||
                        voidElements.indexOf(tagName) !== -1
                    ) {
                        encodedStr.push('/>');
                    }
                    else {
                        encodedStr.push('>');
                    }
                }
            }
            else {
                encodedStr.push('<' + tagName);
                stringifyAttrs(attrs);
                if (isSelfClosing === true ||
                    voidElements.indexOf(tagName) !== -1
                ) {
                    encodedStr.push('/>');
                }
                else {
                    encodedStr.push('>');
                }
            }
        };
        parser.onclosetag = function (node) {
            var tagName = node.toLowerCase();

            if (voidElements.indexOf(tagName) !== -1) {
                return;
            }

            if (mustSanitize === true) {
                if (whitelistedTags.indexOf(tagName) !== -1) {
                    encodedStr.push('</' + tagName + '>');
                }
            }
            else {
                encodedStr.push('</' + tagName + '>');
            }
        };
        parser.ontext = function (t) {
            encodedStr.push(encodeData(t));
        };
        parser.onerror = function () {
            error = true;
        };

        parser.write(data).close();
        if (error) {
            return data;
        }

        return encodedStr.join('');
    }

    retObj.sanitize = sanitize;

    return retObj;
});

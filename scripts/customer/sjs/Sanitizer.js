define([], function SanitizerLoader() {
    return {
        'whitelistedAttrs': [
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
        'data-heading-level', 'data-history', 'data-state', 'data-ref-id',
        'data-actor', 'data-del', 'data-ins', 'data-by', 'data-timestamp',
        'data-refid', 'data-stage', 'data-show', 'data-rid',
        'data-format-bold', 'data-format-italic', 'data-format-sup', 'data-format-sub',
        'data-format-delete', 'data-format-insert', 'data-format-instruct'
    ],
    'whitelistedTags': [
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
    'voidElements': [
        'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
        'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr',
        // MathMl
        'mspace'
    ],
    'blackListedClasses': ['tooltip-bottom', 'scrollEffect']
    };
});

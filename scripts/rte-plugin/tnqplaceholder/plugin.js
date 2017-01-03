(function loadPlaceholderPlugin() {
    'use strict';

    // If the data is "empty" (BR, P) or the placeholder then return an empty string.
    // Otherwise return the original data
    function dataIsEmpty(data) {
        var value;

        if (!data) {
            return true;
        }

        if (data.length > 20) {
            return false;
        }

        value = data.replace(/[\n|\t]*/g, '').toLowerCase();
        if (!value || value === '<br>' || value === '<p>&nbsp;<br></p>' ||
            value === '<p><br></p>' || value === '<p>&nbsp;</p>' ||
            value === ' ' ||  value === ' <br>'
        ) {
            return true;
        }

        return false;
    }

    CKEDITOR.plugins.add('tnqplaceholder', {
        'onLoad': function onLoad() {},
        'init': function onInit(editor) {
            var placeholderText = editor.element.getAttribute('placeholder') ||
                    editor.config.placeholder, editorElem, iframe, doc, placeholderElem = null,
                iframeDoc = null;

            function addPlaceholder() {
                editorElem = editor.element.$.querySelector('.cke_contents');
                iframe = editor.element.$.querySelector('.cke_wysiwyg_frame');
                iframeDoc = iframe.document || iframe.contentDocument || iframe.contentWindow.document;
                doc = editorElem.ownerDocument;
                if (placeholderElem === null) {
                    placeholderElem = doc.createElement('div');
                }
                editorElem.style.backgroundColor = 'transparent';
                iframe.style.backgroundColor = 'transparent';
                editor.document.$.body.style.backgroundColor = 'transparent';

                editorElem.style.zIndex = 100;
                editorElem.parentNode.style.position = 'relative';
                editorElem.style.position = 'relative';
                placeholderElem.setAttribute('class', 'placeholder');
                placeholderElem.innerHTML = placeholderText;
                placeholderElem.style.boxSizing = 'border-box';
                placeholderElem.style.position = 'absolute';
                placeholderElem.style.padding = '10px';
                placeholderElem.style.lineHeight = '1.6em';
                placeholderElem.style.color = '#999';
                placeholderElem.style.top = editorElem.style.top;
                placeholderElem.style.left = editorElem.style.left;
                placeholderElem.style.width = '100%';
                placeholderElem.style.height = editorElem.style.height;
                placeholderElem.style.zIndex = 2;
                editorElem.parentNode.insertBefore(placeholderElem, editorElem);
            }

            function togglePlaceHolder() {
                var data;

                if (iframeDoc !== null) {
                    data = iframeDoc.body.innerHTML;

                    if (dataIsEmpty(data) === false && placeholderElem) {
                        placeholderElem.style.display = 'none';
                    }
                    if (dataIsEmpty(data) === true && placeholderElem) {
                        placeholderElem.style.display = 'block';
                    }
                }
            }

            function toggleAfterTimeout() {
                setTimeout(togglePlaceHolder, 100);
            }

            if (placeholderText) {
                editor.on('afterPaste', toggleAfterTimeout);
                editor.on('key', toggleAfterTimeout);
                editor.on('afterSetData', toggleAfterTimeout);
                editor.on('blur', toggleAfterTimeout);
                editor.on('contentDom', addPlaceholder);
                editor.on('focus', toggleAfterTimeout);
                editor.on('afterInsertHtml', toggleAfterTimeout);
            }
        }
    });
})();

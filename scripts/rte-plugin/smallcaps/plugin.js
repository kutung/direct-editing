/* globals CKEDITOR */
( function() {
    'use strict';

    CKEDITOR.plugins.add('smallcaps', {
        'icons': 'smallcaps',
        'hidpi': true,
        'init': function init(editor) {
            var pluginName = 'smallcaps',
                label = 'Smallcaps',
                smallcapsStyle = new CKEDITOR.style(
                    {'element': 'span', 'attributes': {'class': 'smallcaps'}}
                );

            editor.attachStyleStateChange(
                smallcapsStyle, function attachStyleStateChange(state) {
                    editor.readOnly === false &&
                    editor.getCommand(pluginName).setState(state);
                });

            editor.addCommand(pluginName, {
                'exec': function exec() {
                    var elementPath = editor.elementPath();

                    editor[smallcapsStyle.checkActive(elementPath, editor) ? 'removeStyle' : 'applyStyle'](smallcapsStyle);
                }
            });

            editor.ui.addButton(pluginName, {
                'label': label,
                'command': pluginName,
                'toolbar': 'basicstyles'
            });

            editor.setKeystroke([
                [CKEDITOR.CTRL + CKEDITOR.SHIFT + 75, pluginName]
            ]);
        }
    });
})();

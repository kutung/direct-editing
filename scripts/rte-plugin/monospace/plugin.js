/* globals CKEDITOR */
( function() {
    'use strict';

    CKEDITOR.plugins.add('monospace', {
        'icons': 'monospace',
        'hidpi': true,
        'init': function init(editor) {
            var pluginName = 'monospace',
                label = 'Monospace',
                monospaceStyle = new CKEDITOR.style(
                    {'element': 'span', 'attributes': {'class': 'mono'}}
                );

            editor.attachStyleStateChange(
                monospaceStyle, function attachStyleStateChange(state) {
                    editor.readOnly === false &&
                    editor.getCommand(pluginName).setState(state);
                });

            editor.addCommand(pluginName, {
                'exec': function exec() {
                    var elementPath = editor.elementPath();

                    editor[monospaceStyle.checkActive(elementPath, editor) ? 'removeStyle' : 'applyStyle'](monospaceStyle);
                }
            });

            editor.ui.addButton(pluginName, {
                'label': label,
                'command': pluginName,
                'toolbar': 'basicstyles'
            });
        }
    });
})();

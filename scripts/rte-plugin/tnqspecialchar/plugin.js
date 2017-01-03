CKEDITOR.plugins.add('tnqspecialchar', {
    icons: 'tnqspecialchar',
    requires: 'dialog',
    hidpi: true,
    init: function(editor) {
        var pluginName = 'tnqspecialchar',
            plugin = this;

        // Register the dialog.
        CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/tnqspecialchar.js');

        editor.addCommand(pluginName, {
            exec: function() {
                CKEDITOR.plugins.setLang( 'specialchar', 'en', {
                    options: 'Special Character Options',
                    title: 'Select Special Character',
                    toolbar: 'Insert Special Character'
                });
                editor.openDialog(pluginName);
            },
            modes: { wysiwyg: 1 },
            canUndo: false
        });

        // Register the toolbar button.
        editor.ui.addButton && editor.ui.addButton('tnqspecialchar', {
            label: editor.lang.specialchar.toolbar,
            command: pluginName,
            toolbar: 'basicstyles'
        });
    }
});

(function () {
    var splChars = [
        "913", "914", "915", "916", "917", "918", "919", "920", "921",
        "922", "923", "924", "925", "926", "927", "928", "929", "931",
        "932", "933", "934", "935", "936", "937", "945", "946", "947",
        "948", "949", "950", "951", "952", "953", "954", "955", "956",
        "957", "958", "959", "960", "961", "963", "964", "965", "966",
        "967", "968", "969", "977", "981", "982", "8707", "8717", "8727",
        "8722", "8773", "8756", "8869", "8764", "8804", "8734", "8805",
        "8733", "8706", "8729", "8800", "8801", "8776", "8855", "8853",
        "8709", "8745", "8746", "8835", "8839", "8836", "8834", "8838",
        "8712", "8713", "8736", "8711", "8719", "8730", "8901", "8743",
        "8744", "8721", "8747", "978", "8242", "8260", "8243", "176",
        "8230", "8592", "8593", "8594", "8595", "8629", "8660", "8656",
        "8657", "8658", "8659", "8465", "8476", "8472", "8482", "12297",
        "8992", "8993", "190", "231", "233", "235", "237", "239", "246",
        "248", "250", "252", "254", "177", "215", "247", "174", "169",
        "172"
    ];
    CKEDITOR.config.specialChars = splChars.map(function(i) {
        return String.fromCharCode(i);
    });
})();

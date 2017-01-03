define(['scripts/Sanitizer'], function EquationEditorLoader(Sanitizer) {
    var toolbar = [
            '<toolbar ref="general">',
                '<tab ref="general">',
                    '<removeItem ref="setFontFamily"/>',
                    '<removeItem ref="setFontSize"/>',
                    '<removeItem ref="setColor"/>',
                '</tab>',
            '</toolbar>'
        ],
        config = {
            'language': 'en',
            'toolbar': toolbar.join('')
        };

    function equationEditor(wiris) {
        this.wiris = wiris;
    }

    equationEditor.prototype.render = function render(container) {
        var wR = this.wiris;

        this.editor = wR.jsEditor.JsEditor.newInstance(config);
        this.editor.insertInto(container);
    };

    equationEditor.prototype.setMath = function setMath(mathml) {
        mathml = Sanitizer.sanitize(mathml, true, true, window);
        this.editor.setMathML(mathml);
    };

    equationEditor.prototype.setMathWithCallBack = function setMathWithCallBack(mathml, callback) {
        mathml = Sanitizer.sanitize(mathml, true, true, window);
        this.editor.setMathMLWithCallback(mathml, callback);
    };

    equationEditor.prototype.getMath = function getMath() {
        return this.editor.getMathML();
    };

    equationEditor.prototype.isEmptyMath = function isEmptyMath() {
        if (this.editor.getEditorModel().getCaret() === 0) {
            return true;
        }
        return false;
    };

    equationEditor.prototype.getLatexConversionRequestURL = function getLatexConversionRequestURL() {
        var basePath, baseurl;

        basePath = this.wiris.jsEditor.defaultBasePath;
        baseurl = basePath.replace('resources', 'mathml2latex');

        return baseurl;
    };

    equationEditor.prototype.getMathConversionRequestURL = function getMathConversionRequestURL() {
        var basePath, baseurl;

        basePath = this.wiris.jsEditor.defaultBasePath;
        baseurl = basePath.replace('resources', 'latex2mathml');

        return baseurl;
    };

    return equationEditor;
});

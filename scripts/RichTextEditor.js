/* global CKEDITOR */
define([
    'ckeditor', 'scripts/Sanitizer', 'scripts/ConfigReader',
    'scripts/RTESpecialChars', 'scripts/Helper'
], function richTextEditorLoader(cke, Sanitizer, Config, RTESpecialChars, Helper) {
    var config = {
        'enterMode': CKEDITOR.ENTER_BR,
        'toolbar': [{
            'name': 'basicstyles',
            'items': [
                'Bold', 'Italic', 'Subscript', 'Superscript', 'smallcaps',
                'monospace', 'tnqspecialchar'
            ]
        }],
        'startupFocus': true,
        'extraPlugins': 'tnqspecialchar,tnqplaceholder,smallcaps,monospace',
        'coreStyles_bold': {
            'element': 'b',
            'overrides': 'strong'
        },
        'coreStyles_italic': {
            'element': 'i',
            'overrides': 'em'
        },
        'specialChars': RTESpecialChars.map(function eachChar(i) {
            return [String.fromCharCode(i[0]), i[1]];
        })
    };

    function initializeVariables() {
        this.config = {};
        this.keyEvents = {};
        this.editorName = null;
        this.isRendered = false;
        this.hasKeyListener = false;
        this.hasErrorListener = false;
        this.errorCallback = null;
        this.elementToRender = null;
    }

    function assertEditor() {
        if (Helper.isNull(this.editorName) === true ||
            Helper.isEmptyString(this.editorName) === true) {
            throw new Error('rich.text.editor.name.null');
        }

        if (Helper.isUndefined(CKEDITOR.instances[this.editorName]) === true) {
            throw new Error('rich.text.editor.instance.Undefined');
        }
    }

    function deepFreeze(obj) {
        var prop,
            propNames = Object.getOwnPropertyNames(obj);

        propNames.forEach(function eachName(name) {
            prop = obj[name];

            if (typeof prop === 'object' && prop !== null) {
                deepFreeze(prop);
            }
        });

        return Object.freeze(obj);
    }

    function addExtraConfig(extraConfig) {
        extraConfig = extraConfig || {};
        this.config = Object.assign({}, config, extraConfig);
        this.config.contentsCss = Config.get('stylePrefix') + 'ckeditor.css';
        this.config = deepFreeze(this.config);
    }

    function bindErrorEvent(editor) {
        var iframe;

        if (Helper.isUndefined(editor.element) === true) {
            return;
        }

        iframe = editor.element.$.querySelector('.cke_wysiwyg_frame');
        iframe.contentWindow.addEventListener('error', this.errorCallback);
    }

    function removeErrorEvent(editor) {
        var iframe;

        if (Helper.isUndefined(editor.element) === true) {
            return;
        }

        iframe = editor.element.$.querySelector('.cke_wysiwyg_frame');
        iframe.contentWindow.removeEventListener('error', this.errorCallback);
    }

    function RichTextEditor(Win, Doc, element, extraConfig) {
        initializeVariables.call(this);
        this.win = Win;
        if (element instanceof this.win.HTMLElement === false) {
            throw new Error('rich.text.editor.invalid.element');
        }
        this.doc = Doc;
        this.elementToRender = element;
        addExtraConfig.call(this, extraConfig);
    }

    RichTextEditor.prototype.isReady = function isReadyFn() {
        return CKEDITOR.instances[this.editorName].status === 'ready';
    };

    RichTextEditor.prototype.setData = function setDataFn(data) {
        assertEditor.call(this);
        CKEDITOR.instances[this.editorName].setData(data);
    };

    RichTextEditor.prototype.focus = function focusFn() {
        assertEditor.call(this);
        if (this.isReady() === true) {
            CKEDITOR.instances[this.editorName].focus();
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    event.editor.focus();
                }
            );
        }
    };

    RichTextEditor.prototype.clear = function clearFn() {
        assertEditor.call(this);
        if (this.isReady() === true) {
            CKEDITOR.instances[this.editorName].loadSnapshot('');
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    event.editor.loadSnapshot('');
                }
            );
        }
    };

    RichTextEditor.prototype.getData = function getDataFn(options) {
        var data,
            sanitize = false,
            encodeHtml = false;

        assertEditor.call(this);
        data = CKEDITOR.instances[this.editorName].getSnapshot();
        options = options || {};
        if (
            options.hasOwnProperty('sanitize') &&
            options.sanitize === true
        ) {
            sanitize = true;
        }

        if (
            options.hasOwnProperty('encodeHtml') &&
            options.encodeHtml === true
        ) {
            encodeHtml = true;
        }

        data = '<span>' + data + '</span>';
        data = Sanitizer.sanitize(
            data, sanitize, encodeHtml, this.win, options.extraWhitelistedTags
        );
        data = data.replace(/^<span>/i, '').replace(/<\/span>$/i, '');
        data = data.replace(/<br>/ig, '<br/>');
        data = data.replace(/<br\/>$/i, '');

        return data;
    };

    RichTextEditor.prototype.hasData = function hasDataFn() {
        return CKEDITOR.instances[this.editorName].getSnapshot() !== '';
    };

    RichTextEditor.prototype.isEditable = function isEditableFn() {
        return CKEDITOR.instances[this.editorName].readOnly;
    };

    RichTextEditor.prototype.setReadOnly = function setReadOnlyFn() {
        assertEditor.call(this);
        if (this.isReady() === true) {
            CKEDITOR.instances[this.editorName].setReadOnly(true);
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    event.editor.setReadOnly(true);
                }
            );
        }
    };

    RichTextEditor.prototype.setEditable = function setEditableFn() {
        assertEditor.call(this);
        if (this.isReady() === true) {
            CKEDITOR.instances[this.editorName].setReadOnly(false);
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    event.editor.setReadOnly(false);
                }
            );
        }
    };

    RichTextEditor.prototype.destroy = function destroyFn() {
        var instance = this;

        assertEditor.call(this);
        if (this.isReady() === true) {
            if (this.hasErrorListener === true) {
                removeErrorEvent(this, CKEDITOR.instances[this.editorName]);
            }
            CKEDITOR.instances[this.editorName].destroy();
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    if (instance.hasErrorListener === true) {
                        removeErrorEvent(instance, CKEDITOR.instances[event.editor]);
                    }
                    event.editor.destroy();
                }
            );
        }
    };

    RichTextEditor.prototype.setErrorCallback = function setErrorCallbackFn(callback) {
        var instance = this;

        if (this.hasErrorListener === true) {
            throw new Error('rte.error.listener.already.set');
        }
        assertEditor.call(this);
        if (Helper.isFunction(callback) === false) {
            throw new Error('rte.error.callback.not.function');
        }
        this.errorCallback = callback;
        if (this.isReady() === true) {
            bindErrorEvent.call(this, CKEDITOR.instances[this.editorName]);
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    bindErrorEvent.call(instance, event.editor);
                }
            );
        }
        this.hasErrorListener = true;
    };

    RichTextEditor.prototype.observeKeyEvent = function observeKeyEventFn(
        callbacks
    ) {
        var fn,
            instance = this;

        assertEditor.call(this);
        if (Helper.isObject(callbacks) === false) {
            return;
        }
        this.keyEvents = Object.assign({}, this.keyEvents, callbacks);
        if (this.hasKeyListener === true) {
            return;
        }
        CKEDITOR.instances[this.editorName].on('key', function keyFn(event) {
            if (event.data.keyCode in instance.keyEvents) {
                fn = instance.keyEvents[event.data.keyCode];
                try {
                    fn.call(fn, event);
                }
                catch (e) {
                    if (instance.hasErrorListener === true) {
                        instance.errorCallback.call(instance.errorCallback, e);
                    }
                }
                finally {
                    event.cancel();
                    event.stop();
                }
            }
        });
        this.hasKeyListener = true;
    };

    RichTextEditor.prototype.setSelection = function setSelectionFn() {
        var sel, element, getSelection, selection;

        assertEditor.call(this);
        selection = function selectionFn(editor) {
            sel = editor.getSelection();
            element = sel.getStartElement();
            if (Helper.isNull(element) === true) {
                getSelection = editor.document.getSelection();
                element = getSelection.getStartElement();
            }
            sel.selectElement(element);
        };
        if (this.isReady() === true) {
            selection(CKEDITOR.instances[this.editorName]);
        }
        else {
            CKEDITOR.instances[this.editorName].on('instanceReady',
                function instanceReady(event) {
                    selection(event.editor);
                }
            );
        }
    };

    RichTextEditor.prototype.render = function renderFn() {
        var editor;

        if (this.isRendered === true) {
            throw new Error('rich.text.editor.already.rendered');
        }
        CKEDITOR.plugins.addExternal(
            'tnqspecialchar',
            Config.get('scriptPrefix') + 'rte-plugin/tnqspecialchar/plugin.js'
        );
        CKEDITOR.plugins.addExternal(
            'tnqplaceholder',
            Config.get('scriptPrefix') + 'rte-plugin/tnqplaceholder/plugin.js'
        );
        CKEDITOR.plugins.addExternal(
            'smallcaps',
            Config.get('scriptPrefix') + 'rte-plugin/smallcaps/plugin.js'
        );
        CKEDITOR.plugins.addExternal(
            'monospace',
            Config.get('scriptPrefix') + 'rte-plugin/monospace/plugin.js'
        );
        editor = CKEDITOR.appendTo(this.elementToRender, this.config);
        this.editorName = editor.name;
        editor = CKEDITOR.instances[this.editorName];
        editor.define('key', {'errorProof': false});
        this.isRendered = true;
    };

    return RichTextEditor;
});

define(['scripts/Helper'], function fileInputLoader(Helper) {
    var fileInputTemplate = [
            '<label class="file-input" tabIndex="-1">',
                '<span class="icon">',
                    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ',
                        'xmlns="http://www.w3.org/2000/svg" width="612.001" height="612.001" ',
                        'viewBox="0 0 612.001 612.001">',
                        '<path fill="#000" d="M565.488,74.616l-2.868-2.833',
                            'c-63.386-61.375-164.907-60.728-227.507,1.889L45.34,363.532 C23.501,',
                            '385.406,0,425.134,0,460.683c0,33.38,13.027,64.802,36.65,88.407',
                            'c23.641,23.658,55.08,36.686,88.53,36.686h0.018 ',
                            'c33.45-0.018,64.89-13.045,88.513-36.702l250.151-250.168',
                            'c17.188-17.188,26.596-41.004,25.756-65.379 c-0.786-22.364-9.932',
                            '-43.364-25.756-59.154c-16.646-16.629-38.749-25.792-62.284-25.792',
                            'c-23.536,0-45.655,9.145-62.249,25.792 L147.754,365.963c-4.826,',
                            '4.773-7.851,11.383-7.851,18.691c0,14.479,11.733,26.229,26.229,',
                            '26.229 c7.239,0,13.779-2.938,18.517-7.676l0.018,0.018l191.766-',
                            '191.8c6.854-6.837,16.314-10.194,25.739-10.037 c9.04,0.14,18.027,',
                            '3.515,24.619,10.089c6.383,6.382,10.072,14.88,10.404,23.851c0.35,',
                            '10.002-3.357,19.427-10.422,26.491 l-250.15,250.167c-13.744,13.744',
                            '-31.999,21.315-51.425,21.333h-0.018c-19.427,0-37.699-7.589-51.443',
                            '-21.333 c-13.709-13.709-21.28-31.929-21.28-51.303c0-16.297,13.744',
                            '-43.784,29.988-60.063l289.773-289.843 c42.455-42.49,111.349-42.788',
                            ',154.188-1.049l2.78,2.798c41.074,42.945,40.497,111.297-1.73,153.542',
                            'L287.623,505.918 c-4.809,4.773-7.799,11.349-7.799,18.657c0,14.479,',
                            '11.733,26.229,26.229,26.229c7.24,0,13.761-2.938,18.518-7.658l0.017,',
                            '0.018 l239.975-239.991C627.51,240.188,627.807,137.967,565.488,',
                            '74.616z"/>',
                    '</svg>',
                '</span>',
                '<span class="text" title="{{file.input.title}}">{{file.input.text}}</span>',
                '<input type="file"/>',
            '</label>'
        ],
        cssRules = {
            '.file-input': {
                'position': 'relative',
                'overflow': 'hidden',
                'cursor': 'pointer'
            },
            '.file-input .icon': {
                'vertical-align': 'middle'
            },
            '.file-input .icon svg': {
                'width': '1em',
                'height': '1em'
            },
            '.file-input .icon svg path': {
                'fill': '#000'
            },
            '.file-input[aria-disabled="true"] .text, .file-input[aria-disabled="true"] .icon svg': {
                'color': '#808080',
                'opacity': '0.5',
                'cursor': 'not-allowed'
            },
            '.file-input .text': {
                'text-decoration': 'underline',
                'padding-left': '.5em'
            },
            '.file-input input[type="file"]': {
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'right': '0',
                'bottom': '0',
                'min-width': '100%',
                'min-height': '100%',
                'opacity': '0',
                'z-index': '-1'
            }
        };

    function randId() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function initializeVariables(instance) {
        var dummy = function dummy() {};

        instance.stylesheetId = 'file-input-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.locale = {};
        instance.elem = null;
        instance.fileElem = null;
        instance.container = null;
        instance.onSelectFn = null;
        instance.name = null;
        instance.label = null;
        instance.title = null;
        instance.onSelectCallback = dummy;
        instance.onBeforeSelectCallback = dummy;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('file.input.not.rendered');
        }
    }

    function FileInput(label, title, options) {
        if (options.win instanceof options.win.Window === false) {
            throw new Error('selectbox.requires.window.object');
        }
        if (options.doc instanceof options.win.HTMLDocument === false) {
            throw new Error('selectbox.requires.htmldocument');
        }
        if (Helper.isString(label) === false) {
            throw new Error('fileinput.label.must.be.a.string');
        }
        if (Helper.isString(title) === false) {
            throw new Error('fileinput.title.must.be.a.string');
        }
        initializeVariables(this);
        this.global = options.win;
        this.htmlDoc = options.doc;
        this.name = randId();
        this.label = label;
        this.title = title;
    }

    FileInput.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    FileInput.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.elem;
    };

    FileInput.prototype.allowMultipleFiles = function allowMultipleFiles() {
        return this.fileElem.setAttribute('multiple', 'multiple');
    };

    FileInput.prototype.setFileFilter = function setFileFilter(mimeTypes) {
        return this.fileElem.setAttribute('accept', mimeTypes.join(','));
    };

    FileInput.prototype.setEnabled = function setEnabled(enable) {
        var disabled = this.elem.getAttribute('aria-disabled');

        if (enable === false) {
            this.isEnabled = false;
            if (disabled === null || disabled === 'false') {
                this.elem.setAttribute('aria-disabled', 'true');
                this.fileElem.setAttribute('disabled', 'disabled');
            }
        }
        else {
            this.isEnabled = true;
            this.elem.removeAttribute('aria-disabled');
            this.fileElem.removeAttribute('disabled');
        }
    };

    FileInput.prototype.renderTo = function renderTo(elem) {
        var qs, frag, styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl, text;

        this.container = elem;
        qs = this.container.querySelector.bind(this.container);
        if (this.isRendered === true) {
            throw new Error('fileinput.already.rendered');
        }

        if (styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }
        frag = this.htmlDoc.createElement('div');
        frag.innerHTML = fileInputTemplate.join('');
        text = frag.querySelector('.file-input .text');
        text.innerHTML = '';
        text.appendChild(this.htmlDoc.createTextNode(this.label));
        text.setAttribute('title', this.title);
        frag.querySelector('.file-input input[type="file"]').setAttribute('name', this.name);
        this.container.appendChild(frag.firstChild);
        this.elem = qs('.file-input');
        this.fileElem = qs('.file-input input[type="file"]');
        this.elem.tabIndex = this.tabIndex;
        this.onSelectFn = this.onChange.bind(this);
        this.fileElem.addEventListener('change', this.onSelectFn, false);
        this.isRendered = true;
        this.isEnabled = true;
    };

    FileInput.prototype.setTabIndex = function setTabIndex(tabIndex) {
        this.tabIndex = tabIndex;
    };

    FileInput.prototype.onSelect = function onSelect(callback) {
        this.onSelectCallback = callback;
    };

    FileInput.prototype.onBeforeSelect = function onBeforeSelect(callback) {
        this.onBeforeSelectCallback = callback;
    };

    FileInput.prototype.onChange = function onChange() {
        this.onBeforeSelectCallback();
        this.onSelectCallback(this.fileElem.files);
    };

    FileInput.prototype.destroy = function destroy() {
        this.fileElem.removeEventListener('change', this.onSelectFn, false);
        this.container.innerHTML = '';
        initializeVariables(this);
    };

    return FileInput;
});

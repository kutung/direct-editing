define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/Panel', 'scripts/Util',
    'scripts/InsertCommand', 'scripts/ConfigReader', 'scripts/ErrorHandler'
], function InsertPanelLoader(Helper, RTE, Panel, Util, InsertCommand, Config,
    ErrorHandler) {
    var saveSuccessMessage, placeholderMessage, errorHandler,
        insertTemplate = [
            '<div class="pc-insert">',
                '<div class="info"></div>',
                '<div class="insertion"></div>',
                '<div class="buttons-container">',
                '</div>',
            '</div>'
        ],
        cssRules = {
            '.insert-container .panel .panel-header .text': {
                'font-size': '11px',
                'font-weight': 'normal',
                'padding': '.7em .7em'
            },
            '.insert-container .panel .panel-content': {
                'padding': '0'
            },
            '.insert-container .panel .panel-header .icon': {
                'background-image': 'url("/images/insert-header.png")',
                'background-repeat': 'no-repeat',
                'background-position': 'center center',
                'width': '2.6em'
            },
            '.insert-container .panel.open .panel-header .icon': {
                'background-image': 'url("/images/insert-header-open.png")'
            },
            '.pc-insert': {
                'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif',
                'padding': '10px',
                'font-size': '12px'
            },
            '.insert-container': {
                'display': 'none'
            },
            '.pc-insert .info': {
                'margin': '0 0 10px 0',
                'font-family': '"Lucida Grande", calibri',
                'font-size': '12px',
                'color': '#DA9257'
            },
            '.pc-insert .instruction': {
                'margin': '0 0 10px 0'
            },
            '.pc-insert .buttons-container': {
                'text-align': 'right',
                'padding': '10px 0 0 0',
                'font-weight': 'bold'
            },
            '.pc-insert .proceed': {
                'background-color': '#2F2F2F',
                'color': '#FFF',
                'border': '1px solid #2F2F2F'
            },
            '.pc-insert .proceed[disabled]': {
                'background-color': '#EEE',
                'color': '#ccc',
                'border': '1px solid #EEE'
            }
        };

    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.insertionContainer = null;
        instance.rte = null;
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.clearRTE = null;
        instance.isEnabled = false;
        instance.panel = null;
        instance.insertCommand = null;
        instance.hasChange = false;
        instance.content = null;
        instance.stylesheetId = 'insertpanel-style';
        instance.styleSheet = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('insertion.not.rendered');
        }
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function checkChanges(data) {
        data = data.replace(/&#xA0/, '&nbsp');
        if (this.content !== data) {
            this.hasChange = true;
        }
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true
        });
    }

    function proceedFn() {
        var data = getRTEData(this);

        checkChanges.call(this, data);
        if (this.hasChange === false) {
            this.setEnabled(false);
            return;
        }
        if (Util.checkCKEditorEmpty(data, this.htmlDoc) === true) {
            if (this.context.indexOf('onInsert') !== -1) {
                throw new Error('insertion.empty.text');
            }
            else {
                this.setEnabled(false);
                return;
            }
        }
        this.eBus.publish('ActionLog:save',
            {'action': 'insert-proceed', 'data': data}, true
        );
        this.insertCommand.execute(this.domFragment, this.context, data, false);
        this.eBus.publish('FlashMessage:show', saveSuccessMessage,
            {'closeButton': false, 'success': true}
        );
        this.setEnabled(false);
    }

    function clearRTE() {
        this.rte.clear();
    }

    function validate(requestFragment) {
        var requestNode,
            winDom = this.global.DocumentFragment;

        if (requestFragment instanceof winDom === false ||
            requestFragment.hasChildNodes() === false
        ) {
            throw new Error('error.fragment.missing');
        }
        requestNode = requestFragment.querySelector('[data-request-id]');
        if (requestNode === null) {
            throw new Error('error.request.id.missing');
        }
    }

    function clearFn(domFragment, context) {
        validate.call(this, domFragment);

        this.domFragment = domFragment;
        this.context = context;
        this.insertCommand.execute(this.domFragment, this.context, null, true);
        this.setEnabled(false);
    }

    function insert(cont, doc, win, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('insertion.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('insertion.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('insertion.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('insertion.requires.eventbus');
        }
        initializeVariables(this);
        this.insertionContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.domFragment = null;
        this.context = null;
        saveSuccessMessage = Config.getLocaleByKey('insert.save.success');
        placeholderMessage = Config.getLocaleByKey('insert.panel.placeholder');
        this.insertCommand = new InsertCommand(this.global, this.htmlDoc, this.eBus);
        this.eBus.subscribe('InsertPanel:OnFocus', this.focusOnInsertion, this);
        this.eBus.subscribe(
            'InsertPanel:OnSetFragment', this.setFragment, this
        );
        this.eBus.subscribe('InsertPanel:OnSetEnabled', this.setEnabled, this);
        this.eBus.subscribe('InsertPanel:Clear', clearFn, this);
        this.eBus.subscribe('InsertPanel:destroy', this.destroy, this);
        this.eBus.subscribe('InsertPanel:SetSelection', this.setSelection, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    insert.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.insertionContainer;
    };

    insert.prototype.setEnabled = function setEnabled(enable) {
        if (
            (this.isEnabled === true && enable === true) ||
            (this.isEnabled === false && enable === false)
        ) {
            return;
        }
        if (enable === false) {
            this.clearRTE();
            this.rte.setReadOnly();
            this.isEnabled = false;
            this.hasChange = false;
            this.content = null;
            this.eBus.publish('Supplementary:RemoveBlock');
            this.eBus.publish('Editor:RemoveBlock');
            this.eBus.publish('RightPane:Hide', 'insert');
        }
        else {
            this.panel.show();
            this.rte.setEditable();
            this.rte.focus();
            this.isEnabled = true;
        }
    };

    insert.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    insert.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    insert.prototype.render = function render() {
        var qs = this.insertionContainer.querySelector.bind(
                this.insertionContainer
            ),
            frag = this.htmlDoc.createDocumentFragment(),
            child,
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('insertion.already.rendered');
        }
        if (styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }
        this.panel = new Panel(
            this.insertionContainer, this.htmlDoc, this.global, this.eBus
            );
        tmpNode.innerHTML = insertTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.renderComponentStyle();
        this.panel.render();
        this.panel.add(frag);
        this.insertionContainer.appendChild(this.panel.getElement());

        this.rteContainer = qs('.pc-insert .insertion');
        this.rte = new RTE(this.global, this.htmlDoc, this.rteContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'placeholder': placeholderMessage,
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.proceedFn = proceedFn.bind(this);
        this.clearRTE = clearRTE.bind(this);
        this.isRendered = true;
        this.eBus.publish('Ins:OnRender', this);
        this.rte.observeKeyEvent({'13': this.proceedFn});
    };

    insert.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('insertion.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    insert.prototype.setName = function setName(name) {
        assertRendered(this);
        if (Helper.isString(name) === false) {
            throw new Error('insertion.name.must.be.a.string');
        }
        this.panel.setName(name);
    };

    insert.prototype.setData = function setData(insertion) {
        assertRendered(this);
        this.rte.setData(insertion);
    };

    insert.prototype.getData = function getData(insertion) {
        assertRendered(this);
        return getRTEData(this);
    };

    insert.prototype.focusOnInsertion = function focusOnInsertion(
        domFragment, context, content
    ) {
        assertRendered(this);
        this.setEnabled(true);
        this.domFragment = domFragment;
        this.context = context;
        this.setData(content);
        this.content = content;
        this.eBus.publish('Supplementary:SetBlock');
        this.eBus.publish('Editor:SetBlock');
    };

    insert.prototype.setFragment = function setFragment(domFragment, context) {
        assertRendered(this);
        this.setEnabled(true);
        this.domFragment = domFragment;
        this.context = context;
        this.clearRTE();
    };

    insert.prototype.autoSave = function autoSaveFn() {
        if (this.isEnabled === false) {
            return;
        }
        this.proceedFn();
    };

    insert.prototype.setSelection = function setSelection() {
        this.rte.setSelection();
    };

    insert.prototype.destroy = function destroy() {
        var eb = this.eBus;

        this.rte.destroy();
        this.eBus.unsubscribe('InsertPanel:OnFocus', this.focusOnInsertion);
        this.eBus.unsubscribe('InsertPanel:OnSetFragment', this.setFragment);
        this.eBus.unsubscribe('InsertPanel:OnSetEnabled', this.setEnabled);
        this.eBus.unsubscribe('InsertPanel:Clear', clearFn);
        this.eBus.unsubscribe('InsertPanel:destroy', this.destroy);
        this.eBus.unsubscribe('InsertPanel:SetSelection', this.setSelection);
        this.panel.destroy();
        this.insertionContainer.innerHTML = '';
        initializeVariables(this);
        eb.publish('Ins:OnDestroy');
    };

    return insert;
});

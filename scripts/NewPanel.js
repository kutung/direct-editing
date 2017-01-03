define([
    'scripts/Helper', 'scripts/Panel'
], function NewPanelLoader(Helper, Panel) {
    var newPanelTemplate = [

                            
                            '<div class="references-listitem">',
                                '<form action="#">',
                                    '<p>',
                                        '<input type="checkbox" id="test8" value="public">',
                                        '<label for="test8">A conceptual demonstration of freeze desalination</label>',
                                        '<i class="cite-btn">CITE</i>',
                                        '<a class="arrow-action" href="javascript:;"></a>',
                                    '</p>',
                                        
                                '</form>',
                            '</div>',
                            '<div class="references-listitem">',
                                '<form action="#">',
                                    '<p>',
                                        '<input type="checkbox" id="test9" value="public">',
                                        '<label for="test9">A conceptual demonstration of freeze desalination</label>',
                                        '<i class="cite-btn">CITE</i>',
                                        '<a class="arrow-action" href="javascript:;"></a>',
                                    '</p>',
                                        
                                '</form>',
                            '</div>',
        ],
        cssRules = {

        };

    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.newContainer = null;
        instance.rte = null;
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.clearRTE = null;
        instance.isEnabled = false;
        instance.panel = null;
        instance.insertCommand = null;
        instance.hasChange = false;
        instance.content = null;
        instance.stylesheetId = 'newpanel-style';
        instance.styleSheet = null;
    }
    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('new not rendered');
        }
    }

    function newPanel(cont, doc, win, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('new.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('new.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('new.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('new.requires.eventbus');
        }
        initializeVariables(this);
        this.newContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.domFragment = null;
        this.context = null;
        // this.newCommand = new NewCommand(this.global, this.htmlDoc, this.eBus);
        /*this.eBus.subscribe('InsertPanel:OnFocus', this.focusOnInsertion, this);
        this.eBus.subscribe(
            'InsertPanel:OnSetFragment', this.setFragment, this
        );
        this.eBus.subscribe('InsertPanel:OnSetEnabled', this.setEnabled, this);
        this.eBus.subscribe('InsertPanel:Clear', clearFn, this);
        this.eBus.subscribe('InsertPanel:destroy', this.destroy, this);
        this.eBus.subscribe('InsertPanel:SetSelection', this.setSelection, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);*/
    }

    newPanel.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };
    newPanel.prototype.setTitle = function setTitle(title) {
        // assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('new title must be a string');
        }
        this.panel.setTitle(title);
    };
    newPanel.prototype.setName = function setName(name) {
        // assertRendered(this);
        if (Helper.isString(name) === false) {
            throw new Error('new name must be a string');
        }
        this.panel.setName(name);
    };
    newPanel.prototype.render = function render() {
        var qs = this.newContainer.querySelector.bind(
                this.newContainer
            ),
            frag = this.htmlDoc.createDocumentFragment(),
            child,
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('new already rendered');
        }
        if (styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }
        this.panel = new Panel(
            this.newContainer, this.htmlDoc, this.global, this.eBus
            );
        tmpNode.innerHTML = newPanelTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.renderComponentStyle();
        this.panel.render();
        this.panel.add(frag);
        this.newContainer.appendChild(this.panel.getElement());
    };

    return newPanel;
});

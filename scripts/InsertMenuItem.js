define(
['scripts/Helper', 'scripts/AbstractMenuItem'],
function InsertMenuItemLoader(Helper, AbstractMenuItem) {
    var template = [
        '<button title="Insert" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-insert"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.eBus = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.container = null;
        instance.actionHandler = null;
        instance.insertCommand = null;
        instance.rangeHelper = null;
    }

    function InsertMenuItem(eBus, win, doc, rangeHelper) {
        if (win instanceof win.Window === false) {
            throw new Error('insertmenuitem.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('insertmenuitem.requires.htmldocument');
        }
        if (Helper.isFunction(eBus.subscribe) === false) {
            throw new Error('insertmenuitem.eventbus.missing');
        }
        if (Helper.isFunction(eBus.publish) === false) {
            throw new Error('insertmenuitem.eventbus.missing');
        }
        initializeVariables(this);
        this.rangeHelper = rangeHelper;
        this.eBus = eBus;
        this.win = win;
        this.htmlDoc = doc;
    }

    InsertMenuItem.prototype = new AbstractMenuItem();

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('insertmenuitem.not.rendered');
        }
    }

    InsertMenuItem.prototype.setAction = function setAction() {
        var domFragment, context, content = null;

        assertRendered(this);
        domFragment = this.contextualMenu.domFragment;
        context = this.contextualMenu.context;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('insertion.menu.item.domFragment.missing');
        }

        this.eBus.publish('ActionLog:action',
            'insert', {'context': context}, domFragment.cloneNode(true)
        );
        if (context.indexOf('onReplace') !== -1 || context.indexOf('onInsert') !== -1) {
            this.eBus.publish('InsertPanel:Clear', domFragment, context);
        }
        else {
            this.eBus.publish('InsertPanel:OnFocus', domFragment, context, content);
        }
        this.eBus.publish('contextMenu:hide');
    };

    InsertMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.container.setAttribute('title', 'Clear Inserted Text');
        }
        else {
            this.container.setAttribute('title', 'Insert');
        }
    };

    InsertMenuItem.prototype.render = function render() {
        var tmpNode, instance = this;

        if (this.isRendered === true) {
            throw new Error('insertmenuitem.already.rendered');
        }

        tmpNode = this.htmlDoc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.container = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            instance.setAction();
        };
        this.actionHandler.bind(this);
        this.container.addEventListener('click', this.actionHandler, false);
        this.isRendered = true;

        return this.container;
    };

    InsertMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.container.removeEventListener('click', this.actionHandler, false);
        this.container.innerHTML = '';
        initializeVariables(this);
    };

    return InsertMenuItem;
});

define([
    'scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/ItalicCommand',
    'scripts/SelectionStorage'
], function ItalicMenuItemLoader(Helper, AbstractMenuItem, ItalicCommand, SelectionStorage) {
    var template = [
        '<button title="Italics" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-italic"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.win = null;
        instance.italicCommand = null;
        instance.actionHandler = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function ItalicMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('italicmenuitem.not.rendered');
        }
    }

    function validate(contextualMenu, domFragment, context) {
        if (Helper.isUndefined(contextualMenu) === true) {
            throw new Error('ContextualMenu is not defined');
        }
        if (Helper.isUndefined(domFragment) === true) {
            throw new Error('DOM Fragment is not defined');
        }
        if (Helper.isUndefined(context) === true) {
            throw new Error('DOM Fragment formatting context is not defined');
        }
    }

    ItalicMenuItem.prototype = new AbstractMenuItem();

    ItalicMenuItem.prototype.setAction = function setAction(italicCommand) {
        var contextualMenu = this.contextualMenu,
            domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'italic', {'context': context}, domFragment.cloneNode(true)
        );
        italicCommand.execute(domFragment, context);
    };

    ItalicMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Italics');
        }
        else {
            this.menuItem.setAttribute('title', 'Italics');
        }
    };

    ItalicMenuItem.prototype.render = function render() {
        var win = this.win,
            doc = this.doc,
            eb = this.eb,
            tmpNode, instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === false) {
            throw new Error('italicmenuitem.already.rendered');
        }

        this.italicCommand = new ItalicCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('italicmenuitem.no.selection');
            }
            instance.setAction(instance.italicCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    ItalicMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return ItalicMenuItem;
});

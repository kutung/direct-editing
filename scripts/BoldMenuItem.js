define([
    'scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/BoldCommand',
    'scripts/SelectionStorage'
], function BoldMenuItemLoader(
    Helper, AbstractMenuItem, BoldCommand, SelectionStorage
) {
    var template = [
        '<button title="Bold" class="ui-button bold_menu">',
            '<span class="ui-button-text">',
                '<i class="icon-bold"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.boldCommand = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('boldmenuitem.not.rendered');
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

    function BoldMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    BoldMenuItem.prototype = new AbstractMenuItem();

    BoldMenuItem.prototype.setAction = function setAction(boldCommand) {
        var contextualMenu = this.contextualMenu,
            domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'bold', {'context': context}, domFragment.cloneNode(true)
        );
        boldCommand.execute(domFragment, context);
    };

    BoldMenuItem.prototype.render = function render() {
        var tmpNode,
            win = this.win,
            doc = this.doc,
            eb = this.eb,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('boldmenuitem.already.rendered');
        }

        this.boldCommand = new BoldCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('boldmenuitem.no.selection');
            }
            instance.setAction(instance.boldCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    BoldMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Bold');
        }
        else {
            this.menuItem.setAttribute('title', 'Bold');
        }
    };

    BoldMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return BoldMenuItem;
});

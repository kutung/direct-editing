define(['scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/SubscriptCommand',
    'scripts/SelectionStorage'
],
function subscriptmenuitemLoader(
    Helper, AbstractMenuItem, SubscriptCommand, SelectionStorage
) {
    var template = [
        '<button title="Subscript" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-subscript"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.win = null;
        instance.doc = null;
        instance.subscriptCommand = null;
        instance.actionHandler = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function SubscriptMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.rangeHelper = rangeHelper;
        this.eb = eb;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('subscriptmenuitem.not.rendered');
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
    SubscriptMenuItem.prototype = new AbstractMenuItem();

    SubscriptMenuItem.prototype.setAction = function setAction(subscriptCommand) {
        var contextualMenu = this.contextualMenu, domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'subscript', {'context': context}, domFragment.cloneNode(true)
        );
        subscriptCommand.execute(domFragment, context);
    };

    SubscriptMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Subscript');
        }
        else {
            this.menuItem.setAttribute('title', 'Subscript');
        }
    };

    SubscriptMenuItem.prototype.render = function render() {
        var win = this.win, doc = this.doc, eb = this.eb, tmpNode,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === false) {
            throw new Error('subscriptmenuitem.already.rendered');
        }

        this.subscriptCommand = new SubscriptCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('subscriptmenuitem.no.selection');
            }
            instance.setAction(instance.subscriptCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    SubscriptMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return SubscriptMenuItem;
});

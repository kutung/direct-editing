define([
    'scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/SmallCapsCommand',
    'scripts/SelectionStorage'
], function SmallCapsMenuLoader(
    Helper, AbstractMenuItem, SmallCapsCommand, SelectionStorage
) {
    var template = [
        '<button title="SmallCaps" class="ui-button smallcaps_menu">',
            '<span class="ui-button-text">',
                '<i class="icon-smallcaps"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.smallcapsCommand = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('smallcaps.menuitem.not.rendered');
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

    function SmallCapsMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    SmallCapsMenuItem.prototype = new AbstractMenuItem();

    SmallCapsMenuItem.prototype.setAction = function setAction(smallcapsCommand) {
        var contextualMenu = this.contextualMenu,
            domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'smallcaps', {'context': context}, domFragment.cloneNode(true)
        );
        smallcapsCommand.execute(domFragment, context);
    };

    SmallCapsMenuItem.prototype.render = function render() {
        var tmpNode,
            win = this.win,
            doc = this.doc,
            eb = this.eb,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('smallcaps.menuitem.already.rendered');
        }

        this.smallcapsCommand = new SmallCapsCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('smallcaps.menuitem.no.selection');
            }
            instance.setAction(instance.smallcapsCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    SmallCapsMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Smallcaps');
        }
        else {
            this.menuItem.setAttribute('title', 'Smallcaps');
        }
    };

    SmallCapsMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return SmallCapsMenuItem;
});

define([
    'scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/MonospaceCommand',
    'scripts/SelectionStorage'
], function MonospaceMenuLoader(
    Helper, AbstractMenuItem, MonospaceCommand, SelectionStorage
) {
    var template = [
        '<button title="Monospace" class="ui-button monospace_menu">',
            '<span class="ui-button-text">',
                '<i class="icon-monospace"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.monospaceCommand = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('monospace.menuitem.not.rendered');
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

    function MonospaceMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    MonospaceMenuItem.prototype = new AbstractMenuItem();

    MonospaceMenuItem.prototype.setAction = function setAction(monospaceCommand) {
        var contextualMenu = this.contextualMenu,
            domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'monospace', {'context': context}, domFragment.cloneNode(true)
        );
        monospaceCommand.execute(domFragment, context);
    };

    MonospaceMenuItem.prototype.render = function render() {
        var tmpNode,
            win = this.win,
            doc = this.doc,
            eb = this.eb,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('monospace.menuitem.already.rendered');
        }

        this.monospaceCommand = new MonospaceCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('monospace.menuitem.no.selection');
            }
            instance.setAction(instance.monospaceCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    MonospaceMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Monospace');
        }
        else {
            this.menuItem.setAttribute('title', 'Monospace');
        }
    };

    MonospaceMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return MonospaceMenuItem;
});

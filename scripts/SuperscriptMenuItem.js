define(['scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/SuperscriptCommand',
    'scripts/SelectionStorage'
],
function SuperscriptMenuItemLoader(
    Helper, AbstractMenuItem, SuperscriptCommand, SelectionStorage
) {
    var template = [
        '<button title="Superscript" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-superscript"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.win = null;
        instance.superscriptCommand = null;
        instance.actionHandler = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function SuperscriptMenuItem(eb, win, doc, rangeHelper) {
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
            throw new Error('superscriptmenuitem.not.rendered');
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

    SuperscriptMenuItem.prototype = new AbstractMenuItem();

    SuperscriptMenuItem.prototype.setAction = function setAction(superscriptCommand) {
        var contextualMenu = this.contextualMenu, domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'superscript', {'context': context}, domFragment.cloneNode(true)
        );
        superscriptCommand.execute(domFragment, context);
    };

    SuperscriptMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Superscript');
        }
        else {
            this.menuItem.setAttribute('title', 'Superscript');
        }
    };

    SuperscriptMenuItem.prototype.render = function render() {
        var win = this.win, doc = this.doc, eb = this.eb, tmpNode,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === false) {
            throw new Error('superscriptmenuitem.not.rendered');
        }

        this.superscriptCommand = new SuperscriptCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('superscriptmenuitem.no.selection');
            }
            instance.setAction(instance.superscriptCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    SuperscriptMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return SuperscriptMenuItem;
});

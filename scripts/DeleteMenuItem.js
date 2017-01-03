define([
    'scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/DeleteCommand',
    'scripts/SelectionStorage'
],
function DeleteMenuItemLoader(Helper, AbstractMenuItem, DeleteCommand, SelectionStorage) {
    var template = [
        '<button title="Delete" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-delete"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.deleteCommand = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('deletemenuitem.not.rendered');
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

    function DeleteMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.rangeHelper = rangeHelper;
        this.eb = eb;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    DeleteMenuItem.prototype = new AbstractMenuItem();

    //FIXME: This method name does not imply what it is doing
    DeleteMenuItem.prototype.setAction = function setAction(deleteCommand) {
        var contextualMenu = this.contextualMenu,
            domFragment, context;

        domFragment = contextualMenu.domFragment;
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'delete', {'context': context}, domFragment.cloneNode(true)
        );
        deleteCommand.execute(domFragment, context);
    };

    DeleteMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Delete');
        }
        else {
            this.menuItem.setAttribute('title', 'Delete');
        }
    };

    DeleteMenuItem.prototype.render = function render() {
        var tmpNode,
            win = this.win,
            doc = this.doc,
            eb = this.eb,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('deletemenuitem.already.rendered');
        }

        this.deleteCommand = new DeleteCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            if (instance.rangeHelper.hasSelection() === false) {
                instance.eb.publish('selection:reset');
                throw new Error('deletemenuitem.no.selection');
            }
            instance.setAction(instance.deleteCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    DeleteMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return DeleteMenuItem;
});

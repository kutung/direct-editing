define([
    'scripts/Helper', 'scripts/AbstractMenuItem',
    'scripts/DeleteReferenceCommand', 'scripts/SelectionStorage'
],
function DeleteReferenceMenuItemLoader(
    Helper, AbstractMenuItem, DeleteReferenceCommand, SelectionStorage
) {
    var template = [
        '<button title="Delete Reference" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-delete-reference"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.deleteReferenceCommand = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('deletereferencemenuitem.not.rendered');
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

    function DeleteReferenceMenuItem(eb, win, doc, rangeHelper, editorInst) {
        initializeVariables(this);
        this.rangeHelper = rangeHelper;
        this.eb = eb;
        this.win = win;
        this.doc = doc;
        this.editorInst = editorInst;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    DeleteReferenceMenuItem.prototype = new AbstractMenuItem();

    //FIXME: This method name does not imply what it is doing
    DeleteReferenceMenuItem.prototype.setAction = function setAction(
        deleteReferenceCommand
    ) {
        var contextualMenu = this.contextualMenu,
            domFragment, context, referenceNode, referenceCloneNode,
            editorInst = this.editorInst, win = this.win;

        referenceNode = editorInst.getReferenceNode();
        if (referenceNode instanceof this.win.HTMLElement === false) {
            throw new Error('deletereference.menuitem.reference.node.not.a.html.element');
        }
        referenceCloneNode = referenceNode.cloneNode(true);
        domFragment = win.document.createDocumentFragment();
        domFragment.appendChild(referenceCloneNode);
        context = contextualMenu.context;
        validate(contextualMenu, domFragment, context);
        this.eb.publish('ActionLog:action',
            'deleteReference', {'context': context}, domFragment.cloneNode(true)
        );
        deleteReferenceCommand.execute(domFragment, context);
    };

    DeleteReferenceMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.menuItem.setAttribute('title', 'Clear Delete Reference');
        }
        else {
            this.menuItem.setAttribute('title', 'Delete Reference');
        }
    };

    DeleteReferenceMenuItem.prototype.render = function render() {
        var tmpNode,
            win = this.win,
            doc = this.doc,
            eb = this.eb,
            instance = this,
            browserDetails = win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('deletereferencemenuitem.already.rendered');
        }
        this.deleteReferenceCommand = new DeleteReferenceCommand(eb, win, doc);
        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuItem = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }

            instance.setAction(instance.deleteReferenceCommand);
        };
        this.actionHandler.bind(this);
        this.menuItem.addEventListener('click', this.actionHandler, false);

        return this.menuItem;
    };

    DeleteReferenceMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.menuItem.removeEventListener('click', this.actionHandler, false);
        this.menuItem.innerHTML = '';
        initializeVariables(this);
    };

    return DeleteReferenceMenuItem;
});

define([
    'scripts/Helper', 'scripts/AbstractMenuItem',
    'scripts/SelectionStorage'
], function InsertEditMenuItemLoader(
    Helper, AbstractMenuItem, SelectionStorage
) {
    var template = [
        '<button title="Edit Inserted Text" class="ui-button edit_insert_menu">',
            '<span class="ui-button-text">',
                '<i class="icon-edit"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.menuItem = null;
        instance.eb = null;
        instance.doc = null;
        instance.actionHandler = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
        instance.container = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('insert.editmenuitem.not.rendered');
        }
    }

    function InsertEditMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    InsertEditMenuItem.prototype = new AbstractMenuItem();

    InsertEditMenuItem.prototype.setAction = function setAction() {
        var domFragment, context, insertNode, insertCloneNode, comntTextNode,
            content = null;

        assertRendered(this);
        domFragment = this.contextualMenu.domFragment;
        context = this.contextualMenu.context;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('insertion.menu.item.domFragment.missing');
        }

        if (context.indexOf('onInsert') !== -1) {
            insertNode = domFragment.querySelector('span.optinsert');
            insertCloneNode = insertNode.cloneNode(true);
            comntTextNode = insertCloneNode.querySelector('span.comntText');
            if (comntTextNode instanceof this.win.HTMLElement === true) {
                comntTextNode.parentNode.removeChild(comntTextNode);
            }
            content = insertCloneNode.innerHTML;
            this.eb.publish(
                'InsertPanel:OnFocus', domFragment,
                context, content
            );
        }
        this.eb.publish('ActionLog:action',
            'insert-edit', {'context': context}, domFragment.cloneNode(true)
        );
        this.eb.publish('contextMenu:hide');
    };

    InsertEditMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.container.setAttribute('title', 'Edit Inserted Text');
        }
        else {
            this.container.setAttribute('title', 'Edit Inserted Text');
        }
    };

    InsertEditMenuItem.prototype.render = function render() {
        var tmpNode,
            doc = this.doc,
            instance = this;

        if (this.isRendered === true) {
            throw new Error('insert.editmenuitem.already.rendered');
        }

        tmpNode = doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.container = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            instance.setAction();
        };
        this.actionHandler.bind(this);
        this.container.addEventListener('click', this.actionHandler, false);
        return this.container;
    };

    InsertEditMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.container.removeEventListener('click', this.actionHandler, false);
        this.container.innerHTML = '';
        initializeVariables(this);
    };

    return InsertEditMenuItem;
});

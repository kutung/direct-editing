define([
    'scripts/Helper', 'scripts/AbstractMenuItem',
    'scripts/SelectionStorage'
], function InstructEditMenuItemLoader(
    Helper, AbstractMenuItem, SelectionStorage
) {
    var template = [
        '<button title="Edit Instructed Text" class="ui-button edit_instruct_menu">',
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
            throw new Error('instruct.editmenuitem.not.rendered');
        }
    }

    function InstructEditMenuItem(eb, win, doc, rangeHelper) {
        initializeVariables(this);
        this.eb = eb;
        this.rangeHelper = rangeHelper;
        this.win = win;
        this.doc = doc;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    InstructEditMenuItem.prototype = new AbstractMenuItem();

    InstructEditMenuItem.prototype.setAction = function setAction() {
        var domFragment, context, comntTextNode,
            content = null;

        assertRendered(this);
        domFragment = this.contextualMenu.domFragment;
        context = this.contextualMenu.context;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('instruct.menu.item.domFragment.missing');
        }
        if (context.indexOf('onInstruct') !== -1) {
            comntTextNode = domFragment.querySelector('span.comntText');
            if (comntTextNode instanceof this.win.HTMLElement === true) {
                content = comntTextNode.innerHTML;
            }
            this.eb.publish('Instruct:Load', domFragment, context, content);
        }
        this.eb.publish('ActionLog:action',
            'instruct-edit', {'context': context}, domFragment.cloneNode(true)
        );
        this.eb.publish('contextMenu:hide');
    };

    InstructEditMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.container.setAttribute('title', 'Edit Instruction');
        }
        else {
            this.container.setAttribute('title', 'Edit Instruction');
        }
    };

    InstructEditMenuItem.prototype.render = function render() {
        var tmpNode,
            doc = this.doc,
            instance = this;

        if (this.isRendered === true) {
            throw new Error('instruct.editmenuitem.already.rendered');
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

    InstructEditMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.container.removeEventListener('click', this.actionHandler, false);
        this.container.innerHTML = '';
        initializeVariables(this);
    };

    return InstructEditMenuItem;
});

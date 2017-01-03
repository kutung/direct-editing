define([
    'scripts/AbstractMenuItem', 'scripts/SelectionStorage', 'scripts/Helper'
],
function InstructMenuItemLoader(
    AbstractMenuItem, SelectionStorage, Helper
) {
    var template = [
        '<button title="Instruct" class="ui-button">',
            '<span class="ui-button-text">',
                '<i class="icon-instruct"></i>',
            '</span>',
        '</button>'
    ];

    function initializeVariables(instance) {
        instance.container = null;
        instance.eb = null;
        instance.doc = null;
        instance.win = null;
        instance.actionHandler = null;
        instance.rangeHelper = null;
        instance.selectionStorage = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('instructmenuitem.not.rendered');
        }
    }

    function validateDomFragment(instance, domFragment) {
        var content, requestWrapper;

        requestWrapper = domFragment.querySelector('[data-request-id]');
        if (Helper.isNull(requestWrapper) === true) {
            instance.eb.publish('selection:reset');
            throw new Error('instructmenuitem.selection.problem');
        }
    }

    function InstructMenuItem(eb, document, Win, rangeHelper) {
        initializeVariables(this);
        this.container = null;
        this.rangeHelper = rangeHelper;
        this.eb = eb;
        this.doc = document;
        this.win = Win;
        this.selectionStorage = new SelectionStorage(
            this.win, this.eb, this.doc
        );
    }

    InstructMenuItem.prototype = new AbstractMenuItem();

    InstructMenuItem.prototype.setAction = function setAction() {
        var contextualMenu = this.contextualMenu, domFragment, context,
            content = null;

        domFragment = contextualMenu.domFragment;
        validateDomFragment(this, domFragment);
        context = contextualMenu.context;
        this.eb.publish('ActionLog:action',
            'instruct', {'context': context}, domFragment.cloneNode(true)
        );
        if (context.indexOf('onInstruct') !== -1) {
            this.eb.publish('Instruct:Clear', domFragment, context, content);
        }
        else {
            this.eb.publish('Instruct:Load', domFragment, context);
        }
        this.eb.publish('contextMenu:hide');
    };

    InstructMenuItem.prototype.setActive = function setActive(active) {
        if (active === true) {
            this.container.setAttribute('title', 'Clear Instruction');
        }
        else {
            this.container.setAttribute('title', 'Instruct');
        }
    };

    InstructMenuItem.prototype.render = function render() {
        var tmpNode,
            instance = this,
            browserDetails = instance.win.browserDetails;

        if (this.isRendered === true) {
            throw new Error('instructmenuitem.already.rendered');
        }

        tmpNode = this.doc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.container = tmpNode.firstChild;
        this.actionHandler = function actionHandler() {
            if (browserDetails.msie === true) {
                instance.selectionStorage.restoreDocSelection();
            }
            instance.setAction();
        };
        this.actionHandler.bind(this);
        this.container.addEventListener('click', this.actionHandler, false);
        this.eb.publish('InstructMenuItem:onRender', this.container);

        return this.container;
    };

    InstructMenuItem.prototype.destroy = function destroy() {
        assertRendered(this);
        this.container.removeEventListener('click', this.actionHandler, false);
        this.container.innerHTML = '';
        this.eb.publish('InstructMenuItem:onDestroy');
        initializeVariables(this);
    };

    return InstructMenuItem;
});

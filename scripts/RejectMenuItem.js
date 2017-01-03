define(['scripts/Helper', 'scripts/AbstractMenuItem', 'scripts/RejectCommand'],
    function RejectMenuItemLoader(Helper, AbstractMenuItem, RejectCommand) {
        var template = [
            '<button title="Reject" class="ui-button">',
            '<span class="ui-button-text">',
            '<i class="icon-undo"></i>',
            '</span>',
            '</button>'
        ];

        function initializeVariables(instance) {
            instance.eBus = null;
            instance.win = null;
            instance.htmlDoc = null;
            instance.isRendered = false;
            instance.container = null;
            instance.actionHandler = null;
            instance.rejectCommand = null;
            instance.rangeHelper = null;
        }

        function RejectMenuItem(eBus, win, doc, rangeHelper) {
            if (win instanceof win.Window === false) {
                throw new Error('rejectmenuitem.requires.window.object');
            }
            if (doc instanceof win.HTMLDocument === false) {
                throw new Error('rejectmenuitem.requires.htmldocument');
            }
            if (Helper.isFunction(eBus.subscribe) === false) {
                throw new Error('rejectmenuitem.eventbus.missing');
            }
            if (Helper.isFunction(eBus.publish) === false) {
                throw new Error('rejectmenuitem.eventbus.missing');
            }
            initializeVariables(this);
            this.rangeHelper = rangeHelper;
            this.eBus = eBus;
            this.win = win;
            this.htmlDoc = doc;
        }

        RejectMenuItem.prototype = new AbstractMenuItem();

        function assertRendered(instance) {
            if (instance.isRendered === false) {
                throw new Error('rejectmenuitem.not.rendered');
            }
        }

        RejectMenuItem.prototype.setAction = function setAction(rejectCommand) {
            var domFragment, context;

            assertRendered(this);
            domFragment = this.contextualMenu.domFragment;
            context = this.contextualMenu.context;
            if (domFragment instanceof this.win.DocumentFragment === false) {
                throw new Error('rejection.menu.item.domFragment.missing');
            }
            this.eBus.publish('ActionLog:action',
                'reject', {'context': context}, domFragment.cloneNode(true)
            );
            rejectCommand.execute(domFragment, context);
        };

        RejectMenuItem.prototype.setActive = function setActive(active) {
            if (active === true) {
                this.container.setAttribute('title', 'Redo');
            }
            else {
                this.container.setAttribute('title', 'Undo');
            }
        };

        RejectMenuItem.prototype.render = function render() {
            var tmpNode, instance = this;

            if (this.isRendered === true) {
                throw new Error('rejectmenuitem.already.rendered');
            }

            this.rejectCommand = new RejectCommand(this.win, this.htmlDoc, this.eBus);
            tmpNode = this.htmlDoc.createElement('span');
            tmpNode.innerHTML = template.join('');
            this.container = tmpNode.firstChild;
            this.actionHandler = function actionHandler() {
                if (instance.rangeHelper.hasSelection() === false) {
                    instance.eb.publish('selection:reset');
                    throw new Error('rejectmenuitem.no.selection');
                }
                instance.setAction(instance.rejectCommand);
            };
            this.actionHandler.bind(this);
            this.container.addEventListener('click', this.actionHandler, false);
            this.isRendered = true;

            return this.container;
        };

        RejectMenuItem.prototype.destroy = function destroy() {
            assertRendered(this);
            this.container.removeEventListener('click', this.actionHandler, false);
            this.container.innerHTML = '';
            initializeVariables(this);
        };

        return RejectMenuItem;
    });

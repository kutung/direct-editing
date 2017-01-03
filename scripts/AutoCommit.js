define(['scripts/Helper'],
function AutoCommitLoader(Helper) {
    function initializeVariables() {
        this.win = null;
        this.doc = null;
        this.eb = null;
        this.tabHandler = null;
        this.items = {};
    }

    function nodeToSkip(instance, node) {
        var actionButtonBlock = instance.doc.querySelector('.action-buttons'),
            modeButtonBlock = instance.doc.querySelector('.mode-buttons'),
            proofviewContainer = instance.doc.querySelector('.proofview'),
            skipNodes = instance.doc.querySelectorAll(
            ['[role="dialog"]', '.backdrop', '.cke_dialog_background_cover',
            '.overlay', '.contextual-menu', '.attachment']
        ),
            dialogNodeLenght = skipNodes.length,
            i = 0,
            checkNodeOnDialog = function checkNodeOnDialogFn(cnode) {
                for (; i < dialogNodeLenght; i += 1) {
                    if (skipNodes[i].contains(cnode) === true) {
                        return true;
                    }
                }
                return false;
            };

        if (instance.doc.body.contains(node) === false ||
            actionButtonBlock.contains(node) === true ||
            modeButtonBlock.contains(node) === true ||
            proofviewContainer.contains(node) === true ||
            checkNodeOnDialog(node) === true
        ) {
            return true;
        }
        return false;
    }

    function onDocumentClickFn(e) {
        var container, callback, instance,
            node = e.target,
            activePane = this.tabHandler.currentActivePane;

        if (nodeToSkip(this, node) === true) {
            return;
        }

        if (Helper.objectHasKey(this.items, activePane) === true) {
            container = this.items[activePane].container;
            callback = this.items[activePane].callback;
            instance = this.items[activePane].instance;
            if (container.contains(node) === false) {
                callback.call(instance);
            }
        }
    }

    function AutoCommit(Win, Doc, EventBus, tabHandlerInit) {
        initializeVariables.call(this);
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        this.tabHandler = tabHandlerInit;
        this.doc.addEventListener('click', onDocumentClickFn.bind(this), false);
    }

    /* Remove this function once collection saves is completed */
    AutoCommit.prototype.saveAll = function saveAllFn() {
        var key, callback, instance;

        for (key in this.items) {
            if (Helper.objectHasKey(this.items, key) === true) {
                callback = this.items[key].callback;
                instance = this.items[key].instance;
                callback.call(instance);
            }
        }
    };

    AutoCommit.prototype.addItem = function addItemFn(
        name, container, callback, instance
    ) {
        if (Helper.isEmptyString(name) === true) {
            throw new Error('auto.commit.item.name.not.string');
        }
        if (container instanceof this.win.HTMLElement === false) {
            throw new Error('auto.commit.item.container.not.element');
        }
        if (Helper.isFunction(callback) === false) {
            throw new Error('auto.commit.item.callback.not.function');
        }
        if (Helper.isObject(instance) === false) {
            throw new Error('auto.commit.item.instance.not.object');
        }

        this.items[name] = {
            'container': container,
            'callback': callback,
            'instance': instance
        };
    };

    return AutoCommit;
});

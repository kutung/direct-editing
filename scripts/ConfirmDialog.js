define(['scripts/Helper', 'scripts/Dialog', 'scripts/Util', 'scripts/ConfigReader'],
function ConfirmDialogLoader(Helper, Dialog, Util, Config) {
    var preventTemplate = [
        '<div class="prevent-error-dialog">',
            '<div class="content"></div>',
            '<div class="prevent-checkbox">',
                '<input type="checkbox"/> ',
                    '{{confirm.prevent.message}}',
            '<div>',
        '</div>'
    ],
        defaultOptions = {
            'name': 'confirm',
            'title': 'Confirm',
            'modal': true,
            'width': 350,
            'isPreventEnable': false,
            'errorKey': null,
            'okButtonName': 'OK',
            'cancelButtonName': 'Cancel',
            'okCallback': null,
            'okCallbackInstance': null,
            'cancelCallback': null,
            'cancelCallbackInstance': null
        };

    function initializeVariables(instance) {
        instance.isEnabled = true;
        instance.locale = null;
        instance.actor = null;
        instance.token = null;
    }

    function getstorageKey(instance, key) {
        return Util.encode(instance.win, instance.token + instance.actor + key);
    }

    function getPreventTemplate(instance, content) {
        var preventContainer, preventContainerContent,
            tmpNode = null;

        tmpNode = instance.doc.createElement('div');
        tmpNode.innerHTML = Helper.replaceLocaleString(
            preventTemplate.join(''), instance.locale
        );
        preventContainer = tmpNode.firstChild;
        preventContainerContent = preventContainer.querySelector('.content');
        if (Helper.isString(content) === true) {
            preventContainerContent.appendChild(
                instance.doc.createTextNode(content)
            );
        }
        else if (content instanceof instance.win.HTMLElement === true) {
            preventContainerContent.appendChild(content);
        }
        return preventContainer;
    }

    function ConfirmDialog(Win, Doc, EventBus, token, actor) {
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        initializeVariables(this);
        this.locale = Config.getLocale();
        this.actor = actor;
        this.token = token;
        this.eb.subscribe('confirm:show', this.show, this);
    }

    function checkConfirmAlreadyShow(options) {
        var dialog = this.doc.querySelector(
            'dialog[data-name="' + options.name + '"]'
        );

        if (Helper.isNull(dialog) === false) {
            return true;
        }
        return false;
    }

    ConfirmDialog.prototype.show = function show(content, options) {
        var dialog, storageKey, checkBox, callBack, callBackInstance;

        if (this.isEnabled === false) {
            return;
        }
        options = options || {};
        options = Object.assign({}, defaultOptions, options);
        if (checkConfirmAlreadyShow.call(this, options) === true) {
            return;
        }
        if (options.isPreventEnable === true) {
            storageKey = getstorageKey(this, options.errorKey);
            callBack = options.okCallback;
            callBackInstance = options.okCallbackInstance;
            if (this.win.sessionStorage.getItem(storageKey) === 'true') {
                callBack.call(callBackInstance);
                return;
            }
            options.width = 425;
            content = getPreventTemplate(this, content);
            checkBox = content.querySelector('input[type="checkbox"]');
            options.okCallbackInstance = this;
            options.okCallback = function callbackFn() {
                if (options.isPreventEnable === true && checkBox.checked === true) {
                    this.win.sessionStorage.setItem(storageKey, 'true');
                }
                if (Helper.isFunction(options.okCallback) === true) {
                    callBack.call(callBackInstance);
                }
            };
        }
        dialog = new Dialog(this.doc, this.win, this.eb, this.locale);
        dialog.setName(options.name);
        dialog.setTitle(options.title);
        dialog.setModal(options.modal);
        dialog.setWidth(options.width);
        dialog.setContent(content);
        dialog.showButtons(['ok', 'cancel']);
        dialog.setButtonText('ok', options.okButtonName);
        dialog.setButtonText('cancel', options.cancelButtonName);
        if (Helper.isFunction(options.okCallback) === true) {
            dialog.setOkCallback(options.okCallbackInstance, options.okCallback);
        }
        if (Helper.isFunction(options.cancelCallback) === true) {
            dialog.setCancelCallback(
                options.cancelCallbackInstance, options.cancelCallback
            );
        }
        dialog.renderComponentStyle();
        dialog.render();
    };

    ConfirmDialog.prototype.setEnabled = function setEnabledFn(enable) {
        if (enable === true) {
            this.isEnabled = enable;
        }
    };

    ConfirmDialog.prototype.destroy = function destroy() {
        this.eb.unsubscribe('confirm:show', this.show, this);
        initializeVariables(this);
    };
    return ConfirmDialog;
});

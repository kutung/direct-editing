define(['scripts/Helper', 'scripts/Dialog', 'scripts/Util', 'scripts/ConfigReader'],
function AlertDialogLoader(Helper, Dialog, Util, Config) {
    var preventTemplate = [
        '<div class="prevent-error-dialog">',
            '<div class="content"></div>',
            '<div class="prevent-checkbox">',
                '<input type="checkbox"/> ',
                    '{{alert.prevent.message}}',
            '<div>',
        '</div>'
    ],
        defaultOptions = {
            'name': 'alert',
            'title': 'Alert',
            'modal': true,
            'width': 350,
            'showCloseButton': true,
            'isPreventEnable': false,
            'errorKey': null,
            'buttonName': 'OK',
            'callback': null,
            'callbackInstance': null
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

    function AlertDialog(Win, Doc, EventBus, token, actor) {
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        initializeVariables(this);
        this.locale = Config.getLocale();
        this.actor = actor;
        this.token = token;
        this.eb.subscribe('alert:show', this.show, this);
    }

    function checkAlertAlreadyShow(options) {
        var dialog = this.doc.querySelector(
            'dialog[data-name="' + options.name + '"]'
        );

        if (Helper.isNull(dialog) === false) {
            return true;
        }
        return false;
    }

    AlertDialog.prototype.show = function show(content, options) {
        var dialog, storageKey, checkBox;

        if (this.isEnabled === false) {
            return;
        }
        options = options || {};
        options = Object.assign({}, defaultOptions, options);
        if (checkAlertAlreadyShow.call(this, options) === true) {
            return;
        }
        if (options.isPreventEnable === true) {
            storageKey = getstorageKey(this, options.errorKey);
            if (this.win.sessionStorage.getItem(storageKey) === 'true') {
                return;
            }
            options.width = 425;
            content = getPreventTemplate(this, content);
            checkBox = content.querySelector('input[type="checkbox"]');
            options.callbackInstance = this;
            options.callback = function callbackFn() {
                if (options.isPreventEnable === true && checkBox.checked === true) {
                    this.win.sessionStorage.setItem(storageKey, 'true');
                }
            };
        }
        dialog = new Dialog(this.doc, this.win, this.eb, this.locale);
        dialog.setName(options.name);
        dialog.setTitle(options.title);
        dialog.setModal(options.modal);
        dialog.setWidth(options.width);
        dialog.setContent(content);
        if (options.showCloseButton === true) {
            dialog.showClose();
        }
        dialog.showButtons(['ok']);
        dialog.setButtonText('ok', options.buttonName);
        if (Helper.isFunction(options.callback) === true) {
            dialog.setOkCallback(options.callbackInstance, options.callback);
        }
        dialog.renderComponentStyle();
        dialog.render();
    };

    AlertDialog.prototype.setEnabled = function setEnabledFn(enable) {
        if (enable === true) {
            this.isEnabled = enable;
        }
    };

    AlertDialog.prototype.destroy = function destroy() {
        this.eb.unsubscribe('alert:show', this.show, this);
        initializeVariables(this);
    };
    return AlertDialog;
});

/*
    http://demo.agektmr.com/dialog/
*/
/* global dialogPolyfill, define */
define(['scripts/Helper', 'scripts/polyfills/dialog'],
function dialogLoader(Helper, dialogPolyfill) {
    var dialogTemplate = [
            '<aside class="dialog-wrapper">',
                '<div class="dialog-overlay"></div>',
                '<header class="clearfix">',
                    '<h2 class="heading"></h2>',
                    '<div class="close" title="{{dialog.close.button.aria.label}}" ',
                        'role="button" aria-label="{{dialog.close.button.hover.instruction}}">x</div>',
                '</header>',
                '<section class="content"></section>',
                '<footer class="footer">',
                    '<button class="yes button" role="button"></button>',
                    '<button class="no button" role="button"></button>',
                    '<button class="ok button" role="button"></button>',
                    '<button class="cancel button" role="button"></button>',
                '</footer>',
            '</aside>'
        ],
        cssRules = {
            'dialog[role="dialog"]': {
                'background': 'none',
                'border': 'none'
            },
            'dialog[role="dialog"][open]': {
                '-webkit-box-sizing': 'content-box',
                '-moz-box-sizing': 'content-box',
                'box-sizing': 'content-box'
            },
            'dialog[role="dialog"] .clearfix:before, dialog[role="dialog"] .clearfix:after': {
                'content': '"\\' + '0020"',
                'display': 'block',
                'overflow': 'hidden',
                'visibility': 'hidden',
                'width': '0',
                'height': '0'
            },
            'dialog[role="dialog"] .clearfix:after': {
                'clear': 'both'
            },
            'dialog[role="dialog"] .clearfix': {
                'zoom': '1'
            },
            '.dialog-wrapper': {
                'position': 'relative',
                'background': '#fff',
                'box-shadow': '0 3px 7px rgba(0,0,0,.25)'
            },
            '.dialog-wrapper .close[role="button"]': {
                'float': 'right',
                'padding': '.3em .6em',
                'background': '#CA5142',
                'color': '#FFF',
                'font-size': '1.5em',
                'font-weight': 'bold',
                'cursor': 'pointer',
                '-ms-user-select': 'none',
                '-moz-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none'
            },
            '.dialog-wrapper .close.hide[role="button"]': {
                'display': 'none'
            },
            '.dialog-wrapper section': {
                'font-size': '1.2em',
                'line-height': '1.4em'
            },
            '.dialog-wrapper header, .dialog-wrapper footer': {
                'background': '#f7f7f7',
                'border-bottom': '1px solid #e7e7e7'
            },
            '.dialog-wrapper section, .dialog-wrapper header': {
                'padding': '1em 1.5em',
                'clear': 'both',
                'text-align': 'justify'
            },
            '.dialog-wrapper h2': {
                'font-size': '2em',
                'line-height': '1em',
                'float': 'left',
                'margin': '0'
            },
            '.dialog-wrapper footer': {
                'border': 'none',
                'border-top': '1px solid #e7e7e7',
                'padding': '1em',
                'text-align': 'right',
                'display': 'none'
            },
            '.dialog-wrapper footer.show': {
                'display': 'block'
            },
            '.dialog-wrapper footer .button[role="button"]': {
                'display': 'none',
                'font-size': '1.2em',
                'margin-right': '1em',
                'padding': '.5em 1em'
            },
            '.dialog-wrapper footer .button.show[role="button"]': {
                'display': 'inline'
            },
            '.dialog-wrapper footer .cancel.button[role="button"], .dialog-wrapper footer .no.button[role="button"]': {
                'background-color': '#CA5142',
                'border': '1px solid #CA5142',
                'font-weight': 'bold',
                'color': '#FFF'
            },
            '.dialog-wrapper footer .ok.button[role="button"], .dialog-wrapper footer .yes.button[role="button"]': {
                'background-color': '#47a447',
                'border': '1px solid #47a447',
                'font-weight': 'bold',
                'color': '#FFF'
            },
            '.dialog-wrapper .dialog-overlay': {
                'display': 'none',
                'position': 'absolute',
                'z-index': '999',
                'background': 'url("../images/ajax-loader.gif") no-repeat center center #aaaaaa',
                'opacity': '0.6'
            }
        };

    function randId() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'dialog-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.element = null;
        instance.eventBus = null;
        instance.doc = null;
        instance.win = null;
        instance.dialog = null;
        instance.overlay = null;
        instance.modal = true;
        instance.name = null;
        instance.headerElem = null;
        instance.contentElem = null;
        instance.footerElem = null;
        instance.yesBtnText = 'Yes';
        instance.noBtnText = 'No';
        instance.cancelBtnText = 'Cancel';
        instance.okBtnText = 'Ok';
        instance.yesBtn = null;
        instance.noBtn = null;
        instance.cancelBtn = null;
        instance.okBtn = null;
        instance.closeBtn = null;
        instance.buttonsToShow = [];
        instance.onCloseFn = null;
        instance.onCancelFn = null;
        instance.onYesFn = null;
        instance.onNoFn = null;
        instance.onOkFn = null;
        instance.showCloseBtn = false;
        instance.width = null;
        instance.destroyed = false;
        instance.closeCallbackInstance = null;
        instance.closeCallback = null;
        instance.yesCallbackInstance = null;
        instance.yesCallback = null;
        instance.noCallbackInstance = null;
        instance.noCallback = null;
        instance.cancelCallbackInstance = null;
        instance.cancelCallback = null;
        instance.okCallbackInstance = null;
        instance.okCallback = null;
        instance.dialogPrefix = randId();
        instance.locale = {};
        instance.backDrop = null;
        instance.dialogZIndex = 100001;
        instance.backDropZIndex = 100002;
    }

    function Dialog(Document, Window, EventBus, locale) {
        initializeVariables(this);
        this.eventBus = EventBus;
        this.doc = Document;
        this.win = Window;
        this.dialog = this.doc.createElement('dialog');
        if (typeof locale === 'object') {
            this.locale = locale;
        }
        EventBus.subscribe('Dialog:Close', this.closeDialog, this);
    }

    Dialog.prototype.closeDialog = function closeDialog() {
        this.dialog.close();
        this.eventBus.publish('dialog:' + this.name + ':close');
        this.destroy();
    };

    Dialog.prototype.setModal = function setModal(modal) {
        this.modal = modal === true;
    };

    Dialog.prototype.showButtons = function showButtons(buttons) {
        var instance = this;

        ['yes', 'no', 'cancel', 'ok'].forEach(function eachBtn(type) {
            if (buttons.indexOf(type) !== -1) {
                instance.buttonsToShow.push(type);
            }
        });
    };

    Dialog.prototype.setTitle = function setTitle(title) {
        this.title = title;
    };

    Dialog.prototype.setName = function setName(name) {
        this.name = name;
    };

    Dialog.prototype.setContent = function setContent(content) {
        this.content = content;
    };

    Dialog.prototype.setButtonText = function setButtonText(btn, text) {
        switch (btn) {
        case 'yes':
            this.yesBtnText = text;
            break;
        case 'no':
            this.noBtnText = text;
            break;
        case 'cancel':
            this.cancelBtnText = text;
            break;
        case 'ok':
            this.okBtnText = text;
            break;
        default:
            break;
        }
    };

    Dialog.prototype.setCloseCallback = function setCloseCallback(
        closeCallbackInstance, closeCallback
    ) {
        if (Helper.isFunction(closeCallback) === false) {
            throw new Error('dialog.callback.not.function');
        }
        this.closeCallbackInstance = closeCallbackInstance;
        this.closeCallback = closeCallback;
    };

    Dialog.prototype.setYesCallback = function setYesCallback(
        yesCallbackInstance, yesCallback
    ) {
        if (Helper.isFunction(yesCallback) === false) {
            throw new Error('dialog.callback.not.function');
        }
        this.yesCallbackInstance = yesCallbackInstance;
        this.yesCallback = yesCallback;
    };

    Dialog.prototype.setNoCallback = function setNoCallback(
        noCallbackInstance, noCallback
    ) {
        if (Helper.isFunction(noCallback) === false) {
            throw new Error('dialog.callback.not.function');
        }
        this.noCallbackInstance = noCallbackInstance;
        this.noCallback = noCallback;
    };

    Dialog.prototype.setCancelCallback = function setCancelCallback(
        cancelCallbackInstance, cancelCallback
    ) {
        if (Helper.isFunction(cancelCallback) === false) {
            throw new Error('dialog.callback.not.function');
        }
        this.cancelCallbackInstance = cancelCallbackInstance;
        this.cancelCallback = cancelCallback;
    };

    Dialog.prototype.setOkCallback = function setOkCallback(
        okCallbackInstance, okCallback
    ) {
        if (Helper.isFunction(okCallback) === false) {
            throw new Error('dialog.callback.not.function');
        }
        this.okCallbackInstance = okCallbackInstance;
        this.okCallback = okCallback;
    };

    Dialog.prototype.setEnabled = function setEnabled(enable) {
        var rect, style = this.overlay.style,
            disabled = this.dialog.getAttribute('aria-disabled');

        if (enable === false) {
            rect = this.element.getBoundingClientRect();
            style.display = 'block';
            style.top = '0px';
            style.left = '0px';
            style.height = rect.height + 'px';
            style.width = rect.width + 'px';
            if (disabled === null || disabled === 'false') {
                this.dialog.setAttribute('aria-disabled', 'true');
            }
        }
        else {
            style.display = 'none';
            this.dialog.removeAttribute('aria-disabled');
        }
        this.enabled = enable;
    };

    Dialog.prototype.showClose = function showClose() {
        this.showCloseBtn = true;
    };

    Dialog.prototype.setWidth = function setWidth(width) {
        this.width = width;
    };

    Dialog.prototype.setAriaLabelForButtons = function setAriaLabelForButtons() {
        this.cancelBtn.setAttribute('aria-label', this.cancelBtnText);
        this.yesBtn.setAttribute('aria-label', this.yesBtnText);
        this.noBtn.setAttribute('aria-label', this.noBtnText);
        this.okBtn.setAttribute('aria-label', this.okBtnText);
    };

    Dialog.prototype.reposition = function repositionFn() {
        var scrollTop = this.doc.body.scrollTop || this.doc.documentElement.scrollTop,
            topValue = scrollTop + ((this.win.innerHeight - this.dialog.offsetHeight) / 2);

        this.dialog.style.top = Math.max(scrollTop, topValue) + 'px';
    };

    Dialog.prototype.applyBackDrop = function applyBackDropFn() {
        this.backDrop = this.doc.createElement('div');
        this.backDrop.classList.add('backdrop');
        this.backDrop.style.zIndex = this.dialogZIndex;
        this.dialog.style.zIndex = this.backDropZIndex;
        this.dialog.parentNode.insertBefore(this.backDrop, this.dialog.nextSibling);
    };

    Dialog.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.doc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    Dialog.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    Dialog.prototype.render = function render() {
        var showFooter = false,
            qs = this.dialog.querySelector.bind(this.dialog),
            styleSheet = this.doc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = this.doc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.doc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        if (this.name === null) {
            throw new Error('dialog.name.empty');
        }

        if (typeof HTMLDialogElement !== 'function') {
            dialogPolyfill.registerDialog(this.dialog);
        }

        this.dialog.innerHTML = Helper.replaceLocaleString(
            dialogTemplate.join(''), this.locale
        );
        this.element = this.dialog.firstChild;
        this.dialog.style.width = this.width + 'px';
        this.dialog.dataset.name = this.name;
        this.dialog.classList.add(this.name);
        this.dialog.setAttribute('role', 'dialog');
        this.dialog.setAttribute('aria-labelledby', this.dialogPrefix + '-' + 'title');
        this.headerElem = qs('.dialog-wrapper header h2');
        this.headerElem.id = this.dialogPrefix + '-' + 'title';
        this.overlay = qs('.dialog-wrapper .dialog-overlay');
        this.contentElem = qs('.dialog-wrapper .content');
        this.contentElem.id = this.dialogPrefix + '-' + 'content';
        this.dialog.setAttribute('aria-describedby', this.contentElem.id);
        this.footerElem = qs('.dialog-wrapper .footer');
        this.closeBtn = qs('.dialog-wrapper .close');
        this.okBtn = qs('.dialog-wrapper .footer .ok.button');
        this.cancelBtn = qs('.dialog-wrapper .footer .cancel.button');
        this.yesBtn = qs('.dialog-wrapper .footer .yes.button');
        this.noBtn = qs('.dialog-wrapper .footer .no.button');
        this.cancelBtn.appendChild(this.doc.createTextNode(this.cancelBtnText));
        this.cancelBtn.setAttribute('title', this.cancelBtnText);
        this.yesBtn.appendChild(this.doc.createTextNode(this.yesBtnText));
        this.yesBtn.setAttribute('title', this.yesBtnText);
        this.noBtn.appendChild(this.doc.createTextNode(this.noBtnText));
        this.noBtn.setAttribute('title', this.noBtnText);
        this.okBtn.appendChild(this.doc.createTextNode(this.okBtnText));
        this.okBtn.setAttribute('title', this.okBtnText);
        this.setAriaLabelForButtons();
        this.buttonsToShow.forEach(function eachBtn(type) {
            var btn = qs('.dialog-wrapper .footer .' + type + '.button');

            if (btn !== null) {
                btn.classList.add('show');
                showFooter = true;
            }
        });
        this.doc.body.appendChild(this.dialog);
        if (showFooter === true) {
            this.footerElem.classList.add('show');
        }
        if (this.showCloseBtn === false) {
            this.closeBtn.classList.add('hide');
        }
        this.headerElem.appendChild(this.doc.createTextNode(this.title));
        if (typeof this.content === 'string') {
            this.contentElem.appendChild(this.doc.createTextNode(this.content));
        }
        else if (this.content instanceof this.win.HTMLElement === true) {
            this.contentElem.appendChild(this.content);
        }
        else {
            throw new Error('invalid.dialog.content');
        }
        this.onCloseFn = function onClose() {
            if (this.closeCallback !== null) {
                this.closeCallback.call(this.closeCallbackInstance, this);
                return;
            }
            if (this.dialog.hasAttribute('open') === true) {
                this.dialog.close();
            }
            this.eventBus.publish('dialog:' + this.name + ':close');
            this.destroy();
        };
        this.onCloseFn = this.onCloseFn.bind(this);
        this.onCancelFn = function onCancel() {
            if (this.cancelCallback !== null) {
                this.cancelCallback.call(this.cancelCallbackInstance);
            }
            this.eventBus.publish('dialog:' + this.name + ':cancel');
            this.dialog.close();
            this.destroy();
        };
        this.onCancelFn = this.onCancelFn.bind(this);
        this.onYesFn = function onYes() {
            if (this.yesCallback !== null) {
                this.yesCallback.call(this.yesCallbackInstance);
            }
            this.eventBus.publish('dialog:' + this.name + ':yes');
            this.dialog.close();
            this.destroy();
        };
        this.onYesFn = this.onYesFn.bind(this);
        this.onNoFn = function onNo() {
            if (this.noCallback !== null) {
                this.noCallback.call(this.noCallbackInstance);
            }
            this.eventBus.publish('dialog:' + this.name + ':no');
            this.dialog.close();
            this.destroy();
        };
        this.onNoFn = this.onNoFn.bind(this);
        this.onOkFn = function onOk() {
            if (this.okCallback !== null) {
                this.okCallback.call(this.okCallbackInstance);
            }
            this.eventBus.publish('dialog:' + this.name + ':ok');
            this.dialog.close();
            this.destroy();
        };
        this.onOkFn = this.onOkFn.bind(this);
        this.dialog.addEventListener('cancel', this.onCancelFn, false);
        this.closeBtn.addEventListener('click', this.onCloseFn, false);
        this.yesBtn.addEventListener('click', this.onYesFn, false);
        this.noBtn.addEventListener('click', this.onNoFn, false);
        this.okBtn.addEventListener('click', this.onOkFn, false);
        this.cancelBtn.addEventListener('click', this.onCancelFn, false);
        this.dialog.show();
        if (this.modal === true) {
            this.reposition();
            this.applyBackDrop();
        }
    };

    Dialog.prototype.destroy = function destroy() {
        if (this.destroyed === true) {
            return;
        }
        this.eventBus.unsubscribe('Dialog:Close', this.closeDialog);
        this.dialog.removeEventListener('cancel', this.onCancelFn, false);
        this.closeBtn.removeEventListener('click', this.onCloseFn, false);
        this.yesBtn.removeEventListener('click', this.onYesFn, false);
        this.noBtn.removeEventListener('click', this.onNoFn, false);
        this.okBtn.removeEventListener('click', this.onOkFn, false);
        this.cancelBtn.removeEventListener('click', this.onCancelFn, false);
        if (Helper.isNull(this.backDrop) === false) {
            this.backDrop.parentNode.removeChild(this.backDrop);
        }
        this.doc.body.removeChild(this.dialog);
        initializeVariables(this);
        this.destroyed = true;
    };

    return Dialog;
});

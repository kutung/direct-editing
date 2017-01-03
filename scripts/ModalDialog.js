define([], function ModalDialogLoader() {
    var dialogTemplate = [
          '<div class="dialog proof-equ-dialog eqnDialog">',
            '<div class="title">',
              '<h2></h2>',
              '<a class="close-button"></a>',
            '</div>',
            '<div class="content"></div>',
            '<div class="footer"></div>',
          '</div>'
    ];

    function initializeVariables(instance) {
        instance.container = null;
        instance.eventBus = null;
        instance.closeCallback = null;
        instance.callbackInst = null;
        instance.doc = null;
        instance.win = null;
        instance.title = null;
        instance.content = null;
        instance.footer = null;
        instance.headerElem = null;
        instance.footerElem = null;
        instance.contentElem = null;
        instance.dialogElem = null;
        instance.closeBtn = null;
        instance.isModal = null;
    }

    function closeDialog() {
        if (this.callbackInst !== null) {
            this.closeCallback.call(this.callbackInst, this);
            return;
        }
        this.closeBox();
    }

    function closeDialogWithoutCallback() {
        this.closeBox();
    }

    function ModalDialog(Container, Document, Window, EventBus) {
        initializeVariables(this);
        this.container = Container;
        this.eventBus = EventBus;
        this.doc = Document;
        this.win = Window;
        this.eventBus.subscribe('Dialog:OnClose', closeDialog.bind(this));
        this.eventBus.subscribe(
            'Dialog:Force:OnClose', closeDialogWithoutCallback.bind(this)
        );
    }

    ModalDialog.prototype.closeBox = function closeBox() {
        var classList = this.dialogElem.classList;

        this.eventBus.publish('Loader:hide');
        classList.add('hide');
        classList.remove('show');
        classList.remove('small');
    };

    ModalDialog.prototype.setCloseCallback = function setCloseCallback(
        callbackInst, callback
    ) {
        this.callbackInst = callbackInst;
        this.closeCallback = callback;
    };

    ModalDialog.prototype.setIsModal = function setIsModal(value) {
        this.isModal = value;
    };

    //FIXME: Validation
    ModalDialog.prototype.setTitle = function setTitle(title) {
        this.title = title;
    };

    //FIXME: Validation
    ModalDialog.prototype.setContent = function setContent(content) {
        this.content = content;
    };

    //FIXME: Validation
    ModalDialog.prototype.setFooter = function setFooter(footer) {
        this.footer = footer;
    };

    ModalDialog.prototype.render = function render() {
        var qs = this.container.querySelector.bind(this.container);

        this.eventBus.publish('Loader:show');
        this.container.innerHTML = dialogTemplate.join('');
        this.dialogElem = qs('.dialog');
        if (this.isModal === true) {
            this.dialogElem.classList.add('small');
        }
        this.headerElem = qs('.dialog .title h2');
        this.contentElem = qs('.dialog .content');
        this.footerElem = qs('.dialog .footer');
        this.closeBtn = qs('.dialog .title .close-button');
        this.headerElem.appendChild(this.doc.createTextNode(this.title));
        if (this.footer !== null) {
            this.footerElem.appendChild(this.footer);
        }
        this.contentElem.appendChild(this.content);
        this.closeFn = closeDialog.bind(this);
        this.closeBtn.addEventListener('click', this.closeFn, false);
    };

    //FIXME: ???
    ModalDialog.prototype.destroy = function destroy() {
        this.closeBtn.removeEventListener('click', this.closeFn, false);
        initializeVariables(this);
    };

    return ModalDialog;
});

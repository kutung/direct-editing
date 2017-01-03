define(['scripts/Helper', 'scripts/DialogPopupPanel'],
function BootstrapDialogLoader(Helper, Dialog) {
    var dialog,
        template = [
            '<div class="bootstrap-dialog">',
                '<ul class="bootstrap-dialog-instruction">',
                    '<li>',
                    'Formatting (reference style) and layout (page breaks, table layout, and placement of tables and figures) are for proofing purposes only and will be optimized for publication in the final version.',
                    '</li>',
                    '<li>',
                        'Please note "Proof mode" automatically paginates your proof and any pagination errors you notice in your proof will be corrected in the final publication.',
                    '</li>',
                '</ul>',
                '<div class="bootstrap-dialog-footer">',
                    '<button class="continue"> Continue </button>',
                '</div>',
            '</div>'
        ];

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('manuscriptUpload.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.parentcontainer = null;
        instance.dialogContainer = null;
        instance.continueBtn = null;
        instance.isRendered = false;
    }

    function BootstrapDialog(Win, Doc, EventBus, container) {
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        initializeVariables(this);
        this.parentcontainer = container;
    }

    BootstrapDialog.prototype.show = function show() {
        var instance = this;

        assertRendered(this);
        this.eb.publish('Loader:show');
        dialog = new Dialog(this.parentcontainer, this.doc, this.win, this.eb);
        dialog.setTitle('Note');
        dialog.setContent(this.dialogContainer);
        this.continueBtn.addEventListener('click', function clickFn() {
            dialog.destroy();
            instance.parentcontainer.parentNode.removeChild(instance.parentcontainer);
            instance.eb.publish('Loader:hide');
        }, false);
        dialog.render();
        setTimeout(function focusFn() {
            instance.continueBtn.focus();
        }, 1500);
    };

    BootstrapDialog.prototype.setMetaData = function setMetaData(data) {
        if (Helper.isUndefined(data) === true) {
            throw new Error('bootstrap-dialog.metadata.undefined');
        }
        if (Helper.isObject(data) === false) {
            throw new Error('bootstrap-dialog.metadata.not.object');
        }
        this.metaData = data;
    };

    BootstrapDialog.prototype.render = function render() {
        var qs,
            tmpNode = null;

        tmpNode = this.doc.createElement('div');
        tmpNode.innerHTML = template.join('');
        this.dialogContainer = tmpNode.firstChild;
        qs = this.dialogContainer.querySelector.bind(this.dialogContainer);
        this.continueBtn = qs('.continue');
        this.isRendered = true;
    };

    BootstrapDialog.prototype.destroy = function destroy() {
        initializeVariables(this);
    };
    return BootstrapDialog;
});

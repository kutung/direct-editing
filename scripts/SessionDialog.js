define(['scripts/Helper', 'scripts/EventBus'], function SessionDialogLoader(
    Helper, EventBus
) {
    function validateInput(sessionLandingPageLink, sessionMessage) {
        if (Helper.isUndefined(sessionLandingPageLink) === true) {
            throw new Error('error.SessionLandingPageLink');
        }

        if (Helper.isUndefined(sessionMessage) === true) {
            throw new Error('error.sessionMessage');
        }
    }

    function SessionDialog(
        Win, Doc, Token, sessionLandingPageLink, DialogPopUp, sessionMessage
    ) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        this.dialogPopUp = DialogPopUp;
        this.sessionLandingPageLink = sessionLandingPageLink;
        this.sessionMessage = sessionMessage;
        validateInput(sessionLandingPageLink, sessionMessage);
    }

    function getContent(instance) {
        var para,
            doc = instance.doc,
            dialogPanel = instance.dialogPopUp,
            elem = doc.createElement('div'),
            child = null;

        elem.className = 'session-invalid-content';
        child = doc.createElement('a');
        para = doc.createElement('p');
        para.innerHTML = instance.sessionMessage;
        child.href = instance.sessionLandingPageLink;
        child.target = '_blank';
        child.className = 'session-LandingPageLink';
        child.innerHTML = instance.sessionLandingPageLink;

        child.addEventListener('click', function onclick() {
            EventBus.publish('SessionDialog:Trigger');
            window.open(child.href);
            dialogPanel.closeBox();
        }.bind(instance), false);

        //para.appendChild(child);
        elem.appendChild(para);

        return elem;
    }

    function getFooter(instance) {
        var closeBtn,
            doc = instance.doc;

        closeBtn = doc.createElement('input');
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('value', 'Close');
        closeBtn.setAttribute('class', 'closeBtn');
        return closeBtn;
    }

    function renderDialog(instance) {
        var closeBtn,
            dialogPanel = instance.dialogPopUp,
            sessionLandingPageLink = instance.sessionLandingPageLink,
            sessionMessage = getContent(instance);

        dialogPanel.setTitle('Note');
        dialogPanel.setContent(sessionMessage);
        dialogPanel.setIsModal(true);
        closeBtn = getFooter(instance);
        closeBtn.addEventListener('click', function closeEvent() {
            dialogPanel.closeBox();
            window.location.replace(sessionLandingPageLink);
            //window.open(sessionLandingPageLink);
        });
        dialogPanel.setFooter(closeBtn);
        dialogPanel.render();
    }

    SessionDialog.prototype.render = function render() {
        var instance = this;

        renderDialog(instance);
    };

    return SessionDialog;
});

define(['scripts/EventBus'], function SurveyHandlerLoader(EventBus) {
    var surveyText = [
        'Thank you for returning your proof corrections.',
        'Please would you take a few moments to complete this survey: ',
        '<a class="surveyLink" target="_blank"></a>'
    ];

    function SurveyHandler(Win, Doc, Token, DialogPopUp) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        this.dialogPopUp = DialogPopUp;
    }

    function getContent(surveyText, surveyLink, instance) {
        var text = surveyText.join('\n'),
            token = instance.token,
            doc = instance.doc,
            surveyElem,
            elem = doc.createElement('div');

        elem.innerHTML = text;
        surveyElem = elem.querySelector('.surveyLink');
        surveyElem.setAttribute('href', surveyLink + '?c=' + token);
        surveyElem.innerHTML = surveyLink;
        elem.appendChild(surveyElem);
        surveyElem.addEventListener('click', function onclick() {
            EventBus.publish('Survey:Trigger');
        });
        return elem;
    }

    function getFooter(instance) {
        var closeBtn,
            doc = instance.doc;

        closeBtn = doc.createElement('input');
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('value', 'No Thanks');
        closeBtn.setAttribute('class', 'noThanksBtn');
        closeBtn.addEventListener('click', function onclick() {
            EventBus.publish('Survey:Close');
        });
        return closeBtn;
    }

    SurveyHandler.prototype.render = function render(surveyLink) {
        var dialogPanel = this.dialogPopUp;

        dialogPanel.setTitle('Survey');
        dialogPanel.setContent(getContent(surveyText, surveyLink, this));
        dialogPanel.setFooter(getFooter(this));
        dialogPanel.setIsModal(true);
        dialogPanel.render();
    };

    return SurveyHandler;
});

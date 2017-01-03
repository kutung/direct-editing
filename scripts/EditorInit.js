define([
    'scripts/EventBus', 'scripts/RangeHelper', 'scripts/FragmentSniffer',
    'scripts/RequestQueue', 'scripts/RequestBuilder', 'scripts/ConfigReader',
    'scripts/Editor', 'scripts/Helper'
], function EditorInitLoader(
    EventBus, RangeHelper, FragmentSniffer, RequestQueue, RequestBuilder, Config, Editor,
    Helper
) {
    var editInst;

    function EditorInit(Win, Doc, HtmlSaveQueue, CurrentActor) {
        this.win = Win;
        this.doc = Doc;
        this.requestBuilder = new RequestBuilder();
        this.htmlSaveQueue = HtmlSaveQueue;
        this.parentContainer = this.doc.querySelector('.container');
        this.tabPanelInstance = null;
        this.currentActor = CurrentActor;
    }

    function checkSaveQueueOnUnload(queue, instance) {
        instance.win.addEventListener('beforeunload', function unload(e) {
            var confirmationMessage = '';

            if (queue.getQueueCount() > 0) {
                confirmationMessage = Config.getLocaleByKey(
                    'article.changes.not.saved'
                );
                e.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        });
        return;
    }

    EditorInit.prototype.load = function load(articleHtml) {
        if (Helper.isEmptyString(articleHtml)) {
            throw new Error('error.articleHtml_empty');
        }
        editInst.render(articleHtml);
        checkSaveQueueOnUnload(this.htmlSaveQueue, this);
    };

    EditorInit.prototype.initiate = function initiate(
        articleContainer, articleToken
    ) {
        var win = this.win,
            doc = this.doc,
            htmlSaveQueue = this.htmlSaveQueue,
            rangeHelper = new RangeHelper(),
            fragmentSniffer = new FragmentSniffer(win),
            requestBuilder = new RequestBuilder();

        editInst = new Editor(
            articleContainer, EventBus, rangeHelper, fragmentSniffer, win,
            doc, htmlSaveQueue, requestBuilder,
            Config.saveEndPoint, Config.submitEndPoint, articleToken,
            this.currentActor
        );
        return editInst;
    };

    EditorInit.prototype.isLoaded = function isLoaded(articleContainer) {
        if (articleContainer.innerHTML === '') {
            return false;
        }
        return true;
    };

    return EditorInit;
});

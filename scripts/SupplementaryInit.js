define([
    'scripts/EventBus', 'scripts/RangeHelper', 'scripts/FragmentSniffer',
    'scripts/RequestQueue', 'scripts/RequestBuilder', 'scripts/ConfigReader',
    'scripts/Supplementary'
], function SupplementaryInitLoader(
    EventBus, RangeHelper, FragmentSniffer, RequestQueue, RequestBuilder, Config,
    Supplementary
) {
    var suppInst,
        supplementaryTags = ['#extended1', '#extended2', '#ga', '#supplfile', '#supplementary'];

    function SupplementaryInit(Win, Doc, ArticleContainer) {
        this.win = Win;
        this.doc = Doc;
        this.articleContainer = ArticleContainer;
        this.requestBuilder = new RequestBuilder();
        this.htmlSaveQueue = new RequestQueue();
        this.parentContainer = document.querySelector('.container');
    }

    SupplementaryInit.prototype.hasSupplementary = function hasSupplementary() {
        var len,
            i = 0, hasChild = false,
            supplementaryNodes = this.articleContainer.querySelectorAll(
                supplementaryTags.join(', ')
            );

        len = supplementaryNodes.length;
        for (; i < len; i += 1) {
            if (supplementaryNodes[i].hasChildNodes() === true) {
                hasChild = true;
                break;
            }
        }
        if (len <= 0 || hasChild === false) {
            return false;
        }
        return true;
    };

    SupplementaryInit.prototype.load = function load() {
        var tempWrapper, len,
            i = 0, hasChild = false,
            supplementaryNodes = this.articleContainer.querySelectorAll(
                supplementaryTags.join(', ')
            );

        len = supplementaryNodes.length;
        for (; i < len; i += 1) {
            if (supplementaryNodes[i].hasChildNodes() === true) {
                hasChild = true;
                break;
            }
        }
        if (len <= 0 || hasChild === false) {
            return;
        }
        tempWrapper = this.doc.createElement('div');
        for (i = 0; i < len; i += 1) {
            tempWrapper.appendChild(supplementaryNodes[i]);
        }
        suppInst.render(tempWrapper.innerHTML);
    };

    SupplementaryInit.prototype.initiate = function initiate(
        supplementaryContainer, articleToken
    ) {
        var win = this.win,
            doc = this.doc,
            htmlSaveQueue = this.htmlSaveQueue,
            rangeHelper = new RangeHelper(),
            fragmentSniffer = new FragmentSniffer(win),
            requestBuilder = new RequestBuilder();

        suppInst = new Supplementary(
            supplementaryContainer, EventBus,
            rangeHelper, fragmentSniffer, win,
            doc, htmlSaveQueue, requestBuilder,
            Config.getRoute('saveEndPoint'),
            Config.getRoute('submitEndPoint'), articleToken
        );
        suppInst.attachEvents(false);
        return suppInst;
    };

    return SupplementaryInit;
});

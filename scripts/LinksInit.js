define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/UrlLinks', 'scripts/DoiLinks', 'scripts/DBLinks', 'scripts/RelatedArticleLinks',
    'scripts/ConfigReader'
], function LinksInitLoader(
    EventBus, Helper, UrlLinks, DoiLinks, DBLinks, RelatedArticleLinks,  Config
) {

    function LinksInit(win, doc, linksTabContainer, linksTabPanel, urlInnerTab, doiInnerTab, dBInnerTab, relatedArtInnerTab, localeData) {
        this.win = win;
        this.doc = doc;
        this.linksTabContainer  = linksTabContainer;
        this.linksTabPanel      = linksTabPanel;
        this.urlInnerTab        = urlInnerTab;
        this.doiInnerTab        = doiInnerTab;
        this.dBInnerTab         = dBInnerTab;
        this.relatedArtInnerTab = relatedArtInnerTab;
        this.localeData         = localeData;
    }

    //URL
    LinksInit.prototype.initiateURL = function initiateUrlFn() {
        this.linksTabPanel.add('URL', this.urlInnerTab);
        Url = new UrlLinks(this.urlInnerTab, EventBus, this.win, this.doc, this.localeData);
        Url.render();
    };

    //DOI
    LinksInit.prototype.initiateDOI = function initiateDOIFn() {
        this.linksTabPanel.add('DOI', this.doiInnerTab);
        Doi = new DoiLinks(this.doiInnerTab, EventBus, this.win, this.doc, this.localeData);
        Doi.render();
    };

    //DB
    LinksInit.prototype.initiateDB = function initiateDBFn() {
        this.linksTabPanel.add('DB Links', this.dBInnerTab);
        DBLinks = new DBLinks(this.dBInnerTab, EventBus, this.win, this.doc, this.localeData);
        DBLinks.render();
    };

    //Related Article
    LinksInit.prototype.initiateRelatedArticle = function initiateRelatedArtFn() {
        this.linksTabPanel.add('Related article', this.relatedArtInnerTab);
        RelatedArticleLinks = new RelatedArticleLinks(this.relatedArtInnerTab, EventBus, this.win, this.doc, this.localeData);
        RelatedArticleLinks.render();
    };

    LinksInit.prototype.clean = function clean() {
        var linksTabPanel = this.linksTabPanel;
        linksTabPanel.innerHTML = '';
    };

    return LinksInit;
});

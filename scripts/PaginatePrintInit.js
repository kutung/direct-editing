define([
    'scripts/Helper',
    'scripts/EventBus',
    'scripts/ConfigReader',
    'pagination/scripts/LayoutIdentifier',
    'pagination/scripts/PdfDownloader',
    'scripts/Dom2Xml',
    'scripts/Sanitizer'
], function (
    Helper, EventBus, Config, ProofPaginator, PdfDownloader, Dom2Xml, Sanitizer
) {

    var pager;

    function PaginatePrintInit(Win, Doc, ArticleToken) {
        this.win = Win;
        this.doc = Doc;
        this.articleToken = ArticleToken;
    }

    PaginatePrintInit.prototype.load = function(metaData) {
        var pager = this.doc.querySelector('.pager'),
            paginationContainer = this.doc.querySelector('.proofview'),
            articleToken = this.articleToken,
            pdfDownloader = new PdfDownloader(),
            proofPaginator = new ProofPaginator(),
            editorHtml = this.getHtml();
            paginationContainer.style.display = 'block';
            proofPaginator.execute(
                this.win, this.doc, editorHtml, pager, metaData.data.journalTitle,
                metaData.data.customerImageUrl, metaData.data.journalImageUrl,
                metaData.data.crossMarkUrl, EventBus, metaData.data.jid, 1,
                metaData.data.template, metaData.data.abbreviatedTitle
            );

        EventBus.subscribe('paginate:onComplete', this.onComplete);
    };

    PaginatePrintInit.prototype.onComplete = function(
        pageCount, isPaginated
    ) {
        var overlay = document.querySelector(".overlay");
        if (overlay !== null && typeof overlay.style !== "undefined") {
            overlay.style.display = "none";
        }
        console.log('<pagecount>'+ pageCount + '</pagecount>', isPaginated);
        self.window.print();
    };

    PaginatePrintInit.prototype.getHtml = function() {
        var editor = document.querySelector('.editor'),
        html = Dom2Xml.toXml(editor.firstElementChild);
        html = Sanitizer.sanitize(
            html, true, false, this.win, ['br']
        );

        return html;
    };

    PaginatePrintInit.prototype.initiate = function() {
        // TODO: Editor container and buttons should not be defined here.
        var doc = this.doc, pager = doc.querySelector('.pager');
    };
    return PaginatePrintInit;
});

define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/QuickLink',
    'scripts/QuickLinkFigureAndTable', 'scripts/QuickLinkEquation', 'scripts/ConfigReader'
], function QuickLinkInitLoader(
    EventBus, Helper, QuickLink, QuickLinkFigureAndTable, QuickLinkEquation, Config
) {
    function QuickLinkInit(win, doc, quickLinkTabPanel, quickLinkContainer,
        quickLinkFigureAndTableContainer, quickLinksEquation, articleContainer, localeData
    ) {
        this.win = win;
        this.doc = doc;
        this.quicklinkContainer = quickLinkContainer;
        this.quickLinkFigureAndTableContainer = quickLinkFigureAndTableContainer;
        this.articleContainer = articleContainer;
        this.localeData = localeData;
        this.quickLinkTabPanel = quickLinkTabPanel;
        this.quickLinksEquation = quickLinksEquation;
        this.sectionInst = null;
        this.figureTableInst = null;
        this.equationInst = null;
    }

    QuickLinkInit.prototype.load = function loadFn() {
        if(Helper.isNull(this.sectionInst) === false) {
            this.sectionInst.load();
        }
        if (Helper.isNull(this.figureTableInst) === false) {
            this.figureTableInst.load(this.articleContainer);
        }
        if (Helper.isNull(this.equationInst) === false) {
            this.equationInst.load(this.articleContainer);
        }
        this.displayEmptyContentOnEmptyTabpanel();
    };

    QuickLinkInit.prototype.initiateSection = function initiateSectionFn() {
        var sectionTitle = Config.getLocaleByKey('quicklink.section.heading.text');

        this.quickLinkTabPanel.add(sectionTitle, this.quicklinkContainer);
        this.sectionInst = new QuickLink(
                 this.quicklinkContainer, EventBus, this.win, this.doc, this.localeData
        );
    };

    QuickLinkInit.prototype.initiateFigureAndTable = function initiateinitiateFigureAndTableFn() {
        var figureTitle = Config.getLocaleByKey('quicklink.figure.table.heading.text');

        this.quickLinkTabPanel.add(figureTitle, this.quickLinkFigureAndTableContainer);
        this.figureTableInst = new QuickLinkFigureAndTable(
            this.win, this.doc, this.localeData, this.quickLinkFigureAndTableContainer
        );
    };

    QuickLinkInit.prototype.initiateEquation = function initiateinitiateEquation() {
        // var figureTitle = Config.getLocaleByKey('quicklink.figure.table.heading.text');
        var equationTitle = 'Equation';

        this.quickLinkTabPanel.add(equationTitle, this.quickLinksEquation);
        this.equationInst = new QuickLinkEquation(
            this.win, this.doc, this.localeData, this.quickLinksEquation
        );
    };

    QuickLinkInit.prototype.displayEmptyContentOnEmptyTabpanel = function hideEmptyTabPanel() {
        if (Helper.isNull(this.figureTableInst) === false &&
            this.quickLinkFigureAndTableContainer.hasChildNodes() === false
        ) {
            this.quickLinkFigureAndTableContainer.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
         if (Helper.isNull(this.equationInst) === false &&
            this.quickLinksEquation.hasChildNodes() === false
        ) {
            this.quickLinksEquation.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
        if (Helper.isNull(this.sectionInst) === false &&
            this.quicklinkContainer.hasChildNodes() === false
        ) {
            this.quicklinkContainer.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
    };

    QuickLinkInit.prototype.clean = function clean() {
        var quicklinkContainer = this.quicklinkContainer,
            quickLinkFigureAndTableContainer = this.quickLinkFigureAndTableContainer,
            quickLinksEquation = this.quickLinksEquation;

        quicklinkContainer.innerHTML = '';
        quickLinkFigureAndTableContainer.innerHTML = '';
        quickLinksEquation.innerHTML = '';
    };

    return QuickLinkInit;
});

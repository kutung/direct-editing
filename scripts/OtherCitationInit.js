define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/ReferencePanel', 'scripts/ReferenceInit', 'scripts/OtherCitationFigure', 'scripts/OtherCitationTable', 'scripts/OtherCitationEquation', 'scripts/OtherCitationFootNote', 'scripts/ConfigReader'
], function OtherCitationInitLoader(
    EventBus, Helper, ReferencePanel, ReferenceInit, OtherCitationFigure, OtherCitationTable, OtherCitationEquation, OtherCitationFootNote, Config
) {
    function OtherCitationInit(win, doc, OtherCitationTabPanel, referenceContainer, OtherCitationFigureContainer,
        OtherCitationTableContainer, OtherCitationEquationContainer, OtherCitationFNContainer, articleContainer, localeData
    ) {
        this.win = win;
        this.doc = doc;
        this.OtherCitationTabPanel = OtherCitationTabPanel;
        this.referenceContainer = referenceContainer;
        this.OtherCitationFigureContainer = OtherCitationFigureContainer;
        this.OtherCitationTableContainer = OtherCitationTableContainer;
        this.OtherCitationEquationContainer = OtherCitationEquationContainer;
        this.OtherCitationFNContainer = OtherCitationFNContainer;
        this.articleContainer = articleContainer;
        this.localeData = localeData;
        this.figureInst = null;
        this.referenceInst = null;
        this.tableInst = null;
        this.equationInst = null;
        this.footNotesInst = null;
    }

    OtherCitationInit.prototype.load = function loadFn() {
        this.referenceInst.render();
        this.figureInst.load(this.articleContainer);
        this.TableInst.load(this.articleContainer);
        this.equationInst.load(this.articleContainer);
        this.footNotesInst.render(this.articleContainer);
        this.displayEmptyContentOnEmptyTabpanel();
    };

    OtherCitationInit.prototype.initiateReference = function initiateReferenceFn() {
        var referenceTitle = 'Reference';

        this.OtherCitationTabPanel.add(referenceTitle, this.referenceContainer);
        /*this.referenceInst = new ReferenceInit(
                this.win, this.doc, this.referenceContainer
        );*/
        this.referenceInst = new ReferencePanel( this.referenceContainer, EventBus, this.win, this.doc )
    };

    OtherCitationInit.prototype.initiateFigure = function initiateFigureFn() {
        var figureTitle = 'Figure';

        this.OtherCitationTabPanel.add(figureTitle, this.OtherCitationFigureContainer);
        this.figureInst = new OtherCitationFigure(
                this.win, this.doc, this.localeData, this.OtherCitationFigureContainer
        );
    };

    OtherCitationInit.prototype.initiateTable = function initiateTableFn() {
        var TableTitle = 'Table';

        this.OtherCitationTabPanel.add(TableTitle, this.OtherCitationTableContainer);
        this.TableInst = new OtherCitationTable(
            this.win, this.doc, this.localeData, this.OtherCitationTableContainer
        );
    };

    OtherCitationInit.prototype.initiateFootNotes = function initiateFootNotesFn() {
        // var figureTitle = Config.getLocaleByKey('quicklink.figure.table.heading.text');
        var equationTitle = 'FootNotes';

        this.OtherCitationTabPanel.add(equationTitle, this.OtherCitationFNContainer);
        this.footNotesInst = new OtherCitationFootNote(
            this.win, this.doc, this.localeData, this.OtherCitationFNContainer
        );
    };

    OtherCitationInit.prototype.initiateEquation = function initiateEquationFn() {
        // var figureTitle = Config.getLocaleByKey('quicklink.figure.table.heading.text');
        var equationTitle = 'Equation';

        this.OtherCitationTabPanel.add(equationTitle, this.OtherCitationEquationContainer);
        this.equationInst = new OtherCitationEquation(
            this.win, this.doc, this.localeData, this.OtherCitationEquationContainer
        );
    };

    OtherCitationInit.prototype.displayEmptyContentOnEmptyTabpanel = function hideEmptyTabPanel() {
        if (Helper.isNull(this.figureTableInst) === false &&
            this.OtherCitationFigureContainer.hasChildNodes() === false
        ) {
            this.OtherCitationFigureContainer.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
         if (Helper.isNull(this.equationInst) === false &&
            this.OtherCitationFigureContainer.hasChildNodes() === false
        ) {
            this.OtherCitationFigureContainer.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
        if (Helper.isNull(this.sectionInst) === false &&
            this.OtherCitationFigureContainer.hasChildNodes() === false
        ) {
            this.OtherCitationFigureContainer.innerHTML = Config.getLocaleByKey('quicklink.empty.data');
        }
    };

    OtherCitationInit.prototype.clean = function clean() {
        var OtherCitationTabPanel = this.OtherCitationTabPanel,
            OtherCitationFigureContainer = this.OtherCitationFigureContainer,
            OtherCitationEquationContainer = this.OtherCitationEquationContainer;

        OtherCitationTabPanel.innerHTML = '';
        OtherCitationEquationContainer.innerHTML = '';
        OtherCitationFigureContainer.innerHTML = '';
    };

    return OtherCitationInit;
});

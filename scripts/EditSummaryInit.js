define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/EditSummary',
    'scripts/Util', 'customer/Config', 'scripts/ConfigReader'
], function EditSummaryInitLoader(
    EventBus, Helper, EditSummary, Util, CustomerConfig, Config
) {
    var enableEditLog,
        authorEditSummary = null,
        ceEditSummary = null,
        instructEditSummary = null,
        authorTagsArray = ['figure', 'inlineFigure', 'biography',
            'tableCaption', 'equation', 'inlineFormula'
        ],
        cpeTagsArray = ['copyEditorInsert', 'copyEditorDelete'],
        authorTags = [
            '.optbold', '.optitalic', '.optsup', '.optsub', '.optdel',
            '.optcomment', '.optinsert', '.optreplace', '.optreject',
            '.optsmallcaps', '.optmono', '.optdelreference'
        ],
        cpeTags = ['.pc_cpereplace', '.optreject'];

    function EditSummaryInit(Win, Doc, AuthorESContainer, CeESContainer, insESContainer) {
        this.win = Win;
        this.doc = Doc;
        this.authorESContainer = AuthorESContainer;
        this.ceESContainer = CeESContainer;
        this.insESContainer = insESContainer;

        enableEditLog = CustomerConfig.get('enableEditLogFor');
        authorTags = Util.selectorToArray(
           authorTagsArray, authorTags
        );
        cpeTags = Util.selectorToArray(
            cpeTagsArray, cpeTags
        );
        this.syncElContainer = null;
    }

    EditSummaryInit.prototype.reset = function reset() {
        if (Helper.isNull(authorEditSummary) === false) {
            authorEditSummary.clear();
        }
        if (Helper.isNull(ceEditSummary) === false) {
            ceEditSummary.clear();
        }
    };

    EditSummaryInit.prototype.load = function load(
        container, annotationMap, optError, attachments, replaceImageMetaData,
        generalAttachments

    ) {
        var articleMsg, copyEditorMsg, tabName;

        articleMsg = Config.getLocaleByKey('article.noChanges');
        copyEditorMsg = Config.getLocaleByKey('article.copyEditor.noChange');

        if (Helper.isNull(authorEditSummary) === false) {
            authorEditSummary.setEmptyMessage(articleMsg);
            if (container.classList.contains('supplementary') === true) {
                tabName = 'supplementary';
            }
            if (container.classList.contains('editor') === true) {
                tabName = 'editor';
            }
            authorEditSummary.add(
                container.querySelectorAll(authorTags.join(', ')),
                annotationMap, optError, attachments, generalAttachments,
                tabName, replaceImageMetaData
            );
        }

        if (Helper.isNull(ceEditSummary) === false) {
            ceEditSummary.setEmptyMessage(copyEditorMsg);
            ceEditSummary.add(
                container.querySelectorAll(cpeTags.join(', ')),
                annotationMap, optError, attachments
            );
        }
    };

    EditSummaryInit.prototype.initiate = function initiate(editSummaryTabPanel) {
        if (enableEditLog.author === true) {
            editSummaryTabPanel.add('Edit History', this.authorESContainer);
            authorEditSummary = new EditSummary(
                this.authorESContainer, EventBus, this.win, this.doc
            );
            authorEditSummary.setEnableFilter(true, 'author-edit-summary-filter');
            authorEditSummary.render();
        }

        /*if (enableEditLog.copyEditor === true) {
            editSummaryTabPanel.add('Copy Editor', this.ceESContainer);
            ceEditSummary = new EditSummary(
                this.ceESContainer, EventBus, this.win, this.doc
            );
            ceEditSummary.render();
        }*/

        if (enableEditLog.instruct === true) {
            editSummaryTabPanel.add('Instruct', this.insESContainer);
            instructEditSummary = new EditSummary(
                this.insESContainer, EventBus, this.win, this.doc
            );
            instructEditSummary.render();
        }
    };

    EditSummaryInit.prototype.setSyncElementContainer = function setSyncElementContainer(
        articleContainer, syncElementContainer
    ) {
        authorEditSummary.setSyncElementsCont(articleContainer, syncElementContainer);
    };

    return EditSummaryInit;
});

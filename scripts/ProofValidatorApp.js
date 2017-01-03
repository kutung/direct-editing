define([
    'scripts/EditorInit', 'scripts/SupplementaryInit', 'scripts/AboutInit',
    'scripts/QueriesInit', 'scripts/InsertPanel', 'scripts/InstructPanel',
    'scripts/TabHandlerInit', 'scripts/EditSummaryInit', 'scripts/ContextualMenuInit',
    'scripts/AnnotatorInit', 'scripts/MathEditorInit', 'scripts/DialogPopupPanel',
    'scripts/ErrorHandler', 'scripts/ConfigReader', 'scripts/RequestBuilder',
    'scripts/QueryEditorPanel', 'scripts/QueryBag', 'scripts/QueryPersistor',
    'scripts/RequestQueue', 'scripts/Request', 'scripts/Helper', 'scripts/TabPanel',
    'scripts/ToolTip', 'scripts/EventBus', 'scripts/PerformanceLog', 'scripts/PaginateInit',
    'scripts/AnnotationBag', 'scripts/Util', 'scripts/BootstrapDialog', 'scripts/Dialog',
    'scripts/XmlEditorInit', 'scripts/ToggleImage', 'scripts/AttachmentPanel',
    'customer/Config', 'scripts/ImageViewer', 'scripts/AutoCommit',
    'scripts/ElementSyncFormatter', 'scripts/ElementSync', 'scripts/Connectivity',
    'scripts/QuickLinkInit', 'scripts/FeatureToggle', 'scripts/ReplaceImagePanel'
], function ProofValidatorAppLoader(
    EditorInit, SupplementaryInit, AboutInit, QueriesInit, InsertPanel,
    InstructPanel, TabHandlerInit, EditSummaryInit, ContextualMenuInit,
    AnnotatorInit, MathEditorInit, DialogPopupPanel, ErrorHandler, Config,
    RequestBuilder, QueryEditorPanel, QueryBag, QueryPersistor, RequestQueue, XMLRequest,
    Helper, TabPanel, ToolTip, EventBus, PerformanceLog, PaginateInit, AnnotationBag,
    Util, BootstrapDialog, DialogPopup, XmlEditorInit, ToggleImage, AttachmentPanel,
    CustomerConfig, ImageViewer, AutoCommit, ElementSyncFormatter, ElementSync, Connectivity,
    QuickLinkInit, Features, ReplaceImagePanel
) {
    var articleTabPanel, articleContainer, supplementaryContainer, editorInit,
        aboutInst, aboutContainer, htmlSaveQueue, editSummaryInst, contextualMenu,
        parentContainer, tabHandlerInit, annotatorInit, mathInit, mathEditorInst,
        insertPanel, instructPanel, readonlyContainer, queryBag, optError,
        supplementaryInit, metaData, queriesInit, queryTabPanel, dialogPopupPanel,
        suppInst, editSummaryTabPanel, saveBtn, submitBtn, articleToken,
        performanceLog, currentActor, startTime, startDate, paginateInit,
        annotationBag, localeData, toolTipInst, editorInst, rightpanelElement,
        saveErrorMessage, helpLink, actionButtonBlock, modeButtonBlock,
        saveErrorReloadMessage, proofviewContainer, attachmentPanel, queryPersistor,
        autoCommit, queryContainer, instructContainer, insertContainer, contextualMenuInit,
        replaceImageContainer, replaceImagePanel,
        annotationMap = {},
        isEditorInit = false,
        isSupplementaryInit = false,
        isAboutInit = false,
        isAttachmentInit = false,
        isEditSummaryInit = false,
        isPaginateInit = false,
        ceAffiliationSelector = Util.getSelector('ceAffiliation'),
        saAffiliationSelector = Util.getSelector('saAffiliation'),
        xmlSaveBtn, xmlEditorBtn, editorBtn, modeButtons,
        editToXmlModeEventsSubscribed = false,
        xmlEditorPanel = null,
        editorReadOnly = false,
        proofModeButtons,
        isVtoolExecuted = false,
        saveThreshold = 15,
        xmlEditorInst,
        quickLinksInst, isQuickLinkInit = false,
        showPaginateProof = false,
        isSurveyInit = false,
        hasMathEditor = false,
        isReplaceImageInit = false;

    function getTabHandleHeight() {
        var style = getComputedStyle(articleTabPanel.tabPanelHeaderContainer),
            height = style.height;

        height = height.replace('px', '');
        height = parseFloat(height);
        return height;
    }

    function updateEditorHeight(container) {
        var height = window.innerHeight - getTabHandleHeight(),
            style = getComputedStyle(parentContainer),
            topPadding = style.paddingTop.replace('px', ''),
            bottomPadding = style.paddingBottom.replace('px', '');

        topPadding = parseFloat(topPadding);
        bottomPadding = parseFloat(bottomPadding);

        height = height - topPadding - bottomPadding - 5;
        container.style.height = height + 'px';
    }

    function loadSupplementary() {
        var supplementaryTabId;

        if (isSupplementaryInit === false) {
            throw new Error('error.supplementary_not_init');
        }
        if (supplementaryInit.hasSupplementary() === true) {
            supplementaryTabId = articleTabPanel.add(
                Config.getLocaleByKey('main.supplementary.tab'),
                supplementaryContainer
            );
            tabHandlerInit.setPanels(
                supplementaryTabId, 'supplementary', supplementaryContainer, suppInst, false
            );
            if (metaData.readOnly === false) {
                suppInst.setEventBind(true);
            }
            supplementaryInit.load();
            updateEditorHeight(supplementaryContainer);
        }
        else {
            supplementaryContainer.parentNode.removeChild(supplementaryContainer);
            suppInst.destroy();
        }
    }

    function getTabId(queryName) {
        var tabId;

        tabId = queryBag.getTabIDForQuery(queryName);
        if (queryTabPanel.activeTabId === tabId) {
            return;
        }
        queryTabPanel.activate(tabId);
    }

    function loadQueries() {
        var hasCreateQuery = Features.isFeatureEnabled('Editor.Query.Create');

        queryContainer = document.querySelector('.query-container');
        queryTabPanel = new TabPanel(
            queryContainer, document, window, EventBus, localeData
        );
        queryTabPanel.renderComponentStyle();
        queryTabPanel.render();
        queryTabPanel.activateOnAdd(true);
        queryTabPanel.setEmptyTabpanelContent('Use the "+" button to add a new Query');
        queryTabPanel.setTitle('Queries');
        queryTabPanel.setName('query');
        tabHandlerInit.setCollapsiblePanels('query', queryTabPanel);

        queryBag = new QueryBag(window, document, queryTabPanel);
        queryPersistor = new QueryPersistor(
            articleContainer, supplementaryContainer,
            {
                'saveEndPoint': Config.getRoute('ValidatorQuerySaveEndPoint'),
                'updateEndPoint': Config.getRoute('ValidatorQuerySaveEndPoint'),
                'removeEndPoint': Config.getRoute('ValidatorQueryDeleteEndPoint')
            }, EventBus, articleToken, queryBag, currentActor
        );
        queriesInit = new QueriesInit(
            window, document, articleToken, currentActor, queryPersistor, queryBag
        );
        queriesInit.setQueryTab(queryTabPanel);
        queryTabPanel.hide();
        tabHandlerInit.setQueryBag(queryBag);
        autoCommit.addItem(
            'query', queryContainer, queriesInit.autoSave, queriesInit
        );
        EventBus.subscribe('EmptyMcQueryTab:Activate', getTabId);

        queriesInit.setS3FormUpload(metaData.S3UploadFormData);
        queriesInit.setCorrectorQueries(metaData.queries);
        queriesInit.setProblemTypes(metaData.problemTypes);
        queriesInit.setValidatorQueries(metaData.validatorQueries);
        queriesInit.setS3FormUpload(metaData.S3UploadFormData);
        queriesInit.setPluginDepns(
            editorInst, suppInst, editSummaryTabPanel, articleTabPanel,
            insertPanel, instructPanel
        );

        if (metaData.readOnly === false && hasCreateQuery === true) {
            queriesInit.createQuery();
            queriesInit.removeQuery();
        }
        queriesInit.loadValidator(metaData.readOnly);
        queryTabPanel.show();
        queryTabPanel.showTabScroller();
    }

    function initAnnotator() {
        var imageAnnotation, highResImageAnnotation,
            endPoint = {
                'save': Config.getRoute('imageSaveEndPoint'),
                'remove': Config.getRoute('imageRemoveEndPoint')
            };

        annotationBag = new AnnotationBag(window, document);

        imageAnnotation = CustomerConfig.get('enableAnnotationFor');
        if (Features.isFeatureEnabled('Editor.HighResImage.Enable') === true &&
            Features.isFeatureEnabled('Editor.HighResImage.Annotation') === true
        ) {
            highResImageAnnotation = CustomerConfig.get('enableHigResFor');
            imageAnnotation = Util.getFirstArrayUnmatchedValues(
                imageAnnotation, highResImageAnnotation
            );
        }
        annotatorInit = new AnnotatorInit(
            window, document, EventBus,
            endPoint,
            articleToken,
            annotationBag,
            imageAnnotation
        );
        annotatorInit.attachAnnotateSave();
    }

    function loadAnnotator(container) {
        if (metaData && metaData.readOnly === true) {
            annotatorInit.isReadOnly(true);
        }
        annotatorInit.renderAnnotatorOverImages(
            container, metaData.annotations, metaData.replaceImage);
    }

    function loadAnnotatorReadonly(container, readonly) {
        annotatorInit.readOnlyAnnotatorImages(container, readonly);
    }

    function loadMathEquationsReadonly(container, readonly) {
        if (metaData.readOnly === true || Helper.isUndefined(mathInit) === true) {
            return;
        }
        mathInit.disableMathOnEquationsclick(container, readonly);
    }

    function loadContextualMenu(container) {
        if (Features.isFeatureEnabled('Editor.ContextualMenu') === false) {
            return;
        }
        contextualMenuInit = new ContextualMenuInit(window, document, editorInst);
        contextualMenu = contextualMenuInit.initiate(container);
        contextualMenuInit.load();
    }

    function loadToolTip(container) {
        toolTipInst.render(container);
    }

    function getRevisionCallback() {
        return Number(saveBtn.dataset.revisionId);
    }

    function getArticleData() {
        var articleChange, articleData = [];

        articleChange = editorInst.hasUnsavedChanges();
        if (articleChange === false ||
            editorInst.saveInProgress === true) {
            return false;
        }

        if (articleChange === true) {
            articleData = editorInst.getSaveData();
            editorInst.saveInProgress = true;
        }

        return articleData;
    }

    function getSupplementaryData() {
        var supplementaryChange, supplementaryData = [];

        supplementaryChange = suppInst.hasUnsavedChanges();
        if (supplementaryChange === false ||
            suppInst.saveInProgress === true) {
            return false;
        }

        if (supplementaryChange === true) {
            supplementaryData = suppInst.getSaveData();
            suppInst.saveInProgress = true;
        }
        return supplementaryData;
    }

    function setSaveInprogress(enable) {
        if (enable === true) {
            editorInst.saveInProgress = true;
            if (suppInst !== null) {
                suppInst.saveInProgress = true;
            }
        }
        else if (enable === false) {
            editorInst.saveInProgress = false;
            if (suppInst !== null) {
                suppInst.saveInProgress = false;
            }
        }
    }

    function removeChangeFlags() {
        editorInst.removeChangedFlag();
        suppInst.removeChangedFlag();
    }

    function saveSuccess(response) {
        performanceLog.pushLoadTimeline('Save', startTime, startDate);
        setSaveInprogress(false);
        EventBus.publish('Editor:SaveComplete');
        editorInst.clearChangedFlag();
        if (suppInst !== null) {
            suppInst.clearChangedFlag();
        }
    }

    function saveFailure(response, req, xmlHttp) {
        var options = {
            'showCloseButton': false,
            'callback': function removeChangedFlagFn() {
                removeChangeFlags();
                EventBus.publish('Browser:reload');
            }
        };

        setSaveInprogress(false);
        if (xmlHttp.status === ErrorHandler.getCode('ForceReloadException')) {
            EventBus.publish('alert:show', saveErrorReloadMessage, options);
            return;
        }
        EventBus.publish('Editor:SaveFailed');
        EventBus.publish('alert:show', saveErrorMessage);
    }

    function saveTimeout(response) {
        setSaveInprogress(false);
        EventBus.publish('Editor:SaveFailed');
        EventBus.publish('alert:show', saveErrorMessage);
    }

    function autoSave(options) {
        var i, date,
            request,
            articleData = false,
            supplementaryData = false,
            rB = new RequestBuilder(),
            saveData = {},
            formData = new FormData(),
            logDiv = [],
            saveEndPoint = Config.getRoute('saveEndPoint');

        if (Connectivity.getStatus() === false) {
            return;
        }
        options = options || {};
        saveData.data = [];
        saveData.token = articleToken;
        articleData = getArticleData();
        if (articleData !== false) {
            for (i = 0; i < articleData.length; i += 1) {
                saveData.data.push(articleData[i]);
                logDiv.push(articleData[i].id);
            }
        }

        if (suppInst !== null) {
            supplementaryData = getSupplementaryData();
            if (supplementaryData !== false) {
                for (i = 0; i < supplementaryData.length; i += 1) {
                    saveData.data.push(supplementaryData[i]);
                    logDiv.push(supplementaryData[i].id);
                }
            }
        }

        if (saveData.data.length === 0) {
            return;
        }
        EventBus.publish('ActionLog:save',
            {'action': 'save', 'divIds': logDiv}, true
        );
        formData.append('input', JSON.stringify(saveData));
        rB.setUrl(saveEndPoint);
        rB.setMethod('POST');
        rB.setData(formData);
        if (Helper.isFunction(options.successCallback) === true) {
            rB.setSuccessCallback(options.successCallback);
        }
        else {
            rB.setSuccessCallback(saveSuccess);
        }
        if (Helper.isFunction(options.failureCallback) === true) {
            rB.setFailureCallback(options.failureCallback);
        }
        else {
            rB.setFailureCallback(saveFailure);
        }
        if (Helper.isFunction(options.timeoutCallback) === true) {
            rB.setTimeoutCallback(options.timeoutCallback);
        }
        else {
            rB.setTimeoutCallback(saveTimeout);
        }
        request = rB.build();
        date = new Date();
        startTime = date.getTime();
        startDate = date.toString();
        request.send();
    }

    function saveCallback(options) {
        autoSave(options);
    }

    function loadPaginate() {
        var newRevisionId;

        if (isPaginateInit === false) {
            return;
        }
        EventBus.subscribe('Editor:HasUnsavedChanges', function savedChanges() {
            newRevisionId = Number(saveBtn.dataset.revisionId) + 1;
            saveBtn.dataset.revisionId = newRevisionId;
        });
        paginateInit.load(
            editorInst,
            metaData,
            getRevisionCallback,
            saveCallback
        );
    }

    function checkSaveChangeOnUnload() {
        window.addEventListener('beforeunload', function beforeunload(e) {
            var confirmationMessage = '',
                supplementaryChange = false,
                articleChange = editorInst.hasUnsavedChanges();

            if (suppInst.hasUnsavedChanges() === true) {
                supplementaryChange = suppInst.hasUnsavedChanges();
            }
            if (articleChange === true || supplementaryChange === true) {
                confirmationMessage = Config.getLocaleByKey(
                    'article.changes.not.saved'
                );
                e.returnValue = confirmationMessage;
                return confirmationMessage;
            }
            return;
        });
    }

    function enableBlocker() {
        var connectionStatus, panels, activeTabId, activeTabName;

        connectionStatus = Connectivity.getStatus();
        if (connectionStatus === false) {
            panels = tabHandlerInit.getPanels();
            activeTabId = tabHandlerInit.articleTabPanel.getActiveTabId();
            if (Helper.objectHasKey(panels, activeTabId) === true) {
                activeTabName = panels[activeTabId].name;
                if (activeTabName === 'article') {
                    EventBus.publish('Editor:SetBlock');
                }
                if (activeTabName === 'supplementary') {
                    EventBus.publish('Supplementary:SetBlock');
                }
            }
        }
    }

    function attachTabChangeEvents() {
        EventBus.subscribe('Tabpanel:onActivate', tabHandlerInit.onChange, tabHandlerInit);
        EventBus.subscribe('MainTabPanel:change', tabHandlerInit.onEditorTabChange, tabHandlerInit);
        EventBus.subscribe('Panel:onShow', tabHandlerInit.onCollapse, tabHandlerInit);
        EventBus.subscribe('TabPanel:setFlag', tabHandlerInit.setCollaspeFlag, tabHandlerInit);
        EventBus.subscribe('RightPane:Show', tabHandlerInit.showRightPanel, tabHandlerInit);
        EventBus.subscribe('RightPane:Hide', tabHandlerInit.hideRightPanels, tabHandlerInit);
        EventBus.subscribe('TabPanel:ReloadMenu', loadContextualMenu, this);
        EventBus.subscribe('Tabpanel:onActivate', enableBlocker, this);
    }

    function attachGenerateMenuOnTabChange() {
        EventBus.subscribe('contextMenu:onDestroy', tabHandlerInit.regenerateMenuOnTabChange, this);
    }

    function detachGenerateMenuOnTabChange() {
        EventBus.unsubscribe('contextMenu:onDestroy', tabHandlerInit.regenerateMenuOnTabChange, this);
    }

    function getAnnotation() {
        var annotate,
            currentAnnotate = {},
            allAnnotation = annotationBag.getAll(),
            annotateLength = allAnnotation.length,
            i = 0;

        for (; i < annotateLength; i += 1) {
            annotate = allAnnotation[i];
            if (
                Helper.isUndefined(currentAnnotate[annotate.imageId]) === true
            ) {
                currentAnnotate[annotate.imageId] = [];
            }
            currentAnnotate[annotate.imageId].push(annotate);
        }
        return currentAnnotate;
    }

    function getAttachmentInstruct() {
        var instructId, instructMetaData, attachmentData, attachments = {};

        instructMetaData = metaData.instructs;
        if (metaData.readOnly === false &&
            instructPanel !== null &&
            Helper.isUndefined(instructPanel) !== true) {
            instructMetaData = instructPanel.getMetaData();
        }
        for (instructId in instructMetaData) {
            attachmentData = instructMetaData[instructId];
            if (instructMetaData.hasOwnProperty(instructId) === true &&
               attachmentData.length !== 0) {
                attachments[instructId] = attachmentData;
            }
        }
        return attachments;
    }

    function loadEditSummary() {
        var attachments = {},
            annotations = {},
            attachmentsMetaData, replaceImageMetaData;

        if (isEditSummaryInit === false) {
            throw new Error('error.edit_summary_not_init');
        }
        if (Features.isFeatureEnabled('Editor.AnnotateOnImage') === true) {
            annotations = getAnnotation();
        }
        attachments = getAttachmentInstruct();
        if (isAttachmentInit === true) {
            attachmentsMetaData = metaData.generalAttachment;
        }
        if(isReplaceImageInit === true) {
            replaceImageMetaData = metaData.replaceImage;
        }
        editSummaryInst.reset();
        editSummaryInst.load(
            articleContainer, annotations, optError, attachments,
            replaceImageMetaData, attachmentsMetaData
        );
        editSummaryInst.load(
            supplementaryContainer, annotations, optError, attachments,
            replaceImageMetaData, null
        );
    }

    function loadToggleImage(container) {
        var toggleImage,
            toggleImageContainer = container.querySelectorAll(
                '.container-image.print-image');

        toggleImage = new ToggleImage(
            window, document, EventBus, toggleImageContainer, localeData
        );
        toggleImage.render();
    }

    function initAttachmentPanel() {
        var attachmentContainer = document.querySelector('.attachment-container');

        attachmentPanel = new AttachmentPanel(
            attachmentContainer, document, window,
            EventBus, articleToken
        );
        attachmentPanel.setButtonContainer(supplementaryContainer);
        attachmentPanel.setMetadata(metaData.generalAttachment);
        attachmentPanel.render();
        attachmentPanel.setTitle('Instruct');
        attachmentPanel.setName('attachment');
        attachmentPanel.setUploadLimit(Config.get('uploadSizeLimit'));
        attachmentPanel.setUploadType(Config.get('supportedExtension'));
        tabHandlerInit.setCollapsiblePanels('attachment', attachmentPanel);
        attachmentPanel.panel.hide();
        attachmentPanel.setS3FormUpload(metaData.S3UploadFormData);
        isAttachmentInit = true;
        autoCommit.addItem(
            'attachment', attachmentContainer, attachmentPanel.autoSave, attachmentPanel
        );
    }

    function initAutoCommit() {
        autoCommit = new AutoCommit(window, document, EventBus, tabHandlerInit);
    }

    function pushAnnotationToBag(annDatas, type) {
        var i, annData;
        if(Helper.isEmptyString(type) === true) {
            throw new Error('annotation.bag.type.missing');
        }
        if (
            Helper.isUndefined(annDatas) === true ||
            Helper.isNull(annDatas) === true
        ) {
            return;
        }
        for (i = 0; i < annDatas.length; i += 1) {
            annData = annDatas[i];
            if (annData.type === type) {
                annotationBag.addBag(
                    annData.annotationId, annData.imageId, null, annData.type,
                    annData.text, annData.position
                );
            }
        }
    }

    function reloadQuickLink() {
        var activePane = tabHandlerInit.currentActivePane;

        if (isQuickLinkInit === true) {
            if (activePane === 'quick-links') {
                quickLinksInst.clean();
                quickLinksInst.load();
            }
        }
    }
    function initInsertPanel() {
        insertContainer = document.querySelector('.insert-container');

        insertPanel = new InsertPanel(
            insertContainer, document, window, EventBus
        );
        insertPanel.render();
        insertPanel.setTitle('Insert');
        insertPanel.setName('insert');
        tabHandlerInit.setCollapsiblePanels('insert', insertPanel);
        insertPanel.panel.hide();
        insertPanel.setEnabled(false);
        autoCommit.addItem(
            'insert', insertContainer, insertPanel.autoSave, insertPanel
        );
    }

    function initInstructPanel() {
        instructContainer = document.querySelector('.instruction-container');
        instructPanel = new InstructPanel(
            instructContainer, document, window,
            EventBus,
            articleToken
        );
        instructPanel.render();
        instructPanel.setTitle('Instruct');
        instructPanel.setName('instruct');
        instructPanel.setUploadLimit(Config.get('uploadSizeLimit'));
        instructPanel.setUploadType(Config.get('supportedExtension'));
        instructPanel.setMetadata(metaData.instructs);
        instructPanel.setS3FormUpload(metaData.S3UploadFormData);
        tabHandlerInit.setCollapsiblePanels('instruct', instructPanel);
        instructPanel.panel.hide();
        instructPanel.setEnabled(false);
        autoCommit.addItem(
            'instruct', instructContainer, instructPanel.autoSave, instructPanel
        );
    }

    function initReplaceImagePanel() {
        replaceImageContainer = document.querySelector('.replaceImage-container');

        replaceImagePanel = new ReplaceImagePanel(
            replaceImageContainer, document, window, EventBus, articleToken
        );
        replaceImagePanel.render();
        replaceImagePanel.setTitle('Replace-Image');
        replaceImagePanel.setName('Replace-Image');
        replaceImagePanel.setUploadLimit(Config.get('uploadSizeLimit'));
        replaceImagePanel.setUploadType(Config.get('supportedExtension'));
        replaceImagePanel.setMetadata(metaData.replaceImage);
        replaceImagePanel.setS3FormUpload(metaData.S3UploadFormData);
        tabHandlerInit.setCollapsiblePanels('Replace-Image', replaceImagePanel);
        replaceImagePanel.panel.hide();
        isReplaceImageInit = true;
        autoCommit.addItem(
            'Replace-Image', replaceImageContainer, replaceImagePanel.autoSave, replaceImagePanel
        );
    }

    function initEditSummaryPanel() {
        var editSummaryTabContainer = document.querySelector('.edit-summary-tab'),
            authorEditSummaryContainer = document.querySelector('.edit-summary-author'),
            ceEditSummaryContainer = document.querySelector('.edit-summary-copy-editor');

        editSummaryInst = new EditSummaryInit(
            window, document, authorEditSummaryContainer, ceEditSummaryContainer
        );
        editSummaryTabPanel = new TabPanel(
            editSummaryTabContainer, document, window, EventBus, localeData
        );
        editSummaryTabPanel.renderComponentStyle();
        editSummaryTabPanel.render();
        editSummaryInst.initiate(editSummaryTabPanel);
        editSummaryTabPanel.hideTabScroller();
        editSummaryTabPanel.setTitle('Edit Log');
        editSummaryTabPanel.setName('edit-summary');
        editSummaryTabPanel.hide();
        tabHandlerInit.setCollapsiblePanels('edit-summary', editSummaryTabPanel);
        isEditSummaryInit = true;
    }

    function initQuickLinksPanel() {
        var quickLinksTabPanel,
            quickLinksTabContainer = document.querySelector('.quicklinks-tab'),
            quickLinksContainer = document.querySelector('.quicklinks'),
            quicklinkTitle = Config.getLocaleByKey('quicklink.heading.text'),
            quickLinksFigureAndTableContainer = document.querySelector(
                '.quicklinks-figure-and-table'
            );

        quickLinksTabPanel = new TabPanel(
            quickLinksTabContainer, document, window, EventBus, localeData
        );
        quickLinksInst = new QuickLinkInit(
            window, document, quickLinksTabPanel, quickLinksContainer,
            quickLinksFigureAndTableContainer, articleContainer, localeData
        );
        quickLinksTabPanel.render();
        if (Features.isFeatureEnabled('Editor.Navigate.Sections') === true) {
            quickLinksInst.initiateSection();
        }
        if (Features.isFeatureEnabled('Editor.Navigate.FiguresAndTables') === true) {
            quickLinksInst.initiateFigureAndTable();
        }
        quickLinksTabPanel.hideTabScroller();
        quickLinksTabPanel.setTitle(quicklinkTitle);
        quickLinksTabPanel.setName('quick-links');
        quickLinksTabPanel.hide();
        tabHandlerInit.setCollapsiblePanels('quick-links', quickLinksTabPanel);
        EventBus.subscribe('QuickLink:Reload', reloadQuickLink);
        isQuickLinkInit = true;
        quickLinksInst.load();
    }

    function loadImageViewer(container) {
        var imageViewer;

        imageViewer = new ImageViewer(
            document, window, container, EventBus, metaData.replaceImage
        );
        imageViewer.render();
    }

    function loadAboutContent() {
        var aboutTabId;

        if (isAboutInit === false) {
            throw new Error('error.about_not_init');
        }
        aboutInst.load(aboutContainer, metaData.actorsCompletedDetails);
        aboutTabId = articleTabPanel.add(
            Config.getLocaleByKey('main.about.tab'), aboutContainer
        );
        updateEditorHeight(aboutContainer);
    }

    function checkAffiliationEdit() {
        var ceAff, edits, saAff, temp, alreadyAdded,
            i = 0,
            insertSpan = document.createElement('span'),
            classes = [
                '.optbold', '.optitalic', '.optsup', '.optsub',
                '.optdel', '.optcomment', '.optinsert', '.optreplace',
                '.optsmallcaps', '.optmono'
            ];

        insertSpan.classList.add('content_modified');
        insertSpan.setAttribute('title', 'Transfer changes from previous line');
        ceAff = articleContainer.querySelectorAll(ceAffiliationSelector);
        for (; i < ceAff.length; i += 1) {
            temp = ceAff[i];
            edits = temp.querySelectorAll(classes.join(', '));
            if (edits.length > 0) {
                saAff = temp.querySelector(saAffiliationSelector);
                if (saAff === null) {
                    continue;
                }
                alreadyAdded = saAff.querySelector('.content_modified');
                if (alreadyAdded !== null) {
                    continue;
                }
                saAff.insertBefore(
                    insertSpan.cloneNode(true), saAff.childNodes[0]
                );
            }
        }
    }

    function pushHighResAnnoationIntoBag() {
        var annKey, annDatas;

        if (metaData && metaData.readOnly === true) {
            annotatorInit.isReadOnly(true);
        }
        annotationMap = metaData.annotations;
        for (annKey in annotationMap) {
            if (Helper.objectHasKey(annotationMap, annKey) === true) {
                annDatas = annotationMap[annKey];
                pushAnnotationToBag(annDatas, 'image');
            }
        }
    }

    function loadEditorDependencyPlugins(container) {
        if (Features.isFeatureEnabled('Editor.AnnotateOnImage') === true) {
            loadAnnotator(container);
        }
        if (Features.isFeatureEnabled('Editor.PrintViewOnImage') === true) {
            loadToggleImage(container);
        }
        if (Features.isFeatureEnabled('Editor.HighResImage.Enable') === true) {
            loadImageViewer(container);
        }
        loadToolTip(container);
    }

    function loadPlugins(readonly) {
        var annKey, annDatas;

        loadSupplementary();
        loadAboutContent();
        initEditSummaryPanel();
        if (readonly === false) {
            loadContextualMenu(articleContainer);
            checkAffiliationEdit();
            if (Features.isFeatureEnabled('Editor.Insert') === true) {
                initInsertPanel();
            }
            if (Features.isFeatureEnabled('Editor.Instruct.Enable') === true) {
                initInstructPanel();
            }
            if (Features.isFeatureEnabled('Editor.ReplaceImage') === true) {
                initReplaceImagePanel();
            }
        }
        if (Features.isFeatureEnabled('Editor.Query.Enable') === true) {
            loadQueries();
        }
        if (Features.isFeatureEnabled('Editor.Navigate.Enable') === true) {
            initQuickLinksPanel();
        }
        initAnnotator();
        if (metaData.readOnly === true) {
            EventBus.publish('Readonly:apply');
            if (hasMathEditor === true) {
                for (annKey in annotationMap) {
                    if (Helper.objectHasKey(annotationMap, annKey) === true) {
                        annDatas = annotationMap[annKey];
                        pushAnnotationToBag(annDatas, 'math');
                    }
                }
            }
        }
        if (Features.isFeatureEnabled('Editor.AnnotateOnImage') === true &&
            Features.isFeatureEnabled('Editor.HighResImage.Enable') === true &&
            Features.isFeatureEnabled('Editor.HighResImage.Annotation') === true
        ) {
            pushHighResAnnoationIntoBag();
        }
        loadEditorDependencyPlugins(articleContainer);
        loadPaginate();
        checkSaveChangeOnUnload();
        attachTabChangeEvents();
        attachGenerateMenuOnTabChange();
        loadEditSummary();
    }

    function editSuccessLoad() {
        updateEditorHeight(articleContainer);

        if (metaData && metaData.readOnly === false) {
            readonlyContainer.style.display = 'none';
            if (showPaginateProof === false) {
                EventBus.publish('Loader:hide');
            }
        }
        else {
            readonlyContainer.style.display = 'block';
            readonlyContainer.innerHTML = metaData.readOnlyReason;
            submitBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            EventBus.publish('Loader:hide');
        }
        loadPlugins(metaData.readOnly);
        tabHandlerInit.setMetaData(metaData.validatorQueries);
        EventBus.publish('BootstrapLoader:setPercentage', 100);
    }

    function initSyncElement() {
        var actualNode, syncNode, clonedNode, elem, elementSyncContainer,
            options = {
                'subtree': true,
                'attributes': true
            };

        actualNode = articleContainer.querySelector('.authgrp');
        syncNode = supplementaryContainer.querySelector('.authgrp');
        if (Helper.isNull(actualNode) === true ||
            Helper.isNull(syncNode) === true
        ) {
            return;
        }
        clonedNode = actualNode.cloneNode(true);
        elem = ElementSyncFormatter.changeElementSyncAttrs(window, clonedNode, 'elementsync');
        syncNode.innerHTML = elem.innerHTML;
        elementSyncContainer = new ElementSync(window, document);
        elementSyncContainer.setChangeElementSyncAttrCallbacks(
            ElementSyncFormatter.changeElementSyncAttrs,
            ElementSyncFormatter.changeActualElementAttrs
        );
        elementSyncContainer.setOptions(options);
        elementSyncContainer.synchronize(actualNode, syncNode);
        editSummaryInst.setSyncElementContainer(actualNode, syncNode);
        queryPersistor.setSyncElementContainer(syncNode);
    }

    function suppSuccessLoad() {
        if (
            metaData.readOnly === false &&
            Features.isFeatureEnabled('Editor.GeneralAttachment') === true
        ) {
            initAttachmentPanel();
        }
        if (Features.isFeatureEnabled('Editor.ElementSync') === true) {
            initSyncElement();
        }
        loadEditorDependencyPlugins(supplementaryContainer);
        loadEditSummary();
    }

    function bootstrapDialogLoad() {
        var dialogContainer = document.querySelector('.bootstrap-dialog-container'),
            bootstrapDialog = new BootstrapDialog(
                window, document, EventBus, dialogContainer
            );

        bootstrapDialog.setMetaData(metaData);
        bootstrapDialog.render();
        bootstrapDialog.show();
    }

    function downloadPdfSaveComplete() {
        performanceLog.pushLoadTimeline('Save', startTime, startDate);
        setSaveInprogress(false);
        EventBus.publish('Editor:SaveComplete');
        editorInst.clearChangedFlag();
        if (suppInst !== null) {
            suppInst.clearChangedFlag();
        }
    }

    function downloadPdfSaveError() {
        setSaveInprogress(false);
        EventBus.publish('Editor:SaveFailed');
    }

    function ProofValidatorApp(Token, CurrentActor) {
        articleToken = Token;
        currentActor = CurrentActor;
        this.requestBuilder = new RequestBuilder();
        parentContainer = document.querySelector('.container');
        helpLink = document.querySelector('.action-buttons .help-link');
        actionButtonBlock = document.querySelector('.action-buttons');
        modeButtonBlock = document.querySelector('.container .mode-buttons');
        proofviewContainer = document.querySelector('.proofview');
        rightpanelElement = document.querySelector('.right-panels');
        saveBtn = document.querySelector('.action-buttons .saveBtn');
        submitBtn = document.querySelector('.action-buttons .submitBtn');
        readonlyContainer = document.querySelector('.readonly-message-container');
        xmlSaveBtn = document.querySelector('.xml-editor-action-buttons .saveBtn');
        modeButtons = document.querySelector('.container .mode-buttons');
        xmlEditorBtn = modeButtonBlock.querySelector('.xmlEditorBtn');
        proofModeButtons = modeButtonBlock.querySelector('.proofBtn');
        editorBtn = modeButtonBlock.querySelector('.editorBtn');
        saveErrorMessage = Config.getLocaleByKey('server.save.error');
        saveErrorReloadMessage = Config.getLocaleByKey('server.save.reload');
        EventBus.subscribe('Editor:Loaded', editSuccessLoad, this);
        EventBus.subscribe('Supplementary:Loaded', suppSuccessLoad, this);
        EventBus.subscribe('EditSummary:Load', loadEditSummary);
        EventBus.subscribe('Annotation:onComplete', loadEditSummary);
        EventBus.subscribe('Annotation:onDelete', loadEditSummary);
        EventBus.subscribe('Annotation:onCreate', loadEditSummary);
        EventBus.subscribe('DownloadPdfSave:Complete', downloadPdfSaveComplete);
        EventBus.subscribe('DownloadPdfSave:Error', downloadPdfSaveError);
        EventBus.subscribe('Editor:autoSave', autoSave);
        EventBus.subscribe('Save:removeChanges', removeChangeFlags);
    }

    function initTabHandler() {
        var editorTabContainer;

        editorTabContainer = document.querySelector('.editor-parent-container');
        articleTabPanel = new TabPanel(
            editorTabContainer, document, window, EventBus, localeData
        );
        tabHandlerInit = new TabHandlerInit(window, document, articleTabPanel);
        tabHandlerInit.setRightPaneElement(rightpanelElement);
    }

    function autoCommitAll(instance, callback) {
        var submitInterval, setSubmitInterval,
            threshold = 0;

        autoCommit.saveAll();
        setSubmitInterval = function setSubmitIntervalFn() {
            submitInterval = setInterval(function submitIntervalFn() {
                threshold += 1;
                if (XMLRequest.hasPendingRequests() === true) {
                    if (threshold > saveThreshold) {
                        clearInterval(submitInterval);
                        EventBus.publish('alert:show', saveErrorMessage);
                    }
                    return;
                }
                clearInterval(submitInterval);
                callback.call(instance);
            }, 1 * 1000);
        };
        setSubmitInterval();
    }

    function initEditor(instance) {
        var articleTabId, enableSaveBtn;

        articleTabPanel.renderComponentStyle();
        articleTabPanel.render();
        articleTabPanel.hideTabScroller();
        articleTabPanel.setName('main');
        htmlSaveQueue = new RequestQueue();

        editorInit = new EditorInit(window, document, htmlSaveQueue, currentActor);
        articleContainer = document.querySelector('.editor');
        editorInst = editorInit.initiate(articleContainer, articleToken);
        saveBtn.addEventListener('click', function saveClick() {
            autoCommitAll(instance, autoSave);
        }, false);
        EventBus.subscribe('Editor:HasUnsavedChanges', function unsaveChanges() {
            if (saveBtn.classList.contains('progress') === false) {
                saveBtn.disabled = false;
            }
        });
        EventBus.subscribe('Editor:SaveInProgress', function saveProgress() {
            saveBtn.disabled = true;
            saveBtn.classList.add('progress');
            submitBtn.disabled = true;
        });
        enableSaveBtn = function enableSave() {
            if (editorInst.hasUnsavedChanges() === true) {
                saveBtn.disabled = false;
            }
            saveBtn.classList.remove('progress');
            submitBtn.disabled = false;
        };
        EventBus.subscribe('Editor:SaveComplete', enableSaveBtn);
        EventBus.subscribe('Editor:SaveFailed', enableSaveBtn);
        saveBtn.disabled = true;
        xmlSaveBtn.disabled = true;
        articleTabId = articleTabPanel.add(
            Config.getLocaleByKey('main.article.tab'), articleContainer
        );
        tabHandlerInit.setPanels(articleTabId, 'article', articleContainer, editorInst, true);
        isEditorInit = true;
    }

    function initSupplementary() {
        supplementaryContainer = document.querySelector('.supplementary');
        supplementaryInit = new SupplementaryInit(window, document, articleContainer);
        suppInst = supplementaryInit.initiate(supplementaryContainer, articleToken);
        isSupplementaryInit = true;
    }

    function initAbout() {
        aboutContainer = document.querySelector('.about');
        aboutInst = new AboutInit(window, document, articleContainer);
        isAboutInit = true;
    }

    function isPaginateEnabled() {
        var plugins = Config.get('Plugins');

        if (
            Helper.objectHasKey(plugins, 'Paginate') === true &&
            Helper.objectHasKey(plugins.Paginate, 'enable') === true &&
            plugins.Paginate.enable === true
        ) {
            return true;
        }
        return false;
    }

    function initiateProofPanel(instance) {
        if (isPaginateEnabled() === false) {
            console.log('Paginate plugin disabled');
            return false;
        }
        paginateInit = new PaginateInit(
            window, document, articleToken, currentActor
        );
        paginateInit.initiate();
        isPaginateInit = true;
        return true;
    }

    function getDialogPanel() {
        var dialogContainer = document.querySelector('.dialog-popup-container');

        if (Helper.isUndefined(dialogPopupPanel) === true) {
            dialogPopupPanel = new DialogPopupPanel(
                dialogContainer, document, window, EventBus, localeData
            );
        }
        return dialogPopupPanel;
    }

    function initMathEditor() {
        var dialogPanel = getDialogPanel(),
            mathContainer = document.querySelector('.math-container');

        if (Helper.isObject(window.com) === false) {
            console.log('wiris object not found. math editor loading failed.');
            return;
        }
        mathInit = new MathEditorInit(
            window, document, mathContainer, dialogPanel, articleToken,
            Config.getRoute('conversionEndPoint'),
            Config.getRoute('imageSaveEndPoint'), annotationBag
        );
        mathEditorInst = mathInit.initiate();
    }

    function submitSuccess(response) {
        var withQueryMsg, emptyQueryMsg,
            queryBagItems = queryBag.getAll(),
            unAnswerQueryCount = queryBag.getUnAnswerQueryCount();

        EventBus.publish('Loader:hide');
        if (queryBagItems.length > 0 && unAnswerQueryCount > 0) {
            withQueryMsg = metaData.messages.alert.withQuery;
            alert(withQueryMsg);
        }
        else {
            emptyQueryMsg = metaData.messages.alert.emptyQuery;
            alert(emptyQueryMsg);
        }
        window.location.reload();
    }

    function submitFailure(response) {
        var resp = JSON.parse(response);

        EventBus.publish('Loader:hide');
        alert(resp.message);
    }

    function submitTimeout(response) {
        EventBus.publish('Loader:hide');
        console.log('Submit timeout');
    }

    function submit() {
        var saveData, submitFn, withQueryMsg, emptyQueryMsg,
            request, rB = new RequestBuilder(),
            token = articleToken,
            instance = this,
            formData = new FormData(),
            confirmMessage = metaData.messages.conformation,
            stageAlert = metaData.messages.stageAlert,
            queryBagItems = queryBag.getAll(),
            unAnswerQueryCount = queryBag.getUnAnswerQueryCount();

        if (
            Helper.isUndefined(stageAlert) === false &&
            Helper.isEmptyString(stageAlert) === false &&
            (queryBagItems.length > 0 && unAnswerQueryCount > 0)

        ) {
            if (confirm(stageAlert) === false) {
                return;
            }
        }
        if (queryBagItems.length > 0 && unAnswerQueryCount > 0) {
            withQueryMsg = confirmMessage.withQuery;
            if (confirm(withQueryMsg) === false) {
                return;
            }
        }
        else {
            emptyQueryMsg = confirmMessage.emptyQuery;
            if (confirm(emptyQueryMsg) === false) {
                return;
            }
        }

        Connectivity.clearTimer();

        submitFn = function submitFunction() {
            setSaveInprogress(false);
            saveData = JSON.stringify({
                'optToken': token,
                'mode': 'online',
                'actor': currentActor.toUpperCase()
            });
            formData.append('json', saveData);

            rB.setUrl(Config.getRoute('submitEndPoint'));
            rB.setMethod('POST');
            rB.setData(formData);
            rB.setSuccessCallback(submitSuccess.bind(instance));
            rB.setFailureCallback(submitFailure);
            rB.setTimeoutCallback(submitTimeout);
            request = rB.build();
            request.send();
        };

        EventBus.publish('Loader:show', 9999);
        if (editorInst.hasUnsavedChanges() === true ||
            (suppInst !== null &&
              suppInst.hasUnsavedChanges() === true)
            ) {
            autoSave({
                'successCallback': function onSuccessCallback() {
                    saveSuccess.call(self);
                    submitFn();
                },
                'failureCallback': function onFailureCallback() {
                    EventBus.publish('Loader:hide');
                    saveFailure.call(self);
                },
                'timeoutCallback': function onTimeoutCallback() {
                    EventBus.publish('Loader:hide');
                    saveTimeout.call(self);
                }
            });
        }
        else {
            submitFn();
        }
    }

    function initiateSubmitBtnHandler(instance) {
        submitBtn.addEventListener('click', function submitClick() {
            autoCommitAll(instance, submit);
        }, false);
    }

    function initiateEditToolTip() {
        toolTipInst = new ToolTip(window, document, EventBus);
    }

    function loadMathEditor(container) {
        initMathEditor();
        mathInit.setAnnotationData(metaData.annotations);
        mathInit.renderMathOnEquations(container);
        mathEditorInst.setProofEnable(showPaginateProof);
    }

    function articleReadonly() {
        EventBus.publish('contextMenu:destroy');
        EventBus.publish('Annotator:destroy');
        EventBus.publish('Math:destroy');
        EventBus.publish('Editor:removeEvent');
        EventBus.publish('Query:setReadonly');
    }

    function checkConnectivity() {
        var pingEndPoint, pingInterval, pingTimeout;

        pingEndPoint = Config.getRoute('pingEndPoint');
        pingInterval = Config.get('pingInterval');
        pingTimeout = Config.get('pingTimeout');
        Connectivity.check(pingEndPoint, {'interval': pingInterval, 'timeout': pingTimeout});
    }

    function saveXmlClickCount(token, actor) {
        var request,
            rB = new RequestBuilder(),
            formData = new FormData(),
            data = {};

        data.optToken = token;
        data.actor = actor;
        formData.append('json', JSON.stringify(data));
        rB.setUrl(Config.getRoute('xmlClickEndpoint'));
        rB.setMethod('POST');
        rB.setData(formData);
        request = rB.build();
        request.send(request);
    }

    function xmlEditorBtnOnClick() {
        var warning, warningMsg = [
                'Switching to XmlEditor will render Edit view readOnly. ',
                'Are you sure you want to continue?'
            ],
            unsavedChangesMsg = [
                'You have unsaved changes. Save the changes before proceeding ',
                'to Xml Editor.'
            ],
            unansweredQueriesMsg = [
                'You have unanswered queries pending. Answer all queries before ',
                'proceeding to Xml Editor.'
            ];

        if (Connectivity.getStatus() === false) {
            return;
        }
        warning = new DialogPopup(document, window, EventBus);
        warning.setTitle('Note');
        warning.setWidth(400);
        warning.setName('editToXmlMode');
        warning.renderComponentStyle();

        if (editorInst.hasUnsavedChanges() === true) {
            warning.showButtons(['ok']);
            warning.setButtonText('ok', 'OK');
            warning.setContent(unsavedChangesMsg.join(''));
            warning.render();
            return;
        }

        if (queryBag.getAll().length > 0 && queryBag.getUnAnswerQueryCount() > 0) {
            warning.showButtons(['ok']);
            warning.setButtonText('ok', 'OK');
            warning.setContent(unansweredQueriesMsg.join(''));
            warning.render();
            return;
        }

        warning.showButtons(['yes', 'no']);
        warning.setContent(warningMsg.join(''));
        if (editorReadOnly === false &&
            editToXmlModeEventsSubscribed === false &&
            metaData.readOnly === false
        ) {
            EventBus.subscribe('dialog:editToXmlMode:yes', function switchToXml() {
                var rB = new RequestBuilder(),
                    formData = new FormData(),
                    request;

                if (editorReadOnly === false) {
                    formData.append('token', articleToken);
                    formData.append('data', JSON.stringify({'mode': 'xml'}));
                    rB.setUrl(Config.getRoute('modeSaveEndpoint'));
                    rB.setMethod('POST');
                    rB.setData(formData);
                    request = rB.build();
                    request.send(request);
                }
                saveXmlClickCount(articleToken, currentActor);
                xmlEditorInst.switchToXmlEditor(articleToken, currentActor, metaData);
                if (metaData.readOnly === false) {
                    xmlEditorInst.xmlChangeNotSaved();
                }
            });
            editToXmlModeEventsSubscribed = true;
        }
        else {
            if (metaData.readOnly === false) {
                saveXmlClickCount(articleToken, currentActor);
            }
            xmlEditorInst.switchToXmlEditor(articleToken, currentActor, metaData);
            return;
        }
        warning.render();
        return;
    }

    function loadEditor() {
        var articleHtml;

        if (isEditorInit === false) {
            throw new Error('error.editor_not_init');
        }
        articleHtml = metaData.htmlContent;
        if (metaData.readOnly === false) {
            editorInst.setEventBind(true);
        }
        editorInit.load(articleHtml);
    }

    function bootstrapSkin(instance) {
        initTabHandler();
        initEditor(instance);
        initSupplementary(instance);
        initAbout();
        initAutoCommit();
        initiateSubmitBtnHandler(instance);
        initiateEditToolTip();
        initiateProofPanel(instance);
    }

    ProofValidatorApp.prototype.metaSuccessCallback = function successCallback(
        response
    ) {
        var parseData, saveTimer, scriptElem, xmlEditorEnabled;

        if (Helper.isEmptyString(response)) {
            throw new Error('error.invalid_response_data');
        }

        parseData = JSON.parse(response);
        metaData = parseData.data;
        annotationMap = metaData.annotations;
        optError = metaData.optError;
        showPaginateProof = Features.isFeatureEnabled('ShowPaginateProof');
        hasMathEditor = Features.isFeatureEnabled('Editor.Math.Editing');
        xmlEditorEnabled = Features.isFeatureEnabled('XmlEditor.Enable');
        bootstrapSkin(this);

        if (xmlEditorEnabled === true) {
            xmlEditorInst = new XmlEditorInit(window, document);
            xmlEditorInst.bootstrap();
            xmlEditorBtn.addEventListener('click', xmlEditorBtnOnClick, false);
        }

        if (hasMathEditor === true && metaData.readOnly === false) {
            scriptElem = document.createElement('script');
            scriptElem.setAttribute('src', Config.getRoute('wirisScriptUrl'));
            scriptElem.onload = function load() {
                loadMathEditor(articleContainer);
            };
            document.body.appendChild(scriptElem);
        }
        if (Helper.isEmptyString(metaData.surveyMonkeyLink) === false) {
            isSurveyInit = true;
        }
        loadEditor(metaData);

        if (metaData.mode === 'xml' && xmlEditorEnabled === true) {
            xmlEditorInst.switchToXmlEditor(articleToken, currentActor, metaData);
            if (metaData.readOnly === false) {
                xmlEditorInst.xmlChangeNotSaved();
            }
            return;
        }
        else if (xmlEditorEnabled === false) {
            xmlEditorBtn.classList.remove('show');
            xmlEditorBtn.classList.add('hide');
        }

        if (saveTimer !== null) {
            clearTimeout(saveTimer);
        }
        if (Features.isFeatureEnabled('ShowInfoDialog') === true) {
            if (metaData.readOnly === false && showPaginateProof === true) {
                bootstrapDialogLoad();
            }
        }
        else {
            EventBus.publish('Loader:hide');
        }
        saveTimer = setInterval(autoSave, 2 * 60 * 1000);
        if (Features.isFeatureEnabled('InternetConnectivity') === true) {
            checkConnectivity();
        }
    };

    function setReadOnly(readOnlyMessage) {
        tabHandlerInit.setCollapsiblePanels('insert', null);
        tabHandlerInit.setCollapsiblePanels('instruct', null);
        instructPanel = null;
        insertPanel = null;
        detachGenerateMenuOnTabChange();
        EventBus.publish('contextMenu:destroy');
        EventBus.publish('InsertPanel:destroy');
        EventBus.publish('InstructPanel:destroy');
        EventBus.publish('Query:setReadonly');
        loadMathEquationsReadonly(articleContainer, true);
        queryContainer.classList.add('readonly');
        submitBtn.style.display = 'none';
        saveBtn.style.display = 'none';
        if (metaData.readOnly === false) {
            if (Helper.isUndefined(readOnlyMessage) === false) {
                readonlyContainer.innerHTML = Config.getLocaleByKey(readOnlyMessage);
                readonlyContainer.style.display = 'block';
            }
            return;
        }

        readonlyContainer.innerHTML = metaData.readOnlyReason;
        readonlyContainer.style.display = 'block';
    }

    function disableReadOnly() {
        var panels, activeTabId;

        panels = tabHandlerInit.getPanels();
        activeTabId = tabHandlerInit.articleTabPanel.getActiveTabId();
        if (Helper.objectHasKey(panels, activeTabId) === true) {
            EventBus.publish('TabPanel:ReloadMenu',
                panels[activeTabId].container
            );
        }
        initInsertPanel();
        initInstructPanel();
        instructPanel.setMetadata(metaData.instructs);
        EventBus.publish('Query:disableReadonly');
        loadMathEquationsReadonly(articleContainer, false);
        readonlyContainer.innerHTML = '';
        readonlyContainer.style.display = 'none';
        queryContainer.classList.remove('readonly');
        submitBtn.style.display = 'inline';
        saveBtn.style.display = 'inline';
    }

    function removeDatachanges(nodes, nodesLength) {
        var i = 0;

        if (nodesLength > 0) {
            for (; i < nodesLength; i += 1) {
                nodes[i].removeAttribute('data-changes');
            }
        }
    }

    function getSelectionAlertMessage(instance, key, elementName) {
        var tmpNode, errorMessage;

        errorMessage = Config.getLocaleByKey(key);
        tmpNode = document.createElement(elementName);
        tmpNode.innerHTML = errorMessage;
        return tmpNode;
    }

    function checkChangesAndReload(status, instance) {
        var nodes, nodesLength, okCallbackFn, tmpNode, firstAlertNode,
            secondAlertNode;

        okCallbackFn = function callbackFn() {
            if (status === true) {
                window.location.reload();
            }
        };

        nodes = document.querySelectorAll('[data-changes]');
        nodesLength = nodes.length;
        firstAlertNode = getSelectionAlertMessage(instance,
            'connection.alive', 'div'
        );

        tmpNode = document.createElement('div');
        tmpNode.appendChild(firstAlertNode);

        if (nodesLength > 0) {
            secondAlertNode = getSelectionAlertMessage(instance,
                'connection.alive.with.changes', 'div'
            );
            removeDatachanges(nodes, nodesLength);
            tmpNode.appendChild(secondAlertNode);
        }
        else if (xmlEditorInst.isXmlEdiotrPanelDirty() === true) {
            secondAlertNode = getSelectionAlertMessage(instance,
                'connection.alive.with.changes', 'div'
            );
            xmlEditorInst.cleanXmlEditorPanel();
            tmpNode.appendChild(secondAlertNode);
        }

        EventBus.publish('alert:show', tmpNode,
            {'name': 'connectivityOn', 'callbackInstance': instance,
                'callback': okCallbackFn, 'width': 570
            }
        );
    }

    function showConnectionPopUp(status, instance) {
        var content, options;

        options = {'autoClose': false, 'closeButton': false};
        if (status === false) {
            content = Config.getLocaleByKey('connection.not.alive');
            EventBus.publish('FlashMessage:show', content, options);
            EventBus.publish('alert:show', content, {'name': 'connectivity', 'width': 500});
            return;
        }

        checkChangesAndReload(status, instance);
    }

    function toggleTopMenuAction(enable) {
        var actionButtonLeft;

        actionButtonLeft = actionButtonBlock.querySelector('.left');
        if (enable === false) {
            actionButtonLeft.style.display = 'none';
            return;
        }

        actionButtonLeft.style.display = 'inline';
    }

    function toggleReadOnlyMode(status) {
        if (status === false) {
            if (metaData.readOnly === true) {
                toggleTopMenuAction(false);
            }
            else {
                setReadOnly();
                enableBlocker();
                toggleTopMenuAction(false);
                EventBus.publish('QueryEditor:makeReadonly');
            }
        }
        showConnectionPopUp(status, this);
    }

    function switchToHtmlEditor(readOnly, setModeData) {
        var xmlEditorContainer = document.querySelector('.xml-editor-container'),
            xmlEditorAccordianContainer = document.querySelector('.xml-editor-accordian-container'),
            xmlEditorActionButtons = document.querySelector('.xml-editor-action-buttons'),
            editorContainer = document.querySelector('.editor-container'),
            editorAccordianContainer = document.querySelector('.right-panels'),
            rB = new RequestBuilder(), formData = new FormData(), request,
            requestBuilder = new RequestBuilder();

        editorContainer.classList.remove('hide');
        editorAccordianContainer.classList.remove('hide');
        editorContainer.classList.add('show');
        editorAccordianContainer.classList.add('show');
        xmlEditorContainer.classList.add('hide');
        xmlEditorAccordianContainer.classList.add('hide');
        xmlEditorActionButtons.classList.add('hide');
        xmlEditorBtn.disabled = false;
        editorBtn.disabled = true;
        if (editorInit.isLoaded(articleContainer) === false) {
            EventBus.publish('Loader:show', 1000);
            requestBuilder.setUrl(metaData.filePath);
            requestBuilder.setSuccessCallback(function getHtmlSuccess(articleHtml) {
                editorInit.load(articleHtml, articleTabPanel);
            });
            requestBuilder.setFailureCallback(function getHtmlFailure(error) {
                alert('Article Loading Failed');
                EventBus.publish('Loader:hide');
                console.log(error);
            });
            requestBuilder.setTimeoutCallback(function getHtmlTimeout() {
                EventBus.publish('Loader:hide');
                alert('Article Loading Timedout');
            });
            (requestBuilder.build()).send();
        }

        if (readOnly === true) {
            editorReadOnly = true;
            EventBus.publish('Editor:ReadOnly:Apply', 'editor.readonly.apply');
        }
        else {
            editorReadOnly = false;
            formData.append('token', articleToken);
            formData.append('data', JSON.stringify(setModeData));
            rB.setUrl(Config.getRoute('modeSaveEndpoint'));
            rB.setMethod('POST');
            rB.setData(formData);
            request = rB.build();
            request.send(request);
            EventBus.publish('Editor:ReadOnly:Disable');
        }
        xmlEditorInst.setIsEditorReadOnly(editorReadOnly);
    }

    ProofValidatorApp.prototype.bootstrap = function bootstrap() {
        localeData = Config.getLocale();
        performanceLog = new PerformanceLog(articleToken, currentActor);

        EventBus.subscribe('Readonly:apply', articleReadonly);
        EventBus.subscribe('Editor:ReadOnly:Apply', setReadOnly, this);
        EventBus.subscribe('Editor:ReadOnly:Disable', disableReadOnly, this);
        EventBus.subscribe('Editor:Switch:Html', switchToHtmlEditor);
        EventBus.subscribe('connectivity:status', toggleReadOnlyMode, this);
    };

    return ProofValidatorApp;
});

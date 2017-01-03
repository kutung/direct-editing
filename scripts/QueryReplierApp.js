define([
    'scripts/EditorInit', 'scripts/SupplementaryInit', 'scripts/AboutInit',
    'scripts/QueriesInit', 'scripts/InsertPanel', 'scripts/InstructPanel',
    'scripts/TabHandlerInit', 'scripts/EditSummaryInit', 'scripts/ContextualMenuInit',
    'scripts/AnnotatorInit', 'scripts/MathEditorInit', 'scripts/DialogPopupPanel',
    'scripts/ErrorHandler', 'scripts/ConfigReader', 'scripts/RequestBuilder',
    'scripts/QueryEditorPanel', 'scripts/QueryBag', 'scripts/QueryPersistor',
    'scripts/RequestQueue', 'scripts/Request', 'scripts/Helper', 'scripts/TabPanel',
    'scripts/ToolTip', 'scripts/EventBus', 'scripts/PerformanceLog', 'scripts/PaginateInit',
    'scripts/AnnotationBag', 'scripts/ToggleImage', 'customer/Config',
    'scripts/ImageViewer', 'scripts/AutoCommit', 'scripts/ElementSyncFormatter',
    'scripts/ElementSync', 'scripts/Connectivity', 'scripts/QuickLinkInit',
    'scripts/FeatureToggle', 'scripts/Util'
], function QueryReplierAppLoader(
    EditorInit, SupplementaryInit, AboutInit, QueriesInit, InsertPanel, InstructPanel,
    TabHandlerInit, EditSummaryInit, ContextualMenuInit, AnnotatorInit, MathEditorInit,
    DialogPopupPanel, ErrorHandler, Config, RequestBuilder, QueryEditorPanel, QueryBag,
    QueryPersistor, RequestQueue, XMLRequest, Helper, TabPanel, ToolTip, EventBus, PerformanceLog,
    PaginateInit, AnnotationBag, ToggleImage, CustomerConfig, ImageViewer, AutoCommit,
    ElementSyncFormatter, ElementSync, Connectivity, QuickLinkInit, Features, Util
) {
    var articleTabPanel, articleContainer, supplementaryContainer, editorInit,
        aboutInst, aboutContainer, htmlSaveQueue, editSummaryInst, helpLink,
        parentContainer, tabHandlerInit, annotatorInit, mathInit, mathEditorInst,
        insertPanel, instructPanel, readonlyContainer, queryBag, optError,
        suppInst, editSummaryTabPanel, saveBtn, submitBtn, articleToken,
        currentActor, performanceLog, queryPersistor,
        paginateInit, annotationBag, supplementaryInit,
        metaData, queriesInit, queryTabPanel, editorInst, actionButtonBlock,
        rightpanelElement, autoCommit, queryContainer,
        annotationMap = {},
        toolTipInst,
        isEditorInit = false,
        isSupplementaryInit = false,
        isAboutInit = false,
        isQueriesInit = false,
        isEditSummaryInit = false,
        saveThreshold = 15,
        localeData, isPaginateInit = false,
        quickLinksInst, isQuickLinkInit = false;

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
            supplementaryInit.load(metaData);
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

    function loadAboutContent() {
        var aboutTabId;

        if (isAboutInit === false) {
            throw new Error('error.about_not_init');
        }
        aboutInst.load(aboutContainer, metaData.actorsCompletedDetails);
        aboutTabId = articleTabPanel.add(
            Config.getLocaleByKey('main.about.tab'), aboutContainer);
        updateEditorHeight(aboutContainer);
    }

    function loadQueries() {
        queryContainer = document.querySelector('.query-container');
        queryTabPanel = new TabPanel(
            queryContainer, document, window, EventBus, localeData
        );
        queryTabPanel.renderComponentStyle();
        queryTabPanel.render();
        queryTabPanel.setTitle('Queries');
        queryTabPanel.setName('query');
        tabHandlerInit.setCollapsiblePanels('query', queryTabPanel);

        queryBag = new QueryBag(window, document, queryTabPanel);
        queryPersistor = new QueryPersistor(
            articleContainer, supplementaryContainer,
            {
                'updateEndPoint': Config.getRoute('QueryReplierEndPoint'),
                'saveEndPoint': '',
                'removeEndPoint': ''
            }, EventBus, articleToken, queryBag, currentActor
        );

        queriesInit = new QueriesInit(
            window, document, articleToken, currentActor, queryPersistor, queryBag
        );
        queriesInit.setQueryTab(queryTabPanel);
        queryTabPanel.hide();
        tabHandlerInit.setQueryBag(queryBag);
        isQueriesInit = true;
        autoCommit.addItem(
            'query', queryContainer, queriesInit.autoSave, queriesInit
        );
        EventBus.subscribe('EmptyJmQueryTab:Activate', getTabId);

        queriesInit.setCorrectorQueries(metaData.queries);
        queriesInit.setProblemTypes(metaData.problemTypes);
        queriesInit.setValidatorQueries(metaData.validatorQueries);
        queriesInit.setPluginDepns(
            editorInst, suppInst, editSummaryTabPanel, articleTabPanel,
            insertPanel, instructPanel
        );
        queriesInit.loadForJM(
            metaData.readOnly
        );
        queryTabPanel.show();
        queryTabPanel.showTabScroller();
    }

    function initAnnotator(instance) {
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
        annotatorInit.isReadOnly(true);
        annotatorInit.renderAnnotatorOverImages(container, metaData.annotations);
    }

    function loadToolTip(container) {
        toolTipInst.render(container);
    }

    function getRevisionCallback() {
        return Number(saveBtn.dataset.revisionId);
    }

    function loadPaginate() {
        var newRevisionId;

        if (isPaginateInit === false) {
            return;
        }
        EventBus.subscribe('Editor:HasUnsavedChanges', function hasChnage() {
            newRevisionId = Number(saveBtn.dataset.revisionId) + 1;
            saveBtn.dataset.revisionId = newRevisionId;
        });
        paginateInit.load(
            editorInst,
            metaData,
            getRevisionCallback
        );
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
        var attachments, annotations, attachmentsMetaData, replaceImageMetaData;

        if (isEditSummaryInit === false) {
            throw new Error('error.edit_summary_not_init');
        }
        annotations = getAnnotation();
        attachments = getAttachmentInstruct();
        if (Features.isFeatureEnabled('Editor.GeneralAttachment') === true) {
            attachmentsMetaData = metaData.generalAttachment;
        }
        if (Features.isFeatureEnabled('Editor.ReplaceImage') === true) {
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

    function attachTabChangeEvents() {
        EventBus.subscribe('Tabpanel:onActivate', tabHandlerInit.onChange, tabHandlerInit);
        EventBus.subscribe('MainTabPanel:change', tabHandlerInit.onEditorTabChange, tabHandlerInit);
        EventBus.subscribe('Panel:onShow', tabHandlerInit.onCollapse, tabHandlerInit);
    }

    function attachGenerateMenuOnTabChange() {
        EventBus.subscribe('contextMenu:onDestroy', tabHandlerInit.regenerateMenuOnTabChange, this);
    }

    function detachGenerateMenuOnTabChange() {
        EventBus.unsubscribe('contextMenu:onDestroy', tabHandlerInit.regenerateMenuOnTabChange, this);
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

    function initAutoCommit() {
        autoCommit = new AutoCommit(window, document, EventBus, tabHandlerInit);
    }

    function pushAnnotationToBag(annDatas, type) {
        var i, annData;

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

    function loadQuickLink() {
        if (isQuickLinkInit === true) {
            quickLinksInst.load();
        }
    }

    function reloadQuickLink() {
        var activePane = tabHandlerInit.currentActivePane;
        if (isQuickLinkInit === true) {
            if (activePane === 'quick-links') {
                quickLinksInst.clean();
                loadQuickLink();
            }
        }
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

    function initEditSummaryPanel() {
        var editSummaryTabContainer = document.querySelector('.edit-summary-tab'),
            authorEditSummaryContainer = document.querySelector('.edit-summary-author'),
            ceEditSummaryContainer = document.querySelector('.edit-summary-copy-editor');
            instructSummaryContainer = document.querySelector('.edit-summary-instruct');

        editSummaryInst = new EditSummaryInit(
            window, document, authorEditSummaryContainer, ceEditSummaryContainer, instructSummaryContainer
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

    function loadImageViewer(container) {
        var imageViewer;

        imageViewer = new ImageViewer(
            document, window, container, EventBus, metaData.replaceImage
        );
        imageViewer.render();
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

    function loadPlugins() {
        var annKey, annDatas;

        loadSupplementary();
        initEditSummaryPanel();
        if (Features.isFeatureEnabled('Editor.Query.Enable') === true) {
            loadQueries();
        }
        if (Features.isFeatureEnabled('Editor.Navigate.Enable') === true) {
            initQuickLinksPanel();
        }
        initAnnotator();
        for (annKey in annotationMap) {
            if (annotationMap.hasOwnProperty(annKey)) {
                annDatas = annotationMap[annKey];
                pushAnnotationToBag(annDatas, 'math');
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
        attachTabChangeEvents();
        attachGenerateMenuOnTabChange();
        loadEditSummary();
    }

    function editSuccessLoad() {
        updateEditorHeight(articleContainer);

        if (metaData && metaData.readOnly === false) {
            readonlyContainer.style.display = 'none';
        }
        else {
            readonlyContainer.style.display = 'block';
            readonlyContainer.innerHTML = metaData.readOnlyReason;
            submitBtn.style.display = 'none';
            saveBtn.style.display = 'none';
        }
        EventBus.publish('Loader:hide');
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
    }

    function suppSuccessLoad() {
        if (Features.isFeatureEnabled('Editor.ElementSync') === true) {
            initSyncElement();
        }
        loadEditorDependencyPlugins(supplementaryContainer);
        loadEditSummary();
    }

    function QueryReplierApp(Token, CurrentActor) {
        this.token = Token;
        articleToken = Token;
        currentActor = CurrentActor;
        this.requestBuilder = new RequestBuilder();
        parentContainer = document.querySelector('.container');
        helpLink = document.querySelector('.help-link');
        saveBtn = document.querySelector('.action-buttons .saveBtn');
        actionButtonBlock = document.querySelector('.action-buttons');
        rightpanelElement = document.querySelector('.right-panels');
        saveBtn.style.display = 'none';
        submitBtn = document.querySelector('.action-buttons .submitBtn');
        readonlyContainer = document.querySelector('.readonly-message-container');
        EventBus.subscribe('Editor:Loaded', editSuccessLoad, this);
        EventBus.subscribe('Supplementary:Loaded', suppSuccessLoad, this);
        EventBus.subscribe('EditSummary:Load', loadEditSummary);
        EventBus.subscribe('Annotation:onComplete', loadEditSummary);
        EventBus.subscribe('Annotation:onDelete', loadEditSummary);
        EventBus.subscribe('Annotation:onCreate', loadEditSummary);
    }

    function initTabHandler() {
        var editorTabContainer = document.querySelector('.editor-parent-container');

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
        var articleTabId;

        articleTabPanel.renderComponentStyle();
        articleTabPanel.render();
        articleTabPanel.hideTabScroller();
        articleTabPanel.setName('main');
        htmlSaveQueue = new RequestQueue();

        editorInit = new EditorInit(window, document, htmlSaveQueue, currentActor);
        articleContainer = document.querySelector('.editor');
        aboutContainer = document.querySelector('.about');
        aboutContainer.style.display = 'none';
        editorInst = editorInit.initiate(articleContainer, articleToken);
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

    function checkUnansweredQuery() {
        var unAnsweredQueries = [],
            queryText,
            queries = queriesInit.getQueryPanels(),
            alertMessage;

        queries.forEach(function each(query) {
            if (query.isAnswered() === false) {
                unAnsweredQueries.push(query.getQueryId());
            }
        });
        if (unAnsweredQueries.length > 0) {
            if (unAnsweredQueries.length > 1) {
                queryText = 'queries';
            }
            else {
                queryText = 'query';
            }

            alertMessage = Config.getLocaleByKey('answer.all.queries');
            alertMessage = alertMessage.replace('{{queryText}}', queryText);
            alertMessage = alertMessage.replace(
                '{{unAnsweredQueries}}',
                 unAnsweredQueries.join('", "')
            );
            alert(alertMessage);
            return false;
        }

        return true;
    }

    function submitSuccess(response) {
        var alertMessage = metaData.messages.alert;

        EventBus.publish('Loader:hide');
        alert(alertMessage);
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
        var saveData, request,
            submitFn,
            instance = this,
            rB = new RequestBuilder(),
            token = articleToken,
            formData = new FormData(),
            confirmMessage = metaData.messages.conformation;

        if (checkUnansweredQuery() === false) {
            return;
        }

        if (confirm(confirmMessage) === false) {
            return;
        }

        Connectivity.clearTimer();

        submitFn = function submitFunction() {
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
        submitFn();
    }

    function initiateSubmitBtnHandler(instance) {
        submitBtn.addEventListener('click', function submitClick() {
            autoCommitAll(instance, submit);
        }, false);
    }

    function initiateEditToolTip() {
        toolTipInst = new ToolTip(window, document, EventBus);
    }

    function articleReadonly() {
        EventBus.publish('contextMenu:destroy');
        EventBus.publish('InsertPanel:destroy');
        EventBus.publish('InstructPanel:destroy');
        EventBus.publish('Annotator:destroy');
        EventBus.publish('Math:destroy');
        EventBus.publish('Editor:removeEvent');
        EventBus.publish('Query:setReadonly');
        tabHandlerInit.setCollapsiblePanels('insert', null);
        tabHandlerInit.setCollapsiblePanels('instruct', null);
        instructPanel = null;
        insertPanel = null;
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
        initSupplementary();
        initAutoCommit();
        initiateSubmitBtnHandler(instance);
        initiateEditToolTip();
        initiateProofPanel(instance);
    }

    function checkConnectivity() {
        var pingEndPoint, pingInterval, pingTimeout;

        pingEndPoint = Config.getRoute('pingEndPoint');
        pingInterval = Config.get('pingInterval');
        pingTimeout = Config.get('pingTimeout');
        Connectivity.check(pingEndPoint, {'interval': pingInterval, 'timeout': pingTimeout});
    }

    function setReadOnly() {
        queryContainer = document.querySelector('.query-container');

        detachGenerateMenuOnTabChange();
        EventBus.publish('Query:setReadonly');
        EventBus.publish('QueryEditor:makeReadonly');
        queryContainer.classList.add('readonly');
        submitBtn.style.display = 'none';
    }

    function getSelectionAlertMessage(instance, key, elementName) {
        var tmpNode, errorMessage;

        errorMessage = Config.getLocaleByKey(key);
        tmpNode = document.createElement(elementName);
        tmpNode.innerHTML = errorMessage;
        return tmpNode;
    }

    function checkChangesAndReload(status, instance) {
        var okCallbackFn, tmpNode, firstAlertNode;

        okCallbackFn = function callbackFn() {
            if (status === true) {
                window.location.reload();
            }
        };

        firstAlertNode = getSelectionAlertMessage(instance,
            'connection.alive', 'div'
        );
        tmpNode = document.createElement('div');
        tmpNode.appendChild(firstAlertNode);

        EventBus.publish('alert:show', tmpNode,
            {'name': 'connectivityOn', 'callbackInstance': instance,
                'callback': okCallbackFn, 'width': 570
            }
        );
    }

    function showConnectionPopUp(status) {
        var content, options;

        options = {'autoClose': false, 'closeButton': false};
        if (status === false) {
            content = Config.getLocaleByKey('connection.not.alive');
            EventBus.publish('FlashMessage:show', content, options);
            EventBus.publish('alert:show', content, {'name': 'connectivity', 'width': 500});
            return;
        }

        checkChangesAndReload(status, this);
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
                toggleTopMenuAction(false);
            }
        }
        showConnectionPopUp(status);
    }

    QueryReplierApp.prototype.metaSuccessCallback = function successCallback(
        response
    ) {
        var parseData;

        if (Helper.isEmptyString(response)) {
            throw new Error('error.invalid_response_data');
        }
        parseData = JSON.parse(response);
        metaData = parseData.data;
        optError = metaData.optError;
        bootstrapSkin(this);
        annotationMap = metaData.annotations;
        if (metaData.readOnly === true) {
            EventBus.publish('Readonly:apply');
        }
        loadEditor();
        if (Features.isFeatureEnabled('InternetConnectivity') === true) {
            checkConnectivity();
        }
    };

    QueryReplierApp.prototype.bootstrap = function bootstrap() {
        localeData = Config.getLocale();
        performanceLog = new PerformanceLog(
            this.token,
            this.currentActor
        );
        EventBus.subscribe('Readonly:apply', articleReadonly);
        EventBus.subscribe('connectivity:status', toggleReadOnlyMode, this);
    };
    return QueryReplierApp;
});

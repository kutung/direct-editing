define([
    'scripts/Dialog', 'scripts/ErrorHandler', 'scripts/ConfigReader',
    'scripts/RequestBuilder', 'scripts/Helper', 'scripts/EventBus',
    'scripts/PerformanceLog', 'scripts/Request', 'scripts/Connectivity',
    'scripts/FeatureToggle'

], function xmlEditorInitLoader(
    DialogPopupPanel, ErrorHandler, Config, RequestBuilder, Helper, EventBus,
    PerformanceLog, Request, Connectivity, Features
) {
    var metaData, saveBtn, submitBtn, articleToken, currentActor, performanceLog, startTime,
        startDate, modeButtons, xmlSaveBtn, xmlSubmitBtn, vtoolBtn, xmlEditorBtn,
        editorBtn, fullScreenBtn, editToXmlModeEventsSubscribed = false,
        xmlToEditModeEventsSubscribed = false, xmlEditorPanel = null, xmlEditSummaryPanel = null,
        isXmlValid = false, wirisLoaded = false, vtoolErrorPanel = null, doc = null,
        win = null, lastSavedXmlEditorVersion = null, xmlLoaded = false,
        assetListPanel = null, assetUploadPanel = null, editorReadOnly = false,
        xmlSaveTimer = null, isVtoolExecuted = false, readOnly = false,
        isXmlEditorLoaded = false, xmlEditorProcessingFlag = false,
        enableAnnatotatorProcess = false;

    function toggleTopMenuAction(status) {
        var xmlEditorActionButtons = doc.querySelector('.xml-editor-action-buttons'),
            replaceContainer = doc.querySelector('.replace-container');

        if (status === true) {
            if (xmlEditorBtn.disabled === true) {
                xmlEditorActionButtons.classList.remove('hide');
                xmlEditorActionButtons.classList.add('show');
            }
            if (Helper.isNull(replaceContainer) === false) {
                replaceContainer.style.display = 'inline';
            }
            return;
        }
        xmlEditorActionButtons.classList.remove('show');
        xmlEditorActionButtons.classList.add('hide');
        if (Helper.isNull(replaceContainer) === false) {
            replaceContainer.style.display = 'none';
        }
        if (Helper.isNull(xmlEditorPanel) === false) {
            xmlEditorPanel.setEnabled(false);
        }
    }

    function XmlEditorInit(Win, Doc) {
        win = Win;
        doc = Doc;
        xmlSaveBtn = doc.querySelector('.xml-editor-action-buttons .saveBtn');
        xmlSubmitBtn = doc.querySelector('.xml-editor-action-buttons .submitBtn');
        vtoolBtn = doc.querySelector('.xml-editor-action-buttons .vtoolBtn');
        modeButtons = doc.querySelector('.container .mode-buttons');
        xmlEditorBtn = modeButtons.querySelector('.xmlEditorBtn');
        editorBtn = doc.querySelector('.mode-buttons .editorBtn');
        fullScreenBtn = doc.querySelector('.xml-editor-action-buttons .fullscreenBtn');
        xmlSaveBtn.dataset.revisionId = 1;
        EventBus.subscribe('connectivity:status', toggleTopMenuAction);
    }

    function showVtoolErrorPanel(xmlEditorAccordianContainer, xmlEditorContainer) {
        xmlEditorAccordianContainer.classList.remove('hide');
        xmlEditorContainer.classList.remove('full');
        fullScreenBtn.dataset.fullscreen = 'off';
    }

    function makeXmlEditorFullScreen(xmlEditorAccordianContainer, xmlEditorContainer) {
        xmlEditorAccordianContainer.classList.add('hide');
        xmlEditorContainer.classList.add('full');
        fullScreenBtn.dataset.fullscreen = 'on';
    }

    function xmlRevisionProvider() {
        return parseInt(xmlSaveBtn.dataset.revisionId, 10);
    }

    function createStylesheetElement(url) {
        var link = doc.createElement('link');

        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', url);
        return link;
    }

    function fullScreenOnClick() {
        var xmlEditorContainer = doc.querySelector('.xml-editor-container'),
            xmlEditorAccordianContainer = doc.querySelector('.xml-editor-accordian-container');

        if (fullScreenBtn.dataset.fullscreen === 'on') {
            showVtoolErrorPanel(xmlEditorAccordianContainer, xmlEditorContainer);
        }
        else {
            makeXmlEditorFullScreen(xmlEditorAccordianContainer, xmlEditorContainer);
        }
    }

    function editorBtnOnClick() {
        var warning, warningMsg = [
                'By switching to Html Proof Editor, you will lose all the changes made with ',
                'Xml Editor.'
            ], setModeData = {};

        if (Connectivity.getStatus() === false) {
            return;
        }
        warning = new DialogPopupPanel(doc, win, EventBus);
        warning.setTitle('Switch to Html Proofing Mode?');
        warning.setName('xmlToEditMode');
        warning.setWidth(610);
        warning.showClose();
        warning.showButtons(['yes', 'no']);
        warning.setButtonText('yes', 'Discard Xml changes and go to Html Proof Editor');
        warning.setButtonText('no', 'Readonly Html Proof Editor');
        warning.setContent(warningMsg.join(''));
        if (xmlToEditModeEventsSubscribed === false) {
            EventBus.subscribe('dialog:xmlToEditMode:yes', function htmlEditor() {
                setModeData = {'mode': 'editor', 'removeXmlFiles': 'true'};
                readOnly = false;
                metaData.hasXmlChanged = false;
                xmlSaveBtn.dataset.revisionId = 1;
                xmlLoaded = false;
                EventBus.publish('Editor:Switch:Html', readOnly, setModeData);
            });
            EventBus.subscribe('dialog:xmlToEditMode:no', function htmlEditorReadOnly() {
                setModeData = {'mode': 'editor', 'removeXmlFiles': 'false'};
                readOnly = true;
                EventBus.publish('Editor:Switch:Html', readOnly, setModeData);
            });
            xmlToEditModeEventsSubscribed = true;
            isXmlValid = false;
        }
        if (
            metaData.readOnly === false &&
            (xmlEditorPanel.isDirty() === true || metaData.hasXmlChanged === true)
        ) {
            warning.render();
        }
        else {
            setModeData = {'mode': 'editor', 'removeXmlFiles': 'false'};
            EventBus.publish('Editor:Switch:Html', metaData.readOnly, setModeData);
            isXmlValid = false;
        }
    }

    function checkSkipErrors(errors) {
        var proceed = true,
            skipIds = metaData.skipIdList;

        if (skipIds !== null) {
            errors.forEach(function forEachError(key) {
                if (skipIds.indexOf(key.id) === -1) {
                    proceed = false;
                }
            });
            if (proceed === true) {
                onXmlSubmitBtnClick();
            }
        }
    }
    function runVtool(runVtoolcallback) {
        var updateVtoolErrorPanel = function updateVtoolErrorPanel(errors) {
                vtoolErrorPanel.clear();
                isXmlValid = errors.length === 0;
                if (errors.length === 0) {
                    vtoolErrorPanel.add('No vtool errors found');
                }
                errors.forEach(function forEachError(item) {
                    vtoolErrorPanel.add(item, metaData.skipIdList);
                });
                vtoolErrorPanel.setErrorCount(errors.length);
            },
            runVtoolSuccess = function runVtoolSuccess(errors) {
                var i, xmlErrors = [], count = 0;

                if (runVtoolcallback === 'xmlsubmit') {
                    if (Helper.isNull(errors) === false) {
                        for (i = 0; i < errors.length; i += 1) {
                            if (errors[i].message.indexOf('Error:') === 0) {
                                xmlErrors[count] = errors[i];
                                count += 1;
                            }
                        }
                        if (count > 0) {
                            checkSkipErrors(xmlErrors);
                            return;
                        }
                    }
                    onXmlSubmitBtnClick();
                }
            },
            xmlEditorContainer = doc.querySelector('.xml-editor-container'),
            xmlEditorAccordianContainer = doc.querySelector('.xml-editor-accordian-container'),
            pollForCompletion = function pollForCompletion(statusUri) {
                var request = new Request(statusUri, null, true, {'method': 'GET', 'headers': {}});

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);

                    if (response.error === true) {
                        alert('VTool Service failed.');
                        EventBus.publish('Loader:hide');
                        return;
                    }

                    if (response.status === 'executed') {
                        isVtoolExecuted = true;
                        xmlEditSummaryPanel.hide();
                        updateVtoolErrorPanel(response.result);
                        vtoolErrorPanel.show();
                        showVtoolErrorPanel(xmlEditorAccordianContainer, xmlEditorContainer);
                        EventBus.publish('Loader:hide');
                        runVtoolSuccess(response.result);
                    }
                    else {
                        setTimeout(function pollAfterTimeout() {
                            pollForCompletion(statusUri);
                        }, 3000);
                    }
                });
<<<<<<< HEAD
                request.setFailureCallback(function failureFn(error) {
                    alert('Polling for VTool failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('Polling for Vtool timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            },
            executeVtool = function executeVtool(token) {
                var request = new Request(
                    (Config.getRoute('vtoolEndPoint') + '/' + token), null, true,
                    {'method': 'GET', 'headers': {}}
                );

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);

                    pollForCompletion(response.data.statusUri);
                });
                request.setFailureCallback(function failureFn(error) {
                    alert('VTool execution failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('VTool execution timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            };

        if (Connectivity.getStatus() === false) {
            return;
        }
        EventBus.publish('Loader:show', 999, false, false);
        isXmlValid = false;
        if (xmlEditorPanel.isDirty() === true) {
            saveXml('vtool');
            return;
        }

        executeVtool(articleToken);
    }

    function saveXmlSuccess(response, savexmlcallback) {
        metaData.hasXmlChanged = true;
        xmlEditorPanel.markClean();
        isXmlValid = false;
        isVtoolExecuted = false;
        xmlSaveBtn.disabled = true;
        vtoolBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;
        console.log('xml save success', response);
        if (savexmlcallback === 'vtool') {
            runVtool('vtool');
        }
    }

    function saveXmlFailure(response) {
        isXmlValid = false;
        isVtoolExecuted = false;
        xmlSaveBtn.disabled = false;
        vtoolBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;
        console.log('xml save failure', response);
    }

    function saveXmlTimeout(response) {
        EventBus.publish('Editor:SaveFailed');
        xmlSaveBtn.disabled = false;
        isVtoolExecuted = false;
        isXmlValid = false;
        vtoolBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;
        console.log('xml save timeout', response);
    }

    function saveXml(savexmlcallback, options) {
        var request, rB = new RequestBuilder(),
            formData = new FormData(),
            saveEndPoint = Config.getRoute('xmlSaveEndPoint');

        if (Connectivity.getStatus() === false) {
            return;
        }

        if (xmlEditorPanel.isDirty() === false || metaData.readOnly === true) {
            return;
        }

        xmlSaveBtn.dataset.revisionId = xmlRevisionProvider() + 1;
        options = options || {};
        formData.append('token', articleToken);
        formData.append('data', xmlEditorPanel.getData());
        rB.setUrl(saveEndPoint);
        rB.setMethod('POST');
        rB.setData(formData);
        if (Helper.isFunction(options.successCallback) === true) {
            rB.setSuccessCallback(options.successCallback);
        }
        else {
            rB.setSuccessCallback(function successFn(response) {
                saveXmlSuccess(response, savexmlcallback);
            });
        }
        if (Helper.isFunction(options.failureCallback) === true) {
            rB.setFailureCallback(options.failureCallback);
        }
        else {
            rB.setFailureCallback(saveXmlFailure);
        }
        if (Helper.isFunction(options.timeoutCallback) === true) {
            rB.setTimeoutCallback(options.timeoutCallback);
        }
        else {
            rB.setTimeoutCallback(saveXmlTimeout);
        }
        request = rB.build();
        request.send(request);
        EventBus.publish('Xml:SaveInProgress');
    }

    function submitXmlSuccess(response) {
        EventBus.publish('Xml:SubmitComplete');
        var response = JSON.parse(response),
            updateVtoolErrorPanel = function updateVtoolErrorPanel(errors) {
                var result = JSON.parse(errors);

                vtoolErrorPanel.clear();
                isXmlValid = errors.length === 0;
                if (errors.length === 0) {
                    vtoolErrorPanel.add('No vtool errors found');
                }
                result.forEach(function forEachError(item) {
                    vtoolErrorPanel.add(item, metaData.skipIdList);
                });
                vtoolErrorPanel.setErrorCount(result.length);
            },
            xmlEditorContainer = doc.querySelector('.xml-editor-container'),
            xmlEditorAccordianContainer = doc.querySelector('.xml-editor-accordian-container'),
            pollForCompletion = function pollForCompletion(statusUri) {
                var request = new Request(statusUri, null, true, {'method': 'GET', 'headers': {}}),
                    warning, warningMsg = [
                        'S200 dataset created and validated successfully, thank you!'
                    ],
                    progress = doc.querySelector('.xml-conversion-progress .progress'),
                    progressInfo = doc.querySelector('.xml-conversion-progress .info');

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);
                    console.log(response);

                    if (response.error === true) {
                        alert('S200 Package Validation Service failed.');
                        EventBus.publish('Loader:hide');
                        return;
                    }

                    if (response.status === 'completed') {
                        if (response.result !== null) {
                            updateVtoolErrorPanel(response.result);
                            showVtoolErrorPanel(xmlEditorAccordianContainer, xmlEditorContainer);
                            EventBus.publish('Loader:hide');
                        }
                        else {
                            warning = new DialogPopupPanel(doc, win, EventBus);
                            warning.setTitle('S200 Dataset Validation Succcessful');
                            warning.setName('runVtoSubmitCompleteol');
                            warning.showButtons(['ok']);
                            warning.setContent(warningMsg.join(''));
                            warning.render();
                            return;
                        }
                    }
                    else {
                        setTimeout(function pollAfterTimeout() {
                            pollForCompletion(statusUri);
                        }, 3000);
                    }
                });
                request.setFailureCallback(function failureFn(error) {
                    alert('Polling for XmlSubmit failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('Polling for XmlSubmit timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            };

        metaData.hasXmlChanged = true;
        xmlEditorPanel.markClean();
        isXmlValid = false;
        xmlSaveBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;

        EventBus.publish('Loader:show', 1999, false, false);
        pollForCompletion(response.data.statusUri);
        console.log('xml submit success', response);
    }

    function pcSubmitXmlSuccess(response) {
        EventBus.publish('Xml:SubmitComplete');
        var response = JSON.parse(response),
            xmlEditorContainer = doc.querySelector('.xml-editor-container'),
            xmlEditorAccordianContainer = doc.querySelector('.xml-editor-accordian-container'),
            pollForCompletion = function pollForCompletion(statusUri) {
                var request = new Request(statusUri, null, true, {'method': 'GET', 'headers': {}}),
                    warning, warningMsg = [
                        'Pc Package created and validated successfully, thank you!'
                    ],
                    progress = doc.querySelector('.xml-conversion-progress .progress'),
                    progressInfo = doc.querySelector('.xml-conversion-progress .info'),
                    emptyQueryMsg = metaData.messages.alert.emptyQuery;

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);

                    console.log(response);
                    if (response.error === true) {
                        alert('Pc Package Generation Service failed.');
                        EventBus.publish('Loader:hide');
                        return;
                    }

                    if (response.status === 'completed') {
                        alert(emptyQueryMsg);
                        win.location.reload();
                    }
                    else {
                        setTimeout(function pollAfterTimeout() {
                            pollForCompletion(statusUri);
                        }, 3000);
                    }
                });
                request.setFailureCallback(function failureFn(error) {
                    alert('Polling for XmlSubmit failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('Polling for XmlSubmit timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            };

        metaData.hasXmlChanged = true;
        xmlEditorPanel.markClean();
        isXmlValid = false;
        xmlSaveBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;

        EventBus.publish('Loader:show', 1999, false, false);
        pollForCompletion(response.data.statusUri);
        console.log('xml submit success', response);
    }

    function submitXmlFailure(response) {
        EventBus.publish('Xml:SubmitFailed');
        isXmlValid = false;
        xmlSaveBtn.disabled = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;
        console.log('xml submit failure', response);
    }

    function submitXmlTimeout(response) {
        EventBus.publish('Editor:SubmitFailed');
        xmlSaveBtn.disabled = false;
        isXmlValid = false;
        xmlSaveBtn.classList.remove('progress');
        xmlSubmitBtn.disabled = false;
        console.log('xml submit timeout', response);
    }

    function onXmlSubmitBtnClick(options) {
        var request, rB = new RequestBuilder(), formData = new FormData(), saveData,
            warning, warningMsg = [
                'There are unsaved changes to the Xml. Save it before running VTool.'
            ],
            emptyQueryMsg = metaData.messages.conformation.emptyQuery;

        if (Connectivity.getStatus() === false) {
            return;
        }

        if (Features.isFeatureEnabled('XmlEditor.GenerateS200Package') === false) {
            runVtool('xmlsubmit');
            return;
        }

        if (
            xmlEditorPanel.isDirty() === true &&
            Features.isFeatureEnabled('XmlEditor.GenerateS200Package') === false
        ) {
            saveXml('xmlsubmit');
            return;
        }
        else if (
            xmlEditorPanel.isDirty() === true &&
            Features.isFeatureEnabled('XmlEditor.GenerateS200Package') === true
        ) {
            warning = new DialogPopupPanel(doc, win, EventBus);
            warning.setTitle('Run VTool');
            warning.setName('runVtool');
            warning.showButtons(['ok']);
            warning.setContent(warningMsg.join(''));
            warning.render();
            return;
        }

        if (Features.isFeatureEnabled('XmlEditor.GenerateS200Package') === false) {
            if (confirm(emptyQueryMsg) === false) {
                return;
            }
            saveData = JSON.stringify({
                'optToken': articleToken,
                'mode': 'online',
                'actor': currentActor.toUpperCase()
            });
            formData.append('json', saveData);
            rB.setUrl(Config.getRoute('pcXmlSubmitEndPoint'));
            rB.setMethod('POST');
            rB.setData(formData);
        }
        else {
            rB.setUrl(Config.getRoute('datasetValidationEndPoint') + '/' + articleToken);
            rB.setMethod('GET');
        }

        xmlSubmitBtn.dataset.revisionId = xmlRevisionProvider() + 1;
        options = options || {};
        if (Helper.isFunction(options.successCallback) === true) {
            rB.setSuccessCallback(options.successCallback);
        }
        else if (Features.isFeatureEnabled('XmlEditor.GenerateS200Package') === false) {
            rB.setSuccessCallback(pcSubmitXmlSuccess);
        }
        else {
            rB.setSuccessCallback(submitXmlSuccess);
        }
        if (Helper.isFunction(options.failureCallback) === true) {
            rB.setFailureCallback(options.failureCallback);
        }
        else {
            rB.setFailureCallback(submitXmlFailure);
        }
        if (Helper.isFunction(options.timeoutCallback) === true) {
            rB.setTimeoutCallback(options.timeoutCallback);
        }
        else {
            rB.setTimeoutCallback(submitXmlTimeout);
        }
        request = rB.build();
        request.send(request);
        EventBus.publish('Xml:SubmitInProgress');
    }

    function enableXmlEditorActionBtn() {
        var xmlEditorActionButtons = doc.querySelector('.xml-editor-action-buttons'),
            xmlProcessMessage = doc.querySelector('.xml-process-message'),
            xmlSearchReplace = doc.querySelector('.xml-search-replace'),
            xmlEditor = doc.querySelector('.xml-editor');

        xmlEditorActionButtons.classList.remove('hide');
        xmlProcessMessage.classList.add('hide');
        xmlSearchReplace.classList.remove('hide');
        xmlEditor.classList.remove('hide');
        if (Connectivity.getStatus() === false) {
            toggleTopMenuAction(false);
            return;
        }
        if (metaData.readOnly === true) {
            xmlEditorActionButtons.classList.add('hide');
        }
    }

    function showProgressOverlay() {
        var xmlEditorActionButtons = doc.querySelector('.xml-editor-action-buttons'),
            xmlProcessMessage = doc.querySelector('.xml-process-message'),
            xmlSearchReplace = doc.querySelector('.xml-search-replace'),
            xmlEditor = doc.querySelector('.xml-editor');

        xmlEditorActionButtons.classList.add('hide');
        xmlProcessMessage.classList.remove('hide');
        xmlSearchReplace.classList.add('hide');
        xmlEditor.classList.add('hide');
        xmlEditSummaryPanel.hide();
    }

    XmlEditorInit.prototype.xmlChangeNotSaved = function xmlChangeNotSaved() {
        var confirmationMessage = '';

        win.addEventListener('beforeunload', function beforeunload(e) {
            if (xmlEditorPanel.isDirty() === true) {
                confirmationMessage = 'The xml is being saved. Some ';
                confirmationMessage += 'of your changes might not be saved if you close now.';
                e.returnValue = confirmationMessage;
            }
            return confirmationMessage;
        });
    };

    XmlEditorInit.prototype.switchToXmlEditor = function switchToXmlEditor(
        articletoken, currentactor, metadata
    ) {
        articleToken = articletoken;
        currentActor = currentactor;
        metaData = metadata;

        require([
            'xml-editor/scripts/XmlEditorPanel', 'xml-editor/scripts/VtoolErrorPanel',
            'xml-editor/scripts/XmlEditSummaryPanel', 'xml-editor/scripts/AssetListPanel',
            'xml-editor/scripts/AssetUploadPanel'
        ],
        function xmlEditorLoader(
            XmlEditorPanel, VtoolErrorPanel, XmlEditSummaryPanel, AssetListPanel, AssetUploadPanel
        ) {
            var xmlEditorContainer = doc.querySelector('.xml-editor-container'),
                xmlEditorAccordianContainer = doc.querySelector('.xml-editor-accordian-container'),
                xmlEditorActionButtons = doc.querySelector('.xml-editor-action-buttons'),
                vtoolErrorContainer = doc.querySelector('.vtool-error-container'),
                assetListContainer = doc.querySelector('.asset-list-container'),
                assetUploadContainer = doc.querySelector('.asset-upload-container'),
                xmlEditSummaryContainer = xmlEditorAccordianContainer.querySelector('.edit-summary-container'),
                progress = doc.querySelector('.xml-conversion-progress .progress'),
                progressInfo = doc.querySelector('.xml-conversion-progress .info'),
                xmlReadonlyContainer = doc.querySelector('.xml-editor-readonly-message-container'),
                editorContainer = doc.querySelector('.editor-container'),
                editorAccordianContainer = doc.querySelector('.right-panels'),
                pendingChanges = false,
                onContentChanged = function onContChanged() {
                    isXmlValid = !xmlEditorPanel.isDirty();
                    if (isXmlValid === false &&
                        xmlSaveBtn.classList.contains('progress') === false
                    ) {
                        xmlSaveBtn.disabled = false;
                    }
                    else if (isXmlValid === true) {
                        xmlSaveBtn.disabled = true;
                    }

                    if (onContChanged.updateEditSummary === false) {
                        pendingChanges = true;
                        return;
                    }
                    onContChanged.updateEditSummary = false;
                    setTimeout(function timer() {
                        onContChanged.updateEditSummary = true;
                        if (pendingChanges === true) {
                            onContentChanged();
                        }
                    }, 3000);
                    xmlEditSummaryPanel.clear();
                    xmlEditorPanel.forEachEdit(function eachEdit(type, line, pos, cont) {
                        if (type === 'err') {
                            cont = 'Error: ' + cont;
                        }
                        xmlEditSummaryPanel.add({
                            'line': line,
                            'column': pos,
                            'change': cont,
                            'type': type
                        });
                    });
                };

            EventBus.publish('Loader:hide');
            EventBus.publish('Editor:ReadOnly:Apply', 'editor.readonly.apply');
            if (vtoolErrorPanel === null) {
                vtoolErrorPanel = new VtoolErrorPanel(vtoolErrorContainer, EventBus, win, doc);
            }

            if (assetListPanel === null && Features.isFeatureEnabled('XmlEditor.ShowAssetList') === true) {
                assetListPanel = new AssetListPanel(
                    assetListContainer, articleToken, Config.getRoute('deleteAssetEndPoint'),
                    Config.getRoute('assetListEndPoint'), EventBus, win, doc
                );
            }

            if (assetUploadPanel === null && Features.isFeatureEnabled('XmlEditor.UploadAsset') === true) {
                assetUploadPanel = new AssetUploadPanel(
                    assetUploadContainer, articleToken, Config.getRoute('uploadAssetEndPoint'),
                    EventBus, win, doc
                );
            }

            if (xmlEditSummaryPanel === null) {
                xmlEditSummaryPanel = new XmlEditSummaryPanel(
                    xmlEditSummaryContainer, EventBus, win, doc
                );
            }

            if (xmlEditorPanel === null) {
                xmlEditorPanel = new XmlEditorPanel(
                    xmlEditorContainer, doc, win, EventBus, metaData
                );
                xmlEditorPanel.loadElsevierSpec(Config.get('elsevierSpecJsonUrl'));
                xmlEditorPanel.isSeachReplaceEnable(true);
                xmlEditorPanel.isReplaceEnable(!metaData.readOnly);
                xmlEditorPanel.render();
                xmlEditorPanel.setTitle('XML Editor');
                xmlEditorPanel.setSize('100%', win.innerHeight - 105);
                isXmlEditorLoaded = true;
                vtoolErrorPanel.render();
                vtoolErrorPanel.setTitle('Vtool Error Summary');
                if (metaData.readOnly === false && Features.isFeatureEnabled('XmlEditor.UploadAsset') === true) {
                    assetUploadPanel.setUploadLimit(Config.get('uploadSizeLimit'));
                    assetUploadPanel.render();
                    assetUploadPanel.setTitle('Upload Asset');
                }
                xmlEditSummaryPanel.render();
                xmlEditSummaryPanel.hide();
                xmlEditSummaryPanel.setTitle('Edit Log');

                if (Features.isFeatureEnabled('XmlEditor.ShowAssetList') === true) {
                    assetListPanel.render();
                    assetListPanel.setTitle('Assets');
                    assetListPanel.refresh();
                    assetListPanel.isReadOnly(metaData.readOnly);
                }

                EventBus.subscribe('XmlEditor:LinesChanged', function onLinesChanged() {
                    isXmlValid = !xmlEditorPanel.isDirty();
                });
                EventBus.subscribe('XmlEditor:ContentChanged', onContentChanged);
            }

            editorContainer.classList.add('hide');
            editorAccordianContainer.classList.add('hide');
            xmlEditorContainer.classList.remove('hide');
            xmlEditorActionButtons.classList.remove('hide');
            xmlEditorAccordianContainer.classList.remove('hide');
            xmlEditorBtn.disabled = true;
            editorBtn.disabled = false;
            showVtoolErrorPanel(xmlEditorAccordianContainer, xmlEditorContainer);
            if (metaData.readOnly === true) {
                xmlEditorActionButtons.classList.add('hide');
                xmlReadonlyContainer.style.display = 'block';
                xmlReadonlyContainer.innerHTML = metaData.readOnlyReason;
                EventBus.publish('VtoolPanel:destroy');
            }
            if (enableAnnatotatorProcess === false &&
                xmlEditorProcessingFlag === false &&
                xmlLoaded === true &&
                lastSavedXmlEditorVersion === xmlRevisionProvider()
            ) {
                enableXmlEditorActionBtn();
                return;
            }

            function fetchXmlFromS3(xmlData) {
                xmlEditorPanel.loadXmlSchema(Config.get('xmlEditorSchemaUrl'));
                xmlEditSummaryPanel.show();
                if (editorBtn.disabled === false) {
                    enableXmlEditorActionBtn();
                }
                xmlEditorPanel.load(xmlData);
                xmlEditorPanel.setEnabled(!metaData.readOnly);
                lastSavedXmlEditorVersion = 1;
                if (xmlSaveTimer !== null) {
                    clearTimeout(xmlSaveTimer);
                }
                xmlSaveTimer = setInterval(saveXml, 2 * 60 * 1000);
                xmlLoaded = true;
                EventBus.publish('Loader:hide');
                progress.value = 0;
                xmlEditorPanel.clearHistory();

                xmlEditorProcessingFlag = false;
                enableAnnatotatorProcess = false;
                if (xmlEditorBtn.disabled === false) {
                    xmlEditorProcessingFlag = true;
                }
            }

            function pollForCompletion(statusUri) {
                var request = new Request(statusUri, null, true, {'method': 'GET', 'headers': {}});

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);

                    if (response.error === true) {
                        alert('Service failed.');
                        EventBus.publish('Loader:hide');
                        return;
                    }

                    if (response.complete === true) {
                        progress.value = 100;
                        progressInfo.innerHTML = '';
                        fetchXmlFromS3(response.result);
                    }
                    else {
                        progress.value = response.percentage;
                        progressInfo.innerHTML = response.percentage + '% Completed';
                        setTimeout(function pollAfterTimeout() {
                            pollForCompletion(statusUri);
                        }, 3000);
                    }
                });
                request.setFailureCallback(function failureFn(error) {
                    alert('Polling for Xml failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('Polling for Xml timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            }

            function getXml(token) {
                var conversionNeeded = 'no', request;

                if (enableAnnatotatorProcess === true) {
                    conversionNeeded = 'yes';
                }

                request = new Request(
                    (Config.getRoute('htmlToXmlEndpoint') + '/' + token + '/' + conversionNeeded),
                    null, true, {'method': 'GET', 'headers': {}}
                );

                request.setSuccessCallback(function successFn(data) {
                    var response = JSON.parse(data);

                    pollForCompletion(response.data.statusUri);
                });
                request.setFailureCallback(function failureFn(error) {
                    alert('Getting Xml from server failed.');
                    console.log(error);
                    EventBus.publish('Loader:hide');
                });
                request.setTimeoutCallback(function timeoutFn() {
                    alert('Getting Xml from server timed out.');
                    EventBus.publish('Loader:hide');
                });
                request.send();
            }

            if (enableAnnatotatorProcess === true ||
                xmlEditorProcessingFlag === true ||
                editorReadOnly === false
            ) {
                showProgressOverlay();
                getXml(articleToken);
                // fetchXmlFromS3('http://pgc-dev-test.s3.amazonaws.com/pgqaNew/proofs/elsevier/HLY/30102/xml/xml-for-editing.xml');
            }
            else if (editorReadOnly === true) {
                enableXmlEditorActionBtn();
            }
        });
    };

    XmlEditorInit.prototype.setIsEditorReadOnly = function setIsEditorReadOnly(flag) {
        editorReadOnly = flag;
    };

    XmlEditorInit.prototype.getIsXmlEditorLoaded = function getIsXmlEditorLoaded() {
        return isXmlEditorLoaded;
    };

    XmlEditorInit.prototype.isXmlEdiotrPanelDirty = function isXmlEdiotrPanelDirty() {
        if (Helper.isNull(xmlEditorPanel) === false) {
            return xmlEditorPanel.isDirty();
        }
        return false;
    };

    XmlEditorInit.prototype.cleanXmlEditorPanel = function cleanXmlEditorPanel() {
        if (Helper.isNull(xmlEditorPanel) === false) {
            xmlEditorPanel.markClean();
        }
    };

    XmlEditorInit.prototype.isVtoolCheckExecuted = function isVtoolCheckExecuted() {
        return isVtoolExecuted;
    };

    XmlEditorInit.prototype.vtoolErrorPanelHasError = function vtoolErrorPanelHasError() {
        return vtoolErrorPanel.hasErrors();
    };

    XmlEditorInit.prototype.bootstrap = function bootstrap() {
        doc.head.appendChild(createStylesheetElement(
            '/xml-editor/scripts/libs/codemirror-5.1.0/lib/codemirror.css'
        ));
        doc.head.appendChild(createStylesheetElement(
            '/xml-editor/scripts/libs/codemirror-5.1.0/addon/dialog/dialog.css'
        ));
        doc.head.appendChild(createStylesheetElement(
            '/xml-editor/scripts/libs/codemirror-5.1.0/addon/fold/foldgutter.css'
        ));
        doc.head.appendChild(createStylesheetElement(
            '/xml-editor/scripts/libs/codemirror-5.1.0/addon/hint/show-hint.css'
        ));
        doc.head.appendChild(createStylesheetElement(
            '/xml-editor/styles/xml-editor.css'
        ));

        EventBus.subscribe('Xml:SaveInProgress', function onXmlSaveInProgress() {
            xmlSaveBtn.disabled = true;
            vtoolBtn.disabled = true;
            xmlSaveBtn.classList.add('progress');
            xmlSubmitBtn.disabled = true;
        });
        EventBus.subscribe('Xml:SubmitInProgress', function onXmlSubmitInProgress() {
            xmlSubmitBtn.disabled = true;
            vtoolBtn.disabled = true;
            xmlSubmitBtn.classList.add('progress');
            xmlSaveBtn.disabled = true;
        });

        xmlSaveBtn.dataset.revisionId = 1;
        EventBus.subscribe('Editor:SaveComplete', function() {
            lastSavedXmlEditorVersion = 0;
        });
        EventBus.subscribe('Ann:onRemove', function() {
            enableAnnatotatorProcess = true;
        });
        EventBus.subscribe('Ann:onAnnotate', function() {
            enableAnnatotatorProcess = true;
        });

        lastSavedXmlEditorVersion = 1;

        editorBtn.addEventListener('click', editorBtnOnClick, false);
        vtoolBtn.addEventListener('click', runVtool, false);
        xmlSaveBtn.addEventListener('click', saveXml, false);
        fullScreenBtn.addEventListener('click', fullScreenOnClick, false);
        xmlSubmitBtn.addEventListener('click', onXmlSubmitBtnClick, false);
    };

    return XmlEditorInit;
});

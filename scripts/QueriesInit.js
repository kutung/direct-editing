define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/RequestQueue',
    'scripts/QueryPanel', 'scripts/ConfigReader', 'scripts/QueryEditorPanel',
    'scripts/QueryJmPanel', 'scripts/Util'
],
function QueriesInitLoader(
    Helper, EventBus, RequestQueue, QueryPanel, Config, QueryEditorPanel, QueryJmPanel, Util
) {
    var queryPanel,
        authorQueryMap = {'length': 0, 'tabIds': []},
        newQueryFragment = null,
        queryAnswerClass = 'answered',
        queryPanels = [],
        queryInstanceMapper = {};

    function enableEditor() {
        var hasUnsavedQuery,
            queryTabPanel = this.queryTabPanel,
            editorInst = this.editorInst,
            suppInst = this.suppInst,
            editSummaryTabPanel = this.editSummaryTabPanel,
            articleTabPanel = this.articleTabPanel;

        hasUnsavedQuery = authorQueryMap.tabIds.some(function some(tabId) {
            return authorQueryMap[tabId].isPersisted() === false;
        });
        if (hasUnsavedQuery === true) {
            queryTabPanel.enableTabNavigation(false);
            articleTabPanel.enableTabNavigation(false);
            editorInst.setEnabled(false);
            if (suppInst.isRendered === true) {
                suppInst.setEnabled(false);
            }
            editSummaryTabPanel.setEnabled(false);
            queryTabPanel.enableTool('add', false);
        }
        else {
            queryTabPanel.enableTabNavigation(true);
            articleTabPanel.enableTabNavigation(true);
            editorInst.setEnabled(true);
            if (suppInst.isRendered === true) {
                suppInst.setEnabled(true);
            }
            editSummaryTabPanel.setEnabled(true);
            queryTabPanel.enableTool('add', true);
        }
    }

    function activateTab(queryName) {
        var tabId;

        tabId = this.queryBag.getTabIDForQuery(queryName);
        if (this.queryTabPanel.activeTabId === tabId) {
            return;
        }
        this.queryTabPanel.activate(tabId);
        this.currentQueryTabId = tabId;
    }

    function querySaveOnTabChange(id) {
        var queryInstance;

        if (Helper.isNull(this.currentQueryTabId) === true) {
            this.currentQueryTabId = id;
            return;
        }
        else if (this.currentQueryTabId === id ||
            Helper.isUndefined(queryInstanceMapper[this.currentQueryTabId])
        ) {
            return;
        }
        queryInstance = queryInstanceMapper[this.currentQueryTabId];
        queryInstance.proceedFn();
        this.currentQueryTabId = id;
    }

    function QueriesInit(Win, Doc, Token, CurrentActor, QueryPersistor, QueryBag) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        this.currentActor = CurrentActor;
        this.queryPersistor = QueryPersistor;
        this.queryBag = QueryBag;
        this.currentQueryTabId = null;
        EventBus.subscribe('QueryEditor:OnProceedSuccess', enableEditor, this);
        EventBus.subscribe('QueryPanel:Empty', activateTab, this);
        EventBus.subscribe('QueryEditorPanel:Empty', activateTab, this);
        EventBus.subscribe('QueryJmPanel:Empty', activateTab, this);
        EventBus.subscribe('QueryEditor:Enable', enableEditor, this);
        EventBus.subscribe('QueryPanel:OnSetFragment', function setFragment(fragment) {
            newQueryFragment = fragment;
        });
        EventBus.subscribe('Tabpanel:onActivate', function onactive(
            id, tabPanel, panelName
        ) {
            var isEnable = false;

            if (panelName !== 'query') {
                return;
            }
            if (
                authorQueryMap.hasOwnProperty(id) === true &&
                authorQueryMap[id].hasOwnProperty('isQueryReplied') !== true
            ) {
                isEnable = true;
            }
            tabPanel.enableTool('del', isEnable);
        });
        EventBus.subscribe('Query:Save', querySaveOnTabChange, this);
    }

    function isBinaryQuery(query) {
        if (
            query.hasOwnProperty('binary') === true &&
            Array.isArray(query.binary) === true
        ) {
            return true;
        }
        return false;
    }

    function setQuery(query, queryPanel) {
        queryPanel.setQueryId(query.id);
        queryPanel.setQuestion(query.question);
        queryPanel.setAnswered(query.answer !== '');
    }

    function setBinaryQuery(query, queryPanel) {
        queryPanel.setBinaryMode({
            'label1': query.binary[0].label,
            'value1': query.binary[0].option,
            'option1Editable': query.binary[0].editable,
            'label2': query.binary[1].label,
            'value2': query.binary[1].option,
            'option2Editable': query.binary[1].editable
        });
        if (query.hasOwnProperty('option') === true) {
            setTimeout(function timeout() {
                queryPanel.setBinaryAnswer({
                    'option': query.option,
                    'answer': query.answer
                });
            }, 2000);
        }
    }

    function setQueryFiles(query) {
        var files;

        if (query.hasOwnProperty('files') === false) {
            return;
        }
        files = query.files;
        queryPanel.setUploadedFiles(files);
    }

    function setQueryCounter(unAnsweredCount, queryTabPanel) {
        var qIcon = queryTabPanel.panel.querySelector('.tab-panel .header .icon');

        qIcon.innerHTML = unAnsweredCount;

        if (qIcon.classList.contains('query-counter') === false) {
            qIcon.classList.add('query-counter');
        }
    }

    function fillQueryInTab(tabId, query, readOnlyMode, instance) {
        var tabEl, doc = instance.doc, win = instance.win,
            token = instance.token,
            queryBag = instance.queryBag,
            currentActor = instance.currentActor,
            queue = new RequestQueue();

        tabEl = instance.queryTabPanel.getTabContentElement(tabId);
        queryPanel = new QueryPanel(
            tabEl, doc, win, EventBus, queue, {
                'saveQuery': Config.getRoute('querySaveEndPoint'),
                'uri': Config.getRoute('attachmentAdd'),
                'deleteUri': Config.getRoute('attachmentRemove')
            },
            token, currentActor
        );
        queryPanel.setUploadLimit(Config.get('uploadSizeLimit'));
        queryPanel.setUploadType(Config.get('supportedExtension'));
        queryPanel.setS3FormUpload(instance.s3FormData);
        queryPanel.render();
        setQuery(query, queryPanel);
        setQueryFiles(query);
        if (isBinaryQuery(query) === true) {
            setBinaryQuery(query, queryPanel);
        }
        else {
            queryPanel.setAnswer(query.answer);
        }
        if (readOnlyMode === true) {
            queryPanel.setEnabled(false);
        }
        queryPanels.push(queryPanel);
        queryBag.put(query.id, query.id, null, tabId, query.answer);
        queryInstanceMapper[tabId] = queryPanel;
    }

    function createJMEditorPanel(query, readOnlyMode, instance) {
        var queryTabPanel = instance.queryTabPanel,
            qNum = authorQueryMap.length + 1, queryId = ('M' + qNum),
            tabId = queryTabPanel.add(queryId),
            queryPersistor = instance.queryPersistor,
            queryBag = instance.queryBag,
            tabEl = queryTabPanel.getTabContentElement(tabId), queryJM;

        queryJM = new QueryJmPanel(
            tabEl, document, window, EventBus, queryPersistor
        );
        queryJM.render();
        queryJM.setQuery(query.question);
        queryJM.setReply(query.reply);
        queryJM.setAnswered(query.reply !== '');
        queryJM.setQueryId(queryId);
        queryJM.setPanelId(tabId);
        queryJM.setQueryBag(queryBag);
        queryJM.setPersisted(true);
        authorQueryMap.length += 1;
        if (readOnlyMode === true || query.status === 'Closed') {
            queryJM.setEnabled(false);
        }
        authorQueryMap[tabId] = queryJM;
        authorQueryMap.tabIds.push(tabId);
        queryPanels.push(queryJM);
        queryBag.put(
            queryId,
            query.id,
            query.positionId,
            tabId,
            query.reply
        );
        queryInstanceMapper[tabId] = queryJM;
        return tabId;
    }

    function createQueryEditorPanel(query, readOnlyMode, instance) {
        var problemTypes = instance.problemTypes,
            queryTabPanel = instance.queryTabPanel,
            qNum = authorQueryMap.length + 1, queryId = ('M' + qNum),
            tabId = queryTabPanel.add(queryId),
            queryPersistor = instance.queryPersistor,
            queryBag = instance.queryBag,
            tabEl = queryTabPanel.getTabContentElement(tabId), queryEditor;

        queryEditor = new QueryEditorPanel(
            tabEl, document, window, EventBus, queryPersistor
        );
        queryEditor.setProblemTypes(problemTypes);
        queryEditor.render();
        queryEditor.setQuery(query.question);
        queryEditor.setProblemTypeId(query.problemTypeId.toString());
        queryEditor.setProblemQueryId(query.problemQueriesId.toString());
        queryEditor.setQueryId(queryId);
        queryEditor.setPanelId(tabId);
        queryEditor.setQuery(query.question);
        queryEditor.setPersisted(true);
        queryEditor.setQueryBag(queryBag);
        authorQueryMap.length += 1;
        if (readOnlyMode === true) {
            queryEditor.setEnabled(false);
        }
        authorQueryMap[tabId] = queryEditor;
        authorQueryMap.tabIds.push(tabId);
        queryBag.put(
            queryId,
            query.id,
            query.positionId,
            tabId,
            query.reply
        );
        queryInstanceMapper[tabId] = queryEditor;
        return tabId;
    }

    function fillValidatorQueryInTab(query, readOnlyMode, instance) {
        if (query.status === 'Closed') {
            return createJMEditorPanel(query, true, instance);
        }
        return createQueryEditorPanel(query, readOnlyMode, instance);
    }

    function fillJMQueryInTab(query, readOnlyMode, instance) {
        return createJMEditorPanel(query, readOnlyMode, instance);
    }

    function setcurrentQueryTabId() {
        if (Helper.isNull(this.currentQueryTabId) === true ||
            this.currentQueryTabId !== this.queryTabPanel.activeTabId
        ) {
            this.currentQueryTabId = this.queryTabPanel.activeTabId;
        }
    }

    QueriesInit.prototype.getQueryPanels = function getQueryPanels() {
        return queryPanels;
    };

    QueriesInit.prototype.getUnAnsweredQuery = function getUnAnsweredQueryFn() {
        var unAnsweredQueries = [];

        queryPanels.forEach(function queryLoop(query) {
            if (query.isAnswered() === false) {
                unAnsweredQueries.push(query.getQueryId());
            }
        });
        return unAnsweredQueries;
    };

    QueriesInit.prototype.setQueryTab = function setQueryTab(queryTabPanel) {
        this.queryTabPanel = queryTabPanel;
    };

    QueriesInit.prototype.setCorrectorQueries = function setCorrectorQueries(
        correctorQueries
    ) {
        this.correctorQueries = correctorQueries;
    };

    QueriesInit.prototype.setValidatorQueries = function setValidatorQueries(
        validatorQueries
    ) {
        this.validatorQueries = validatorQueries;
    };

    QueriesInit.prototype.setPluginDepns = function setPluginDepns(
        editorInst, suppInst, editSummaryTabPanel, articleTabPanel,
        insertPanel, instructPanel
    ) {
        this.editorInst = editorInst;
        this.suppInst = suppInst;
        this.editSummaryTabPanel = editSummaryTabPanel;
        this.articleTabPanel = articleTabPanel;
        this.insertPanel = insertPanel;
        this.instructPanel = instructPanel;
    };

    QueriesInit.prototype.setProblemTypes = function setProblemTypes(
        problemTypes
    ) {
        this.problemTypes = problemTypes;
    };

    QueriesInit.prototype.autoSave = function autoSaveFn() {
        var queryInstance,
            activeTabId = this.queryTabPanel.activeTabId;

        if (Helper.isEmptyString(activeTabId) === true ||
            Helper.isUndefined(queryInstanceMapper[activeTabId]) === true) {
            return;
        }
        queryInstance = queryInstanceMapper[activeTabId];
        queryInstance.proceedFn();
        this.currentQueryTabId = activeTabId;
    };

    QueriesInit.prototype.removeQuery = function queryRemove() {
        var tabTitle, bag,
            queryTabPanel = this.queryTabPanel,
            queryBag = this.queryBag,
            instance = this;

        queryTabPanel.addTool('del', 'Delete Query', function addtool() {
            var tabId, queryEditor, mappedQuery, deleteConfirmMessage,
                queryName = '';

            tabId = queryTabPanel.getActiveTabId();
            mappedQuery = this.queryBag.getQueryNameForTab(tabId);
            if (Helper.isNull(mappedQuery) === false) {
                queryName = mappedQuery.queryName;
            }

            deleteConfirmMessage = Config.getLocaleByKey(
                'delete.queries.confirm'
            );
            deleteConfirmMessage = deleteConfirmMessage.replace(
                '{{tabName}}',
                 queryName
            );
            if (confirm(deleteConfirmMessage) === false) {
                return;
            }

            function delFn() {
                queryEditor.destroy();
                queryTabPanel.remove(tabId);
                delete authorQueryMap[tabId];
                delete queryInstanceMapper[tabId];
                instance.currentQueryTabId = null;
                bag = queryBag.getQueryNameForTab(tabId);
                if (Helper.isObject(bag) === true) {
                    queryBag.remove(bag.queryName);
                }
                authorQueryMap.length -= 1;
                authorQueryMap.tabIds.splice(
                    authorQueryMap.tabIds.indexOf(tabId), 1
                );
                authorQueryMap.tabIds.forEach(function each(tabid, index) {
                    tabTitle = 'M' + (index + 1);
                    queryTabPanel.setTabTitle(tabid, tabTitle);
                    queryBag.setQueryName(tabid, tabTitle);
                });
                queryTabPanel.enableTool('add', true);
                EventBus.publish('QueryEditor:Enable');
            }

            if (tabId !== null && authorQueryMap.hasOwnProperty(tabId) === true) {
                queryEditor = authorQueryMap[tabId];
                if (queryEditor.isPersisted() === true) {
                    mappedQuery = this.queryBag.getQueryNameForTab(tabId);
                    queryEditor.deleteQuery(delFn, tabId, mappedQuery.queryName);
                }
                else {
                    delFn();
                }
            }
        }.bind(this), {'svg': '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16" height="16" viewBox="0 0 200 200"><g><rect y="80" class="fill" width="200" height="40"/></g></svg>'
        });
    };

    QueriesInit.prototype.createQuery = function createQuery(
    ) {
        var queryTabPanel = this.queryTabPanel,
            problemTypes = this.problemTypes,
            editorInst = this.editorInst,
            suppInst = this.suppInst,
            editSummaryTabPanel = this.editSummaryTabPanel,
            articleTabPanel = this.articleTabPanel,
            insertPanel = this.insertPanel,
            win = this.win,
            queryPersistor = this.queryPersistor,
            instructPanel = this.instructPanel,
            queryBag = this.queryBag,
            instance = this;

        queryTabPanel.addTool('add', 'Create Query', function addtool() {
            var qNum, tabId, tabEl, queryEditor, queryId;

            if (newQueryFragment instanceof win.DocumentFragment === false) {
                throw new Error('query.editor.panel.empty.select.empty');
            }
            EventBus.publish('contextMenu:hide');
            EventBus.publish('addQuery:click');
            qNum = authorQueryMap.length + 1;
            queryId = ('M' + qNum);
            tabId = queryTabPanel.add(queryId);
            tabEl = queryTabPanel.getTabContentElement(tabId);

            queryEditor = new QueryEditorPanel(
                tabEl, document, window, EventBus, queryPersistor
            );
            queryEditor.setProblemTypes(problemTypes);
            queryEditor.render();
            queryEditor.setQueryId(queryId);
            queryEditor.setPanelId(tabId);
            queryEditor.setFragment(newQueryFragment);
            queryEditor.setQueryBag(queryBag);
            queryEditor.hideLocate(true);
            queryTabPanel.activate(tabId);
            authorQueryMap.length += 1;
            authorQueryMap[tabId] = queryEditor;
            authorQueryMap.tabIds.push(tabId);
            editorInst.setEnabled(false);
            if (suppInst.isRendered === true) {
                suppInst.setEnabled(false);
            }
            editSummaryTabPanel.setEnabled(false);
            EventBus.publish('InsertPanel:OnSetEnabled', false);
            EventBus.publish('InstructPanel:OnSetEnabled', false);
            queryTabPanel.show();
            queryTabPanel.enableTabNavigation(false);
            articleTabPanel.enableTabNavigation(false);
            queryTabPanel.enableTool('add', queryEditor.isPersisted());
            newQueryFragment = null;
            instance.currentQueryTabId = tabId;
            queryInstanceMapper[tabId] = queryEditor;
        },
        {'svg': '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16" height="16" viewBox="0 0 200 200"><g><rect x="80" class="fill" width="40" height="200"/></g><g><rect y="80" class="fill" width="200" height="40"/></g></svg>'
        });
    };

    QueriesInit.prototype.loadForJM = function loadForJM(readOnlyMode) {
        var query, tabId, validatorTabId,
            queries = this.correctorQueries,
            tot = queries.length, i = 0,
            querySuccess, queryMapTab = {},
            queryBag = this.queryBag,
            validatorQueries = this.validatorQueries,
            ceTot = validatorQueries.length,
            j = 0,
            validatorQuery,
            unAnswered = (tot + ceTot),
            queryTabPanel = this.queryTabPanel,
            answeredQuery = [],
            firstUnansweredQuery = null;

        // TODO: Break the chunk
        // Author Queries
        for (; i < tot; i += 1) {
            query = queries[i];
            tabId = queryTabPanel.add(query.id);
            queryMapTab[query.id] = tabId;
            fillQueryInTab(tabId, query, true, this);
            if (Helper.isEmptyString(query.answer) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(tabId, queryAnswerClass);
                answeredQuery.push(query.id);
            }
        }
        // Copy Editor Queries
        for (; j < ceTot; j += 1) {
            validatorQuery = validatorQueries[j];
            validatorTabId = fillJMQueryInTab(validatorQuery, readOnlyMode, this);
            if (firstUnansweredQuery === null &&
                Helper.isEmptyString(validatorQuery.reply) === true
            ) {
                firstUnansweredQuery = validatorTabId;
            }
            if (Helper.isEmptyString(validatorQuery.reply) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(validatorTabId, queryAnswerClass);
                answeredQuery.push(validatorQuery.id);
            }
        }

        if (firstUnansweredQuery !== null) {
            queryTabPanel.activate(firstUnansweredQuery);
        }
        else {
            queryTabPanel.activate('1');
        }

        querySuccess = function querysuccess(queryId) {
            var queryTabId = queryBag.getTabIDForQuery(queryId);

            if (Helper.isEmptyString(queryTabId) === true) {
                return;
            }
            queryTabPanel.setTabHandelClass(queryTabId, queryAnswerClass);
            if (answeredQuery.indexOf(queryTabId) === -1) {
                answeredQuery.push(queryTabId);
                unAnswered = (unAnswered < 0) ? 0 : unAnswered - 1;
            }
            setcurrentQueryTabId.call(this);
        };
        setcurrentQueryTabId.call(this);
        EventBus.subscribe('QueryJM:OnProceedSuccess', querySuccess, this);
    };

    QueriesInit.prototype.loadAuthor = function loadAuthor(readOnlyMode) {
        var query, tabId, querySuccess,
            queries = this.correctorQueries,
            tot = queries.length,
            i = 0,
            queryMapTab = {},
            unAnswered = (tot),
            queryTabPanel = this.queryTabPanel,
            answeredQuery = [],
            firstUnansweredQuery = null;

        // TODO: Break the chunk
        // Author Queries
        for (; i < tot; i += 1) {
            query = queries[i];
            tabId = queryTabPanel.add(query.id);
            if (firstUnansweredQuery === null && query.answer === '') {
                firstUnansweredQuery = tabId;
            }
            queryMapTab[query.id] = tabId;
            fillQueryInTab(tabId, query, readOnlyMode, this);
            if (Helper.isEmptyString(query.answer) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(tabId, queryAnswerClass);
                answeredQuery.push(query.id);
            }
        }
        setQueryCounter(unAnswered, queryTabPanel);
        if (firstUnansweredQuery !== null) {
            queryTabPanel.activate(firstUnansweredQuery);
        }
        else {
            queryTabPanel.activate('1');
        }

        querySuccess = function success(data) {
            if (Helper.isUndefined(queryMapTab[data.id]) === false) {
                queryTabPanel.setTabHandelClass(
                    queryMapTab[data.id], queryAnswerClass
                    );
                if (answeredQuery.indexOf(data.id) === -1) {
                    answeredQuery.push(data.id);
                    unAnswered = (unAnswered < 0) ? 0 : unAnswered - 1;
                    setQueryCounter(unAnswered, queryTabPanel);
                }
            }
            setcurrentQueryTabId.call(this);
        };
        setcurrentQueryTabId.call(this);
        EventBus.subscribe('Query:onproceedSuccess', querySuccess, this);
    };

    QueriesInit.prototype.setS3FormUpload = function setS3FormUpload(s3FormData) {
        this.s3FormData = s3FormData;
    };

    QueriesInit.prototype.loadEditor = function loadEditor(readOnlyMode) {
        var query, tabId, querySuccess,
            queries = this.correctorQueries,
            tot = queries.length,
            i = 0,
            queryMapTab = {},
            unAnswered = (tot),
            queryTabPanel = this.queryTabPanel,
            answeredQuery = [],
            firstUnansweredQuery = null;

        // TODO: Break the chunk
        // Author Queries
        for (; i < tot; i += 1) {
            query = queries[i];
            tabId = queryTabPanel.add(query.id);
            if (firstUnansweredQuery === null && query.answer === '') {
                firstUnansweredQuery = tabId;
            }
            queryMapTab[query.id] = tabId;
            fillQueryInTab(tabId, query, readOnlyMode, this);
            if (Helper.isEmptyString(query.answer) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(tabId, queryAnswerClass);
                answeredQuery.push(query.id);
            }
        }

        if (firstUnansweredQuery !== null) {
            queryTabPanel.activate(firstUnansweredQuery);
        }
        else {
            queryTabPanel.activate('1');
        }

        querySuccess = function success(data) {
            if (Helper.isUndefined(queryMapTab[data.id]) === false) {
                queryTabPanel.setTabHandelClass(
                    queryMapTab[data.id], queryAnswerClass
                    );
                if (answeredQuery.indexOf(data.id) === -1) {
                    answeredQuery.push(data.id);
                    unAnswered = (unAnswered < 0) ? 0 : unAnswered - 1;
                }
            }
            setcurrentQueryTabId.call(this);
        };
        setcurrentQueryTabId.call(this);
        EventBus.subscribe('Query:onproceedSuccess', querySuccess, this);
    };

    QueriesInit.prototype.loadValidator = function loadValidatorFn(readOnlyMode) {
        var queries = this.correctorQueries,
            tot = queries.length,
            i = 0, query, tabId, validatorTabId, updateQueryTab,
            queryMapTab = {},
            validatorQueries = this.validatorQueries,
            ceTot = validatorQueries.length,
            j = 0,
            validatorQuery,
            queryTabPanel = this.queryTabPanel,
            answeredQuery = [],
            firstUnansweredQuery = null,
            unAnswered = (tot + ceTot);

        // TODO: Break the chunk
        // Author Queries
        for (; i < tot; i += 1) {
            query = queries[i];
            tabId = queryTabPanel.add(query.id);
            queryMapTab[query.id] = tabId;
            fillQueryInTab(tabId, query, readOnlyMode, this);
            if (Helper.isEmptyString(query.answer) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(tabId, queryAnswerClass);
                answeredQuery.push(query.id);
            }
        }
        // Copy Editor Queries
        for (; j < ceTot; j += 1) {
            validatorQuery = validatorQueries[j];
            validatorTabId = fillValidatorQueryInTab(validatorQuery, readOnlyMode, this);
            if (firstUnansweredQuery === null &&
                Helper.isEmptyString(validatorQuery.question) === true
            ) {
                firstUnansweredQuery = validatorTabId;
            }
            if (Helper.isEmptyString(validatorQuery.question) === false) {
                unAnswered -= 1;
                queryTabPanel.setTabHandelClass(validatorTabId, queryAnswerClass);
                answeredQuery.push(validatorQuery.id);
            }
        }
        if (firstUnansweredQuery !== null) {
            queryTabPanel.activate(firstUnansweredQuery);
        }
        else if (tot > 0) {
            queryTabPanel.activate('1');
        }

        updateQueryTab = function updateQuery() {
            tot = this.correctorQueries.length;
            ceTot = this.queryBag.getAll().length;
        };
        setcurrentQueryTabId.call(this);
        EventBus.subscribe('QueryBag:Update', updateQueryTab, this);
    };

    return QueriesInit;
});

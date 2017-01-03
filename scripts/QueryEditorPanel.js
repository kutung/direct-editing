define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/RequestBuilder',
    'scripts/Panel', 'scripts/SelectBox', 'scripts/ConfigReader', 'scripts/Util',
    'scripts/ErrorHandler'
], function queryEditorPanelLoader(
    Helper, RTE, RequestBuilder, Panel, SelectBox, Config, Util, ErrorHandler
) {
    var queryTemplate, localeData, errorHandler, querySuccessMessage;

    queryTemplate = [
        '<div class="pc-query-editor">',
            '<span class="label">Problem Type</span>',
            '<span class="query-locate">Go to Query location</span>',
            '<div class="problem-type"></div>',
            '<span class="label">Query</span>',
            '<div class="canned-query"></div>',
            '<div class="query"></div>',
            '<div class="buttons-container">',
            '</div>',
        '</div>'
    ];

    function initializeVariables(instance) {
        instance.articleToken = null;
        instance.deleteUri = null;
        instance.queryPersistor = null;
        instance.eBus = null;
        instance.fragment = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.panel = null;
        instance.problemTypeChangeFn = null;
        instance.problemTypes = null;
        instance.problemTypesList = null;
        instance.proceedFn = null;
        instance.query = null;
        instance.queryChangeFn = null;
        instance.queryContainer = null;
        instance.queryId = null;
        instance.panelId = null;
        instance.queryList = null;
        instance.queryRteContainer = null;
        instance.queryLocator = null;
        instance.requestBuilder = null;
        instance.rte = null;
        instance.saveQuery = null;
        instance.queryBag = null;
        instance.scrollToQueryLocationFn = null;
        instance.persistedOnServer = false;
        instance.content = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('query.not.rendered');
        }
    }

    function proceedSuccess(response) {
        var res = JSON.parse(response);

        this.content = res.data.question;
        this.hideLocate(false);
        this.persistedOnServer = true;
        this.setLoading(false);
        this.eBus.publish('QueryEditor:OnProceedSuccess');
        this.eBus.publish('QueryBag:Add', this.queryId, res.data);
        this.eBus.publish('FlashMessage:show', querySuccessMessage,
            {'closeButton': false, 'success': true}
        );
    }

    function proceedFailure(response, req, xmlHttp) {
        var eb = this.eBus,
            saveErrorReloadMessage = Config.getLocaleByKey('server.save.reload'),
            options = {
                'showCloseButton': false,
                'callback': function removeChangedFlagFn() {
                    eb.publish('Save:removeChanges');
                    eb.publish('Browser:reload');
                }
            };

        this.setLoading(false);
        if (xmlHttp.status === ErrorHandler.getCode('ForceReloadException')) {
            this.eBus.publish('alert:show', saveErrorReloadMessage, options);
            return;
        }
        this.eBus.publish('Query:onUploadFail', this);
        throw new Error('query.save.failed');
    }

    function proceedTimedOut() {
        this.setLoading(false);
        throw new Error('query.save.timed.out');
    }

    function updateQuerySuccess(response) {
        var res = JSON.parse(response);

        this.content = res.data.question;
        this.persistedOnServer = true;
        this.setLoading(false);
    }

    function updateQueryFailure() {
        this.setLoading(false);
        this.eBus.publish('Query:onUploadUpdate', this);
        throw new Error('query.save.failed');
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function updateQueryTimeout() {
        this.setLoading(false);
        throw new Error('query.update.timed.out');
    }

    function proceedFn() {
        var data, validatorData;

        data = this.getData();
        if (this.isEnabled === false || this.content === data.question) {
            return;
        }
        if (
            this.persistedOnServer === false &&
            this.fragment instanceof window.DocumentFragment === false
        ) {
            throw new Error('query.editor.panel.empty.select_empty');
        }
        if (this.problemTypesList.getSelectedIndex() === -1) {
            throw new Error('query.editor.panel.empty.problemtype');
        }
        if (this.queryList.getSelectedIndex() === -1) {
            throw new Error('query.editor.panel.empty.query');
        }
        if (Util.checkCKEditorEmpty(data.question, this.htmlDoc) === true) {
            this.eBus.publish('QueryEditorPanel:Empty', this.queryId);
            throw new Error('query.editor.panel.empty.question');
        }
        validatorData = {};
        validatorData.question = data.question;
        validatorData.problem_type_id = data.problemType.value;
        if (Helper.objectHasKey(data.query, 'value') === true) {
            validatorData.problem_queries_id = data.query.value;
        }
        if (Helper.objectHasKey(data, 'id') === true) {
            validatorData.id = data.id;
        }

        if (Helper.objectHasKey(data, 'answer') === true) {
            validatorData.answer = data.answer;
        }

        this.setLoading(true);
        if (this.persistedOnServer === true) {
            this.queryPersistor.update(
                this.queryId,
                this.panelId,
                validatorData,
                updateQuerySuccess.bind(this),
                updateQueryFailure.bind(this),
                updateQueryTimeout.bind(this)
            );
        }
        else {
            this.queryPersistor.create(
                this.fragment, this.queryId,
                validatorData,
                proceedSuccess.bind(this),
                proceedFailure.bind(this),
                proceedTimedOut.bind(this)
            );
        }
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true,
            'extraWhitelistedTags': ['br']
        });
    }

    function queryEditor(cont, doc, win, eventBus, QueryPersistor) {
        if (win instanceof win.Window === false) {
            throw new Error('query.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('query.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('query.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('query.requires.eventbus');
        }
        initializeVariables(this);
        this.queryContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.queryPersistor = QueryPersistor;
        localeData = Config.getLocale();
        querySuccessMessage = Config.getLocaleByKey('query.create.success');
        this.eBus.subscribe('QueryEditor:setReadonly', this.setReadonly, this);
        this.eBus.subscribe('QueryEditor:makeReadonly', this.makeReadonly, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    queryEditor.prototype.setEnabled = function setEnabled(enable) {
        if (enable === false) {
            this.isEnabled = false;
            this.problemTypesList.setEnabled(false);
            this.queryList.setEnabled(false);
            this.rte.setReadOnly();
        }
        else {
            this.problemTypesList.setEnabled(true);
            this.queryList.setEnabled(true);
            this.rte.setEditable();
            this.isEnabled = true;
        }
    };
    //TODO added for server failure readonly mode.
    queryEditor.prototype.setReadonly = function setReadonly() {
        this.isEnabled = false;
    };

    //TODO avoid to use this function.
    queryEditor.prototype.makeReadonly = function makeReadonly() {
        this.setEnabled(false);
    };

    queryEditor.prototype.setFragment = function setFragment(fragment) {
        this.fragment = fragment;
    };

    queryEditor.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.queryContainer;
    };

    queryEditor.prototype.getData = function getData() {
        var data = {}, problemType = this.problemTypesList.getSelectedOptions(),
            query = this.queryList.getSelectedOptions();

        assertRendered(this);
        data.question = getRTEData(this);
        data.problemType = problemType[0];
        data.query = query[0];

        return data;
    };

    queryEditor.prototype.setProblemTypes = function setProblemTypes(problemTypes) {
        this.problemTypes = problemTypes;
    };

    function populateProblemTypes(listBox, problemTypes) {
        problemTypes.forEach(function each(problemType) {
            var text;

            if (problemType.problemTypeId !== '') {
                text = problemType.problemTypeId + ' - ' + problemType.text;
            }
            else {
                text = problemType.text;
            }

            listBox.addOption(text, problemType.id, {
                'problemTypeId': problemType.problemTypeId
            });
        });
    }

    function populateQueryList(listBox, problemTypeId, problemTypes) {
        var i = 0, len = problemTypes.length, queries = [];

        listBox.clearOptions();
        for (; i < len; i += 1) {
            if (problemTypes[i].problemTypeId === problemTypeId) {
                queries = problemTypes[i].queries;
                break;
            }
        }

        queries.forEach(function each(query) {
            listBox.addOption(query.text, query.id);
        });
    }

    function onProblemTypeChange(problemType) {
        if (problemType !== null) {
            populateQueryList(
                this.queryList, problemType.dataset.problemTypeId, this.problemTypes
            );
        }
        this.rte.setData('');
    }

    function onQueryChange(selectedQuery) {
        if (selectedQuery !== null) {
            this.rte.setData(selectedQuery.text);
        }
        else {
            this.rte.setData('');
        }
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + s4();
    }

    function scrollToQueryLocationFn() {
        var locatorTag,
            targetTagName = 'span';

        locatorTag = this.queryBag.getHtmlIDForQuery(this.queryId);
        if (locatorTag === null) {
            return;
        }
        this.eBus.publish(
            'Editor:ScrollTo', targetTagName, locatorTag, 'query');
        this.eBus.publish(
            'Supplementary:ScrollTo', targetTagName, locatorTag, 'query');
    }

    queryEditor.prototype.render = function render() {
        var queryListElem, probListElem, child,
            qs = this.queryContainer.querySelector.bind(this.queryContainer),
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div'),
            guid1 = guid(),
            guid2 = guid(),
            problemTypeName = 'ProbType' + guid1,
            queryListName = 'QueryList' + guid2;

        if (this.isRendered === true) {
            throw new Error('query.already.rendered');
        }
        this.requestBuilder = new RequestBuilder();
        this.panel = new Panel(
            this.queryContainer, this.htmlDoc, this.global, this.eBus
        );
        tmpNode.innerHTML = queryTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.renderComponentStyle();
        this.panel.render();
        this.panel.add(frag);
        this.queryContainer.appendChild(this.panel.getElement());
        this.questionContainer = qs('.pc-query-editor .query');
        this.queryLocator = qs('.pc-query-editor .query-locate');
        probListElem = qs('.pc-query-editor .problem-type');
        this.problemTypesList = new SelectBox(
            probListElem, this.htmlDoc, this.global, this.eBus, problemTypeName,
            localeData
        );
        this.problemTypesList.renderComponentStyle();
        this.problemTypesList.render();
        queryListElem = qs('.pc-query-editor .canned-query');
        this.queryList = new SelectBox(
            queryListElem, this.htmlDoc, this.global, this.eBus, queryListName,
            localeData
        );
        this.queryList.renderComponentStyle();
        this.queryList.render();
        this.rte = new RTE(this.global, this.htmlDoc, this.questionContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.problemTypeChangeFn = onProblemTypeChange.bind(this);
        this.queryChangeFn = onQueryChange.bind(this);
        this.scrollToQueryLocationFn = scrollToQueryLocationFn.bind(this);
        populateProblemTypes(this.problemTypesList, this.problemTypes);
        this.proceedFn = proceedFn.bind(this);
        this.queryLocator.addEventListener('click', this.scrollToQueryLocationFn, false);
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.isRendered = true;
        this.isEnabled = true;
        this.eBus.subscribe('SelectBox:' + problemTypeName + ':OnChange', this.problemTypeChangeFn);
        this.eBus.subscribe('SelectBox:' + queryListName + ':OnChange', this.queryChangeFn);
        this.eBus.publish('QueryEditor:OnRender', this);
    };

    queryEditor.prototype.setQueryBag = function setQueryBag(queryBag) {
        this.queryBag = queryBag;
    };

    queryEditor.prototype.hideLocate = function hideLocate(flag) {
        if (flag === true) {
            this.queryLocator.style.display = 'none';
        }
        else {
            this.queryLocator.style.display = 'inline';
        }
    };

    queryEditor.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    queryEditor.prototype.getQueryId = function getQueryId() {
        return this.queryId;
    };

    queryEditor.prototype.setPanelId = function setPanelId(id) {
        this.panelId = id;
    };

    queryEditor.prototype.setQueryId = function setQueryId(id) {
        if (Helper.isString(id) === false) {
            throw new Error('query.id.must.be.a.string');
        }
        if (Helper.isEmptyString(id) === true) {
            throw new Error('query.id.cannot.be.empty');
        }

        if (this.queryId !== null) {
            throw new Error('query.id.cannot.be.set.more.than.once');
        }

        this.queryId = id;
    };

    queryEditor.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('query.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    queryEditor.prototype.setPersisted = function setPersisted(persisted) {
        this.persistedOnServer = (persisted === true);
    };

    queryEditor.prototype.isPersisted = function isPersisted() {
        return this.persistedOnServer;
    };

    function removeQuerySuccess(callback, instance, response) {
        instance.persistedOnServer = true;
        instance.setLoading(false);
        callback.call(instance.global);
    }

    function removeQueryFailure() {
        this.setLoading(false);
        this.eBus.publish('Query:OnRemoveFail', this);
        throw new Error('query.save.failed');
    }

    function removeQueryTimedOut() {
        this.setLoading(false);
        this.eBus.publish('Query:OnRemoveTimeout', this);
    }

    queryEditor.prototype.deleteQuery = function deleteQuery(
        callback, tabId, queryId
    ) {
        this.queryId = queryId;
        this.setLoading(true);
        this.queryPersistor.remove(
            tabId, this.queryId, removeQuerySuccess.bind(null, callback, this),
            removeQueryFailure.bind(this), removeQueryTimedOut.bind(this)
        );
    };

    queryEditor.prototype.setQuery = function setQuery(query) {
        assertRendered(this);
        this.rte.setData(query);
        this.content = query;
    };

    queryEditor.prototype.setProblemTypeId = function setProblemTypeId(probTypeVal) {
        var prbDataSet;

        assertRendered(this);
        this.problemTypesList.setValue(probTypeVal);
        if (probTypeVal !== null) {
            prbDataSet = this.problemTypesList.getOptionAt(probTypeVal);
            populateQueryList(
                this.queryList, prbDataSet.dataset.problemTypeId, this.problemTypes
            );
        }
        this.rte.setData('');
    };

    queryEditor.prototype.setProblemQueryId = function setProblemQueryId(
        probQryVal
    ) {
        assertRendered(this);
        this.queryList.setValue(probQryVal);
    };

    queryEditor.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.eBus.unsubscribe('SelectBox:ProbType:OnChange', this.problemTypeChangeFn);
        this.eBus.unsubscribe('SelectBox:QueryList:OnChange', this.queryChangeFn);
        this.queryLocator.removeEventListener('click', this.scrollToQueryLocationFn, false);
        this.panel.destroy();
        this.queryContainer.innerHTML = '';
        this.eBus.unsubscribe('Query:setReadonly', this.setReadonly);
        this.eBus.unsubscribe('Query:makeReadonly', this.makeReadonly);
        initializeVariables(this);
        eb.publish('QueryEditor:OnDestroy');
    };

    return queryEditor;
});

define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/RequestBuilder',
    'scripts/Panel', 'scripts/Util', 'scripts/ConfigReader', 'scripts/ErrorHandler'
], function queryJmPanelLoader(Helper, RTE, RequestBuilder, Panel, Util, Config, ErrorHandler) {
    var queryTemplate, errorHandler, querySuccessMessage;

    queryTemplate = [
        '<div class="pc-query-editor">',
            '<div class="canned-query"></div>',
            '<p class="query"></p>',
            '<div class="answer"></div>',
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
        instance.requestBuilder = null;
        instance.answerContainer = null;
        instance.queryBag = null;
        instance.rte = null;
        instance.saveQuery = null;
        instance.persistedOnServer = false;
        instance.isQueryReplied = false;
        instance.scrollToQueryLocationFn = null;
        instance.content = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('query.not.rendered');
        }
    }

    function updateQuerySuccess(response) {
        var data = this.getData();

        this.persistedOnServer = true;
        this.isQueryReplied = true;
        this.setLoading(false);
        this.content = data.reply;
        this.eBus.publish('QueryJM:OnProceedSuccess', this.queryId);
        this.eBus.publish('QueryBag:SetReply', this.queryId, data.reply);
        this.eBus.publish('FlashMessage:show',
            querySuccessMessage.replace('{{queryName}}', this.queryId),
            {'closeButton': false, 'success': true}
        );
    }

    function updateQueryFailure() {
        this.setLoading(false);
        this.eBus.publish('Query:onUploadUpdate', this);
        throw new Error('query.save.failed');
    }

    function updateQueryTimeout() {
        this.setLoading(false);
        throw new Error('query.update.timed.out');
    }

    function proceedFn() {
        var data, validatorData;

        data = this.getData();

        if (this.isEnabled === false || this.content === data.reply) {
            return;
        }
        if (Util.checkCKEditorEmpty(data.reply, this.htmlDoc) === true) {
            if (this.isQueryReplied === true) {
                this.eBus.publish('QueryJmPanel:Empty', this.queryId);
                throw new Error('query.editor.panel.empty.reply');
            }
            return;
        }

        validatorData = {};
        validatorData.reply = data.reply;
        if (Helper.objectHasKey(data, 'id') === true) {
            validatorData.id = data.id;
        }

        this.setLoading(true);
        this.queryPersistor.update(
            this.queryId,
            this.panelId,
            validatorData,
            updateQuerySuccess.bind(this),
            updateQueryFailure.bind(this),
            updateQueryTimeout.bind(this)
        );
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true,
            'extraWhitelistedTags': ['br']
        });
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function queryJM(cont, doc, win, eventBus, QueryPersistor) {
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
        querySuccessMessage = Config.getLocaleByKey('query.save.success');
        this.eBus.subscribe('QueryEditor:setReadonly', this.setReadonly, this);
        this.eBus.subscribe('QueryEditor:makeReadonly', this.makeReadonly, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    queryJM.prototype.setEnabled = function setEnabled(enable) {
        if (enable === false) {
            this.isEnabled = false;
            this.rte.setReadOnly();
        }
        else {
            this.rte.setEditable();
            this.isEnabled = true;
        }
    };
    //TODO added for server failure readonly mode.
    queryJM.prototype.setReadonly = function setReadonly() {
        this.isEnabled = false;
    };

    //TODO avoid to use this function.
    queryJM.prototype.makeReadonly = function makeReadonly() {
        this.setEnabled(false);
    };

    queryJM.prototype.setFragment = function setFragment(fragment) {
        this.fragment = fragment;
    };

    queryJM.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.queryContainer;
    };

    queryJM.prototype.getData = function getData() {
        var data = {};

        assertRendered(this);
        data.reply = getRTEData(this);

        return data;
    };

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

    queryJM.prototype.render = function render() {
        var child,
            qs = this.queryContainer.querySelector.bind(this.queryContainer),
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div');

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
        this.answerContainer = qs('.pc-query-editor .answer');
        this.scrollToQueryLocationFn = scrollToQueryLocationFn.bind(this);
        this.rte = new RTE(this.global, this.htmlDoc, this.answerContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.proceedFn = proceedFn.bind(this);
        this.questionContainer.addEventListener('click', this.scrollToQueryLocationFn, false);
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.isRendered = true;
        this.isEnabled = true;
        this.eBus.publish('QueryEditor:OnRender', this);
    };

    queryJM.prototype.setQueryBag = function setQueryBag(queryBag) {
        this.queryBag = queryBag;
    };

    queryJM.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    queryJM.prototype.getQueryId = function getQueryId() {
        return this.queryId;
    };

    queryJM.prototype.setPanelId = function setPanelId(id) {
        this.panelId = id;
    };

    queryJM.prototype.setQueryId = function setQueryId(id) {
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

    queryJM.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('query.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    queryJM.prototype.setPersisted = function setPersisted(persisted) {
        this.persistedOnServer = (persisted === true);
    };

    queryJM.prototype.isPersisted = function isPersisted() {
        return this.persistedOnServer;
    };

    queryJM.prototype.isAnswered = function isAnswered() {
        return this.isQueryReplied;
    };

    queryJM.prototype.setAnswered = function setAnswered(bool) {
        this.isQueryReplied = bool;
    };

    queryJM.prototype.setQuery = function setQuery(query) {
        this.questionContainer.innerHTML = query;
    };

    queryJM.prototype.setReply = function setReply(reply) {
        assertRendered(this);
        this.rte.setData(reply);
        this.content = reply;
    };

    queryJM.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.questionContainer.removeEventListener('click', this.scrollToQueryLocationFn, false);
        this.panel.destroy();
        this.queryContainer.innerHTML = '';
        this.eBus.unsubscribe('Query:setReadonly', this.setReadonly);
        this.eBus.unsubscribe('Query:makeReadonly', this.makeReadonly);
        initializeVariables(this);
        eb.publish('QueryEditor:OnDestroy');
    };

    return queryJM;
});

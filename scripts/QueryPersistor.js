define([
    'scripts/Helper', 'scripts/RequestBuilder', 'scripts/Normalizer',
    'scripts/Dom2Xml', 'scripts/Sanitizer', 'scripts/Annotate', 'scripts/Actor',
    'customer/Config', 'scripts/ElementSyncFormatter', 'scripts/FeatureToggle'
], function QueryPersistorLoader(
    Helper, RequestBuilder, Normalizer, Dom2Xml, Sanitizer, Annotate, Actor,
    CustomerConfig, ElementSyncFormatter, Features
) {
    var tabAndQueryHash = [];

    function verifyUploadOptions(actorDescription, uploadOptions) {
        if (Helper.isObject(uploadOptions) === false) {
            throw new Error('validator.uploadOptions.must.be.an.object');
        }
        if (actorDescription === 'queryReplier') {
            if (Helper.objectHasKey(uploadOptions, 'updateEndPoint') === false) {
                throw new Error('validator.updateQuery.is.mandatory');
            }
            if (Helper.isString(uploadOptions.updateEndPoint) === false) {
                throw new Error('validator.updateQuery.must.be.a.string');
            }
            if (Helper.isEmptyString(uploadOptions.updateEndPoint) === true) {
                throw new Error('validator.updateQuery.cannot.be.empty');
            }
        }
        else {
            if (Helper.objectHasKey(uploadOptions, 'saveEndPoint') === false) {
                throw new Error('validator.saveQuery.is.mandatory');
            }
            if (Helper.objectHasKey(uploadOptions, 'removeEndPoint') === false) {
                throw new Error('validator.deleteQuery.is.mandatory');
            }
            if (Helper.isString(uploadOptions.saveEndPoint) === false) {
                throw new Error('validator.saveQuery.must.be.a.string');
            }
            if (Helper.isString(uploadOptions.removeEndPoint) === false) {
                throw new Error('validator.deleteQuery.must.be.a.string');
            }
            if (Helper.isEmptyString(uploadOptions.saveEndPoint) === true) {
                throw new Error('validator.saveQuery.cannot.be.empty');
            }
            if (Helper.isEmptyString(uploadOptions.removeEndPoint) === true) {
                throw new Error('validator.deleteQuery.cannot.be.empty');
            }
        }
    }

    function QueryPersistor(
        ArticleContainer, SupplementaryContainer, EndPoints, EventBus, Token,
        QueryBag, CurrentActor
    ) {
        var actorIns = new Actor(),
            actorDescription = actorIns.getValidActor(CurrentActor);

        verifyUploadOptions(actorDescription, EndPoints);
        this.articleContainer = ArticleContainer;
        this.supplementaryContainer = SupplementaryContainer;
        this.querySaveEndPoint = EndPoints.saveEndPoint;
        this.queryUpdateEndPoint = EndPoints.updateEndPoint;
        this.queryRemoveEndPoint = EndPoints.removeEndPoint;
        this.currentActor = CurrentActor;
        this.eventBus = EventBus;
        this.queryBag = QueryBag;
        this.token = Token;
        this.win = window;
        this.doc = document;
        this.normalizer = new Normalizer();
        this.syncElementContainer = null;
    }

    function makeRequest(
        url, saveData, successCallback, failureCallback, timeoutCallback
    ) {
        var request, rB = new RequestBuilder(),
            formData = new FormData();

        formData.append('input', JSON.stringify(saveData));
        rB.setUrl(url);
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(successCallback);
        rB.setFailureCallback(failureCallback);
        rB.setTimeoutCallback(timeoutCallback);
        request = rB.build();
        request.send();
    }

    function getNameAttributeParentNode(instance, parentNode, attrName) {
        var found = false;

        while (parentNode !== instance.articleContainer ||
               parentNode !== instance.supplementaryContainer) {
            if (parentNode.nodeName.toLowerCase() === 'div' &&
                parentNode.hasAttribute(attrName) === true
            ) {
                found = true;
                break;
            }
            parentNode = parentNode.parentNode;
        }
        if (found === false) {
            throw new Error('error.no.proper.parent.node');
        }

        return parentNode;
    }

    function getParentForChild(childNode, instance) {
        var parentNode = childNode.parentNode;

        if (Features.isFeatureEnabled('Editor.ElementSync') === true &&
            instance.syncElementContainer.contains(parentNode)
        ) {
            return getNameAttributeParentNode(
                instance, parentNode, 'data-elementsync-name'
            );
        }

        return getNameAttributeParentNode(instance, parentNode, 'name');
    }

    function getSanitizedHtml(parentNode, instance) {
        var tempNode, html, fragment = {};

        tempNode = instance.doc.createElement('div');
        tempNode.appendChild(parentNode.cloneNode(true));
        html = Dom2Xml.toXml(tempNode.firstChild);
        fragment.id = parentNode.getAttribute('name');
        fragment.html = Sanitizer.sanitize(
            html, true, false, instance.win, ['br']
        );
        return fragment;
    }

    //changing attribute while create query in sync elements
    function changeAttribute(parentNode) {
        parentNode.dataset.changes = 1;
        parentNode.removeAttribute('data-changes');
    }

    QueryPersistor.prototype.create = function create(
        fragment, newQueryId, data, successCallback, failureCallback,
        timeoutCallback
    ) {
        var queryIdentifier, requestId, queryNode, requestEditorTag, parentNode,
            requestInnerHTML, cleanedData,
            saveObj = {},
            requestTag = fragment.querySelector('[data-request-id]'),
            annotateCloneNode, syncEl;

        if (requestTag === null) {
            throw new Error('query.create.request_id_missing');
        }
        requestId = requestTag.dataset.requestId;
        queryNode = document.createElement('span');
        queryIdentifier = Helper.getUniqueId('pc');
        queryNode.dataset.name = queryIdentifier;
        queryNode.classList.add('query-pointer');
        requestTag.appendChild(queryNode);
        requestEditorTag = this.articleContainer.querySelector(
            'span[data-request-id="' + requestId + '"]'
        );
        if (requestEditorTag instanceof this.win.HTMLElement === false) {
            requestEditorTag = this.supplementaryContainer.querySelector(
                'span[data-request-id="' + requestId + '"]'
            );
        }
        if (requestEditorTag instanceof this.win.HTMLElement === false) {
            throw new Error('query.create.editor_request_id_missing');
        }
        parentNode = getParentForChild(requestEditorTag, this);
        if (Features.isFeatureEnabled('Editor.ElementSync') === true) {
            changeAttribute(parentNode);
        }
        requestInnerHTML = requestTag.innerHTML;
        requestEditorTag.insertAdjacentHTML('afterEnd', requestInnerHTML);
        requestEditorTag.parentNode.removeChild(requestEditorTag);
        annotateCloneNode = parentNode.cloneNode(true);

        if (Features.isFeatureEnabled('Editor.ElementSync') === true &&
            this.syncElementContainer.contains(parentNode)
        ) {
            annotateCloneNode = ElementSyncFormatter.changeActualElementAttrs(
                this.win,
                annotateCloneNode,
                'elementsync'
            );
        }

        cleanedData = getSanitizedHtml(Annotate.removeWrapper(annotateCloneNode), this);
        this.eventBus.publish('ActionLog:action', 'query-create', null,
            requestEditorTag, requestTag, parentNode
        );
        saveObj.validatorQuery = data;
        saveObj.validatorQuery.position_id = queryIdentifier;
        saveObj.data = [];
        saveObj.data.push(cleanedData);
        saveObj.token = this.token;
        makeRequest(
            this.querySaveEndPoint,
            saveObj,
            successCallback,
            failureCallback,
            timeoutCallback
        );
    };

    QueryPersistor.prototype.removeMapping = function removeMapping(queryId) {
        var tabQuery,
            tot = tabAndQueryHash.length,
            i = 0;

        for (; i < tot; i += 1) {
            tabQuery = tabAndQueryHash[i];
            if (
                tabQuery.hasOwnProperty('queryId') === true &&
                tabQuery.queryId === queryId
            ) {
                delete tabAndQueryHash[i];
                tabAndQueryHash.splice(i, 1);
                break;
            }
        }
        return null;
    };

    QueryPersistor.prototype.setQueryMapping = function setQueryMapping(
        tabId, queryId
    ) {
        var temp = {};

        temp.tabId = tabId;
        temp.queryId = queryId;
        tabAndQueryHash.push(temp);
    };

    QueryPersistor.prototype.update = function update(
        queryId, panelId, data, successCallback, failureCallback,
        timeoutCallback
    ) {
        var queryServerID = this.queryBag.getQueryNameForTab(panelId),
            saveObj = {};

        saveObj.validatorQuery = data;
        saveObj.validatorQuery.id = queryServerID.serverID;
        saveObj.token = this.token;
        makeRequest(
            this.queryUpdateEndPoint,
            saveObj,
            successCallback,
            failureCallback,
            timeoutCallback
        );
        this.eventBus.publish('ActionLog:save',
            {'action': 'query-update', 'data': saveObj}
        );
    };

    QueryPersistor.prototype.getQueryIdForTab = function getQueryIdForTab(tId) {
        var tabQuery,
            tot = tabAndQueryHash.length,
            i = 0;

        for (; i < tot; i += 1) {
            tabQuery = tabAndQueryHash[i];
            if (
                tabQuery.hasOwnProperty('tabId') === true &&
                tabQuery.tabId === tId
            ) {
                return tabQuery.queryId;
            }
        }
        return null;
    };

    QueryPersistor.prototype.remove = function remove(
        tabId, queryId, successCallback, failureCallback, timeoutCallback
    ) {
        var queryServerID, queryHtmlID, requestEditorTag, parentNode,
            cleanedData, annotateCloneNode,
            queryBag = this.queryBag,
            saveObj = {};

        queryServerID = queryBag.getServerIDForQuery(queryId);
        queryHtmlID = queryBag.getHtmlIDForQuery(queryId);
        if (queryServerID === null || queryHtmlID === null) {
            throw new Error('query.delete.tab_id_hash_missing');
        }
        requestEditorTag = this.articleContainer.querySelector(
            'span[data-name=' + queryHtmlID + ']'
        );
        if (requestEditorTag instanceof this.win.HTMLElement === false) {
            requestEditorTag = this.supplementaryContainer.querySelector(
                'span[data-name=' + queryHtmlID + ']'
            );
        }
        if (requestEditorTag instanceof this.win.HTMLElement === false) {
            throw new Error('query.delete.tag_missing');
        }
        parentNode = getParentForChild(requestEditorTag, this);
        if (Features.isFeatureEnabled('Editor.ElementSync') === true) {
            changeAttribute(parentNode);
        }
        requestEditorTag.parentNode.removeChild(requestEditorTag);
        annotateCloneNode = parentNode.cloneNode(true);
        this.eventBus.publish('ActionLog:action', 'query-delete', null,
            requestEditorTag, null, parentNode
        );
        cleanedData = getSanitizedHtml(Annotate.removeWrapper(annotateCloneNode), this);
        saveObj.id = queryServerID;
        saveObj.data = [];
        saveObj.data.push(cleanedData);
        saveObj.token = this.token;
        makeRequest(
            this.queryRemoveEndPoint,
            saveObj,
            successCallback,
            failureCallback,
            timeoutCallback
        );
    };

    QueryPersistor.prototype.setSyncElementContainer = function setSyncElementContainer(
        container
    ) {
        this.syncElementContainer = container;
    };

    return QueryPersistor;
});

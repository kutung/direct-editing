define([
    'scripts/Collection/CitationCollection', 'scripts/Model/CitationHistory',
    'scripts/Model/CitationModel', 'scripts/Helper', 'scripts/Util',
    'scripts/CustomerConfigReader', 'scripts/View/CitationView',
    'scripts/DataChangeAttributeHandler', 'scripts/EventBus',
    'scripts/ConfigReader'
], function CitationControllerLoader(
    CitationCollection, CitationHistory, CitationModel, Helper, Util,
    customerConfig, CitationView, DataChangeAttributeHandler, EventBus, Config
) {
    var refIdAttr = Util.getAttributeSelector('citationReferenceId'),
        citationSelector = Util.getSelector('citation');

    function initializeVariables(instance) {
        instance.doc = null;
        instance.win = null;
        instance.currentActor = null;
        instance.editorParentContainer = null;
        instance.stage = 1;
        instance.citationCollection = null;
        instance.citationView = null;
        instance.isLoaded = false;
        instance.referenceMapperInst = null;
    }

    function CitationController(
        Win, Doc, CurrentActor, EditorParentContainer, referenceMapperInst
    ) {
        if (EditorParentContainer instanceof Win.HTMLElement === false) {
            throw new Error('error.editor.parent.container.missing');
        }
        if (Helper.isEmptyString(CurrentActor) === true) {
            throw new Error('error.current.actor.missing');
        }
        initializeVariables(this);
        this.doc = Doc;
        this.win = Win;
        this.currentActor = CurrentActor;
        this.editorParentContainer = EditorParentContainer;
        this.referenceMapperInst = referenceMapperInst;
        this.citationCollection = new CitationCollection();
        this.citationView = new CitationView(Win, Doc, referenceMapperInst);
    }

    function getCitation(node) {
        var citationElem, refids, refIdsArray = [], citationModel,
            refIdAttrSelector;

        refIdAttrSelector = '[' + refIdAttr + ']';
        citationElem = node.querySelector(refIdAttrSelector);
        if (Helper.isNull(citationElem) === true) {
            return null;
        }
        refids = citationElem.getAttribute(refIdAttr);
        refIdsArray = refids.split(' ');
        citationModel = new CitationModel();
        refIdsArray.forEach(function iterateRefId(refid) {
            if (citationModel.exists(refid) === false) {
                citationModel.add(refid, 'label');
            }
        });
        return citationModel;
    }

    function getNodeAttributes(node) {
        var temp = {}, attr, key;

        attr = node.dataset;
        if (Helper.isUndefined(attr) === true) {
            return temp;
        }
        for (key in attr) {
            if (attr.hasOwnProperty(key) === true) {
                temp[key] = attr[key];
            }
        }
        return temp;
    }

    function addHistory(instance, historyInst, historyNodeList, citeNode) {
        var citationObj, temp, historyNode, historyLength, i = 0;

        historyLength = historyNodeList.length;
        if (historyLength === 0) {
            citationObj = getCitation(citeNode);
            historyInst.add(citationObj, null);
            instance.citationCollection.add(historyInst);
        }
        else {
            for (; i < historyLength; i += 1) {
                historyNode = historyNodeList.item(i);
                citationObj = getCitation(historyNode);
                temp = getNodeAttributes(historyNode);
                historyInst.add(citationObj, temp);
            }
            instance.citationCollection.add(historyInst);
        }
    }

    CitationController.prototype.getUncitedReference = function getUncitedReferenceFn(
        submitCallback
    ) {
        var instance = this, refId, isCited, uncitedRefArray = [], lastElement,
            refMapper = instance.referenceMapperInst.referenceMapper,
            uncitedReferencesInfo, uncitedRefs = {},
            uncitedReferencesReplaceInfo, options = {},
            allowSubmit = Config.get('allowSubmitFromUncitedValidation'),
            uncitedLength, citeCollection = instance.citationCollection;

        for (refId in refMapper) {
            if (refMapper.hasOwnProperty(refId) === true &&
                Helper.isObject(refMapper[refId]) === true
            ) {
                if (refMapper[refId].isDeleted === false) {
                    isCited = citeCollection.isCitedReference(refId);
                    if (isCited === false) {
                        uncitedRefArray.push(refMapper[refId].label);
                    }
                }
            }
        }
        uncitedLength = uncitedRefArray.length;
        if (uncitedLength === 0) {
            submitCallback.call();
        }
        if (uncitedLength > 0) {
            if (uncitedLength > 1) {
                lastElement = uncitedRefArray.pop();
                lastElement = ' and ' + lastElement;
                uncitedRefArray.push(lastElement);
            }
            uncitedReferencesReplaceInfo = Config.getLocaleByKey('Please.provide.citations.for.the.following.uncited.references'
            );
            uncitedRefs.uncitedreference = uncitedRefArray.join(', ');
            uncitedReferencesInfo = Helper.replaceLocaleString(
                uncitedReferencesReplaceInfo, uncitedRefs
            );
            if (allowSubmit === true) {
                options = {
                    'okCallback': submitCallback,
                    'okButtonName': 'Submit'
                };
                EventBus.publish(
                    'confirm:show', uncitedReferencesInfo, options
                );
                return;
            }
            EventBus.publish('alert:show', uncitedReferencesInfo);
        }
    };

    CitationController.prototype.load = function loadFn() {
        var citations, historyNodeList, historyInst, instance = this,
            citeNode, i = 0, citationLength;

        if (this.isLoaded === true) {
            throw new Error('citation.loaded.already');
        }
        citations = this.editorParentContainer.querySelectorAll(citationSelector);
        citationLength = citations.length;
        for (; i < citationLength; i += 1) {
            citeNode = citations.item(i);
            historyNodeList = citeNode.querySelectorAll('[data-history]');
            historyInst = new CitationHistory(instance.win);
            historyInst.setReferenceNode(citeNode);
            addHistory(instance, historyInst, historyNodeList, citeNode);
        }
        this.citationView.renderStyles();
        this.isLoaded = true;
    };

    CitationController.prototype.removeCitation = function removeCitationFn(
        refid, type, actionBy
    ) {
        var citeHistoryList, instance = this;

        citeHistoryList = this.citationCollection.findAll(refid);
        citeHistoryList.forEach(function iterateHistory(citeHistory) {
            citeHistory.remove(
                refid, instance.currentActor, instance.stage, actionBy
            );
            citeHistory.setCorrectionAttrubute();
            instance.citationView.render(citeHistory, type, 'remove');
            DataChangeAttributeHandler.change(
                citeHistory.referenceNode, instance.editorParentContainer
            );
        });
    };

    CitationController.prototype.undoCitation = function undoCitationFn(
        refid, type, actionBy
    ) {
        var citeHistoryList, instance = this;

        citeHistoryList = this.citationCollection.findAll(refid);
        citeHistoryList.forEach(function iterateHistory(citeHistory) {
            citeHistory.undo(
                refid, instance.currentActor, instance.stage, actionBy
            );
            citeHistory.setCorrectionAttrubute();
            instance.citationView.render(citeHistory, type, 'undo');
            DataChangeAttributeHandler.change(
                citeHistory.referenceNode, instance.editorParentContainer
            );
        });
    };

    return CitationController;
});

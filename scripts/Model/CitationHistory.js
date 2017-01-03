define([
    'scripts/Helper', 'scripts/Model/CitationModel'
], function CitationHistoryLoader(
    Helper, CitationModel
) {
    var state = {'delete': 'del', 'change': 'changed', 'insert': 'ins'},
        history = {'initial': 'original', 'change': 'modified'};

    function initializeVariables(instance) {
        instance.data = [];
        instance.referenceNode = null;
        instance.name = null;
        instance.win = null;
        instance.correction = {};
    }

    function isCitationModified(data) {
        var isChanged = false, historyLength, index;

        historyLength = data.length;
        index = historyLength - 1;
        if (historyLength > 0 &&
            Helper.isNull(data[index].historyAttr) === false
        ) {
            isChanged = true;
        }
        return isChanged;
    }

    function getLastHistory(data) {
        var historyLength, lastIndex;

        historyLength = data.length;
        lastIndex = historyLength - 1;
        return data[lastIndex];
    }

    function cloneCitationFromHistory(lastHistory) {
        var citationModel, citation;

        citation = lastHistory.citationModel.clone();
        citationModel = new CitationModel();
        citationModel.setCitation(citation);
        return citationModel;
    }

    function addCitationToHistory(lastHistory, refid) {
        var citation;

        citation = lastHistory.citationModel;
        citation.add(refid, 'label');
    }

    function getHistoryAttribute(actor, stateName, curHistory, stage, actionBy) {
        var temp = {};

        temp.name = Helper.getUniqueId('opt');
        temp.state = stateName;
        temp.by = actionBy;
        temp.history = curHistory;
        temp.actor = actor;
        temp.stage = stage;
        temp.show = 'true';
        return temp;
    }

    function needsHistoryCreation(historyAttr, actor) {
        var createHistory = true;

        if (historyAttr.history === history.change &&
            historyAttr.actor === actor
        ) {
            createHistory = false;
        }
        return createHistory;
    }

    function editHistoryAndRemoveCitation(data, citationClone, refid) {
        var citationLength, historyAttr, lastHistory;

        lastHistory = getLastHistory(data);
        citationLength = citationClone.getLength();
        historyAttr = lastHistory.historyAttr;
        if (citationLength === 1) {
            historyAttr.state = state.delete;
            historyAttr.show = 'false';
        }
        if (citationLength > 1) {
            lastHistory.citationModel.delete(refid);
        }
    }

    function addToHistoryAndRemoveCitation(lastHistory, citationClone, refid,
        actor, stage, actionBy
    ) {
        var citationLength, historyAttr, newHistoryAttr, cloneHistoryAttr;

        citationLength = citationClone.getLength();
        historyAttr = lastHistory.historyAttr;
        newHistoryAttr = getHistoryAttribute(
            actor, state.change, history.change, stage, actionBy
        );
        if (citationLength === 1) {
            historyAttr.state = state.delete;
            if (historyAttr.history === history.change) {
                historyAttr.show = 'false';
            }
            cloneHistoryAttr = Object.assign({}, historyAttr);
            cloneHistoryAttr.name = Helper.getUniqueId('opt');
            cloneHistoryAttr.actor = actor;
            cloneHistoryAttr.show = 'false';
            cloneHistoryAttr.history = history.change;
            this.add(citationClone, cloneHistoryAttr);
        }
        if (citationLength > 1) {
            historyAttr.state = state.delete;
            if (historyAttr.history === history.change) {
                historyAttr.show = 'false';
            }
            citationClone.delete(refid);
            this.add(citationClone, newHistoryAttr);
        }
    }

    function modifyHistoryAndRemoveCitation(data, actor, stage, refid, actionBy) {
        var lastHistory, historyAttr, citationClone, initNewHistory;

        lastHistory = getLastHistory(data);
        citationClone = cloneCitationFromHistory(lastHistory);
        historyAttr = lastHistory.historyAttr;
        initNewHistory = needsHistoryCreation(historyAttr, actor);
        if (initNewHistory === true) {
            addToHistoryAndRemoveCitation.call(
                this, lastHistory, citationClone, refid, actor, stage, actionBy
            );
        }
        else {
            editHistoryAndRemoveCitation(data, citationClone, refid);
        }
    }

    function editHistoryAndUndoCitation(data, refid) {
        var lastHistory, citationLength, index = 0, lastIndex, historyLength,
            prevHistory, prevHistoryAttr, lastCiteLength,
            prevIndex;

        historyLength = data.length;
        citationLength = data[index].citationModel.getLength();
        lastIndex = historyLength - 1;
        lastHistory = data[lastIndex];
        lastCiteLength = lastHistory.citationModel.getLength();
        prevIndex = (lastIndex > 0) ? lastIndex - 1 : lastIndex;
        prevHistory = data[prevIndex];
        prevHistoryAttr = prevHistory.historyAttr;
        if (citationLength === 1) {
            if (historyLength > 1) {
                if (prevHistoryAttr.history === 'original') {
                    prevHistory.historyAttr = null;
                    data.pop();
                }
                else {
                    lastHistory.historyAttr.state = state.change;
                    lastHistory.historyAttr.show = 'true';
                }
            }
        }
        if (citationLength > 1) {
            if (lastHistory.historyAttr.state === state.change &&
                citationLength !== lastCiteLength + 1
            ) {
                addCitationToHistory(lastHistory, refid);
            }
            else if (lastHistory.historyAttr.state === state.change &&
                citationLength === lastCiteLength + 1
            ) {
                if (prevHistoryAttr.history === 'original') {
                    prevHistory.historyAttr = null;
                    data.pop();
                }
                else {
                    addCitationToHistory(lastHistory, refid);
                }
            }
            else if (lastHistory.historyAttr.state === state.delete &&
                lastCiteLength === 1
            ) {
                lastHistory.citationModel.destory();
                lastHistory.citationModel.add(refid, 'lebel');
                lastHistory.historyAttr.state = state.change;
                lastHistory.historyAttr.show = 'true';
            }
        }
    }

    function addToHistoryAndUndoCitation(data, refid, actor, stage, actionBy) {
        var lastHistory, historyAttr, newHistoryAttr, citationClone,
            citationLength, index = 0;

        citationLength = data[index].citationModel.getLength();
        lastHistory = getLastHistory(data);
        historyAttr = lastHistory.historyAttr;
        citationClone = cloneCitationFromHistory(lastHistory);
        newHistoryAttr = getHistoryAttribute(
            actor, state.change, history.change, stage, actionBy
        );
        if (citationLength === 1) {
            historyAttr.state = state.delete;
            if (historyAttr.history === history.change) {
                historyAttr.show = 'false';
            }
            this.add(citationClone, newHistoryAttr);
        }
        if (citationLength > 1) {
            historyAttr.state = state.delete;
            historyAttr.show = 'false';
            citationClone.add(refid, 'label');
            this.add(citationClone, newHistoryAttr);
        }
    }

    function modifyHistoryAndUndoCitation(data, actor, stage, refid, actionBy) {
        var historyAttr, lastHistory, initNewHistory;

        lastHistory = getLastHistory(data);
        historyAttr = lastHistory.historyAttr;
        initNewHistory = needsHistoryCreation(historyAttr, actor);
        if (initNewHistory === false) {
            editHistoryAndUndoCitation(data, refid);
        }
        else {
            addToHistoryAndUndoCitation.call(
                this, data, refid, actor, stage, actionBy
            );
        }
    }

    function CitationHistory(Win) {
        initializeVariables(this);
        this.win = Win;
        this.name = Helper.getUniqueId('cite');
    }

    CitationHistory.prototype.add = function addFn(citationObj, citationHistory) {
        var temp;

        if (Helper.isNull(this.referenceNode) === true) {
            throw new Error('citation.history.reference.node.missing');
        }
        temp = {};
        temp.citationModel = citationObj;
        temp.historyAttr = citationHistory;
        this.data.push(temp);
    };

    CitationHistory.prototype.setReferenceNode = function setReferenceNodeFn(node) {
        if (Helper.isNull(this.referenceNode) === false) {
            throw new Error('citation.history.reference.node.already.assigned');
        }
        if (node instanceof this.win.HTMLElement === false) {
            throw new Error('citation.history.reference.node.missing');
        }
        this.referenceNode = node;
    };

    CitationHistory.prototype.remove = function removeFn(refid, actor, stage, actionBy) {
        var isChanged, historyData = this.data, historyAttr,
            index = 0;

        if (historyData.length === 0) {
            return;
        }
        isChanged = isCitationModified(historyData);
        if (isChanged === false) {
            historyAttr = getHistoryAttribute(
                actor, state.delete, history.initial, stage, actionBy
            );
            historyData[index].historyAttr = historyAttr;
        }
        modifyHistoryAndRemoveCitation.call(
            this, historyData, actor, stage, refid, actionBy
        );
    };

    CitationHistory.prototype.undo = function undoFn(refid, actor, stage, actionBy) {
        var isChanged, historyData = this.data;

        isChanged = isCitationModified(historyData);
        if (isChanged === false) {
            return;
        }
        modifyHistoryAndUndoCitation.call(
            this, historyData, actor, stage, refid, actionBy
        );
    };

    CitationHistory.prototype.setCorrectionAttrubute = function setCorrectionAttrubute() {
        var historyData = this.data, historyLength, index = 0, historyObject,
            historyAttr;

        historyLength = historyData.length;
        this.correction = {};
        for (; index < historyLength; index += 1) {
            historyObject = historyData[index];
            historyAttr = historyObject.historyAttr;
            if (Helper.isNull(historyAttr) === true) {
                continue;
            }
            if (historyAttr.history === history.initial &&
                historyAttr.state === state.delete
            ) {
                this.correction[state.delete] = historyAttr.name;
            }
            if (historyAttr.history === history.change &&
                historyAttr.state === state.change
            ) {
                this.correction[state.insert] = historyAttr.name;
            }
        }
    };

    CitationHistory.prototype.destory = function destory() {
        initializeVariables(this);
    };

    return CitationHistory;
});

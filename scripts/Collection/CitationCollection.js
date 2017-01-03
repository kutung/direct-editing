define(['scripts/Helper'], function CitationCollectionLoader(Helper) {

    function initializeVariables(instance) {
        instance.collection = [];
    }

    function CitationCollection() {
        initializeVariables(this);
    }

    function findHistory(historyData, refid) {
        var i, len, citationModel;

        len = historyData.length - 1;
        for (i = len; i >= 0; i -= 1) {
            citationModel = historyData[i].citationModel;
            if (Helper.isObject(citationModel) === true &&
                citationModel.exists(refid) === true
            ) {
                return true;
            }
        }
        return false;
    }

    CitationCollection.prototype.add = function addFn(history) {
        this.collection.push(history);
    };

    CitationCollection.prototype.get = function get() {
        return this.collection;
    };

    CitationCollection.prototype.findAll = function findAll(refid) {
        var historyList = [],
            found = false;

        this.collection.forEach(function iterateCollection(history) {
            found = findHistory(history.data, refid);
            if (found === true) {
                historyList.push(history);
            }
        });
        return historyList;
    };

    CitationCollection.prototype.isCitedReference = function isCitedReference(
        refid
    ) {
        var found = false, collection = this.collection,
            collectionLen = collection.length, i = 0, history;

        for (; i < collectionLen; i += 1) {
            history = collection[i];
            found = findHistory(history.data, refid);
            if (found === true) {
                return found;
            }
        }

        return found;
    };

    return CitationCollection;
});

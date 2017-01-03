define(['scripts/Helper'], function CitationModelLoader(Helper) {
    function initializeVariables(instance) {
        instance.citation = {};
    }

    function CitationModel() {
        initializeVariables(this);
    }

    CitationModel.prototype.add = function addFn(refId, labelText) {
        var citation = {};

        citation.refid = refId;
        citation.label = labelText;
        this.citation[refId] = citation;
    };

    CitationModel.prototype.delete = function deleteFn(refId) {
        if (this.citation.hasOwnProperty(refId) === true &&
            Helper.isObject(this.citation[refId]) === true) {
            delete this.citation[refId];
        }
    };

    CitationModel.prototype.exists = function existsFn(refId) {
        return (this.citation.hasOwnProperty(refId) === true &&
            Helper.isObject(this.citation[refId]) === true);
    };

    CitationModel.prototype.clone = function cloneFn() {
        return Object.assign({}, this.citation);
    };

    CitationModel.prototype.setCitation = function setCitationFn(citation) {
        if (Helper.isObject(citation) === true) {
            this.citation = citation;
        }
    };

    CitationModel.prototype.getLength = function getLengthFn() {
        var keys;

        keys = Object.keys(this.citation);
        return keys.length;
    };

    CitationModel.prototype.getKeys = function getKeysFn() {
        var keys;

        keys = Object.keys(this.citation);
        return keys;
    };

    CitationModel.prototype.destory = function destory() {
        initializeVariables(this);
    };

    return CitationModel;
});

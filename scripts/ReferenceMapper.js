define([
    'scripts/Helper', 'scripts/Util', 'scripts/CustomerConfigReader'
],
function referenceMapperLoader(Helper, Util, Config) {
    function ReferenceMapper(Win, Doc) {
        this.win = Win;
        this.doc = Doc;
        this.referenceMapper = {};
    }

    function normalizeString(string) {
        string = string.replace(/[\[\]\(\)]+/g, '');
        return string;
    }

    function getReferenceLabel(referenceNode, labelSelector) {
        var label, labelNodeList, labelLength;

        labelNodeList = referenceNode.querySelectorAll(labelSelector);
        labelLength = labelNodeList.length;
        if (labelLength > 0) {
            label = labelNodeList[0].textContent;
            return normalizeString(label);
        }
        return null;
    }

    ReferenceMapper.prototype.add = function add(refId, label, delFlag) {
        var temp = {};

        temp.refid = refId;
        temp.label = label;
        temp.isDeleted = delFlag;
        this.referenceMapper[refId] = temp;
    };

    ReferenceMapper.prototype.referenceDeleted = function referenceDeletedFn(
        refId, delFlag
    ) {
        this.referenceMapper[refId].isDeleted = delFlag;
    };

    ReferenceMapper.prototype.get = function getFn(refId) {
        if (this.referenceMapper.hasOwnProperty(refId) === true &&
            Helper.isObject(this.referenceMapper[refId]) === true) {
            return this.referenceMapper[refId];
        }

        return null;
    };

    ReferenceMapper.prototype.getLabels = function getLabelsFn(refIds) {
        var refIdInfo, refLength,
            i = 0,
            labels = [];

        if (Array.isArray(refIds) === false) {
            throw new Error('reference.mapper.not.array');
        }

        refLength = refIds.length;
        for (; i < refLength; i += 1) {
            refIdInfo = this.get(refIds[i]);
            if (Helper.isNull(refIdInfo) === true) {
                continue;
            }
            labels.push(refIdInfo.label);
        }

        return labels;
    };

    ReferenceMapper.prototype.load = function loadFn() {
        var referenceNodeList, length, referenceNode, referenceId, referenceLabelSelector,
            label, referenceLabel, labelClass,
            reference = Util.getSelector('reference'),
            i = 0, delFlag, child;

        if (Helper.isNull(reference) === true) {
            return;
        }
        referenceLabel = Config.get('referenceLabel');
        referenceLabelSelector = Util.selectorToArray(referenceLabel);
        labelClass = referenceLabelSelector.join(',');
        referenceNodeList = this.doc.querySelectorAll(reference);
        length = referenceNodeList.length;
        for(; i < length; i += 1) {
            delFlag = false;
            referenceNode = referenceNodeList[i];
            child = referenceNode.firstChild;
            if (child.classList.contains('optdelreference') === true) {
                delFlag = true;
            }
            referenceId = referenceNode.getAttribute('id');
            label = getReferenceLabel(referenceNode, labelClass);
            this.add(referenceId, label, delFlag);
        }
    };

    return ReferenceMapper;
});

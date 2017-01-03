define([
    'scripts/Helper'
],
function CitationLabelGeneratorLoader(Helper) {
    var endash = String.fromCharCode(8211), separatorWithSpace = ', ',
        separatorWithoutSpace = ',';

    function initializeVariables() {
        this.eBus = null;
        this.referenceMapper = null;
    }

    function applyLabelWrapper(citation, prefix, suffix) {
        if (Helper.isUndefined(prefix) === true ||
            Helper.isEmptyString(prefix) === true ||
            Helper.isUndefined(suffix) === true ||
            Helper.isEmptyString(suffix) === true ||
            Helper.isEmptyString(citation) === true
        ) {
            return citation;
        }
        return prefix + citation + suffix;
    }

    function CitationLabelGenerator(EventBus, referenceMapper) {
        initializeVariables.call(this);
        if (Helper.isFunction(EventBus.publish) === false) {
            throw new Error('citation.generator.eventbus.missing');
        }
        if (Helper.isFunction(referenceMapper.getLabels) === false) {
            throw new Error('citation.generator.referencemapper.missing');
        }
        this.eBus = EventBus;
        this.referenceMapper = referenceMapper;
    }

    function citationGenarator(labelArray, isSpaceFound) {
        var label, citationConcat,
            i = 0,
            citation = '',
            first = labelArray.shift(),
            len = labelArray.length,
            last = first,
            separator = separatorWithoutSpace;

        if (isSpaceFound === true) {
            separator = separatorWithSpace;
        }

        citation += first;
        citationConcat = function citationConcatFn() {
            if (first !== last && (first + 1) !== last) {
                citation += endash + last;
            }
            else if ((first + 1) === last) {
                citation += separator + last;
            }
        };

        for (; i < len; i += 1) {
            label = labelArray[i];
            if (last + 1 !== label) {
                citationConcat();
                citation += separator + label;
                last = label;
                first = label;
            }
            else {
                last = label;
            }
        }

        if (last === label && last !== first) {
            citationConcat();
        }

        return citation;
    }

    function sortArrayAsNumber(array) {
        var cloneArray = array.slice();

        cloneArray = cloneArray.map(Number);
        return cloneArray.sort(function compare(current, next) {
            if (current < next) {
                return -1;
            }
            if (current > next) {
                return 1;
            }
            return 0;
        });
    }

    function executeAction(action, refIdArray, refId) {
        if (action === 'remove') {
            return Helper.removeValFromArray(refIdArray, refId);
        }
        else if (action === 'insert') {
            refIdArray.push(refId);
        }
        return refIdArray;
    }

    function getReferenceCitation(instance, type, actionArray, isSpaceFound) {
        var labelArray = instance.referenceMapper.getLabels(actionArray);

        if (actionArray.length !== labelArray.length) {
            throw new Error('citation.array.length.mismatch');
        }

        if (labelArray.length !== 0 && type === 'numbered') {
            labelArray = sortArrayAsNumber(labelArray);
            return citationGenarator(labelArray, isSpaceFound);
        }
        return labelArray.join(' ');
    }

    function removeEmptyValueInArray(array) {
        return Helper.removeValFromArray(array, '');
    }

    CitationLabelGenerator.prototype.generate = function generateFn(
        data, isSpaceFound
    ) {
        var refIdArray, actionArray, citation,
            returnData = {};

        if (Helper.isUndefined(data.refIds) === true ||
            Helper.isUndefined(data.action) === true ||
            Helper.isUndefined(data.id) === true ||
            Helper.isUndefined(data.type) === true
         ) {
            throw new Error('citation.data.missing');
        }
        refIdArray = data.refIds.split(' ');
        refIdArray = removeEmptyValueInArray(refIdArray);
        actionArray = executeAction(data.action, refIdArray, data.id);
        citation = getReferenceCitation(
            this, data.type, actionArray, isSpaceFound
        );
        citation = applyLabelWrapper(citation, data.prefix, data.suffix);
        returnData.refIds = actionArray.join(' ');
        returnData.citation = citation;

        return returnData;
    };

    return CitationLabelGenerator;
});

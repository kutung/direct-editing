define([
    'scripts/Helper', 'scripts/Util', 'scripts/CitationLabelGenerator',
    'scripts/EventBus'
],
function citationViewLoader(
    Helper, Util, CitationLabelGenerator, EventBus
) {
    var nodeName = 'span', citeClass = 'cite',
        refIdAttr = Util.getAttributeSelector('citationReferenceId'),
        labelWrappers = {
            'square': [91, 93],
            'round': [40, 41]
        },
        cssRules = {
            '.editor-container .cite span[data-show="false"]': {
                'display': 'none'
            },
            '.editor-container .cite span[data-state="del"] a': {
                'text-decoration': 'line-through',
                'color': 'red !important',
                'cursor': 'pointer',
                'background-color': '#FF9'
            },
            '.editor span[data-state="changed"] a': {
                'text-decoration': 'underline',
                'color': 'green !important',
                'cursor': 'pointer',
                'background-color': '#FFFF99'
            }
        },
        historyNodeTemplate = [
            '<span data-name="{{name}}" data-state="{{state}}" data-by="{{by}}" data-history="{{history}}" data-actor="{{actor}}" data-stage="{{stage}}" data-show="{{show}}">',
            '</span>'
        ],
        citeNodeTemplate = [
            '<a {{nameattr}}="{{name}}" title="{{title}}" class="{{class}}" {{refattr}}="{{refid}}">{{label}}</a>'
        ],
        citeNodeWithoutNameTemplate = [
            '<a {{refattr}}="{{refid}}" title="{{title}}" class="{{class}}">{{label}}</a>'
        ];

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.stylesheetId = 'citation-style';
        instance.styleSheet = null;
    }

    function CitationView(win, doc, ReferenceMapper) {
        initializeVariables(this);
        this.win = win;
        this.doc = doc;
        this.referenceMapper = ReferenceMapper;
        this.labelGenerator = new CitationLabelGenerator(
            EventBus, this.referenceMapper
        );
    }

    function validateData(historyObj, instance) {
        if (Array.isArray(historyObj.data) === false) {
            throw new Error('error.history.data.missing');
        }
        if ((historyObj.referenceNode instanceof instance.win.HTMLElement) === false) {
            throw new Error('error.referenceNode.should.be.html');
        }
    }

    function generateCiteWrapperNode(correctionObj, referenceNode, instance) {
        var citeWrapperNode = instance.doc.createElement(nodeName), prop;

        citeWrapperNode.classList.add(citeClass);
        for (prop in correctionObj) {
            if (correctionObj.hasOwnProperty(prop) === true) {
                citeWrapperNode.dataset[prop] = correctionObj[prop];
            }
        }
        return citeWrapperNode;
    }

    function generateHistoryNode(historyAttr, instance) {
        var tmpNode = instance.doc.createElement(nodeName), historyNode;

        tmpNode.innerHTML = Helper.replaceLocaleString(
            historyNodeTemplate.join(''), historyAttr
        );
        historyNode = tmpNode.firstChild;

        return historyNode;
    }

    function getLabelWrapper(citation) {
        var label, labelWrapper,
            wrapper = {},
            labelCode = citation.charCodeAt(0);

        for (label in labelWrappers) {
            if (Helper.objectHasKey(labelWrappers, label) === true &&
                labelWrappers[label].indexOf(labelCode) !== -1
            ) {
                labelWrapper = labelWrappers[label];
                wrapper.prefix = String.fromCharCode(labelWrapper[0]);
                wrapper.suffix = String.fromCharCode(labelWrapper[1]);
                return wrapper;
            }
        }
        return null;
    }

    function getCitationText(instance, refIds, refType, referenceNode) {
        var input = {'action': '', 'id': '', 'prefix': '', 'suffix': ''},
            result, labelWrapper, refIdAttrSelector, citationElem, textContent,
            isSpaceFound = false;

        refIdAttrSelector = '[' + refIdAttr + ']';
        citationElem = referenceNode.querySelector(refIdAttrSelector);
        if (Helper.isNull(citationElem) === true) {
            throw new Error('error.citation.element.not.found');
        }

        textContent = citationElem.textContent;
        if (textContent.indexOf(', ') !== -1) {
            isSpaceFound = true;
        }
        labelWrapper = getLabelWrapper(textContent);
        if (Helper.isNull(labelWrapper) === false) {
            input.prefix = labelWrapper.prefix;
            input.suffix = labelWrapper.suffix;
        }
        input.refIds = refIds;
        input.type = refType.toLowerCase();
        result = instance.labelGenerator.generate(input, isSpaceFound);
        return result;
    }

    function getReferenceNodeAttr(node) {
        var refIdAttrSelector, citationElem, name, citeAttrObj = {},
            classes;

        refIdAttrSelector = '[' + refIdAttr + ']';
        citationElem = node.querySelector(refIdAttrSelector);
        if (Helper.isNull(citationElem) === true) {
            throw new Error('citation.node.missing');
        }
        name = citationElem.getAttribute('name');
        if (Helper.isNull(name) === true) {
            throw new Error('citation.node.name.attribute.not.be.empty');
        }
        classes = citationElem.getAttribute('class');
        citeAttrObj.name = name;
        citeAttrObj.class = classes;

        return citeAttrObj;
    }

    function generateInnerCitationNode(
        citationObj, history, referenceNode, refType, action, instance
    ) {
        var refIdArray = [], citationLabel, refIds,
            citeNodeObj = {}, tmpNode = instance.doc.createElement(nodeName),
            citeNode, template = citeNodeWithoutNameTemplate, citeAttrObj = {};

        if (citationObj.getLength() === 0) {
            throw new Error('error.citation.model.not.be.empty');
        }

        citeAttrObj = getReferenceNodeAttr(referenceNode);
        if (history === 'original' ||
            (Helper.isNull(history) === true && action === 'undo')
        ) {
            template = citeNodeTemplate;
            if (Helper.isNull(citeAttrObj.name) === false) {
                citeNodeObj.nameattr = 'name';
                citeNodeObj.name = citeAttrObj.name;
            }
        }
        if (Helper.isNull(citeAttrObj.class) === false) {
            citeNodeObj.class = citeAttrObj.class;
        }
        refIdArray = citationObj.getKeys();
        refIds = refIdArray.join(' ');
        citationLabel = getCitationText(instance, refIds, refType, referenceNode);
        citeNodeObj.refattr = refIdAttr;
        citeNodeObj.refid = refIds;
        citeNodeObj.title = refIdArray[0];
        citeNodeObj.label = citationLabel.citation;

        tmpNode.innerHTML = Helper.replaceLocaleString(
            template.join(''), citeNodeObj
        );
        citeNode = tmpNode.firstChild;

        return citeNode;
    }

    function processData(historyObj, refType, action, instance) {
        var i = 0, data = historyObj.data, dataLen = data.length, wrapperNode,
            innerCitationNode, citeWrapperNode;

        citeWrapperNode = generateCiteWrapperNode(
            historyObj.correction, historyObj.referenceNode, instance
        );
        for (; i < dataLen; i += 1) {
            if (Helper.isNull(data[i].historyAttr) === false) {
                wrapperNode = generateHistoryNode(data[i].historyAttr, instance);
                innerCitationNode = generateInnerCitationNode(
                    data[i].citationModel, data[i].historyAttr.history,
                    historyObj.referenceNode, refType, action, instance
                );
                wrapperNode.appendChild(innerCitationNode);
                citeWrapperNode.appendChild(wrapperNode);
            }
            else {
                innerCitationNode = generateInnerCitationNode(
                    data[i].citationModel, null,
                    historyObj.referenceNode, refType, action, instance
                );
                citeWrapperNode.appendChild(innerCitationNode);
            }
        }

        return citeWrapperNode;
    }

    function applyChangesToCiteNode(requestNode, modifiedNode) {
        var parentNode;

        parentNode = requestNode.parentNode;
        parentNode.insertBefore(modifiedNode, requestNode.nextSibling);
        parentNode.removeChild(requestNode);
    }

    CitationView.prototype.renderStyles = function renderStyles() {
        var instance = this,
            styleSheet = instance.doc.head.querySelector('#' + instance.stylesheetId),
            styleEl;

        if (styleSheet === null) {
            styleEl = instance.doc.createElement('style');
            styleEl.id = instance.stylesheetId;
            instance.doc.head.appendChild(styleEl);
            instance.styleSheet = styleEl;
            Helper.addRulesToStyleSheet(this.doc, this.styleSheet, cssRules);
        }
    };

    CitationView.prototype.render = function render(historyObj, refType, action) {
        var instance = this, citeNode;

        validateData(historyObj, instance);
        citeNode = processData(historyObj, refType, action, instance);
        applyChangesToCiteNode(historyObj.referenceNode, citeNode);
        historyObj.referenceNode = null;
        historyObj.setReferenceNode(citeNode);
    };

    CitationView.prototype.destroy = function destroy() {
        initializeVariables(this);
    };

    return CitationView;
});

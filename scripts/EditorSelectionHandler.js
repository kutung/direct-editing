define([
    'scripts/RangeHelper', 'scripts/EditorRequestWrapper',
    'scripts/FragmentSniffer', 'scripts/Helper', 'scripts/SelectionStorage',
    'scripts/Util', 'scripts/ConfigReader'
], function editorSelectionHandlerLoader(
    RangeHelper, EditorRequestWrapper, FragmentSniffer, Helper, SelectionStorage,
    Util, Config
) {
    var actionArray = ['copyEditorDelete', 'copyEditorInsert', 'ellipsis',
        'interReferenceTitle', 'interReference'
    ],
        actionClasses = [
            'optbold', 'optitalic', 'optsup', 'optsub', 'optcomment', 'optdel',
            'optinsert', 'optreplace', 'pc_cpereplace', 'optreject',
            'optsmallcaps', 'optmono', 'optdelreference'
        ],
        unicodeClass = Util.selectorToClass('unicodeCharacter'),
        interReferenceClass = Util.selectorToClass('interReference'),
        interReferenceTitleClass = Util.selectorToClass('interReferenceTitle'),
        interReferencesClass = Util.selectorToClass('interReferences'),
        copyEditorDeleteClass = Util.selectorToClass('copyEditorDelete'),
        copyEditorInsertClass = Util.selectorToClass('copyEditorInsert'),
        inlineFormulaClass = Util.selectorToClass('inlineFormula'),
        keywordClass = Util.selectorToClass('keywords');

    function editorSelectionHandler(Win, EventBus, Doc, EditorContainer) {
        this.win = Win;
        this.eventBus = EventBus;
        this.editorContainer = EditorContainer;
        this.doc = Doc;
        this.rangeHelper = new RangeHelper();
        this.editorRequestWrapper = new EditorRequestWrapper(this.win);
        this.selectionStorage = new SelectionStorage(
            this.win, this.eventBus, this.doc
        );
        actionClasses = Util.selectorToClassArray(
            actionArray, actionClasses
        );
        this.eventBus.subscribe('selection:reset', this.resetWrapper, this);
    }

    function getFirstElementNode(nodes) {
        var i = 0;

        for (; i < nodes.length; i += 1) {
            if (nodes[i].nodeType === Node.ELEMENT_NODE) {
                return nodes[i];
            }
        }
        return null;
    }

    function nodeHasCertainParent(node, parentClassList) {
        var classList, isParent = false;

        while (node) {
            classList = node.classList;

            if (node.nodeType === Node.ELEMENT_NODE &&
                classList.length > 0 &&
                parentClassList.indexOf(classList[0]) >= 0
            ) {
                isParent = true;
                break;
            }

            node = node.parentNode;
        }

        return isParent;
    }

    function isContainsUniCodeNode(nodes) {
        var i = 0;

        for (; i < nodes.length; i += 1) {
            if (nodes[i].nodeType === Node.ELEMENT_NODE &&
                nodes[i].classList.contains(unicodeClass) === true
            ) {
                return true;
            }
        }

        return false;
    }

    function isAllowedForSelection(node) {
        var i = 0,
            len = actionClasses.length,
            nodeName = node.nodeName.toLowerCase(),
            classList = node.classList,
            parentClassList = [keywordClass];

        if (node.nodeType !== Node.ELEMENT_NODE ||
            (nodeName !== 'span' && nodeName !== 'a')) {
            return null;
        }

        if (classList.length > 0 &&
            (classList.contains(interReferenceClass) === true ||
            node.getAttributeNode('rel') === true ||
            classList.contains(interReferenceTitleClass) === true)) {
            return false;
        }

        for (; i < len; i += 1) {
            if (classList.contains(actionClasses[i]) === true) {
                return true;
            }
        }

        return false;
    }

    function getFirstSelectionElementNode(nodes) {
        var i = 0;

        for (; i < nodes.length; i += 1) {
            if (nodes[i].nodeType === Node.ELEMENT_NODE &&
                isAllowedForSelection(nodes[i])
            ) {
                return nodes[i];
            }
        }
        return null;
    }

    function getNodeTypeList(nodes) {
        var i = 0,
            nodeTypes = [];

        for (; i < nodes.length; i += 1) {
            nodeTypes.push(nodes[i].nodeType);
        }
        return nodeTypes;
    }

    function getFirstNode(nodeList) {
        // if only text node, do nothing
        var nodeTypeList = getNodeTypeList(nodeList);

        if (nodeTypeList.indexOf(Node.ELEMENT_NODE) !== -1 &&
            nodeTypeList.indexOf(Node.TEXT_NODE) !== -1
        ) {
            return getFirstSelectionElementNode(nodeList);
        }

        // 2. if no text node
        if (nodeTypeList.indexOf(Node.TEXT_NODE) === -1) {
            return getFirstElementNode(nodeList);
        }

        if (nodeTypeList.indexOf(Node.TEXT_NODE) !== -1) {
            return nodeList[0];
        }
        return nodeList;
    }

    function validate(instance, fragment) {
        var errorKey = 'error.multiple.para.selection',
            fragmentSniffer = new FragmentSniffer(instance.win),
            context = fragmentSniffer.getTagContext(fragment);

        if (context.indexOf('onParagraph') >= 0 ||
            context.indexOf('onTablecell') >= 0
        ) {
            if (context.indexOf('onTablecell') >= 0) {
                errorKey = 'error.table.cell.selection';
            }
            instance.eventBus.publish(
                'alert:show',
                Config.getLocaleByKey(errorKey),
                {
                    'isPreventEnable': true, 'errorKey': errorKey
                }
            );
            return false;
        }
        return true;
    }

    function assertClassesToIgnore(targetElem) {
        var classesToIgnore, classList, i = 0,
            len;

        classesToIgnore = [
            'annotator-canvas', 'contextual-menu', 'menu-item',
            'icon-instruct', 'icon-bold', 'icon-delete', 'icon-insert',
            'icon-italic', 'icon-undo', 'icon-subscript', 'icon-superscript',
            'web-btn', 'print-btn', 'annotorious-popup-text', 'editor',
            'blocker', 'icon-edit', 'expand-icon', 'icon-smallcaps',
            'icon-monospace', 'replace-icon', 'visitorInstruct', 'showPointInstruct'
        ];
        len = classesToIgnore.length;
        classList = targetElem.classList;

        for (; i < len; i += 1) {
            if (classList.contains(classesToIgnore[i])) {
                return true;
            }
        }

        return false;
    }

    function assertTagsToIgnore(targetElem) {
        var tagToIgnore, nodeName, len,
            i = 0;

        tagToIgnore = ['button', 'canvas', 'img'];
        len = tagToIgnore.length;
        nodeName = targetElem.nodeName.toLowerCase();
        for (; i < len; i += 1) {
            if (tagToIgnore[i] === nodeName) {
                return true;
            }
        }

        return false;
    }

    function assertMixedNodes(targetElem) {
        var nodeName, classList;

        nodeName = targetElem.nodeName.toLowerCase();
        classList = targetElem.classList;
        if (nodeName === 'div' && classList.contains('editor')) {
            return true;
        }
        if (nodeName === 'div' && classList.contains('annotator-container')) {
            return true;
        }
        if (
            nodeName === 'td' &&
            targetElem.firstChild !== null &&
            Helper.isUndefined(targetElem.firstChild.classList) === false &&
            targetElem.firstChild.classList.contains('wrapper')
        ) {
            return true;
        }
        return false;
    }

    function assertAuthorGroupClassesToIgnore(targetElem) {
        var elemClassList = targetElem.classList,
            prevSibilings = targetElem.previousSibling;

        if (elemClassList.contains('ce_inter-refs') === true ||
            elemClassList.contains('ga') === true ||
            elemClassList.contains('author_orcres_ids') === true ||
            targetElem.parentNode.classList.contains('ce_inter-refs') === true
        ) {
            return true;
        }

        if (elemClassList.contains('x') === true &&
            (elemClassList.contains('resid') === true ||
             elemClassList.contains('orcid') === true
            )
        ) {
            return true;
        }

        if (elemClassList.contains('x') === true &&
            Helper.isNull(prevSibilings) === false &&
            prevSibilings.classList.contains('ce_inter-refs') === true
        ) {
            return true;
        }

        return false;
    }

    function resetWrappers(instance) {
        var editorRequestWrapper = instance.editorRequestWrapper;

        instance.eventBus.publish('InsertPanel:OnSetEnabled', false);
        instance.eventBus.publish('InstructPanel:OnSetEnabled', false);
        editorRequestWrapper.clearOldWrapper(instance.editorContainer);
        instance.eventBus.publish('contextMenu:hide');
    }

    function doMagnetSelection(selectionNode, range, instance) {
        var currentRange, fragment, wrapper, newFragment,
            editorRequestWrapper = instance.editorRequestWrapper,
            doc = instance.doc;

        editorRequestWrapper.clearOldWrapper(instance.editorContainer);
        range.selectNode(selectionNode);
        currentRange = range.getRange();
        fragment = range.extractFragment(currentRange);
        wrapper = editorRequestWrapper.getSelectionWrapper(fragment);
        range.insertNode(wrapper, currentRange);
        range.selectNode(wrapper);
        newFragment = doc.createDocumentFragment();
        newFragment.appendChild(wrapper.cloneNode(true));
        return newFragment;
    }

    function doCursorInsert(instance, insertWrapper) {
        var newFragment, newQueryFragment, doc = instance.doc,
            range = instance.rangeHelper,
            eventBus = instance.eventBus;

        newFragment = doc.createDocumentFragment();
        newQueryFragment = doc.createDocumentFragment();
        newFragment.appendChild(insertWrapper.cloneNode(true));
        newQueryFragment.appendChild(insertWrapper.cloneNode(true));
        eventBus.publish('contextMenu:hide');
        if (range.hasSelection() === false) {
            eventBus.publish('QueryPanel:OnSetFragment', newQueryFragment, []);
        }
        return newFragment;
    }

    function getParentNodeToSelect(firstParentNode) {
        var secondParentNode, firstClassList = firstParentNode.classList,
            secondClassList, thirdParentNode, thirdClassList;

        if (firstClassList.contains('optdel') === true ||
            firstClassList.contains('optinsert') === true ||
            firstClassList.contains(copyEditorDeleteClass) === true ||
            firstClassList.contains(copyEditorInsertClass) === true ||
            firstClassList.contains(interReferenceTitleClass) === true ||
            firstClassList.contains(interReferenceClass) === true
        ) {
            secondParentNode = firstParentNode.parentNode;
            secondClassList = secondParentNode.classList;

            if (secondClassList.contains('pc_cpereplace') === true) {
                thirdParentNode = secondParentNode.parentNode;
                thirdClassList = thirdParentNode.classList;

                if (thirdClassList.contains('optdel') === true) {
                    return thirdParentNode.parentNode;
                }

                return secondParentNode;
            }

            if (secondClassList.contains('optreplace') === true ||
                secondClassList.contains('optreject') === true ||
                secondClassList.contains('optcomment') === true
            ) {
                return secondParentNode;
            }
        }

        return firstParentNode;
    }

    function cursorReposition(selectNode, currentNode) {
        var hasClass, i,
            len = actionClasses.length,
            classList = selectNode.classList,
            clonedNode = currentNode.cloneNode(true);

        for (i = 0; i < len; i += 1) {
            hasClass = classList.contains(actionClasses[i]);
            if (hasClass === true) {
                currentNode.parentNode.removeChild(currentNode);
                selectNode.insertAdjacentHTML('afterEnd', clonedNode.outerHTML);
                break;
            }
        }
    }

    function getParentForChild(childNode, instance, doc, tagToLookUp) {
        var treeWalker,
            parentNode = childNode.parentNode,
            found = false,
            foundChildNode = false,
            cursorPlacedAfterTextNodes = true;

        if (Helper.isUndefined(parentNode) === true) {
            return null;
        }
        while (parentNode !== instance.editorContainer) {
            if (tagToLookUp.indexOf(parentNode.tagName.toLowerCase()) !== -1 &&
                isAllowedForSelection(parentNode) === true
            ) {
                found = true;
                break;
            }
            parentNode = parentNode.parentNode;
        }
        if (found === false) {
            return null;
        }
        parentNode = getParentNodeToSelect(parentNode);
        // if cursor is the last child (i.e) if the user is trying to place
        // the cursor at the end, do not select the node. Just place there
        // cursor there
        treeWalker = doc.createTreeWalker(
            parentNode, NodeFilter.SHOW_ALL, null, false
        );
        while (treeWalker.nextNode() !== null) {
            if (foundChildNode === true &&
                treeWalker.currentNode.nodeType === Node.TEXT_NODE
            ) {
                cursorPlacedAfterTextNodes = false;
            }
            if (treeWalker.currentNode === childNode) {
                foundChildNode = true;
            }
        }

        if (cursorPlacedAfterTextNodes === true &&
            parentNode.contains(childNode) === true
        ) {
            cursorReposition(parentNode, childNode);
            return null;
        }

        return parentNode;
    }

    function filterNodeToSelect(nodeList, instance) {
        var parentNode,
            updatedNodeList = getFirstNode(nodeList);

        if (updatedNodeList === null) {
            updatedNodeList = nodeList[0];
        }
        parentNode = getParentForChild(
            updatedNodeList, instance, instance.doc, ['span', 'a']
        );
        if (parentNode !== null && isAllowedForSelection(parentNode) === true) {
            return parentNode;
        }
        else if (isAllowedForSelection(updatedNodeList)) {
            return updatedNodeList;
        }

        if ((
                updatedNodeList.nodeType === Node.TEXT_NODE &&
                updatedNodeList.parentNode.classList.contains(unicodeClass)
            ) ||
            (
                updatedNodeList.nodeType === Node.ELEMENT_NODE &&
                updatedNodeList.classList.contains(unicodeClass)
            )
        ) {
            return updatedNodeList;
        }

        return null;
    }

    function storeDocSelectionRange(instance) {
        instance.selectionStorage.storeDocSelection();
    }

    function removeDocSelectionRange(instance) {
        instance.selectionStorage.clearStoredSelections();
    }

    function getSelectionAlertMessage(instance, key, elementName) {
        var tmpNode, errorMessage;

        errorMessage = Config.getLocaleByKey(key);
        tmpNode = instance.doc.createElement(elementName);
        tmpNode.innerHTML = errorMessage;
        return tmpNode;
    }

    function showPartialSelectionAlert(nodeList, instance, selectionNodeContent,
        nodeToSelectContent
    ) {
        var firstAlertNode, secondAlertNode, tmpNode;

        if (Helper.isNull(nodeList) === true) {
            return;
        }
        firstAlertNode = getSelectionAlertMessage(instance,
            'error.selection.alert.not.allowed', 'div'
        );
        secondAlertNode = getSelectionAlertMessage(instance,
            'error.selection.alert.undo.edits', 'div'
        );
        tmpNode = instance.doc.createElement('div');
        tmpNode.appendChild(firstAlertNode);
        tmpNode.appendChild(secondAlertNode);
        if (selectionNodeContent !== nodeToSelectContent &&
            isContainsUniCodeNode(nodeList) === false) {
            storeDocSelectionRange(instance);
            instance.eventBus.publish(
                'alert:show', tmpNode,
                {
                    'isPreventEnable': true, 'name': 'selection-alert',
                    'errorKey': tmpNode
                }
            );
        }
    }

    function selectFirstNodeIfPartialSelection(range, instance) {
        var selectionNodes, nodeToSelect, selectionNodeContent,
            nodeToSelectContent, rangy;

        selectionNodes = range.getSelectedNodeList();
        rangy = range.getRange();
        selectionNodeContent = rangy.toString();
        nodeToSelect = filterNodeToSelect(selectionNodes, instance);
        if (nodeToSelect !== null) {
            range.selectNode(nodeToSelect);
            rangy = range.getRange();
            nodeToSelectContent = rangy.toString();
            showPartialSelectionAlert(selectionNodes, instance,
                selectionNodeContent, nodeToSelectContent
            );
        }
    }

    editorSelectionHandler.prototype.getPosition = function getPosition() {
        var node,
            position = null,
            range = this.rangeHelper.getRange();

        if (range !== null && range.getNodes() && range.getNodes().length > 0) {
            node = range.getNodes()[0];
            position = node.getBoundingClientRect();
        }
        return position;
    };

    editorSelectionHandler.prototype.onMouseUp = function onMouseUp(targetNode) {
        var currentRange, fragment, wrapper, newFragment,
            range = this.rangeHelper,
            doc = this.doc,
            clonedFragment = range.getClonedFragment(),
            editorRequestWrapper = new EditorRequestWrapper(this.win),
            browserDetails = this.win.browserDetails;

        if (assertClassesToIgnore(targetNode) === true) {
            return;
        }

        if (assertTagsToIgnore(targetNode) === true) {
            return;
        }

        if (targetNode.hasAttribute('rel') === true) {
            this.eventBus.publish('contextMenu:hide');
            return;
        }

        resetWrappers(this);
        if (validate(this, clonedFragment) === false) {
            return;
        }

        if (assertAuthorGroupClassesToIgnore(targetNode) === true) {
            this.eventBus.publish('contextMenu:hide');
            return;
        }

        selectFirstNodeIfPartialSelection(range, this);
        currentRange = range.getRange();
        fragment = range.extractFragment(currentRange);
        wrapper = editorRequestWrapper.getSelectionWrapper(fragment);
        range.insertNode(wrapper, currentRange);
        range.selectNode(wrapper);
        newFragment = doc.createDocumentFragment();
        newFragment.appendChild(wrapper.cloneNode(true));
        this.eventBus.publish('RightPane:Hide');
        if (browserDetails.msie === true) {
            storeDocSelectionRange(this);
        }

        return newFragment;
    };

    function assertEquationNextNode(insertWrapper) {
        var className, nextSibling = insertWrapper.nextSibling;

        if (nextSibling === null || nextSibling.nodeType !== 1) {
            return false;
        }
        className = nextSibling.className.toLowerCase();
        if (
            nextSibling.nodeName.toLowerCase() === 'table' &&
            className === 'formula'
        ) {
            return true;
        }
        if (
            insertWrapper.parentNode.nodeName.toLowerCase() === 'div' &&
            className === 'eqn-container'
        ) {
            return true;
        }
        return false;
    }

    function getTopMostFormattingParent(node) {
        var parentList = [],
            tagArray = ['copyEditorDelete', 'copyEditorInsert',
                'unicodeCharacter', 'interReferenceTitle', 'interReference'
            ],
            tagsToIgnore = ['b', 'i', 'sup', 'sub'],
            parent = node.parentNode,
            ignoreClasses = [keywordClass, interReferencesClass],
            classList;

        actionClasses = Util.selectorToClassArray(tagArray, actionClasses);
        while (parent) {
            if (tagsToIgnore.indexOf(parent.tagName.toLowerCase()) !== -1) {
                parent = parent.parentNode;
            }
            classList = Array.prototype.slice.call(parent.classList);

            if (Helper.isUndefined(classList) === false &&
                (classList.indexOf(interReferenceClass) >= 0 ||
                    parent.hasAttribute('rel') === true ||
                    classList.indexOf(interReferenceTitleClass) >= 0)
            ) {
                return null;
            }

            if (actionClasses.indexOf(classList[0]) === -1) {
                break;
            }

            parentList.unshift(parent);
            parent = parent.parentNode;
        }

        if (parentList.length > 0) {
            return parentList[0];
        }

        return parentList;
    }

    function assertInEquationContainer(instance, insertWrapper) {
        var parentNode = insertWrapper.parentNode;

        while (parentNode !== instance.editorContainer) {
            if (parentNode.classList !== null &&
                (parentNode.classList.contains(inlineFormulaClass) === true ||
                    parentNode.classList.contains('wrapper') === true
                )
            ) {
                return true;
            }
            parentNode = parentNode.parentNode;
        }
        return false;
    }

    editorSelectionHandler.prototype.resetWrapper = function resetWrapper() {
        resetWrappers(this);
    };

    function checkNearestCommentNode(insertWrapper, instance) {
        var wrapperPreviousNode = insertWrapper.previousSibling,
            wrapperNextNode = insertWrapper.nextSibling,
            checkCommentNodeExsist = function checkCommentNodeExsist(sibilingNode, className) {
                if (Helper.isNull(sibilingNode) === false &&
                    sibilingNode.nodeType === instance.doc.ELEMENT_NODE &&
                    sibilingNode.tagName.toLowerCase() === 'span' &&
                    sibilingNode.classList.contains(className) === true
                ) {
                    return true;
                }
                return false;
            };

        if (checkCommentNodeExsist(wrapperPreviousNode, 'optcomment') === true) {
            insertWrapper = insertWrapper.previousSibling;
        }

        if (checkCommentNodeExsist(wrapperPreviousNode, 'comntText') === true) {
            insertWrapper = insertWrapper.previousSibling.parentNode;
        }

        if (checkCommentNodeExsist(wrapperNextNode, 'optcomment') === true) {
            insertWrapper = insertWrapper.nextSibling;
        }

        return insertWrapper;
    }

    function checkGenBankExists(insertWrapper) {
        var genBankElement = null;

        if (Helper.isNull(insertWrapper.parentNode) === false &&
            (insertWrapper.parentNode.classList.contains(
                interReferenceTitleClass) ||
                (insertWrapper.parentNode.hasAttribute('rel') === true))) {
            genBankElement = insertWrapper.parentNode;
        }
        return genBankElement;
    }

    editorSelectionHandler.prototype.getReferenceWrapper = function getReferenceWrapper() {
        var insertWrapper, editorRequestWrapper = this.editorRequestWrapper,
            instance = this, parentNode, tagToLookUp = ['div'], found = false,
            requestTag;

        insertWrapper = editorRequestWrapper.getInsertWrapper(instance.editorContainer);
        if (Helper.isUndefined(insertWrapper) === true) {
            return null;
        }
        if (insertWrapper.hasChildNodes() === true) {
            return insertWrapper;
        }

        if (insertWrapper.hasAttribute('class') === true) {
            insertWrapper.removeAttribute('class');
        }
        parentNode = insertWrapper.parentNode;
        if (Helper.isUndefined(parentNode) === true) {
            return null;
        }
        while (parentNode !== instance.editorContainer) {
            if (tagToLookUp.indexOf(parentNode.tagName.toLowerCase()) !== -1) {
                found = true;
                break;
            }
            parentNode = parentNode.parentNode;
        }

        if (found === false) {
            return null;
        }

        requestTag = parentNode.querySelector('[data-request-id]');
        if (Helper.isUndefined(requestTag) !== true) {
            requestTag.parentNode.removeChild(requestTag);
        }

        while (parentNode.firstChild !== null) {
            insertWrapper.appendChild(parentNode.firstChild);
        }

        insertWrapper.normalize();
        parentNode.appendChild(insertWrapper);
        return insertWrapper;
    };

    editorSelectionHandler.prototype.onMouseClick = function onMouseClick(targetNode) {
        var currentRange, insertWrapper, errorKey,
            range = this.rangeHelper,
            updatedFragment, nearestSpanNode,
            editorRequestWrapper = this.editorRequestWrapper,
            parent, clonedNode, immediateParent, checkUpdatedWrapper, genBankExistCheck,
            browserDetails = this.win.browserDetails;

        if (assertClassesToIgnore(targetNode) === true) {
            return;
        }
        if (assertTagsToIgnore(targetNode) === true) {
            return;
        }
        resetWrappers(this);
        if (assertMixedNodes(targetNode) === true) {
            return;
        }
        if (targetNode.classList.contains('x') === true) {
            errorKey = 'error.auto.generated.text.selection';
            this.eventBus.publish(
                'alert:show',
                Config.getLocaleByKey(errorKey),
                {
                    'isPreventEnable': true, 'errorKey': errorKey
                }
            );
            return;
        }

        currentRange = range.getRange();

        if (currentRange === null) {
            this.eventBus.publish('contextMenu:hide');
            return;
        }

        removeDocSelectionRange(this);
        insertWrapper = editorRequestWrapper.getCursorWrapper();
        range.insertNode(insertWrapper, currentRange);

        if (assertEquationNextNode(insertWrapper) === true ||
            assertInEquationContainer(this, insertWrapper) === true) {
            insertWrapper.parentNode.removeChild(insertWrapper);
            return;
        }

        parent = getTopMostFormattingParent(insertWrapper);
        clonedNode = insertWrapper.cloneNode(true);

        if (insertWrapper.previousSibling === null &&
            parent instanceof this.win.HTMLElement === true) {
            immediateParent = insertWrapper.parentNode;
            immediateParent.removeChild(insertWrapper);
            parent.insertAdjacentHTML('beforeBegin', clonedNode.outerHTML);
            insertWrapper = parent.previousElementSibling;
        }

        if (insertWrapper.nextSibling === null &&
            parent instanceof this.win.HTMLElement === true) {
            immediateParent = insertWrapper.parentNode;
            immediateParent.removeChild(insertWrapper);
            parent.insertAdjacentHTML('afterEnd', clonedNode.outerHTML);
            insertWrapper = parent.nextElementSibling;
        }

        nearestSpanNode = getParentForChild(
            insertWrapper, this, this.doc, ['span', 'a']
        );

        if (Helper.isNull(nearestSpanNode) === true) {
            checkUpdatedWrapper = checkNearestCommentNode(insertWrapper, this);
            if (Helper.isNull(checkUpdatedWrapper) === false) {
                nearestSpanNode = checkUpdatedWrapper;
            }
        }
        if (
            nearestSpanNode instanceof this.win.HTMLElement === true &&
            isAllowedForSelection(nearestSpanNode) === true
        ) {
            updatedFragment = doMagnetSelection(nearestSpanNode, range, this);

            if (Helper.isUndefined(browserDetails.msie) === false &&
                browserDetails.msie === true
            ) {
                storeDocSelectionRange(this);
            }

            return updatedFragment;
        }
        genBankExistCheck = checkGenBankExists(insertWrapper, this);
        if (Helper.isNull(genBankExistCheck) === false) {
            insertWrapper = genBankExistCheck;
        }
        updatedFragment = doCursorInsert(this, insertWrapper);
        this.eventBus.publish('RightPane:Hide');
        return updatedFragment;
    };

    return editorSelectionHandler;
});

define([
    'scripts/Helper', 'scripts/ToolTip', 'scripts/EditorSelectionHandler',
    'scripts/Sanitizer', 'scripts/Normalizer', 'scripts/Dom2Xml',
    'scripts/TableCharAlign', 'scripts/Util', 'scripts/UriHelper',
    'scripts/UnwantedWrapper'
],
function EditorLoader(
    Helper, ToolTip, EditorSelectionHandler, Sanitizer, Normalizer,
    Dom2Xml, TableCharAlign, Util, UriHelper, UnwantedWrapper
) {
    var interReferenceTitleSelector = Util.getSelector('interReferenceTitle'),
        interReferenceSelector = Util.getSelector('interReference'),
        collaborationClass = Util.selectorToClass('collaboration'),
        authorGroupSelector = Util.getSelector('authorGroup'),
        equationSelector = Util.getSelector('equation'),
        referenceSelector = Util.getSelector('reference'),
        scrollMatchNodeSelectors = [
            '[data-name="{{value}}"]',
            '[name="{{value}}"]',
            '[data-id="{{value}}"]',
            '[id="{{value}}"]',
            '[data-heading-level="{{value}}"]'
        ];

    function initializeVariables(instance) {
        instance.eventBus = null;
        instance.rangeHelper = null;
        instance.left = null;
        instance.top = null;
        instance.height = null;
        instance.width = null;
        instance.editorContainer = null;
        instance.fragmentSniffer = null;
        instance.DOMFragment = null;
        instance.context = null;
        instance.isRendered = false;
        instance.htmlDoc = null;
        instance.win = null;
        instance.requestQueue = null;
        instance.requestBuilder = null;
        instance.saveEndPoint = null;
        instance.articleToken = null;
        instance.clientHeight = null;
        instance.clientWidth = null;
        instance.offsetTop = null;
        instance.offsetLeft = null;
        instance.scrollTop = null;
        instance.singleClickFn = null;
        instance.clickFn = null;
        instance.doubleClickFn = null;
        instance.toolTip = null;
        instance.editorSelectionHandler = null;
        instance.isEnabled = false;
        instance.timer = null;
        instance.clicks = 0;
        instance.clickDelay = 300;
        instance.cancelSelectionFn = null;
        instance.overlay = null;
        instance.editorWrapper = null;
        instance.tableCharAligner = null;
        instance.saveInProgress = false;
        instance.changedDivMap = {};
        instance.mathMLIntialVersion = 1;
        instance.isEventBind = false;
        instance.editorBloker = null;
    }

    function restoreSelection() {
        var selectionStorage;

        selectionStorage = this.editorSelectionHandler.selectionStorage;
        selectionStorage.restoreDocSelection();
    }

    function attachEvents(instance) {
        var eB = instance.eventBus;

        eB.subscribe('Smallcaps:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Monospace:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Bold:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Italic:onComplete', instance.applyFormatting, instance);
        eB.subscribe(
            'Subscript:onComplete', instance.applyFormatting, instance
        );
        eB.subscribe(
            'Superscript:onComplete', instance.applyFormatting, instance
        );
        eB.subscribe('Insert:Complete', instance.applyFormatting, instance);
        eB.subscribe('Instruct:Complete', instance.applyFormatting, instance);
        eB.subscribe('Reject:Complete', instance.applyFormatting, instance);
        eB.subscribe('Delete:onComplete', instance.applyFormatting, instance);
        eB.subscribe(
            'ReferenceDelete:onComplete', instance.applyFormatting, instance
        );
        eB.subscribe(
            'Math:Equation:OnComplete', instance.mathEquationComplete, instance
        );
        eB.subscribe(
            'Math:Equation:Proof:OnComplete', instance.mathEquationProofComplete, instance
        );
        eB.subscribe(
            'Math:Equation:Latex:OnComplete', instance.mathEquationLatexComplete, instance
        );
        eB.subscribe(
            'Math:Equation:Latex:OnFailure', instance.mathEquationLatexFailure, instance
        );
        eB.subscribe(
            'Math:Annotate:OnComplete', instance.mathAnnotateComplete, instance
        );
        eB.subscribe('dialog:selection-alert:close', restoreSelection, instance);
        eB.subscribe('dialog:selection-alert:ok', restoreSelection, instance);
        instance.isEnabled = true;
    }

    function detachEvents(instance) {
        var eB = instance.eventBus;

        eB.unsubscribe('Smallcaps:onComplete', instance.applyFormatting);
        eB.unsubscribe('Monospace:onComplete', instance.applyFormatting);
        eB.unsubscribe('Bold:onComplete', instance.applyFormatting);
        eB.unsubscribe('Italic:onComplete', instance.applyFormatting);
        eB.unsubscribe('Subscript:onComplete', instance.applyFormatting);
        eB.unsubscribe('Superscript:onComplete', instance.applyFormatting);
        eB.unsubscribe('Insert:Complete', instance.applyFormatting);
        eB.unsubscribe('Instruct:Complete', instance.applyFormatting);
        eB.unsubscribe('Reject:Complete', instance.applyFormatting);
        eB.unsubscribe('Delete:onComplete', instance.applyFormatting);
        eB.unsubscribe(
            'ReferenceDelete:onComplete', instance.applyFormatting
        );
        eB.unsubscribe(
            'Math:Equation:OnComplete', instance.mathEquationComplete, instance
        );
        eB.unsubscribe(
            'Math:Equation:Proof:OnComplete', instance.mathEquationProofComplete, instance
        );
        eB.unsubscribe(
            'Math:Equation:Latex:OnComplete', instance.mathEquationLatexComplete, instance
        );
        eB.unsubscribe(
            'Math:Equation:Latex:OnFailure', instance.mathEquationLatexFailure, instance
        );
        eB.unsubscribe(
            'Math:Annotate:OnComplete', instance.mathAnnotateComplete, instance
        );
        eB.unsubscribe('dialog:selection-alert:close', restoreSelection, instance);
        eB.unsubscribe('dialog:selection-alert:ok', restoreSelection, instance);
        instance.isEnabled = false;
    }

    function findPos(node, editor) {
        var curTop = 0, curLeft = 0;

        if (node.offsetParent !== null) {
            do {
                curTop += node.offsetTop;
                curLeft += node.offsetLeft;
                node = node.offsetParent;
            } while (node !== editor);
        }

        return {'top': curTop, 'left': curLeft};
    }

    function scrollEffect(matchedNode) {
        var smoothScroll, difference, perTick,
            position = findPos(matchedNode, this.editorContainer),
            parent = null,
            editorContainer = this.editorContainer,
            dataSetName = matchedNode.dataset.name,
            tableSelector = '.table [data-name="' + dataSetName + '"]';

        smoothScroll = function smoothScrollFn(to, duration) {
            if (duration <= 0) {
                return;
            }
            difference = to - editorContainer.scrollTop;
            perTick = difference / duration * 10;

            setTimeout(function() {
                editorContainer.scrollTop += perTick;
                if (editorContainer.scrollTop === to) {
                    return;
                }
                smoothScroll(to, duration - 10);
            }, 10);
        };
        smoothScroll(position.top - 100, 300);
        if (matchedNode.matches(tableSelector) === true) {
            parent = matchedNode.parentNode;
            while (parent.classList.contains('table') === false) {
                parent = parent.parentNode;
            }
            parent.scrollLeft = position.left;
        }
    }

    function editor(
        EditorContainer, EventBus, RangeHelper,
        FragmentSniffer, win, doc, RequestQueue, RequestBuilder, saveEndPoint,
        articleToken, CurrentActor
    ) {
        if (EditorContainer instanceof win.HTMLElement === false) {
            throw new Error('error.editor_container_missing');
        }
        if (Helper.isFunction(EventBus.publish) === false) {
            throw new Error('error.event_bus_missing');
        }
        if (Helper.isFunction(RangeHelper.getSelectionFragment) === false) {
            throw new Error('error.range_helper_missing');
        }
        if (Helper.isFunction(FragmentSniffer.getContext) === false) {
            throw new Error('error.fragment_sniffer_missing');
        }
        initializeVariables(this);
        this.editorContainer = EditorContainer;
        this.eventBus = EventBus;
        this.rangeHelper = RangeHelper;
        this.fragmentSniffer = FragmentSniffer;
        this.win = win;
        this.htmlDoc = doc;
        this.currentActor = CurrentActor;
        this.requestQueue = RequestQueue;
        this.requestBuilder = RequestBuilder;
        this.saveEndPoint = saveEndPoint;
        this.articleToken = articleToken;
        this.normalizer = new Normalizer();
        this.tableCharAligner = new TableCharAlign(win, doc);
        this.editorSelectionHandler = new EditorSelectionHandler(
            this.win, this.eventBus, this.htmlDoc, this.editorContainer
        );
        attachEvents(this);
        this.eventBus.subscribe('Editor:removeEvent', this.removeEvent, this);
        this.eventBus.subscribe('Editor:ScrollTo', this.scrollTo, this);
        this.eventBus.subscribe('Editor:scrollEffect', scrollEffect, this);
        this.eventBus.subscribe('QuickLink:onSectionNodeClick', this.quickLinkTabNavigation, this);
        this.eventBus.subscribe('QuickLink:onSectionNodeEnterClick', this.quickLinkTabNavigation, this);
        this.eventBus.subscribe(
            'QuickLinkFigureAndTable:onNodeClick', this.quickLinkFigureAndTableNavigation, this
        );
        this.eventBus.subscribe('QuickLinkEquation:onNodeClick', this.quickLinkEquationNavigation, this);
    }

    function triggerMenuAction(fragment, args, instance) {
        var position,
            topPos = args.pageY,
            leftPos = args.pageX,
            clientHeight = instance.editorContainer.clientHeight,
            clientWidth = instance.editorContainer.clientWidth,
            offsetTop = instance.editorContainer.offsetTop,
            offsetLeft = instance.editorContainer.offsetLeft,
            scrollTop = instance.editorContainer.scrollTop;

        instance.setFragment(fragment);
        position = instance.editorSelectionHandler.getPosition();
        if (position !== null) {
            topPos = position.top;
            if (position.top < 100) {
                topPos = position.top + position.height;
            }
            leftPos = position.left + (position.width / 2);
        }
        instance.setPosition(leftPos, topPos);
        instance.setMetrics(
            clientHeight, clientWidth, offsetTop, offsetLeft, scrollTop
        );
        instance.showContextualMenu();
    }

    function isExternalLink(elem) {
        var tagName = elem.tagName.toLowerCase();

        if (elem.matches(interReferenceTitleSelector) === true) {
            return true;
        }
        else if (
            elem.matches(interReferenceTitleSelector + ' ' + tagName) === true
        ) {
            return true;
        }
        else if (elem.matches(interReferenceSelector) === true) {
            return true;
        }

        return false;
    }

    function getCursorAndSelectonContext(instance, target) {
        var isContains = false;

        if (referenceSelector !== null) {
            isContains = Util.checkNodeContains(instance.htmlDoc,
                referenceSelector, target
            );
            if (isContains === true) {
                return 'deleteReference';
            }
        }
        return null;
    }

    function cancelSelection(e) {
        if (this.win.getSelection) {
            this.win.getSelection().removeAllRanges();
        }
        else if (this.htmlDoc.selection) {
            this.htmlDoc.selection.empty();
        }
    }

    function onDoubleClick(e) {
        var ref, position, refNode, refClass, tagName;

        this.eventBus.publish('selection:reset');
        refNode = e.target;
        tagName = refNode.tagName.toLowerCase();

        if (tagName === 'span' && tagName !== 'a') {
            while (refNode.tagName.toLowerCase() !== 'a' &&
                refNode.tagName.toLowerCase() !== 'div') {
                refNode = refNode.parentNode;
            }
        }
        if (refNode.tagName.toLowerCase() !== 'a') {
            return;
        }
        ref = refNode.getAttribute('title');
        if (ref === null) {
            return;
        }
        if (/^[\w-]+$/.test(ref) === false) {
            return;
        }
        ref = this.editorContainer.querySelector('#' + ref);
        if (ref === null) {
            return;
        }
        position = findPos(ref, this.editorContainer);
        this.editorContainer.scrollTop = position.top;
        refClass = ref.classList;
        refClass.add('scrollEffect');
        setTimeout(function setTimeout() {
            refClass.remove('scrollEffect');
        }, 1500);
    }

    function onSingleClick(e) {
        var newFragment, parentNode, parentNodeClass, authorNode,
            authorNodeClass, refTitle, relLink, link,
            range = this.rangeHelper,
            targetElement = e.target,
            hasSelection = range.hasSelection(), context;

         if (isExternalLink(targetElement) === true && e.ctrlKey === true) {
            refTitle = targetElement.getAttribute('title');
            relLink = targetElement.getAttribute('rel');

            if (Helper.isNull(refTitle) === false &&
                Helper.isEmptyString(refTitle) === false &&
                Helper.isNull(relLink) === true) {
                link = refTitle;
            }
            else if (Helper.isNull(relLink) === false &&
                Helper.isEmptyString(relLink) === false) {
                link = relLink;
            }
            else {
                link = targetElement.innerHTML;
            }
            if (UriHelper.isUrl(link) === true) {
                this.win.open(link, '_blank');
            }
            else if (UriHelper.isUrl(targetElement.innerHTML) === true) {
                this.win.open(targetElement.innerHTML, '_blank');
            }
            return;
        }

        if (targetElement.getAttribute('id') === 'toggle_button') {
            parentNode = targetElement.parentNode;
            parentNodeClass = parentNode.classList;
            if (parentNodeClass.contains(collaborationClass)) {
                authorNode = parentNode.querySelector(authorGroupSelector);
                authorNodeClass = authorNode.classList;
                if (authorNodeClass.contains('open')) {
                    authorNodeClass.remove('open');
                }
                else {
                    authorNodeClass.add('open');
                }
            }
            return;
        }

        if (hasSelection === true) {
            newFragment = this.editorSelectionHandler.onMouseUp(e.target);
            if (newFragment instanceof this.win.DocumentFragment === true) {
                this.context = this.fragmentSniffer.getContext(newFragment);
                if (this.context.length === 0) {
                    this.context.push('onSelect');
                }
                triggerMenuAction(newFragment, e, this);
            }
        }
        else {
            newFragment = this.editorSelectionHandler.onMouseClick(e.target);
            if (newFragment instanceof this.win.DocumentFragment === true) {
                this.context = this.fragmentSniffer.getContext(newFragment);
                context = getCursorAndSelectonContext(this, e.target);
                if (this.context.length === 0) {
                    if (context !== null) {
                        this.context.push(context);
                    }
                    else {
                        this.context.push('onClick');
                    }
                }
                triggerMenuAction(newFragment, e, this);
            }
        }
    }

    function onClick(e) {
        var instance = this;

        if (e.which !== 1) {
            return;
        }
        this.clicks += 1;
        if (this.clicks === 1) {
            this.timer = setTimeout(function timer1() {
                instance.singleClickFn(e);
                instance.clicks = 0;
            }, this.clickDelay);
        }
        else if (this.clicks === 2) {
            clearTimeout(this.timer); //prevent single-click action
            this.timer = setTimeout(function timer2() {
                instance.doubleClickFn(e);
                instance.clicks = 0;
            }, this.clickDelay);
        }
        else {
            clearTimeout(this.timer); //prevent double-click action
            this.cancelSelectionFn(e);
            this.clicks = 0;
        }
    }

    function getParentForChild(childNode, instance) {
        var parentNode = childNode.parentNode,
            found = false;

        while (parentNode !== instance.editorContainer) {
            if (parentNode.nodeName.toLowerCase() === 'div' &&
                parentNode.hasAttribute('name') === true
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

    editor.prototype.getReferenceNode = function getReferenceNode() {
        var wrapper;

        wrapper = this.editorSelectionHandler.getReferenceWrapper();
        return wrapper;
    };

    editor.prototype.setEventBind = function setEventBindFn(isEvent) {
        this.isEventBind = isEvent;
    };

    editor.prototype.setBlocker = function setBlockerFn() {
        var childNodes, childNodeLength,
            height = 0,
            i = 0;

        if (Helper.isNull(this.editorBloker) === false) {
            return;
        }
        this.editorBloker = this.htmlDoc.createElement('div');
        if (this.editorContainer.hasChildNodes() === true) {
            childNodes = this.editorContainer.childNodes;
            childNodeLength = childNodes.length;
            for (; i < childNodeLength; i += 1) {
                if (childNodes[i].nodeType === 1) {
                    height += childNodes[i].offsetHeight;
                }
            }
            this.editorBloker.style.height = height + 'px';
            this.editorBloker.classList.add('blocker');
            this.editorContainer.appendChild(this.editorBloker);
        }
    };

    editor.prototype.removeBlocker = function removeBlockerFn() {
        if (Helper.isNull(this.editorBloker) === false) {
            this.editorBloker.parentNode.removeChild(this.editorBloker);
            this.editorBloker = null;
        }
    };

    editor.prototype.render = function render(articleHtml) {
        var editorInst = this.editorContainer,
            style, tables, tLen,
            i = 0,
            wrapper = this.htmlDoc.createElement('div');

        // FIXME: Must be properly undone in destroy
        this.editorContainer.parentNode.insertBefore(
            wrapper, this.editorContainer
        );
        wrapper.appendChild(this.editorContainer);
        wrapper.style.position = 'relative';
        this.editorWrapper = wrapper;

        if (Helper.isEmptyString(articleHtml) === true) {
            throw new Error('error.article_html_missing');
        }
        this.overlay = this.htmlDoc.createElement('div');
        style = this.overlay.style;
        wrapper.appendChild(this.overlay);

        editorInst.innerHTML = articleHtml;
        this.eventBus.publish(
            'Editor:Loaded', this.editorContainer
        );
        this.isRendered = true;
        this.singleClickFn = onSingleClick.bind(this);
        this.doubleClickFn = onDoubleClick.bind(this);
        this.cancelSelectionFn = cancelSelection.bind(this);
        this.clickFn = onClick.bind(this);

        if (this.isEventBind === true) {
            editorInst.addEventListener('mouseup', this.clickFn, false);
            editorInst.addEventListener('dblclick', this.cancelSelectionFn, false);
        }
        style.position = 'absolute';
        style.display = 'none';
        tables = editorInst.querySelectorAll('.table table');
        tLen = tables.length;
        for (; i < tLen; i += 1) {
            this.tableCharAligner.alignAndReplaceTable(tables[i]);
        }
        this.eventBus.subscribe('Editor:SetBlock', this.setBlocker, this);
        this.eventBus.subscribe('Editor:RemoveBlock', this.removeBlocker, this);
    };

    editor.prototype.setPosition = function setPosition(leftPos, topPos) {
        this.left = leftPos;
        this.top = topPos;
    };

    editor.prototype.setMetrics = function setMetrics(
        clientHeight, clientWidth, offsetTop, offsetLeft, scrollTop
    ) {
        this.clientHeight = clientHeight;
        this.clientWidth = clientWidth;
        this.offsetTop = offsetTop;
        this.offsetLeft = offsetLeft;
        this.scrollTop = scrollTop;
    };

    editor.prototype.setFragment = function setFragment(fragment) {
        this.DOMFragment = fragment;
    };

    editor.prototype.setEnabled = function setEnabled(enable) {
        var rect, style = this.overlay.style;

        if (enable === false) {
            rect = this.editorContainer.getBoundingClientRect();
            style.display = 'block';
            style.top = '0px';
            style.left = '0px';
            style.height = rect.height + 'px';
            style.width = rect.width + 'px';
            style.backgroundColor = '#aaa';
            style.opacity = 0.5;
        }
        else {
            style.display = 'none';
        }
    };

    editor.prototype.showContextualMenu = function showContextualMenu() {
        var args = {},
            rect = this.editorContainer.getBoundingClientRect();

        args.position = {'left': this.left, 'top': this.top};
        args.metrics = {
            'width': this.editorContainer.clientWidth,
            'height': this.editorContainer.clientHeight,
            'top': rect.top,
            'left': rect.left,
            'scrollTop': this.scrollTop
        };
        args.fragment = this.DOMFragment;
        args.context = this.context;
        this.eventBus.publish(
            'contextMenu:show', args.position, args.metrics, args.fragment,
            args.context
        );
    };

    editor.prototype.getHtml = function getHtml() {
        var html = Dom2Xml.toXml(this.editorContainer.firstElementChild);
        html = Sanitizer.sanitize(
            html, true, false, this.win, ['br']
        );

        return html;
    };

    function getSanitizedHtml(parentNode, instance) {
        var tempNode, html, fragment = {};

        tempNode = instance.htmlDoc.createElement('div');
        tempNode.appendChild(parentNode.cloneNode(true));
        html = Dom2Xml.toXml(tempNode.firstChild);
        fragment.id = parentNode.getAttribute('name');
        fragment.html = Sanitizer.sanitize(
            html, true, false, instance.win, ['br']
        );
        return fragment;
    }

    editor.prototype.clearChangedFlag = function clearChangedFlag() {
        var name, changeSet;

        for (name in this.changedDivMap) {
            if (this.changedDivMap.hasOwnProperty(name) === true) {
                changeSet = this.changedDivMap[name];
                if (changeSet.changes === changeSet.node.dataset.changes) {
                    changeSet.node.removeAttribute('data-changes');
                    changeSet.node = null;
                }
            }
        }

        this.changedDivMap = {};
    };

    editor.prototype.hasUnsavedChanges = function hasUnsavedChanges() {
        var nodes = this.editorContainer.querySelectorAll('[data-changes]'),
            len = nodes.length;

        return len > 0;
    };

    editor.prototype.removeChangedFlag = function removeChangedFlagFn() {
        var i = 0,
            nodes = this.editorContainer.querySelectorAll('[data-changes]'),
            len = nodes.length;

        for (; i < len; i += 1) {
            nodes[i].removeAttribute('data-changes');
        }
    };

    editor.prototype.getSaveData = function getSaveData() {
        var nodes, node, cloneNode, len, i = 0,
            saveData = [];

        if (this.saveInProgress === true) {
            return;
        }
        nodes = this.editorContainer.querySelectorAll('[data-changes]');
        len = nodes.length;

        if (len === 0) {
            return;
        }

        this.eventBus.publish('Editor:SaveInProgress');
        this.changedDivMap = {};
        for (; i < len; i += 1) {
            node = nodes[i];
            cloneNode = nodes[i].cloneNode(true);
            this.changedDivMap[node.getAttribute('name')] = {
                'changes': node.dataset.changes,
                'node': node
            };
            saveData.push(
                getSanitizedHtml(UnwantedWrapper.remove(cloneNode), this)
            );
        }
        this.saveInProgress = true;
        return saveData;
    };

    editor.prototype.save = function save(parentNode) {
        var dataset = parentNode.dataset,
            changes = 0;

        if (typeof dataset.changes === 'undefined') {
            changes = 0;
        }
        else {
            changes = parseInt(dataset.changes, 10);
        }
        changes += 1;
        dataset.changes = changes;
        this.eventBus.publish('Editor:HasUnsavedChanges');
    };

    editor.prototype.scrollTo = function scrollTo(tagName, dataName, from) {
        var matchedNode, matchedNodeClass, removeClassNode,
            matchedNodeCompStyle,
            matchNodeSelectors,
            matchNodeSelectorLists,
            i = 0;

        if (Helper.isString(tagName) === false ||
            Helper.isString(dataName) === false
        ) {
            throw new Error('error.scroll_to_params_missing');
        }
        if (Helper.isEmptyString(tagName) === true ||
            Helper.isEmptyString(dataName) === true
        ) {
            throw new Error('error.scroll_to_params_missing');
        }

        matchNodeSelectors = scrollMatchNodeSelectors.join(',');
        matchNodeSelectorLists = Helper.replaceLocaleString(
            matchNodeSelectors, {'value': dataName}
        );
        matchedNode = this.editorContainer.querySelector(matchNodeSelectorLists);

        if (matchedNode instanceof this.win.HTMLElement === false) {
            return;
        }
        removeClassNode = this.editorContainer.querySelectorAll(
            '.base', '.scrollEffect'
        );
        for (; i < removeClassNode.length; i += 1) {
            removeClassNode[i].classList.remove('base');
            removeClassNode[i].classList.remove('scrollEffect');
        }

        matchedNodeClass = matchedNode.classList;
        if (from === 'edit-summary' || from === 'insert' ||
            from === 'instruct'
        ) {
            matchedNodeClass.add('scrollEffect');
            setTimeout(function remove() {
                matchedNodeClass.remove('scrollEffect');
            }, 2500);
        }
        else if (from === 'query') {
            matchedNodeCompStyle = this.win.getComputedStyle(matchedNode);
            matchedNode.style.marginTop = matchedNodeCompStyle.fontSize;
            matchedNodeClass.add('base');

            setTimeout(function remove() {
                matchedNodeClass.remove('base');
                matchedNode.removeAttribute('style');
            }, 2500);
        }

        if (this.isEnabled === false) {
            this.eventBus.publish('MainTabPanel:change', 'article');
        }

        this.eventBus.publish('Editor:scrollEffect', matchedNode);
    };

    editor.prototype.mathAnnotateComplete = function mathAnnotateComplete(
        mathReferenceName, annotateData
    ) {
        var parentDiv, matchedNode,
            eC = this.editorContainer;

        matchedNode = eC.querySelector(
            equationSelector + '[name="' + mathReferenceName + '"]'
        );
        if (annotateData.length > 0) {
            matchedNode.querySelector('img').classList.add('eqnChanged');
        }
        else {
            matchedNode.querySelector('img').classList.remove('eqnChanged');
        }
        matchedNode.setAttribute('editable', 'false');
        matchedNode.setAttribute('title', 'Click to edit');
        parentDiv = getParentForChild(matchedNode, this);
        this.save(parentDiv);
        this.eventBus.publish('Dialog:Force:OnClose', matchedNode, this);
        this.eventBus.publish('EditSummary:Load');
        this.eventBus.publish('Editor:autoSave');
    };

    editor.prototype.mathEquationProofComplete = function mathEquationProofComplete(
        mathReferenceName, version, proofImageNode
    ) {
        var editorEquationNode, versionNode,
            eC = this.editorContainer;

        editorEquationNode = eC.querySelector(
            equationSelector + '[name="' + mathReferenceName + '"]'
        );
        versionNode = editorEquationNode.querySelector('[version="' + version + '"]');
        if (versionNode === null) {
            return;
        }
        versionNode.appendChild(proofImageNode);
    };

    editor.prototype.mathEquationComplete = function mathEquationComplete(
        mathReferenceName, mathFragment, imagePath
    ) {
        var parentDiv, matchedNode, editorEquationNode, imageNode,
            eC = this.editorContainer,
            imageObj = new Image(),
            instance = this;

        matchedNode = eC.querySelector(
            equationSelector + '[name="' + mathReferenceName + '"]'
        );
        editorEquationNode = mathFragment.querySelector(equationSelector);
        matchedNode.innerHTML = editorEquationNode.innerHTML;
        imageObj.src = imagePath;
        imageNode = matchedNode.querySelector('img');

        imageObj.onload = function onload() {
            imageNode.setAttribute('src', imagePath);
            imageNode.classList.remove('preloader');
            instance.eventBus.publish('EditSummary:Load');
            instance.save(parentDiv);
            return;
        };
        imageNode.setAttribute('src', 'images/loading.gif');
        imageNode.classList.add('preloader');
        parentDiv = getParentForChild(matchedNode, this);
        this.eventBus.publish('Dialog:Force:OnClose', matchedNode, this);
    };

    function mathEquationLatexEnableOrDisable(
        mathReferenceName, version, latexFlag, Instance
    ) {
        var editorEquationNode, versionNode, mainVersionNode,
            eC = Instance.editorContainer, mathMlLatexSetValue = 'on',
            mathMLIntialVersion = Instance.mathMLIntialVersion;

        editorEquationNode = eC.querySelector(
            'div.eqn-container[name="' + mathReferenceName + '"]'
        );
        versionNode = editorEquationNode.querySelector('[version="' + version + '"]');
        if (Helper.isNull(versionNode) === true) {
            return;
        }
        if (latexFlag === false) {
            mathMlLatexSetValue = 'off';
        }
        versionNode.dataset.latex = mathMlLatexSetValue;
        if (version === mathMLIntialVersion) {
            mainVersionNode = editorEquationNode.querySelector('[version="0"]');
            if (Helper.isNull(mainVersionNode) === false) {
                mainVersionNode.dataset.latex = mathMlLatexSetValue;
            }
        }
    }

    editor.prototype.mathEquationLatexComplete = function mathEquationLatexComplete(
        mathReferenceName, version
    ) {
        mathEquationLatexEnableOrDisable(mathReferenceName, version, true, this);
    };

    editor.prototype.mathEquationLatexFailure = function mathEquationLatexFailure(
        mathReferenceName, version
    ) {
        mathEquationLatexEnableOrDisable(mathReferenceName, version, false, this);
    };

    editor.prototype.applyFormatting = function applyFormatting(
        Fragment, action
    ) {
        var requestTag, requestId, requestEditorTag, requestInnerHTML,
            parentNode, firstParent, spanName, tagName, correctionNode;

        if (Fragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment.missing');
        }
        requestTag = Fragment.querySelector('[data-request-id]');
        if (requestTag instanceof this.win.HTMLElement === false) {
            throw new Error('error.request.id.missing');
        }
        requestId = requestTag.dataset.requestId;
        requestEditorTag = this.editorContainer.querySelector(
            'span[data-request-id="' + requestId + '"]'
            );
        if (requestEditorTag instanceof this.win.HTMLElement === false) {
            throw new Error('error.editor.request.id.missing');
        }
        parentNode = getParentForChild(requestEditorTag, this);
        requestInnerHTML = requestTag.innerHTML;
        correctionNode = requestTag.firstChild;
        firstParent = requestEditorTag.parentNode;
        this.eventBus.publish('ActionLog:action', 'apply-editor', null,
            requestEditorTag, requestTag, parentNode
        );
        this.rangeHelper.removeAllSelections();
        requestEditorTag.insertAdjacentHTML('afterEnd', requestInnerHTML);
        requestEditorTag.parentNode.removeChild(requestEditorTag);
        this.normalizer.normalize(firstParent);
        requestTag = null;
        this.save(parentNode);
        if (Helper.isUndefined(action) === false) {
            this.eventBus.publish(action + ':applyFormatting', parentNode);
        }
        if (correctionNode instanceof this.win.HTMLElement === true &&
            (action === 'Insert' || action === 'Instruct')
        ) {
            spanName = correctionNode.getAttribute('data-name');
            tagName = correctionNode.tagName;
            this.scrollTo(tagName, spanName, action.toLowerCase());
        }
        this.eventBus.publish('contextMenu:hide');
        this.eventBus.publish('EditSummary:Load');
        this.eventBus.publish('QuickLink:Reload');
    };

    editor.prototype.attachEvents = function attachevents(subscribe) {
        if (subscribe === true) {
            attachEvents(this);
        }
        else {
            detachEvents(this);
        }
    };

    editor.prototype.destroy = function destroy() {
        this.removeEvent();
        this.editorContainer.innerHTML = '';
        this.eventBus.unsubscribe('Editor:removeEvent', this.removeEvent);
        this.eventBus.unsubscribe('Editor:ScrollTo', this.scrollTo, this);
        this.eventBus.unsubscribe('Editor:scrollEffect', scrollEffect, this);
        initializeVariables(this);
    };
    editor.prototype.removeEvent = function removeEvent() {
        this.editorContainer.removeEventListener('click', this.clickFn, false);
        this.editorContainer.removeEventListener(
            'dblclick', this.cancelSelectionFn, false
        );
    };

    editor.prototype.quickLinkTabNavigation = function quickLinkTabNavigation(data) {
        this.scrollTo('div', data.sectionId, 'quicklinkSection');
    };

    editor.prototype.quickLinkFigureAndTableNavigation = function quickLinkFigureAndTableNavigation(data) {
        this.scrollTo('div', data.sectionId, 'quicklinkFigureAndTableSection');
    };
    editor.prototype.quickLinkEquationNavigation = function quickLinkEquationNavigation(data) {
        this.scrollTo('div', data.sectionId, 'quicklinkEquationSection');
    };
    return editor;
});

define([
    'scripts/Helper', 'scripts/ToolTip', 'scripts/EditorSelectionHandler',
    'scripts/Sanitizer', 'scripts/Normalizer', 'scripts/Dom2Xml',
    'scripts/TableCharAlign', 'scripts/Util', 'scripts/UriHelper',
    'scripts/ConfigReader', 'customer/Config', 'scripts/ElementSyncFormatter',
    'scripts/FeatureToggle', 'scripts/UnwantedWrapper'
],
function supplementaryLoader(
    Helper, ToolTip, EditorSelectionHandler, Sanitizer, Normalizer,
    Dom2Xml, TableCharAlign, Util, UriHelper, Config, CustomerConfig,
    ElementSyncFormatter, Features, UnwantedWrapper
) {
    var interReferenceTitleSelector = Util.getSelector('interReferenceTitle'),
        interReferenceSelector = Util.getSelector('interReference'),
        collaborationClass = Util.selectorToClass('collaboration'),
        authorGroupSelector = Util.getSelector('authorGroup'),
        equationSelector = Util.getSelector('equation'),
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
        instance.supplementaryContainer = null;
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
        instance.supplementarySelectionHandler = null;
        instance.isEnabled = false;
        instance.timer = null;
        instance.clicks = 0;
        instance.clickDelay = 300;
        instance.cancelSelectionFn = null;
        instance.overlay = null;
        instance.supplementaryWrapper = null;
        instance.tableCharAligner = null;
        instance.saveInProgress = false;
        instance.changedDivMap = {};
        instance.mathMLIntialVersion = 1;
        instance.isEventBind = false;
        instance.supplementaryBloker = null;
    }

    function restoreSelection() {
        var selectionStorage;

        selectionStorage = this.supplementarySelectionHandler.selectionStorage;
        selectionStorage.restoreDocSelection();
    }

    function attachEvents(instance) {
        var eB = instance.eventBus;

        eB.subscribe('Smallcaps:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Monospace:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Bold:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Italic:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Subscript:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Superscript:onComplete', instance.applyFormatting, instance);
        eB.subscribe('Insert:Complete', instance.applyFormatting, instance);
        eB.subscribe('Instruct:Complete', instance.applyFormatting, instance);
        eB.subscribe('Reject:Complete', instance.applyFormatting, instance);
        eB.subscribe('Delete:onComplete', instance.applyFormatting, instance);
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

    function findPos(node, supplementary) {
        var curTop = 0, curLeft = 0;

        if (node.offsetParent !== null) {
            do {
                curTop += node.offsetTop;
                curLeft += node.offsetLeft;
                node = node.offsetParent;
            } while (node !== supplementary);
        }

        return {'top': curTop, 'left': curLeft};
    }

    function scrollEffect(matchedNode) {
        var smoothScroll, difference, perTick,
            position = findPos(matchedNode, this.supplementaryContainer),
            parent = null,
            supplementaryContainer = this.supplementaryContainer,
            dataSetName = matchedNode.dataset.name,
            tableSelector = '.table [data-name="' + dataSetName + '"]';

        smoothScroll = function smoothScrollFn(to, duration) {
            if (duration <= 0) {
                return;
            }
            difference = to - supplementaryContainer.scrollTop;
            perTick = difference / duration * 10;

            setTimeout(function() {
                supplementaryContainer.scrollTop += perTick;
                if (supplementaryContainer.scrollTop === to) {
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

    function supplementary(
        SupplementaryContainer, EventBus, RangeHelper,
        FragmentSniffer, win, doc, RequestQueue, RequestBuilder, saveEndPoint,
        articleToken, CurrentActor
    ) {
        if (SupplementaryContainer instanceof win.HTMLElement === false) {
            throw new Error('error.supplementary_container_missing');
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
        this.supplementaryContainer = SupplementaryContainer;
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
        this.supplementarySelectionHandler = new EditorSelectionHandler(
            this.win, this.eventBus, this.htmlDoc, this.supplementaryContainer
        );
        attachEvents(this);
        this.eventBus.subscribe('Supplementary:removeEvent', this.removeEvent, this);
        this.eventBus.subscribe('Supplementary:ScrollTo', this.scrollTo, this);
        this.eventBus.subscribe('Supplementary:scrollEffect', scrollEffect, this);
        this.eventBus.subscribe('QuickLink:onSectionNodeClick', this.quickLinkTabNavigation, this);
        this.eventBus.subscribe('QuickLink:onSectionNodeEnterClick', this.quickLinkTabNavigation, this);
        this.eventBus.subscribe(
            'QuickLinkFigureAndTable:onNodeClick', this.quickLinkFigureAndTableNavigation, this
        );
    }

    function triggerMenuAction(fragment, args, instance) {
        var position,
            topPos = args.pageY,
            leftPos = args.pageX,
            clientHeight = instance.supplementaryContainer.clientHeight,
            clientWidth = instance.supplementaryContainer.clientWidth,
            offsetTop = instance.supplementaryContainer.offsetTop,
            offsetLeft = instance.supplementaryContainer.offsetLeft,
            scrollTop = instance.supplementaryContainer.scrollTop;

        instance.setFragment(fragment);
        position = instance.supplementarySelectionHandler.getPosition();
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
            while (tagName !== 'a' && tagName !== 'div') {
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
        ref = this.supplementaryContainer.querySelector('#' + ref);
        if (ref === null) {
            return;
        }
        position = findPos(ref, this.supplementaryContainer);
        this.supplementaryContainer.scrollTop = position.top;
        refClass = ref.classList;
        refClass.add('scrollEffect');
        setTimeout(function settimeout() {
            refClass.remove('scrollEffect');
        }, 1500);
    }

    function getParentForSyncElement(parentNode, instance) {
        var found;

        while (parentNode !== instance.supplementaryContainer) {
            if (parentNode.nodeName.toLowerCase() === 'div' &&
                parentNode.hasAttribute('data-elementsync-name') === true
            ) {
                found = true;
                break;
            }
            parentNode = parentNode.parentNode;
        }
        if (found === false) {
            throw new Error('error.no_proper_parent_node');
        }

        return parentNode;
    }

    function getParentForChild(childNode, instance) {
        var syncEl,
            parentNode = childNode.parentNode,
            found = false;

        syncEl = instance.supplementaryContainer.querySelector(
            '.supplementary .authgrp'
        );
        if (Features.isFeatureEnabled('Editor.ElementSync') === true &&
            syncEl.contains(parentNode)
        ) {
            return getParentForSyncElement(parentNode, instance);
        }
        while (parentNode !== instance.supplementaryContainer) {
            if (parentNode.nodeName.toLowerCase() === 'div' &&
                parentNode.hasAttribute('name') === true
            ) {
                found = true;
                break;
            }
            parentNode = parentNode.parentNode;
        }
        if (found === false) {
            throw new Error('error.no_proper_parent_node');
        }
        return parentNode;
    }

    function onSingleClick(e) {
        var newFragment, refTitle, relLink, link,
            targetElement = e.target,
            range = this.rangeHelper,
            hasSelection = range.hasSelection(),
            classList = targetElement.classList,
            attachmentClasses = ['attachment-button', 'attachment',
            'attachment-badge', 'attachment-title', 'attachment-content'],
            len = attachmentClasses.length, i = 0;

        if (classList.contains('supplementary') === true) {
            return;
        }

        for (; i < len; i += 1) {
            if (classList.contains(attachmentClasses[i]) === true) {
                return;
            }
        }

        if (isExternalLink(e.target) && e.ctrlKey === true) {
            this.win.open(e.target.getAttribute('rel'), '_blank');
            return;
        }

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
            return;
        }
        if (hasSelection === true) {
            newFragment = this.supplementarySelectionHandler.onMouseUp(e.target);
            if (newFragment instanceof this.win.DocumentFragment === true) {
                this.context = this.fragmentSniffer.getContext(newFragment);
                if (this.context.length === 0) {
                    this.context.push('onSelect');
                }
                triggerMenuAction(newFragment, e, this);
            }
        }
        else {
            newFragment = this.supplementarySelectionHandler.onMouseClick(e.target);
            if (newFragment instanceof this.win.DocumentFragment === true) {
                this.context = this.fragmentSniffer.getContext(newFragment);
                if (this.context.length === 0) {
                    this.context.push('onClick');
                }
                triggerMenuAction(newFragment, e, this);
            }
        }
    }

    function onClick(e) {
        var self = this;

        if (e.which !== 1) {
            return;
        }
        this.clicks += 1;
        if (this.clicks === 1) {
            this.timer = setTimeout(function setTimeout1() {
                self.singleClickFn(e);
                self.clicks = 0;
            }, this.clickDelay);
        }
        else if (this.clicks === 2) {
            clearTimeout(this.timer); //prevent single-click action
            this.timer = setTimeout(function setTimeout2() {
                self.doubleClickFn(e);
                self.clicks = 0;
            }, this.clickDelay);
        }
        else {
            clearTimeout(this.timer); //prevent double-click action
            this.cancelSelectionFn(e);
            this.clicks = 0;
        }
    }

    function authorSupplementaryText(instance) {
        var message = '',
            fundingInfoText = '', supplInst,
            supplementaryContainer = instance.supplementaryContainer, item;

        message = Config.getLocaleByKey('author.supplementary.text');
        fundingInfoText = Config.getLocaleByKey('author.supplementary.funding.info');
        supplInst = supplementaryContainer.querySelector('.suppltext');
        if (Helper.isNull(supplInst) === false) {
            supplInst.innerHTML = message;
            if (Helper.isNull(fundingInfoText) === false) {
                item = instance.htmlDoc.createElement('span');
                item.classList.add('x');
                item.classList.add('suppltext-funding-info');
                item.innerHTML = fundingInfoText;
                supplInst.appendChild(item);
            }
        }
    }

    supplementary.prototype.setBlocker = function setBlockerFn() {
        var childNodes, childNodeLength,
            height = 0,
            i = 0;

        if (Helper.isNull(this.supplementaryBloker) === false) {
            return;
        }
        this.supplementaryBloker = this.htmlDoc.createElement('div');
        if (this.supplementaryContainer.hasChildNodes() === true) {
            childNodes = this.supplementaryContainer.childNodes;
            childNodeLength = childNodes.length;
            for (; i < childNodeLength; i += 1) {
                if (childNodes[i].nodeType === 1) {
                    height += childNodes[i].offsetHeight;
                }
            }
            this.supplementaryBloker.style.height = height + 'px';
            this.supplementaryBloker.classList.add('blocker');
            this.supplementaryContainer.appendChild(this.supplementaryBloker);
        }
    };

    supplementary.prototype.removeBlocker = function removeBlockerFn() {
        if (Helper.isNull(this.supplementaryBloker) === false) {
            this.supplementaryBloker.parentNode.removeChild(
                this.supplementaryBloker
            );
            this.supplementaryBloker = null;
        }
    };
    supplementary.prototype.setEventBind = function setEventBindFn(isEvent) {
        this.isEventBind = isEvent;
    };

    supplementary.prototype.render = function render(articleHtml) {
        var style, tables, tLen,
            i = 0,
            supplementaryInst = this.supplementaryContainer,
            wrapper = this.htmlDoc.createElement('div');

        // FIXME: Must be properly undone in destroy
        this.supplementaryContainer.parentNode.insertBefore(
            wrapper, this.supplementaryContainer
        );
        wrapper.appendChild(this.supplementaryContainer);
        wrapper.style.position = 'relative';
        this.supplementaryWrapper = wrapper;

        if (Helper.isEmptyString(articleHtml) === true) {
            throw new Error('error.article_html_missing');
        }
        this.overlay = this.htmlDoc.createElement('div');
        style = this.overlay.style;
        wrapper.appendChild(this.overlay);

        supplementaryInst.innerHTML = articleHtml;
        this.eventBus.publish('Supplementary:Loaded');
        this.isRendered = true;
        this.singleClickFn = onSingleClick.bind(this);
        this.doubleClickFn = onDoubleClick.bind(this);
        this.cancelSelectionFn = cancelSelection.bind(this);
        this.clickFn = onClick.bind(this);
        if (this.isEventBind === true) {
            supplementaryInst.addEventListener('mouseup', this.clickFn, false);
            supplementaryInst.addEventListener('dblclick', this.cancelSelectionFn, false);
        }
        style.position = 'absolute';
        style.display = 'none';
        tables = supplementaryInst.querySelectorAll('.table table');
        tLen = tables.length;
        for (; i < tLen; i += 1) {
            this.tableCharAligner.alignAndReplaceTable(tables[i]);
        }
        authorSupplementaryText(this);
        this.eventBus.subscribe('Supplementary:SetBlock', this.setBlocker, this);
        this.eventBus.subscribe('Supplementary:RemoveBlock', this.removeBlocker, this);
    };

    supplementary.prototype.setPosition = function setPosition(leftPos, topPos) {
        this.left = leftPos;
        this.top = topPos;
    };

    supplementary.prototype.setMetrics = function setMetrics(
        clientHeight, clientWidth, offsetTop, offsetLeft, scrollTop
    ) {
        this.clientHeight = clientHeight;
        this.clientWidth = clientWidth;
        this.offsetTop = offsetTop;
        this.offsetLeft = offsetLeft;
        this.scrollTop = scrollTop;
    };

    supplementary.prototype.setFragment = function setFragment(fragment) {
        this.DOMFragment = fragment;
    };

    supplementary.prototype.setEnabled = function setEnabled(enable) {
        var rect, style = this.overlay.style;

        if (enable === false) {
            rect = this.supplementaryContainer.getBoundingClientRect();
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

    supplementary.prototype.showContextualMenu = function showContextualMenu() {
        var args = {}, rect = this.supplementaryContainer.getBoundingClientRect();

        args.position = {'left': this.left, 'top': this.top};
        args.metrics = {
            'width': this.supplementaryContainer.clientWidth,
            'height': this.supplementaryContainer.clientHeight,
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

    supplementary.prototype.getHtml = function getHtml() {
        var html = Dom2Xml.toXml(this.supplementaryContainer.firstElementChild);

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

    supplementary.prototype.clearChangedFlag = function clearChangedFlag() {
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

    supplementary.prototype.hasUnsavedChanges = function hasUnsavedChanges() {
        var nodes, len;

        if (this.supplementaryContainer === null) {
            return false;
        }
        nodes = this.supplementaryContainer.querySelectorAll('[data-changes]');
        len = nodes.length;
        return len > 0;
    };

    supplementary.prototype.removeChangedFlag = function removeChangedFlagFn() {
        var i = 0,
            nodes, len;

        if (this.supplementaryContainer === null) {
            return;
        }
        nodes = this.supplementaryContainer.querySelectorAll('[data-changes]');
        len = nodes.length;
        for (; i < len; i += 1) {
            nodes[i].removeAttribute('data-changes');
        }
    };

    supplementary.prototype.getSaveData = function getSaveData() {
        var nodes, len, node, cloneNode, i = 0,
            saveData = [];

        if (this.saveInProgress === true) {
            return;
        }
        nodes = this.supplementaryContainer.querySelectorAll('[data-changes]');
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

    supplementary.prototype.save = function save(parentNode) {
        var dataset = parentNode.dataset, changes = 0;

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

    function highlight(matchedNode, instance) {
        var rangeHelper = instance.rangeHelper;

        matchedNode.scrollIntoView();
        rangeHelper.selectNode(matchedNode);
    }

    supplementary.prototype.scrollTo = function scrollTo(tagName, dataName, from) {
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
        if (this.supplementaryContainer instanceof window.HTMLElement === false) {
            return;
        }
        matchNodeSelectors = scrollMatchNodeSelectors.join(',');
        matchNodeSelectorLists = Helper.replaceLocaleString(
            matchNodeSelectors, {'value': dataName}
        );
        matchedNode = this.supplementaryContainer.querySelector(matchNodeSelectorLists);

        if (matchedNode instanceof window.HTMLElement === false) {
            return;
        }

        removeClassNode = this.supplementaryContainer.querySelectorAll(
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
            setTimeout(function settimeout() {
                matchedNodeClass.remove('scrollEffect');
            }, 2500);
        }
        else if (from === 'query') {
            matchedNodeCompStyle = this.win.getComputedStyle(matchedNode);
            matchedNode.style.marginTop = matchedNodeCompStyle.fontSize;
            matchedNodeClass.add('base');

            setTimeout(function settimeout() {
                matchedNodeClass.remove('base');
                matchedNode.removeAttribute('style');
            }, 2500);
        }
        if (this.isEnabled === false) {
            this.eventBus.publish('MainTabPanel:change', 'supplementary');
        }
        this.eventBus.publish('Supplementary:scrollEffect', matchedNode);
    };

    supplementary.prototype.mathAnnotateComplete = function mathAnnotateComplete(
        mathReferenceName, annotateData
    ) {
        var parentDiv, matchedNode,
            eC = this.supplementaryContainer;

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

    supplementary.prototype.mathEquationProofComplete = function mathEquationProofComplete(
        mathReferenceName, version, proofImageNode
    ) {
        var editorEquationNode, versionNode,
            eC = this.supplementaryContainer;

        editorEquationNode = eC.querySelector(
            equationSelector + '[name="' + mathReferenceName + '"]'
        );
        versionNode = editorEquationNode.querySelector('[version="' + version + '"]');
        if (versionNode === null) {
            return;
        }
        versionNode.appendChild(proofImageNode);
    };

    supplementary.prototype.mathEquationComplete = function mathEquationComplete(
        mathReferenceName, mathFragment, imagePath
    ) {
        var parentDiv, matchedNode, supplementaryEquationNode, imageNode,
            imageObj = new Image(),
            instance = this,
            eC = this.supplementaryContainer;

        matchedNode = eC.querySelector(
            equationSelector + '[name="' + mathReferenceName + '"]'
        );
        supplementaryEquationNode = mathFragment.querySelector(equationSelector);
        matchedNode.innerHTML = supplementaryEquationNode.innerHTML;

        imageNode = matchedNode.querySelector('img');

        imageObj.src = imagePath;

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

    supplementary.prototype.mathEquationLatexComplete = function mathEquationLatexComplete(
        mathReferenceName, version
    ) {
        var editorEquationNode, versionNode,
            eC = this.supplementaryContainer;

        editorEquationNode = eC.querySelector(
            'div.eqn-container[name="' + mathReferenceName + '"]'
        );
        versionNode = editorEquationNode.querySelector('[version="' + version + '"]');
        if (versionNode === null) {
            return;
        }
        versionNode.dataset.latex = true;
    };

    function mathEquationLatexEnableOrDisable(
        mathReferenceName, version, latexFlag, Instance
    ) {
        var editorEquationNode, versionNode, mainVersionNode,
            eC = Instance.supplementaryContainer, mathMlLatexSetValue = 'on',
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

    supplementary.prototype.mathEquationLatexComplete = function mathEquationLatexComplete(
        mathReferenceName, version
    ) {
        mathEquationLatexEnableOrDisable(mathReferenceName, version, true, this);
    };

    supplementary.prototype.mathEquationLatexFailure = function mathEquationLatexFailure(
        mathReferenceName, version
    ) {
        mathEquationLatexEnableOrDisable(mathReferenceName, version, false, this);
    };

    supplementary.prototype.applyFormatting = function applyFormatting(
        Fragment, action
    ) {
        var requestTag, requestId, requestSupplementaryTag, requestInnerHTML,
            parentNode, firstParent, spanName, tagName, correctionNode, syncEl;

        if (Fragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment.missing');
        }
        requestTag = Fragment.querySelector('[data-request-id]');
        if (requestTag instanceof this.win.HTMLElement === false) {
            throw new Error('error.request.id.missing');
        }
        requestId = requestTag.dataset.requestId;
        requestSupplementaryTag = this.supplementaryContainer.querySelector(
            'span[data-request-id="' + requestId + '"]'
            );
        if (requestSupplementaryTag instanceof this.win.HTMLElement === false) {
            throw new Error('error.supplementary.request.id.missing');
        }
        parentNode = getParentForChild(requestSupplementaryTag, this);
        requestInnerHTML = requestTag.innerHTML;
        correctionNode = requestTag.firstChild;
        firstParent = requestSupplementaryTag.parentNode;
        this.eventBus.publish('ActionLog:action', 'apply-supplementary', null,
            requestSupplementaryTag, requestTag, parentNode
        );
        this.rangeHelper.removeAllSelections();
        requestSupplementaryTag.insertAdjacentHTML('afterEnd', requestInnerHTML);
        requestSupplementaryTag.parentNode.removeChild(requestSupplementaryTag);
        this.normalizer.normalize(firstParent);
        requestTag = null;

        this.save(parentNode);
        if (Helper.isUndefined(action) === false) {
            syncEl = this.supplementaryContainer.querySelector(
                '.supplementary .authgrp'
            );
            if (Features.isFeatureEnabled('Editor.ElementSync') === true &&
                syncEl.contains(parentNode)
            ) {
                parentNode = ElementSyncFormatter.changeActualElementAttrs(
                    this.win,
                    parentNode.cloneNode(true),
                    'elementsync'
                );
            }
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

    supplementary.prototype.attachEvents = function attachevents(subscribe) {
        if (subscribe === true) {
            attachEvents(this);
        }
        else {
            detachEvents(this);
        }
    };

    supplementary.prototype.destroy = function destroy() {
        this.removeEvent();
        this.supplementaryContainer.innerHTML = '';
        this.eventBus.unsubscribe('Supplementary:removeEvent', this.removeEvent);
        this.eventBus.unsubscribe('Supplementary:ScrollTo', this.scrollTo, this);
        this.eventBus.unsubscribe('Supplementary:scrollEffect', scrollEffect, this);
        initializeVariables(this);
    };
    supplementary.prototype.removeEvent = function removeEvent() {
        this.supplementaryContainer.removeEventListener('click', this.clickFn, false);
        this.supplementaryContainer.removeEventListener('dblclick', this.cancelSelectionFn, false);
    };

    supplementary.prototype.quickLinkTabNavigation = function quickLinkTabNavigation(data) {
        this.scrollTo('div', data.sectionId, 'quicklinkSection');
    };

    supplementary.prototype.quickLinkFigureAndTableNavigation = function quickLinkFigureAndTableNavigation(data) {
        this.scrollTo('div', data.sectionId, 'quicklinkFigureAndTableSection');
    };
    return supplementary;
});

define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper', 'scripts/EventBus'], function quickLinkLoader(
    TreePanel, TreeModel, Helper, EventBus) {
    'use strict';

    function findParentNode(model, level) {
        var parentNode = null, subLevels = level.split('.'), j = subLevels.length - 1;

        for (; j >= 1; j -= 1) {
            parentNode = model.findNodeBy(function findByLevel(node) {
                return node.data.sectionId === subLevels.slice(0, j).join('.');
            });
            if (parentNode !== null) {
                return parentNode;
            }
        }

        return null;
    }

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.tree = null;
        instance.container = null;
        instance.eventBus = null;
        instance.toggleOnSectionIds = [];
        instance.visitedSectionIds = [];
    }

    function QuickLink(quickLinkContainer, eventBus, win, doc, localeData) {
        initializeVariables(this);
        this.win = win;
        this.doc = doc;
        this.localeData = localeData;
        this.container = quickLinkContainer;
        this.eventBus = eventBus;
        if (win instanceof win.Window === false) {
            throw new Error('quickLinkSection.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('quickLinkSection.requires.htmldocument');
        }
    }

    QuickLink.prototype.load = function load() {
        var treeModel, rootNode,
            doc = this.doc,
            headings = doc.querySelectorAll('.editor-container [data-heading-level]'),
            len = headings.length, i = 0, heading, label, parent;
        if (len === 0) {
            return;
        }
        treeModel = new TreeModel();
        rootNode = TreeModel.ROOT_NODE;
        if (Helper.isUndefined(treeModel) === true || Helper.isNull(treeModel) === true || Helper.isNull(rootNode) === true) {
            throw new Error('quickLinkSection.not.initiate');
        }

        for (; i < len; i += 1) {
            heading = headings[i].dataset.headingLevel;
            label = headings[i].innerHTML;
            parent = findParentNode(treeModel, heading);
            if (Helper.isNull(parent) === true) {
                treeModel.addNode(
                    rootNode, label, {'sectionId': heading}
                );
            }
            else {
                treeModel.addNode(
                    parent.key, label, {'sectionId': heading}
                );
            }
        }
        this.render(treeModel);
        this.setVisitedLinkReload(this.visitedSectionIds);
    };

    QuickLink.prototype.render = function render(treeModel) {
        var tree, win = this.win, doc = this.doc, instance = this;

        if (Helper.isUndefined(treeModel) === true || Helper.isNull(treeModel) === true) {
            throw new Error('quickLinkSection.not.initiate');
        }
        tree = new TreePanel(win, doc, this.localeData);
        tree.setModel(treeModel);
        tree.onNodeClick(function onNodeClick(data) {
            if (data instanceof Element === true) {
                instance.toggleOn(data);
            }
            else {
                instance.addVisitedSectionIdToArray(data);
                EventBus.publish('QuickLink:onSectionNodeClick', data);
            }
        });
        tree.onNodeEnterClick(function onNodeEnterClick(data) {
            instance.addVisitedSectionIdToArray(data);
            EventBus.publish('QuickLink:onSectionNodeEnterClick', data);
        });
        tree.renderTo(this.container);
        this.collapsequickLink(this.toggleOnSectionIds);
        this.tree = tree;
    };

    QuickLink.prototype.toggleOn = function toggleOn(data) {
        var sectionId, sectionIdIndex;

        sectionId = data.dataset.sectionId;
        if (data.getAttribute('aria-expanded') === 'false') {
            this.toggleOnSectionIds.push(sectionId);
        }
        else {
            sectionIdIndex = this.toggleOnSectionIds.indexOf(sectionId);
            this.toggleOnSectionIds.splice(sectionIdIndex, 1);
        }
    };

    QuickLink.prototype.addVisitedSectionIdToArray = function addVisitedSectionIdToArray(data) {
        var sectionIdIndex, sectionId;

        sectionId = data.sectionId;
        sectionIdIndex = this.visitedSectionIds.indexOf(sectionId);
        if (sectionIdIndex === -1) {
            this.visitedSectionIds.push(sectionId);
            this.addClassForVisitedSectionIds(sectionId);
        }
    };

    QuickLink.prototype.setVisitedLinkReload = function setVisitedLinkReload(visitedSectionIds) {
        var doc = this.doc, sectionIdIndex, sectionId,
            parentNodes = doc.querySelectorAll('.table-of-content li'),
            i = 0, length = parentNodes.length;

        for (; i < length; i += 1) {
            sectionId = parentNodes[i].dataset.sectionId;
            sectionIdIndex = visitedSectionIds.indexOf(parentNodes[i].dataset.sectionId);
            if (sectionIdIndex !== -1) {
                this.addClassForVisitedSectionIds(sectionId);
            }
        }
    };

    QuickLink.prototype.addClassForVisitedSectionIds = function addClassForVisitedSectionIds(sectionId) {
        var focusedElement, doc = this.doc;

        focusedElement = doc.querySelector('.quicklinks-tab [data-section-id="' + sectionId + '"]');
        focusedElement.classList.add('quicklink-item-mouse-click');
    };

    QuickLink.prototype.collapsequickLink = function collapsequickLink(toggleOnIds) {
        var doc = this.doc,
            parentNodes = doc.querySelectorAll('.table-of-content .toc-parent'),
            i = 0, length = parentNodes.length, sectionIdIndex;

        for (; i < length; i += 1) {
            sectionIdIndex = toggleOnIds.indexOf(parentNodes[i].dataset.sectionId);
            if(toggleOnIds.length === 0 || sectionIdIndex === -1) {
                parentNodes[i].setAttribute('aria-hidden', 'true');
                parentNodes[i].setAttribute('aria-expanded', 'false');
            }
        }
    };

    QuickLink.prototype.destroy = function destroy() {
        var doc = this.doc, elem, tree = this.tree;

        elem = doc.querySelector('.table-of-content');
        elem.parentNode.removeChild(elem);
        initializeVariables(this);
        tree.destroy();
    };

    return QuickLink;
});

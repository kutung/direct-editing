define(['scripts/ListPanel', 'customer/Config', 'scripts/Util',
       'scripts/Helper', 'scripts/EventBus'], function QuickLinkEquation(
    ListPanel, CustomerConfig, Util, Helper, EventBus) {
    'use strict';

    var equationCount,
        equationListTemplate = [
            '<div class="equation_list quicklink_list_panel"></div>'
        ],
        equationTemplate = [
            '<span class="fig-list-title eqnLabel"></span>',
            '<div class="figure-wrapper">',
            '<div class="eqn-content eqnContent"></div>',
            '<div class="figure-table-captionwrapper">',
            '<p class="fig-cap-captiontext eqnCaption"></p>',
            '</div>',
            '</div>'
        ],
        labelSelector = Util.getSelector('label'),
        captionSelector = Util.getSelector('caption'),
        labelWrapper = ['<span class="list-label"></span>'];

    function convertTemplateArrayToNode(template) {
        var tmpNode;

        tmpNode = document.createElement('div');
        tmpNode.innerHTML = template.join('');

        return tmpNode;
    }

    function getNodeValue(node) {
        var nodeValue = '';

        if (Helper.isUndefined(node.dataset.id) === false) {
            nodeValue = node.dataset.id;
        }
        else if (Helper.isNull(node.getAttribute('name')) === false &&
            Helper.isUndefined(node.getAttribute('name')) === false
        ) {
            nodeValue = node.getAttribute('name');
        }

        return nodeValue;
    }

    function createLabelWrapper(content) {
        var tmpNode, tmpItem;

        tmpNode = convertTemplateArrayToNode(labelWrapper);
        tmpItem = tmpNode.firstChild;
        tmpItem.innerHTML = content;

        return tmpNode.innerHTML;
    }

    function addEquation(panel, node) {
        var equationNode, equationLabelNode, label, tmpNode,
            equationCloneNode, nodeValue, eqnCaptionNode;
        equationNode = node.querySelector(Util.getSelector('equation'));
        equationLabelNode = node.querySelector(labelSelector);
        eqnCaptionNode = node.querySelector(captionSelector);
        // equationNode = node.querySelector('.eqn-container');
        // equationLabelNode = node.querySelector(labelSelector);

        if (Helper.isNull(equationNode) === true || Helper.isNull(equationLabelNode) === true) {
            return;
        }
        equationCloneNode = equationNode.cloneNode(true);

        tmpNode = document.createElement('div');

        tmpNode.innerHTML = equationTemplate.join('');
        tmpNode.querySelector('.eqnContent').innerHTML = equationCloneNode.outerHTML;
        tmpNode.querySelectorAll('.eqnLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = equationLabelNode.innerText;
        });
        if(eqnCaptionNode)
            tmpNode.querySelector('.eqnCaption').innerHTML = eqnCaptionNode.innerText;

        if(tmpNode.querySelector('.equation_data_container')){
            tmpNode.querySelector('.equation_data_container').style.display = 'none';
        }
        label = tmpNode.innerHTML;
        nodeValue = getNodeValue(equationNode);
        panel.add(
            label, {'sectionId': nodeValue}
        );
        equationCount += 1;
    }

    function addClassForVisitedTableIds(sectionId, container) {
        var focusedElement;

        focusedElement = container.querySelector('.table_list [data-section-id="' + sectionId + '"]');
        if (Helper.isNull(focusedElement) === false) {
            focusedElement.classList.add('quicklink-table-visited-item');
        }
    }

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.container = null;
        instance.quickLinkSelectors = null;
        instance.equationListInst = null;
        equationCount = 0;
        instance.visitedTableIds = [];
    }

    function QuickLinkEquation(win, doc, localeData, cont) {
        if (win instanceof win.Window === false) {
            throw new Error('quicklink.figure.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('quicklink.figure.requires.htmldocument');
        }
        if (cont instanceof win.HTMLElement === false) {
            throw new Error('quicklink.figure.requires.htmlelement');
        }
        initializeVariables(this);
        this.win = win;
        this.doc = doc;
        this.localeData = localeData;
        this.container = cont;
        this.quickLinkSelectors = Util.selectorToArray(
            CustomerConfig.get('enableEquationQuickLinkFor')
        );
    }

    QuickLinkEquation.prototype.load = function load(parentContainer) {
        var equationListInst,
            nodes, nodesLength, nodeClass,
            i = 0, win = this.win,
            equationClass = Util.selectorToClass('fullEquationContainer'),
            localeData = this.localeData;

        if (parentContainer instanceof win.HTMLElement === false) {
            throw new Error('quicklink.figure.requires.container');
        }
        nodes = parentContainer.querySelectorAll(this.quickLinkSelectors);
        nodesLength = nodes.length;
        if (nodesLength === 0) {
            return;
        }
        equationListInst = this.createListPanel(equationListTemplate,
            'Equation');

        for (; i < nodesLength; i += 1) {
            nodeClass = nodes[i].classList;
            if (nodeClass.contains(equationClass) === true) {
                addEquation(equationListInst, nodes[i]);
            }
        }
        this.equationListInst = equationListInst;
        this.removeEmptyListPanel();
        this.equationListInst.panelContainer.querySelector('.panel-header').style.display = 'none';
        this.setVisitedItemReload(this.visitedTableIds);
    };

    QuickLinkEquation.prototype.removeEmptyListPanel = function removeEmptyListPanel() {
        var container = this.container,
            equationElem = container.querySelector('.equation_list');

        if (equationCount === 0) {
            this.equationListInst.destroy();
            equationElem.parentNode.removeChild(equationElem);
        }
    };

    QuickLinkEquation.prototype.createListPanel = function createListPanel(
        template, title
    ) {
        var listPanel, tmpWrapper, tmpNode,
            container = this.container,
            instance = this;

        if (Helper.isEmptyString(template) === true || Helper.isNull(template) === true) {
            throw new Error('figure.list.panel.template.not.initiate');
        }
        tmpWrapper = convertTemplateArrayToNode(template);
        tmpNode = tmpWrapper.firstChild;
        container.appendChild(tmpNode);

        listPanel = new ListPanel(tmpNode, this.doc, this.win, EventBus);
        if (Helper.isEmptyString(listPanel) === true || Helper.isNull(listPanel) === true) {
            throw new Error('figure.list.panel.not.initiate');
        }
        listPanel.render();
        listPanel.ignoreHeaderClick(true);
        listPanel.setTitle(title);
        listPanel.onNodeClick(function onNodeMouseClick(data) {
            instance.addVisitedTableIdToArray(data);
            $(window.event.currentTarget).children().removeClass('active');
            $(window.event.target).parents('li').addClass('active');
            EventBus.publish('QuickLinkEquation:onNodeClick', data);
        });
        listPanel.onNodeEnterClick(function onNodeEnterKeyClick(data) {
            instance.addVisitedTableIdToArray(data);
            EventBus.publish('QuickLinkEquation:onNodeClick', data);
        });

        return listPanel;
    };

    QuickLinkEquation.prototype.addVisitedTableIdToArray = function
        addVisitedTableIdToArray(data) {
        var sectionIdIndex, sectionId,
            container = this.container;

        sectionId = data.sectionId;
        sectionIdIndex = this.visitedTableIds.indexOf(sectionId);
        if (sectionIdIndex === -1) {
            this.visitedTableIds.push(sectionId);
            addClassForVisitedTableIds(sectionId, container);
        }
    };

    QuickLinkEquation.prototype.setVisitedItemReload = function setVisitedItemReload(visitedTableIds) {
        var sectionIdIndex, sectionId,
            container = this.container,
            parentNodes = container.querySelectorAll('.table_list li'),
            length = parentNodes.length,
            i = 0;

        for (; i < length; i += 1) {
            sectionId = parentNodes[i].dataset.sectionId;
            sectionIdIndex = visitedTableIds.indexOf(parentNodes[i].dataset.sectionId);
            if (sectionIdIndex !== -1) {
                addClassForVisitedTableIds(sectionId, container);
            }
        }
    };

    QuickLinkEquation.prototype.destroy = function destroy() {
        var container = this.container,
            equationElem = container.querySelector('.equation_list');

        this.equationListInst.destroy();
        if (Helper.isNull(equationElem) === false) {
            equationElem.parentNode.removeChild(equationElem);
        }
        initializeVariables(this);
    };

    return QuickLinkEquation;
});

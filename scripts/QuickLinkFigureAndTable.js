define(['scripts/ListPanel', 'customer/Config', 'scripts/Util',
       'scripts/Helper', 'scripts/EventBus'], function QuickLinkFigureAndTableLoader(
    ListPanel, CustomerConfig, Util, Helper, EventBus) {
    'use strict';

    var figureCount,
        tableCount,
        figureListTemplate = [
            '<div class="figure_list quicklink_list_panel"></div>'
        ],
        tableListTemplate = [
            '<div class="table_list quicklink_list_panel"></div>'
        ],
        figureTemplate = [
            '<span class="fig-list-title figLabel"></span>',
            '<div class="figure-wrapper">',
            '<div class="figure-list-container">',
            '<div class="figure-table-container">',
            '<div class="figure-table-cell">',
            '<div class="figure-table-inner">',
            '</div>',
            '</div>',
            '</div>',
            '</div>',
            '<div class="figure-table-captionwrapper">',
            '<p class="fig-cap-captiontext figCaption"></p>',
            '</div>',
            '</div>'
        ],
        tableTemplate = [
            '<span class="fig-list-title tableLabel"></span>',
            '<div class="figure-wrapper">',
            '<div class="figure-list-container">',
            '<table><thead><th colspan="3"></th></thead>',
            '<tbody><tr><td></td><td></td><td></td></tr>',
            '<tr><td></td><td></td><td></td></tr>',
            '<tr><td></td><td></td><td></td></tr></tbody></table>',
            '</div>',
            '<div class="figure-table-captionwrapper">',
            '<p class="fig-cap-captiontext tableCaption"></p>',
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

    function addFigure(panel, node) {
        var imageNode, imageLabelNode, label, tmpNode,
            imageCloneNode, nodeValue, imageCaptionNode;

        imageNode = node.querySelector('img');
        imageLabelNode = node.querySelector(labelSelector);
        imageCaptionNode = node.querySelector(captionSelector);
        if (Helper.isNull(imageNode) === true || Helper.isNull(imageLabelNode) === true) {
            return;
        }

        imageCloneNode = imageNode.cloneNode(true);
        tmpNode = document.createElement('div');

        tmpNode.innerHTML = figureTemplate.join('');
        tmpNode.querySelector('.figure-table-inner').innerHTML = imageCloneNode.outerHTML;
        tmpNode.querySelectorAll('.figLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = imageLabelNode.innerText;
        });
        tmpNode.querySelector('.figCaption').innerHTML = imageCaptionNode.innerText;

        label = tmpNode.innerHTML;
        nodeValue = getNodeValue(imageNode);
        panel.add(
            label, {'sectionId': nodeValue} 
        );
        figureCount += 1;
    }

    function addTable(panel, node) {
        var tableLabelNode, tableCaptionNode, label,
            tableLabel = '', tableCaption = '', nodeValue, tmpNode;

        tableLabelNode = node.querySelector(labelSelector);
        tableCaptionNode = node.querySelector(captionSelector);

        if (Helper.isNull(tableLabelNode) === true) {
            return;
        }
        tableLabel = createLabelWrapper(tableLabelNode.innerHTML);
        if (Helper.isNull(tableCaptionNode) === false) {
            tableCaption = tableCaptionNode.innerHTML;
        }

        tmpNode = document.createElement('div');
        tmpNode.innerHTML = tableTemplate.join('');
        tmpNode.querySelectorAll('.tableLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = tableLabel;
        });
        tmpNode.querySelector('.tableCaption').innerHTML = tableCaption;

        label = tmpNode.innerHTML;
        nodeValue = getNodeValue(node);
        panel.add(
            label, {'sectionId': nodeValue}
        );
        tableCount += 1;
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
        instance.tableListInst = null;
        instance.figureListInst = null;
        figureCount = 0;
        tableCount = 0;
        instance.visitedTableIds = [];
    }

    function QuickLinkFigureAndTable(win, doc, localeData, cont) {
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
            CustomerConfig.get('enableFigureAndTableQuickLinkFor')
        );
    }

    QuickLinkFigureAndTable.prototype.load = function load(parentContainer) {
        var figureListInst, tableListInst,
            nodes, nodesLength, nodeClass,
            i = 0, win = this.win,
            figureClass = Util.selectorToClass('figure'),
            tableClass = Util.selectorToClass('table'),
            localeData = this.localeData;

        if (parentContainer instanceof win.HTMLElement === false) {
            throw new Error('quicklink.figure.requires.container');
        }
        nodes = parentContainer.querySelectorAll(this.quickLinkSelectors);
        nodesLength = nodes.length;
        if (nodesLength === 0) {
            return;
        }
        figureListInst = this.createListPanel(figureListTemplate,
            localeData['quicklink.figure.section.title']);
        tableListInst = this.createListPanel(tableListTemplate,
            localeData['quicklink.table.section.title']);

        for (; i < nodesLength; i += 1) {
            nodeClass = nodes[i].classList;
            if (nodeClass.contains(tableClass) === true) {
                addTable(tableListInst, nodes[i]);
            }
            else if (nodeClass.contains(figureClass) === true) {
                addFigure(figureListInst, nodes[i]);
            }
        }
        this.figureListInst = figureListInst;
        this.tableListInst = tableListInst;
        this.removeEmptyListPanel();
        this.setVisitedItemReload(this.visitedTableIds);
    };

    QuickLinkFigureAndTable.prototype.removeEmptyListPanel = function removeEmptyListPanel() {
        var container = this.container,
            figureElem = container.querySelector('.figure_list'),
            tableElem = container.querySelector('.table_list');

        if (figureCount === 0) {
            this.figureListInst.destroy();
            figureElem.parentNode.removeChild(figureElem);
        }
        if (tableCount === 0) {
            this.tableListInst.destroy();
            tableElem.parentNode.removeChild(tableElem);
        }
    };

    QuickLinkFigureAndTable.prototype.createListPanel = function createListPanel(
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
            EventBus.publish('QuickLinkFigureAndTable:onNodeClick', data);
        });
        listPanel.onNodeEnterClick(function onNodeEnterKeyClick(data) {
            instance.addVisitedTableIdToArray(data);
            EventBus.publish('QuickLinkFigureAndTable:onNodeClick', data);
        });

        return listPanel;
    };

    QuickLinkFigureAndTable.prototype.addVisitedTableIdToArray = function
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

    QuickLinkFigureAndTable.prototype.setVisitedItemReload = function setVisitedItemReload(visitedTableIds) {
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

    QuickLinkFigureAndTable.prototype.destroy = function destroy() {
        var container = this.container,
            figureElem = container.querySelector('.figure_list'),
            tableElem = container.querySelector('.table_list');

        this.figureListInst.destroy();
        if (Helper.isNull(figureElem) === false) {
            figureElem.parentNode.removeChild(figureElem);
        }
        this.tableListInst.destroy();
        if (Helper.isNull(tableElem) === false) {
            tableElem.parentNode.removeChild(tableElem);
        }
        initializeVariables(this);
    };

    return QuickLinkFigureAndTable;
});

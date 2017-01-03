define(['scripts/ListPanel', 'customer/Config', 'scripts/Util',
       'scripts/Helper', 'scripts/EventBus'], function OtherCitationTableLoader(
    ListPanel, CustomerConfig, Util, Helper, EventBus) {
    'use strict';

    var tableCount,
        tableListTemplate = [
            '<div class="table_list quicklink_list_panel"></div>'
        ],
        tableTemplate = [
        '<div class="comman-othercitation-wrapper">',
             '<div class="citation-listcheck tablelistWrapper">',
              '<span class="ref-add editTableCiteClick"></span>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
              '<div class="checklist-para">',
               '<input type="checkbox"  class="tableCheckBox">',
               '<label for="cite">',
                '<i class="cite-fig-title tableLabel"></i>',
                '<span class="citation-fig-wrapper tableInnerWrapper">',
                 '<span class="citation-fig-table">',
                  '<span class="citation-fig-tablecell">',
                   '<span class="citation-fig-tableinner tableContent">',
                   '<table><thead><th colspan="3"></th></thead>',
                    '<tbody><tr><td></td><td></td><td></td></tr>',
                    '<tr><td></td><td></td><td></td></tr>',
                    '<tr><td></td><td></td><td></td></tr></tbody></table>',
                   '</span>',
                  '</span>',
                 '</span>',
                '</span>',
               '</label>',
              '</div>',
              '<div class="cite-fig-content-wrapper">',
               '<div class="cite-fig-content tableCaption">',
               '</div>',
               '<div class="citation-count-listsplit">',
                '<ul class="tableCitationList">',
                 '<li class="tableCitationCountNode" style="display:none">',
                  '<span class="tableCitationCountNum">0</span>',
                  '<span class="citation-kill citationDel"></span>',
                '</ul>',
               '</div>',
              '</div>',
             '</div>',
            '</div>'
            ],
            buttonTemplate = [
        '<div class="references-view-btn citeTablewrapper" style="display:none">',
            '<button class="cite-close-icon citeTableClose"></button>',
            '<button class="cite-btn-full citeTable">Cite</button>',
        '</div>',
        '<div class="othercitation-view-uncitedwrapper uncitedtableWrapper">',
            '<span class="othercitation-view-uncited uncitedtableBtn">View Uncited</span>',
        '</div>',
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

    function getCitationCount(equationId, tmpNode){
        var citeCount = 0;
        // var citeList = tmpNode.querySelector('.tableCitationCountNode').cloneNode(true);
        if(document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.tableCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.tableCitationCountNum').innerHTML = '';
                citeList.querySelector('.tableCitationCountNum').innerHTML = ++citeCount;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.tableCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.tableCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
        if(document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.tableCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.tableCitationCountNum').innerHTML = '';
                citeList.querySelector('.tableCitationCountNum').innerHTML = ++citeCount;
                // citeList.id = singleElement.id;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.tableCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.tableCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
    }

    function addTable(panel, node) {
        var tableLabelNode, tableCaptionNode, label, tableId,
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
        tableId = node.id;
        tmpNode = document.createElement('div');
        tmpNode.innerHTML = tableTemplate.join('');
        tmpNode.querySelector('.tablelistWrapper').setAttribute('data-id',tableId);
        tmpNode.querySelectorAll('.tableLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = tableLabel;
        });
        tmpNode.querySelector('.tableCaption').innerHTML = tableCaption;
        // tmpNode.querySelector('.tableContent').innerHTML = imageCloneNode.outerHTML;

        getCitationCount(tableId, tmpNode);
        label = tmpNode.innerHTML;
        // nodeValue = getNodeValue(node);
        nodeValue = tableId;
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
        tableCount = 0;
        instance.visitedTableIds = [];
    }

    function onListClick(dataId, target){
        if(event.target.type == "checkbox")
            return;
        if(target.classList.contains('tableListItem')){
            if(!target.querySelector('.tablelistWrapper').classList.contains('active')){
                target.parentNode.querySelectorAll('.tablelistWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.tableInnerWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.querySelector('.tablelistWrapper').classList.add('active');
                target.querySelector('.tableInnerWrapper').classList.add('active');
                $(target).find('.tableCitationList li').removeClass('active');
            } else{
                target.parentNode.querySelectorAll('.tablelistWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.tableInnerWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
            }
        }
    }

    function citatioNumClick(event){
        $(event.target).parents('.tableCitationList').find('li').removeClass('active');
        $(event.target).parent().addClass('active');
        $('.editor').scrollTop(findPos(document.getElementById(event.target.parentNode.getAttribute('data-id')))-100);
    }

    function findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        return curtop;
        }
    }

    function citatioDelClick(event){
        document.getElementById(event.target.parentNode.getAttribute('data-id')).classList.add('text-strikethrough');
        event.target.parentNode.classList.add('disabled');
    }

    function checkboxClick(event){
        if(this.tableListInst.panelContainer.querySelectorAll('input.tableCheckBox:checked').length){
            this.tableListInst.panelContainer.querySelector('.citeTablewrapper').style.display = 'block';
            this.tableListInst.panelContainer.querySelector('.uncitedtableWrapper').style.display = 'none';
        }
        else{
           this.tableListInst.panelContainer.querySelector('.uncitedtableWrapper').style.display = 'block'; 
           this.tableListInst.panelContainer.querySelector('.citeTablewrapper').style.display = 'none'; 
        }
    }

    function citeSelected(){
        var citeHtml,id,content, multiple=false;
        var selectedCheckBox = document.querySelectorAll('input.tableCheckBox:checked');
        if(selectedCheckBox.length > 1){
            id = [];
            content = [];
            multiple = true;
            selectedCheckBox.forEach(function(singleElement){
                var citeText = '';
                id.push(singleElement.parentNode.parentNode.getAttribute('data-id'));
                if(singleElement.parentNode.parentNode.getAttribute('data-cite-text'))
                    citeText = singleElement.parentNode.parentNode.getAttribute('data-cite-text');
                else
                    citeText = singleElement.parentNode.parentNode.querySelector('.tableLabel').innerText;
                content.push(citeText);
            });
        } else {
            selectedCheckBox.forEach(function(singleElement){
                var citeText = '';
                id = singleElement.parentNode.parentNode.getAttribute('data-id');
                if(singleElement.parentNode.parentNode.getAttribute('data-cite-text'))
                    citeText = singleElement.parentNode.parentNode.getAttribute('data-cite-text');
                else
                    citeText = singleElement.parentNode.parentNode.querySelector('.tableLabel').innerText;
                content = citeText;
            });
        }
        var uniqueId, reuni = 0;
            if(multiple){
                citeHtml = '<span class="ce_cross-fig_multi">(';
                id.forEach(function(singleId,index){
                    uniqueId = reuni++ +''+ Date.now();
                    citeHtml += '<a title="'+singleId+'" class="ce_cross-ref" name="'+uniqueId+'" id="'+uniqueId+'">'+content[index]+'</a>; ';
                });
                citeHtml += ')</span>';
            } else {
                uniqueId = reuni++ +''+ Date.now();
                citeHtml = '(<a title="'+id+'" class="ce_cross-ref" name="'+uniqueId+'" id="'+uniqueId+'">'+content+'</a>)';
            }
            var tempElement = document.createElement('div');
            tempElement.innerHTML = citeHtml;
            if(document.querySelector('.cursor')){
                // document.querySelector('.cursor').parentNode.insertBefore(tempElement.querySelector('a'),document.querySelector('.cursor'));
                $( ".cursor" ).before( citeHtml );
            }

            selectedCheckBox.forEach(function(singleElement){
                var paretNode = $(singleElement).parents('li[tabindex="0"]');
                paretNode.find('.tableCitationList li:not(:first-child)').remove();
                getCitationCount(paretNode[0].querySelector('.tablelistWrapper').getAttribute('data-id'), paretNode[0]);
            });
    }

    function filterunCited(){
        var unCitedButton = document.querySelector('.uncitedtableBtn');
        if(document.querySelector('.uncitedtableBtn').className.includes('hideUnCited')){
            var referencefilteredList = document.querySelectorAll('.tableListItem.unciteFig');
            referencefilteredList.forEach(function(singleFilteredList, index){
                singleFilteredList.classList.remove('unciteReference');
            });
            unCitedButton.classList.remove('hideUnCited');
            unCitedButton.classList.remove('active');
            unCitedButton.innerHTML = '';
            unCitedButton.innerHTML = 'Show Uncited';
        } else {
          var citedReference = document.querySelectorAll('.ce_cross-ref');
            var citedReferenceTitle = [];
            citedReference.forEach(function(singleCiteReference, index){
                citedReferenceTitle.push(singleCiteReference.getAttribute('title'));
            });
            var citedArrayId = citedReferenceTitle.filter(function(item, pos) {
                return citedReferenceTitle.indexOf(item) == pos && item.startsWith("tbl");
            });
            var referenceList = document.querySelectorAll('.tableListItem');
            referenceList.forEach(function(singleReferenceList, index){
                if(!citedArrayId.includes(singleReferenceList.getAttribute('data-section-id'))){
                    singleReferenceList.className = singleReferenceList.className + ' unciteEqn';
                }
            });
            unCitedButton.innerHTML = '';
            unCitedButton.className = unCitedButton.className + ' hideUnCited active' ;
            unCitedButton.innerHTML = 'Hide Uncited';  
        }
    }

    var EditCitationNode;
    function editEqnCiteClick(event){
        this.doc.querySelector('.editCitationTable').style.display = 'block';
        EditCitationNode = event.target.parentNode;
    }

    function updateCitationText(){
        var textValue = document.querySelector('.editCitationTable .citationText').value;
        if(EditCitationNode){
            EditCitationNode.setAttribute('data-cite-text',textValue);
        }
        document.querySelector('.editCitationTable').style.display = 'none';
    }

    function OtherCitationTable(win, doc, localeData, cont) {
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

    OtherCitationTable.prototype.load = function load(parentContainer) {
        var figureListInst, tableListInst,
            nodes, nodesLength, nodeClass,
            i = 0, win = this.win,
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
        tableListInst = this.createListPanel(tableListTemplate,
            localeData['quicklink.table.section.title']);

        for (; i < nodesLength; i += 1) {
            nodeClass = nodes[i].classList;
            if (nodeClass.contains(tableClass) === true) {
                addTable(tableListInst, nodes[i]);
            }
        }
        this.tableListInst = tableListInst;
        this.tableListInst.panelContainer.querySelector('ul').classList.add('table-ul');
        var tempNode = this.doc.createElement('div');
        tempNode.innerHTML = buttonTemplate.join('');
		tempNode.className = 'foot-btn-wrapper';
        this.tableListInst.panelContainer.querySelector('.list-panel').appendChild(tempNode);
        this.tableListInst.panelContent.querySelectorAll('li[tabindex="0"]').forEach(function(singleElement){
            singleElement.classList.add('tableListItem');
        });
        this.removeEmptyListPanel();
        this.citatioNumClick = citatioNumClick.bind(this);
        this.citatioDelClick = citatioDelClick.bind(this);
        this.checkboxClick = checkboxClick.bind(this);
        this.editEqnCiteClick = editEqnCiteClick.bind(this);
        this.filterunCited = filterunCited.bind(this);
        var self = this;
        this.tableListInst.panelContainer.querySelectorAll('.tableCitationCountNum').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioNumClick, false)
        });
        this.tableListInst.panelContainer.querySelectorAll('.citationDel').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioDelClick, false)
        });
        this.tableListInst.panelContainer.querySelectorAll('.tableCheckBox').forEach(function(singleElement){
            singleElement.addEventListener('click', self.checkboxClick, false)
        });
        this.tableListInst.panelContainer.querySelectorAll('.editTableCiteClick').forEach(function(singleElement){
            singleElement.addEventListener('click', self.editEqnCiteClick, false)
        });
        this.doc.querySelector('.editCitationTable .cancelCitation').addEventListener('click', function(){
            self.doc.querySelector('.editCitationTable').style.display = 'none';
        }, false);
        this.tableListInst.panelContainer.querySelector('.uncitedtableBtn').addEventListener('click', this.filterunCited, false);
        this.doc.querySelector('.editCitationTable .updateCitation').addEventListener('click', updateCitationText, false);
        this.doc.querySelector('.citeTable').addEventListener('click', citeSelected, false);
        this.doc.querySelector('.citeTableClose').addEventListener('click', function(){
            self.tableListInst.panelContainer.querySelectorAll('input.tableCheckBox').forEach(function(singleElement){
                singleElement.checked = false;
            });
            self.tableListInst.panelContainer.querySelector('.citeTablewrapper').style.display = 'none';
        }, false);
        this.tableListInst.panelContainer.querySelector('.panel-header').style.display = 'none';
        this.setVisitedItemReload(this.visitedTableIds);
    };

    OtherCitationTable.prototype.removeEmptyListPanel = function removeEmptyListPanel() {
        var container = this.container,
            tableElem = container.querySelector('.table_list');

        if (tableCount === 0) {
            this.tableListInst.destroy();
            tableElem.parentNode.removeChild(tableElem);
        }
    };

    OtherCitationTable.prototype.createListPanel = function createListPanel(
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
        listPanel.onNodeClick(function onNodeMouseClick(data, target) {
            onListClick(data, target); 
        });
        listPanel.onNodeEnterClick(function onNodeEnterKeyClick(data) {
            instance.addVisitedTableIdToArray(data);
            EventBus.publish('QuickLinkFigureAndTable:onNodeClick', data);
        });

        return listPanel;
    };

    OtherCitationTable.prototype.addVisitedTableIdToArray = function
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

    OtherCitationTable.prototype.setVisitedItemReload = function setVisitedItemReload(visitedTableIds) {
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

    OtherCitationTable.prototype.destroy = function destroy() {
        var container = this.container,
            tableElem = container.querySelector('.table_list');

        this.tableListInst.destroy();
        if (Helper.isNull(tableElem) === false) {
            tableElem.parentNode.removeChild(tableElem);
        }
        initializeVariables(this);
    };

    return OtherCitationTable;
});

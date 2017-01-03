define(['scripts/ListPanel', 'customer/Config', 'scripts/Util',
       'scripts/Helper', 'scripts/EventBus'], function OtherEquationload(
    ListPanel, CustomerConfig, Util, Helper, EventBus) {
    'use strict';

    var equationCount,
        equationListTemplate = [
            '<div class="equation_list quicklink_list_panel"></div>'
        ],
        eqnTemplate = [
        '<div class="comman-othercitation-wrapper">',
             '<div class="citation-listcheck equationlistWrapper">',
              '<span class="ref-add editEqnCiteClick"></span>',
			  '<span class="ref-delete eqnDelete"></span>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
              '<div class="checklist-para">',
               '<input type="checkbox" class="eqnCheckBox">',
               '<label for="cite">',
                '<i class="cite-fig-title eqnLabel"></i>',
                '<span class="citation-fig-wrapper eqnFigWrapper">',
                 '<span class="citation-fig-table">',
                  '<span class="citation-fig-tablecell">',
                   '<span class="citation-fig-tableinner eqnContent">',
                   '</span>',
                  '</span>',
                 '</span>',
                '</span>',
               '</label>',
              '</div>',
              '<div class="cite-fig-content-wrapper">',
               '<div class="cite-fig-content eqnCaption">',
               '</div>',
               '<div class="citation-count-listsplit">',
                '<ul class="eqnCitationList">',
                 '<li class="eqnCitationCountNode" style="display:none">',
                  '<span class="eqnCitationCountNum">0</span>',
                  '<span class="citation-kill citationDel"></span>',
                '</ul>',
               '</div>',
              '</div>',
             '</div>',
            '</div>'
            ],
        buttonTemplate = [
        '<div class="references-view-btn citeEqnwrapper" style="display:none">',
            '<button class="cite-close-icon citeEqnClose"></button>',
            '<button class="cite-btn-full citeEqn">Cite</button>',
        '</div>',
		'<div class="othercitation-view-uncitedwrapper uncitedEqnWrapper">',
			'<span class="othercitation-view-uncited uncitedEqnBtn">View Uncited</span>',
		'</div>',
        ],
        labelSelector = Util.getSelector('label'),
        captionSelector = Util.getSelector('caption'),
        labelWrapper = ['<span class="list-label"></span>'], clickCount=0;

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
        // var citeList = tmpNode.querySelector('.eqnCitationCountNode').cloneNode(true);
        if(document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.eqnCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.eqnCitationCountNum').innerHTML = '';
                citeList.querySelector('.eqnCitationCountNum').innerHTML = ++citeCount;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.eqnCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.eqnCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
        if(document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.eqnCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.eqnCitationCountNum').innerHTML = '';
                citeList.querySelector('.eqnCitationCountNum').innerHTML = ++citeCount;
                // citeList.id = singleElement.id;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.eqnCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.eqnCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
    }

    function addEquation(panel, node) {
        var equationNode, equationLabelNode, label, tmpNode,
            equationCloneNode, nodeValue, eqnCaptionNode, equationId;
        equationNode = node.querySelector(Util.getSelector('equation'));
        equationLabelNode = node.querySelector(labelSelector);
        eqnCaptionNode = node.querySelector(captionSelector);
        // equationNode = node.querySelector('.eqn-container');
        // equationLabelNode = node.querySelector(labelSelector);
        equationId = node.parentNode.id;
        if (Helper.isNull(equationNode) === true || Helper.isNull(equationLabelNode) === true) {
            return;
        }
        equationCloneNode = equationNode.cloneNode(true);

        tmpNode = document.createElement('div');

        tmpNode.innerHTML = eqnTemplate.join('');
        tmpNode.querySelector('.equationlistWrapper').setAttribute('data-id',equationId);
        tmpNode.querySelector('.eqnContent').innerHTML = equationCloneNode.outerHTML;
        tmpNode.querySelectorAll('.eqnLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = equationLabelNode.innerText;
        });
        if(eqnCaptionNode)
            tmpNode.querySelector('.eqnCaption').innerHTML = eqnCaptionNode.innerText;

        if(tmpNode.querySelector('.equation_data_container')){
            tmpNode.querySelector('.equation_data_container').style.display = 'none';
        }
        getCitationCount(equationId, tmpNode);
        label = tmpNode.innerHTML;
        nodeValue = getNodeValue(equationNode);
        panel.add(
            label, {'sectionId': equationId}
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

    function onListClick(dataId, target){
        if(event.target.type == "checkbox")
            return;
        if(target.classList.contains('eqnListItem')){
            if(!target.querySelector('.equationlistWrapper').classList.contains('active')){
                target.parentNode.querySelectorAll('.equationlistWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.eqnFigWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.querySelector('.equationlistWrapper').classList.add('active');
                target.querySelector('.eqnFigWrapper').classList.add('active');
                $(target).find('.eqnCitationList li').removeClass('active');
            } else {
                target.parentNode.querySelectorAll('.equationlistWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.eqnFigWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
            }
        }
    }

    function citatioNumClick(event){
        $(event.target).parents('.eqnCitationList').find('li').removeClass('active');
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
        if(this.equationListInst.panelContainer.querySelectorAll('input.eqnCheckBox:checked').length){
            this.equationListInst.panelContainer.querySelector('.citeEqnwrapper').style.display = 'block';
            this.equationListInst.panelContainer.querySelector('.uncitedEqnWrapper').style.display = 'none';
        }
        else{
           this.equationListInst.panelContainer.querySelector('.uncitedEqnWrapper').style.display = 'block'; 
           this.equationListInst.panelContainer.querySelector('.citeEqnwrapper').style.display = 'none'; 
        }
    }

    function citeSelected(){
        var citeHtml,id,content, multiple=false;
        var selectedCheckBox = document.querySelectorAll('input.eqnCheckBox:checked');
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
                    citeText = singleElement.parentNode.parentNode.querySelector('.eqnLabel').innerText;
                content.push(citeText);
            });
        } else {
            selectedCheckBox.forEach(function(singleElement){
                var citeText = '';
                id = singleElement.parentNode.parentNode.getAttribute('data-id');
                if(singleElement.parentNode.parentNode.getAttribute('data-cite-text'))
                    citeText = singleElement.parentNode.parentNode.getAttribute('data-cite-text');
                else
                    citeText = singleElement.parentNode.parentNode.querySelector('.eqnLabel').innerText;
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
                paretNode.find('.eqnCitationList li:not(:first-child)').remove();
                getCitationCount(paretNode[0].querySelector('.equationlistWrapper').getAttribute('data-id'), paretNode[0]);
            });
    }

    var EditCitationNode;
    function editEqnCiteClick(event){
        this.doc.querySelector('.editCitationEquation').style.display = 'block';
        EditCitationNode = event.target.parentNode;
    }

    function eqnDelete(event){
        var id = event.target.parentNode.getAttribute('data-id');
        document.getElementById(id).className = 'editeue-active';
        $(event.target).parents('.eqnListItem').remove();
    }
    function updateCitationText(){
        var textValue = document.querySelector('.editCitationEquation .citationText').value;
        if(EditCitationNode){
            EditCitationNode.setAttribute('data-cite-text',textValue);
        }
        document.querySelector('.editCitationEquation').style.display = 'none';
    }

    function filterunCited(){
        var unCitedButton = document.querySelector('.uncitedEqnBtn');
        if(document.querySelector('.uncitedEqnBtn').className.includes('hideUnCited')){
            var referencefilteredList = document.querySelectorAll('.eqnListItem.unciteFig');
            referencefilteredList.forEach(function(singleFilteredList, index){
                singleFilteredList.classList.remove('unciteReference');
            });
            unCitedButton.classList.remove('hideUnCited');
            unCitedButton.classList.remove('active');
            unCitedButton.innerHTML = '';
            unCitedButton.innerHTML = 'Show Uncited';
        } else {
          var citedReferences1 = document.querySelectorAll('.ce_cross-ref');
			var citedReferences2 = document.querySelectorAll('.ce_cross-refs');
			var citedReference = [];
			citedReferences1.forEach(function(singleValue,i){
				citedReference.push(singleValue);
			});
			citedReferences2.forEach(function(singleValue,i){
				citedReference.push(singleValue);
			});
            var citedReferenceTitle = [];
            citedReference.forEach(function(singleCiteReference, index){
                citedReferenceTitle.push(singleCiteReference.getAttribute('title'));
            });
            var citedArrayId = citedReferenceTitle.filter(function(item, pos) {
                return citedReferenceTitle.indexOf(item) == pos && item.startsWith("fd");
            });
            var referenceList = document.querySelectorAll('.eqnListItem');
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

    function OtherEquation(win, doc, localeData, cont) {
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

    OtherEquation.prototype.load = function load(parentContainer) {
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
        this.equationListInst.panelContainer.querySelector('ul').classList.add('eqn-ul');
        var tempNode = this.doc.createElement('div');
        tempNode.innerHTML = buttonTemplate.join('');
		tempNode.className = 'foot-btn-wrapper';
        this.equationListInst.panelContainer.querySelector('.list-panel').appendChild(tempNode);
        this.citatioNumClick = citatioNumClick.bind(this);
        this.citatioDelClick = citatioDelClick.bind(this);
        this.checkboxClick = checkboxClick.bind(this);
        this.editEqnCiteClick = editEqnCiteClick.bind(this);
        this.eqnDelete = eqnDelete.bind(this);
        this.filterunCited = filterunCited.bind(this);
        this.removeEmptyListPanel();
        var self = this
        this.equationListInst.panelContainer.querySelectorAll('.eqnCitationCountNum').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioNumClick, false)
        });
        this.equationListInst.panelContainer.querySelectorAll('.citationDel').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioDelClick, false)
        });
        this.equationListInst.panelContainer.querySelectorAll('.eqnCheckBox').forEach(function(singleElement){
            singleElement.addEventListener('click', self.checkboxClick, false)
        });
        this.equationListInst.panelContainer.querySelectorAll('.editEqnCiteClick').forEach(function(singleElement){
            singleElement.addEventListener('click', self.editEqnCiteClick, false)
        });
        this.equationListInst.panelContainer.querySelectorAll('.eqnDelete').forEach(function(singleElement){
            singleElement.addEventListener('click', self.eqnDelete, false)
        });
        this.doc.querySelector('.editCitationEquation .cancelCitation').addEventListener('click', function(){
            self.doc.querySelector('.editCitationEquation').style.display = 'none';
        }, false);
        this.equationListInst.panelContainer.querySelector('.uncitedEqnBtn').addEventListener('click', this.filterunCited, false);
        this.doc.querySelector('.editCitationEquation .updateCitation').addEventListener('click', updateCitationText, false);
        this.doc.querySelector('.citeEqn').addEventListener('click', citeSelected, false);
        this.doc.querySelector('.citeEqnClose').addEventListener('click', function(){
            self.equationListInst.panelContainer.querySelectorAll('input.eqnCheckBox').forEach(function(singleElement){
                singleElement.checked = false;
            });
            self.equationListInst.panelContainer.querySelector('.citeEqnwrapper').style.display = 'none';
        }, false);
        this.equationListInst.panelContainer.querySelector('.panel-header').style.display = 'none';
        this.setVisitedItemReload(this.visitedTableIds);
    };

    OtherEquation.prototype.removeEmptyListPanel = function removeEmptyListPanel() {
        var container = this.container,
            equationElem = container.querySelector('.equation_list');

        if (equationCount === 0) {
            this.equationListInst.destroy();
            equationElem.parentNode.removeChild(equationElem);
        }
    };

    OtherEquation.prototype.createListPanel = function createListPanel(
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
        listPanel.onNodeClick(function onNodeClick(data, target){
            onListClick(data, target);
        });
        listPanel.onNodeEnterClick(function onNodeEnterKeyClick(data) {
            instance.addVisitedTableIdToArray(data);
            EventBus.publish('OtherEquation:onNodeClick', data);
        });

        return listPanel;
    };

    OtherEquation.prototype.addVisitedTableIdToArray = function
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

    OtherEquation.prototype.setVisitedItemReload = function setVisitedItemReload(visitedTableIds) {
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

    OtherEquation.prototype.destroy = function destroy() {
        var container = this.container,
            equationElem = container.querySelector('.equation_list');

        this.equationListInst.destroy();
        if (Helper.isNull(equationElem) === false) {
            equationElem.parentNode.removeChild(equationElem);
        }
        initializeVariables(this);
    };

    return OtherEquation;
});

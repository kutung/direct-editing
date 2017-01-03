define(['scripts/ListPanel', 'customer/Config', 'scripts/Util',
       'scripts/Helper', 'scripts/EventBus'], function OtherCitationFigureLoader(
    ListPanel, CustomerConfig, Util, Helper, EventBus) {
    'use strict';

    var figureCount,
        tableCount,
        figureListTemplate = [
            '<div class="figure_list quicklink_list_panel"></div>'
        ],
        figTemplate = [
        '<div class="comman-othercitation-wrapper">',
             '<div class="citation-listcheck figlistWrapper">',
              '<span class="ref-add editFigCiteClick"></span>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
              '<div class="checklist-para">',
               '<input type="checkbox" class="figCheckBox">',
               '<label for="cite">',
                '<i class="cite-fig-title figLabel"></i>',
                '<span class="citation-fig-wrapper figInnerWrapper">',
                 '<span class="citation-fig-table">',
                  '<span class="citation-fig-tablecell">',
                   '<span class="citation-fig-tableinner figContent">',
                   '</span>',
                  '</span>',
                 '</span>',
                '</span>',
               '</label>',
              '</div>',
              '<div class="cite-fig-content-wrapper">',
               '<div class="cite-fig-content figCaption">',
               '</div>',
               '<div class="citation-count-listsplit">',
                '<ul class="figCitationList">',
                 '<li class="figCitationCountNode" style="display:none">',
                  '<span class="figCitationCountNum">0</span>',
                  '<span class="citation-kill citationDel"></span>',
                '</ul>',
               '</div>',
              '</div>',
             '</div>',
            '</div>'
            ],
            buttonTemplate = [
        '<div class="references-view-btn citeFigwrapper" style="display:none">',
            '<button class="cite-close-icon citeFigureClose"></button>',
            '<button class="cite-btn-full citeFigure">Cite</button>',
        '</div>',
        '<div class="othercitation-view-uncitedwrapper uncitedFigWrapper">',
            '<span class="othercitation-view-uncited uncitedFigBtn">View Uncited</span>',
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
        // var citeList = tmpNode.querySelector('.figCitationCountNode').cloneNode(true);
        if(document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.figCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.figCitationCountNum').innerHTML = '';
                citeList.querySelector('.figCitationCountNum').innerHTML = ++citeCount;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.figCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.figCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
        if(document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.figCitationCountNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.figCitationCountNum').innerHTML = '';
                citeList.querySelector('.figCitationCountNum').innerHTML = ++citeCount;
                // citeList.id = singleElement.id;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.figCitationList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.figCitationCountNum').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
    }

    function addFigure(panel, node) {
        var imageNode, imageLabelNode, label, tmpNode, imgId,
            imageCloneNode, nodeValue, imageCaptionNode;

        imageNode = node.querySelector('img');
        imageLabelNode = node.querySelector(labelSelector);
        imageCaptionNode = node.querySelector(captionSelector);
        if (Helper.isNull(imageNode) === true || Helper.isNull(imageLabelNode) === true) {
            return;
        }
        imgId = node.id;
        imageCloneNode = imageNode.cloneNode(true);
        tmpNode = document.createElement('div');

        tmpNode.innerHTML = figTemplate.join('');
        tmpNode.querySelector('.figlistWrapper').setAttribute('data-id',imgId);
        tmpNode.querySelector('.figContent').innerHTML = imageCloneNode.outerHTML;
        tmpNode.querySelectorAll('.figLabel').forEach(function(singleElement, index){
            singleElement.innerHTML = imageLabelNode.innerText;
        });
        tmpNode.querySelector('.figCaption').innerHTML = imageCaptionNode.innerText;

        getCitationCount(imgId, tmpNode);
        label = tmpNode.innerHTML;
        // nodeValue = getNodeValue(imageNode);
        nodeValue = imgId;
        panel.add(
            label, {'sectionId': nodeValue} 
        );
        figureCount += 1;
    }

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.container = null;
        instance.quickLinkSelectors = null;
        instance.figureListInst = null;
        figureCount = 0;
        tableCount = 0;
    }

    function onListClick(dataId, target){
        if(event.target.type == "checkbox")
            return;
        if(target.classList.contains('figListItem')){
            if(!target.querySelector('.figlistWrapper').classList.contains('active')){
               target.parentNode.querySelectorAll('.figlistWrapper').forEach(function(singleElement){
                singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.figInnerWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
                target.querySelector('.figlistWrapper').classList.add('active');
                target.querySelector('.figInnerWrapper').classList.add('active'); 
                $(target).find('.figCitationList li').removeClass('active');
            } else {
                target.parentNode.querySelectorAll('.figlistWrapper').forEach(function(singleElement){
                singleElement.classList.remove('active');
                });
                target.parentNode.querySelectorAll('.figInnerWrapper').forEach(function(singleElement){
                    singleElement.classList.remove('active');
                });
            }
        }
    }

    function citatioNumClick(event){
        $(event.target).parents('.figCitationList').find('li').removeClass('active');
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
        if(this.figureListInst.panelContainer.querySelectorAll('input.figCheckBox:checked').length){
            this.figureListInst.panelContainer.querySelector('.citeFigwrapper').style.display = 'block';
            this.figureListInst.panelContainer.querySelector('.uncitedFigWrapper').style.display = 'none';
        }
        else{
           this.figureListInst.panelContainer.querySelector('.uncitedFigWrapper').style.display = 'block'; 
           this.figureListInst.panelContainer.querySelector('.citeFigwrapper').style.display = 'none'; 
        }
    }

    function citeSelected(){
        var citeHtml,id,content, multiple=false;
        var selectedCheckBox = document.querySelectorAll('input.figCheckBox:checked');
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
                    citeText = singleElement.parentNode.parentNode.querySelector('.figLabel').innerText;
                content.push(citeText);
            });
        } else {
            selectedCheckBox.forEach(function(singleElement){
                var citeText = '';
                id = singleElement.parentNode.parentNode.getAttribute('data-id');
                if(singleElement.parentNode.parentNode.getAttribute('data-cite-text'))
                    citeText = singleElement.parentNode.parentNode.getAttribute('data-cite-text');
                else
                    citeText = singleElement.parentNode.parentNode.querySelector('.figLabel').innerText;
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
                paretNode.find('.figCitationList li:not(:first-child)').remove();
                getCitationCount(paretNode[0].querySelector('.figlistWrapper').getAttribute('data-id'), paretNode[0]);
            });

    }

    var EditCitationNode;
    function editEqnCiteClick(event){
        this.doc.querySelector('.editCitationFigure').style.display = 'block';
        EditCitationNode = event.target.parentNode;
    }

    function updateCitationText(){
        var textValue = document.querySelector('.editCitationFigure .citationText').value;
        if(EditCitationNode){
            EditCitationNode.setAttribute('data-cite-text',textValue);
        }
        document.querySelector('.editCitationFigure').style.display = 'none';
    }

    function filterunCited(){
        var unCitedButton = document.querySelector('.uncitedFigBtn');
        if(document.querySelector('.uncitedFigBtn').className.includes('hideUnCited')){
            var referencefilteredList = document.querySelectorAll('.figListItem.unciteFig');
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
                return citedReferenceTitle.indexOf(item) == pos && item.startsWith("fig") || citedReferenceTitle.indexOf(item) == pos && item.startsWith("sch");
            });
            var referenceList = document.querySelectorAll('.figListItem');
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
    function OtherCitationFigure(win, doc, localeData, cont) {
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

    OtherCitationFigure.prototype.load = function load(parentContainer) {
        var figureListInst, tableListInst,
            nodes, nodesLength, nodeClass,
            i = 0, win = this.win,
            figureClass = Util.selectorToClass('figure'),
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

        for (; i < nodesLength; i += 1) {
            nodeClass = nodes[i].classList;
            if (nodeClass.contains(figureClass) === true) {
                addFigure(figureListInst, nodes[i]);
            }
        }

        this.figureListInst = figureListInst;
        this.figureListInst.panelContainer.querySelector('ul').classList.add('fig-ul');
        var tempNode = this.doc.createElement('div');
        tempNode.innerHTML = buttonTemplate.join('');
		tempNode.className = 'foot-btn-wrapper';
        this.figureListInst.panelContainer.querySelector('.list-panel').appendChild(tempNode);
        this.figureListInst.panelContent.querySelectorAll('li[tabindex="0"]').forEach(function(singleElement){
            singleElement.classList.add('figListItem');
        });
        this.removeEmptyListPanel();
        this.citatioNumClick = citatioNumClick.bind(this);
        this.citatioDelClick = citatioDelClick.bind(this);
        this.checkboxClick = checkboxClick.bind(this);
        this.editEqnCiteClick = editEqnCiteClick.bind(this);
        this.filterunCited = filterunCited.bind(this);
        var self = this;
        this.figureListInst.panelContainer.querySelectorAll('.figCitationCountNum').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioNumClick, false)
        });
        this.figureListInst.panelContainer.querySelectorAll('.citationDel').forEach(function(singleElement){
            singleElement.addEventListener('click', self.citatioDelClick, false)
        });
        this.figureListInst.panelContainer.querySelectorAll('.figCheckBox').forEach(function(singleElement){
            singleElement.addEventListener('click', self.checkboxClick, false)
        });
        this.figureListInst.panelContainer.querySelectorAll('.editFigCiteClick').forEach(function(singleElement){
            singleElement.addEventListener('click', self.editEqnCiteClick, false)
        });
        this.doc.querySelector('.editCitationFigure .cancelCitation').addEventListener('click', function(){
            self.doc.querySelector('.editCitationFigure').style.display = 'none';
        }, false);
        this.figureListInst.panelContainer.querySelector('.uncitedFigBtn').addEventListener('click', this.filterunCited, false);
        this.doc.querySelector('.editCitationFigure .updateCitation').addEventListener('click', updateCitationText, false);
        this.doc.querySelector('.citeFigure').addEventListener('click', citeSelected, false);
        this.doc.querySelector('.citeFigureClose').addEventListener('click', function(){
            self.figureListInst.panelContainer.querySelectorAll('input.figCheckBox').forEach(function(singleElement){
                singleElement.checked = false;
            });
            self.figureListInst.panelContainer.querySelector('.citeFigwrapper').style.display = 'none';
        }, false);
        this.figureListInst.panelContainer.querySelector('.panel-header').style.display = 'none';
    };

    OtherCitationFigure.prototype.removeEmptyListPanel = function removeEmptyListPanel() {
        var container = this.container,
            figureElem = container.querySelector('.figure_list');

        if (figureCount === 0) {
            this.figureListInst.destroy();
            figureElem.parentNode.removeChild(figureElem);
        }
    };

    OtherCitationFigure.prototype.createListPanel = function createListPanel(
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


    OtherCitationFigure.prototype.destroy = function destroy() {
        var container = this.container,
            figureElem = container.querySelector('.figure_list');

        this.figureListInst.destroy();
        if (Helper.isNull(figureElem) === false) {
            figureElem.parentNode.removeChild(figureElem);
        }
        initializeVariables(this);
    };

    return OtherCitationFigure;
});

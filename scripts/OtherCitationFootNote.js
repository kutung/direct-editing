define([
    'scripts/Helper', 'scripts/Panel', 'scripts/RichTextEditor'
], function FootNoteLoader(Helper, Panel, RTE) {
    var fnPanelTemplate = [
        '<div><div class="references-listitem foot-note-splited-wrapper" style="height:400px">',
        '<div class="other-citation-footnote-wrapper">',    
		'<div class="titleFNs">',
            '<label class="foot-notes-header">Article Title</label>',
            '<div class="titleFNFullList"><div class="references-list-detail titleFNList clone" style="display:none"  draggable="true" ondragenter="dragenterfn(event)" ondragstart="dragstartfn(event)">',
            '<input type="checkbox" class="fnCb">',
                '<div class="reference-author-div">',
                    '<div class="ref-detail-view">',
                        '<i class="foot-note-count fnLabel">[0]</i>',
                        '<p class="fnTitlefullText"></p>',
                        '<span class="ref-add fnedit"></span>',
                        '<span class="ref-delete fndelete"></span>',
                        '<div class="citation-count-listsplit footnote-annotaion">',
                            '<ul class="fnTitleCiteList citeList">',
                                '<li class="fnTitleCiteNode clone citeNode" style="display:none">',
                                    '<span class="fnTitleCiteCount citeCount">0</span>',
                                    '<span class="citation-kill citeKill"></span>',
                                '</li>',
                            '</ul>',
                        '</div>',
                    '</div>',
                '</div>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
            '</div></div></div>',
            '<div class="textFNs"><label class="foot-notes-header">Text</label>',
            '<div class="textFNFullList"><div class="references-list-detail textFNList clone" style="display:none"  draggable="true" ondragenter="dragenterfn(event)" ondragstart="dragstartfn(event)">',
            '<input type="checkbox" class="fnCb">',
                '<div class="reference-author-div">',
                    '<div class="ref-detail-view">',
                        '<i class="foot-note-count fnLabel">[0]</i>',
                        '<p class="fnTextFullText"></p>',
                        '<span class="ref-add fnedit"></span>',
                        '<span class="ref-delete fndelete"></span>',
                        '<div class="citation-count-listsplit footnote-annotaion">',
                            '<ul class="fnTextCiteList citeList">',
                                '<li class="fnTextCiteNode clone citeNode" style="display:none">',
                                    '<span class="fnTextCiteCount citeCount">0</span>',
                                    '<span class="citation-kill citeKill"></span>',
                                '</li>',
                            '</ul>',
                        '</div>',
                    '</div>',
                '</div>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
            '</div></div></div>',
            '<div class="tableFNs"><label class="foot-notes-header">Table</label>',
            '<div class="tableFNFullList"><div class="references-list-detail tableFNList clone" style="display:none"  draggable="true" ondragenter="dragenterfn(event)" ondragstart="dragstartfn(event)">',
            '<input type="checkbox" class="fnCb">',
                '<div class="reference-author-div">',
                    '<div class="ref-detail-view">',
                        '<i class="foot-note-count fnLabel">[0]</i>',
                        '<p class="fnTableFullText"></p>',
                        '<span class="ref-add fnedit"></span>',
                        '<span class="ref-delete fndelete"></span>',
                        '<div class="citation-count-listsplit footnote-annotaion">',
                            '<ul class="fnTableCiteList citeList">',
                                '<li class="fnTableCiteNode clone citeNode" style="display:none">',
                                    '<span class="fnTableCiteCount citeCount">0</span>',
                                    '<span class="citation-kill citeKill"></span>',
                                '</li>',
                            '</ul>',
                        '</div>',
                    '</div>',
                '</div>',
                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
            '</div></div></div>',
			'</div>',
            '<div class="references-view-btn">',
                '<button class="addFootNote" style="display:none !important;">Add Footnotes</button>',
                '<button class="viewunCitedFootNote" style="width:100%;">View Uncited</button>',
                '<button class="cite-close-icon fnCheckClose" style="display:none"></button>',
                '<button class="cite-btn-full fnCite" style="display:none">Cite</button>',
            '</div>',
        '</div></div>'
        ],
        fnEditTemplate = [
            '<div>',
                '<div class="author-edit-wrapper affiliation-edit-wrapper adding-all-category">',
                    '<div class="authorgroup-header">',
                        '<div class="authorgroup-title"><p>Editing Footnotes</p></div>',
                    '</div>',
                
                    '<div class="author-edit-list">',
                        '<ul>',
                            '<li>',
                                '<label>Enter Foot Note</label>',
                                '<div class="author-footer-note-textarea">',
                                    '<div class="footnote-richtextbox" style="display:none"></div>',
									'<div class="link-icon-wrapper">',
										'<span class="link-icon linkIcon"></span>',
									'</div>',
                                    '<div class="footNoteRTE"></div>',
                                    '<div class="url-wrapper urlWrapper" style="display:none">',
                                        '<div class="url-header">',
                                            '<span class="url-header-text urlTypeContent">URL</span>',
                                            '<div class="url-dropdown urlDropDown">',
                                                '<span class="urlDDValue">Email</span>',
                                            '</div>',
                                        '</div>',
                                        '<div class="urltext-box urlTextBoxWrapper" style="display:none">',
                                            '<input type="text" placeholder="Enter / Paste URL" class="urlTextBox">',
                                            '<span class="url-validater urlValidater"></span>',
                                        '</div>',
                                    '</div>',
                                    '<textarea class="edit-textarea" placeholder="Enter Foot Note" style="display:none"></textarea>',			
                                '</div>',
                            '</li>',
                        '</ul>',
                    '</div>',
                    '<div class="author-edit-list choose-list-wrapper">',
                        '<ul>',
                            '<li>',
                                '<label>Footnote type<sup class="foot-note-superscript">*</sup></label>',
                                '<div class="choose-font-dropdown-wrapper">',
                                    '<span class="choose-text footNoteType">-Select-</span>',
                                    '<div class="choose-font-dropdown footNoteTypeDropDown" style="display: none">',
                                        '<span class="sntTitle">Title</span>',
                                        '<span class="sntText">Text</span>',
                                        '<span class="sntTable">Table</span>',
                                    '</div>',
                                '</div>',
                            '</li>',
                            '<li class="fnCategoryList" style="display: none">',
                                '<label>Choose Category</label>',
                                '<div class="choose-font-dropdown-wrapper">',
                                    '<span class="choose-font-text footNoteCategory">-Select-</span>',
                                    '<div class="choose-font-dropdown footNoteCategoryDropDown" style="display: none">',
                                        '<span>Category1</span>',
                                        '<span>Category2</span>',
                                        '<span>Category3</span>',
                                    '</div>',
                                '</div>',
                            '</li> ',
                        '</ul>',
                    '</div>',
                    '<div class="authorgroup-footer-btn">',
                        '<span class="new-author fnAdd">Add</span>',
                        '<span class="new-affiliation fnCancel">Cancel</span>',
                    '</div> '                                                                                                                             ,
                '</div>',
           '</div>'
        ],
        notifyAlertTemplate = [
            '<div>',
           '</div>'
        ],
        cssRules = {

        }, edit = false;

    function setTopPosition(instance) {
        var filterStyle;
        if (instance.enableCategoryFilter === true) {
            filterStyle = getComputedStyle(instance.filterElement);
            instance.container.parentNode.style.paddingTop = filterStyle.height;
        }
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true
        });
    }

    function clearRTE() {
        this.rte.clear();
    }

    function setRTEContent(className, value){
        var xiframe = document.querySelector('.'+className).querySelector('iframe');
        var insideContent = (xiframe.contentWindow || xiframe.contentDocument);
        if (insideContent.document)insideContent = insideContent.document;
        $(insideContent).find('body').focus();
        insideContent.body.innerHTML = value;
    }

    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.newContainer = null;
        instance.rte = {};
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.clearRTE = {};
        instance.isEnabled = false;
        instance.panel = null;
        instance.insertCommand = null;
        instance.hasChange = false;
        instance.content = null;
        // instance.onLabelClick = null;
        instance.stylesheetId = 'footnotePanel-style';
        instance.styleSheet = null;
    }

    function addFootNote(){
        if(!$('.cursor').length){
			alert('Select a place/ place the cursor, to add Footnotes');
			return;
		}
        this.htmlDoc.querySelector('.editFootNotesWrapper').style.display = 'block';
        edit = false;
        var parentNodeWrapper = this.editWrapper;
        if($('.cursor').parents('.tablecaption').length)
            parentNodeWrapper.querySelector('.footNoteType').innerHTML = 'Table';
		parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'none';
        if($('.cursor').parents('.ce_title').length)
            parentNodeWrapper.querySelector('.footNoteType').innerHTML = 'Title';
		parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'none';
        if(!$('.cursor').parents('.tablecaption').length && !$('.cursor').parents('.ce_title').length ){
            parentNodeWrapper.querySelector('.footNoteType').innerHTML = 'Text';
            parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'block';
        }
        /*if(selectedFNtype == 'Text'){
            parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'block';
        } else {
            parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'none';
        }*/
    }

    function footNoteType(){
        var node = this.editWrapper.querySelector('.footNoteTypeDropDown');
        if(node.style.display == 'none')
            node.style.display = 'block';
        else
            node.style.display = 'none';
    }

    function selectFootNoteType(event){
        var selectedFNtype = event.target.innerHTML;
        var parentNodeWrapper = this.editWrapper;
        parentNodeWrapper.querySelector('.footNoteType') .innerHTML = selectedFNtype;
        parentNodeWrapper.querySelector('.footNoteTypeDropDown').style.display = 'none';
        if(selectedFNtype == 'Text'){
            parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'block';
        } else {
            parentNodeWrapper.querySelector('.fnCategoryList').style.display = 'none';
        }
    }

    function footNoteCategory(){
        var node = this.editWrapper.querySelector('.footNoteCategoryDropDown');
        if(node.style.display == 'none')
            node.style.display = 'block';
        else
            node.style.display = 'none';
    }

    function fNCategoryDropDown(event){
        var selectedFNtype = event.target.innerHTML;
        var parentNodeWrapper = this.editWrapper;
        parentNodeWrapper.querySelector('.footNoteCategory').innerHTML = selectedFNtype;
        parentNodeWrapper.querySelector('.footNoteCategoryDropDown').style.display = 'none';
    }

    function fnAdd(event){
        var parentNodeWrapper = this.editWrapper;
        var fnWrapper = this.tempWrapper;
        var fNContent = getRTEData(this),
            fNtype = parentNodeWrapper.querySelector('.footNoteType').innerHTML,
            fnCategory, countValue = 1, uniqueId=Date.now();
        if(!edit){
            $('.editFootNotesWrapper .authorgroup-title p').html('Adding Footnotes');
            addfnfn(this, parentNodeWrapper, fnWrapper, fNContent, fNtype, fnCategory, countValue, uniqueId);
        } else {
            $('.editFootNotesWrapper .authorgroup-title p').html('Editing Footnotes');
            editfnfn(this, parentNodeWrapper, fnWrapper, fNContent, fNtype, fnCategory, countValue, uniqueId);
        }
        this.htmlDoc.querySelector('.editFootNotesWrapper').style.display = 'none';
        cleanValues(this);
    }

    function editfnfn(self, parentNodeWrapper, fnWrapper, fNContent, fNtype, fnCategory, countValue, uniqueId){
        var currentId = parentNodeWrapper.querySelector('.footNoteType').getAttribute('data-id');
        var oldfNType = document.getElementById(currentId).getAttribute('data-type');
        if(oldfNType == fNtype){
            $('p[data-id="'+currentId+'"]').addClass('text-strikethrough');
            if(fNtype == 'Text'){
                fnCategory = parentNodeWrapper.querySelector('.footNoteCategory').innerHTML;
                var tmpValue = document.getElementById(currentId);
                tmpValue.querySelector('.fnTextFullText').innerHTML = fNContent;
                tmpValue.setAttribute('data-category', fnCategory);
                var nodesa = $('p[data-id="'+currentId+'"]').clone();
                nodesa.removeClass('text-strikethrough');
                var articleNote = tmpValue.cloneNode(true);
                articleNote.querySelector('.footnote-annotaion').outerHTML = '';
                articleNote.querySelector('.fndelete').outerHTML = '';
                articleNote.querySelector('.fnedit').outerHTML = '';
                nodesa.html(articleNote.innerText);
                nodesa.insertAfter($('p[data-id="'+currentId+'"]'));
            } else if(fNtype == 'Title'){
                var tmpValue = document.getElementById(currentId);
                tmpValue.querySelector('.fnTitlefullText').innerHTML = fNContent;
                var nodesa = $('p[data-id="'+currentId+'"]').clone();
                nodesa.removeClass('text-strikethrough');
                var articleNote = tmpValue.cloneNode(true);
                articleNote.querySelector('.footnote-annotaion').outerHTML = '';
                articleNote.querySelector('.fndelete').outerHTML = '';
                articleNote.querySelector('.fnedit').outerHTML = '';
                nodesa.html(articleNote.innerText);
                nodesa.insertAfter($('p[data-id="'+currentId+'"]'));
            } else if(fNtype == 'Table'){
                var tmpValue = document.getElementById(currentId);
                tmpValue.querySelector('.fnTableFullText').innerHTML = fNContent;
                var nodesa = $('p[data-id="'+currentId+'"]').clone();
                nodesa.removeClass('text-strikethrough');
                var articleNote = tmpValue.cloneNode(true);
                articleNote.querySelector('.footnote-annotaion').outerHTML = '';
                articleNote.querySelector('.fndelete').outerHTML = '';
                articleNote.querySelector('.fnedit').outerHTML = '';
                nodesa.html(articleNote.innerText);
                nodesa.insertAfter($('p[data-id="'+currentId+'"]'));;
            }
        } else {
            var tmpValue = document.getElementById(currentId);
            tmpValue.outerHTML = '';
            $('p[data-id="'+currentId+'"]').addClass('text-strikethrough');
            addfnfn(self, parentNodeWrapper, fnWrapper, fNContent, fNtype, fnCategory, countValue, currentId);
        }
        
    }

    function addfnfn(self, parentNodeWrapper, fnWrapper, fNContent, fNtype, fnCategory, countValue, uniqueId){
        if(fNtype == 'Text'){
            fnCategory = parentNodeWrapper.querySelector('.footNoteCategory').innerHTML;
            var tmpValue = fnWrapper.querySelector('.textFNs .textFNList.clone').cloneNode(true);
            fnWrapper.querySelector('.textFNs').querySelectorAll('.textFNList .fnLabel').forEach(function(singleElement){
                var currentValue = parseInt(singleElement.innerHTML.replace(/[\[\]]+/g, ""));
                if(countValue <= currentValue){
                   countValue = currentValue+1;
                }
            });
            tmpValue.querySelector('.fnLabel').innerHTML = '['+countValue+']';
            tmpValue.querySelector('.fnTextFullText').innerHTML = fNContent;
            tmpValue.id = uniqueId;
            tmpValue.classList.remove('clone');
            tmpValue.style.display = 'block';
            tmpValue.setAttribute('data-category', fnCategory);
            tmpValue.setAttribute('data-type', fNtype);
            tmpValue.addEventListener('click', self.liSelect, false);
            tmpValue.querySelector('.fnedit').addEventListener('click', self.fnedit, false);
            tmpValue.querySelector('.fndelete').addEventListener('click', self.fndelete, false);
            tmpValue.querySelector('.fnCb').addEventListener('click', self.checkboxClick, false);
            fnWrapper.querySelector('.textFNFullList').appendChild(tmpValue);
            var articleNote = tmpValue.cloneNode(true);
            articleNote.querySelector('.footnote-annotaion').outerHTML = '';
            articleNote.querySelector('.fndelete').outerHTML = '';
            articleNote.querySelector('.fnedit').outerHTML = '';
            var element = document.createElement('div');
            element.innerHTML = '<p class="article-footnote-content fnContentValue" data-id="'+articleNote.id+'">'+articleNote.innerText+'</p>';
            document.querySelector('.textFNEditor').appendChild(element.firstChild);
            document.querySelector('.article-footnote-wrapper .textFNEditor').style.display = 'block';
            onCite([uniqueId], ['['+countValue+']'], [fNtype]);
        } else if(fNtype == 'Title'){
            var tmpValue = fnWrapper.querySelector('.titleFNs .titleFNList.clone').cloneNode(true);
            fnWrapper.querySelector('.titleFNs').querySelectorAll('.titleFNList .fnLabel').forEach(function(singleElement){
                var currentValue = parseInt(singleElement.innerHTML.replace(/[\[\]]+/g, ""));
                if(countValue <= currentValue){
                   countValue = currentValue+1;
                }
            });
            tmpValue.querySelector('.fnLabel').innerHTML = '['+countValue+']';
            tmpValue.querySelector('.fnTitlefullText').innerHTML = fNContent;
            tmpValue.id = uniqueId;
            tmpValue.classList.remove('clone');
            tmpValue.style.display = 'block';
            tmpValue.setAttribute('data-type', fNtype);
            tmpValue.addEventListener('click', self.liSelect, false);
            tmpValue.querySelector('.fnedit').addEventListener('click', self.fnedit, false);
            tmpValue.querySelector('.fndelete').addEventListener('click', self.fndelete, false);
            tmpValue.querySelector('.fnCb').addEventListener('click', self.checkboxClick, false);
            fnWrapper.querySelector('.titleFNFullList').appendChild(tmpValue);
            var articleNote = tmpValue.cloneNode(true);
            articleNote.querySelector('.footnote-annotaion').outerHTML = '';
            articleNote.querySelector('.fndelete').outerHTML = '';
            articleNote.querySelector('.fnedit').outerHTML = '';
            var element = document.createElement('div');
            element.innerHTML = '<p class="article-footnote-content fnContentValue" data-id="'+articleNote.id+'">'+articleNote.innerText+'</p>';
            document.querySelector('.titleFNEditor').appendChild(element.firstChild);
            document.querySelector('.article-footnote-wrapper .titleFNEditor').style.display = 'block';
            onCite([uniqueId], ['['+countValue+']'], [fNtype]);
        } else if(fNtype == 'Table'){
            var tmpValue = fnWrapper.querySelector('.tableFNs .tableFNList.clone').cloneNode(true);
            fnWrapper.querySelector('.tableFNs').querySelectorAll('.tableFNList .fnLabel').forEach(function(singleElement){
                var currentValue = parseInt(singleElement.innerHTML.replace(/[\[\]]+/g, ""));
                if(countValue <= currentValue){
                   countValue = currentValue+1;
                }
            });
            tmpValue.querySelector('.fnLabel').innerHTML = '['+countValue+']';
            tmpValue.querySelector('.fnTableFullText').innerHTML = fNContent;
            tmpValue.id = uniqueId;
            tmpValue.classList.remove('clone');
            tmpValue.style.display = 'block';
            tmpValue.setAttribute('data-type', fNtype);
            tmpValue.addEventListener('click', self.liSelect, false);
            tmpValue.querySelector('.fnedit').addEventListener('click', self.fnedit, false);
            tmpValue.querySelector('.fndelete').addEventListener('click', self.fndelete, false);
            tmpValue.querySelector('.fnCb').addEventListener('click', self.checkboxClick, false);
            fnWrapper.querySelector('.tableFNFullList').appendChild(tmpValue);
            var articleNote = tmpValue.cloneNode(true);
            articleNote.querySelector('.footnote-annotaion').outerHTML = '';
            articleNote.querySelector('.fndelete').outerHTML = '';
            articleNote.querySelector('.fnedit').outerHTML = '';
            var element = document.createElement('div');
            element.innerHTML = '<p class="article-footnote-content fnContentValue" data-id="'+articleNote.id+'">'+articleNote.innerText+'</p>';
            document.querySelector('.tableFNEditor').appendChild(element.firstChild);
            document.querySelector('.article-footnote-wrapper .tableFNEditor').style.display = 'block';
            onCite([uniqueId], ['['+countValue+']'], [fNtype]);
        }
        document.querySelector('.article-footnote-wrapper').style.display = 'block';
    }

    function cleanValues(self){
        self.editWrapper.querySelector('.fnCategoryList').style.display = 'none';
        self.editWrapper.querySelector('.footNoteCategory').innerHTML = '-Select-';
        self.editWrapper.querySelector('.footNoteType').innerHTML = '-Select-';
        setRTEContent('footNoteRTE', '');
    }

    function liSelect(event){
        if(event.target.classList.contains('fnedit') || event.target.classList.contains('fndelete') || event.target.classList.contains('citeCount') || event.target.classList.contains('citeKill')){
            return;
        }
        if(event.currentTarget.classList.contains('active')){
            event.currentTarget.classList.remove('active');
            event.currentTarget.querySelector('.arrowBtn').classList.remove('less');
            event.currentTarget.querySelector('.arrowBtn').classList.add('more');
        } else {
            this.tempWrapper.querySelectorAll('.references-list-detail').forEach(function(singleElement){
                singleElement.classList.remove('active');
                singleElement.querySelector('.arrowBtn').classList.remove('less');
                singleElement.querySelector('.arrowBtn').classList.add('more');
            });
            event.currentTarget.classList.add('active');
            event.currentTarget.querySelector('.arrowBtn').classList.remove('more');
            event.currentTarget.querySelector('.arrowBtn').classList.add('less');
            $(event.currentTarget).find('ul li').removeClass('active');
        }
    }

    function fnedit(event){
        edit = true;
        var editNode = $(event.target).parents('.references-list-detail')[0];
        this.htmlDoc.querySelector('.editFootNotesWrapper').style.display = 'block';
        if(editNode.classList.contains('titleFNList')){
            this.editWrapper.querySelector('.footNoteType').setAttribute('data-id',editNode.id);
            this.editWrapper.querySelector('.footNoteType').innerHTML = 'Title';
            setRTEContent('footNoteRTE', editNode.querySelector('.fnTitlefullText').innerHTML);          
        } else if(editNode.classList.contains('textFNList')){
            this.editWrapper.querySelector('.footNoteType').setAttribute('data-id',editNode.id);
            this.editWrapper.querySelector('.footNoteType').innerHTML = 'Text';
            this.editWrapper.querySelector('.fnCategoryList').style.display = 'block';
            this.editWrapper.querySelector('.footNoteCategory').innerHTML = editNode.getAttribute('data-category');
            setRTEContent('footNoteRTE', editNode.querySelector('.fnTextFullText').innerHTML);
        } else if(editNode.classList.contains('tableFNList')){
            this.editWrapper.querySelector('.footNoteType').setAttribute('data-id',editNode.id);
            this.editWrapper.querySelector('.footNoteType').innerHTML = 'Table';
            setRTEContent('footNoteRTE', editNode.querySelector('.fnTableFullText').innerHTML);
        }
    }

    function fndelete(event){
        var editNode = $(event.target).parents('.references-list-detail')[0];
        $('p[data-id="'+editNode.id+'"]').addClass('text-strikethrough');
        editNode.outerHTML = '';
    }

    function viewunCitedFootNote(event){
        var unCitedButton = event.target;
            if(event.target.className.includes('hideUnCited')){
                var referencefilteredList = this.htmlDoc.querySelectorAll('.edit-citation-footnotes .references-list-detail');
                referencefilteredList.forEach(function(singleFilteredList, index){
                    singleFilteredList.classList.remove('unciteFN');
                });
                unCitedButton.classList.remove('hideUnCited');
                unCitedButton.classList.remove('active');
                unCitedButton.innerHTML = '';
                unCitedButton.innerHTML = 'Show Uncited';
            } else {
              var citedReference = this.htmlDoc.querySelectorAll('.ce_cross-ref');
                var citedReferenceTitle = [];
                citedReference.forEach(function(singleCiteReference, index){
                    citedReferenceTitle.push(singleCiteReference.getAttribute('title'));
                });
                var citedArrayId = citedReferenceTitle.filter(function(item, pos) {
                    return citedReferenceTitle.indexOf(item) == pos && item.startsWith("bib");
                });
                var referenceList = this.htmlDoc.querySelectorAll('.edit-citation-footnotes .references-list-detail');
                referenceList.forEach(function(singleReferenceList, index){
                    if(!citedArrayId.includes(singleReferenceList.getAttribute('data-id'))){
                        if(singleReferenceList.className.includes('clone')){
                            return;
                        } else{
                            singleReferenceList.className = singleReferenceList.className + ' unciteFN';
                        }
                    }
                });
                unCitedButton.innerHTML = '';
                unCitedButton.className = unCitedButton.className + ' hideUnCited active' ;
                unCitedButton.innerHTML = 'Hide Uncited';  
            }
    }

    function checkboxClick(event){
        var selectedRefCheckBoxes = document.querySelectorAll('input.fnCb:checked');
        if(selectedRefCheckBoxes.length){
            document.querySelector('.fnCite').style.display = 'block';
            document.querySelector('.addFootNote').style.display = 'none';
            document.querySelector('.viewunCitedFootNote').style.display = 'none';
            document.querySelector('.fnCheckClose').style.display = 'block';
            if(selectedRefCheckBoxes.length > 1){
                document.querySelector('.fnCite').innerHTML = '';
                document.querySelector('.fnCite').innerHTML = 'Cite Multiple';
            } else {
                document.querySelector('.fnCite').innerHTML = '';
                document.querySelector('.fnCite').innerHTML = 'Cite';
            }
        } else {
            document.querySelector('.fnCite').style.display = 'none';
            document.querySelector('.addFootNote').style.display = 'block';
            document.querySelector('.viewunCitedFootNote').style.display = 'block';
            document.querySelector('.fnCheckClose').style.display = 'none';
        } 
    }

    function fnCiteClick(){
        if(document.querySelectorAll('input.fnCb:checked').length){
            var selectedReference = document.querySelectorAll('input.fnCb:checked');
            var dataLabel = [];
            var dataId = [], dataType = [];
            selectedReference.forEach(function(singleSelectedReference){
                dataLabel.push($(singleSelectedReference).parents('.references-list-detail').find('.fnLabel').html());
                dataId.push($(singleSelectedReference).parents('.references-list-detail').attr('id'));
                dataType.push($(singleSelectedReference).parents('.references-list-detail').attr('data-type'));
            });


            dataType = dataType.filter( function(value, index, self) { 
                            return self.indexOf(value) === index;
                        } );
            onCite(dataId, dataLabel, dataType);
        }
    }

    function onCite(id, content, dataType){
        var citeHtml;
        var uniqueId, reuni = 0;
        if(dataType.length > 1){
            alert('Cannot Cite from Multiple Types');
            return;
        }
        if(!document.querySelector('.cursor')){
            alert('select on the particular Area to cite');
            return;
        }
        citeHtml = '<span class="ce_cross-fn_multi">';
        
        // var tempElement = document.createElement('div');
        // tempElement.innerHTML = citeHtml;
        if(document.querySelector('.cursor')){
            if(dataType[0] == 'Table'){
                if($('.cursor').parents('.tablecaption').length){
                    id.forEach(function(singleId,index){
                        uniqueId = reuni++ +''+ Date.now();
                        citeHtml += '<a title="'+singleId+'" class="ce_cross-ref" name="'+uniqueId+'" id="'+uniqueId+'"><sup>'+content[index]+'</sup></a>';
                        addCiteToFN(singleId, uniqueId);
                    });
                    citeHtml += '</span>';
                    $( ".cursor" ).before( citeHtml );
                } else {
                    $('.adding-reference-back #PopUpContent').html('Please Cite in appropriate place.');
                    $('.adding-reference-back').show();
					$('.adding-reference-back').addClass('foot-note-popup');
                    setTimeout(function(){
                        $('.adding-reference-back').hide();
                    }, 2000);
                }
            } else if(dataType[0] == 'Title'){
                if($('.cursor').parents('.ce_title').length){
                    id.forEach(function(singleId,index){
                        uniqueId = reuni++ +''+ Date.now();
                        citeHtml += '<a title="'+singleId+'" class="ce_cross-ref" name="'+uniqueId+'" id="'+uniqueId+'"><sup>'+content[index]+'</sup></a>';
                        addCiteToFN(singleId, uniqueId);
                    });
                    citeHtml += '</span>';
                    $( ".cursor" ).before( citeHtml );
                } else {
                    $('.adding-reference-back #PopUpContent').html('Please Cite in appropriate place.');
                    $('.adding-reference-back').show();
					$('.adding-reference-back').addClass('foot-note-popup');
                    setTimeout(function(){
                        $('.adding-reference-back').hide();
                    }, 2000);
                }
            } else if(dataType[0] == 'Text'){
                if(!$('.cursor').parents('.tablecaption').length && !$('.cursor').parents('.ce_title').length ){
                    id.forEach(function(singleId,index){
                        uniqueId = reuni++ +''+ Date.now();
                        citeHtml += '<a title="'+singleId+'" class="ce_cross-ref" name="'+uniqueId+'" id="'+uniqueId+'"><sup>'+content[index]+'</sup></a>';
                        addCiteToFN(singleId, uniqueId);
                    });
                    citeHtml += '</span>';
                    $( ".cursor" ).before( citeHtml );
                } else {
                    $('.adding-reference-back #PopUpContent').html('Please Cite in appropriate place.');
                    $('.adding-reference-back').show();
					$('.adding-reference-back').addClass('foot-note-popup');
                    setTimeout(function(){
                        $('.adding-reference-back').hide();
                    }, 2000);
                }
            }
        }
        
    }

    function getIframeSelectionText(iframe) {
      var win = iframe.contentWindow;
      var doc = win.document;

      if (win.getSelection) {
        return win.getSelection().toString();
      } else if (doc.selection && doc.selection.createRange) {
        return doc.selection.createRange().text;
      }
    }

    function setHyperLinkContent(){
        var iframe = document.querySelector(".footNoteRTE iframe");
        alert(getIframeSelectionText(iframe));
        var textBoxContent = getRTEData(this); 
        // CKEDITOR.instances["editor33"].getSelection().getSelectedText()     
    }

    function linkIcon(){
        var urlNode = this.editWrapper;
        if(urlNode.querySelector('.urlWrapper').style.display == 'none'){
            urlNode.querySelector('.urlWrapper').style.display = 'block';
            urlNode.querySelector('.urlTextBoxWrapper').style.display = 'block';
        } else {
            urlNode.querySelector('.urlWrapper').style.display = 'none';
            urlNode.querySelector('.urlTextBoxWrapper').style.display == 'none'; 
        }
    }

    function urlDDValue(event){
        var urlNode = this.editWrapper;
            urlNode.querySelector('.urlTypeContent').innerHTML = event.target.innerHTML;
        if(event.target.innerHTML == 'URL'){
            event.target.innerHTML = 'Email';
        } else {
            event.target.innerHTML = 'URL';
        }
    } 

    function urlValidater(event){
        var iframe = document.querySelector(".footNoteRTE iframe");
        var selectedContent = getIframeSelectionText(iframe);
        var textBoxContent = getRTEData(this);
        var linkValue = this.editWrapper.querySelector('.urlTextBox').value;
        if(this.editWrapper.querySelector('.urlTypeContent').innerHTML == 'Email'){
            linkValue = 'mailto:'+linkValue;
        }
        var hyperlinkedContet = '<a href="'+linkValue+'" target="_blank"><u>'+selectedContent+'</u></a>';
        var fullContent = textBoxContent.replace(selectedContent, hyperlinkedContet);
        // selectedContent
        setRTEContent('footNoteRTE',fullContent);
        var urlNode = this.editWrapper;
        urlNode.querySelector('.urlWrapper').style.display = 'none';
        urlNode.querySelector('.urlTextBoxWrapper').style.display == 'none'; 
        urlNode.querySelector('.urlTypeContent').innerHTML = 'URL';
        this.editWrapper.querySelector('.urlTextBox').value = '';
    }

    function addCiteToFN(singleId, uniqueId){
        var currentNode = document.getElementById(singleId);
        var cloneValue = currentNode.querySelector('.citeNode.clone').cloneNode(true);
        cloneValue.classList.remove('clone');
        var countcite = currentNode.querySelectorAll('.citeNode').length;
        cloneValue.querySelector('.citeCount').innerHTML = countcite;
        cloneValue.style.display = 'block';
        cloneValue.setAttribute('data-id',uniqueId);
        currentNode.querySelector('.citeList').appendChild(cloneValue);
        currentNode.querySelectorAll('.citeNode').forEach(function(singleVlue){
            singleVlue.querySelector('.citeCount').addEventListener('click', gotoElement ,false)
            singleVlue.querySelector('.citeKill').addEventListener('click', delCite ,false)
        });
    }

    function gotoElement(event){
        $(event.target).parents('ul').find('li').removeClass('active');
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

    function delCite(event){
        document.getElementById(event.target.parentNode.getAttribute('data-id')).classList.add('text-strikethrough');
        event.target.parentNode.classList.add('disabled');
    }

    function fnCheckClose(){
        var selectedReference = document.querySelectorAll('input.fnCb:checked');
        selectedReference.forEach(function(singleSelectedReference){
            singleSelectedReference.checked = false;
        });
        checkboxClick();
    }

    function footNotePanel(win, doc, locale, fnconatiner) {
        var actorType;

        if (fnconatiner instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        initializeVariables(this);
        this.container = fnconatiner;
        this.win = win;
        this.htmlDoc = doc;
    }
    
    footNotePanel.prototype.render = function render(parentConatiner) {
        var tempWrapper, editWrapper,
            instance = this, placeholderMessage = 'Enter Foot Note'

        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = fnPanelTemplate.join('');
        editWrapper = this.htmlDoc.createElement('span');
        editWrapper.innerHTML = fnEditTemplate.join('');
        this.addFootNote = addFootNote.bind(this);
        this.footNoteType = footNoteType.bind(this);
        this.selectFootNoteType = selectFootNoteType.bind(this);
        this.footNoteCategory = footNoteCategory.bind(this);
        this.fNCategoryDropDown = fNCategoryDropDown.bind(this);
        this.fnAdd = fnAdd.bind(this);
        this.liSelect = liSelect.bind(this);
        this.fnedit = fnedit.bind(this);
        this.fndelete = fndelete.bind(this);
        this.viewunCitedFootNote = viewunCitedFootNote.bind(this);
        this.fnCheckClose = fnCheckClose.bind(this);
        this.checkboxClick = checkboxClick.bind(this);
        this.fnCiteClick = fnCiteClick.bind(this);
        this.linkIcon = linkIcon.bind(this);
        this.urlDDValue = urlDDValue.bind(this);
        this.urlValidater = urlValidater.bind(this);
        this.editWrapper = editWrapper;
        var self = this;
        this.editWrapper.querySelector('.fnCancel').addEventListener('click', function(){
            self.htmlDoc.querySelector('.editFootNotesWrapper').style.display = 'none';
            cleanValues(self);
        }, false);
        // this.editWrapper.querySelector('.footNoteType').addEventListener('click', this.footNoteType, false);
        this.editWrapper.querySelector('.footNoteCategory').addEventListener('click', this.footNoteCategory, false);
        this.editWrapper.querySelector('.fnAdd').addEventListener('click', this.fnAdd, false);
        this.editWrapper.querySelector('.linkIcon').addEventListener('click', this.linkIcon, false);
        this.editWrapper.querySelector('.urlDDValue').addEventListener('click', this.urlDDValue, false);
        this.editWrapper.querySelector('.urlValidater').addEventListener('click', this.urlValidater, false);
        /*this.editWrapper.querySelectorAll('.footNoteTypeDropDown span').forEach(function(singleElement){
            singleElement.addEventListener('click', self.selectFootNoteType,false);
        });*/
        this.editWrapper.querySelectorAll('.footNoteCategoryDropDown span').forEach(function(singleElement){
            singleElement.addEventListener('click', self.fNCategoryDropDown,false);
        });
        this.htmlDoc.querySelector('.editFootNotesWrapper').appendChild(this.editWrapper);
        this.tempWrapper = tempWrapper;

        this.rteContainer = document.querySelector('.footNoteRTE');
        this.rte = new RTE(window, document, this.rteContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'placeholder': placeholderMessage,
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.clearRTE = clearRTE.bind(this);
        this.htmlDoc.querySelector('.footNotesIcon').addEventListener('click', this.addFootNote, false);
        this.tempWrapper.querySelector('.viewunCitedFootNote').addEventListener('click', this.viewunCitedFootNote, false);
        this.tempWrapper.querySelector('.fnCheckClose').addEventListener('click', this.fnCheckClose, false);
        this.tempWrapper.querySelector('.fnCite').addEventListener('click', this.fnCiteClick, false);
        
        this.htmlDoc.body.appendChild(this.tempWrapper);
        this.container.appendChild(this.tempWrapper);
        setTopPosition(this);
    };

    return footNotePanel;
});
define([
    'scripts/Helper', 'scripts/Panel', 'scripts/RichTextEditor'
], function ReferencePanelLoader(Helper, Panel, RTE) {
    var editReferenceRTE = {'freeText': 'authorDescriptionRTE', 'detailed1': 'authorTitleRTE', 'detailed2':'journalTitleRTE'}, 
        citedRefClick = false, self, 
        referencePanelTemplate = [
            '<div class="overallRef" id="overallRef"><div class="references-listitem refListItem cloneRef" style="display:none">',
                '<div class="references-list-detail">',
                    '<input type="checkbox" id="test8" value="public" name="selectReference">',
                    '<div class="reference-author-div refAuthorDiv">',
                        '<span class="ref-number"></span>',
                        '<span class="ref-author-name refAuthors">S.A., Kouroumbas K. and Vlachakis N</span>',
                        '<span class="ref-yearstamp refYear">2008,</span>',
                        '<span class="ref-pagestamp refPages"> 71-87</span>',
                        '<div class="ref-detail-view refDetailView" style="display:none">',
                            '<p class="refFullText">Avlonitis S.A., Kouroumbas K. and Vlachakis N., Energy consumption and membrane replacement cost for seawater RO desalination plants, Desalination 157 (1–3), 2003, 151–158</p>',
                            '<span class="ref-add editReferenceClick"></span>',
                            '<span class="ref-delete referenceDeleteClick"></span>',
							'<div class="citation-count-listsplit footnote-annotaion refCiteWrapper">',
                                '<ul class="refCiteList">',        
                                    '<li class="refCiteNode" style="display:none"><span class="refCiteCount">0</span><span class="citation-kill refCiteDel"></span></li>',                                           
                               '</ul>',
                            '</div>',
                        '</div>',
                    '</div>',
                    '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
                '</div>',
            '</div></div>'
        ],
        buttonLabel = [
            '<div class="references-view-btn">',
				//'<button class="multiple-citation-cancel cancelSelectedRef" style="display:none">Cancel</button>',
                //'<button class="multiple-citation-btn multipleCite" style="display:none">Cite multiple</button>',
                '<button class="addReferenceClick addReference">Add reference</button>',
                '<button class="unCited">View Uncited</button>',
				'<button class="cite-close-icon cancelSelectedRef" style="display:none"></button>',
				'<button class="cite-btn-full multipleCite" style="display:none">Cite multiple</button>',
           '</div>'
        ],
        notifyAlertTemplate = [
            '<div class="notification-alert">',
                '<p><strong>Select Reference(s) to Cite</strong></p>',
           '</div>'
        ],
        cssRules = {
            
        };

    /*Assign reference initializeVariables    */
    freeTextTab  = document.querySelector('.freeTextTab');  
    detailedTab  = document.querySelector('.detailedTab'); 
    pubMedTab    = document.querySelector('.pubMedTab');     
    refTitle =document.querySelector('.ref-add-title');
    refAddTitle  = 'Add Reference as';
    refEditTitle = 'Edit Reference';
    refAddBtn = 'Add';
    refEditBtn = 'Update';  

    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.eBus = null;
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
        instance.stylesheetId = 'referencePanel-style';
        instance.styleSheet = null;
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function getRTEData(instance) {
        return instance.getData({
            'encodeHtml': true,
            'sanitize': true
        });
    }

    function clearRTE() {
        this.rte.freeText.clear();
    }

    function getAllReferences(tempWrapper){
        var referenceParentNode = document.querySelector('.ce_bibliography-sec');
        var totalReferences = referenceParentNode.querySelectorAll('.ce_bib-reference');
        totalReferences.forEach(function(singleReference, index){
            singleReference = singleReference.cloneNode(true);
            addReference(singleReference, tempWrapper);
        });
    }

    function clearInputFileds(formClassName){
        document.querySelectorAll('.'+formClassName+' input[type="text"],.'+formClassName+' input[type="email"], .'+formClassName+' textarea').forEach(function(singleElemet){
                singleElemet.value = '';
            });
    }

    function addReference(singleReference, tempWrapper){
        var authorsText = '', yearsText = '';
        var authors = singleReference.querySelectorAll('.sb_author');
        if(authors.length){
            authorsText = '';
            authors.forEach(function(singleAuthor, index){
                authorsText += singleAuthor.innerText + ', ';
            });
        }
        var years = singleReference.querySelectorAll('.sb_date');
        if(years.length){
            yearsText = '';
            years.forEach(function(singleDate, index){
                yearsText += singleDate.innerText + ', ';
            });
        }
        var currentnode = tempWrapper.querySelector('.cloneRef').cloneNode(true);
        currentnode.setAttribute('data-id',singleReference.id);
        currentnode.setAttribute('data-name',singleReference.getAttribute('name'));
        var ceLabel = singleReference.querySelector('.ce_label')|| singleReference.querySelector('.ce_label1');
            currentnode.querySelector('.ref-number').setAttribute('data-refType',ceLabel.getAttribute('data-refType'));
            currentnode.querySelector('.ref-number').setAttribute('data-refName',ceLabel.getAttribute('data-refName'));
            currentnode.querySelector('.ref-number').setAttribute('data-authorDesc',ceLabel.getAttribute('data-authorDesc'));
        currentnode.setAttribute('data-label',ceLabel.textContent);
        if(!isNaN(parseInt(ceLabel.textContent))){
            currentnode.querySelector('.ref-number').innerHTML = '';
            currentnode.querySelector('.ref-number').innerHTML = ceLabel.textContent;
        }
        currentnode.querySelector('.refAuthors').innerHTML = '';
        currentnode.querySelector('.refAuthors').innerHTML = authorsText;
        currentnode.querySelector('.refYear').innerHTML = '';
        currentnode.querySelector('.refYear').innerHTML = yearsText;
        currentnode.querySelector('.refPages').innerHTML = '';
        if(singleReference.querySelector('.sb_pages')){
            var pages = singleReference.querySelector('.sb_pages').innerText;
            currentnode.querySelector('.refPages').innerHTML = pages;
        }
        currentnode.classList.remove('cloneRef');
        currentnode.style = '';
        if(singleReference.querySelector('.sb_pages'))
            singleReference.querySelector('.sb_pages').outerHTML = '';
        if(singleReference.querySelector('.sb_date'))
            singleReference.querySelector('.sb_date').outerHTML = '';
        ceLabel.outerHTML = '';
        currentnode.querySelector('.refFullText').innerHTML = singleReference.innerText;
        getCitationCount(singleReference.id, currentnode);
        tempWrapper.querySelector('.overallRef').appendChild(currentnode); 

    }

    function getCitationCount(equationId, tmpNode){

        var citeCount = 0;
        // var citeList = tmpNode.querySelector('.refCiteNode').cloneNode(true);
        if(document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-ref[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.refCiteNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.refCiteCount').innerHTML = '';
                citeList.querySelector('.refCiteCount').innerHTML = ++citeCount;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.refCiteList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.refCiteCount').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
        if(document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').length){
            document.querySelectorAll('a.ce_cross-refs[title="'+equationId+'"]').forEach(function(singleElement){
                var deleted = singleElement.classList.contains('text-strikethrough');
                var citeList = tmpNode.querySelector('.refCiteNode').cloneNode(true);
                citeList.style.display = 'block';
                citeList.querySelector('.refCiteCount').innerHTML = '';
                citeList.querySelector('.refCiteCount').innerHTML = ++citeCount;
                // citeList.id = singleElement.id;
                citeList.setAttribute('data-id',singleElement.id);
                if(deleted)
                    citeList.classList.add('disabled');
                tmpNode.querySelector('.refCiteList').appendChild(citeList);
                tmpNode.querySelectorAll('.citationDel').forEach(function(single){
                  single.addEventListener('click', citatioDelClick, false);  
                });
                tmpNode.querySelectorAll('.refCiteCount').forEach(function(singleElement){
                    singleElement.addEventListener('click', citatioNumClick, false)
                });
            });
        }
    }

    function citatioDelClick(event){
        document.getElementById(event.target.parentNode.getAttribute('data-id')).classList.add('text-strikethrough');
        event.target.parentNode.classList.add('disabled');
    }

    function setTopPosition(instance) {
        var filterStyle;
        if (instance.enableCategoryFilter === true) {
            filterStyle = getComputedStyle(instance.filterElement);
            instance.container.parentNode.style.paddingTop = filterStyle.height;
        }
    }

    function onLabelClick(e){
        if(e.target.parentNode.classList.contains('refAuthorDiv')){
            if($(e.target.parentNode).find('.refDetailView').css('display') == 'none'){
                $('.refAuthorDiv').find('.refDetailView').hide();
                $('.refAuthorDiv').parent().removeClass('active');
                $(e.target.parentNode).parents('.references-list-detail').find('.arrowBtn').removeClass('more').addClass('less');
                $(e.target.parentNode.parentNode).addClass('active');
                $(e.target.parentNode).find('.refDetailView').show();
                var pubmedChk = $(e.target.parentNode).parents('.references-list-detail').find('.ref-number')[0].getAttribute('data-reftype');
                if(pubmedChk == "pubmed"){
                    $('.editReferenceClick').attr('style', 'display:none');
                }else{
                    $('.editReferenceClick').attr('style', 'display:block');
                }
                $(e.target.parentNode).find('.refCiteList li').removeClass('active');
            } else {
               $(e.target.parentNode).find('.refDetailView').hide();
               $(e.target.parentNode.parentNode).removeClass('active');
               $(e.target.parentNode).parents('.references-list-detail').find('.arrowBtn').removeClass('less').addClass('more');
            }
        } else if(e.target.type == "checkbox"){
            checkboxClick(e.target);
        } else if(e.target.classList.contains('multipleCite')){
            multipleReferenceCite();
        } else if(e.target.classList.contains('arrowBtn')){
            $(e.target.parentNode).find('.refAuthors').trigger('click');
        } else if(e.target.classList.contains('refCiteDel')){
            citatioDelClick(e);
        } else if(e.target.classList.contains('refCiteCount')){
            citatioNumClick(e);
        }
    }

    function citatioNumClick(event){
        $(event.target).parents('.refCiteList').find('li').removeClass('active');
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

    function onCite(id, content, multiple){
        // document.querySelector('.cursor');
        var citeHtml;
        var uniqueId, reuni = 0;
        if(multiple){
            citeHtml = '<span class="ce_cross-ref_multi">(';
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

            document.querySelectorAll('input[name="selectReference"]:checked').forEach(function(singleElement){
                var paretNode = $(singleElement).parents('.refListItem');
                paretNode.find('.refCiteList li:not(:first-child)').remove();
                getCitationCount(paretNode[0].getAttribute('data-id'), paretNode[0]);
            });
        bindClickMultiCite();
    }

    function bindClickMultiCite(){
        $('.ce_cross-ref_multi').off('click').on('click', function(){
            unSelectReference();
            citedRefClick = true;
            if(!$('.references-container .tab-panel').hasClass('open')){
                $('.references-container .header').trigger('click');
            }
            var refanchors = $(this).find('a');
            citeClickIds = [];
            refanchors.each(function(singleElement){
                citeClickIds.push($(this).attr('title'));
            });

            citeClickIds.forEach(function(singleValue){
                var clickedCiteRefList = $('.refListItem[data-id="'+singleValue+'"]');
                clickedCiteRefList.find('input[type="checkbox"]').prop('checked', true);
                checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0]);
                // document.off('click', checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0])).on('click',checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0]));
                // moveRefToTop(clickedCiteRefList);
            });

        });
        $('.ce_cross-ref').off('click').on('click', function(){
            unSelectReference();
            if(!$('.references-container .tab-panel').hasClass('open')){
                $('.references-container .header').trigger('click');
            }
            var refanchors = $(this).find('a');
            if(!refanchors.length){
                refanchors = $(this);
            }

            citeClickIds = [];
            refanchors.each(function(singleElement){
                citeClickIds.push($(this).attr('title'));
            });

            citeClickIds.forEach(function(singleValue){
                var clickedCiteRefList = $('.refListItem[data-id="'+singleValue+'"]');
                clickedCiteRefList.find('input[type="checkbox"]').prop('checked', true);
                checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0]);
                // document.off('click', checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0])).on('click',checkboxClick(clickedCiteRefList.find('input[type="checkbox"]')[0]));
                // moveRefToTop(clickedCiteRefList);
            });
        });
        $('.cancelSelectedRef').trigger('click');
    }

    function resetToTopRefs(clickedCiteRefList){
        if(clickedCiteRefList.hasClass('refCloneNode')){
            var thisfullList = clickedCiteRefList, 
            thisfullListId = thisfullList.attr('data-id');
            $('.refListItem[data-id="'+thisfullListId+'"]').show();
            $('.refListItem[data-id="'+thisfullListId+'"]').find('input[type="checkbox"]').prop('checked', false);
            thisfullList.remove();
        }
    }

    function moveRefToTop(clickedCiteRefList){
        var clonedNode = clickedCiteRefList.clone();
        clickedCiteRefList.hide();
        clonedNode.addClass('refCloneNode');
        clonedNode.show();
        $('.cloneRef').before(clonedNode);
    }

    function citClick(){
        $('.refListItem .multipleCite').on('click', function(){
            var dataLabel = $(this).parents('.refListItem').attr('data-label');
            var dataId = $(this).parents('.refListItem').attr('data-id');
            onCite(dataId, dataLabel);
        });
    }

    function filterReference(){
        $('.unCited').on('click', function(){
            var unCitedButton = document.querySelector('.unCited');
            if(document.querySelector('.unCited').className.includes('hideUnCited')){
                var referencefilteredList = document.querySelectorAll('.refListItem.unciteReference');
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
                    return citedReferenceTitle.indexOf(item) == pos && item.startsWith("bib");
                });
                var referenceList = document.querySelectorAll('.refListItem');
                referenceList.forEach(function(singleReferenceList, index){
                    if(!citedArrayId.includes(singleReferenceList.getAttribute('data-id'))){
                        if(singleReferenceList.className.includes('cloneRef')){
                            return;
                        } else{
                            singleReferenceList.className = singleReferenceList.className + ' unciteReference';
                        }
                    }
                });
                unCitedButton.innerHTML = '';
                unCitedButton.className = unCitedButton.className + ' hideUnCited active' ;
                unCitedButton.innerHTML = 'Hide Uncited';  
            }
            
        });
    }

    function checkboxClick(currentElement){
        var clickedCiteRefList = $(currentElement).parents('.refListItem');
        resetToTopRefs(clickedCiteRefList);
        var selectedRefCheckBoxes = document.querySelectorAll('input[name=selectReference]:checked');
        if(selectedRefCheckBoxes.length){
            document.querySelector('.multipleCite').style.display = 'block';
            document.querySelector('.addReference').style.display = 'none';
            document.querySelector('.unCited').style.display = 'none';
            document.querySelector('.cancelSelectedRef').style.display = 'block';
            if(selectedRefCheckBoxes.length > 1){
                document.querySelector('.multipleCite').innerHTML = '';
                document.querySelector('.multipleCite').innerHTML = 'Cite Multiple';
                // arrangeSelectedRefernce(selectedRefCheckBoxes);
                if(citedRefClick && currentElement.checked)
                    moveRefToTop(clickedCiteRefList);
            } else {
                document.querySelector('.multipleCite').innerHTML = '';
                document.querySelector('.multipleCite').innerHTML = 'Cite Reference';
                // arrangeSelectedRefernce(selectedRefCheckBoxes);
                if(citedRefClick && currentElement.checked)
                    moveRefToTop(clickedCiteRefList);
            }
        } else {
            document.querySelector('.multipleCite').style.display = 'none';
            document.querySelector('.addReference').style.display = 'block';
            document.querySelector('.unCited').style.display = 'block';
            document.querySelector('.cancelSelectedRef').style.display = 'none';
        }
    }

    function multipleReferenceCite(){
        if(document.querySelectorAll('input[name=selectReference]:checked').length){
            var selectedReference = document.querySelectorAll('input[name=selectReference]:checked');
            var dataLabel = [];
            var dataId = [];
            selectedReference.forEach(function(singleSelectedReference){
                dataLabel.push($(singleSelectedReference).parents('.refListItem').attr('data-label'));
                dataId.push($(singleSelectedReference).parents('.refListItem').attr('data-id'));
            });
            onCite(dataId, dataLabel, true);
        }
    }

    function unSelectReference(){
        $('.cancelSelectedRef').on('click',function(){
            citedRefClick = false;
            var selectedReference = document.querySelectorAll('input[name=selectReference]:checked');
            selectedReference.forEach(function(singleSelectedReference){
                singleSelectedReference.checked = false;
                var clickedCiteRefList = $(singleSelectedReference).parents('.refListItem');
                resetToTopRefs(clickedCiteRefList);
            });
            checkboxClick();
        });
    }

    function arrangeSelectedRefernce(selectedRefCheckBoxes){
        $('.refCloneNode').remove();
        if(selectedRefCheckBoxes.length > 1){
            $(selectedRefCheckBoxes).parents('.refListItem').hide();
            var clonedNode = $(selectedRefCheckBoxes).parents('.refListItem').clone();
            clonedNode.addClass('refCloneNode');
            $('.cloneRef').before(cloneNode);
        } else{
            return;
        }
    }

    function addReferenceClick(){
        $('.addReferenceClick').on('click', function(){
            refTitle.innerText=refAddTitle;
            $('.referenceFormContent .btn-wrapper button').show();
            freeTextTab.classList.add('active');
            $("input.referenceName").val('').attr("citaid",null).attr("author",null).attr("reference",null);
            $("input.referenceLabel").val('').attr("citaID",null);
            document.getElementsByClassName('addReferenceBtn')[0].innerText=refAddBtn; 
            $('.referenceForm, .referenceFormContent, .freeTextForm, .freeTextTab, .detailedTab, .pubMedTab').attr('style', 'display:block');
        });
    }

    function cancelReferenceBtn(success){
        if(success == true){
            $('.cancelReferenceBtn').trigger( "click" );
        }
        $(document).off('click','.cancelReferenceBtn').on('click','.cancelReferenceBtn', function(e){    
            freeTextTab.classList.remove('active');
            setRTEContent('authorDescriptionRTE', '');
            $('.referenceForm, .referenceFormContent, .freeTextForm, .referenceName, .referenceLabel1').attr('style', 'display:none');
        });
    }

    function allignfileds(refElem, refForm){
        var refNodeClasses = ['sb_issue-nr', 'sb_volume-nr', 'sb_date', 'sb_pages', 'sb_title.atl .sb_maintitle', 'sb_title.sitl .sb_maintitle', 'sb_author', 'ce_label1', 'ce_label'],
            refFormNode = {'sb_issue-nr': 'authorIssue', 'sb_volume-nr': 'authorVolume', 'sb_date': 'authorYear', 'sb_pages':  'authorPageRange', 'sb_title.atl .sb_maintitle' : 'authorTitleRTE', 'sb_title.sitl .sb_maintitle' : 'journalTitleRTE', 'sb_author': 'authorName', 'ce_label1': 'referenceLabel', 'ce_label': 'referenceLabel' },
            presentValueClasses = [];

        refNodeClasses.forEach(function(singleValue){
            if(isElementPresent(refElem, singleValue)){
                presentValueClasses.push(singleValue);
            }
        });
        refForm.querySelector('input[value="Book"]').checked = true;

        presentValueClasses.forEach(function(singleValue){
            var refSingleElement = refElem.querySelectorAll('.'+singleValue), textValue = '';
            // have to change late upon multiple authors
            /*if(singleValue == 'sb_author'){
                if(refSingleElement.length > 1){
                    refSingleElement.forEach(function(singleElement){
                        textValue += singleElement.innerText;
                    });
                }
                return;
            }*/
            if(refSingleElement.length > 1){
                refSingleElement.forEach(function(singleElement){
                    textValue += singleElement.innerText;
                });
            } else if(refSingleElement.length == 1){
                textValue = refSingleElement[0].innerText;
            }
            if(refFormNode[singleValue] == 'authorTitleRTE' || refFormNode[singleValue] == 'journalTitleRTE'){
                setRTEContent(refFormNode[singleValue], textValue);
                return;
            }
            if(refForm.querySelector('.'+refFormNode[singleValue]))
                refForm.querySelector('.'+refFormNode[singleValue]).value = textValue;
        });
        refForm.querySelector('.referenceDetailedSend').innerText = refEditBtn;
        refTitle.innerHTML = refEditTitle;

    }

    function isElementPresent(node, elemClass){
        var value = false,
            nodeArray = node.querySelectorAll('.'+elemClass);
        if(nodeArray.length)
            value = true
        return value;
    }

    function freeTextTabClick(){
        $('.freeTextTab').on('click', function(){
            detailedTab.classList.remove('active');
            pubMedTab.classList.remove('active');
            setRTEContent('authorDescriptionRTE', '');
            document.querySelector('.freeTextForm').style.display = "block";
            document.querySelector('.detailedForm').style.display = "none";
            document.querySelector('.pubmIdForm').style.display = "none";
            freeTextTab.classList.add('active');
        });

        $('.editFreeTextTab').on('click', function(){
            document.querySelector('.editDetailedTab').classList.remove('active');
            document.getElementsByClassName('referenceName')[0].value = "";
            setRTEContent('authorDescriptionRTE', ''); 
            document.querySelector('.editDetailedForm').style.display = "none";
            document.querySelector('.editFreeTextForm').style.display = "block";
            document.querySelector('.editFreeTextTab').classList.add('active');
        });
    }

    function detailedTabClick(){
        $('.detailedTab').on('click', function(){
            freeTextTab.classList.remove('active');
            pubMedTab.classList.remove('active');
            document.querySelector('.freeTextForm').style.display = "none";
            document.querySelector('.pubmIdForm').style.display = "none";
            document.querySelector('.detailedForm').style.display = "block";
            detailedTab.classList.add('active');
            setRTEContent('authorTitleRTE', '');
            setRTEContent('journalTitleRTE', '');
            clearInputFileds('detailedForm');
            if($('.delAdditionalAuthorName').length!=0){
                $('.delAdditionalAuthorName').trigger('click');
            } 
        });
    }

    function editDetailedTabClick(){
        $('.editDetailedTab').on('click', function(){
            document.querySelector('.editFreeTextTab').classList.remove('active');
            document.querySelector('.editFreeTextForm').style.display = "none";
            document.querySelector('.editDetailedForm').style.display = "block";
            document.querySelector('.editDetailedTab').classList.add('active');
        });
    }

    

    function pubMedTabClick(){
        $('.pubMedTab').on('click', function(){
            freeTextTab.classList.remove('active');
            detailedTab.classList.remove('active');
            document.getElementsByClassName('referenceName')[0].value = "";
            setRTEContent('authorDescriptionRTE', '');
            document.querySelector('.freeTextForm').style.display = "none";
            document.querySelector('.detailedForm').style.display = "none";
            document.querySelector('.pubmIdForm').style.display   = "block";

            pubMedTab.classList.add('active');
            
        });
    }

    function setRTEContent(className, value){
        var xiframe = document.querySelector('.'+className).querySelector('iframe');
        var insideContent = (xiframe.contentWindow || xiframe.contentDocument);
        if (insideContent.document)insideContent = insideContent.document;
        $(insideContent).find('body').focus();
        insideContent.body.innerHTML = value;
    }

    function findAncestor (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    function referenceDeleteClick(){
        $(document).on('click','.referenceDeleteClick', function(e){
            var referenecDeletePopUp, tempWrapper, cls, elem, refAuthorsContent, refYear, refPages, citationCnt, citationID;

            cls = "refListItem";//"references-list-detail";
            elem = findAncestor (e.target, cls)
            refAuthorsContent  = ($(elem).find('.refAuthors').length ? $(elem).find('.refAuthors')[0].innerHTML : null) || null;
            refYear  = $(elem).find('.refYear')[0].innerHTML|| null;
            refPages  = $(elem).find('.refPages')[0].innerHTML || null;
            citationID = $(elem).attr('data-id')|| null;

            citationCnt = $('#article').find('.ce_cross-ref[title="'+citationID+'"]').length
            refText=$(elem).find(".refFullText").html()||null;
            document.querySelector('.popupWrapper').style.display = "block";
			document.querySelector('.popupWrapper').className += " referencedeleteErapper";
			$('.popupWrapper').removeClass("message-sucess-alert");
            referenecDeletePopUp = [
								
								'<h1 class="popup-title">Updating Citation</h1>',
                                '<div class="citations-wrapper">',
                                    '<p class="citation-counts">This change will affect <span>'+citationCnt +'</span>Citations </p>',
                                '</div>',
                                '<div class="delete-or-not">',
                                    '<p class="delete-or-not-text">Are you sure you want to delete</p>',
                                    '<h4 class="delete-or-notinstruct">"'+ (refText? refText :'') || (refAuthorsContent ? refAuthorsContent + refYear + refPages : '')+'"?</h4>',
                                '</div>',
                                '<div class="instruction-btns">',
                                    '<span data-removeid="'+citationID+'" class="instruction-confirm-btn refernceDeleteConform">Confirm</span>',
                                    '<span class="instruction-cancel-btn referenceDelCancelPopUp">Cancel</span>',
                                '</div>'
                                        ]

            tempWrapper = document.createElement('div');
            tempWrapper = referenecDeletePopUp.join('');
            
            var d1 = document.getElementById('PopUpContent');
            d1.insertAdjacentHTML('beforeend', tempWrapper);
        });
    }

    function refernceDeleteConform(){
         $(document).on('click','.refernceDeleteConform', function(e){
            var citaID = $(e.target).attr('data-removeid')
            var removecit =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[0] || $('.ce_further-reading').find('.ce_bib-reference[id="'+citaID+'"]')[0];
            var removecit2 =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[1] || $('.ce_further-reading').find('.ce_bib-reference[id="'+citaID+'"]')[1]||null;
            removecit.classList.add('text-strikethrough');
            removecit.classList.remove('reference-insert');
                        
            if(removecit2){ if(removecit2.classList.contains("reference-insert")) { $(removecit2).remove();} }
            
            var undoTemplate = [
                '<span data-undoID="'+citaID+'" class="undo-reference undoReferenceClick"></span>'
                ];

            var tempWrapper = document.createElement('div');
            tempWrapper = undoTemplate.join('');
            
            var d1 = document.getElementById(citaID);
            d1.insertAdjacentHTML('beforeend', tempWrapper);


            citationCnt = $('#article').find('.ce_cross-ref[title="'+citaID+'"]').length
            var articleCitRemove;
            if(citationCnt > 0){

                for(i=0;i<=citationCnt-1;i++){
                    articleCitRemove = $('#article').find('.ce_cross-ref[title="'+citaID+'"]')[i]
                    articleCitRemove.classList.add('text-strikethrough');
                    articleCitRemove.style.color = '#ed1c24 !important';
                }
            }
            $('.refListItem[data-id="'+citaID+'"]').remove();
            referenceDelCancelPopUp(true)
        });
    }

    function undoReferenceClick(){
        $(document).on('click','.undoReferenceClick', function(e){
            var citaID = $(e.target).attr('data-undoID')
            
            var removecit   =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[0] ||
                                $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[0];
            var removecit1  =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[1] ||
                                $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]')[1];
            removecit.classList.remove('text-strikethrough');
            $('span[data-undoID^="'+citaID+'"]').remove();
            
            if(removecit1)
                removecit1.outerHTML = '';

            var citationCnt = $('#article').find('.ce_cross-ref[title="'+citaID+'"]').length
            var articleCitRemove;
            if(citationCnt > 0){

                for(i=0;i<=citationCnt-1;i++){
                    articleCitRemove = $('#article').find('.ce_cross-ref[title="'+citaID+'"]')[i]
                    articleCitRemove.classList.remove('text-strikethrough');
                }
                
            }
            $('.popup-wrapper.updating-reference-main.undoReference .popup-title').html('Updating Reference');
                $('.popup-wrapper.updating-reference-main.undoReference .reference-back-paper').html('Adding Reference back to paper');
                $('.popup-wrapper.updating-reference-main.undoReference').show();
                setTimeout(function(){ 
                    $('.popup-wrapper.updating-reference-main.undoReference').hide();
                },2000);
            var refoverList = document.querySelector('.overallRef');
            refoverList.innerHTML = '';
            tempWrapper = document.createElement('span');
            tempWrapper.innerHTML = referencePanelTemplate.join('');
            getAllReferences(tempWrapper);
            refoverList.parentNode.replaceChild(tempWrapper, refoverList);
        });
    }

    function referenceDelCancelPopUp(success){
        if(success == true){
            $('.referenceDelCancelPopUp').trigger( "click" );
        }
        $(document).on('click','.referenceDelCancelPopUp', function(e){
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML = "";
        });
    }

    function editReferenceClick(){
        $(document).on('click','.editReferenceClick', function(e){
            $('.referenceFormContent .btn-wrapper button').hide();
            
            cls = "refListItem";//"references-list-detail";
            elem = findAncestor (e.target, cls)
            var getTempContent = $(elem).find('.ref-number')[0];
            var refType=getTempContent.getAttribute("data-refType");
            var refEditForm = document.querySelector('.referenceFormContent');
            $('.referenceForm, .referenceFormContent').attr('style', 'display:block');

            if(refType=='freeText'){
                refTitle.innerText=refEditTitle;
                // freeTextTab.classList.add('active');
                // pubMedTab.style.display="none";
                // detailedTab.style.display="none";
                document.querySelector('.freeTextForm').style.display = "block";
                document.querySelector('.referenceName').style.display = 'block';
                document.querySelector('.referenceLabel1').style.display = 'block';
                
                var nodeValue = document.getElementsByClassName('referenceName')[0];
                nodeValue.value = getTempContent.getAttribute("data-refname");
                nodeValue.setAttribute("citaID",elem.getAttribute("data-id"));
                nodeValue.setAttribute("reference",getTempContent.getAttribute("data-refname"));
                nodeValue.setAttribute("author",getTempContent.getAttribute("data-authordesc")); 
                document.querySelector('.referenceName').value = getTempContent.getAttribute('data-refname');
                setRTEContent('authorDescriptionRTE',getTempContent.getAttribute("data-authordesc")); 
                document.getElementsByClassName('addReferenceBtn')[0].innerText=refEditBtn;          
            } 
            else if(refType == 'null'){
                // $('.freeTextTab, .pubMedTab').attr('style', 'display:none');
                // $('.detailedTab').attr('style', 'display:block');
                detailedTab.classList.add('active');
                var refDetailForm = refEditForm.querySelector('.detailedForm');
                refDetailForm.style.display = 'block';
                refDetailForm.querySelector('.referenceLabel').parentNode.style.display = 'block';
                var currentElementId = elem.getAttribute('data-id'),
                    currentRefElem = document.querySelector('#'+currentElementId);
                allignfileds(currentRefElem, refDetailForm);
                document.querySelector('.referenceLabel').setAttribute('citaID', currentElementId);


            }
                
        });
    }

    function addReferenceBtn(){
        var self = this;
        $('.addReferenceBtn').on('click', function(){
            var tempWrapper, allReference, referenceName, authorDescription, getLastNo, referenceChk = '', sNo,isAdded=false;
            
            if(document.getElementsByClassName('referenceName')[0])
                referenceName = document.getElementsByClassName('referenceName')[0].value;
            authorDescription = self.textEditorData('freeText');
            var citaID=document.getElementsByClassName('referenceName')[0].getAttribute("citaID");
            var undoTemplate = [
                '<span data-undoID="'+citaID+'" class="undo-reference undoReferenceClick"></span>'
                ];

            var tempWrapper = document.createElement('div');
            tempWrapper.innerHTML = undoTemplate.join('');
            var bibReferenceLen=$('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]').length
            
            if(bibReferenceLen){
                isAdded=true;
                var removeCit =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]');
                var refNo =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]').attr("sNo");
                if(removeCit.hasClass("text-strikethrough")){
                    referenceName=document.getElementsByClassName('referenceName')[0].getAttribute("reference"); 
                    authorDescription=document.getElementsByClassName('referenceName')[0].getAttribute("author"); 
                }else{
                    removeCit.removeClass('reference-insert'); 
                    removeCit.addClass('text-strikethrough');
                    removeCit[0].appendChild(tempWrapper.firstChild);
                }
            }

           /* var tttreferenceParentNode = document.querySelector('.ce_bibliography-sec');
            getLastNo = tttreferenceParentNode.querySelectorAll('.ce_bib-reference');*/
                          
            getLastNo = $(".ce_bibliography-sec").find(".refpId:last").attr("sNo") || null; 
            if(getLastNo){
                sNo=parseInt(getLastNo)+1;
            }else{
                sNo=1;       
            }
            var incNo=0;
            //sNo  = getLastNo[getLastNo.length -1].childNodes[0].innerHTML;            
            if(isAdded){incNo= parseInt(refNo);}else{incNo= parseInt(sNo);}
            if(referenceName!=''){
                referenceChk = '<span class="sb_reference">'+referenceName+',</span>';
            }

            document.querySelector('.referenceName, .referenceLabel1').style.display = 'none';
            
            var addCanvasTemplate = [
                                            '<div class="ce_bib-reference refpId reference-insert" id="fur'+incNo+'" sNo="'+incNo+'">',
                                              '<span class="ce_label"  data-refType="freeText" data-refName="'+referenceName+'" data-authorDesc="'+authorDescription+'" ></span>',
                                              ''+referenceChk+'',
                                              '<span class="x"> </span>',
                                              '<span class="sb_author au">'+authorDescription+'</span>',
                                              '<span class="sb_date date"></span>',
                                            '</div>'
                                        ]
            var inserted= !isAdded ? 'reference-insert' : '';
            var addReferenceTemplate = [
                                        '<div class="references-listitem refpId '+inserted+'" id="fur'+incNo+'"  data-id="fur'+incNo+'" sNo="'+incNo+'">',
                                            '<div class="references-list-detail">',
                                                '<input type="checkbox" value="public" name="selectReference">',
                                                '<div class="reference-author-div">',
                                                    '<span class="ref-number" ></span>',
                                                    '<span class="ref-author-name" data-refType="freeText" data-refName="'+referenceName+'" data-authorDesc="'+authorDescription+'">'+ (referenceName ? referenceName:authorDescription) +',</span>',
                                                    '<span class="ref-yearstamp refYear"></span>',
                                                    '<span class="ref-pagestamp refPages"></span>',
                                                    '<div class="ref-detail-view refDetailView" style="display:none">',
                                                        '<p class="refFullText">'+ (referenceName ? referenceName+'.,':'') + (authorDescription?authorDescription+'.':'') +'</p>',

                                                        '<span class="ref-add editReferenceClick"></span>',
                                                        '<span class="ref-delete referenceDeleteClick"></span>',
                                                        '<div class="citation-count-listsplit footnote-annotaion refCiteWrapper">',
                                                            '<ul class="refCiteList">',
                                                                '<li class="refCiteNode" style="display:none">',
                                                                    '<span class="refCiteCount">0</span>',
                                                                    '<span class="citation-kill refCiteDel"></span></li>',
                                                                '<li class="refCiteNode" style="display: block;" data-id="OPT_ID_1105">',
                                                                    '<span class="refCiteCount">1</span>',
                                                                    '<span class="citation-kill refCiteDel"></span>',
                                                                '</li>',
                                                            '</ul>',
                                                        '</div>',
                                                    '</div>',
                                                '</div>',
                                                '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
                                            '</div>',
                                        '</div>'

                                        ]

            tempWrapper = document.createElement('div');
            tempWrapper.innerHTML = addCanvasTemplate.join('');
            addReferenceWrapper = document.createElement('div');
            addReferenceWrapper.innerHTML = addReferenceTemplate.join('');
            add(tempWrapper.firstChild.cloneNode(true),isAdded,addReferenceWrapper.innerHTML);
            var referenceParentNode = document.querySelector('.ce_bibliography-sec');
            allReference = referenceParentNode.querySelectorAll('.ce_bib-reference');
            
            if(!isAdded || (bibReferenceLen==1)){
                $('.popup-wrapper.updating-reference-main.undoReference .popup-title').html('Adding Reference');
                $('.popup-wrapper.updating-reference-main.undoReference .reference-back-paper').html('Adding Reference to paper');
                $('.popup-wrapper.updating-reference-main.undoReference').show();
                setTimeout(function(){ 
                    $('.popup-wrapper.updating-reference-main.undoReference').hide();
                },2000);
                allReference[allReference.length-1].parentNode.insertBefore(tempWrapper.firstChild,allReference[allReference.length-1].nextSibling);
            }
            
            
            var success = true ;
            cancelReferenceBtn(success);

        });
    }

    function addMoreAuthorName(){
        $('.addMoreAuthorName').on('click', function(){
            var currentnode = document.getElementsByClassName('authorName')[0];
            var authorValue = currentnode.value;
            if( authorValue != ""){
                var addAuthorNameTemplate = [
                                        '<li>',
                                        '<label class="left-label">Author Name*</label>',
                                        '<input class="author-name authorNameAdd" value="'+authorValue+'" type="text" placeholder="Enter here">',
                                        '<a href="javascript:;" class="delete-authorname delAdditionalAuthorName"></a>',
                                        '</li>']

                var tempWrapper = addAuthorNameTemplate.join('');
                var ss  = document.getElementById('addtionalAuthorName');
                ss.insertAdjacentHTML('beforeend', tempWrapper);
                currentnode.value = '';
            }else{
                return;
            }
        });
    }

    function delAdditionalAuthorName(){
        $(document).on('click','.delAdditionalAuthorName', function(e){
           e.target.parentElement.remove(e.target.parentElement);
        });
    }

    function pubMIDLock(){
        $(document).on('click','.pubMIDLock', function(e){
           var pubmedVal =  document.getElementsByClassName('pubMIDText')[0].value; 

           if(pubmedVal!=''){
            document.querySelector('.pubValShow').style.display = "block";
           }
        });
    }
    
    function pubmedDetailedSend(){
        $('.pubmedDetailedSend').on('click', function(){
            var tempWrapper, allReference, pubValText, getLastNo, sNo;
                
            pubValText = document.getElementsByClassName('pubValShow')[0].innerHTML;
            
            /*getLastNo = document.getElementsByClassName('ce_bib-reference'); 
            sNo  = getLastNo[getLastNo.length -1].childNodes[0].innerHTML;
            sNo++;*/

            getLastNo = $(".ce_bibliography-sec").find(".refpId:last").attr("sNo") || null; 
            if(getLastNo){
                sNo=parseInt(getLastNo)+1;
            }else{
                sNo=1;       
            }
            var incNo=0;
            incNo= parseInt(sNo);
            var addCanvasTemplate = [
                                           '<div class="ce_bib-reference refpId pubmed reference-insert" id="fur'+sNo+'" data-id="fur'+sNo+'" sNo="'+sNo+'" name="">',
                                              '<span class="ce_label" data-refType="pubmed"></span>',
                                              '<span class="x"></span>',
                                              '<span class="sb_author">'+pubValText+'</span>',
                                              '<span class="x"> </span>',
                                              '<span class="sb_date date" name=""></span>',
                                            '</div>'
                                        ],
                addReferenceTemplate = [
                                            '<div class="references-listitem refpId pubmed reference-insert" data-id="fur'+sNo+'" sNo="'+sNo+'" id="fur'+sNo+'">',
                                                        '<div class="references-list-detail">',
                                                            '<input type="checkbox" value="public" name="selectReference">',
                                                            '<div class="reference-author-div">',
                                                                '<span class="ref-number" data-reftype="null" data-refname="null" data-authordesc="null"></span>',
                                                                '<span class="ref-author-name refAuthors">'+pubValText+',</span>',
                                                                '<span class="ref-yearstamp refYear"></span>',
                                                                '<span class="ref-pagestamp refPages"></span>',
                                                                '<div class="ref-detail-view refDetailView" style="display:none">',
                                                                    '<p class="refFullText">'+ pubValText +'</p>',

                                                                    '<span class="ref-add editReferenceClick"></span>',
                                                                    '<span class="ref-delete referenceDeleteClick"></span>',
                                                                    '<div class="citation-count-listsplit footnote-annotaion refCiteWrapper">',
                                                                        '<ul class="refCiteList">',
                                                                            '<li class="refCiteNode" style="display:none">',
                                                                                '<span class="refCiteCount">0</span>',
                                                                                '<span class="citation-kill refCiteDel"></span></li>',
                                                                            '<li class="refCiteNode" style="display: block;" data-id="OPT_ID_1105">',
                                                                                '<span class="refCiteCount">1</span>',
                                                                                '<span class="citation-kill refCiteDel"></span>',
                                                                            '</li>',
                                                                        '</ul>',
                                                                    '</div>',
                                                                '</div>',
                                                            '</div>',
                                                            '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
                                                        '</div>',
                                                    '</div>'
                                        ];
            tempWrapper = document.createElement('div');
            tempWrapper.innerHTML = addCanvasTemplate.join('');
            tempRefWrapper = document.createElement('div');
            tempRefWrapper.innerHTML = addReferenceTemplate.join('');
            add(tempWrapper.firstChild.cloneNode(true),false,tempRefWrapper.innerHTML);
            var referenceParentNode = document.querySelector('.ce_bibliography-sec');
            allReference = referenceParentNode.querySelectorAll('.ce_bib-reference');
            allReference[allReference.length-1].parentNode.insertBefore(tempWrapper.firstChild,allReference[allReference.length-1].nextSibling);
            pubmedCancelBtn(true); 
        });
    }

    function pubmedCancelBtn(success){
        if(success == true){
            $('.pubmedCancelBtn').trigger( "click" );
        }
        $('.pubmedCancelBtn').on('click', function(){
            clearInputFileds('pubmIdForm');
            pubMedTab.classList.remove('active');
            document.querySelector('.referenceForm, .referenceFormContent').style.display = "none";
            document.querySelector('.pubmIdForm').style.display = "none";
        });
    }


    function referenceDetailedSend(){
        // var self = this;
        $('.referenceDetailedSend').on('click', function(){
            var tempWrapper, allReference, referenceType, referenceLabel, authorName, authorTitle, journalTitle, authorYear, authorVolume, authorIssue, authorPageRange, authorDOI,
            authorPubMedId, publisherStatus, getLastNo, sNo, authorNameAdd, authorNameAddText,authorNamesArr=[],authorNames;

            //authorNameAdd_len = document.getElementsByClassName('authorNameAdd').length;
            /*for(i=0;i<=authorNameAdd_len-1;i++){
                authorNameAddText += document.getElementsByClassName('authorNameAdd')[i].value + ',';
            }*/
            document.querySelector('.referenceLabel').parentNode.style.display = 'none';
            referenceType     = document.querySelector('input[name="referenceType"]:checked').value;
            referenceLabel    = document.getElementsByClassName('referenceLabel')[0].value; 
            authorName        = (document.getElementsByClassName('authorNameAdd')[0]!=undefined) ? document.getElementsByClassName('authorNameAdd')[0].value : document.getElementsByClassName('authorName')[0].value;  
            authorTitle       = self.textEditorData('detailed1'); 
            journalTitle      = self.textEditorData('detailed2'); 
            authorYear        = document.getElementsByClassName('authorYear')[0].value; 
            authorVolume      = document.getElementsByClassName('authorVolume')[0].value; 
            authorIssue       = document.getElementsByClassName('authorIssue')[0].value; 
            authorPageRange   = document.getElementsByClassName('authorPageRange')[0].value; 
            authorDOI         = document.getElementsByClassName('authorDOI')[0].value; 
            authorPubMedId    = document.getElementsByClassName('authorPubMedId')[0].value; 
            publisherStatus   = document.getElementsByClassName('publisherStatus')[0].value; 
             authorNamesArr.push(authorName);
            $(".authorNameAdd").each(function(i) {//.not(':first')
                authorNamesArr.push($(this).val());
            }); 

            var referenceName, isAdded=false;                
            
            var citaID=document.getElementsByClassName('referenceLabel')[0].getAttribute("citaID");
            var undoTemplate = [
                '<span data-undoID="'+citaID+'" class="undo-reference undoReferenceClick"></span>'
                ];

            var temppper = document.createElement('div');
            temppper.innerHTML = undoTemplate.join('');
            var bibReferenceLen=$('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]').length
            
            if(bibReferenceLen){
                isAdded=true;
                var removeCit =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]');
                var refNo =  $('.ce_bibliography-sec').find('.ce_bib-reference[id="'+citaID+'"]').attr("sNo")||null;
                if(removeCit.hasClass("text-strikethrough")){
                    referenceName=document.getElementsByClassName('referenceName')[0].getAttribute("reference");
                }else{
                    removeCit.removeClass('reference-insert'); 
                    removeCit.addClass('text-strikethrough');
                    removeCit[0].appendChild(temppper.firstChild);
                }
            }
            
            authorNames=authorNamesArr.join(',');
            getLastNo = $(".ce_bibliography-sec").find(".refpId:last").attr("sNo")||null;
            if(getLastNo){
                sNo=parseInt(getLastNo)+1;
            }else{
                sNo=1;       
            }                  
            //getLastNo = document.getElementsByClassName('ce_bib-reference'); 
            //sNo  = getLastNo[getLastNo.length -1].childNodes[0].innerHTML;
            var citeNo= refNo ? 'fur'+refNo : citaID ; 
            var idd = isAdded ? citeNo : 'fur'+ sNo;
                        var addCanvasTemplate = [
                                                        '<div class="ce_bib-reference refpId reference-insert" id="'+idd+'" sNo="'+ (isAdded ? refNo : sNo)+'"   name="">',                                                       
                                                          '<span class="sb_author" name="">'+authorName+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_reference_type" name="">'+referenceType+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_reference_label" name="">'+referenceLabel+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_title.atl .sb_maintitle" name="">'+authorTitle+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_title.sitl .sb_maintitle" name="">'+journalTitle+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_year" name="">'+authorYear+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_volume-nr" name="">'+authorVolume+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_issue-nr" name="">'+authorIssue+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_pages" name="">'+authorPageRange+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="sb_date" name="">'+authorDOI+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="ce_label1" name="">'+authorPubMedId+',</span>',
                                                          '<span class="x"> </span>',
                                                          '<span class="ce_label" name="">'+publisherStatus+',</span>',
                                                          '<span class="x"> </span>',
                                                        '</div>'
                                                    ]
                        var inserted= !isAdded ? 'reference-insert' : '';
                        var addReferenceTemplate = [
                                                    '<div class="references-listitem refpId '+inserted+'" data-id="'+idd+'" sNo="'+sNo+'" id="'+idd+'">',
                                                        '<div class="references-list-detail">',
                                                            '<input type="checkbox" value="public" name="selectReference">',
                                                            '<div class="reference-author-div">',
                                                                '<span class="ref-number" data-reftype="null" data-refname="null" data-authordesc="null"></span>',
                                                                '<span class="ref-author-name refAuthors">'+authorName+',</span>',
                                                                '<span class="ref-yearstamp refYear">'+authorYear+'</span>',
                                                                '<span class="ref-pagestamp refPages"></span>',
                                                                '<div class="ref-detail-view refDetailView" style="display:none">',
                                                                    '<p class="refFullText">'+ (authorName ? authorName+'.,':'') + (referenceType?referenceType+'.,':'') + (referenceLabel?referenceLabel+'.,':'') +'</p>',

                                                                    '<span class="ref-add editReferenceClick"></span>',
                                                                    '<span class="ref-delete referenceDeleteClick"></span>',
                                                                    '<div class="citation-count-listsplit footnote-annotaion refCiteWrapper">',
                                                                        '<ul class="refCiteList">',
                                                                            '<li class="refCiteNode" style="display:none">',
                                                                                '<span class="refCiteCount">0</span>',
                                                                                '<span class="citation-kill refCiteDel"></span></li>',
                                                                            '<li class="refCiteNode" style="display: block;" data-id="OPT_ID_1105">',
                                                                                '<span class="refCiteCount">1</span>',
                                                                                '<span class="citation-kill refCiteDel"></span>',
                                                                            '</li>',
                                                                        '</ul>',
                                                                    '</div>',
                                                                '</div>',
                                                            '</div>',
                                                            '<a class="arrow-action arrowBtn more" href="javascript:;"></a>',
                                                        '</div>',
                                                    '</div>'

                                                    ]
                        tempWrapper = document.createElement('div');
                        tempReferenceWrapper = document.createElement('div');
                        tempWrapper.innerHTML = addCanvasTemplate.join('');
                        tempReferenceWrapper.innerHTML = addReferenceTemplate.join('');
                        add(tempWrapper.firstChild.cloneNode(true),isAdded,tempReferenceWrapper.innerHTML);

                        var referenceParentNode = document.querySelector('.ce_bibliography-sec');
                        allReference = referenceParentNode.querySelectorAll('.ce_bib-reference');

                    if(!isAdded){
                        allReference[allReference.length-1].parentNode.insertBefore(tempWrapper.firstChild,allReference[allReference.length-1].nextSibling);
                    }else{
                        var editedText = document.getElementById(idd);
                        editedText.parentNode.insertBefore(tempWrapper.firstChild,editedText.nextSibling);
    
                    }
                        var success = true ;
                        detailedCancelBtn(success);
        });
    }

    function detailedCancelBtn(success){
        
        if(success == true){
            $('.detailedCancelBtn').trigger( "click" );
        }
        $('.detailedCancelBtn').on('click', function(){

            if($('.delAdditionalAuthorName').length!=0){
                $('.delAdditionalAuthorName').trigger('click');
            }   
            clearInputFileds('detailedForm');
            setRTEContent('authorTitleRTE', ''); 
            setRTEContent('journalTitleRTE', '');
            detailedTab.classList.remove('active');
            document.querySelector('.referenceLabel').parentNode.style.display = 'none';
            document.querySelector('.referenceForm, .referenceFormContent').style.display = "none";
            document.querySelector('.detailedForm').style.display = "none";
        });
    }

    function editDetailedCancelBtn(success){
        
        if(success == true){
            $('.editDetailedCancelBtn').trigger( "click" );
        }
        $('.editDetailedCancelBtn').on('click', function(){
            detailedTab.classList.remove('active');
            document.querySelector('input[name="referenceType"]').checked = false;
            document.getElementsByClassName('referenceLabel')[0].value = "" ;
            document.getElementsByClassName('authorName')[0].value = "";
            setRTEContent('authorTitleRTE', ''); 
            setRTEContent('journalTitleRTE', '');
            document.getElementsByClassName('authorYear')[0].value=""; 
            document.getElementsByClassName('authorVolume')[0].value=""; 
            document.getElementsByClassName('authorIssue')[0].value=""; 
            document.getElementsByClassName('authorPageRange')[0].value=""; 
            document.getElementsByClassName('authorDOI')[0].value=""; 
            document.getElementsByClassName('authorPubMedId')[0].value=""; 
            document.getElementsByClassName('publisherStatus')[0].value=""; 
            //document.getElementsById('addtionalAuthorName').innerHTML = "";
            
            document.querySelector('.editDetailedForm').style.display = "none";
            document.querySelector('.editReferenceFormContent').style.display = "none";
        });
    }

    function add(tempReferenceNode,isAdded,refDom){
        var tempWrapper = document.createElement('span');
        tempWrapper.innerHTML = referencePanelTemplate.join('');
        addReference(tempReferenceNode, tempWrapper);
        this.element = tempWrapper;
        // this.container.appendChild(this.element);
        this.element.querySelector('.cloneRef').outerHTML = '';
        var ref_list = document.querySelectorAll('.refListItem');
        var refId=tempReferenceNode.getAttribute("id");
        if(!isAdded){
            ref_list[ref_list.length-1].parentNode.insertBefore(this.element.querySelector('.refListItem'),ref_list[ref_list.length-1].nextSibling)    
        }else{
            var refIdList= document.querySelectorAll('.references-listitem[data-id="'+refId+'"]');
            //if(!refDom){                
            //    $(refIdList).replaceWith($(tempReferenceNode));
            //}else{//}
                $(refIdList).replaceWith($(refDom));    
            /*var refIdList= document.querySelectorAll('.refListItem[data-id="'+refId+'"]');
            refIdList.forEach(function(singleReference){
                singleReference.parentNode.replaceChild(this.element.querySelector('.refListItem'), singleReference);
            });*/
        }
        
    }

    function intiFunctions(){
        citClick();
        addReferenceClick(this);
        cancelReferenceBtn(this);
        addReferenceBtn(this);
        filterReference();
        freeTextTabClick(this);
        detailedTabClick(this);
        pubMedTabClick(this);
        referenceDetailedSend(this);
        detailedCancelBtn(this);
        addMoreAuthorName(this);
        delAdditionalAuthorName(this);
        pubMIDLock(this);
        pubmedDetailedSend(this);
        pubmedCancelBtn(this);
        referenceDeleteClick(this);
        referenceDelCancelPopUp(this);
        findAncestor(this);
        refernceDeleteConform(this);
        undoReferenceClick(this);
        unSelectReference();
        editReferenceClick(this);
        editDetailedTabClick(this);
        editDetailedCancelBtn(this);
        bindClickMultiCite();
    }

    function setRTETextBox(val){
        var RTETextAppears = ['freeText', 'detailed1', 'detailed2'], self = val,
            placeholderMessage = {'freeText':'Enter reference description', 'detailed1':'Enter Author Title', 'detailed2':'Enter Journal Title'};
        RTETextAppears.forEach(function(singleValue){
               self.rteContainer = {};
                self.rteContainer[singleValue] = self.htmlDoc.querySelector('.'+editReferenceRTE[singleValue]);
                self.rte[singleValue] = new RTE(self.win, self.htmlDoc, self.rteContainer[singleValue],
                    {
                        'allowedContent': 'b i sub sup span(smallcaps,mono)',
                        'placeholder': placeholderMessage[singleValue],
                        'height': '110px'
                    }
                );
                self.rte[singleValue].render();
                self.rte[singleValue].setErrorCallback(rteErrorCallback);
                self.clearRTE[singleValue] = clearRTE.bind(self);
        });
        
    }

    function referencePanel(referenceContainer, eventBus, win, doc) {
        var actorType;

        if (referenceContainer instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        initializeVariables(this);
        this.container = referenceContainer;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        self = this;
    }
    
    referencePanel.prototype.render = function render() {
        var tempWrapper,
            instance = this,
            qs = this.container.querySelector.bind(this.container);

        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = referencePanelTemplate.join('');
        this.tempWrapper = tempWrapper;
        self = this;
        getAllReferences(this.tempWrapper);
        this.element = this.tempWrapper;
        setRTETextBox(this);
        this.tempWrapper.addEventListener('click', onLabelClick, false);
        this.htmlDoc.body.appendChild(this.tempWrapper);
        this.element.innerHTML = notifyAlertTemplate.join('') + this.element.innerHTML+ buttonLabel.join('');
        this.container.appendChild(this.element);
        setTopPosition(this);
        intiFunctions();
    };

    referencePanel.prototype.expand = function expand(){
        onLabelClick();
    };

    referencePanel.prototype.textEditorData = function textEditorData(refForm){
        return getRTEData(self.rte[refForm]);
    }

    referencePanel.prototype.self = self;
    return referencePanel;
});



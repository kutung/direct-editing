define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper','scripts/EventBus'], function DOILinksLoader(
    TreePanel, TreeModel, Helper,EventBus) {
    'use strict';

    var DOITemplate = [
        '<div class="link-tabs-cnt">',
                '<div class="url-link-tabs">',
                '<div class="links-cnt-view">',
                    '<div class="link-notification-alert"><p><strong>Select Doi Link(s) to Cite</strong></p></div>',
                        '<div class="link-listitem urlListItem">',
                            '<div class="link-list-detail">',
                                '<input type="radio" id="test12" value="public" class="radioBtnDOIClick" name="selectReference">',
                                '<div class="link-ref-list">',
                                    '<span style="color: #e53a30" class="link-url-name">http://dx.doi.org/10.1016/j.rser.2015.05.067</span>',
                                    '<div class="link-detail-view" >',
                                        '<p class="">http://dx.doi.org/10.1016/j.rser.2015.05.067</p>',
                                        '<span class="link-edit-btn DOIedit"></span>',
                                        '<span class="link-delete-btn DOIDelBtn"></span>',
                                    '</div>',
                                '</div>',
                                '<a class="arrow-action " href="javascript:;"></a>',
                            '</div>',
                        '</div>',
                        '<div class="link-listitem urlListItem urlListItem1">',
                            '<div class="link-list-detail">',
                                '<input type="radio" id="test12" value="public" class="radioBtnDOIClick" name="selectReference">',
                                '<div class="link-ref-list">',
                                    '<span class="link-url-name">http://dx.doi.org/10.1016/j.rser.2015.05.067</span>',
                                    '<div class="link-detail-view" >',
                                        '<p class="">http://dx.doi.org/10.1016/j.rser.2015.05.067</p>',
                                        '<span class="link-edit-btn DOIedit"></span>',
                                        '<span class="link-delete-btn DOIDelBtn"></span>',
                                    '</div>',
                                '</div>',
                                '<a class="arrow-action " href="javascript:;"></a>',
                            '</div>',
                        '</div>',
                    '</div>',
                '<div class="ex-ulr-btn doi-btn-group">',
                    '<button class="url-btn addDOIBtn">ADD DOI LINKS</button>',
                '</div>',
                '<div class="db-add-link-btn-group DOICiteBtn" style="display: none">',
                    '<span class="db-esc-btn DOIExit"><small>ESC</small></span>',
                    '<button class="db-add-link-btn DOIAddCite">Add Link</button>',
                '</div>',
                '</div>',
            '</div>'
        ];

    var AddDOITemplate = [
        
                    '<div class="edit-link-section">',
                        '<div class="ex-edit-doi">',
                            '<h2 class="ex-edit-title UrlTitle"></h2>',
                            '<div class="ex-edit-form">',
                                '<ul>',
                                    '<li>',
                                        '<label class="ex-edit-label">Web Address </label>',
                                        '<textarea class="ex-edit-textarea webAddressValue"></textarea>',
                                    '</li>',
                                    '<li class="linkToWrapper" style="display: none">',
                                        '<label class="ex-edit-label">Link to</label>',
                                        '<input class="ex-edit-input linkToTxt" value="" type="text" >',
                                    '</li>',
                                '</ul>',
                            '</div>',
                            '<div class="ex-edit-btn-group">',
                                '<button class="ex-btn-cancel urlCancelBtn">Cancel</button>',
                                '<button class="ex-btn-update UrlBtn DOISubmitUrl"></button>',
                            '</div>',
                        '</div>',
                    '</div>'
                ]; 

    var EditDOITemplate = [
        
                    '<div class="edit-link-section">',
                        '<div class="ex-edit-doi">',
                            '<h2 class="ex-edit-title">Edit Url DOI</h2>',
                            '<div class="ex-edit-form">',
                                '<ul>',
                                    '<li>',
                                        '<label class="ex-edit-label">Web Address </label>',
                                        '<textarea class="ex-edit-textarea webAddressValue">http://dx.doi.org/10.1016/j.rser.2015.05.067</textarea>',
                                    '</li>',
                                    '<li class="linkToWrapper">',
                                        '<label class="ex-edit-label">Link to</label>',
                                        '<input class="ex-edit-input linkToTxt" value="" type="text" >',
                                    '</li>',
                                '</ul>',
                            '</div>',
                            '<div class="ex-edit-btn-group">',
                                '<button class="ex-btn-cancel urlCancelBtn">Cancel</button>',
                                '<button class="ex-btn-update DOISubmitUrl">Update</button>',
                            '</div>',
                        '</div>',
                    '</div>'
                ];             

    var UrlAddTitle = 'Add Url DOI';
    var UrlAddBtn   = 'Add';   
    var UrlEditTitle = 'Edit Url DOI';
    var UrlEditBtn   = 'Update';         

    
    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.tree = null;
        instance.container = null;
        instance.eventBus = null;
    }

    function DoiLinks(doiInnerTab, EventBus, win, doc, localeData) {
        initializeVariables(this);
        
        if (doiInnerTab instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        
        this.container = doiInnerTab;
        this.localeData = localeData;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = EventBus;
    } 

    function addDOIClick(){

        var getWebAddrVal, uniqueUrlID,addDOIListTemp, tempItem, getlinkToTxtVal, rcpLinkID;

            getWebAddrVal = $('.webAddressValue').val();

        //add click
        $(document).off('click','.addDOIBtn').on('click','.addDOIBtn', function(e){    
            tempItem = document.createElement('span');
            tempItem.innerHTML = AddDOITemplate.join('');
            tempItem = tempItem.firstChild;
            document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

            $('.UrlTitle')[0].innerText = UrlAddTitle;
            $('.UrlBtn')[0].innerText   = UrlAddBtn;
        });

        //edit click
        $(document).off('click','.DOIedit').on('click','.DOIedit', function(e){    
                
                tempItem = document.createElement('span');
                tempItem.innerHTML = EditDOITemplate.join('');
                tempItem = tempItem.firstChild;
                document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

        }); 

        $(document).off('click','.DOISubmitUrl').on('click','.DOISubmitUrl', function(e){    
            document.getElementsByClassName('LinksDetails')[0].innerHTML="";
            $('.urlListItem').removeClass('active');
        });  

        DOIAddCiteClick(this) ;
        DOILinkCiteClick(this);   

    } 

    function DOIAddCiteClick(e){

        $(document).off('mouseup','.DOIAddCite').on('mouseup','.DOIAddCite', function(e){

            var sel = window.getSelection();
            if(document.querySelectorAll('.cursor').length!='0'){

                var newItem     = document.createElement('a');
                var linkText    = document.createTextNode("http://dx.doi.org/10.1016/j.rser.2015.05.067");
                newItem.appendChild(linkText);
                newItem.title   = "http://dx.doi.org/10.1016/j.rser.2015.05.067";
                newItem.href    = "http://dx.doi.org/10.1016/j.rser.2015.05.067";
                document.getElementsByClassName('cursor')[0].before(newItem);
            }
            else if(!sel.isCollapsed){
                var range = sel.getRangeAt(0);
                
                var newItem     = document.createElement('a');
                var linkText    = document.createTextNode("http://dx.doi.org/10.1016/j.rser.2015.05.067");
                newItem.appendChild(linkText);
                newItem.title   = "http://dx.doi.org/10.1016/j.rser.2015.05.067";
                newItem.href    = "http://dx.doi.org/10.1016/j.rser.2015.05.067";
                sel.focusNode.before(newItem)
                
            } 
               
        });    
   
    } 

    function DOILinkCiteClick(){
        $(document).off('click','.radioBtnDOIClick').on('click','.radioBtnDOIClick', function(){    
           $('.DOICiteBtn').attr('style', 'display:block');
           $('.addDOIBtn').attr('style', 'display:none');
        }); 

        $(document).off('click','.DOIExit').on('click','.DOIExit', function(){    
           $('.DOICiteBtn').attr('style', 'display:none');
           $('.addDOIBtn').attr('style', 'display:block');
           $('.radioBtnDOIClick').prop('checked', false);
        });

        DOIAddCiteClick(this);        
    }  

    function DOIListItemClick(){
        if(!$('.urlListItem').hasClass('active')){
            $(document).off('click','.urlListItem').on('click','.urlListItem', function(e){    
                $('.urlListItem').removeClass('active');
                e.target.parentElement.parentElement.parentElement.classList.add('active')
            }); 
        } 

        $(document).off('click','.DOIDelBtn').on('click','.DOIDelBtn', function(){  

            document.querySelector('.popupWrapper').style.display = "block";
            $('.popupWrapper').removeClass("message-sucess-alert");
            var urlDeletePopUp = [
                                
                                '<h1 class="popup-title">Confirm the delete</h1>',
                                '<div class="citations-wrapper">',
                                    '<p class="citation-counts">This change will affect <span>1</span>Citations </p>',
                                '</div>',
                                '<div class="delete-or-not">',
                                    '<p class="delete-or-not-text">Are you sure you want to delete</p>',
                                    '<h4 class="delete-or-notinstruct">http://dx.doi.org/10.1016/j.rser.2015.05.067 ?</h4>',
                                '</div>',
                                '<div class="instruction-btns">',
                                    '<span class="instruction-confirm-btn urlconfirmDel">Confirm</span>',
                                    '<span class="instruction-cancel-btn urlCancelDel">Cancel</span>',
                                '</div>'
                                        ]

            var tempWrapper = document.createElement('div');
            tempWrapper = urlDeletePopUp.join('');
            
            var d1 = document.getElementById('PopUpContent');
            d1.insertAdjacentHTML('beforeend', tempWrapper);

        });

        $(document).off('click','.urlconfirmDel').on('click','.urlconfirmDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
            $('.urlListItem1').remove();
        }); 

        $(document).off('click','.urlCancelDel').on('click','.urlCancelDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
        }); 
    }    

    DoiLinks.prototype.render = function render() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = DOITemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        
        document.body.appendChild(this.element);
        this.container.appendChild(this.element);

        addDOIClick(this);
        DOIListItemClick(this);
        
    };

    return DoiLinks;
});

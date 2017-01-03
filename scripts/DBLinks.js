define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper','scripts/EventBus'], function DBLinksLoader(
    TreePanel, TreeModel, Helper,EventBus) {
    'use strict';

    var DBTemplate = [
    '<div class="link-tabs-cnt">',
            '<div class="url-link-tabs">',
            '<div class="links-cnt-view">',
                '<div class="link-notification-alert"><p><strong>Select DB Link(s) to Cite</strong></p></div>',
                    '<div class="link-listitem link-select-item">',
                        '<div class="link-list-detail">',
                            '<input type="radio" id="test10" value="public" name="selectReference">',
                            '<div class="link-ref-list">',
                                '<span class="link-url-name">http://dx.doi.org/10.1016/j.rser.2015.05.067</span>',
                            '</div>',
                            '<a class="arrow-action" href="javascript:;"></a>',
                        '</div>',
                    '</div>',
                    '<div class="link-listitem urlListItem urlListItemDB">',
                        '<div class="link-list-detail">',
                            '<input type="radio" id="test12"  value="public" class="radioDBClick" name="selectReference">',
                            '<div class="link-ref-list">',
                                '<span class="link-url-name">http://dx.doi.org/10.1016/j.rser.2015.05.067</span>',
                                '<div class="link-detail-view" >',
                                    '<p class="">http://dx.doi.org/10.1016/j.rser.2015.05.067</p>',
                                    '<span class="link-edit-btn DBedit"></span>',
                                    '<span class="link-delete-btn DBDelBtn"></span>',
                                '</div>',
                            '</div>',
                            '<a class="arrow-action" href="javascript:;"></a>',
                        '</div>',
                    '</div>',
                    '</div>',
                   '<div class="ex-ulr-btn doi-btn-group">',
                    '<button class="url-btn addDBBtn">ADD DB LINKS</button>',
                '</div>',
                '<div class="db-add-link-btn-group DBCiteBtn" style="display: none">',
                    '<span class="db-esc-btn DBExit"><small>ESC</small></span>',
                    '<button class="db-add-link-btn DOIAddCite">Add Link</button>',
                '</div>',
                '</div>',
                 '</div>',
            '</div>'      
        ];

        var AddDBTemplate = [
        
                    '<div class="edit-link-section">',
                        '<div class="ex-edit-doi">',
                            '<h2 class="ex-edit-title">Add Url DB</h2>',
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
                                '<button class="ex-btn-update UrlBtn DOISubmitUrl">Add</button>',
                            '</div>',
                        '</div>',
                    '</div>'
                ];

        var EditDBTemplate = [
        
                    '<div class="edit-link-section">',
                        '<div class="ex-edit-doi">',
                            '<h2 class="ex-edit-title">Edit Url DB</h2>',
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

    
    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.tree = null;
        instance.container = null;
        instance.eventBus = null;
    }

    function DBLinks(dBInnerTab, EventBus, win, doc, localeData) {
        initializeVariables(this);
        
        if (dBInnerTab instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        
        this.container = dBInnerTab;
        this.localeData = localeData;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = EventBus;
    }    

    function addDBClick(){

        var getWebAddrVal, uniqueUrlID,addDOIListTemp, tempItem, getlinkToTxtVal, rcpLinkID;

            getWebAddrVal = $('.webAddressValue').val();

        //add click
        $(document).off('click','.addDBBtn').on('click','.addDBBtn', function(e){    
            tempItem = document.createElement('span');
            tempItem.innerHTML = AddDBTemplate.join('');
            tempItem = tempItem.firstChild;
            document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

        });

        //edit click
        $(document).off('click','.DBedit').on('click','.DBedit', function(e){    
                
                tempItem = document.createElement('span');
                tempItem.innerHTML = EditDBTemplate.join('');
                tempItem = tempItem.firstChild;
                document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

        }); 

        $(document).off('click','.DOISubmitUrl').on('click','.DOISubmitUrl', function(e){    
            document.getElementsByClassName('LinksDetails')[0].innerHTML="";
            $('.urlListItem').removeClass('active');
        });  

        DOILinkCiteClick(this);

    } 

    function DOILinkCiteClick(){
        $(document).off('click','.radioDBClick').on('click','.radioDBClick', function(){    
           $('.DOICiteBtn').attr('style', 'display:block');
           $('.addDBBtn').attr('style', 'display:none');
        }); 

        $(document).off('click','.DBExit').on('click','.DBExit', function(){    
           $('.DOICiteBtn').attr('style', 'display:none');
           $('.addDBBtn').attr('style', 'display:block');
           $('.radioDBClick').prop('checked', false);
        });

    }  

        if(!$('.urlListItem').hasClass('active')){
            $(document).off('click','.urlListItem').on('click','.urlListItem', function(e){    
                $('.urlListItem').removeClass('active');
                e.target.parentElement.parentElement.parentElement.classList.add('active')
            }); 
        } 

        $(document).off('click','.DBDelBtn').on('click','.DBDelBtn', function(){  

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
                                    '<span class="instruction-confirm-btn DBconfirmDel">Confirm</span>',
                                    '<span class="instruction-cancel-btn urlCancelDel">Cancel</span>',
                                '</div>'
                                        ]

            var tempWrapper = document.createElement('div');
            tempWrapper = urlDeletePopUp.join('');
            
            var d1 = document.getElementById('PopUpContent');
            d1.insertAdjacentHTML('beforeend', tempWrapper);

        });

        $(document).off('click','.DBconfirmDel').on('click','.DBconfirmDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
            $('.urlListItemDB').remove();
        }); 

        $(document).off('click','.urlCancelDel').on('click','.urlCancelDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
        }); 



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
   
    

    DBLinks.prototype.render = function render() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = DBTemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        
        document.body.appendChild(this.element);
        this.container.appendChild(this.element);
        addDBClick();
        
    };

    return DBLinks;
});

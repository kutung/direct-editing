define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper','scripts/EventBus'], function UrlLinksLoader(
    TreePanel, TreeModel, Helper,EventBus) {
    'use strict';

    var URLTemplate = [
        '<div class="link-tabs-cnt">',
            '<div class="url-link-tabs">',
                '<div class="links-cnt-view">',
                    '<div class="link-notification-alert"><p><strong>Select Url Link(s) to Cite</strong></p></div>',
                    '<div class="link-listitem urlListItem">',
                        '<div class="link-list-detail">',
                            '<input type="radio" id="test8" value="public" class="urlRadioBtnClick" name="selectReference">',
                            '<div class="link-ref-list">',
                                '<span style="color: #e53a30" class="link-url-name">http://www.sciencedirect.com/science/arti</span>',
                                '<div class="link-detail-view" >',
                                    '<p class="">http://www.sciencedirect.com/science/arti</p>',
                                    '<span class="link-edit-btn urlEdit"></span>',
                                    '<span class="link-delete-btn urlDelBtn"></span>',
                                '</div>',
                            '</div>',
                        '<a class="arrow-action " href="javascript:;"></a>',
                        '</div>',
                    '</div>',
                    '<div class="link-listitem urlListItem urlListItem-1">',
                        '<div class="link-list-detail">',
                            '<input type="radio" id="test18" value="public" class="urlRadioBtnClick" name="selectReference">',
                            '<div class="link-ref-list">',
                                '<span class="link-url-name">http://www.sciencedirect.com/science/arti</span>',
                                '<div class="link-detail-view" >',
                                    '<p class="">http://www.sciencedirect.com/science/arti</p>',
                                    '<span class="link-edit-btn urlEdit"></span>',
                                    '<span class="link-delete-btn urlDelBtn"></span>',
                                '</div>',
                            '</div>',
                        '<a class="arrow-action " href="javascript:;"></a>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="ex-ulr-btn AddUrlButton">',
                    '<button class="url-btn addUrlBtn">ADD URL</button>',
                '</div>',
                '<div class="db-add-link-btn-group urlCiteBtn" style="display: none">',
                    '<span class="db-esc-btn UrlExit"><small>ESC</small></span>',
                    '<button class="db-add-link-btn UrlAddCite">Add Link</button>',
                '</div>',
            '</div>',
        '</div>'
        ];

    var AddURLTemplate = [
        
                    '<div class="edit-link-section UrlId">',
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
                                '<button class="ex-btn-update UrlBtn submitUrl"></button>',
                            '</div>',
                        '</div>',
                    '</div>'
                ]; 

    var UrlAddTitle = 'Add Url Link';
    var UrlAddBtn   = 'Add';   
    var UrlEditTitle = 'Edit Url Link';
    var UrlEditBtn   = 'Update';               

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.localeData = null;
        instance.tree = null;
        instance.container = null;
        instance.eventBus = null;
    }

    function UrlLinks(urlInnerTab, EventBus, win, doc, localeData) {
        initializeVariables(this);
        
        if (urlInnerTab instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        
        this.container = urlInnerTab;
        this.localeData = localeData;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = EventBus;
    } 

    function addUrlClick(){
        var tempItem;

        //add click
        $(document).off('click','.addUrlBtn').on('click','.addUrlBtn', function(e){    
                tempItem = document.createElement('span');
                tempItem.innerHTML = AddURLTemplate.join('');
                tempItem = tempItem.firstChild;
                document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

                $('.UrlTitle')[0].innerText = UrlAddTitle;
                $('.UrlBtn')[0].innerText   = UrlAddBtn;
        });  

        //edit click
        $(document).off('click','.urlEdit').on('click','.urlEdit', function(e){    
                
                var tempItem, getWebVal, getLinktoVal, getUrlID;
                tempItem = document.createElement('span');
                tempItem.innerHTML = AddURLTemplate.join('');
                tempItem = tempItem.firstChild;
                document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);
                
                $('.UrlTitle')[0].innerText = UrlEditTitle;
                $('.UrlBtn')[0].innerText   = UrlEditBtn;
                document.getElementsByClassName('linkToWrapper')[0].style="block";

                getWebVal    =  $(e.target).prev()[0].innerText;
                getLinktoVal =  $(e.target).prev()[0].getAttribute('data-linkto');
                
                if(!getLinktoVal==""){
                    $('.linkToTxt').val(getLinktoVal);
                }    
                $('.webAddressValue').val(getWebVal);

                getUrlID = e.target.parentNode.parentNode.parentNode.parentNode.getAttribute('data-urllinkid');
                $('.UrlId').attr('data-editurlid',getUrlID);
        });



        $(document).off('click','.submitUrl').on('click','.submitUrl', function(e){    
            
            var getWebAddrVal, uniqueUrlID,addUrlListTemp, tempItem, getlinkToTxtVal, rcpLinkID;

            var editlenID = $('.UrlId')[0].getAttribute('data-editurlid');
            getWebAddrVal = $('.webAddressValue').val();

            if(editlenID === null){ //add link
                uniqueUrlID = Math.round(Math.random()*8000) + 1
                getlinkToTxtVal = "";
            }
            else{ //edit link
                uniqueUrlID = editlenID;
                getlinkToTxtVal = $('.linkToTxt').val();

                $('.urlListItem').each(function(){
                    rcpLinkID = $(this)[0].getAttribute('data-urllinkid');
                    if(rcpLinkID == editlenID ){
                        $(this)[0].remove();
                    }    
                })
            }

            /*addUrlListTemp = [
                    '<div class="link-list-detail">',
                        '<input type="radio" id="test8" value="public" class="urlRadioBtnClick" name="selectReference">',
                        '<div class="link-ref-list">',
                            '<span class="link-url-name">'+getWebAddrVal+'</span>',
                            '<div class="link-detail-view" >',
                                '<span class="link-url-name" data-linkto="'+getlinkToTxtVal+'">'+getWebAddrVal+'</span>',
                                '<span class="link-edit-btn urlEdit"></span>',
                                '<span class="link-delete-btn urlDelBtn"></span>',
                            '</div>',
                        '</div>',
                        '<a class="arrow-action " href="javascript:;"></a>',
                    '</div>'
            ];

            document.getElementsByClassName('LinksDetails')[0].innerHTML="";

            tempItem = document.createElement('div');
            tempItem.className = "link-listitem urlListItem";
            tempItem.setAttribute('data-urllinkid', uniqueUrlID);
            tempItem.innerHTML = addUrlListTemp.join('');
            document.getElementsByClassName('links-cnt-view')[0].appendChild(tempItem);*/
            document.getElementsByClassName('LinksDetails')[0].innerHTML="";
            urlListItemClick(this);
            urlAddCiteClick(this); 
        });  
    }  

    function cancelUrlClick(){
        $(document).off('click','.urlCancelBtn').on('click','.urlCancelBtn', function(e){    
            document.getElementsByClassName('LinksDetails')[0].innerHTML="";
        });  
    }    

    function urlListItemClick(){

        if(!$('.urlListItem').hasClass('active')){
            $(document).off('click','.urlListItem').on('click','.urlListItem', function(e){    
                $('.urlListItem').removeClass('active');
                e.target.parentElement.parentElement.parentElement.classList.add('active')
            }); 
        } 

        $(document).off('click','.urlDelBtn').on('click','.urlDelBtn', function(){  

            document.querySelector('.popupWrapper').style.display = "block";
            $('.popupWrapper').removeClass("message-sucess-alert");
            var urlDeletePopUp = [
                                
                                '<h1 class="popup-title">Confirm the delete</h1>',
                                '<div class="citations-wrapper">',
                                    '<p class="citation-counts">This change will affect <span>1</span>Citations </p>',
                                '</div>',
                                '<div class="delete-or-not">',
                                    '<p class="delete-or-not-text">Are you sure you want to delete</p>',
                                    '<h4 class="delete-or-notinstruct">http://vzturl.com/apa83 ?</h4>',
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
            $('.urlListItem-1').remove();
        }); 

        $(document).off('click','.urlCancelDel').on('click','.urlCancelDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
        }); 

    }  

    $(document).off('click','.urlRadioBtnClick').on('click','.urlRadioBtnClick', function(){    
           $('.urlCiteBtn').attr('style', 'display:block');
           $('.AddUrlButton').attr('style', 'display:none');
        }); 

        $(document).off('click','.UrlExit').on('click','.UrlExit', function(){    
           $('.urlCiteBtn').attr('style', 'display:none');
           $('.AddUrlButton').attr('style', 'display:block');
           $('.urlRadioBtnClick').prop('checked', false);
        });

    function urlAddCiteClick(e){

        $(document).off('mouseup','.UrlAddCite').on('mouseup','.UrlAddCite', function(e){

            var sel = window.getSelection();
            if(document.querySelectorAll('.cursor').length!='0'){

                var newItem     = document.createElement('a');
                var linkText    = document.createTextNode("http://www.sciencedirect.com/science/arti");
                newItem.appendChild(linkText);
                newItem.title   = "http://www.sciencedirect.com/science/arti";
                newItem.href    = "http://www.sciencedirect.com/science/arti";
                document.getElementsByClassName('cursor')[0].before(newItem);
            }
            else if(!sel.isCollapsed){
                var range = sel.getRangeAt(0);
                
                var newItem     = document.createElement('a');
                var linkText    = document.createTextNode("http://www.sciencedirect.com/science/arti");
                newItem.appendChild(linkText);
                newItem.title   = "http://www.sciencedirect.com/science/arti";
                newItem.href    = "http://www.sciencedirect.com/science/arti";
                sel.focusNode.before(newItem)
                
            } 
               
        });    
   
    }  

    UrlLinks.prototype.render = function render() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = URLTemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        document.body.appendChild(this.element);
        this.container.appendChild(this.element);

        addUrlClick(this);
        cancelUrlClick(this);
                
    };

    return UrlLinks;
});

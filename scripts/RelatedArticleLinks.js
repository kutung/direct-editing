define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper','scripts/EventBus'], function RelatedLinksLoader(
    TreePanel, TreeModel, Helper,EventBus) {
    'use strict';

    var RelatedArticleTemplate = [
    '<div class="link-tabs-cnt">',
            '<div class="url-link-tabs">',
            '<div class="links-cnt-view">',
                '<div class="link-listitem urlListItem RDListItem">',
                    '<div class="link-list-detail">',
                        '<div class="link-ref-list">',
                            '<span class="link-url-name">Environmental assessment of energy production from</span>',
                            '<div class="link-detail-view" >',
                                '<p class="related-art-info-msg">Environmental assessment of energy production fromlandll gas plants by using Long-range Energy AlternativePlanning (LEAP) and IPCC methane estimation methods: Acase study of Tehran</p>',
                                '<p class="link-msg-strong"><strong>Nojedehi P., Heidari M., Ataei A., Nedaei M., Kurdestani E. Sustainable Energy Technologies and Assessments, Volume 16, 1 August 2016</strong></p>',
                                '<span class="link-delete-btn RDDelBtn"></span>',
                            '</div>',
                        '</div>',
                        '<a class="arrow-action " href="javascript:;"></a>',
                    '</div>',
                '</div>',
                '</div>',
                '<div class="ex-ulr-btn doi-btn-group">',
                    '<button class="url-btn AddRelatedArticle">Add related article</button>',
                '</div>',
                '</div>',
            '</div>'
        ];

        var AddArticleTemplate = [
        
                    '<div class="edit-link-section">',
                        '<div class="ex-edit-doi">',
                            '<h2 class="ex-edit-title">Add related article</h2>',
                            '<div class="ex-edit-form">',
                                '<ul>',
                                    '<li>',
                                        '<label class="ex-edit-label">Content </label>',
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
                            '<h2 class="ex-edit-title">Edit Related Article</h2>',
                            '<div class="ex-edit-form">',
                                '<ul>',
                                    '<li>',
                                        '<label class="ex-edit-label">Content </label>',
                                        '<textarea class="ex-edit-textarea webAddressValue">http://dx.doi.org/10.1016/j.rser.2015.05.067</textarea>',
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

    function RelatedArticleLinks(relatedArtInnerTab, EventBus, win, doc, localeData) {
        initializeVariables(this);
        
        if (relatedArtInnerTab instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        
        this.container = relatedArtInnerTab;
        this.localeData = localeData;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = EventBus;
    }    

    RelatedArticleLinks.prototype.render = function render() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = RelatedArticleTemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        
        document.body.appendChild(this.element);
        this.container.appendChild(this.element);


        var getWebAddrVal, uniqueUrlID,addDOIListTemp, tempItem, getlinkToTxtVal, rcpLinkID;

            getWebAddrVal = $('.webAddressValue').val();

        //add click
        $(document).off('click','.AddRelatedArticle').on('click','.AddRelatedArticle', function(e){    
            tempItem = document.createElement('span');
            tempItem.innerHTML = AddArticleTemplate.join('');
            tempItem = tempItem.firstChild;
            document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

        });

         //edit click
        $(document).off('click','.RAedit').on('click','.RAedit', function(e){    
                
                tempItem = document.createElement('span');
                tempItem.innerHTML = EditDBTemplate.join('');
                tempItem = tempItem.firstChild;
                document.getElementsByClassName('LinksDetails')[0].appendChild(tempItem);

        }); 

        $(document).off('click','.RDDelBtn').on('click','.RDDelBtn', function(){  

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
                                    '<span class="instruction-confirm-btn RDconfirmDel">Confirm</span>',
                                    '<span class="instruction-cancel-btn urlCancelDel">Cancel</span>',
                                '</div>'
                                        ]

            var tempWrapper = document.createElement('div');
            tempWrapper = urlDeletePopUp.join('');
            
            var d1 = document.getElementById('PopUpContent');
            d1.insertAdjacentHTML('beforeend', tempWrapper);

        });

        $(document).off('click','.RDconfirmDel').on('click','.RDconfirmDel', function(){ 
            document.querySelector('.popupWrapper').style.display = "none";
            document.getElementById('PopUpContent').innerHTML="";
            $('.RDListItem').remove();
        });

        if(!$('.urlListItem').hasClass('active')){
            $(document).off('click','.urlListItem').on('click','.urlListItem', function(e){    
                $('.urlListItem').removeClass('active');
                e.target.parentElement.parentElement.parentElement.classList.add('active')
            }); 
        } 
        
    };

    return RelatedArticleLinks;
});

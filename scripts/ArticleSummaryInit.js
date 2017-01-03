define([
    'scripts/EventBus', 'scripts/Helper', 'scripts/ArticleSummary',
    'scripts/ConfigReader'
], function ArticleInitLoader(
    EventBus, Helper, ArticleSummary,  Config
) {

    var articleInfo = {}, fundInfo = {}, fundInfoData = [], fundId = 0;
    articleMetaTemplate = [ 
        '<div class="artical-metadate-cnt">',
            '<h2 class="meta-edit-title">Edit Article Metadata</h2>',
            '<div class="meta-form-group">',
                '<ul>',
                    '<li>',
                        '<label class="form-label">Article ID</label>',
                        '<input class="form-input articleID" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">DOI</label>',
                        '<input class="form-input articleDOI" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">TOC Head</label>',
                        '<input class="form-input articleTOC" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Heading</label>',
                        '<input class="form-input articleHeading" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<div class="form-col-3">',
                            '<div class="form-group-col">',
                                '<label class="form-label">Collection code 1</label>',
                                '<input class="form-input articleColl_1" value="" type="text" placeholder="Enter here">',
                            '</div>',
                            '<div class="form-group-col">',
                                '<label class="form-label">Collection code 2</label>',
                                '<input class="form-input articleColl_2" value="" type="text" placeholder="Enter here">',
                            '</div>',
                            '<div class="form-group-col">',
                                '<label class="form-label">Collection code 3</label>',
                                '<input class="form-input articleColl_3" value="" type="text" placeholder="Enter here">',
                            '</div>',
                        '</div>',
                        '<div class="clearfix"></div>',
                    '</li>',
                       '<li>',
                        '<label class="form-label">Online Publishing date</label>',
                        '<input class="form-input articleOPD" value="" type="text" placeholder="DD / MM / YY">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Elocation ID</label>',
                        '<input class="form-input articleEID" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<div class="form-col-2">',
                            '<div class="form-group-col">',
                                '<label class="form-label">Volume</label>',
                                '<input class="form-input articleVolume" value="" type="text" placeholder="Enter here">',
                            '</div>',
                            '<div class="form-group-col">',
                                '<label class="form-label">Issue</label>',
                                '<input class="form-input articleIssue" value="" type="text" placeholder="Enter here">',
                            '</div>',
                           
                        '</div>',
                        '<div class="clearfix"></div>',
                    '</li>',
                    '<li>',
                        '<div class="form-col-2">',
                            '<div class="form-group-col">',
                                '<label class="form-label">First page</label>',
                                '<input class="form-input articleFP" value="" type="text" placeholder="Enter here">',
                            '</div>',
                            '<div class="form-group-col">',
                                '<label class="form-label">Last page</label>',
                                '<input class="form-input articleLP" value="" type="text" placeholder="Enter here">',
                            '</div>',
                           
                        '</div>',
                        '<div class="clearfix"></div>',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Received Date</label>',
                        '<input class="form-input" value="" type="text" placeholder="DD / MM / YY">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Accepted Date</label>',
                        '<input class="form-input" value="" type="text" placeholder="DD / MM / YY">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Copyright Statement</label>',
                        '<textarea class="form-text-area" value="" placeholder="Enter here"></textarea>',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Copyright Year</label>',
                        '<input class="form-input" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Licence Type</label>',
                        '<input class="form-input" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Licence Text</label>',
                        '<input class="form-input" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Article PDF Name</label>',
                        '<input class="form-input" value="" type="text" placeholder="Enter here">',
                    '</li>', 
                '</ul>',
                '</div>',
                '<div class="meta-btn-group">',
                    '<button class="btn btn-cancel articleCancelBtn">Cancel</button>',
                    '<button class="btn btn-update articleMetaUpdate">Update</button>',
                '</div>',
            '</div>'
    ],
    articleFundingTemplate = [ 
            '<div class="funding-info-cnt articleFund">',
                '<h2 class="meta-edit-title">Edit Funding Info</h2>',
                 '<div class="meta-form-group">',
                '<ul>',
                    '<li class="validateField">',
                        '<label class="form-label">This funding information is not validated. You can validate it by choosing one from below options</label>',
                        ' <select class="form-input validCategory" style=" width: 100%;padding: 6px;font-size: 13px;border: 1px solid #cfd6dc;"><option value="">Select to validate</option><option value="site1">WebSite 1</option><option value="site2">WebSite 2</option><option value="site3">WebSite 3</option></select> ',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Funding Source</label>',
                        '<input class="form-input fundSource" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Funding DOI</label>',
                        '<input class="form-input fundDOI" value="" type="text" placeholder="Enter here">',
                    '</li>',
					'<li class="multi-btn">',
                         '<label class="left-label">Awards</label>',
                         '<input class="form-input fundAwards fundAwardAdd" value=""  type="text" placeholder="Enter here">',
                         '<a href="javascript:;" class="add-authorname addMoreAwards"></a>',
                    '</li>',
                    '<span id="addtionalAwards"></span>',
                '</ul>',
            '</div>',
            '<div class="meta-btn-group">',
                '<button class="btn btn-cancel fundCancelBtn">Cancel</button>',
                '<button class="btn btn-update fundUpdateBtn">Update</button>',
            '</div>',
        '</div>'],
    articleAddFundingTemplate = [ 
            '<div class="funding-info-cnt articleAddFund">',
                '<h2 class="meta-edit-title">Edit Funding Info</h2>',
                 '<div class="meta-form-group">',
                '<ul>',
                    '<li>',
                        '<label class="form-label">Funding Source</label>',
                        '<input class="form-input fundSource" value="" type="text" placeholder="Enter here">',
                    '</li>',
                    '<li>',
                        '<label class="form-label">Funding DOI</label>',
                        '<input class="form-input fundDOI" value="" type="text" placeholder="Enter here">',
                    '</li>',    
                    '<li class="multi-btn">',
                         '<label class="left-label">Awards</label>',
                         '<input class="form-input fundAwards fundAwardAdd" value=""  type="text" placeholder="Enter here">',
                         '<a href="javascript:;" class="add-authorname addMoreAwards"></a>',
                    '</li>',
                    '<span id="addtionalAwards"></span>',
                '</ul>',
            '</div>',
            '<div class="meta-btn-group">',
                '<button class="btn btn-cancel fundCancelBtn">Cancel</button>',
                '<button class="btn btn-update fundAddBtn">Add</button>',
            '</div>',
        '</div>'],
        addAwardNameTemplate = [
            '<li class="multi-btn">',
                 '<label class="left-label">Awards</label>',
                 '<input class="form-input fundAwards fundAwardAdded" value="{{multiplefundAwards}}"  type="text" placeholder="Enter here">',
                 '<a href="javascript:;" class="delete-authorname deleteMoreAward"></a>',
            '</li>'],
        fundingInfoList = [
            '<li class="fundInfoList" id="{{fundID}}">',
                '<div class="funding-info-wrapper">',
                '<span class="notValidateIcon"><i class="not-validated">Not Validated</i>!</span>',
                    '<span class="ref-add editFund"></span>',
                    '<span class="ref-delete deleteFund"></span>',
                    '<div class="cnt-label">',
                        '<span>Funding Source :</span>',
                    '</div>',
                    '<div class="cnt-info">',
                        '<span class="label-strong fundSource">{{sourceValue}}</span>',
                    '</div>',
                '</div>',
                '<div class="funding-info-wrapper">',
                    '<div class="cnt-label">',
                        '<span>Funder DOI :</span>',
                    '</div>',
                    '<div class="cnt-info">',
                        '<span class="label-strong fundDOI">{{doiValue}}</span>',
                    '</div>',       
                '</div>',
                '<div class="funding-info-wrapper awards-list-wrapper">',
                    '<div class="cnt-label">',
                        '<span>Awards:</span>',
                    '</div>',
                    '<div class="cnt-info fundAwardsWap">',
                        '<span class="label-strong fundAwards">{{multiAwards}}</span>',
                    '</div>',       
                '</div>',       
            '</li>',
        ];

    function ArticleInit(win, doc, articleTabContainer, articleTabPanel1, articleInnerTab, articleInnerTabFunding, localeData) {
        this.win = win;
        this.doc = doc;
        this.articleInnerTab = articleInnerTab;
        this.articleInnerTabFunding = articleInnerTabFunding;
        this.articleTabContainer = articleTabContainer;
        this.articleTabPanel1 = articleTabPanel1;
        this.localeData = localeData;
        this.metaDataInst = null;

        articleInfo = {"articleID": "FD 1025", 
        "articleDOI":"15-Sep-2016", 
        "articleTOC":"Gemmological and mineralogical", 
        "articleHeading" : "Building and Environment", 
        "articleColl" : "BAE 7841", 
        "articleOPD":"28-Dec-2016", 
        "articleEID":"AR352", 
        "articleVolume":"-", 
        "articleIssue":"-", 
        "articleFP":"100"};

        //fundInfo = {"fundSource":"", "fundDOI":"", "fundAwards":""};
        //fundInfo.fundAwards = [];
    }

    function metaEditAction(e) {
            var tempWrapper, MetaEditView;

            MetaEditView = document.querySelector('.articleMetaData');
            MetaEditView.innerHTML="";
            MetaEditView.style.display="block";
            tempWrapper = document.createElement('span');
            tempWrapper.innerHTML = articleMetaTemplate.join('');
            document.getElementsByClassName('articleMetaData')[0].appendChild(tempWrapper);
            
            MetaEditView.querySelector(".articleID").value = articleInfo.articleID;
            MetaEditView.querySelector(".articleDOI").value = articleInfo.articleDOI;
            MetaEditView.querySelector(".articleTOC").value = articleInfo.articleTOC;
            MetaEditView.querySelector(".articleHeading").value = articleInfo.articleHeading;
            MetaEditView.querySelector(".articleColl_1").value = articleInfo.articleColl;
            MetaEditView.querySelector(".articleOPD").value = articleInfo.articleOPD;
            MetaEditView.querySelector(".articleEID").value = articleInfo.articleEID;
            MetaEditView.querySelector(".articleVolume").value = articleInfo.articleVolume;
            MetaEditView.querySelector(".articleIssue").value = articleInfo.articleIssue;
            MetaEditView.querySelector(".articleFP").value = articleInfo.articleFP;

            articleCancelBtnClick  = MetaEditView.querySelector('.articleCancelBtn');
            articleCancelBtnClick.addEventListener('click', function articleCancelAction(e) {
                var tempWrapper
                //document.querySelector('.articleMetaData').innerHTML="";
                MetaEditView.style.display="none";
            }, false);

            onClickUpdate = articleMetaUpdate.bind(MetaEditView);
            MetaEditView.querySelector(".articleMetaUpdate").addEventListener('click', onClickUpdate, false);
    }

    function articleMetaUpdate(){
        var MetaEditView;

        articleInfo.articleID = this.querySelector(".articleID").value;
        articleInfo.articleDOI = this.querySelector(".articleDOI").value;
        articleInfo.articleTOC = this.querySelector(".articleTOC").value;
        articleInfo.articleHeading = this.querySelector(".articleHeading").value;
        articleInfo.articleColl = this.querySelector(".articleColl_1").value;
        articleInfo.articleOPD = this.querySelector(".articleOPD").value;
        articleInfo.articleEID = this.querySelector(".articleEID").value;
        articleInfo.articleVolume = this.querySelector(".articleVolume").value;
        articleInfo.articleIssue = this.querySelector(".articleIssue").value;
        articleInfo.articleFP = this.querySelector(".articleFP").value;

        MetaEditView = document.querySelector('.articleMetaData');
        MetaEditView.style.display="none";

        metaDataInfo();
    }

    function metaDataInfo(){
        MetaEditView = document.querySelector('.articleMetaData');
        MetaEditView.style.display="none";

        MetaInfoView = document.querySelector('.metadataInfo');

        MetaInfoView.querySelector(".articleID").innerText = (articleInfo.articleID.trim() != "") ? articleInfo.articleID:"-";
        MetaInfoView.querySelector(".articleDOI").innerText = (articleInfo.articleDOI.trim() != "") ? articleInfo.articleDOI:"-";
        MetaInfoView.querySelector(".articleTOC").innerText = (articleInfo.articleTOC.trim() != "") ? articleInfo.articleTOC:"-";
        MetaInfoView.querySelector(".articleHeading").innerText = (articleInfo.articleHeading.trim() != "") ? articleInfo.articleHeading:"-";
        MetaInfoView.querySelector(".articleColl_1").innerText = (articleInfo.articleColl.trim() != "") ? articleInfo.articleColl:"-";
        MetaInfoView.querySelector(".articleOPD").innerText = (articleInfo.articleOPD.trim() != "") ? articleInfo.articleOPD:"-";
        MetaInfoView.querySelector(".articleEID").innerText = (articleInfo.articleEID.trim() != "") ? articleInfo.articleEID:"-";
        MetaInfoView.querySelector(".articleVolume").innerText = (articleInfo.articleVolume.trim() != "") ? articleInfo.articleVolume:"-";
        MetaInfoView.querySelector(".articleIssue").innerText = (articleInfo.articleIssue.trim() != "") ? articleInfo.articleIssue:"-";
        MetaInfoView.querySelector(".articleFP").innerText = (articleInfo.articleFP.trim() != "") ? articleInfo.articleFP:"-";
    }

    function fundInformation(){
        var tempWrapper, onClickEdit, tempNode = null, multiAwa = "", FundInfoView = document.querySelector('.fundingInfo');

        FundInfoView.innerHTML = "";

        for(var i=0; i<fundInfoData.length; i++){

            tempNode = document.createElement('span');
            tempWrapper = fundingInfoList.join('');
            tempWrapper = tempWrapper.replace('{{fundID}}', fundInfoData[i].id);
            tempWrapper = tempWrapper.replace('{{sourceValue}}', fundInfoData[i].fundSource);
            tempWrapper = tempWrapper.replace('{{doiValue}}', fundInfoData[i].fundDOI);
            //notValidateIcon
            for(var j=0; j<fundInfoData[i].fundAwards.length; j++){
                multiAwa += '<span class="label-strong fundAwards">'+fundInfoData[i].fundAwards[j]+'</span>';
            }
            tempWrapper = tempWrapper.replace('{{multiAwards}}', multiAwa);
            tempNode.innerHTML = tempWrapper;

            if(fundInfoData[i].isValid == 1){
                $(tempNode).find(".notValidateIcon").remove();
            }
            
            multiAwa = "";
            FundInfoView.appendChild(tempNode);

            var fundId = fundInfoData[i].id;
            var fundval = {};
            fundval.fundId = fundId;
            onClickEdit = fundEditAction.bind(fundval);
            tempNode.querySelector(".editFund").addEventListener('click', onClickEdit, false);

            onClickDelete = fundDeleteAction.bind(fundval);
            tempNode.querySelector(".deleteFund").addEventListener('click', onClickDelete, false);
        }
    }

    function fundAddAction(e) {
            var tempWrapper
            document.querySelector('.articleMetaData').innerHTML="";
            document.querySelector('.articleMetaData').style.display="block";
            tempWrapper = document.createElement('span');
            tempWrapper.innerHTML = articleAddFundingTemplate.join('');
            document.getElementsByClassName('articleMetaData')[0].appendChild(tempWrapper)

            FundEditView = document.querySelector('.articleAddFund');
            
            //FundEditView.querySelector(".fundSource").value = fundInfo.fundSource;
            //FundEditView.querySelector(".fundDOI").value = fundInfo.fundDOI;
            //FundEditView.querySelector(".fundAwards").value = fundInfo.fundAwards;

            fundCancelBtnClick  = FundEditView.querySelector('.fundCancelBtn');
            fundCancelBtnClick.addEventListener('click', function fundCancelAction(e) {
                document.querySelector('.articleMetaData').style.display="none";
            }, false);

            onClickUpdate = addNewFund.bind(FundEditView);
            FundEditView.querySelector(".fundAddBtn").addEventListener('click', onClickUpdate, false);

            addMoreFundAwards();
    }

    function addNewFund(){
        var FundAddView;
        fundInfo.fundAwards = [];

        fundId = fundId+1;
        var addId = "fnd"+fundId;

        fundInfo.id = addId;
        fundInfo.fundSource = this.querySelector(".fundSource").value;
        fundInfo.fundDOI = this.querySelector(".fundDOI").value;
        fundInfo.isValid = 0;
        fundInfo.validCategory = "";

        fundAwards = this.querySelectorAll(".fundAwards");
        for(var i=0; i < fundAwards.length; i++){
            awardValue = fundAwards[i].value;
            
            if(awardValue.trim() != "")
            fundInfo.fundAwards.push(awardValue);
        }

        fundInfoData.push(fundInfo);
        
        FundEditView = document.querySelector('.articleMetaData');
        FundEditView.style.display="none";

        fundInfo = {"id":"", "fundSource":"", "fundDOI":"", "fundAwards":""};
        fundInfo.fundAwards = [];
        
        fundInformation();
    }

    function fundEditAction() {
            var fundId = this.fundId;

            var tempWrapper, tempWrapper1; 
            document.querySelector('.articleMetaData').innerHTML="";
            document.querySelector('.articleMetaData').style.display="block";
            tempWrapper = document.createElement('span');
            tempWrapper.innerHTML = articleFundingTemplate.join('');
            document.getElementsByClassName('articleMetaData')[0].appendChild(tempWrapper);

            FundEditView = document.querySelector('.articleFund');


            for(var i=0; i<fundInfoData.length; i++){

                if(fundInfoData[i].id == fundId){
                    tempNode = document.createElement('span');
                    tempWrapper = fundingInfoList.join('');
                   
                    FundEditView.querySelector(".fundSource").value = fundInfoData[i].fundSource;
                    FundEditView.querySelector(".fundDOI").value = fundInfoData[i].fundDOI;

                    $(".validCategory").val(fundInfoData[i].validCategory);
                    for(var j=0; j < fundInfoData[i].fundAwards.length; j++){
                        var tempWrapper1 = addAwardNameTemplate.join('');
                        tempWrapper1 = tempWrapper1.replace('{{multiplefundAwards}}', fundInfoData[i].fundAwards[j]);

                        var ss  = document.getElementById('addtionalAwards');
                        ss.insertAdjacentHTML('beforeend', tempWrapper1);
                    }
                }

                multiAwa = "";
            }

            fundCancelBtnClick  = FundEditView.querySelector('.fundCancelBtn');
            fundCancelBtnClick.addEventListener('click', function fundCancelAction(e) {
                document.querySelector('.articleMetaData').style.display="none";
            }, false);

            onClickUpdate = fundUpdateBtn.bind(this);
            FundEditView.querySelector(".fundUpdateBtn").addEventListener('click', onClickUpdate, false);

            addMoreFundAwards();
    }

    function fundDeleteAction(){
            var fundId = this.fundId;
            var FundInfoView = document.querySelector('.fundingInfo');

            for(var i=0; i<fundInfoData.length; i++){
                if(fundInfoData[i].id == fundId){
                    fundInfoData.splice(i, 1);
                    $(FundInfoView).find("#"+fundId).remove();
                }
            }
    }

    function fundUpdateBtn(){
        var FundEditView, fundId = this.fundId;
        FundEditView = document.querySelector('.articleFund');

        for(var i=0; i<fundInfoData.length; i++){
             if(fundInfoData[i].id == fundId){
                fundInfoData[i].fundAwards = [];

                fundInfoData[i].fundSource = FundEditView.querySelector(".fundSource").value;
                fundInfoData[i].fundDOI = FundEditView.querySelector(".fundDOI").value;
                fundInfoData[i].validCategory = FundEditView.querySelector(".validCategory").value;

                var funValidateVal = FundEditView.querySelector(".validCategory").value;
                if(funValidateVal == ""){
                    fundInfoData[i].isValid = 0;
                }else{
                    fundInfoData[i].isValid = 1;
                }

                fundAwards = FundEditView.querySelectorAll(".fundAwards");
        
                for(var j=0; j < fundAwards.length; j++){
                    awardValue = fundAwards[j].value;

                    if(awardValue.trim() != "")
                    fundInfoData[i].fundAwards.push(awardValue);
                }

             }
        }

        FundEditView = document.querySelector('.articleMetaData');
        FundEditView.style.display="none";

        fundInformation();
    }

    /*function fundInformation(){
        var FundInfoView = document.querySelector('.fundingInfo');

        FundInfoView.querySelector(".fundSource").innerText = (fundInfo.fundSource.trim() != "") ? fundInfo.fundSource:"-";
        FundInfoView.querySelector(".fundDOI").innerText = (fundInfo.fundDOI.trim() != "") ? fundInfo.fundDOI:"-";
        //FundInfoView.querySelector(".fundAwards").innerText = (fundInfo.fundAwards.trim() != "") ? fundInfo.fundAwards:"-";
        FundInfoView.querySelector(".fundAwardsWap").innerHTML = "";

        for(var i = 0; i < fundInfo.fundAwards.length; i++){
            if(fundInfo.fundAwards[i] != ''){
                var tempWrapper = document.createElement('span');
                tempWrapper.innerHTML = '<span class="label-strong fundAwards">'+fundInfo.fundAwards[i]+'</span>';
                FundInfoView.querySelector(".fundAwardsWap").appendChild(tempWrapper.firstChild);
            }
        }
    }*/

    function addMoreFundAwards(){
        $('.addMoreAwards').on('click', function(){
            var awardValue = document.getElementsByClassName('fundAwardAdd')[0].value;
                var addAwardNameTemplate = [
                                        '<li class="multi-btn">',
                                             '<label class="left-label">Awards</label>',
                                             '<input class="form-input fundAwards fundAwardAdded" value="'+awardValue+'"  type="text" placeholder="Enter here">',
                                             '<a href="javascript:;" class="delete-authorname deleteMoreAward"></a>',
                                        '</li>'];

                var tempWrapper = addAwardNameTemplate.join('');
                var ss  = document.getElementById('addtionalAwards');
                ss.insertAdjacentHTML('beforeend', tempWrapper);

                document.getElementsByClassName('fundAwardAdd')[0].value = "";
        });  

        $(document).on('click','.deleteMoreAward', function(e){
           e.target.parentElement.remove(e.target.parentElement);
        });

    }

    ArticleInit.prototype.initiateMeta = function initiateMetaFn() {
        this.articleTabPanel1.add('MetaData', this.articleInnerTab);
        
        articleSummary = new ArticleSummary(this.articleInnerTab, EventBus, this.win, this.doc, this.localeData);
        articleSummary.render();

        metaEditBtnClick = document.querySelector('.metaEditBtn');

        metaEditBtnClick.addEventListener('click', metaEditAction);

        metaDataInfo();
    };

    ArticleInit.prototype.initiateFundingInfo = function initiateFundingInfoFn() {
        
        this.articleTabPanel1.add('Funding Info', this.articleInnerTabFunding);
        articleSummary1 = new ArticleSummary(this.articleInnerTabFunding, EventBus, this.win, this.doc, this.localeData);
        articleSummary1.fundrender();

        //funding Edit Form
        /*fundingEditBtnClick  = document.querySelector('.fundingEditBtn');
        fundingEditBtnClick.addEventListener('click', fundEditAction, false);*/

        fundingAddBtnClick  = document.querySelector('.fundingAddBtn');
        fundingAddBtnClick.addEventListener('click', fundAddAction, false);
    };

    ArticleInit.prototype.clean = function clean() {
        var articleTabPanel1 = this.articleTabPanel1;
        articleTabPanel1.innerHTML = '';
    };

    return ArticleInit;
});

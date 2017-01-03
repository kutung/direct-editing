define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/ConfigReader', 'scripts/RichTextEditor'
], function EditFrontMatter(Helper, EventBus, ConfigReader, RTE) {
    'use strict';
    var source, authorListArray = [], affiliatioListArray = [], authorListData = [], affiliatioListData = [], footNoteListData = [], isfirst = 0, 
    addAuthorID = 0, addAffId = 0, addNoteId = 0,
    char = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    FrontTemplate = [
        '<div class="authorgroup-header">',
                        '<div class="authorgroup-title">',
                            '<p>Edit Author group</p>',
                        '</div>',
                        '<div class="authorgroup-header-btns">',
							'<span class="FootNoteTab">Footnote</span>',
                            '<span class="AffiliatTab">Affiliations</span>',
                            '<span class="AuthorTab active">Authors</span>',
                        '</div>',
                    '</div>',
                    '<div class="alert-wrapper">',
                        '<div class="notification-alert">',
                            '<p><strong>Drag to drop to re-order</strong></p>',
                        '</div>',
                    '</div>',
                    
                    '<div class="authorgroup-list-wrapper">',
                        '<ul class="EditAuthorGroupList">',
                            '<span id="unclitedList"></span>',                                                                 
                        '</ul>',
                        
                    '</div>',
                    '<div class="authorgroup-footer-btn">',
						'<div class="authorUncited">View Uncited Only</div>',
						'<span class="new-author addNewAuthorAff">Add Author</span>',
                        '<span class="new-affiliation cancelAuthorGroup">Done</span>',
                    '</div>'
    ],
    EditIconTemplate = ['<span class="author-edit-icon editAuthorInfo"></span>'],
    EditViewTemplate = [
        '<div class="authorgroup-header">',
            '<div class="authorgroup-title">',
                '<p>{{authorFormHeading}}</p>',
            '</div>',
        '</div>',
        '<div class="author-form-wrapper" style="width:100%;overflow-y: auto;">',
        '<div class="author-edit-list">',
            '<ul>',
                '<li>',
                    '<div class="author-editsplit-list">',
                        '<label>Author name</label>',
                        '<input class="edit-textbox authorId" type="text" style="display:none"/>',
                        '<input class="edit-textbox authorSurName" type="text" placeholder="Surname"/>',
                    '</div>',
                    '<div class="editsplit-list-right">',
                        '<label style="visibility: hidden">Author name</label>',
                        '<input class="edit-textbox authorName" type="text" placeholder="First name"/> ',
                    '</div>',                                
                '</li>',
                '<li>',
                    '<label>Degree</label>',
                    '<input class="edit-textbox authorDegree" type="text" placeholder="Enter here"/> ',
                '</li>',
                '<li>',
                    '<label>ORC ID</label>',
                    '<input class="edit-textbox authorORC" type="text" placeholder="Enter here"/>', 
                '</li>',
                '<li>',
                    '<label>Role / designation</label>',
                    '<input class="edit-textbox authorRole" type="text" placeholder="Enter here"/>', 
                '</li>',
                '<li>',
                    '<div class="author-editsplit-list">',
                        '<label>Email</label>',
                        '<input class="edit-textbox authorEmail" type="text" placeholder="Enter here"/>',
                    '</div>',
                    '<div class="editsplit-list-right">',
                        '<label>Phone</label>',
                        '<input class="edit-textbox authorPhone" type="text" placeholder="Enter here"/> ',
                    '</div>',                              
                '</li>',
                '<li>',
                    '<label>Correspondence</label>',
                    '<div class="correspondence-btn-wrapper authorCorrespondence">',
                        '<span class="correspondYes active">Yes</span>',
                        '<span class="correspondNo">No</span>',
                    '</div>',
                '</li>',
                '<li class="correspondInfo">',
                    '<label>Co Author details</label>',
                    /*'<input class="edit-textbox coAuthorDetail" type="text" placeholder="Enter here"/>',*/
                    '<textarea class="edit-textbox coAuthorDetail"></textarea>',
                '</li>',
                /*'<li class="correspondInfo">',
                    '<label>Author Footnote</label>',
                    '<textarea class="edit-textarea"  placeholder="Enter here"/></textarea>',
                '</li>',  */
            '</ul>',
        '</div>',

		'<div class="affiliations-link-wrapper">',
            '<label class="affiliations-link-lbl">Link Affiliation</label>',
            '<ul class="linkAffiliat">',
                '<span id="authorAffChecked"></span>',
                '<li>',
                    '<div class="dont-show">',
                          '<p>',
                            '<input type="checkbox" id="list1">',
                            '<label for="list1"> <sup>a</sup>Chemical Diagostic & Engineering, Los Alamos, NM 87..</label>',
                          '</p>',
                    '</div>',                                  
                '</li>',
            '</ul>',
        '</div>',
		
		'<div class="affiliations-link-wrapper link-author-footnote">',
            '<label class="affiliations-link-lbl">Link Author Footnote</label>',
            '<ul class="linkAuthor">',
                '<span id="authorNoteChecked"></span>',
                '<li>',
                    '<div class="dont-show">',
                          '<p>',
                            '<input type="checkbox" id="lnk-athr1">',
                            '<label for="lnk-athr1"> <sup>(1)</sup>Chemical Diagostic & Engineering, Los Alamos, NM 87.Chemical Diagostic & Engineering, Los Alamos, NM 87</label>',
                          '</p>',
                    '</div> ',                                 
                '</li>',
            '</ul>',
        '</div>',
        '</div>',
        '<div class="authorgroup-footer-btn">',
            '<span class="new-author updateEditAuthor">{{updateButLabel}}</span>',
            '<span class="new-affiliation cancelEditAuthor">Cancel</span>',
        '</div>'
    ],
    AffiliatEditTemplate = [
        '<div class="authorgroup-header">',
            '<div class="authorgroup-title">',
                '<p>{{affFormHeading}}</p>',
            '</div>',
        '</div>',
        '<div class="author-edit-list">',
            '<ul>',
                '<li>',
                    '<label>Organization</label>',
                    '<input class="edit-textbox affId" type="text" style="display:none"/>', 
                    '<input class="edit-textbox affOrganization" type="text" placeholder="Enter here"/>', 
                '</li>',
                '<li>',
                    '<label>Address line</label>',
                    '<input class="edit-textbox affAddress" type="text" placeholder="Enter here"/>',
                '</li>',
                '<li>',
                    '<label>City</label>',
                    '<input class="edit-textbox affCity" type="text" placeholder="Enter here"/>',
                '</li>',
                '<li>',
                    '<label>State</label>',
                    '<input class="edit-textbox affState" type="text" placeholder="Enter here"/>',
                '</li>',
                '<li>',
                    '<div class="author-editsplit-list">',
                        '<label>Country</label>',
                        '<input class="edit-textbox affCounty" type="text" placeholder="Enter here"/>',
                    '</div>',
                    '<div class="editsplit-list-right">',
                        '<label>Pincode</label>',
                        '<input class="edit-textbox affPin" type="text" placeholder="Enter here"/>', 
                    '</div>',                                  
                '</li>',
                '<li>',
                    '<label>Email</label>',
                    '<input class="edit-textbox affMail" type="text" placeholder="Enter here"/>', 
                '</li>',
                '<li>',
                    '<label>Funding agency ID</label>',
                    '<input class="edit-textbox affFundId" type="text" placeholder="Enter here"/>',
                '</li>',
            '</ul>',
        '</div>',
        
        '<div class="affiliations-link-wrapper">',
            '<label class="affiliations-link-lbl">Link Authors</label>',
            '<ul class="linkAuthorWithAff">',
                '<span id="affAuthorChecked"></span>',
                '<li>',
                    '<div class="dont-show">',
                          '<p>',
                            '<input type="checkbox" id="list6">',
                            '<label for="list6"> Andrea Labourianua <sup>a</sup></label>',
                          '</p>',
                    '</div>',                               
                '</li>',                                                                                                                                              
            '</ul>',
        '</div>',
        
        '<div class="authorgroup-footer-btn">',
            '<span class="new-author updateEditaffiliat">{{updateButLabel}}</span>',
            '<span class="new-affiliation cancelEditaffiliat">Cancel</span>',
        '</div>'
    ],
    FootNoteEditTemplate = [
        '<div class="authorgroup-header">',
            '<div class="authorgroup-title"><p>{{footNoteFormHeading}}</p></div>',
            /*'<div class="authorgroup-header-btns">',
                '<span class="active">Footnote</span>',
                '<span class="AffTab">Affiliations</span>',
                '<span class="AuthorTab">Authors</span>',
            '</div>',*/
        '</div>',
    
        '<div class="author-edit-list">',
            '<ul>',
                '<li>',
                    '<div class="author-footer-note-textarea">',
                        '<div class="footnote-richtextbox"><img src="images/float.jpg" alt="float-toolirich"></div>',
                        '<input class="edit-textbox noteId" type="text" style="display:none"/>',
                        '<textarea class="edit-textarea noteContent" placeholder="Add footnote text here"></textarea>',
                    '</div>',
                '</li>',
            '</ul>',
        '</div>',
        '<div class="affiliations-link-wrapper">',
        '<label class="affiliations-link-lbl">Link Authors</label>',
            '<ul class="linkAuthorWithNote">',
                '<span id="noteAuthorChecked"></span>',
                '<li>',
                    '<div class="dont-show">',
                      '<p>',
                        '<input type="checkbox" id="list15">',
                        '<label for="list15"> Andrea Labourianua <sup>a</sup></label>',
                      '</p>',
                    '</div>',
                '</li>',                                                      
            '</ul>',
        '</div>',
        '<div class="authorgroup-footer-btn">',
            '<span class="new-author updateEditNote">{{updateButLabel}}</span>',
            '<span class="new-affiliation cancelEditNote">Cancel</span>',
        '</div>'
    ];

    function initializeVariables(instance) {
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.newContainer = null;
        instance.isEnabled = false;
        instance.panel = null;
        instance.hasChange = false;
        instance.content = null;
        // instance.onLabelClick = null;
        instance.stylesheetId = 'referencePanel-style';
        instance.styleSheet = null;
    }

    function setTopPosition(instance) {
        var filterStyle;
        if (instance.enableCategoryFilter === true) {
            filterStyle = getComputedStyle(instance.filterElement);
            instance.container.parentNode.style.paddingTop = filterStyle.height;
        }
    }

    function editFrontMatterPanel(referenceContainer, eventBus, win, doc) {
        var actorType;

        if (referenceContainer instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        initializeVariables(this);
        this.container = referenceContainer;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
    }

    function editAuthorGroupList(){
        var addList, authorName, authorSurName, authorList, editAuthorList, ceauthor, authorId, 
        authorListArray = [], onClickEdit, onClickDelete, listView, authorList;

        var editGrouptWap = document.querySelector('.authorgroup-list-wrapper');
        editGrouptWap.querySelector('ul').className = "EditAuthorGroupList";

        document.querySelector('.authorGroupWrap').style.display = 'block';
        document.querySelector('.authorEditWrap').style.display = 'none';

        document.querySelector('.AffiliatTab').classList.remove('active');
        document.querySelector('.FootNoteTab').classList.remove('active');
        document.querySelector('.AuthorTab').classList.add('active');

        var parent = document.querySelector("#augrp0010");
            ceauthor = parent.querySelectorAll('.ce_author');

        editAuthorList =  document.querySelector(".EditAuthorGroupList");
        //editAuthorList.innerHTML = "";
        $(editAuthorList).find("li").remove();
        
        for (var i = 0; i < authorListData.length; i++) {
            //addList = parent.querySelectorAll('.ce_author')[i];
            authorName = authorListData[i].authorName;
            authorSurName = authorListData[i].authorSurName;
            authorId = authorListData[i].authorId;
            var affDis = "";
            var noteDis = "";

            for(var a = 0; a < affiliatioListData.length; a++){
                for(var b = 0; b < authorListData[i].affLink.length; b++){
                    if(affiliatioListData[a].affId == authorListData[i].affLink[b]){
                        affDis += ","+char[a];
                    }
                }
            }
            if (affDis) affDis = affDis.substring(1);


            for(var c = 0; c < footNoteListData.length; c++){
                for(var d = 0; d < authorListData[i].noteLink.length; d++){
                    if(footNoteListData[c].noteId == authorListData[i].noteLink[d]){
                        var num = c+1;
                        noteDis += ","+num;
                    }
                }
            }
            if (noteDis) noteDis = noteDis.substring(1);

            authorList = document.createElement('div');
            authorList.innerHTML = '<li id="'+authorId+'" draggable="true" ondragenter="dragenter(event)" ondragstart="dragstart(event)"><span class="drog-icon"><i></i><i></i><i></i></span><p>'+authorName+' '+authorSurName+'<sup>'+affDis+' '+noteDis+'</sup></p><span class="comman-edit-icon authorEdit"></span><span class="comman-delete-icon authorDelete"></span></li>';
            listView = authorList.firstChild;
            editAuthorList.appendChild(listView);

            onClickEdit = editAuthorGroup.bind(listView);
            onClickDelete = deleteAuthorGroup.bind(listView);

            listView.querySelector(".authorEdit").addEventListener('click', onClickEdit, false);
            listView.querySelector(".authorDelete").addEventListener('click', onClickDelete, false);
        }

        $(".EditAuthorGroupList li").off("dragend").on("dragend", function(event) {
            $(event.target).removeClass("draging");
            edidtAuthorReorder(authorListArray);
        });

        document.querySelector(".AuthorTab").addEventListener("click", editAuthorGroupList);
        document.querySelector(".AffiliatTab").addEventListener("click", editAffilliatGroupList);
        document.querySelector(".FootNoteTab").addEventListener("click", editFootNoteGroupList);

        document.querySelector(".addNewAuthorAff").removeEventListener("click", newFootNoteGroup);
        document.querySelector(".addNewAuthorAff").removeEventListener("click", newAffilliatGroup);
        document.querySelector(".addNewAuthorAff").addEventListener("click", newAuthorGroup);
        
        document.querySelector(".cancelAuthorGroup").addEventListener("click", doneAuthorGroupList);

        document.querySelector(".authorUncited").removeEventListener("click", editAuthorGroupList);
        document.querySelector(".authorUncited").addEventListener("click", viewUncited);
        $(".authorUncited").show();
        $(".authorUncited").text("View Uncited Only");
        $(".addNewAuthorAff").text("Add Author");
    }

    function edidtAuthorReorder(authorListArray){
        var editAuthorList, allList, addList, reorderAuthorId, oldOrder, authorId, neworder = [];
        editAuthorList =  document.querySelector(".EditAuthorGroupList");
        allList = editAuthorList.querySelectorAll('li');

        //$("#augrp0010 .ce_author").remove();

        for (var i = 0; i < allList.length; i++) {
            addList = editAuthorList.querySelectorAll('li')[i];
            reorderAuthorId = addList.getAttribute("id");

            for (var j = 0; j < authorListData.length; j++) {
                //oldOrder = authorListArray[j];
                //authorId = oldOrder.getAttribute("id");
                authorId = authorListData[j].authorId;
                if(authorId == reorderAuthorId){
                    neworder.push(authorListData[j]);
                    /*var authorCount = $("#augrp0010 .ce_author").length;
                    var childCount = authorCount-1;
                    if(authorCount){
                          $("#augrp0010").find(".ce_author:eq("+childCount+")").after(oldOrder); 
                    }else{
                          $("#augrp0010").prepend(oldOrder); 
                    }*/
                }
            }
        }

        authorListData = [];

        authorListData = neworder;
    }

    function newAuthorGroup(){
        var tempNode, tempWrapper, authorEditView, authorName, authorSurName, newAuthor, tempWrapper, onClickAdd, affiliatList;
        authorEditView = document.querySelector('.authorEditWrap');

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.affiliationEditWrap').style.display = 'none';

        authorEditView.style.display = 'block';

        tempNode = document.createElement('span');
        tempWrapper = EditViewTemplate.join('');
        tempWrapper = tempWrapper.replace('{{authorFormHeading}}', "Adding Authors");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Add");
        
        tempNode.innerHTML = tempWrapper;

        authorEditView.innerHTML = "";
        authorEditView.appendChild(tempNode);

        $(".authorEditWrap .authorCorrespondence span").off("click").on("click", function(e) {
            var vorrespondenceVal = e.currentTarget.innerText;
            if(vorrespondenceVal == "Yes"){
                $(authorEditView).find(".authorCorrespondence .correspondYes").addClass("active");
                $(authorEditView).find(".authorCorrespondence .correspondNo").removeClass("active");
                $(authorEditView).find(".correspondInfo").show();
            }else if(vorrespondenceVal == "No"){
                $(authorEditView).find(".authorCorrespondence .correspondNo").addClass("active");
                $(authorEditView).find(".authorCorrespondence .correspondYes").removeClass("active");
                $(authorEditView).find(".correspondInfo").hide();
                $(authorEditView).find(".correspondInfo input[type=text]").val("");
            }
        });

        var linkAffiliatList = authorEditView.querySelector('.linkAffiliat');
        //linkAffiliatList.innerHTML = '';
        $(linkAffiliatList).find("li").remove();

        var linkAuthorList = authorEditView.querySelector('.linkAuthor');
        //linkAuthorList.innerHTML = '';
        $(linkAuthorList).find("li").remove();

        for (var j = 0; j < affiliatioListData.length; j++) {
            var affiliatList = document.createElement('div');
            affiliatList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="affLinkAuth[]" id="lnk-aff'+j+'" value="'+affiliatioListData[j].affId+'"><label for="lnk-aff'+j+'"> <sup>('+char[j]+')</sup>'+affiliatioListData[j].affOrganization+ ' ' +affiliatioListData[j].affAddress+'</label></p></div></li>';
            linkAffiliatList.appendChild(affiliatList);
        }

        for (var k = 0; k < footNoteListData.length; k++) {
            var noteList = document.createElement('div');
            var num = k+1;
            noteList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="noteLinkAuth[]" id="lnk-note'+k+'" value="'+footNoteListData[k].noteId+'"><label for="lnk-note'+k+'"> <sup>('+num+')</sup>'+footNoteListData[k].noteContent+'</label></p></div> </li>';
            linkAuthorList.appendChild(noteList);
        }

        onClickAdd = addNewAuthorGroup.bind(authorEditView);
        authorEditView.querySelector(".updateEditAuthor").addEventListener('click', onClickAdd, false);
        authorEditView.querySelector(".cancelEditAuthor").addEventListener("click", editAuthorGroupList);

        var winHeight = $(window).height();
        $(".author-form-wrapper").css("height", winHeight-190+"px");
    }

    function addNewAuthorGroup(){
        var authorName, authorSurName, authorCount, addAuthorCount, newAuthor, childCount, authorInfo = {}, authorNewId;
        authorName = this.querySelector(".authorName").value;
        authorSurName = this.querySelector(".authorSurName").value;

        if(authorName == "" || authorSurName == ""){ return; }


        /*for (var i = 0; i < authorListData.length; i++) {
            if(authorId == authorListData[i].authorId){
                editInfo = authorListData[i];
            }
        }
        */
        addAuthorID = addAuthorID + 1;
        authorNewId = "au"+addAuthorID;

        authorInfo.authorId = authorNewId;
        authorInfo.authorSurName = this.querySelector(".authorSurName").value;
        authorInfo.authorName = this.querySelector(".authorName").value;
        
        authorInfo.authorDegree = this.querySelector(".authorDegree").value;
        authorInfo.authorORC = this.querySelector(".authorORC").value;
        authorInfo.authorRole = this.querySelector(".authorRole").value;
        authorInfo.authorEmail = this.querySelector(".authorEmail").value;
        authorInfo.authorPhone = this.querySelector(".authorPhone").value;
        //authorListData[authorId].Correspondence = this.querySelector(".Correspondence").value;
        authorInfo.coAuthorDetail = this.querySelector(".coAuthorDetail").value;
        //authorInfo.coAuthorPhone = this.querySelector(".coAuthorPhone").value;
        //authorListData[authorId].Affiliation = this.querySelector(".authoAffiliation").value;
        authorInfo.Correspondence = this.querySelector(".authorCorrespondence .active").innerText;


        var affCheckboxes = document.getElementsByName("affLinkAuth[]");
        var affList = []; 
        for (var i=0, n=affCheckboxes.length;i<n;i++) 
        {
            if (affCheckboxes[i].checked) 
            {
                affList.push(affCheckboxes[i].value);
            }
        }
        authorInfo.affLink = affList;


        var noteCheckboxes = document.getElementsByName("noteLinkAuth[]");
        var noteList = []; 
        for (var j=0, n=noteCheckboxes.length;j<n;j++) 
        {
            if (noteCheckboxes[j].checked) 
            {
                noteList.push(noteCheckboxes[j].value);
            }
        }
        authorInfo.noteLink = noteList;


        authorListData.push(authorInfo);

        //authorCount = $("#augrp0010 .ce_author").length;
        //addAuthorCount = authorCount+1;
        //childCount = authorCount-1;

        //newAuthor = '<div class="ce_author" id="au'+addAuthorCount+'" name="OPT_ID_420"><span class="ce_given-name" name="OPT_ID_421" title="given name">'+authorName+'<span class="x"> </span></span><span class="ce_surname" name="OPT_ID_422" title="surname">'+authorSurName+'</span></div>';
        //$("#augrp0010").find(".ce_author:eq("+childCount+")").after(newAuthor);

        editAuthorGroupList();
    }

    function editAuthorGroup(e){
        var tempWrapper, tempNode, onClickUpdate, authorId, authorEditView, editInfo;

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'block';

        authorId = this.getAttribute("id");

        tempNode = document.createElement('span');
        tempWrapper = EditViewTemplate.join('');
        tempWrapper = tempWrapper.replace('{{authorFormHeading}}', "Edit Author");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Update");
        tempNode.innerHTML = tempWrapper;
        authorEditView = document.querySelector('.authorEditWrap');
        authorEditView.innerHTML = "";
        authorEditView.appendChild(tempNode);

        for (var i = 0; i < authorListData.length; i++) {
            if(authorId == authorListData[i].authorId){
                editInfo = authorListData[i];
            }
        }

        var linkAffiliatList = authorEditView.querySelector('.linkAffiliat');
        //linkAffiliatList.innerHTML = '';
        $(linkAffiliatList).find("li").remove();

        var linkNoteList = authorEditView.querySelector('.linkAuthor');
        //linkNoteList.innerHTML = '';
        $(linkNoteList).find("li").remove();

        for (var j = 0; j < affiliatioListData.length; j++) {
            var affiliatList = document.createElement('div');
            affiliatList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="affLinkAuth[]" id="lnk-aff'+j+'" value="'+affiliatioListData[j].affId+'"><label for="lnk-aff'+j+'"> <sup>('+char[j]+')</sup>'+affiliatioListData[j].affOrganization+ ' ' +affiliatioListData[j].affAddress+'</label></p></div></li>';
            linkAffiliatList.appendChild(affiliatList.firstChild);

            for(var a = 0; a < editInfo.affLink.length; a++){
                if(affiliatioListData[j].affId == editInfo.affLink[a]){
                    //linkAffiliatList.querySelectorAll('input[type="checkbox"]')[j].checked = true;
                    $(linkAffiliatList).find("li")[j].remove();
                    var currentDom = '<li><div class="dont-show"><p><input type="checkbox" name="affLinkAuth[]" id="lnk-aff'+j+'" value="'+affiliatioListData[j].affId+'" checked="true"><label for="lnk-aff'+j+'"> <sup>('+char[j]+')</sup>'+affiliatioListData[j].affOrganization+ ' ' +affiliatioListData[j].affAddress+'</label></p></div></li>';
                    $(linkAffiliatList).find('#authorAffChecked').before(currentDom);
                }
            }
        }

        for (var k = 0; k < footNoteListData.length; k++) {
            var noteList = document.createElement('div');
            var num = k+1;
            noteList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="noteLinkAuth[]" id="lnk-note'+k+'" value="'+footNoteListData[k].noteId+'"><label for="lnk-note'+k+'"> <sup>('+num+')</sup>'+footNoteListData[k].noteContent+'</label></p></div> </li>';
            linkNoteList.appendChild(noteList.firstChild);

            for(var b = 0; b < editInfo.noteLink.length; b++){
                if(footNoteListData[k].noteId == editInfo.noteLink[b]){
                    //linkNoteList.querySelectorAll('input[type="checkbox"]')[k].checked = true;
                    $(linkNoteList).find("li")[k].remove();
                    var currentDom = '<li><div class="dont-show"><p><input type="checkbox" name="noteLinkAuth[]" id="lnk-note'+k+'" value="'+footNoteListData[k].noteId+'" checked="true"><label for="lnk-note'+k+'"> <sup>('+num+')</sup>'+footNoteListData[k].noteContent+'</label></p></div> </li>';
                    $(linkNoteList).find('#authorNoteChecked').before(currentDom);
                }
            }
        }

        authorEditView.querySelector(".authorId").value = editInfo.authorId;
        authorEditView.querySelector(".authorSurName").value = editInfo.authorSurName;
        authorEditView.querySelector(".authorName").value = editInfo.authorName;
        
        authorEditView.querySelector(".authorDegree").value = editInfo.authorDegree;
        authorEditView.querySelector(".authorORC").value = editInfo.authorORC;
        authorEditView.querySelector(".authorRole").value = editInfo.authorRole;
        authorEditView.querySelector(".authorEmail").value = editInfo.authorEmail;
        authorEditView.querySelector(".authorPhone").value = editInfo.authorPhone;
        authorEditView.querySelector(".coAuthorDetail").value = editInfo.coAuthorDetail;
        //authorEditView.querySelector(".coAuthorPhone").value = editInfo.coAuthorPhone;
        //authorEditView.querySelector(".authoAffiliation").value = authorListData[authorId].Affiliation;

        if(editInfo.Correspondence == "no"){
            $(authorEditView).find(".authorCorrespondence .correspondNo").addClass("active");
            $(authorEditView).find(".authorCorrespondence .correspondYes").removeClass("active");
            $(authorEditView).find(".correspondInfo").hide();
        }else{
            $(authorEditView).find(".authorCorrespondence .correspondYes").addClass("active");
            $(authorEditView).find(".authorCorrespondence .correspondNo").removeClass("active");
        }

        authorEditView.querySelector(".cancelEditAuthor").addEventListener("click", editAuthorGroupList);

        onClickUpdate = updateAuthorGroup.bind(authorEditView);
        authorEditView.querySelector(".updateEditAuthor").addEventListener('click', onClickUpdate, false);

        $(".authorEditWrap .authorCorrespondence span").off("click").on("click", function(e) {
            var vorrespondenceVal = e.currentTarget.innerText;
            if(vorrespondenceVal == "Yes"){
                $(authorEditView).find(".authorCorrespondence .correspondYes").addClass("active");
                $(authorEditView).find(".authorCorrespondence .correspondNo").removeClass("active");
                $(authorEditView).find(".correspondInfo").show();
            }else if(vorrespondenceVal == "No"){
                $(authorEditView).find(".authorCorrespondence .correspondNo").addClass("active");
                $(authorEditView).find(".authorCorrespondence .correspondYes").removeClass("active");
                $(authorEditView).find(".correspondInfo").hide();
                $(authorEditView).find(".correspondInfo input[type=text]").val("");
            }
        });

        var winHeight = $(window).height();
        $(".author-form-wrapper").css("height", winHeight-190+"px");
    }

    function updateAuthorGroup(){
        var authorName, authorSurName, authorId, authorGroupContainer, currentAuthor, editInfo;
        //authorName = this.querySelector(".authorName").value;
        //authorSurName = this.querySelector(".authorSurName").value;
        authorId = this.querySelector(".authorId").value;

        for (var i = 0; i < authorListData.length; i++) {
            if(authorId == authorListData[i].authorId){
                editInfo = authorListData[i];
            }
        }

        editInfo.authorId = this.querySelector(".authorId").value;
        editInfo.authorSurName = this.querySelector(".authorSurName").value;
        editInfo.authorName = this.querySelector(".authorName").value;
        
        editInfo.authorDegree = this.querySelector(".authorDegree").value;
        editInfo.authorORC = this.querySelector(".authorORC").value;
        editInfo.authorRole = this.querySelector(".authorRole").value;
        editInfo.authorEmail = this.querySelector(".authorEmail").value;
        editInfo.authorPhone = this.querySelector(".authorPhone").value;
        //authorListData[authorId].Correspondence = this.querySelector(".Correspondence").value;
        editInfo.coAuthorDetail = this.querySelector(".coAuthorDetail").value;
        //editInfo.coAuthorPhone = this.querySelector(".coAuthorPhone").value;
        //authorListData[authorId].Affiliation = this.querySelector(".authoAffiliation").value;
        editInfo.Correspondence = this.querySelector(".authorCorrespondence .active").innerText;

        var affCheckboxes = document.getElementsByName("affLinkAuth[]");
        var affList = []; 
        for (var k=0, n=affCheckboxes.length;k<n;k++) 
        {
            if (affCheckboxes[k].checked) 
            {
                affList.push(affCheckboxes[k].value);
            }
        }
        editInfo.affLink = affList;


        var noteCheckboxes = document.getElementsByName("noteLinkAuth[]");
        var noteList = []; 
        for (var j=0, n=noteCheckboxes.length;j<n;j++) 
        {
            if (noteCheckboxes[j].checked) 
            {
                noteList.push(noteCheckboxes[j].value);
            }
        }
        editInfo.noteLink = noteList;

        editAuthorGroupList();
    }

    function deleteAuthorGroup(){
        var authorId, authorGroupContainer, child, editInfo;

        authorId = this.getAttribute("id");

        for (var i = 0; i < authorListData.length; i++) {
            if(authorId == authorListData[i].authorId){
                editInfo = authorListData[i];

                authorListData.splice(i, 1);
                //$(FundInfoView).find("#"+fundId).remove();
            }
        }

        authorGroupContainer = document.querySelector(".EditAuthorGroupList");
        child = authorGroupContainer.querySelector("#"+authorId);
        if(child != null) 
        authorGroupContainer.removeChild(child);

         //editAuthorGroupList();
    }

    function editAffilliatGroupList(){
        var addList, affiliationName, affiliatList, editAffiliatList, ceAffiliat, affiliatId, listView, affilliatListArray = [], onClickEdit, onClickDelete;

        var editGrouptWap = document.querySelector('.authorgroup-list-wrapper');
        editGrouptWap.querySelector('ul').className = "EditAffilliatGroupList";
        
        document.querySelector('.AuthorTab').classList.remove('active');
        document.querySelector('.FootNoteTab').classList.remove('active');
        document.querySelector('.AffiliatTab').classList.add('active');


        document.querySelector('.authorGroupWrap').style.display = 'block';
        document.querySelector('.affiliationEditWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';

        var parent = document.querySelector("#augrp0010");
            
           
            editAffiliatList =  document.querySelector(".EditAffilliatGroupList");
            //editAffiliatList.innerHTML = "";
            $(editAffiliatList).find("li").remove();

        for (var i = 0; i < affiliatioListData.length; i++) {
                var affiliatList = document.createElement('div');
                affiliatList.innerHTML = '<li id="'+affiliatioListData[i].affId+'" draggable="true" ondragenter="dragenter(event)" ondragstart="dragstart(event)"><span class="drog-icon"><i></i><i></i><i></i></span><p style="display: none">Andrea Labouriaua<sup>a</sup></p><h5><sup>'+char[i]+'</sup>'+affiliatioListData[i].affOrganization+ ' ' +affiliatioListData[i].affAddress+ '</h5><span class="comman-edit-icon affEdit"></span><span class="comman-delete-icon affDelete"></span></li>';

                listView = affiliatList.firstChild;
                editAffiliatList.appendChild(listView);

                onClickEdit = editAffilliatGroup.bind(listView);
                onClickDelete = deleteAffilliatGroup.bind(listView);

                listView.querySelector(".affEdit").addEventListener('click', onClickEdit, false);
                listView.querySelector(".affDelete").addEventListener('click', onClickDelete, false);
        }

        $(".EditAffilliatGroupList li").off("dragend").on("dragend", function(event) {
            $(event.target).removeClass("draging");
            edidtAffillitReorder(affilliatListArray);
        });

        document.querySelector(".addNewAuthorAff").removeEventListener("click", newAuthorGroup);
        document.querySelector(".addNewAuthorAff").removeEventListener("click", newFootNoteGroup);
        document.querySelector(".addNewAuthorAff").addEventListener("click", newAffilliatGroup);

        /*document.querySelector(".AuthorTab").addEventListener("click", editAuthorGroupList);
        document.querySelector(".AffiliatTab").addEventListener("click", editAffilliatGroupList);*/
        $(".authorUncited").hide();
        $(".addNewAuthorAff").text("Add Affiliation");
    }

    function edidtAffillitReorder(affilliatListArray){
        var editAffillitList, allList, addList, reorderAffillitId, oldOrder, affId, neworder = [];
        editAffillitList =  document.querySelector(".EditAffilliatGroupList");
        allList = editAffillitList.querySelectorAll('li');

        //$("#augrp0010 .ce_affiliation .ce_textfn").remove();

        for (var i = 0; i < allList.length; i++) {
            addList = editAffillitList.querySelectorAll('li')[i];
            reorderAffillitId = addList.getAttribute("id");

            for (var j = 0; j < affiliatioListData.length; j++) {
                affId = affiliatioListData[j].affId;
                //affId = oldOrder.getAttribute("id");
                if(affId == reorderAffillitId){
                    neworder.push(affiliatioListData[j]);
                    /*var authorCount = $("#augrp0010 .ce_affiliation .ce_textfn").length;
                    var childCount = authorCount-1;
                    if(authorCount){
                          $("#augrp0010 .ce_affiliation").find(".ce_textfn:eq("+childCount+")").after(oldOrder); 
                    }else{
                          $("#augrp0010 .ce_affiliation").prepend(oldOrder);
                    }*/
                }
            }
        }

        affiliatioListData = [];

        affiliatioListData = neworder;
    }

    function newAffilliatGroup(){
        var affilliatEditView, newAffilliat, tempWrapper, tempNode, onClickUpdate;

        affilliatEditView = document.querySelector('.affiliationEditWrap');

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';
        affilliatEditView.style.display = 'block';

        tempNode = document.createElement('span');
        tempWrapper = AffiliatEditTemplate.join('');
        tempWrapper = tempWrapper.replace('{{affFormHeading}}', "Adding Affiliation");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Add");
        tempNode.innerHTML = tempWrapper;
        
        affilliatEditView.innerHTML = "";
        affilliatEditView.appendChild(tempNode);

        var linkAuthorList = affilliatEditView.querySelector('.linkAuthorWithAff');
        //linkAuthorList.innerHTML = '';
        $(linkAuthorList).find("li").remove();

        for (var j = 0; j < authorListData.length; j++) {
            var authorList = document.createElement('div');
            authorList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="authorLinkAff[]" value="'+authorListData[j].authorId+'" id="list'+j+'"><label for="list'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
            linkAuthorList.appendChild(authorList);
        }

        onClickUpdate = addNewAffilliatGroup.bind(affilliatEditView);
        affilliatEditView.querySelector(".updateEditaffiliat").addEventListener('click', onClickUpdate, false);
        affilliatEditView.querySelector(".cancelEditaffiliat").addEventListener("click", editAffilliatGroupList);
    }

    function addNewAffilliatGroup(){
        var affiliatId, affilliatOrg, affilliatAdd, affilliatCount, addAffilliatCount, affilliatDom, childCount, affilitInfo = {};
        affilliatOrg = this.querySelector(".affOrganization").value;
        affilliatAdd = this.querySelector(".affAddress").value;

        if(affilliatOrg == "" && affilliatAdd == ""){ return; }

        addAffId = addAffId+1;
        affiliatId = "aff"+addAffId;

        affilitInfo.affId = affiliatId;
        affilitInfo.affOrganization = affilliatOrg;
        affilitInfo.affAddress = affilliatAdd;
        affilitInfo.affCity = this.querySelector(".affCity").value;
        affilitInfo.affState = this.querySelector(".affState").value;
        affilitInfo.affCounty = this.querySelector(".affCounty").value;
        affilitInfo.affPin = this.querySelector(".affPin").value;
        affilitInfo.affMail = this.querySelector(".affMail").value;
        affilitInfo.affFundId = this.querySelector(".affFundId").value;

        var auhtorCheckboxes = document.getElementsByName("authorLinkAff[]");
        var authorList = []; 
        for (var k=0, n=auhtorCheckboxes.length;k<n;k++) 
        {
            if (auhtorCheckboxes[k].checked) 
            {   var checkValue = auhtorCheckboxes[k].value;
                authorList.push(checkValue);

                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        authorListData[d].affLink.push(affiliatId);
                    }
                }
            }
        }
        affilitInfo.authorLink = authorList;
        affiliatioListData.push(affilitInfo);
        editAffilliatGroupList();
    }

    function editAffilliatGroup(e){
        var tempWrapper, tempNode, onClickUpdate, afflilatId, affilliatEditView, editInfo;

        affilliatEditView = document.querySelector('.affiliationEditWrap');

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';
        affilliatEditView.style.display = 'block';

        afflilatId = this.getAttribute("id");

        tempNode = document.createElement('span');
        tempWrapper = AffiliatEditTemplate.join('');
        tempWrapper = tempWrapper.replace('{{affFormHeading}}', "Edit Affiliation");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Update");
        tempNode.innerHTML = tempWrapper;

        affilliatEditView.innerHTML = "";
        affilliatEditView.appendChild(tempNode); 

        for (var i = 0; i < affiliatioListData.length; i++) {
            if(afflilatId == affiliatioListData[i].affId){
                editInfo = affiliatioListData[i];
            }
        }

        var linkAuthorList = affilliatEditView.querySelector('.linkAuthorWithAff');
        //linkAuthorList.innerHTML = '';
        $(linkAuthorList).find("li").remove();
        for (var j = 0; j < authorListData.length; j++) {
            var authorList = document.createElement('div');
            authorList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="authorLinkAff[]" value="'+authorListData[j].authorId+'" id="list'+j+'"><label for="list'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
            linkAuthorList.appendChild(authorList);

            for(var a = 0; a < editInfo.authorLink.length; a++){
                if(authorListData[j].authorId == editInfo.authorLink[a]){
                    //linkAuthorList.querySelectorAll('input[type="checkbox"]')[j].checked = true;
                    $(linkAuthorList).find("li")[j].remove();
                    var currentDom = '<li><div class="dont-show"><p><input type="checkbox" name="authorLinkAff[]" value="'+authorListData[j].authorId+'" id="list'+j+'" checked="true"><label for="list'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
                    $(linkAuthorList).find('#affAuthorChecked').before(currentDom);
                }
            }
        }

        affilliatEditView.querySelector(".affId").value = editInfo.affId;
        affilliatEditView.querySelector(".affOrganization").value = editInfo.affOrganization;
        affilliatEditView.querySelector(".affAddress").value = editInfo.affAddress;
        affilliatEditView.querySelector(".affCity").value = editInfo.affCity;
        affilliatEditView.querySelector(".affState").value = editInfo.affState;
        affilliatEditView.querySelector(".affCounty").value = editInfo.affCounty;
        affilliatEditView.querySelector(".affPin").value = editInfo.affPin;
        affilliatEditView.querySelector(".affMail").value = editInfo.affMail;
        affilliatEditView.querySelector(".affFundId").value = editInfo.affFundId;
      
        affilliatEditView.querySelector(".cancelEditaffiliat").addEventListener("click", editAffilliatGroupList);

        onClickUpdate = updateAffilliatGroup.bind(affilliatEditView);
        affilliatEditView.querySelector(".updateEditaffiliat").addEventListener('click', onClickUpdate, false);
    }

    function updateAffilliatGroup(){
        var affilliatId, authorGroupContainer, currentAuthor, editInfo;
        //authorName = this.querySelector(".authorName").value;
        //authorSurName = this.querySelector(".authorSurName").value;
        affilliatId = this.querySelector(".affId").value;

        for (var i = 0; i < affiliatioListData.length; i++) {
            if(affilliatId == affiliatioListData[i].affId){
                editInfo = affiliatioListData[i];
            }
        }

        editInfo.affId = this.querySelector(".affId").value;
        editInfo.affOrganization = this.querySelector(".affOrganization").value;
        editInfo.affAddress = this.querySelector(".affAddress").value;
        editInfo.affCity = this.querySelector(".affCity").value;
        editInfo.affState = this.querySelector(".affState").value;
        editInfo.affCounty = this.querySelector(".affCounty").value;
        editInfo.affPin = this.querySelector(".affPin").value;
        editInfo.affMail = this.querySelector(".affMail").value;
        editInfo.affFundId = this.querySelector(".affFundId").value;

        var auhtorCheckboxes = document.getElementsByName("authorLinkAff[]");
        var authorList = []; 
        for (var k=0, n=auhtorCheckboxes.length;k<n;k++) 
        {   var checkValue = auhtorCheckboxes[k].value;
            if (auhtorCheckboxes[k].checked) 
            {   
                authorList.push(checkValue);

                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        var index = authorListData[d].affLink.indexOf(affilliatId);
                        if (index == -1) {
                            authorListData[d].affLink.push(affilliatId);
                        }
                    }
                }
            }else{
                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        var index = authorListData[d].affLink.indexOf(affilliatId);
                        if (index > -1) {
                            authorListData[d].affLink.splice(index, 1);
                        }
                    }
                }
            }
        }
        editInfo.authorLink = authorList;
       
        editAffilliatGroupList();
    }

    function deleteAffilliatGroup(){
        var affilliatId, affGroupContainer, child, editInfo;

        affilliatId = this.getAttribute("id");

        for (var i = 0; i < affiliatioListData.length; i++) {
            if(affilliatId == affiliatioListData[i].affId){
                editInfo = affiliatioListData[i];
                affiliatioListData.splice(i, 1);
            }
        }

        affGroupContainer = document.querySelector(".EditAffilliatGroupList");
        child = affGroupContainer.querySelector("#"+affilliatId);
        if(child != null)
        affGroupContainer.removeChild(child);
    }

    function editFootNoteGroupList(){
        var addList, affiliationName, affiliatList, editNoteList, ceAffiliat, affiliatId, listView, affilliatListArray = [], onClickEdit, onClickDelete;

        var editGrouptWap = document.querySelector('.authorgroup-list-wrapper');
        editGrouptWap.querySelector('ul').className = "EditFootNoteGroupList";
        
        document.querySelector('.AuthorTab').classList.remove('active');
        document.querySelector('.AffiliatTab').classList.remove('active');
        document.querySelector('.FootNoteTab').classList.add('active');

        document.querySelector('.authorGroupWrap').style.display = 'block';
        document.querySelector('.affiliationEditWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';
        document.querySelector('.footNoteEditWrap').style.display = 'none';


        var parent = document.querySelector("#augrp0010");
            
           
            editNoteList =  document.querySelector(".EditFootNoteGroupList");
            //editNoteList.innerHTML = "";
            $(editNoteList).find("li").remove();

        for (var i = 0; i < footNoteListData.length; i++) {
                var footNoteList = document.createElement('div');
                var num = i+1;
                footNoteList.innerHTML = '<li id="'+footNoteListData[i].noteId+'" draggable="true" ondragenter="dragenter(event)" ondragstart="dragstart(event)"><span class="drog-icon"><i></i><i></i><i></i></span><p style="display: none">Andrea Labouriaua<sup>a</sup></p><h5><sup>'+num+'</sup>'+footNoteListData[i].noteContent+'</h5><span class="comman-edit-icon noteEdit"></span><span class="comman-delete-icon noteDelete"></span></li>';

                listView = footNoteList.firstChild;
                editNoteList.appendChild(listView);

                onClickEdit = editFootNoteGroup.bind(listView);
                onClickDelete = deleteFootNoteGroup.bind(listView);

                listView.querySelector(".noteEdit").addEventListener('click', onClickEdit, false);
                listView.querySelector(".noteDelete").addEventListener('click', onClickDelete, false);
        }

        $(".EditFootNoteGroupList li").off("dragend").on("dragend", function(event) {
            $(event.target).removeClass("draging");
            edidtFootNoteReorder();
        });

        document.querySelector(".addNewAuthorAff").removeEventListener("click", newAffilliatGroup);
        document.querySelector(".addNewAuthorAff").removeEventListener("click", newAuthorGroup);
        document.querySelector(".addNewAuthorAff").addEventListener("click", newFootNoteGroup);
        $(".authorUncited").hide();
        $(".addNewAuthorAff").text("Add Footnote");
    }   

    function edidtFootNoteReorder(){
        
    }

    function newFootNoteGroup(){
        var noteEditView, newNote, tempWrapper, tempNode, onClickUpdate;

        noteEditView = document.querySelector('.affiliationEditWrap');

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';
        noteEditView.style.display = 'block';

        tempNode = document.createElement('span');
        tempWrapper = FootNoteEditTemplate.join('');
        tempWrapper = tempWrapper.replace('{{footNoteFormHeading}}', "Adding Footnote");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Add");
        tempNode.innerHTML = tempWrapper;

        noteEditView.innerHTML = "";
        noteEditView.appendChild(tempNode); 

        var linkNoteList = noteEditView.querySelector('.linkAuthorWithNote');
        //linkNoteList.innerHTML = '';
        $(linkNoteList).find("li").remove();
        for (var j = 0; j < authorListData.length; j++) {
            var noteList = document.createElement('div');
            noteList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="authorLinkNote[]" value="'+authorListData[j].authorId+'" id="list'+j+'"><label for="list'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
            linkNoteList.appendChild(noteList);
        }

        onClickUpdate = addNewFootNoteGroup.bind(noteEditView);
        noteEditView.querySelector(".updateEditNote").addEventListener('click', onClickUpdate, false);
        noteEditView.querySelector(".cancelEditNote").addEventListener("click", editFootNoteGroupList);
    }

    function addNewFootNoteGroup(){
        var noteId, noteContent, footNoteInfo = {};
        noteContent = this.querySelector(".noteContent").value;

        if(noteContent == ""){ return; }

        addNoteId = addNoteId+1;
        noteId = "note"+addNoteId;

        footNoteInfo.noteId = noteId;
        footNoteInfo.noteContent = noteContent;

        var auhtorCheckboxes = document.getElementsByName("authorLinkNote[]");
        var authorList = []; 
        for (var k=0, n=auhtorCheckboxes.length;k<n;k++) 
        {
            if (auhtorCheckboxes[k].checked) 
            {   var checkValue = auhtorCheckboxes[k].value;
                authorList.push(checkValue);

                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        authorListData[d].noteLink.push(noteId);
                    }
                }
            }
        }
        footNoteInfo.authorLink = authorList;

        footNoteListData.push(footNoteInfo);
        editFootNoteGroupList();
    }

    function editFootNoteGroup(){
        var tempWrapper, tempNode, onClickUpdate, noteId, footNoteEditView, editInfo;

        footNoteEditView = document.querySelector('.footNoteEditWrap');

        document.querySelector('.authorGroupWrap').style.display = 'none';
        document.querySelector('.authorEditWrap').style.display = 'none';
        footNoteEditView.style.display = 'block';

        noteId = this.getAttribute("id");

        tempNode = document.createElement('span');
        tempWrapper = FootNoteEditTemplate.join('');
        tempWrapper = tempWrapper.replace('{{footNoteFormHeading}}', "Edit Footnote");
        tempWrapper = tempWrapper.replace('{{updateButLabel}}', "Update");
        tempNode.innerHTML = tempWrapper;

        footNoteEditView.innerHTML = "";
        footNoteEditView.appendChild(tempNode);

        for (var i = 0; i < footNoteListData.length; i++) {
            if(noteId == footNoteListData[i].noteId){
                editInfo = footNoteListData[i];
            }
        }

        var linkNoteList = footNoteEditView.querySelector('.linkAuthorWithNote');
        //linkNoteList.innerHTML = '';
        $(linkNoteList).find("li").remove();
        for (var j = 0; j < authorListData.length; j++) {
            var noteList = document.createElement('div');
            noteList.innerHTML = '<li><div class="dont-show"><p><input type="checkbox" name="authorLink_Note[]" value="'+authorListData[j].authorId+'" id="list_'+j+'"><label for="list_'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
            linkNoteList.appendChild(noteList);

            for(var a = 0; a < editInfo.authorLink.length; a++){
                if(authorListData[j].authorId == editInfo.authorLink[a]){
                   // linkNoteList.querySelectorAll('input[type="checkbox"]')[j].checked = true;
                    $(linkNoteList).find("li")[j].remove();
                    var currentDom = '<li><div class="dont-show"><p><input type="checkbox" name="authorLink_Note[]" value="'+authorListData[j].authorId+'" id="list_'+j+'" checked="true"><label for="list_'+j+'">'+authorListData[j].authorName+', '+authorListData[j].authorSurName+'<sup>a</sup></label></p></div></li>';
                    $(linkNoteList).find('#noteAuthorChecked').before(currentDom);
                }
            }
        }

        footNoteEditView.querySelector(".noteId").value = editInfo.noteId;
        footNoteEditView.querySelector(".noteContent").value = editInfo.noteContent;
      
        footNoteEditView.querySelector(".cancelEditNote").addEventListener("click", editFootNoteGroupList);

        onClickUpdate = updateFootNoteGroup.bind(footNoteEditView);
        footNoteEditView.querySelector(".updateEditNote").addEventListener('click', onClickUpdate, false);
    }

    function updateFootNoteGroup(){
        var noteId, editInfo;
       
        noteId = this.querySelector(".noteId").value;

        for (var i = 0; i < footNoteListData.length; i++) {
            if(noteId == footNoteListData[i].noteId){
                editInfo = footNoteListData[i];
            }
        }

        editInfo.noteId = this.querySelector(".noteId").value;
        editInfo.noteContent = this.querySelector(".noteContent").value;
        var auhtorCheckboxes = document.getElementsByName("authorLink_Note[]");
        var authorList = []; 
        for (var k=0, n=auhtorCheckboxes.length;k<n;k++) 
        {
            var checkValue = auhtorCheckboxes[k].value;
            if (auhtorCheckboxes[k].checked) 
            {
                authorList.push(checkValue);

                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        var index = authorListData[d].noteLink.indexOf(noteId);
                        if (index == -1) {
                            authorListData[d].noteLink.push(noteId);
                        }
                        
                    }
                }
            }else{
                for (var d = 0; d < authorListData.length; d++) {
                    if(authorListData[d].authorId == checkValue){
                        var index = authorListData[d].noteLink.indexOf(noteId);
                        if (index > -1) {
                            authorListData[d].noteLink.splice(index, 1);
                        }
                        
                    }
                }
            }
        }
        editInfo.authorLink = authorList;
       
        editFootNoteGroupList();
    }

    function deleteFootNoteGroup(){
        var noteId, editInfo, noteGroupContainer, child;

        noteId = this.getAttribute("id");

        for (var i = 0; i < footNoteListData.length; i++) {
            if(noteId == footNoteListData[i].noteId){
                editInfo = footNoteListData[i];
                footNoteListData.splice(i, 1);
            }
        }

        noteGroupContainer = document.querySelector(".EditFootNoteGroupList");
        child = noteGroupContainer.querySelector("#"+noteId);
        if(child != null)
        noteGroupContainer.removeChild(child);
    }

    function toggleAuthorGroupList(){
        if($(".authorGroupWrap").is(":visible") == true){  
             document.querySelector('.authorGroupWrap').style.display = 'none';
             $(".proofCorrector").find(".article-overlay").remove();
             return; 
        }

        var addList, authorName, authorSurName, ceauthor, authorId, authorList, authorEmail, authorInfo = {}, affilitInfo = {}, ceAffiliat,
        affiliationOrg, affiliationAddress, affiliatId, affLink = [], noteLink = [], authorLink = [];

        var winHeight = $(window).height();
        $(".authorgroup-wrapper").css("height", winHeight-40+"px");
        $(".author-edit-wrapper").css("heigth", winHeight-40+"px");
        $(".author-edit-wrapper").css("height", winHeight-40+"px");
        $(".affiliation-edit-wrapper").css("height", winHeight-40+"px");
        $(".author-form-wrapper").css("height", winHeight-190+"px");


        if(isfirst == 0){
            isfirst = 1;
            var parent = document.querySelector("#augrp0010");
            ceauthor = parent.querySelectorAll('.ce_author');
            authorListData = [], affiliatioListData = [];

            for (var i = 0; i < ceauthor.length; i++) {
                    authorEmail = '';
                    addList = parent.querySelectorAll('.ce_author')[i];
                    authorName = addList.querySelector(".ce_given-name").innerText;
                    authorSurName = addList.querySelector(".ce_surname").innerText;
                    if(addList.querySelector(".ce_e-address")){
                        authorEmail = addList.querySelector(".ce_e-address").innerText;
                    }

                    authorId = addList.getAttribute("id");
                    addAuthorID = addAuthorID+1;

                    authorInfo = {"authorId":authorId, "authorName":authorName, "authorSurName":authorSurName, "authorDegree":"", "authorORC":"", 
                    "authorRole":"", "authorEmail":authorEmail, "authorPhone":"", "Correspondence":"", "coAuthorDetail":"", "affLink": "", "noteLink" : ""};

                    authorListData.push(authorInfo);

                    authorListData[i].noteLink = [];
                    authorListData[i].affLink = [];
            }

            ceAffiliat = parent.querySelectorAll('.ce_affiliation');

            for (var i = 0; i < ceAffiliat.length; i++) {
                    addList = parent.querySelectorAll('.ce_affiliation')[i];
                    affiliationOrg = addList.querySelector('.AffilliatOrg').innerText;
                    affiliationAddress = addList.querySelector('.AffilliatAddress').innerText;

                    addAffId = addAffId+1;
                    affiliatId = "aff"+addAffId;

                    affilitInfo = {"affId" : affiliatId, "affOrganization":affiliationOrg, "affAddress":affiliationAddress, "affCity":"", 
                    "affState":"", "affCounty":"", "affPin":"", "affMail":"", "affFundId":"", "authorLink" : authorLink};
                    affiliatioListData.push(affilitInfo);
            }
        }

        $(".proofCorrector").prepend('<div class="article-overlay"></div>');

        editAuthorGroupList();
    }

    function viewUncited(){
        var addList, authorName, authorSurName, authorList, editAuthorList, ceauthor, authorId, 
        authorListArray = [], onClickEdit, onClickDelete, listView, authorList;

        var parent = document.querySelector("#augrp0010");
            ceauthor = parent.querySelectorAll('.ce_author');

        editAuthorList =  document.querySelector(".EditAuthorGroupList");
        //editAuthorList.innerHTML = "";
        $(editAuthorList).find("li").remove();
        
        for (var i = 0; i < authorListData.length; i++) {
            //addList = parent.querySelectorAll('.ce_author')[i];
            authorName = authorListData[i].authorName;
            authorSurName = authorListData[i].authorSurName;
            authorId = authorListData[i].authorId;
            var affDis = "";
            var noteDis = "";

            for(var a = 0; a < affiliatioListData.length; a++){
                for(var b = 0; b < authorListData[i].affLink.length; b++){
                    if(affiliatioListData[a].affId == authorListData[i].affLink[b]){
                        affDis += ","+char[a];
                    }
                }
            }
            if (affDis) affDis = affDis.substring(1);

            for(var c = 0; c < footNoteListData.length; c++){
                for(var d = 0; d < authorListData[i].noteLink.length; d++){
                    if(footNoteListData[c].noteId == authorListData[i].noteLink[d]){
                        var num = c+1;
                        noteDis += ","+num;
                    }
                }
            }
            if (noteDis) noteDis = noteDis.substring(1);

            authorList = document.createElement('div');
            authorList.innerHTML = '<li id="'+authorId+'" draggable="true" ondragenter="dragenter(event)" ondragstart="dragstart(event)"><span class="drog-icon"><i></i><i></i><i></i></span><p>'+authorName+' '+authorSurName+'<sup>'+affDis+' '+noteDis+'</sup></p><span class="comman-edit-icon authorEdit"></span><span class="comman-delete-icon authorDelete"></span></li>';
            listView = authorList.firstChild;

            if(affDis == "" && noteDis == ""){
                $(editAuthorList).find("#unclitedList").before(listView);
            }else{
                editAuthorList.appendChild(listView);
            }
            
            onClickEdit = editAuthorGroup.bind(listView);
            onClickDelete = deleteAuthorGroup.bind(listView);

            listView.querySelector(".authorEdit").addEventListener('click', onClickEdit, false);
            listView.querySelector(".authorDelete").addEventListener('click', onClickDelete, false);

        }

        $(".authorUncited").text("Hide Uncited");
        document.querySelector(".authorUncited").removeEventListener("click", viewUncited);
        document.querySelector(".authorUncited").addEventListener("click", editAuthorGroupList);
    }

    function doneAuthorGroupList(){
        $("#augrp0010").find(".ce_author").remove();
        $("#augrp0010").find(".ce_affiliation").remove();


        for (var i = 0; i < authorListData.length; i++) {
            var affDis = "";
            var noteDis = "";

            for(var a = 0; a < affiliatioListData.length; a++){
                for(var b = 0; b < authorListData[i].affLink.length; b++){
                    if(affiliatioListData[a].affId == authorListData[i].affLink[b]){
                        affDis += ","+char[a];
                    }
                }
            }
            if (affDis) affDis = affDis.substring(1);


            for(var c = 0; c < footNoteListData.length; c++){
                for(var d = 0; d < authorListData[i].noteLink.length; d++){
                    if(footNoteListData[c].noteId == authorListData[i].noteLink[d]){
                        var num = c+1;
                        noteDis += ","+num;
                    }
                }
            }
            if (noteDis) noteDis = noteDis.substring(1);

            var authorList = '<div class="ce_author" id="'+authorListData[i].authorId+'" name="OPT_ID_420"><span class="ce_given-name" name="OPT_ID_421" title="given name">'+authorListData[i].authorName+'<span class="x"> </span></span><span class="ce_surname" name="OPT_ID_422" title="surname">'+authorListData[i].authorSurName+'</span> <sup>'+affDis+ ' ' +noteDis+ '</sup> <div class="ce_e-address" id="eadd0010" name="OPT_ID_429">'+authorListData[i].authorEmail+'</div></div>';
            
            var authorCount = $("#augrp0010 .ce_author").length;
            var childCount = authorCount-1;
            if(authorCount){
                  $("#augrp0010").find(".ce_author:eq("+childCount+")").after(authorList); 
            }else{
                  $("#augrp0010").prepend(authorList); 
            }
        }

        for (var j = 0; j < affiliatioListData.length; j++) {
            var affiliatList = '<div class="ce_affiliation" id="aff18" name="OPT_ID_433"><span class="ce_textfn" name="OPT_ID_434" id="af1"><span class="AffilliatOrg"><sup>'+char[j]+'</sup> '+affiliatioListData[j].affOrganization+ '</span> <span class="AffilliatAddress">' +affiliatioListData[j].affAddress+' </span></span></div>';

            var authorCount = $("#augrp0010 .ce_author").length;
            var affCount = $("#augrp0010 .ce_affiliation").length;

            var affChildCount = affCount-1;
            var authChildCount = affCount-1;

            var childCount = authorCount-1;
            if(affCount){
                  $("#augrp0010").find(".ce_affiliation:eq("+affChildCount+")").after(affiliatList); 
            }/*else if(authorCount){
                  $("#augrp0010").find(".ce_author:eq("+authChildCount+")").after(affiliatList); 
            }*/else{
                  $("#augrp0010 .ce_collaboration").after(affiliatList); 
            }
        }

        document.querySelector('.authorGroupWrap').style.display = 'none';
        $(".proofCorrector").find(".article-overlay").remove();
    }

    editFrontMatterPanel.prototype.render = function render() {
        var tempWrapper,
            instance = this,
            qs = this.container.querySelector.bind(this.container);

        var parent = document.querySelector("#augrp0010"),

        ceauthor = parent.querySelectorAll('.ce_author');

        for (var i = 0; i < ceauthor.length; i++) {
            var addList = parent.querySelectorAll('.ce_author')[i];
            var idNum = i+1;
            addList.setAttribute("id", "au"+idNum);
        }

        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = FrontTemplate.join('');
        this.tempWrapper = tempWrapper;
        
        // this.tempWrapper.addEventListener('click', onLabelClick, false);
        //this.htmlDoc.body.appendChild(this.tempWrapper);
        this.container.appendChild(this.tempWrapper);

        var authorGroupWar = document.querySelector("#augrp0010");

        var editIcon = this.htmlDoc.createElement('span');
        editIcon.innerHTML = EditIconTemplate.join('');
        authorGroupWar.appendChild(editIcon.firstChild);

        document.querySelector(".editAuthorInfo").addEventListener("click", toggleAuthorGroupList);

        var parent = document.querySelector("#augrp0010");
        var affilliatDom = '<span class="ce_textfn" name="OPT_ID_434" id="af1"><span class="AffilliatOrg">Department of Chemical & Biomolecular Engineering, National University of Singapore,</span> <span class="AffilliatAddress">4 Engineering Drive 4, Singapore 117576, Singapore</spna> </span>'
        parent.querySelector('.ce_affiliation').innerHTML = affilliatDom;

        $("#au2").after('<div class="ce_author" id="au3" name="OPT_ID_420"><span class="ce_given-name" name="OPT_ID_421" title="given name">EDEL <span class="x"> </span></span><span class="ce_surname" name="OPT_ID_422" title="surname">WEISS</span> <sup></sup> </div>')

        setTopPosition(this);
    };

    return editFrontMatterPanel;
});

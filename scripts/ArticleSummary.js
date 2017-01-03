define(['scripts/TreePanel', 'scripts/TreeModel', 'scripts/Helper','scripts/EventBus'], function articleLoader(
    TreePanel, TreeModel, Helper,EventBus) {
    'use strict';

    var metaDataTemplate = [
            '<div class="metadate-content">',
                '<ul class="editing-list metadataInfo">',
                    '<li>',
                        '<div class="cnt-label">',
                            '<figure>',
                                '<img src="images/cover-img.png" alt="">',
                            '</figure>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<h2 class="table-cnt-title">',
                                'Gamma irradiation and oxidative degradation of a silica-filled silicone elastomer',
                            '</h2>',
                        '</div>',
                    '</li>',
                    '<div class="clearfix"></div>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>Article ID :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleID">FD 1025</span>',
                        '</div>',
                    '</li>',
                     '<li>',
                        '<div class="cnt-label">',
                            '<span>DOI :</span>',
                        '</div>',
                        '<div class="cnt-info ">',
                            '<span class="label-strong articleDOI">15-Sep-2016</span>',
                        '</div>',
                    '</li>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>TOC Head :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleTOC">FD 1025</span>',
                        '</div>',
                    '</li>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>Heading :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleHeading">-</span>',
                        '</div>',
                    '</li>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>Collection Code 1  :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleColl_1">-</span>',
                        '</div>',
                    '</li>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>Online Pub Date :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleOPD">08-Nov-2016</span>',
                        '</div>',
                    '</li>',
                    '<li>',
                        '<div class="cnt-label">',
                            '<span>Elocation ID :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleEID">-</span>',
                        '</div>',
                    '</li>',
                     '<li>',
                        '<div class="cnt-label">',
                            '<span>Volume  :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleVolume">II</span>',
                        '</div>',
                    '</li>',
                     '<li>',
                        '<div class="cnt-label">',
                            '<span>Issue :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleIssue">-</span>',
                        '</div>',
                    '</li>',
                     '<li>',
                        '<div class="cnt-label">',
                            '<span>First page  :</span>',
                        '</div>',
                        '<div class="cnt-info">',
                            '<span class="label-strong articleFP">-</span>',
                        '</div>',
                    '</li>',
                '</ul>',
                
                '<div class="edit-btn-group">',
                    '<a href="javascript:;" class="meta-edit-btn metaEditBtn">Edit</a>',
                '</div>',
            '</div>'
        ];

    var fundingInfoTemplate = [
            '<div class="funding-content">',
                '<div class="metadate-content">',
                '<ul class="editing-list fundingInfo">',
                    
                    '</ul>',
                    '</div>',
                    '<div class="edit-btn-group">',
                    '<a href="javascript:;" class="meta-edit-btn fundingAddBtn">Add</a>',
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
    function ArticleSummary(articleInnerTab, EventBus, win, doc, localeData) {
         initializeVariables(this);
        if (articleInnerTab instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        this.container = articleInnerTab;
        this.localeData = localeData;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = EventBus;
    }    

    ArticleSummary.prototype.render = function render() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = metaDataTemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        document.body.appendChild(this.element);
        this.container.appendChild(this.element);
        
    };

    ArticleSummary.prototype.fundrender = function fundrender() {
        var tempWrapper,
            instance = this,
           
        tempWrapper = this.htmlDoc.createElement('span');
        tempWrapper.innerHTML = fundingInfoTemplate.join('');
        this.tempWrapper = tempWrapper;
        this.element = this.tempWrapper;
        this.container.appendChild(this.element);
        
    };

    return ArticleSummary;
});

define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/ConfigReader'
], function CarouselViewer(Helper, EventBus, ConfigReader) {
    'use strict';

    /*var carouselTemplate = [
        '<div class="carousel-box">',
            '<div class="image-box-header">',
                '<span class="close-popup" title="{{title}}">',
                    '<svg xmlns="http://www.w3.org/2000/svg" ',
                        'viewBox="0 0 16 16" enable-background="new 0 0 16 16" width="12" height="12">',
                        '<switch><g><path fill="#FFF" d="M8.7,8l7.1-7.1c0.2-0.2,0.2-0.5,0-0.7s-0.5-0.2-0.7,0L8,7.3L0.9,0.2C0.7,0,0.4,0,0.2,0.2S0,0.7,0.2,0.9 L7.3,8l-7.1,7.1c-0.2,0.2-0.2,0.5,0,0.7C0.3,15.9,0.4,16,0.5,16s0.3,0,0.4-0.1L8,8.7l7.1,7.1c0.1,0.1,0.2,0.1,0.4,0.1 s0.3,0,0.4-0.1c0.2-0.2,0.2-0.5,0-0.7L8.7,8z"/></g></switch>',
                    '</svg>',
                '</span>',
            '</div>',
            '<div class="image-box figure">',
                '<div class="overlay"></div>',
                '<img class="carousel-image" src="{{imagesrc}}" /></div>',
            '</div>',
        '</div>'
    ];*/

    var carouselTemplate = [
        '<div class="image-annotation-wrapper" style="display: block">',
       '<span class="image-annotation-kill">Done</span>',
        '<div class="image-annotation-table">',
            '<div class="image-annotation-table-cell">',
                '<div class="annotation-top">',
                    '<ul class="antNumberList"></ul>',
                '</div>',

                '<div class="image-annotation-content">',
                    '<div class="image-content-left">',
                        '<div class="image-lbl-marker">',
                            '<div class="image-annotation-lbl addNewAnnotate">',
                                '<span class="image-annotation-spn">Annotate</span>',
								'<span class="mini-image"></span>',
								'<span class="zoom-image"></span>',
                            '</div>',
                            '<div class="figure-lbl-holder">',
								'<div class="figure-lbl-table">',
									'<div class="figure-lbl-table-cell">',
                                			'<img src="{{imagesrc}}" alt="annotate-img" class="carousel-image">',
									'</div>',
								'</div>',
                            '</div>',
                            /*'<div class="fig-caption-wrapper">',
                                '<h1>Fig 1.3</h1>',
                                '<p>True Stress–True Strain plots of the DC745 material response near the phase transition temperature. Each plot shows three cycles of loading at test temperatures near the transi- tion temperature. All of the samples were allow equilibrating at the test temperature for 1 h and the strain was applied at 0.01/second. The di erent plots are for the di erent radia- tion</p>',
                            '</div>',*/
                        '</div>',
                    '</div>',
                    '<div class="image-content-right rightAnotation" style="display:none">',
                        '<div class="annotation-wrapper-right">',
                            '<span class="annotation-counts antCounts">4</span>',
                            '<div class="annotation-text">',
                                '<p class="antText">Annotated by Proof editor</p>',
                                '<span class="antDate">20 Nov 2016</span>',
                                '<a href="javascript:;" class="delete-annotation-list antDelete"></a>',
                            '</div>',
                            '<span class="annotation-delete"></span>',
                        '</div>',
                        '<div class="annotation-text-wrapper">',
                            '<textarea class="antTextArea"></textarea>',
                            '<div class="annotation-action-btn">',
                                '<span class="antSave">Save</span>',
                                '<span class="antCancel">Cancel</span>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',

            '</div>',
        '</div>',
    '</div>'  
    ];

    function initializeVariables(instance) {
        instance.doc = null;
        instance.win = null;
        instance.carouselBox = null;
        instance.closeAction = null;
        instance.carouselImage = null;
    }

    /*function renderTemplate(instance, imagePath) {
        var carouselDetails,
            tmpNode = null;

        tmpNode = instance.doc.createElement('div');
        carouselDetails = carouselTemplate.join('');
        carouselDetails = carouselDetails.replace('{{imagesrc}}', imagePath);
        carouselDetails = carouselDetails.replace('{{title}}', ConfigReader.getLocaleByKey(
            'carousel.expand.title'
        ));
        tmpNode.innerHTML = carouselDetails;
        instance.carouselBox = tmpNode.firstChild;
        instance.doc.body.appendChild(instance.carouselBox);
    }*/

    function renderTemplate(instance, imagePath) {
        var carouselDetails,
            tmpNode = null;

        tmpNode = instance.doc.createElement('div');
        carouselDetails = carouselTemplate.join('');
        carouselDetails = carouselDetails.replace('{{imagesrc}}', imagePath);
        /*carouselDetails = carouselDetails.replace('{{title}}', ConfigReader.getLocaleByKey(
            'carousel.expand.title'
        ));*/
        tmpNode.innerHTML = carouselDetails;
        instance.carouselBox = tmpNode.firstChild;

        /*var annotateWap = instance.doc.body.querySelector(".image-annotation-wrapper");
        annotateWap.style.display = "block";*/
        instance.doc.body.appendChild(instance.carouselBox);
    }

    function closeAction() {
        this.destroy();
        EventBus.publish('CarouselViewer:close');
    }

    function CarouselViewer(Document, Window) {
        initializeVariables(this);
        this.doc = Document;
        this.win = Window;
    }

    function carouselClose() {
        var overlayBlock = this.carouselBox.querySelector('div.overlay');

        //overlayBlock.classList.add('hide');
        EventBus.publish('CarouselViewer:loaded', this);
    }

    /*CarouselViewer.prototype.load = function setLoadData(imagePath, imgId) {
        renderTemplate(this, imagePath);
        this.closeBtn = this.carouselBox.querySelector('.close-popup');
        this.carouselImage = this.carouselBox.querySelector('img.carousel-image');
        this.carouselCloseHandler = carouselClose.bind(this);
        this.closeAction = closeAction.bind(this);
        this.carouselImage.dataset.id = imgId;
    };*/

    CarouselViewer.prototype.load = function setLoadData(imagePath, imgId) {
        renderTemplate(this, imagePath);
        this.closeBtn = this.carouselBox.querySelector('.image-annotation-kill');
        this.carouselImage = this.carouselBox.querySelector('img.carousel-image');
        this.carouselCloseHandler = carouselClose.bind(this);
        this.closeAction = closeAction.bind(this);
        this.carouselImage.dataset.id = imgId;
    };

    CarouselViewer.prototype.setUpEvents = function setUpEvents() {
        this.carouselImage.addEventListener('load', this.carouselCloseHandler, false);
        this.closeBtn.addEventListener('click', this.closeAction, false);
    };

    CarouselViewer.prototype.destroy = function destroy() {
        this.carouselImage.removeEventListener('load', this.carouselCloseHandler, false);
        this.closeBtn.removeEventListener('click', this.closeAction, false);
        this.carouselBox.parentNode.removeChild(this.carouselBox);
        initializeVariables(this);
    };

    return CarouselViewer;
});

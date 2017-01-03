define([
    'scripts/Helper', 'scripts/CarouselViewer', 'customer/Config',
    'scripts/Util', 'scripts/ConfigReader', 'scripts/FeatureToggle'
], function ImageViewerLoader(
    Helper, CarouselViewer, CustomerConfig, Util, ConfigReader, Features
) {
    var imageNodes = {},
        cssRules = {
            '.highResImageView .container-image': {
                'display': 'block',
                'border': '1px solid #e3e3e3',
                'margin': '0 auto',
				'position':'relative'
            },
            '.highResImageView': {
                'position': 'relative',
                'margin-top': '0.7em',
                'margin-bottom': '0.7em',
                'padding': '0.3em 0.3em',
                'background-color': '#F9F9F9'
            },
            '.highResImageView .wrapper': {
                'position': 'relative',
                'display': 'flex'
            },
            '.figureEditor': {
                'position': 'absolute',
                'right': '0',
                'top': '0',
                'flex': 'none',
                'margin': '0',
                'width': '61px',
                'padding': '0',
                'list-style-type': 'none'
            },
            '.figureEditor li': {
				'float': 'left'
            },
            '.expand-icon': {
                'border-right':'1px solid #fff !important'
            },
            '.replace-icon': {
                
            },
            '.expand-icon, .replace-icon': {
                'height': '30px',
                'width': '30px',
                'cursor': 'pointer',
				'color': '#fff',
				'background': '#414042',
				'outline': 'none',
				'border': 'none',
                'display': 'block'
            },
            '.expand-icon:hover, .replace-icon:hover': {
				'background': '#e57d37',
            },			
            '.carousel-box .annotator-container': {
                'margin': '0 auto'
            }
        },
        expandBtnTemplate = [
            '<li>',
            '<button class="expand-icon">',
			'<i class="annotation-count">8</i>',
            '</button>',
            '</li>'
        ],
        replaceBtnTemplate = [
            '<li>',
            '<button class="replace-icon">',
				'<div class="image-replace-tooltip">',
					'<span class="figure-guideline">figure Replace Guideline</span>',
					'<p><span>Upto</span><i>20mb</i></p>',
					'<p><span>Supports</span><i> jpg, png, bmp</i></p>',
					'<p><span>Figure annotations will be lost</span><i class="figure-notify"></i></p>',
				'<div>',
            '</button>',
            '</li>'
        ];

    function initializeVariables(instance) {
        instance.stylesheetId = 'imageviewer-style';
        instance.styleSheet = null;
        instance.container = null;
        instance.doc = null;
        instance.win = null;
        instance.carouselViewer = null;
        instance.showCarouselFn = null;
        instance.overlayCarouselFn = null;
        instance.overlayCarouselOutFn = null;
        instance.expandBtn = null;
        instance.imageSelectors = null;
        instance.replaceBtn = null;
        instance.isHighResImageNeeded = null;
        instance.isReplaceImageNeeded = null;
        instance.replaceImageMetaData = null;
    }

    function toggleFigureEditingState(imageNode, isImageReplaced) {
        var containerImage, expandBtn, containerImageClasses, expandBtnClasses,
            node = imageNode.node,
            listenerCallback = imageNode.listenerCallback;

        containerImage = node.querySelector('.container-image');
        containerImageClasses = containerImage.classList;
        expandBtn = node.querySelector('.expand-icon');
        expandBtnClasses = expandBtn.classList;
        if (isImageReplaced === true) {
            containerImageClasses.add('imagereplaced');
            expandBtnClasses.add('disabled');
            expandBtn.parentNode.removeEventListener('click', listenerCallback, false);
        }
        else {
            containerImageClasses.remove('imagereplaced');
            expandBtnClasses.remove('disabled');
            expandBtn.parentNode.addEventListener('click', listenerCallback, false);
        }
    }

    function initiateReplaceImage(imageId) {
        var imageNode = imageNodes[imageId];

        toggleFigureEditingState(imageNode, true);
    }

    function undoReplaceImage(imageId) {
        var imageNode = imageNodes[imageId];

        toggleFigureEditingState(imageNode, false);
    }

    function ImageViewer(doc, win, Container, EventBus, replaceImageMetaData) {
        initializeVariables(this);
        this.container = Container;
        this.eventBus = EventBus;
        this.doc = doc;
        this.win = win;
        this.replaceImageMetaData = replaceImageMetaData;
        this.imageSelectors = Util.selectorToArray(
            CustomerConfig.get('enableHigResFor')
        );
        this.isHighResImageNeeded = Features.isFeatureEnabled('Editor.HighResImage.Enable');
        this.isReplaceImageNeeded = Features.isFeatureEnabled('Editor.ReplaceImage');
        this.eventBus.subscribe('replaceImage:Initiated', initiateReplaceImage, this);
        this.eventBus.subscribe('replaceImage:Undo', undoReplaceImage, this);
    }

    function showImageInCarousel(figureNode, e) {
        var imagePath,
            target = e.target,
            hasWebAndPrint = figureNode.querySelector('.rbweb'),
            webImageSelected = figureNode.querySelector('.rbweb.selected'),
            printImagePath, webImagePath, imgNode, imgId;

        imgNode = figureNode.querySelector('img');
        if (Helper.isNull(imgNode) === true) {
            return;
        }
        imgId = imgNode.dataset.id;
        if (target.classList.contains('expand-icon') === false) {
            return;
        }
        webImagePath = target.dataset.webImagePath;
        printImagePath = target.dataset.printImagePath;
        this.carouselViewer = new CarouselViewer(this.doc, this.win);
        imagePath = printImagePath;
        if (Helper.isNull(hasWebAndPrint) === true) {
            imagePath = webImagePath;
        }
        else if (Helper.isNull(webImageSelected) === false) {
            imagePath = webImagePath;
        }
        this.eventBus.publish('ImageViewer:showImage', imagePath);
        this.carouselViewer.load(imagePath, imgId);
        this.carouselViewer.setUpEvents();
    }

    function createExpandBtn(instance, figureNode) {
        var expandBtn, imagePath, imageWebDataSrc,
            imagePrintDataSrc, expandBtnContainer, tmpNode;

        imagePath = figureNode.querySelector('img[data-original-web-src]');
        if (Helper.isNull(imagePath) === true) {
            return null;
        }
        imageWebDataSrc = imagePath.dataset.originalWebSrc;
        imagePrintDataSrc = imagePath.dataset.originalPrintSrc;
        tmpNode = instance.doc.createElement('div');
        expandBtnContainer = expandBtnTemplate.join('');
        tmpNode.innerHTML = expandBtnContainer;
        expandBtn = tmpNode.querySelector('.expand-icon');
        expandBtn.setAttribute('title', ConfigReader.getLocaleByKey(
            'imageviewer.expand.title'
        ));
        if(Helper.isUndefined(imageWebDataSrc) === false) {
            expandBtn.dataset.webImagePath = imageWebDataSrc;
        }
        if(Helper.isUndefined(imagePrintDataSrc) === false) {
            expandBtn.dataset.printImagePath = imagePrintDataSrc;
        }
        return tmpNode.firstChild;
    }

    function createReplaceButton(instance, imageId) {
        var replaceBtn, tmpNode, replaceBtnContainer;

        tmpNode = instance.doc.createElement('div');
        replaceBtnContainer = replaceBtnTemplate.join('');
        tmpNode.innerHTML = replaceBtnContainer;
        replaceBtn = tmpNode.querySelector('.replace-icon');
        replaceBtn.setAttribute('title', ConfigReader.getLocaleByKey(
                'imageviewer.replaceBtn.title'
        ));
        replaceBtn.dataset.imageReferenceId = imageId;
        return tmpNode.firstChild;
    }

    function onClickReplaceImage(event) {
        var imageId, imageNode,
            target = event.target;

        imageId = target.dataset.imageReferenceId;
        imageNode = imageNodes[imageId].node;
        this.eventBus.publish('ReplaceImage:onClick', imageNode);
    }

    ImageViewer.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.doc, this.styleSheet, cssRules);
    };

    ImageViewer.prototype.render = function renderImageViewer() {
        var elem, imgNode, len, figureNode, imageId, styleEl,
            styleSheet = this.doc.head.querySelector('#' + this.stylesheetId),
            figureNodes = this.container.querySelectorAll(this.imageSelectors),
            figureNodeLength = figureNodes.length,
            i = 0;

        if (Helper.isNull(styleSheet) === true) {
            styleEl = this.doc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.doc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.insertStylesToHead = true;
            this.renderStyles();
        }

        for (; i < figureNodeLength; i += 1) {
            figureNode = figureNodes[i];
            imgNode = figureNode.querySelector('img');
            elem = figureNode.querySelectorAll(this.imageSelectors);
            len = elem.length;
            if (Helper.isNull(imgNode) === true || len !== 0) {
                continue;
            }
            figureNode.classList.add('highResImageView');
            imageId = imgNode.dataset.id;
            imageNodes[imageId] = {};
            imageNodes[imageId].node = figureNode;
            elem = this.doc.createElement('ul');
            elem.classList.add('figureEditor');
            if (this.isHighResImageNeeded === true) {
                this.expandBtn = createExpandBtn(this, figureNode);
                if (Helper.isNull(this.expandBtn) === false) {
                    elem.appendChild(this.expandBtn);
                    figureNode.appendChild(elem);
                    this.showCarouselFn = showImageInCarousel.bind(this, figureNode);
                    this.expandBtn.addEventListener('click', this.showCarouselFn, false);
                    imageNodes[imageId].listenerCallback = this.showCarouselFn;
                    if (Helper.isUndefined(this.replaceImageMetaData) === false &&
                        this.replaceImageMetaData.hasOwnProperty(imageId) === true) {
                        initiateReplaceImage(imageId);
                    }
                }
            }
            if (this.isReplaceImageNeeded === true) {
                this.replaceBtn = createReplaceButton(this, imageId);
                elem.appendChild(this.replaceBtn);
                figureNode.appendChild(elem);
                this.replaceImageFn = onClickReplaceImage.bind(this);
                this.replaceBtn.addEventListener('click', this.replaceImageFn, false);
            }
        }
    };

    ImageViewer.prototype.destroy = function destroy() {
        this.expandBtn.removeEventListener('click', this.showCarouselFn, false);
        initializeVariables(this);
    };

    ImageViewer.removeWrapper = function removeWrapperFn(node) {
        var wrapper,
            i = 0,
            wrappers = node.querySelectorAll('.figureEditor'),
            len = wrappers.length;

        for (; i < len; i += 1) {
            wrapper = wrappers[i];
            wrapper.parentNode.removeChild(wrapper);
        }

        return node;
    };

    return ImageViewer;
});

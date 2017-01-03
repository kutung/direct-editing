define([
    'scripts/Helper', 'scripts/Annotate',
    'scripts/AnnotationPersistor', 'scripts/ConfigReader', 'scripts/Util',
    'customer/Config', 'scripts/FeatureToggle'
], function annotationInitLoader(
    Helper, Annotate, AnnotationPersistor, Config, Util, customerConfig, Features
    ) {
    var imageNodes = [],
        annotationMap = {},
        inlineFigureSelector = Util.getSelector('inlineFigure'),
        inlineEquationSelector = Util.getSelector('inlineFormula'),
        annotateInst = [],
        highResAnnotateInst = [];

    function removeUnsavedAnnotation(boxId, instance) {
        var annotationKey, annotation,
            i, box;

        for (annotationKey in annotationMap) {
            if (annotationMap.hasOwnProperty(annotationKey) === true) {
                annotation = annotationMap[annotationKey];

                for (i = 0; i < annotation.annotationBoxes.length; i += 1) {
                    box = annotation.annotationBoxes[i];
                    if (box.saved === false) {
                        if (instance.id === annotationKey && box.id === boxId) {
                            continue;
                        }

                        annotation.clearAnnotation(box.id);
                    }
                }
            }
        }
    }

    function applyExistingAnnotations(instance, annInst, annotates, imageId, highResImage) {
        var annotate, data, boxId,
            j = 0,
            len = annotates.length;

        for (; j < len; j += 1) {
            annotate = annotates[j];
            if (annotate === null) {
                return;
            }
            data = {
                'x': annotate.position.left,
                'y': annotate.position.top,
                'width': annotate.position.width,
                'height': annotate.position.height
            };
            boxId = annInst.annotate(data, annotate.text, true);
            if (highResImage === true) {
                instance.annotationBag.updateBag(
                    annotate.annotationId, imageId, boxId, annotate.imageType,
                    annotate.text, annotate.position
                );
            }
            else {
                instance.annotationBag.addBag(
                    annotate.annotationId, imageId, boxId, annotate.imageType,
                    annotate.text, annotate.position
                );
            }
            if (instance.readOnly === true) {
                annInst.setReadOnly(true);
            }
        }
    }

    function loadHighResAnnotation(carouselInstance) {
        var isHiResImageAnnNeeded = Features.isFeatureEnabled('Editor.HighResImage.Annotation'),
            highResImageBoxSize = Config.get('highResImageAnnotateBoxSize'),
            imageNode = carouselInstance.carouselImage,
            imageId = imageNode.dataset.id,
            annotateInst, annotates;

        if (isHiResImageAnnNeeded === false) {
            return;
        }
        annotateInst = new Annotate(
            imageNode, this.doc, this.win,
            this.eventBus, this.locale
        );
        annotateInst.setAnnoationType('highResImage');
        annotateInst.setRectHeightAndWidth(
            highResImageBoxSize.height, highResImageBoxSize.width
        );
        annotateInst.renderComponentStyle();
        annotateInst.render();
        if (this.readOnly === true) {
            annotateInst.setReadOnly(true);
        }
        annotates = this.annotationBag.getAnnotationsForImage(imageId);
        highResAnnotateInst.push(annotateInst);
        if (Helper.isObject(annotates) === false) {
            return;
        }
        applyExistingAnnotations(this, annotateInst, annotates, imageId, true);
    }

    function destroyHighResAnnotation() {
        this.highResAnnotateInst = [];
    }

    function deleteImageAnnotation(imageNode) {
        var annotation, annotations, len, annotationId, data, image, imageId,
            annotatePlugin,
            i = 0;

        imageId = imageNode.dataset.id;
        this.destroyAnnotate(imageId);
        annotations = this.annotationBag.getAnnotationsForImage(imageId);
        len = annotations.length;
        for (;i < len; i += 1) {
            annotation = annotations[i];
            annotationId = annotation.annotationId;
            data = {
                'x': annotation.position.left,
                'y': annotation.position.top,
                'width': annotation.position.width,
                'height': annotation.position.height,
                'id': annotation.boxId,
                'text': annotation.text
            };
            annotatePlugin = new AnnotationPersistor(
                this.endPoint, this.eventBus, this.annotationBag
            );
            annotatePlugin.deleteAnnotate(
                imageNode, data, this.token, annotationId
            );
        }
    }

    function renderAnnotator(imageNode) {
        var isHiResImageAnnNeeded = Features.isFeatureEnabled('Editor.HighResImage.Annotation'),
            imageBoxSize = Config.get('imageAnnotateBoxSize'),
            imageId = imageNode.dataset.id,
            anntateInst;

        if(isHiResImageAnnNeeded === true) {
            return;
        }
        anntateInst = new Annotate(
            imageNode, this.doc, this.win,
            this.eventBus, this.locale
        );
        anntateInst.setAnnoationType('image');
        anntateInst.setRectHeightAndWidth(
            imageBoxSize.height, imageBoxSize.width
        );
        anntateInst.setAnnoationId(imageId);
        annotationMap[imageId] = anntateInst;
        anntateInst.renderComponentStyle();
        anntateInst.render();
    }

    function AnnotatorInit(
        Win, Doc, EventBus, EndPoint, Token, AnnotationBag, imageAnnotation
    ) {
        this.win = Win;
        this.doc = Doc;
        this.eventBus = EventBus;
        this.endPoint = EndPoint;
        this.token = Token;
        this.annotationBag = AnnotationBag;
        this.locale = Config.getLocale();
        this.readOnly = false;
        this.annotatorInstances = [];
        this.imageAnnotationSelector = Util.selectorToArray(imageAnnotation);
        this.eventBus.subscribe(
            'Ann:onBoxCreated', removeUnsavedAnnotation, this
        );
        this.eventBus.subscribe(
            'CarouselViewer:loaded', loadHighResAnnotation, this
        );
        this.eventBus.subscribe(
            'CarouselViewer:close', destroyHighResAnnotation, this
        );
        this.eventBus.subscribe(
            'Delete:AnnotationForImage', deleteImageAnnotation, this
        );
        this.eventBus.subscribe(
            'Render:Annotator', renderAnnotator, this
        );
    }

    function isInlineImage(node, instance) {
        var doc = instance.doc,
            id = node.dataset.id,
            inlineFigureWrapper = doc.querySelector(
                inlineFigureSelector + ' .wrapper[name="' + id + '"]'
            ),
            inlineEquationWrapper = doc.querySelector(
                inlineEquationSelector + ' .wrapper[name="' + id + '"]'
            );

        if (Helper.isNull(inlineFigureWrapper) === false ||
            Helper.isNull(inlineEquationWrapper) === false) {
            return true;
        }
        return false;
    }

    function annotateImage(imageNode, annotateMetaData, instance) {
        var annInst, imageId, annotates,
            imageBoxSize = Config.get('imageAnnotateBoxSize'),
            inlineImageBoxSize = Config.get('inlineImageAnnotateBoxSize');

        annInst = new Annotate(
            imageNode, instance.doc, instance.win, instance.eventBus,
            instance.locale
        );
        annInst.setAnnoationType('image');
        if (isInlineImage(imageNode, instance) === true) {
            annInst.setRectHeightAndWidth(
                inlineImageBoxSize.height, inlineImageBoxSize.width
            );
        }
        else {
            annInst.setRectHeightAndWidth(
                imageBoxSize.height, imageBoxSize.width
            );
        }

        imageId = imageNode.dataset.id;
        annInst.setAnnoationId(imageId);
        annotationMap[imageId] = annInst;
        imageNodes.push(imageNode.dataset.id);
        annInst.renderComponentStyle();
        annInst.render();
        if (instance.readOnly === true) {
            annInst.setReadOnly(true);
        }
        annotates = annotateMetaData[imageNode.dataset.id];
        annotateInst.push(annInst);
        if (Helper.isObject(annotates) === false) {
            return;
        }
        applyExistingAnnotations(instance, annInst, annotates, imageId, false);
    }

    function readOnlyAnnotateImage(imageNode, readonly) {
        var imageId, j = 0, anninstlen = annotateInst.length;

        imageId = imageNode.dataset.id;
        for (; j < anninstlen; j += 1) {
            annotateInst[j].setAnnoationId(imageId);
            annotationMap[imageId] = annotateInst[j];
            annotateInst[j].setReadOnly(readonly);
        }
    }

    AnnotatorInit.prototype.isReadOnly = function isReadOnly(readOnly) {
        this.readOnly = readOnly;
    };

    AnnotatorInit.prototype.renderAnnotatorOverImages = function renderAnnotatorOverImages(
        container, annotateMetaData, replaceImageMetaData
    ) {
        var imgs, i, imgLen, imageId,
            j = 0,
            imageAnnotationSelector = this.imageAnnotationSelector,
            length = imageAnnotationSelector.length,
            annotateClass = [];

        for (; j < length; j += 1) {
            annotateClass.push(imageAnnotationSelector[j] + ' img');
        }
        imgs = container.querySelectorAll(annotateClass.join(','));
        imgLen = imgs.length;
        if (imgLen === 0) {
            return;
        }
        for (i = 0; i < imgLen; i += 1) {
            imageId = imgs[i].dataset.id;
            if (Helper.isUndefined(replaceImageMetaData) === true ||
                replaceImageMetaData.hasOwnProperty(imageId) === false) {
                annotateImage(imgs[i], annotateMetaData, this);
            }
        }
    };

    AnnotatorInit.prototype.readOnlyAnnotatorImages = function readonlyAnnotatorImages(
        container, readonly
    ) {
        var imgs, i, imgLen,
            j = 0,
            imageAnnotationSelector = this.imageAnnotationSelector,
            length = imageAnnotationSelector.length,
            annotateClass = [];

        for (; j < length; j += 1) {
            annotateClass.push(imageAnnotationSelector[j] + ' img');
        }
        imgs = container.querySelectorAll(annotateClass.join(','));
        imgLen = imgs.length;
        if (imgLen === 0) {
            return;
        }
        for (i = 0; i < imgLen; i += 1) {
            readOnlyAnnotateImage(imgs[i], readonly);
        }
    };

    AnnotatorInit.prototype.attachAnnotateSave = function attachAnnotateSave() {
        var annotatePlugin = new AnnotationPersistor(
            this.endPoint, this.eventBus, this.annotationBag
        ),
            eb = this.eventBus,
            instance = this,
            token = this.token;

        eb.subscribe('Ann:onRemove', function onRemove(
            data, imageObj, annotateObj
        ) {
            var annotateId,
                imageId = imageObj.dataset.id,
                annotation = instance.annotationBag.getAnnotationForImageBoxId(
                    imageId, data.id
                );

            if (Helper.isUndefined(imageId) === true ||
                Helper.isEmptyString(data.text) === true ||
                annotateObj.type === 'math' ||
                annotation === null
            ) {
                return;
            }
            annotateId = annotation.annotationId;
            annotatePlugin.deleteAnnotate(
                imageObj, data, token, annotateId
            );
        });
        eb.subscribe('Ann:onAnnotate', function onAnnotate(
            data, imageObj, annotateObj
        ) {
            var annotateId,
                imageId = imageObj.dataset.id,
                annotation = instance.annotationBag.getAnnotationForImageBoxId(
                    imageId, data.id
                );

            if (Helper.isUndefined(imageId) === true ||
                Helper.isEmptyString(data.text) === true ||
                annotateObj.type === 'math'
            ) {
                return;
            }
            if (annotation === null) {
                annotatePlugin.createAnnotate(imageObj, data, token);
            }
            else {
                annotateId = annotation.annotationId;
                annotatePlugin.updateAnnotate(
                    imageObj, data, token, annotateId
                );
            }
        });

        // Overflow fix for overlapping box
        eb.subscribe('Ann:commentOpen', function commentOpen(img) {
            var figBox = document.querySelector('.wrapper#' + img.dataset.id);

            if (
                figBox !== null &&
                figBox.parentNode !== null &&
                figBox.parentNode.classList.contains('figure') === true
            ) {
                figBox.parentNode.style['overflow-x'] = 'visible';
                figBox.parentNode.style['overflow-y'] = 'visible';
                eb.publish('selection:reset');
            }
        });
        eb.subscribe('Ann:commentClosed', function commentClosed(img) {
            var figBox = document.querySelector('.wrapper#' + img.dataset.id);

            if (
                figBox !== null &&
                figBox.parentNode !== null &&
                figBox.parentNode.classList.contains('figure') === true
            ) {
                figBox.parentNode.style['overflow-x'] = 'visible';
                figBox.parentNode.style['overflow-y'] = 'auto';
            }
        });
    };

    AnnotatorInit.prototype.destroyAnnotate = function destroyAnnotate(imageId) {
        annotateInst = annotationMap[imageId];
        if (Helper.isUndefined(annotateInst) === false) {
            annotateInst.destroy();
        }
    };

    return AnnotatorInit;
});

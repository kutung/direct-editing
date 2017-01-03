define([
    'scripts/Helper', 'scripts/EventBus'
],
function annotationBagLoader(Helper, EventBus) {
    var annotationBag = [];

    function removeBag(annotationId) {
        var key;

        if (Helper.isEmptyString(annotationId) === true) {
            throw new Error('annotation_bag.empty_annotation_name');
        }
        for (key in annotationBag) {
            if (annotationBag.hasOwnProperty(key) === true &&
                annotationBag[key].annotationId === annotationId
            ) {
                delete annotationBag[key];
                annotationBag.splice(key, 1);
                EventBus.publish('AnnotationBag:Update');
                return true;
            }
        }
        return false;
    }

    function getFromBag(annotationId) {
        var key;

        for (key in annotationBag) {
            if (annotationBag[key].annotationId === annotationId) {
                return annotationBag[key];
            }
        }
        return null;
    }

    function AnnotationBag(Win, Doc) {
        this.win = Win;
        this.doc = Doc;
        EventBus.subscribe('AnnotationBag:add', this.addBag, this);
        EventBus.subscribe('AnnotationBag:update', this.updateBag, this);
        EventBus.subscribe('AnnotationBag:delete', this.remove, this);
    }

    AnnotationBag.prototype.getAll = function getAll() {
        return annotationBag;
    };

    AnnotationBag.prototype.addBag = function addBag(
        annotationId, imageId, boxId, type, text, position
    ) {
        var temp = {};

        temp.annotationId = annotationId;
        temp.imageId = imageId;
        temp.boxId = boxId;
        temp.type = type;
        temp.text = text;
        temp.position = position;
        annotationBag.push(temp);
        EventBus.publish('AnnotationBag:Update');
    };

    AnnotationBag.prototype.updateBag = function updateBag(
        annotationId, imageId, boxId, type, text, position
    ) {
        removeBag(annotationId);
        this.addBag(annotationId, imageId, boxId, type, text, position);
        EventBus.publish('AnnotationBag:Update');
    };

    AnnotationBag.prototype.remove = function remove(annotationId) {
        return removeBag(annotationId);
    };

    AnnotationBag.prototype.removeBagForImageBoxId = function removeBagForImageBoxId(
        imageId, boxId
    ) {
        var annotation = this.getAnnotationForImageBoxId(imageId, boxId);

        if (annotation !== null) {
            return removeBag(annotation.annotationId);
        }
        return false;
    };

    AnnotationBag.prototype.get = function get(annotationId) {
        return getFromBag(annotationId);
    };

    AnnotationBag.prototype.getAnnotationForImageBoxId = function getAnnotationForImageBoxId(
        imageId, boxId
    ) {
        var key;

        for (key in annotationBag) {
            if (annotationBag[key].imageId === imageId &&
                annotationBag[key].boxId === boxId) {
                return annotationBag[key];
            }
        }
        return null;
    };

    AnnotationBag.prototype.getAnnotationsForImage = function getAnnotationsFromImage(
        imageId
    ) {
        var key,
            annotations = [];

        for (key in annotationBag) {
            if (annotationBag[key].imageId === imageId) {
                annotations.push(annotationBag[key]);
            }
        }
        return annotations;
    };

    return AnnotationBag;
});

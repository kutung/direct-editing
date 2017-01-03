define(['scripts/Helper', 'scripts/RequestBuilder', 'scripts/Util',
    'customer/Config'],
    function annotationPersistorLoader(Helper, RequestBuilder, Util,
        customerConfig
    ) {
        var eqSearchThreshold = 5,
            imageAnnotation = customerConfig.get('enableAnnotationFor'),
            imageAnnotationClass = Util.selectorToClassArray(imageAnnotation),
            equationClass = Util.selectorToClass('equation');

        function AnnotationPersistor(annotateEndPoint, eventBus, AnnotationBag) {
            this.annotateSaveEndPoint = annotateEndPoint.save;
            this.annotateRemoveEndPoint = annotateEndPoint.remove;
            this.requestBuilder = new RequestBuilder();
            this.annotationBag = AnnotationBag;
            this.eventBus = eventBus;
            this.annotation = null;
        }

        function containAnnotationClass(node) {
            var nodeClass = node.classList,
                len = imageAnnotationClass.length,
                i = 0;

            for (; i < len; i += 1) {
                if (nodeClass.contains(imageAnnotationClass[i]) === true) {
                    return true;
                }
            }
            return false;
        }

        function checkEquationNode(imageNode) {
            var traverseCount = 0,
                parent = imageNode.parentNode;

            while (containAnnotationClass(parent) === false) {
                if (traverseCount === eqSearchThreshold) {
                    break;
                }
                parent = parent.parentNode;
                traverseCount += 1;
            }
            if (parent.classList.contains(equationClass) === true) {
                return true;
            }
            return false;
        }

        function massageDataForSave(data) {
            var saveData = {};

            if (Helper.isUndefined(data.annotationId) === true) {
                saveData.annotationId = Helper.getUniqueId('opt');
            }
            else {
                saveData.annotationId = data.annotationId;
            }
            saveData.position = {};
            saveData.position.left = data.x;
            saveData.position.top = data.y;
            saveData.position.width = data.width;
            saveData.position.height = data.height;
            saveData.text = data.text;
            return saveData;
        }

        function makeRequest(saveData, Url, callBacks, instance) {
            var request, rB = instance.requestBuilder,
                formData = new FormData();

            formData.append('json', JSON.stringify(saveData));
            rB.setUrl(Url);
            rB.setMethod('POST');
            rB.setData(formData);
            rB.setSuccessCallback(callBacks.success);
            rB.setFailureCallback(callBacks.failure);
            rB.setTimeoutCallback(callBacks.timeOut);
            request = rB.build();
            request.send();
        }

        AnnotationPersistor.prototype.updateAnnotate = function updateAnnotate(
            imageNode, data, articleToken, annotateId) {
            var saveData = {},
                instance = this,
                annotateDetail, imageId, callBacks;

            imageId = imageNode.dataset.id;
            data.annotationId = annotateId;
            annotateDetail = massageDataForSave(data);
            annotateDetail.type = 'image';
            if (checkEquationNode(imageNode) === true) {
                annotateDetail.type = 'math';
            }
            annotateDetail.boxId = data.id;
            annotateDetail.imageId = imageId;
            saveData.annotations = [];
            saveData.annotations.push(annotateDetail);
            saveData.optToken = articleToken;
            callBacks = {
                'success': function success() {
                    instance.annotationBag.updateBag(
                        annotateDetail.annotationId, annotateDetail.imageId,
                        annotateDetail.boxId, annotateDetail.type,
                        annotateDetail.text, annotateDetail.position
                    );
                    instance.eventBus.publish('Annotation:onComplete',
                        annotateDetail
                    );
                },
                'failure': function failure() {
                    throw new Error('annotate.update.failure');
                },
                'timeOut': function timeOut() {
                    throw new Error('annotate.update.timeout');
                }
            };
            makeRequest(saveData, this.annotateSaveEndPoint, callBacks, this);
        };

        AnnotationPersistor.prototype.deleteAnnotate = function deleteAnnotate(
            imageNode, data, articleToken, annotateId) {
            var saveData = {},
                instance = this,
                annotateDetail, imageId, callBacks;

            imageId = imageNode.dataset.id;
            data.annotationId = annotateId;
            annotateDetail = massageDataForSave(data);
            annotateDetail.type = 'image';
            if (checkEquationNode(imageNode) === true) {
                annotateDetail.type = 'math';
            }
            annotateDetail.imageId = imageId;
            annotateDetail.boxId = data.id;
            saveData.annotations = [];
            saveData.annotations.push(annotateDetail);
            saveData.optToken = articleToken;
            callBacks = {
                'success': function success() {
                    if (annotateDetail === null ||
                        Helper.isUndefined(annotateDetail.imageId) === true ||
                        Helper.isUndefined(annotateDetail.boxId) === true
                    ) {
                        return;
                    }
                    instance.annotationBag.removeBagForImageBoxId(
                        annotateDetail.imageId, annotateDetail.boxId
                    );
                    instance.eventBus.publish('Annotation:onDelete',
                        annotateDetail
                    );
                },
                'failure': function failure() {
                    throw new Error('annotate.delete.failure');
                },
                'timeOut': function timeOut() {
                    throw new Error('annotate.delete.timeout');
                }
            };
            makeRequest(saveData, this.annotateRemoveEndPoint, callBacks, this);
        };

        AnnotationPersistor.prototype.createAnnotate = function createAnnotate(
            imageNode, data, articleToken
        ) {
            var saveData = {},
                instance = this,
                annotateDetail, imageId, callBacks;

            imageId = imageNode.dataset.id;
            annotateDetail = massageDataForSave(data);
            annotateDetail.type = 'image';
            if (checkEquationNode(imageNode) === true) {
                annotateDetail.type = 'math';
            }
            annotateDetail.imageId = imageId;
            annotateDetail.boxId = data.id;
            saveData.annotations = [];
            saveData.annotations.push(annotateDetail);
            saveData.optToken = articleToken;
            callBacks = {
                'success': function success() {
                    if (annotateDetail === null ||
                        Helper.isUndefined(annotateDetail.imageId) === true ||
                        Helper.isUndefined(annotateDetail.boxId) === true ||
                        Helper.isUndefined(annotateDetail.annotationId) === true
                    ) {
                        return;
                    }
                    instance.annotationBag.addBag(
                        annotateDetail.annotationId, annotateDetail.imageId,
                        annotateDetail.boxId, annotateDetail.type,
                        annotateDetail.text, annotateDetail.position
                    );
                    instance.eventBus.publish('Annotation:onCreate',
                        annotateDetail
                    );
                },
                'failure': function failure() {
                    throw new Error('annotate.create.failure');
                },
                'timeOut': function timeOut() {
                    throw new Error('annotate.create.timeout');
                }
            };

            makeRequest(saveData, this.annotateSaveEndPoint, callBacks, this);
        };

        return AnnotationPersistor;
    });


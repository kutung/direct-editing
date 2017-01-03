define(['scripts/ConfigReader', 'scripts/Helper', 'scripts/RequestBuilder',
    'scripts/Util'],
function mathCommandLoader(Config, Helper, RequestBuilder, Util) {
    var equationSelector = Util.getSelector('equation');

    function initializeVariables(instance) {
        instance.eventBus = null;
        instance.win = null;
        instance.doc = null;
        instance.articleToken = null;
        instance.requestBuilder = null;
        instance.conversionEndPoint = null;
        this.annotateSavePoint = null;
        this.annotateRemovePoint = null;
        this.annotationBag = null;
        this.equationEditor = null;
    }

    function makeRequest(instance, saveData, Url, callBacks) {
        var request, rB = instance.requestBuilder,
            formData = new FormData(),
            data = {},
            token = instance.articleToken;

        data.annotations = saveData;
        data.optToken = token;
        formData.append('json', JSON.stringify(data));
        rB.setUrl(Url);
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(callBacks.success);
        rB.setFailureCallback(callBacks.failure);
        rB.setTimeoutCallback(callBacks.timeOut);
        request = rB.build();
        request.send();
    }

    function backUpVersion(mathFragment, mathml) {
        var backUpNode;

        backUpNode = mathFragment.querySelector(
            '.equation_data_container span[version="1"] .mathml'
        );

        backUpNode.innerHTML = mathml;
    }

    function toggleEqnChangedProp(mathFragment, version) {
        var imageNode = mathFragment.querySelector(equationSelector + ' img');

        if (version > 1) {
            imageNode.classList.add('eqnChanged');
            return;
        }
        imageNode.classList.remove('eqnChanged');
    }

    function toggleAnnChangedProp(mathFragment, annotationData) {
        var imageNode = mathFragment.querySelector(equationSelector + ' img');

        if (annotationData.length > 0) {
            imageNode.classList.add('eqnChanged');
            return;
        }
        imageNode.classList.remove('eqnChanged');
    }

    function createProofElement(instance) {
        var proofImageNode,
            doc = instance.doc;

        proofImageNode = doc.createElement('span');
        proofImageNode.classList.add('image-proof');

        return proofImageNode;
    }

    function mathFailure(res, data) {
        console.log('failure math ', res, data);
    }

    function mathTimeout() {
        console.log('timeout math');
    }

    function getImageForVersion(fragment, version) {
        return fragment.querySelector(
            'span[version="' + version + '"] .image'
        ).innerHTML;
    }

    function getVersionNode(fragment, version) {
        return fragment.querySelector(
            'span[version="' + version + '"]'
        );
    }

    function getCurrentVersion(fragment) {
        var version = parseInt(
            fragment.querySelector('.current_version').innerHTML, 10
        );

        if (version === 0) {
            return 1; // Version 1 is used as back up node.
            // TODO: version 1 backup pending
        }

        return version;
    }

    function createNewVersionNode(newVersion, instance) {
        var mathmlNode, imageNode, versionNode,
            doc = instance.doc;

        //TODO: Create a template for this
        mathmlNode = doc.createElement('span');
        mathmlNode.classList.add('mathml');
        imageNode = doc.createElement('span');
        imageNode.classList.add('image');
        versionNode = doc.createElement('span');
        versionNode.setAttribute('version', newVersion);
        versionNode.dataset.latex = false;
        versionNode.appendChild(mathmlNode);
        versionNode.appendChild(imageNode);
        return versionNode;
    }

    function processEquationProofMath(
        instance, version, formData, referenceName, imagePath
    ) {
        var proofImageNode, parsedResponse, proofImagePath, request,
            rB = instance.requestBuilder,
            eB = instance.eventBus;

        proofImageNode = createProofElement(instance);
        rB.setUrl(instance.conversionProofEndPoint);
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(function SuccessCallback(response) {
            parsedResponse = JSON.parse(response);
            proofImagePath = parsedResponse.data.proofImageUrl;
            proofImageNode.innerHTML = proofImagePath;
            eB.publish(
                'Math:Equation:Proof:OnComplete', referenceName, version,
                proofImageNode
            );
        });
        rB.setFailureCallback(function FailureCallback() {
            proofImageNode.innerHTML = imagePath;
            eB.publish(
                'Math:Equation:Proof:OnComplete', referenceName, version,
                proofImageNode
            );
        });
        rB.setTimeoutCallback(function TimeoutCallback() {
            proofImageNode.innerHTML = imagePath;
            eB.publish(
                'Math:Equation:Proof:OnComplete', referenceName, version,
                proofImageNode
            );
        });
        request = rB.build();
        request.send();
    }

    function processEquationMath(
        mathFragment, mathReferenceName, updatedNode, originalMath, proofEnabled
        ) {
        var currentVersion = 0, newVersionNode, eqnContainer, newVersion,
            versionNode, request, mathmlNode, imagePath, imageNode,
            parsedResponse,
            instance = this,
            formData = new FormData(),
            eB = this.eventBus,
            rB = instance.requestBuilder;

        newVersion = updatedNode.newVersion;
        mathmlNode = updatedNode.mathml;
        if (updatedNode.hasOwnProperty('backupMathml') === true) {
            backUpVersion(mathFragment, updatedNode.backupMathml);
        }
        toggleEqnChangedProp(mathFragment, newVersion);
        versionNode = getVersionNode(mathFragment, newVersion);
        if (versionNode === null) {
            newVersionNode = createNewVersionNode(newVersion, instance);
            newVersionNode.querySelector('.mathml').innerHTML = mathmlNode;
            formData.append('json', JSON.stringify({
                'mathML': originalMath,
                'optToken': instance.articleToken
            }));
            console.log('making image conversion ', this.conversionEndPoint);
            rB.setUrl(this.conversionEndPoint);
            rB.setMethod('POST');
            rB.setData(formData);
            rB.setSuccessCallback(function SuccessCallback(response) {
                parsedResponse = JSON.parse(response);
                imagePath = parsedResponse.data.imageUrl;
                newVersionNode.querySelector('.image').innerHTML = imagePath;
                imageNode = mathFragment.querySelector(equationSelector + ' img');
                imageNode.setAttribute('src', imagePath);
                eqnContainer = mathFragment.querySelector('.equation_data_container');
                eqnContainer.querySelector('.current_version').innerHTML = newVersion;
                eqnContainer.appendChild(newVersionNode);
                eB.publish('Math:Equation:OnComplete', mathReferenceName, mathFragment, imagePath);
                if (proofEnabled === true) {
                    processEquationProofMath(
                        instance, newVersion, formData, mathReferenceName, imagePath
                    );
                }
                instance.processMathmlLatexOption(newVersion, mathReferenceName);
            });
            rB.setFailureCallback(mathFailure.bind(this));
            rB.setTimeoutCallback(mathTimeout.bind(this));
            request = rB.build();
            request.send();
            return;
        }
        imagePath = getImageForVersion(mathFragment, newVersion);
        imageNode = mathFragment.querySelector(equationSelector + ' img');
        imageNode.setAttribute('src', imagePath);
        mathFragment.querySelector('.current_version').innerHTML = newVersion;
        eB.publish('Math:Equation:OnComplete', mathReferenceName, mathFragment, imagePath);
    }

    function processAnnotateMath(
        annoatationSaveData, annotationRemoveData, mathFragment,
        mathReferenceName, version
    ) {
        var i, callBacks, data,
            eB = this.eventBus,
            eqnContainer = mathFragment.querySelector(equationSelector),
            instance = this,
            annotation = {},
            saveLength = annoatationSaveData.length,
            removeLength = annotationRemoveData.length;

        if (eqnContainer === null) {
            return;
        }

        if (saveLength > 0) {
            callBacks = {
                'success': function success() {
                    for (i = 0; i < saveLength; i += 1) {
                        data = annoatationSaveData[i];
                        annotation = instance.annotationBag.get(
                            data.annotationId
                        );
                        if (Helper.isNull(annotation) === true) {
                            instance.annotationBag.addBag(
                                data.annotationId, data.imageId, data.boxId,
                                data.type, data.text, data.position
                            );
                        }
                        else {
                            instance.annotationBag.updateBag(
                                data.annotationId, data.imageId, data.boxId,
                                data.type, data.text, data.position
                            );
                        }
                    }
                    eB.publish('Math:Annotate:OnComplete', mathReferenceName, annoatationSaveData);
                },
                'failure': function failure() {
                    throw new Error('math.annotate.update.failure');
                },
                'timeOut': function timeOut() {
                    throw new Error('math.annotate.update.timeout');
                }
            };
            makeRequest(
                this, annoatationSaveData, this.annotateSavePoint, callBacks
            );
        }

        if (removeLength > 0) {
            callBacks = {
                'success': function success() {
                    for (i = 0; i < removeLength; i += 1) {
                        data = annotationRemoveData[i];
                        instance.annotationBag.remove(data.annotationId);
                    }
                    eB.publish('Math:Annotate:OnComplete', mathReferenceName, annotationRemoveData);
                },
                'failure': function failure() {
                    throw new Error('math.annotate.update.failure');
                },
                'timeOut': function timeOut() {
                    throw new Error('math.annotate.update.timeout');
                }
            };
            makeRequest(
                this, annotationRemoveData, this.annotateRemovePoint, callBacks
            );
        }
    }

    function mathCommand(
        EventBus, Document, Window, ArticleToken, equationEditor, ConversionEndPoint,
        CoversionAnnotatePoint, annotationBag
    ) {
        initializeVariables(this);
        this.eventBus = EventBus;
        this.win = Window;
        this.doc = Document;
        this.articleToken = ArticleToken;
        this.equationEditor = equationEditor;
        this.conversionEndPoint = ConversionEndPoint;
        this.conversionProofEndPoint = Config.getRoute('conversionProofEndPoint');
        this.annotateSavePoint = CoversionAnnotatePoint;
        this.annotateRemovePoint = Config.getRoute('imageRemoveEndPoint');
        this.annotationBag = annotationBag;
        this.requestBuilder = new RequestBuilder();
        EventBus.subscribe('Math:Equation:OnSave', processEquationMath.bind(this));
        EventBus.subscribe('Math:Annotate:OnSave', processAnnotateMath.bind(this));
        EventBus.subscribe('Math:Equation:Latex:onLoad', this.processMathmlLatexOption.bind(this));
    }

    mathCommand.prototype.processMathmlLatexOption = function processMathmlLatexOption(
        newVersion, mathReferenceName
    ) {
        var instance = this, currentMath, url, request,
            rB = new RequestBuilder(),
            eB = instance.eventBus;

        currentMath = instance.equationEditor.getMath();
        url = instance.equationEditor.getLatexConversionRequestURL(currentMath);
        url+= '?mml=' + encodeURIComponent(currentMath)+'&saveLatex';
        rB.setUrl(url);
        rB.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        rB.setData('mml=' + encodeURIComponent(currentMath));
        rB.setMethod('POST');
        rB.setSuccessCallback(function successCallback() {
            eB.publish('Math:Equation:Latex:OnComplete', mathReferenceName, newVersion);
            eB.publish('Math:Equation:Latex:onCheck:Success', newVersion);
        });
        rB.setFailureCallback(function failureCallback() {
            eB.publish('Math:Equation:Latex:OnFailure', mathReferenceName, newVersion);
            eB.publish('Math:Equation:Latex:onCheck:Failure', newVersion);
        });
        rB.setTimeoutCallback(function timeoutCallback() {
            eB.publish('Math:Equation:Latex:OnFailure', mathReferenceName, newVersion);
            eB.publish('Math:Equation:Latex:onCheck:Failure', newVersion);
        });
        request = rB.build();
        request.send();
    };

    return mathCommand;
});

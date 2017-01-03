define(['scripts/ConfigReader', 'scripts/RequestBuilder', 'scripts/Helper',
    'scripts/Util', 'he'],
function MathEditorLoader(Config, RequestBuilder, Helper, Util, He) {
    var mathTemplate = [
            '<div class="matheditor">',
			'<div class="math-btn">',
                    '<a class="math-button-undo" ',
                        'title="Undo" href="javascript:void(0);">Undo</a>',
                    '<a class="math-button-redo" ',
                        'title="Redo" href="javascript:void(0);">Redo</a>',
						 '<a class="close-button eqnClose"></a>',
						'</div>',
						'<div class="proof-dialog-cnt">',
			'<div class="matheditor-options">',
                    '<input type="radio" class="math-conversion" name="conversion" value="Math" checked="true"/> Math',
                    '<input type="radio" class="latex-conversion" name="conversion" value="Latex" /> Latex',
                '</div>',
                
                '<div class="equation"></div>',
                '<div class="latex">',
                    '<textarea class="latex-editor"></textarea>',
                '</div>',
                
                
				'<p class="info"><strong>Note:</strong> If your math does not load properly in the window below, or if you find this editor inadequate, please <a href="javascript:void(0)" class="math-annotation">click here</a> to leave comments/instructions on your equation.</p>',
				
				'</div>',
				'<div class="math-btn save-cancel-btn-group">',
                    '<a class="cancel eqnCancel" title="cancel">Cancel</a>',
                    '<a class="save" title="Save">Save</a>',
					
					
                '</div>',
            '</div>'
        ],
        annotationTemplate = [
            '<div class="annotationeditor">',
                '<div class="annotation"></div>',
                '<div class="math-btn">',
                    '<hr/>',
                    '<p>Please select equation region to provide instructions.</p>',
                    '<a class="save-annotate" title="Save">Save</a>',
                '</div>',
            '</div>'
        ],
        equationSelector = Util.getSelector('equation');

    function initializeVariables(instance) {
        instance.eventBus = null;
        instance.isLatex = false;
        instance.equationEditor = null;
        instance.requestBuilder = null;
        instance.doc = null;
        instance.container = null;
        instance.mathFragment = null;
        instance.mathReferenceName = null;
        instance.saveBtn = null;
        instance.saveFn = null;
        instance.versions = {};
        instance.backupMathml = null;
        instance.currentVersion = null;
        instance.annotationsCreate = {};
        instance.annotationsRemove = {};
        instance.needBackUpNode = false;
        instance.annotationChanged = false;
        instance.proofEnabled = false;
        instance.hasMathAnnotation = false;
    }

    function isNewAnnotation(instance, imageId, id) {
        var annotation = instance.annotationBag.getAnnotationForImageBoxId(
                    imageId, id
        );

        if (Helper.isNull(annotation) === true) {
            return true;
        }
        return false;
    }

    function mathAnnotationCreate(data, imageObj, annotateObj) {
        var imageId;

        this.annotationChanged = true;
        if (Helper.isEmptyString(data.text) === true) {
            return;
        }
        imageId = imageObj.dataset.id;
        data.imageId = imageId;
        this.annotationsCreate[data.id] = data;
    }

    function mathAnnotationRemove(data, imageObj, annotateObj) {
        var imageId;

        this.annotationChanged = true;
        if (Helper.isEmptyString(data.text) === true) {
            return;
        }
        imageId = imageObj.dataset.id;
        data.imageId = imageId;
        if (Helper.isObject(this.annotationsCreate[data.id]) === true) {
            delete this.annotationsCreate[data.id];
        }
        if (isNewAnnotation(this, imageId, data.id) === false) {
            this.annotationsRemove[data.id] = data;
        }
    }

    function enableAndDisableLatexOption(instance) {
        var currentversion = instance.currentVersion,
            mathMLVersions = instance.versions,
            currentMathmlLatexFlag;

        currentMathmlLatexFlag = mathMLVersions[currentversion].latexEnable;
        if (Helper.isUndefined(currentMathmlLatexFlag) === true ||
            Helper.isNull(currentMathmlLatexFlag) === true ||
            currentMathmlLatexFlag === ''
        ) {
            instance.latexConversionBtn.disabled = false;
            instance.eventBus.publish('Math:Equation:Latex:onLoad',
                currentversion, instance.mathReferenceName
            );
        }
        else if(currentMathmlLatexFlag === 'off') {
            instance.latexConversionBtn.disabled = true;
        }
        else {
            instance.latexConversionBtn.disabled = false;
        }
    }

    function setMathMLLatexCheckOnSuccess(version) {
        var mathMLVersions = this.versions;

        if (Helper.isUndefined(mathMLVersions[version]) === true) {
            return;
        }
        mathMLVersions[version].latexEnable = 'on';
        enableAndDisableLatexOption(this);
    }

    function setMathMLLatexCheckOnFailure(version) {
        var mathMLVersions = this.versions;

        if (Helper.isUndefined(mathMLVersions[version]) === true) {
            return;
        }
        mathMLVersions[version].latexEnable = 'off';
        enableAndDisableLatexOption(this);
    }
    function closeDialog(){
        $(".eqnClose,.eqnCancel").off("click").on("click",function(){
            $(this).parents(".eqnDialog").hide();
            $(".overlay").hide();
        });
    }
    //FIXME: Remove requestBuilder from args
    function mathEditor(
        container, eventBus, equationEditor, doc, win, Annotate, AnnotatorBag,
        hasMathAnnotation
    ) {
        initializeVariables(this);
        this.container = container;
        this.eventBus = eventBus;
        this.equationEditor = equationEditor;
        this.doc = doc;
        this.win = win;
        this.annotate = Annotate;
        this.annotationBag = AnnotatorBag;
        this.locale = Config.getLocale();
        this.hasMathAnnotation = hasMathAnnotation;
        this.eventBus.subscribe('Ann:onAnnotate', mathAnnotationCreate.bind(this));
        this.eventBus.subscribe('Ann:onRemove', mathAnnotationRemove.bind(this));
        this.eventBus.subscribe('Math:destroy', this.destroy, this);
        this.eventBus.subscribe(
           'Math:Equation:Latex:onCheck:Success', setMathMLLatexCheckOnSuccess.bind(this)
        );
        this.eventBus.subscribe(
           'Math:Equation:Latex:onCheck:Failure', setMathMLLatexCheckOnFailure.bind(this)
        );
    }

    function resetVariables(instance) {
        instance.annotationChanged = false;
        instance.isLatex = false;
        instance.versions = {};
        instance.backupMathml = null;
        instance.currentVersion = null;
        instance.needBackUpNode = false;
    }

    function getLatexContainerValue(instance) {
        return instance.container.querySelector('.latex-editor').value;
    }

    function mathmlConversionSuccess(res) {
        var equationContainer, latexEditor,
            latexContainer = this.container.querySelector('.latex');

        latexContainer.style.display = 'block';

        equationContainer = this.container.querySelector('.equation');
        equationContainer.style.display = 'none';

        latexEditor = this.container.querySelector('.latex-editor');
        latexEditor.value = res;
        this.eventBus.publish('Loader:hide');
    }

    function mathmlConversionFailure(res) {
        this.eventBus.publish('Loader:hide');
    }

    function mathmlConversionTimeout(res) {
        this.eventBus.publish('Loader:hide');
    }

    function mathToLatex() {
        var currentMath, url, rB = new RequestBuilder(), request;

        currentMath = this.equationEditor.getMath();
        url = this.equationEditor.getLatexConversionRequestURL(currentMath);

        rB.setUrl(url);
        rB.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        rB.setData('mml=' + encodeURIComponent(currentMath));
        rB.setMethod('POST');
        this.eventBus.publish('Loader:show', 9999);
        rB.setSuccessCallback(mathmlConversionSuccess.bind(this));
        rB.setFailureCallback(mathmlConversionFailure.bind(this));
        rB.setTimeoutCallback(mathmlConversionTimeout.bind(this));
        request = rB.build();
        request.send();
        this.isLatex = true;
    }

    function latexConversionSuccess(mathml) {
        var equationContainer,
            latexContainer = this.container.querySelector('.latex');

        latexContainer.style.display = 'none';

        equationContainer = this.container.querySelector('.equation');
        equationContainer.style.display = 'block';

        this.equationEditor.setMath(mathml);
        this.eventBus.publish('Loader:hide');
    }

    function latexConversionFailure(res) {
        this.eventBus.publish('Loader:hide');
    }

    function latexConversionTimeout(res) {
        this.eventBus.publish('Loader:hide');
    }

    function latexToMath() {
        var currentLatex, url, request,
            rB = new RequestBuilder();

        currentLatex = getLatexContainerValue(this);
        url = this.equationEditor.getMathConversionRequestURL(currentLatex);
        rB.setUrl(url);
        rB.setHeader('Content-type', 'application/x-www-form-urlencoded');
        rB.setData('latex=' + encodeURIComponent(currentLatex));
        rB.setMethod('POST');
        this.eventBus.publish('Loader:show', 9999);
        rB.setSuccessCallback(latexConversionSuccess.bind(this));
        rB.setFailureCallback(latexConversionFailure.bind(this));
        rB.setTimeoutCallback(latexConversionTimeout.bind(this));
        request = rB.build();
        request.send();
        this.isLatex = false;
    }

    function massageDataForSave(instance, data) {
        var annotation,
            saveData = {};

        annotation = instance.annotationBag.getAnnotationForImageBoxId(
                    data.imageId, data.id
        );
        if (Helper.isNull(annotation) === true) {
            saveData.annotationId = Helper.getUniqueId('opt');
        }
        else {
            saveData.annotationId = annotation.annotationId;
        }
        saveData.position = {};
        saveData.position.left = data.x;
        saveData.position.top = data.y;
        saveData.position.width = data.width;
        saveData.position.height = data.height;
        saveData.text = data.text;
        saveData.boxId = data.id;
        saveData.imageId = data.imageId;
        saveData.type = 'math';
        return saveData;
    }

    function saveAnnotation() {
        var key, data,
            annoatationSaveData = [],
            annotationRemoveData = [];

        if (this.annotationChanged === false) {
            this.eventBus.publish('Dialog:Force:OnClose');
            return;
        }

        for (key in this.annotationsCreate) {
            if (this.annotationsCreate.hasOwnProperty(key) === true) {
                data = massageDataForSave(this, this.annotationsCreate[key]);
                annoatationSaveData.push(data);
            }
        }

        for (key in this.annotationsRemove) {
            if (this.annotationsRemove.hasOwnProperty(key) === true) {
                data = massageDataForSave(this, this.annotationsRemove[key]);
                annotationRemoveData.push(data);
            }
        }

        if (annotationRemoveData.length === 0 && annoatationSaveData.length === 0) {
            this.eventBus.publish('Dialog:Force:OnClose');
            return;
        }
        this.eventBus.publish(
            'Math:Annotate:OnSave', annoatationSaveData, annotationRemoveData,
            this.mathFragment, this.mathReferenceName
        );
        this.eventBus.publish('Loader:show', 9999);
        this.annotationsCreate = {};
        this.annotationsRemove = {};
    }

    function cleanMathml(mathml) {
        var currentCleanMathml, parsedMathml,
            tempMathDiv = document.createElement('div');

        tempMathDiv.innerHTML = mathml;
        parsedMathml = tempMathDiv.innerHTML;

        currentCleanMathml = parsedMathml.replace(/^<\?XML.*?\>/i, '');
        currentCleanMathml = currentCleanMathml.replace(/^<math.*?\>/i, '<math>');
        // currentCleanMathml = currentCleanMathml.replace(/name=".*?"/gi, '');
        // currentCleanMathml = currentCleanMathml.replace(/<\/*mrow.*?\>/gi, '');
        // currentCleanMathml = currentCleanMathml.replace(/<\/*mspace\>/gi, '');
        // currentCleanMathml = currentCleanMathml.replace(/(<mspace.*?)\/?>/g, '$1/>');
        // currentCleanMathml = currentCleanMathml.replace(/<mfenced\sopen="<"\sclose=">">/gi, '<mfenced open="&#9001;" close="&#9002;">');
        // currentCleanMathml = currentCleanMathml.replace(/<mfenced\sclose=">"\sopen="<">/gi, '<mfenced close="&#9002;" open="&#9001;">');
        // currentCleanMathml = currentCleanMathml.replace(/<MFENCED\sclose=">"\sopen="<">/gi, '<mfenced open="&#9001;" close="&#9002;">');
        // currentCleanMathml = currentCleanMathml.replace(/<mfenced\sopen="&lt;"\sclose="&#62;">/gi, '<mfenced open="&#9001;" close="&#9002;">');
        return currentCleanMathml;
    }

    function latexConversionAndSaveSuccess(mathmlNode) {
        var mathml,
            newVersionNode = {},
            currentVersion = this.currentVersion,
            versionedMath = cleanMathml(this.versions[currentVersion].mathml);

        mathml = cleanMathml(mathmlNode);
        if (versionedMath === mathml) {
            if (this.actualVersion === this.currentVersion) {
                this.eventBus.publish('Dialog:Force:OnClose');
                return;
            }
        }
        else if (this.actualVersion !== this.currentVersion) {
            currentVersion = this.actualVersion + 1;
        }
        else {
            currentVersion += 1;
        }

        newVersionNode.actualVersion = this.actualVersion;
        newVersionNode.newVersion = this.currentVersion + 1;
        newVersionNode.mathml = mathml;
        this.eventBus.publish(
            'Math:Equation:OnSave', this.mathFragment, this.mathReferenceName,
            newVersionNode, mathmlNode, this.proofEnabled
        );
        this.eventBus.publish('Loader:show', 9999);
    }

    function latexConversionAndSaveFailure(res) {
        this.eventBus.publish('Loader:hide');
    }

    function latexConversionAndSaveTimeout(res) {
        this.eventBus.publish('Loader:hide');
    }

    function convertLatexToMathAndSave(instance) {
        var currentLatex, url, request,
            rB = new RequestBuilder();

        currentLatex = getLatexContainerValue(instance);
        if (currentLatex.trim().length === 0) {
            throw new Error('error.math_editing.math_empty');
        }
        url = instance.equationEditor.getMathConversionRequestURL(currentLatex);
        rB.setUrl(url);
        rB.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        rB.setData('latex=' + encodeURIComponent(currentLatex));
        rB.setMethod('POST');
        instance.eventBus.publish('Loader:show', 9999);
        rB.setSuccessCallback(latexConversionAndSaveSuccess.bind(instance));
        rB.setFailureCallback(latexConversionAndSaveFailure.bind(instance));
        rB.setTimeoutCallback(latexConversionAndSaveTimeout.bind(instance));
        request = rB.build();
        request.send();
        instance.isLatex = true;
    }

    function getDecodedString(node) {
        return He.decode(node);
    }

    function saveMath() {
        var mathml, mathmlNode, versionedMath,
            currentVersion = this.currentVersion,
            newVersionNode = {};

        if (this.isLatex === true) {
            convertLatexToMathAndSave(this);
            return;
        }
        if (this.equationEditor.isEmptyMath() === true) {
            throw new Error('error.math_editing.math_empty');
        }

        mathmlNode = this.equationEditor.getMath();
        mathml = cleanMathml(mathmlNode);
        versionedMath = cleanMathml(this.versions[currentVersion].mathml);
        /*
            1. no changes/no edits
            2. edited current version/new version
            3. reverted to previous version
            4. forwarded to later version
            5. reverted/forwarded and edited a version
        */

        if (versionedMath === mathml) {
            if (this.actualVersion === this.currentVersion) {
                this.eventBus.publish('Dialog:Force:OnClose');
                return;
            }
        }
        else if (this.actualVersion !== this.currentVersion) {
            currentVersion = this.actualVersion + 1;
        }
        else {
            currentVersion += 1;
        }
        newVersionNode.actualVersion = this.actualVersion;
        newVersionNode.newVersion = currentVersion;
        newVersionNode.mathml = mathml;
        if (this.needBackUpNode === true) {
            newVersionNode.backupMathml = this.versions[1].mathml;
        }
        this.eventBus.publish(
            'Math:Equation:OnSave', this.mathFragment, this.mathReferenceName,
            newVersionNode, mathmlNode, this.proofEnabled
        );
        this.eventBus.publish('Loader:show', 9999);
    }

    function updateUndoAndRedoBtn(instance) {
        var currVer = instance.currentVersion,
            totVer = Object.keys(instance.versions).length;

        instance.undoBtn.classList.remove('disabled');
        instance.redoBtn.classList.remove('disabled');
        if (currVer === 0) {
            instance.undoBtn.classList.add('disabled');
            instance.redoBtn.classList.add('disabled');
            return;
        }
        if (currVer === 1) {
            instance.undoBtn.classList.add('disabled');
            return;
        }
        if (currVer >= totVer) {
            instance.redoBtn.classList.add('disabled');
            return;
        }
    }

    function undoSuccessMathCallback(newVersion, instance, response) {
        var latexEditor = instance.container.querySelector('.latex-editor');

        latexEditor.value = response;
        instance.currentVersion = newVersion;
        updateUndoAndRedoBtn(instance);
        instance.eventBus.publish('Loader:hide');
    }

    function getLatextFromMath(newVersion, successCallback, failureCallback, instance) {
        var currentMath, url, request, mathml,
            rB = new RequestBuilder();

        url = instance.equationEditor.getLatexConversionRequestURL(currentMath);
        mathml = instance.equationEditor.getMath();
        rB.setUrl(url);
        rB.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        rB.setData('mml=' + encodeURIComponent(mathml));
        rB.setMethod('POST');
        instance.eventBus.publish('Loader:show', 9999);
        rB.setSuccessCallback(undoSuccessMathCallback.bind(null, newVersion, instance));
        rB.setFailureCallback(failureCallback.bind(instance));
        request = rB.build();
        request.send();
        instance.isLatex = true;
    }

    function undoFailureCallback(res) {
        this.eventBus.publish('Loader:hide');
    }

    function updateEquation(mathml, newVersion, instance) {
        if (Helper.isEmptyString(mathml) === true) {
            throw new Error('error.improper_math_node');
        }
        instance.equationEditor.setMath(mathml);
        instance.currentVersion = newVersion;
        updateUndoAndRedoBtn(instance);
        enableAndDisableLatexOption(instance);
        instance.eventBus.publish('Loader:hide');
    }

    function undoFn() {
        var newVersion, mathml, matchedVersion;

        newVersion = this.currentVersion - 1;
        matchedVersion = this.versions[newVersion];
        if (Helper.isUndefined(matchedVersion) === true) {
            return;
        }
        this.eventBus.publish('Loader:show', 9999);
        mathml = matchedVersion.mathml;
        if (this.isLatex === true) {
            this.getLatextFromMath = getLatextFromMath.bind(
                null, newVersion, undoSuccessMathCallback, undoFailureCallback, this
            );
            this.equationEditor.setMathWithCallBack(mathml, this.getLatextFromMath);
            return;
        }
        updateEquation(mathml, newVersion, this);
    }

    function redoFn() {
        var newVersion, mathml, matchedVersion;

        newVersion = this.currentVersion + 1;
        matchedVersion = this.versions[newVersion];
        if (Helper.isUndefined(matchedVersion) === true) {
            return;
        }
        this.eventBus.publish('Loader:show', 9999);
        mathml = matchedVersion.mathml;
        if (this.isLatex === true) {
            this.getLatextFromMath = getLatextFromMath.bind(
                null, newVersion, undoSuccessMathCallback, undoFailureCallback, this
            );
            this.equationEditor.setMathWithCallBack(mathml, this.getLatextFromMath);
            return;
        }
        updateEquation(mathml, newVersion, this);
    }

    function backUpNode() {
        var mathml, tempDiv;

        if (this.currentVersion === 0) {
            mathml = this.equationEditor.getMath();
            tempDiv = document.createElement('div');
            tempDiv.innerHTML = mathml;
            this.versions[1].mathml = tempDiv.innerHTML;
            this.currentVersion = 1;
            this.actualVersion = 1;
            this.needBackUpNode = true;
            // this.mathFragment.querySelector('span[version='1'] .mathml').innerHTML = mathml;
            // this.eventBus.publish('Editor:Equation:BackUp', this.mathReferenceName, mathml);
        }
        enableAndDisableLatexOption(this);
    }

    function loadAnnotateEditor(imagePath, instance) {
        var imageNode, annotates, annotate, j, data, boxId, ann,
            annotationContainer, annoateExists,
            mathBoxSize = Config.get('mathAnnotateBoxSize');

        instance.annotationsCreate = {};
        instance.annotationsRemove = {};
        instance.container.innerHTML = annotationTemplate.join('');
        instance.saveAnnotateBtn = instance.container.querySelector(
            '.annotationeditor .save-annotate'
        );
        instance.saveAnnotateFn = saveAnnotation.bind(instance);
        instance.saveAnnotateBtn.addEventListener(
            'click', instance.saveAnnotateFn, false
        );

        annotationContainer = instance.container.querySelector('.annotation');
        imageNode = instance.doc.createElement('img');
        imageNode.setAttribute('src', imagePath);
        imageNode.dataset.id = instance.mathReferenceName;
        annotationContainer.appendChild(imageNode);
        ann = new instance.annotate(
            imageNode, instance.doc, instance.win,
            instance.eventBus, instance.locale
        );
        ann.setAnnoationType('math');
        ann.setRectHeightAndWidth(mathBoxSize.height, mathBoxSize.width);
        ann.renderComponentStyle();
        ann.render();
        annotates = instance.annotationBag.getAnnotationsForImage(
            instance.mathReferenceName
        );
        instance.dialogPanelInst.setCloseCallback(
            instance, instance.annotateDialogCloseCallback
        );
        if (Helper.isObject(annotates) === true) {
            for (j = 0; j < annotates.length; j += 1) {
                annotate = annotates[j];
                if (annotate === null) {
                    continue;
                }
                data = {
                    'x': annotate.position.left,
                    'y': annotate.position.top,
                    'width': annotate.position.width,
                    'height': annotate.position.height
                };
                boxId = ann.annotate(data, annotate.text);
                annoateExists = instance.annotationBag.get(
                    annotate.annotationId
                );
                if (annoateExists.boxId === null ||
                    boxId !== annoateExists.boxId
                ) {
                    instance.annotationBag.updateBag(
                        annotate.annotationId, annotate.imageId,
                        boxId, annotate.type, annotate.text, annotate.position
                    );
                }
            }
        }
    }

    function loadEquationEditor(mathml, imagePath, instance) {
        var mathContainer, latexContainer;

        instance.container.innerHTML = mathTemplate.join('');
        mathContainer = instance.container.querySelector('.matheditor .equation');
        instance.equationEditor.render(mathContainer);
        instance.backUpNode = backUpNode.bind(instance);
        instance.equationEditor.setMathWithCallBack(mathml, instance.backUpNode);
        instance.saveBtn = instance.container.querySelector('.matheditor .save');
        instance.undoBtn = instance.container.querySelector('.matheditor .math-button-undo');
        instance.redoBtn = instance.container.querySelector('.matheditor .math-button-redo');
        instance.latexConversionBtn = instance.container.querySelector('.matheditor .latex-conversion');
        instance.mathConversionBtn = instance.container.querySelector('.matheditor .math-conversion');
        instance.annotationConvLink = instance.container.querySelector('.matheditor .math-annotation');
        instance.annotationInfo = instance.container.querySelector('.matheditor .info');
        instance.annotateConvFn = function annotateConvFn() {
            loadAnnotateEditor(imagePath, instance);
        }.bind(instance);
        instance.annotationConvLink.addEventListener('click', instance.annotateConvFn, false);
        if (instance.hasMathAnnotation === false) {
            instance.annotationInfo.classList.add('hide');
        }
        instance.saveFn = saveMath.bind(instance);
        instance.undoFn = undoFn.bind(instance);
        instance.redoFn = redoFn.bind(instance);
        instance.latexConvFn = mathToLatex.bind(instance);
        instance.mathConvFn = latexToMath.bind(instance);
        instance.saveBtn.addEventListener('click', instance.saveFn, false);
        instance.undoBtn.addEventListener('click', instance.undoFn, false);
        instance.redoBtn.addEventListener('click', instance.redoFn, false);
        instance.latexConversionBtn.addEventListener('click', instance.latexConvFn, false);
        instance.mathConversionBtn.addEventListener('click', instance.mathConvFn, false);
        latexContainer = instance.container.querySelector('.latex');
        latexContainer.style.display = 'none';
        instance.dialogPanelInst.setCloseCallback(
            instance, instance.mathDialogCloseCallback
        );
    }

    function getVersions(eqnContainer) {
        var data,
            versionNodes = eqnContainer.querySelectorAll(
                '.equation_data_container span[version]'
            ),
            i = 1,
            len = versionNodes.length,
            version, versions = {};

        for (; i < len; i += 1) {
            version = versionNodes[i].getAttribute('version');
            data = {};
            data.version = version;
            data.mathml = versionNodes[i].querySelector('.mathml').innerHTML;
            data.image = versionNodes[i].querySelector('.image').innerHTML;
            data.latexEnable = null;
            if (Helper.isUndefined(versionNodes[i].dataset.latex) === false) {
                data.latexEnable = versionNodes[i].dataset.latex;
            }
            versions[version] = data;
        }
        return versions;
    }

    function mathDialogCloseHandler(instance, dialogInst) {
        var msg,
            tempDiv = document.createElement('div'),
            currentMath = instance.equationEditor.getMath(),
            prevMath = instance.versions[instance.actualVersion].mathml;

        tempDiv.innerHTML = currentMath;
        if (cleanMathml(tempDiv.innerHTML) === cleanMathml(prevMath)) {
            dialogInst.closeBox(instance);
            return;
        }
        msg = Config.getLocaleByKey('math.equation.changes.not.saved');

        if (confirm(msg) === true) {
            dialogInst.closeBox(instance, dialogInst);
        }
    }

    function latexDialogCloseHandler(dialogInst, instance, mathml) {
        var msg,
            tempDiv = document.createElement('div'),
            prevMath = instance.versions[instance.actualVersion].mathml;

        tempDiv.innerHTML = mathml;
        if (cleanMathml(tempDiv.innerHTML) === cleanMathml(prevMath)) {
            dialogInst.closeBox(instance);
            return;
        }
        msg = Config.getLocaleByKey('math.equation.changes.not.saved');

        if (confirm(msg) === true) {
            dialogInst.closeBox(instance, dialogInst);
        }
    }

    function commonFailureCallback() {
        console.log('latex to math error');
    }

    function convertToMath(latex, successCallback, instance) {
        var currentMath, url, request,
            rB = new RequestBuilder();

        url = instance.equationEditor.getMathConversionRequestURL(latex);
        rB.setUrl(url);
        rB.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        rB.setData('latex=' + encodeURIComponent(latex));
        rB.setMethod('POST');
        instance.eventBus.publish('Loader:show', 9999);
        rB.setSuccessCallback(successCallback);
        rB.setFailureCallback(commonFailureCallback.bind(instance));
        request = rB.build();
        request.send();
    }

    mathEditor.prototype.annotateDialogCloseCallback = function annotateDialogCloseCallback(
        dialogInst
    ) {
        var msg;

        if (this.annotationChanged === false) {
            dialogInst.closeBox(this);
            return;
        }
        msg = Config.getLocaleByKey('math.equation.changes.not.saved');

        if (confirm(msg) === true) {
            dialogInst.closeBox(this, dialogInst);
        }
    };

    mathEditor.prototype.mathDialogCloseCallback = function mathDialogCloseCallback(
        dialogInst
    ) {
        var latex;

        if (this.isLatex === true) {
            this.getLatextFromMath = getLatextFromMath.bind(
                null, latexDialogCloseHandler, this
            );
            latex = getLatexContainerValue(this);
            convertToMath(latex, latexDialogCloseHandler.bind(null, dialogInst, this), this);
            return;
        }
        mathDialogCloseHandler(this, dialogInst);
    };

    mathEditor.prototype.render = function render(mathml, imagePath) {
        var eqnContainer, version;

        resetVariables(this);
        eqnContainer = this.mathFragment.querySelector(equationSelector);
        if (eqnContainer.getAttribute('editable') === 'true') { // should be string
            this.versions = getVersions(eqnContainer);

            version = parseInt(
                eqnContainer.querySelector('.current_version').innerHTML, 10
            );
            this.actualVersion = version;
            this.currentVersion = version;
            loadEquationEditor(mathml, imagePath, this);
            updateUndoAndRedoBtn(this);
            closeDialog();
        }
        else {
            loadAnnotateEditor(imagePath, this);
        }
    };

    mathEditor.prototype.setMathContext = function setMathContext(mathReferenceName, mathFragment) {
        this.mathReferenceName = mathReferenceName;
        this.mathFragment = mathFragment;
    };

    mathEditor.prototype.setDialogContext = function setDialogContext(dialogPanelInst) {
        this.dialogPanelInst = dialogPanelInst;
    };

    mathEditor.prototype.setProofEnable = function setProofEnable(enable) {
        this.proofEnabled = enable;
    };

    mathEditor.prototype.destroy = function destroy() {
        this.eventBus.unsubscribe('Ann:onAnnotate', mathAnnotationCreate.bind(this));
        this.eventBus.unsubscribe('Ann:onRemove', mathAnnotationRemove.bind(this));
        this.eventBus.unsubscribe('Math:destroy', this.destroy);
        initializeVariables(this);
    };

    return mathEditor;
});

define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/EquationEditor', 'scripts/MathEditor',
    'scripts/Annotate', 'scripts/MathCommand', 'scripts/Util', 'scripts/FeatureToggle'
], function MathEditorInitLoader(
    Helper, EventBus, EquationEditor, MathEditor, Annotate, MathCommand, Util, Features
) {
    var mathEditorInst, mathEditorClickFn = [],
        equationSelector = Util.getSelector('equation'),
		addEquation ='.equation-edit-btn';

    function MathEditorInit(
        Win, Doc, MathContainer, DialogPanel, Token, ConversionEndPoint, ImageSaveEndPoint,
        AnnotatorBag
    ) {
        this.win = Win;
        this.doc = Doc;
        this.mathContainer = MathContainer;
        this.dialogPanel = DialogPanel;
        this.token = Token;
        this.conversionEndPoint = ConversionEndPoint;
        this.imageSaveEndPoint = ImageSaveEndPoint;
        this.annotatorBag = AnnotatorBag;
        this.annotateData = null;
        this.hasMathAnnotation = Features.isFeatureEnabled('Editor.Math.Annotation');
    }

    function getEquationTitle(eqnContainer) {
        var editable = eqnContainer.getAttribute('editable'),
            title = 'Click to edit';

        if (editable === 'false') {
            title = 'Click on the equation to provide instruction';
        }

        return title;
    }

    function renderMathEditor(
        eqnContainer, dialogPopupPanel, mathEditor, mathContainer
    ) {
        var mathNodeName, currentVersion, mathml, mathmlNode, imageNode,
            mathFragment = document.createDocumentFragment();

        dialogPopupPanel.setTitle('Math Editor');
        dialogPopupPanel.setIsModal(false);
        dialogPopupPanel.setContent(mathContainer);
        dialogPopupPanel.render();

        mathNodeName = eqnContainer.getAttribute('name');
        currentVersion = eqnContainer.querySelector('span.current_version');
        mathmlNode = eqnContainer.querySelector(
            'span[version="' + currentVersion.innerHTML + '"] .mathml'
        );
        imageNode = eqnContainer.querySelector(
            'span[version="' + currentVersion.innerHTML + '"] .image'
        );
        mathFragment.appendChild(eqnContainer.cloneNode(true));
        mathEditor.setMathContext(mathNodeName, mathFragment);
        mathml = mathmlNode.innerHTML;
        imageNode = imageNode.innerHTML;
        mathEditor.setDialogContext(dialogPopupPanel);
        mathEditor.render(mathml, imageNode);
    }
	
	function renderNewMathEditor(
        eqnContainer, dialogPopupPanel, mathEditor, mathContainer
    ) {
        var mathNodeName, currentVersion, mathml, mathmlNode, imageNode,
            mathFragment = document.createDocumentFragment();

        dialogPopupPanel.setTitle('Math Editor');
        dialogPopupPanel.setIsModal(false);
        dialogPopupPanel.setContent(mathContainer);
        dialogPopupPanel.render();

        mathNodeName = eqnContainer.getAttribute('name');
        currentVersion = eqnContainer.querySelector('span.current_version');
        mathmlNode = eqnContainer.querySelector(
            'span[version="' + currentVersion.innerHTML + '"] .mathml'
        );
        imageNode = eqnContainer.querySelector(
            'span[version="' + currentVersion.innerHTML + '"] .image'
        );
        mathFragment.appendChild(eqnContainer.cloneNode(true));
        mathEditor.setMathContext(mathNodeName, mathFragment);
        mathml = '<math xmlns="http://www.w3.org/1998/Math/MathML"></math>';
        imageNode = imageNode.innerHTML;
        mathEditor.setDialogContext(dialogPopupPanel);
        mathEditor.render(mathml, imageNode);
    }
	
    function tempUpdateAnnotationBag(instance, imageId) {
        var annotates, annotate, len,
            j = 0;

        if (Helper.isUndefined(instance.annotateData[imageId]) === true) {
            return;
        }
        annotates = instance.annotateData[imageId];
        len = annotates.length;
        for (; j < len; j += 1) {
            annotate = annotates[j];
            if (annotate === null) {
                return;
            }
            instance.annotatorBag.addBag(
                annotate.annotationId, annotate.imageId, null, annotate.type,
                annotate.text, annotate.position
            );
        }
    }

    MathEditorInit.prototype.setAnnotationData = function setAnnotationData(
        Annotations
    ) {
        this.annotateData = Annotations;
    };

    MathEditorInit.prototype.renderMathOnEquations = function renderMathOnEquations(
        container
    ) {
        var mathNodes, i, eqnContainer, title, eqnImgContainer, fn,
            mathNodeName;

        mathNodes = container.querySelectorAll(equationSelector);
        for (i = 0; i < mathNodes.length; i += 1) {
            eqnContainer = mathNodes[i];
            mathNodeName = eqnContainer.getAttribute('name');

            if (eqnContainer.getAttribute('editable') === 'false' &&
                this.hasMathAnnotation === false) {
                continue;
            }
            
			mathEditorClickFn[i] = function click(eqnContainer) {
                renderMathEditor(
                    eqnContainer, this.dialogPanel, mathEditorInst, this.mathContainer
                );
            }.bind(this, eqnContainer);
            eqnContainer.addEventListener('click', mathEditorClickFn[i], false);
				
			
			
            tempUpdateAnnotationBag(this, mathNodeName);
            eqnImgContainer = eqnContainer.querySelector('img');
            title = getEquationTitle(eqnContainer);
            eqnImgContainer.setAttribute('title', title);
            eqnImgContainer.addEventListener('click', fn, false);
        }
		
		eqnContainer = container.querySelectorAll(equationSelector)[5];
		addEquationBtn = document.querySelector(addEquation);
			addEquationBtnFn = function click(eqnContainer) {
                renderNewMathEditor(
                    eqnContainer, this.dialogPanel, mathEditorInst, this.mathContainer
                );
            }.bind(this, eqnContainer);
            addEquationBtn.addEventListener('click', addEquationBtnFn, false);
        EventBus.publish('EditSummary:Load');
    };

    MathEditorInit.prototype.disableMathOnEquationsclick = function disableMathOnEquationsclick(
        container, readonly
    ) {
        var mathNodes, i, eqnContainer;

        mathNodes = container.querySelectorAll(equationSelector);
        for (i = 0; i < mathNodes.length; i += 1) {
            eqnContainer = mathNodes[i];
            if (readonly === true) {
                eqnContainer.removeEventListener('click', mathEditorClickFn[i], false);
            }
            else {
                eqnContainer.addEventListener('click', mathEditorClickFn[i], false);
            }
        }
    };

    MathEditorInit.prototype.initiate = function initiate() {
        var equationEditor, MathCommandInst;

        // Loading Math Editor
        equationEditor = new EquationEditor(this.win.com.wiris);
        mathEditorInst = new MathEditor(
            this.mathContainer, EventBus, equationEditor, this.doc, this.win,
            Annotate, this.annotatorBag, this.hasMathAnnotation
        );
        MathCommandInst = new MathCommand(
                EventBus, this.doc, this.win, this.token, equationEditor, this.conversionEndPoint,
                this.imageSaveEndPoint, this.annotatorBag
            );
        return mathEditorInst;
    };

    return MathEditorInit;
});

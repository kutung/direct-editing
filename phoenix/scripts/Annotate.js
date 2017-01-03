/*
    Original idea taken from [http://simonsarris.com/blog/225-canvas-selecting-resizing-shape]
    Popup html taken from Annotorious jQuery Plugin
*/
define(['scripts/Helper'], function annotateLoader(Helper) {
    var NEW = -1,
        SAVED = 0,
        ONEDIT = 1,
        AnnotatNum = 0, newAnt, instance = new Array(),
        annTextEditTemplate = [
            '<div class="annotate-editor">',
                '<form>',
                    '<textarea class="comment" tabindex="1" rows="1"></textarea>',
                    '<div class="button-container">',
                        '<div class="left">',
                            '<button class="button delete" tabindex="4">{{annotate.edit.delete.button.label}}</button>',
                        '</div>',
                        '<div class="right">',
                            '<button class="button cancel" tabindex="3">{{annotate.edit.cancel.button.label}}</button>',
                            '<button class="button save" tabindex="2" disabled>{{annotate.edit.save.button.label}}</button>',
                        '</div>',
                    '</div>',
                '</form>',
            '</div>'
        ],
        cssRules = {
            '.annotator-container': {},
            '.annotate-editor': {
                'border': '1px solid #000',
                'box-shadow': '0 5px 53px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.25)',
                'left': '0',
                'position': 'absolute',
                'top': '0',
                'z-index': '2',
                'text-indent': '0'
            },
            '.annotate-editor form': {
                'display': 'inline-block',
                'background-color': '#DDD',
                'vertical-align': 'middle'
            },
            '.annotate-editor .comment': {
                'border': 'none',
                'box-sizing': 'border-box',
                'display': 'block',
                'font-size': '12px',
                'min-height': '70px',
                'min-width': '230px',
                'padding': '5px'
            },
            '.annotate-editor .button-container': {
                'display': 'flex',
                'padding': '5px',
                '-moz-user-select': 'none',
                '-khtml-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none'
            },
            '.annotate-editor .button-container .left, .annotate-editor .button-container .right': {
                'flex': '1'
            },
            '.annotate-editor .button-container .right': {
                'text-align': 'right'
            },
            '.annotate-editor .button-container .button.delete': {
                'background-color': '#CA5142',
                'border': '1px solid #CA5142',
                'font-weight': 'bold',
                'color': '#FFF'
            },
            '.annotate-editor .button-container .button.cancel': {
                'background-color': '#888',
                'border': '1px solid #888',
                'font-weight': 'bold',
                'color': '#FFF',
                'margin-right': '5px'
            },
            '.annotate-editor .button-container .button.save': {
                'background-color': '#47a447',
                'border': '1px solid #47a447',
                'font-weight': 'bold',
                'color': '#FFF'
            },
            '.annotate-editor .button-container .button.cancel[disabled], .annotate-editor .button-container .button.delete[disabled], .annotate-editor .button-container .button.save[disabled]': {
                'background-color': '#EEE',
                'color': '#ccc',
                'border': '1px solid #EEE'
            },
            '.annotate-editor .button-container .button': {
                'font-size': '12px',
                'padding': '6px 8px',
                'cursor': 'pointer',
                'display': 'inline'
            }
        };

    function AnnotationText(box, instance) {
        this.box = box;
        this.text = null;
        this.annTextContainer = null;
        this.annEditContainer = null;
        this.annotationTextarea = null;
        this.buttonsContainer = null;
        this.deleteButton = null;
        this.saveButton = null;
        this.cancelButton = null;
        this.editFn = null;
        this.deleteFn = null;
        this.saveFn = null;
        this.cancelFn = null;
        this.inst = instance;
        this.readOnly = false;
        this.threshold = 232;
        this.state = NEW;
    }

    AnnotationText.prototype.destroy = function annTextDestroy() {
        var index;

        this.deleteButton.removeEventListener('click', this.deleteFn, false);
        this.saveButton.removeEventListener('click', this.saveFn, false);
        this.cancelButton.removeEventListener('click', this.cancelFn, false);
        this.box.annotation = null;
        index = this.inst.annotationBoxes.indexOf(this.box);
        this.inst.annotationBoxes.splice(index, 1);
        this.box = null;
        this.text = null;
        this.annotationTextarea = null;
        this.deleteButton = null;
        this.saveButton = null;
        this.buttonsContainer = null;
        this.cancelButton = null;
        this.editFn = null;
        this.deleteFn = null;
        this.saveFn = null;
        this.cancelFn = null;
        this.annEditContainer.parentNode.removeChild(this.annEditContainer);
        this.annTextContainer = null;
        this.annEditContainer = null;
        this.inst.selectedAnnotation = null;
        this.inst.canvas.style.cursor = null;
        this.inst.isBoxDrag = false;
        this.inst.isResizeDrag = false;
        this.inst.resizeHandle = -1;
        this.inst = null;
        this.state = NEW;
    };

    AnnotationText.prototype.getData = function annTextGetData() {
        var data = {};

        data.x = this.box.x;
        data.y = this.box.y;
        data.width = this.box.w;
        data.height = this.box.h;
        data.id = this.box.id;
        data.text = this.text;

        return data;
    };

    AnnotationText.prototype.setText = function annTextSetText(text) {
        this.annotationTextarea.value = text;
        this.text = text;
    };

    AnnotationText.prototype.onEdit = function annTextOnEdit() {
        var editStyle = this.annEditContainer.style,
            editCont = this.annEditContainer.firstChild,
            width, height, left, top;

        this.annotationTextarea.value = this.text;

        editStyle.display = 'block';
        width = editCont.offsetWidth;
        height = editCont.offsetHeight;
        if (this.box.x + width > this.inst.imageWidth) {
            left = (this.inst.imageWidth - width);
        }
        else {
            left = (this.box.x);
        }

        if (left < 0) {
            left = 0;
        }

        if (this.box.y + this.box.h + height > this.inst.imageHeight) {
            top = (this.inst.imageHeight - height);
        }
        else {
            top = (this.box.y + this.box.h + 1);
        }

        if (top < 0) {
            top = 0;
        }

        editStyle.left = left + 'px';
        editStyle.top = top + 'px';

        this.setFocus();
    };

    AnnotationText.prototype.onDelete = function annTextOnDelete() {
        var currentBox = $(".antNumberList .active").attr("data-uuid");
        var parent = document.querySelector(".antNumberList");
        var child = parent.querySelector(".active");
        if(child != null) parent.removeChild(child);

        annotCount = parent.querySelectorAll('li');
        for (var i = 0; i < annotCount.length; i++) {
            var addList = parent.querySelectorAll('li')[i];
            var addListNum = addList.querySelector('span');
            addListNum.innerHTML = i+1;
        }
        document.querySelector('.rightAnotation').style.display = 'none';

        if(currentBox != undefined)
        this.inst.clearAnnotation(parseInt(currentBox));
    }

    AnnotationText.prototype.onSave = function annTextOnSave() {
        this.inst.updateAnnotationText(this.box.id, this.annotationTextarea.value);
        this.saveButton.disabled = true;
    };

    AnnotationText.prototype.anatoateSave = function annTextAnatotaeSave() {
        // document.querySelectorAll('.antNumberList li')[document.querySelectorAll('.antNumberList li').length-1].childNode
        //this.saveButton.disabled = true;
        //var annNum = document.querySelector(".antCounts").innerText;

        var element = document.querySelector(".antNumberList");
        var element1 = element.querySelector(".active");
        var content = document.querySelector(".antTextArea").value;
        element1.setAttribute("data-msg", content);
        document.querySelector('.rightAnotation').style.display = 'none';     
    };

    AnnotationText.prototype.onCancel = function annTextOnCancel() {
        /*this.annotationTextarea.focus();
        this.annotationTextarea.value = this.text;
        this.saveButton.disabled = true;
        this.box.hideAnnotationEdit();
        this.box.opened = false;
        this.inst.hasAnyOpenedBox = false;*/
        document.querySelector('.rightAnotation').style.display = 'none';
        document.querySelector('.antTextArea').value = '';
    };

    AnnotationText.prototype.onNewAnnotate = function annTextOnCancel() {
        this.annotationTextarea.focus();
        this.annotationTextarea.value = this.text;
        this.saveButton.disabled = true;
        this.box.hideAnnotationEdit();
        this.box.opened = false;
        this.inst.hasAnyOpenedBox = false;
    };

    AnnotationText.prototype.onChange = function annTextOnChange() {
        if (this.readOnly === true) {
            return;
        }

        if (this.text !== '') {
            this.state = NEW;
        }

        if (this.annotationTextarea.value === '') {
            this.saveButton.disabled = true;
        }
        else {
            this.saveButton.disabled = false;
        }
    };

    AnnotationText.prototype.toggleButtons = function toggleButtons(readOnly) {
        if (readOnly === true) {
            this.buttonsContainer.style.display = 'none';
        }
        else {
            this.buttonsContainer.style.display = 'flex';
        }
    };

    AnnotationText.prototype.onBtnContainerClick = function onBtnContainerClick(e) {
        var target = e.target;

        if (Helper.isNull(target) === false &&
            target.tagName.toLowerCase() !== 'button'
        ) {
            this.setFocus();
        }
    };

    AnnotationText.prototype.setFocus = function onBtnContainerClick() {
        this.annotationTextarea.focus();
    };

    function renderAnnotationText(box, instance) {
        var annText = new AnnotationText(box, instance),
            editCont, editStyle, eqs, form;

        editCont = instance.htmlDoc.createElement('div');
        editCont.innerHTML = Helper.replaceLocaleString(
            annTextEditTemplate.join(''), instance.locale
        );
        editStyle = editCont.style;
        editStyle.display = 'none';
        editStyle.position = 'absolute';
        annText.annEditContainer = editCont;
        eqs = editCont.querySelector.bind(editCont);
        form = eqs('.annotate-editor form');
        annText.annotationTextarea = eqs('.annotate-editor .comment');
        annText.buttonsContainer = eqs('.annotate-editor .button-container');
        annText.deleteButton = eqs('.annotate-editor .button-container .button.delete');
        annText.saveButton = eqs('.annotate-editor .button-container .button.save');
        annText.cancelButton = eqs('.annotate-editor .button-container .button.cancel');
        annText.instance = instance;
        annText.deleteFn = annText.onDelete.bind(annText);
        annText.saveFn = annText.onSave.bind(annText);
        annText.antSaveFn = annText.anatoateSave.bind(annText);
        annText.cancelFn = annText.onCancel.bind(annText);
        annText.annotateFn = annText.onNewAnnotate.bind(annText);
        annText.onChangeFn = annText.onChange.bind(annText);
        annText.onButtonContainerClick = annText.onBtnContainerClick.bind(annText);

        annText.annotationTextarea.addEventListener('keyup', annText.onChangeFn, false);
        annText.annotationTextarea.addEventListener(
            'change', annText.onChangeFn, false
        );
        annText.buttonsContainer.addEventListener(
            'click', annText.onButtonContainerClick, false
        );
        annText.deleteButton.addEventListener('click', annText.deleteFn, false);
        annText.saveButton.addEventListener('click', annText.saveFn, false);
        annText.cancelButton.addEventListener('click', annText.cancelFn, false);
        document.querySelector('.antCancel').addEventListener('click', annText.cancelFn, false);
        document.querySelector('.addNewAnnotate').addEventListener('click', annText.annotateFn, false);
        document.querySelector('.antSave').addEventListener('click', annText.antSaveFn, false);
        document.querySelector('.antDelete').addEventListener('click', annText.deleteFn, false);
        form.addEventListener('submit', function onSubmit(event) {
            event.preventDefault();
            event.stopPropagation();
        }, false);
        instance.canvasContainer.appendChild(editCont);
        box.annotation = annText;
    }

    function Box(instance) {
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
        this.fill = null;
        this.annotation = null;
        this.id = null;
        this.inst = instance;
        this.saved = null;
        this.opened = false;
    }

    Box.prototype.annotationBoxOverflowsImageRect = function annotationBoxOverflowsImageRect(
        instance
    ) {
        return (instance.imageWidth - this.x) < this.annotation.threshold &&
            ((this.x + this.w) - this.annotation.threshold) > 0;
    };

    Box.prototype.annotationBoxFitInImageRect = function annotationBoxFitInImageRect(
        instance, annContWidth
    ) {
        return this.x + annContWidth > instance.imageWidth;
    };

    Box.prototype.showAnnotationText = function boxShowAnnText(instance) {
        var annCont = this.annotation.annEditContainer,
            style = annCont.style,
            width = annCont.offsetWidth,
            left, top;

        if (this.annotationBoxOverflowsImageRect(instance) === true) {
            left = (this.x + this.w) - this.annotation.threshold;
        }
        else if (this.annotationBoxFitInImageRect(instance, width) === true) {
            left = (instance.imageWidth - width);
        }
        else {
            left = (this.x);
        }

        top = this.y + this.h;

        if (left < 0) {
            left = 0;
        }
        if (top < 0) {
            top = 0;
        }
        style.top = top + 'px';
        style.left = left + 'px';
        if (style.display === 'none') {
            instance.eBus.publish('Ann:commentOpen', this.inst.image);
        }
        style.display = 'none';
        this.annotation.setFocus();
    };

    Box.prototype.setReadOnly = function boxSetReadOnly(readOnly) {
        this.annotation.saveButton.disabled = readOnly;
        this.annotation.cancelButton.disabled = readOnly;
        this.annotation.deleteButton.disabled = readOnly;
        this.annotation.annotationTextarea.readOnly = readOnly;
        this.annotation.readOnly = readOnly;
        this.annotation.toggleButtons(readOnly);
    };

    Box.prototype.hideAnnotationEdit = function boxHideAnnotationEdit() {
        var style = this.annotation.annEditContainer.style;

        this.inst.hasAnyOpenedBox = false;
        this.opened = false;
        if (style.display !== 'none') {
            style.display = 'none';
            this.inst.eBus.publish('Ann:commentClosed', this.inst.image);
        }
    };

    function drawSelectionBorder(box) {
        var currentResizeSelectionBox;

        box.inst.context.strokeStyle = box.inst.selectedBorderColor;
        box.inst.context.lineWidth = box.inst.selectedBorderWidth;
        box.inst.context.setLineDash(
            [box.inst.dottedStrokeSizePixel, box.inst.dottedStrokeSpacePixel]
        );
        box.inst.context.strokeRect(box.x, box.y, box.w, box.h);
        box.inst.selectionHandles[0].x = box.x + box.w - box.inst.resizeSelectionBoxSize;
        box.inst.selectionHandles[0].y = box.y + box.h - box.inst.resizeSelectionBoxSize;
        currentResizeSelectionBox = box.inst.selectionHandles[0];


        box.inst.context.fillStyle = "rgba(228, 125, 34, 1)";
        box.inst.context.fillRect(
            box.x, box.y,
            30, 30
        );

        var parent = document.querySelector(".antNumberList");
        annotCount = parent.querySelectorAll('li');

        for (var i = 0; i < annotCount.length; i++) {
            var addList = parent.querySelectorAll('li')[i];
            var antUuid = addList.getAttribute("data-uuid");
            if(antUuid == box.id){
                var currentNum = addList.innerText;
            }
            
        }

        box.inst.context.fillStyle = "rgba(255, 255, 255, 1)";
        box.inst.context.font = "20px Arial";
        box.inst.context.fillText(currentNum, box.x+10, box.y+23);

        /*box.inst.context.fillStyle = box.inst.resizeSelectionBoxColor;
        box.inst.context.fillRect(
            currentResizeSelectionBox.x, currentResizeSelectionBox.y,
            box.inst.resizeSelectionBoxSize, box.inst.resizeSelectionBoxSize
        );*/
    }

    Box.prototype.draw = function boxDraw(context) {
        if (context === this.inst.gContext) {
            context.fillStyle = 'black';
        }
        else {
            context.fillStyle = this.fill;
        }

        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > this.inst.imageWidth || this.y > this.inst.imageHeight) {
            return;
        }
        if (this.x + this.w < 0 || this.y + this.h < 0) {
            return;
        }

        context.fillRect(this.x, this.y, this.w, this.h);

        var currnetActiveNum = $(".antNumberList .active").attr("data-uuid");
        if (this.id == currnetActiveNum/*this.inst.selectedAnnotation === this*/) {
            drawSelectionBorder(this);
        }
        else {
            context.strokeStyle = this.inst.inActiveRectStrokeColor;
            context.strokeRect(this.x, this.y, this.w, this.h);
            var currentResizeSelectionBox;

            this.inst.selectionHandles[0].x = this.x + this.w - this.inst.resizeSelectionBoxSize;
            this.inst.selectionHandles[0].y = this.y + this.h - this.inst.resizeSelectionBoxSize;
            currentResizeSelectionBox = this.inst.selectionHandles[0];

            this.inst.context.fillStyle = "rgba(0, 0, 0, 1)";
            this.inst.context.fillRect(
                this.x, this.y,
                30, 30
            );

            var parent = document.querySelector(".antNumberList");
            annotCount = parent.querySelectorAll('li');

            for (var i = 0; i < annotCount.length; i++) {
                var addList = parent.querySelectorAll('li')[i];
                var antUuid = addList.getAttribute("data-uuid");
                if(antUuid == this.id){
                    var currentNum = addList.innerText;
                }
                
            }
            this.inst.context.fillStyle = "rgba(255, 255, 255, 1)";
            this.inst.context.font = "20px Arial";
            this.inst.context.fillText(currentNum, this.x+10, this.y+23);

            /*this.inst.context.fillStyle = this.inst.resizeSelectionBoxColor;
            this.inst.context.fillRect(
                currentResizeSelectionBox.x, currentResizeSelectionBox.y,
                this.inst.resizeSelectionBoxSize, this.inst.resizeSelectionBoxSize
            );*/
        }
    };

    function showAnatationValues(instance){
        document.querySelector('.rightAnotation').style.display = 'block';
        // $(".antNumberList").append('<li class="AN_'+AnnotatNum+'"><span>'+AnnotatNum+'</span><i></i></li>');
        var tempNode = document.createElement('div');

        $('.antNumberList li').removeClass("active");
        tempNode.innerHTML = '<li class="AN_'+AnnotatNum+' active antList" data-uuid="'+instance.uuid+'"><span class="ant-main-list">'+newAnt+'</span><i></i></li>';
                
        document.querySelector('.antNumberList').appendChild(tempNode.firstChild);
        document.querySelector('.antCounts').innerHTML = newAnt;
        document.querySelector(".antTextArea").value = "";

        $('.antNumberList li').off('click').on('click', function(e){
            $('.antNumberList li').removeClass("active");
            var annotateMsg = $(e.currentTarget).attr("data-msg");
            var annotateNum = $(e.currentTarget).text();
            $(e.currentTarget).addClass("active");
            document.querySelector('.rightAnotation').style.display = 'block';
            document.querySelector(".antTextArea").value = "";

            if(annotateMsg != undefined){
                document.querySelector(".antTextArea").value = annotateMsg;
            }
            document.querySelector(".antCounts").innerHTML = annotateNum;

            instance.canvasValid = false;
            drawAnnotationBoxes(instance);
        });
    }

    function invalidate(instance) {
        instance.canvasValid = false;
    }

    function addRect(x, y, w, h, text, instance) {
        AnnotatNum++;
        var parent = document.querySelector(".antNumberList");
        annotCount = parent.querySelectorAll('li');
        newAnt = annotCount.length+1;

        var rect = new Box(instance);
        rect.x = x;
        rect.y = y;
        rect.w = w;
        rect.h = h;
        rect.fill = instance.rectFillColor;
        instance.uuid += 1;
        instance.aid = AnnotatNum;
        rect.aid = instance.aid;
        rect.id = instance.uuid;
        renderAnnotationText(rect, instance);
        rect.annotation.setText(text);
        instance.annotationBoxes.push(rect);
        invalidate(instance);
        showAnatationValues(instance);
        return rect.id;
    }

    function clear(context, instance) {
        context.clearRect(0, 0, instance.imageWidth, instance.imageHeight);
    }

    function drawAnnotationBoxes(instance) {
        var len = instance.annotationBoxes.length,
            i = 0;

        if (instance.canvasValid === false) {
            if (instance.context !== null) {
                clear(instance.context, instance);
            }
            for (; i < len; i += 1) {
                instance.annotationBoxes[i].draw(instance.context);
            }
            instance.canvasValid = true;
        }
    }

    function getMouse(e, instance) {
        var element = instance.canvas,
            doc = element && element.ownerDocument,
            docElem, box;

        if (doc === null) {
            throw new Error('annotator.error.no.document.object.found');
        }

        docElem = doc.documentElement;
        box = element.getBoundingClientRect();
        instance.canvasLeft = box.left + instance.global.pageXOffset - docElem.clientLeft;
        instance.canvasTop = box.top + instance.global.pageYOffset - docElem.clientTop;
        instance.currX = e.pageX;
        instance.currY = e.pageY;
    }

    function getMouseXYOverCanvas(instance) {
        var x = instance.currX - instance.canvasLeft,
            y = instance.currY - instance.canvasTop;

        return {'x': x, 'y': y};
    }

    function hideAllText(instance) {
        var j = 0,
            len = instance.annotationBoxes.length,
            box;

        for (; j < len; j += 1) {
            box = instance.annotationBoxes[j];
            box.hideAnnotationEdit();
        }
    }

    function onResizeDrag(instance) {
        var oldx = instance.selectedAnnotation.x,
            oldy = instance.selectedAnnotation.y,
            mouseXY;

        mouseXY = getMouseXYOverCanvas(instance);
        hideAllText(instance);
        instance.selectedAnnotation.w = mouseXY.x - oldx;
        instance.selectedAnnotation.h = mouseXY.y - oldy;
    }

    function onBoxHover(instance) {
        var j = 0,
            len = instance.annotationBoxes.length,
            mouseXY, box;

        mouseXY = getMouseXYOverCanvas(instance);

        for (; j < len; j += 1) {
            box = instance.annotationBoxes[j];
            if (mouseXY.x >= box.x && mouseXY.x <= box.x + box.w &&
                mouseXY.y >= box.y && mouseXY.y <= box.y + box.h) {
                if (instance.hasAnyOpenedBox === true) {
                    continue;
                }

                instance.hasAnyOpenedBox = true;
                box.opened = true;
                box.showAnnotationText(instance);

                if (box.annotation.state === SAVED) {
                    box.annotation.state = ONEDIT;
                }
            }
            else if (instance.readonly === true || box.annotation.state === ONEDIT) {
                box.hideAnnotationEdit();

                if (box.annotation.state === ONEDIT) {
                    box.annotation.state = SAVED;
                }
            }
        }
    }

    function onResizeHandleHover(instance) {
        var resizeSelectionBox, mouseXY;

        mouseXY = getMouseXYOverCanvas(instance);
        resizeSelectionBox = instance.selectionHandles[0];

        if (mouseXY.x >= resizeSelectionBox.x &&
            mouseXY.x <= resizeSelectionBox.x + instance.resizeSelectionBoxSize &&
            mouseXY.y >= resizeSelectionBox.y &&
            mouseXY.y <= resizeSelectionBox.y + instance.resizeSelectionBoxSize
        ) {
            instance.resizeHandle = 0;
            invalidate(instance);
            instance.canvas.style.cursor = 'se-resize';
            return;
        }
        instance.isResizeDrag = false;
        instance.resizeHandle = -1;
        instance.canvas.style.cursor = 'auto';
    }

    function getBoxXY(instance, mouse, width, height) {
        var boxX, boxY;

        boxX = mouse.x - (width / 2);
        boxY = mouse.y - (height / 2);
        boxX = boxX < 0 ? 0 : boxX;
        boxY = boxY < 0 ? 0 : boxY;
        boxX = boxX > (instance.imageWidth - width) ? (instance.imageWidth - width) : boxX;
        boxY = boxY > (instance.imageHeight - height) ? (instance.imageHeight - height) : boxY;

        return {'x': boxX, 'y': boxY};
    }

    function canvasMove(e) {
        var mouseXY, box;

        getMouse(e, this);
        if (this.isBoxDrag) {
            mouseXY = getMouseXYOverCanvas(this);
            box = getBoxXY(
                this, mouseXY, this.selectedAnnotation.w, this.selectedAnnotation.h
            );
            this.selectedAnnotation.x = box.x;
            this.selectedAnnotation.y = box.y;
            hideAllText(this);
        }
        else if (this.isResizeDrag === true && this.selectedAnnotation !== null) {
            onResizeDrag(this);
        }
        else if (this.isBoxDrag === false && this.isResizeDrag === false) {
            this.canvas.style.cursor = 'auto';
            onBoxHover(this);
        }
        invalidate(this);

        if (this.selectedAnnotation !== null && this.isResizeDrag === false) {
            onResizeHandleHover(this);
        }
    }

    function isMouseWithInBox(box, mouseXY) {
        return (box.x < mouseXY.x) && (box.y < mouseXY.y) &&
                ((box.x + box.w) > mouseXY.x) &&
                ((box.y + box.h) > mouseXY.y);
    }

    function canvasDown(e) {
        var len = this.annotationBoxes.length,
            i = len - 1, box, existingBox,
            height = this.rectDefaultHeight,
            width = this.rectDefaultWidth,
            imageData, mouseXY, id;

        getMouse(e, this);
        mouseXY = getMouseXYOverCanvas(this);

        if (this.resizeHandle !== -1) {
            this.isResizeDrag = true;
            return;
        }
        clear(this.gContext, this);

        for (; i >= 0; i -= 1) {
            existingBox = this.annotationBoxes[i];

            if (isMouseWithInBox(existingBox, mouseXY) === true &&
                existingBox.opened === false &&
                this.hasAnyOpenedBox === true
            ) {
                continue;
            }

            this.annotationBoxes[i].draw(this.gContext, 'black');
            imageData = this.gContext.getImageData(mouseXY.x, mouseXY.y, 1, 1);

            // if the mouse pixel exists, select and break
            if (imageData.data[3] > 0) {
                this.selectedAnnotation = this.annotationBoxes[i];
                this.isBoxDrag = true;
                invalidate(this);
                clear(this.gContext, this);
                return;
            }
        }

        if (this.hasAnyOpenedBox === true) {
            if (this.selectedAnnotation !== null &&
                this.selectedAnnotation.annotation !== null
            ) {
                e.preventDefault();
                this.selectedAnnotation.annotation.setFocus();
            }

            return;
        }

        this.selectedAnnotation = null;
        clear(this.gContext, this);
        box = getBoxXY(this, mouseXY, width, height);

        id = this.annotate({
            'x': box.x, 'y': box.y, 'width': width, 'height': height
        }, '', false);

        this.eBus.publish('Ann:onBoxCreated', id, this);
    }

    function canvasUp() {
        var data;

        if (this.selectedAnnotation !== null && this.isResizeDrag === true ||
            this.isBoxDrag === true
        ) {
            data = this.selectedAnnotation.annotation.getData();
            this.eBus.publish('Ann:onAnnotate', data, this.image, this);
        }

        this.isBoxDrag = false;
        this.isResizeDrag = false;
        this.resizeHandle = -1;
    }

    function getBoxWithId(id, instance) {
        var i = 0,
            len = instance.annotationBoxes.length,
            box;

        for (; i < len; i += 1) {
            box = instance.annotationBoxes[i];
            if (box.id === id) {
                return box;
            }
        }
        //throw new Error('invalid.annotation.id');
    }

    function assertAnnotatorRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('annotator.not.rendered');
        }
    }

    function pollForChanges() {
        var instance = this,
            drawBox = function drawBox() {
                drawAnnotationBoxes(instance);
            };

        if (this.timer === null) {
            this.timer = setInterval(drawBox, 30);
        }
    }

    function cancelPolling() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    function wrapImageWithCanvas(instance) {
        var imageBoundingRec,
            hoverInstruction = Helper.replaceLocaleString(
            '{{annotate.canvas.hover.instruction}}', instance.locale
        );

        instance.canvas = instance.htmlDoc.createElement('canvas');
        instance.canvas.classList.add('annotator-canvas');
        instance.canvas.setAttribute('title', hoverInstruction);
        instance.ghostCanvas = instance.htmlDoc.createElement('canvas');
        instance.canvasContainer = instance.htmlDoc.createElement('div');
        instance.canvasContainer.classList.add('annotator-container');
        imageBoundingRec = instance.image.getBoundingClientRect();
        instance.imageWidth = imageBoundingRec.width;
        instance.imageHeight = imageBoundingRec.height;
        instance.canvas.height = instance.imageHeight;
        instance.canvas.width = instance.imageWidth;
        instance.canvasContainer.style.height = instance.imageHeight + 'px';
        instance.canvasContainer.style.width = instance.imageWidth + 'px';
        instance.canvasContainer = instance.image.parentNode.insertBefore(
            instance.canvasContainer, instance.image.nextSibling
        );
        instance.canvasContainer.appendChild(instance.image);
        instance.canvasContainer.appendChild(instance.canvas);
        instance.canvasContainer.style.position = 'relative';
        instance.canvasContainer.style.margin = 'auto';
        instance.canvas.style.position = 'absolute';
        instance.canvas.style.top = '0px';
        instance.canvas.style.left = '0px';
        instance.context = instance.canvas.getContext('2d');
        instance.ghostCanvas.height = instance.imageHeight;
        instance.ghostCanvas.width = instance.imageWidth;
        instance.gContext = instance.ghostCanvas.getContext('2d');
        instance.onSelectStart = function onSelectStart() {
            return false;
        };
        instance.onMouseDown = canvasDown.bind(instance);
        instance.onMouseUp = canvasUp.bind(instance);
        instance.onMouseMove = canvasMove.bind(instance);
        instance.onMouseEnter = pollForChanges.bind(instance);
        instance.onMouseLeave = cancelPolling.bind(instance);

        instance.canvas.addEventListener('mousedown', instance.onMouseDown, false);
        instance.canvas.addEventListener('mouseup', instance.onMouseUp, false);
        instance.canvas.addEventListener('mousemove', instance.onMouseMove, false);
        instance.canvas.addEventListener('mouseenter', instance.onMouseEnter, false);
        instance.canvas.addEventListener('mouseleave', instance.onMouseLeave, false);
        instance.canvas.addEventListener('selectstart', instance.onSelectStart, false);
        AnnotatNum =0;
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'annotator-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.annotationBoxes = [];
        instance.canvas = null;
        instance.canvasContainer = null;
        instance.canvasValid = false;
        instance.context = null;
        instance.currX = null;
        instance.currY = null;
        instance.eBus = null;
        instance.editPopupOpen = false;
        instance.gContext = null;
        instance.ghostCanvas = null;
        instance.htmlDoc = null;
        instance.image = null;
        instance.imageHeight = null;
        instance.imageWidth = null;
        instance.isBoxDrag = false;
        instance.isRendered = false;
        instance.isResizeDrag = false;
        instance.resizeHandle = -1;
        instance.resizeSelectionBoxColor = 'yellow';
        instance.inActiveRectStrokeColor = 'rgba(0, 0, 0, 1)';
        instance.resizeSelectionBoxSize = 8;
        instance.rectFillColor = 'rgba(0, 0, 0, 0)';
        instance.selectedAnnotation = null;
        instance.selectedBorderColor = 'rgba(228, 125, 34, 1)';
        instance.selectedBorderWidth = null;
        instance.dottedStrokeSizePixel = 6;
        instance.dottedStrokeSpacePixel = 2;
        instance.selectionHandles = [];
        instance.styleBorderLeft = null;
        instance.styleBorderTop = null;
        instance.stylePaddingLeft = null;
        instance.stylePaddingTop = null;
        instance.timer = null;
        instance.uuid = 1;
        instance.onMouseEnter = null;
        instance.onMouseLeave = null;
        instance.onMouseMove = null;
        instance.onMouseUp = null;
        instance.onMouseDown = null;
        instance.onSelectStart = null;
        instance.global = null;
        instance.canvasLeft = null;
        instance.canvasTop = null;
        instance.readonly = false;
        instance.locale = {};
        instance.rectDefaultHeight = 40;
        instance.rectDefaultWidth = 40;
        instance.id = null;
        instance.hasAnyOpenedBox = false;
        instance.type = null;
    }

    function Annotator(img, doc, win, eventBus, locale) {
        if (win instanceof win.Window === false) {
            throw new Error('annotator.requires.window.object');
        }
        if (img instanceof win.HTMLImageElement === false) {
            throw new Error('annotator.requires.image');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('annotator.requires.htmldocument');
        }
        if (typeof eventBus.publish !== 'function') {
            throw new Error('annotator.requires.eventbus');
        }
        initializeVariables(this);
        this.global = win;
        this.htmlDoc = doc;
        this.image = img;
        this.eBus = eventBus;
        if (typeof locale === 'object') {
            this.locale = locale;
        }
        this.eBus.subscribe('Annotator:destroy', this.destroy, this);
    }

    Annotator.prototype.setRectHeightAndWidth = function setRectHeightAndWidth(
        defaultHeight, defaultWidth
    ) {
        this.rectDefaultHeight = defaultHeight;
        this.rectDefaultWidth = defaultWidth;
    };

    Annotator.prototype.annotate = function annotate(
        geometry, text, isAnnSaved, state
    ) {
        var id;

        assertAnnotatorRendered(this);
        id = addRect(
            geometry.x, geometry.y, geometry.width, geometry.height, text, this
        );

        this.selectedAnnotation = this.annotationBoxes[this.annotationBoxes.length - 1];
        invalidate(this);
        drawAnnotationBoxes(this);

        if (isAnnSaved === true) {
            this.selectedAnnotation.saved = true;
            this.selectedAnnotation.annotation.state = state;
        }
        else {
            this.selectedAnnotation.saved = false;
        }

        return id;
    };

    Annotator.prototype.setReadOnly = function setReadOnly(readonly) {
        var instance = this;

        if (readonly === true) {
            this.readonly = true;
            this.canvas.removeEventListener('mousedown', this.onMouseDown, false);
            this.canvas.removeEventListener('mouseup', this.onMouseUp, false);
            this.canvas.removeEventListener('selectstart', this.onSelectStart, false);
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('mouseenter', this.onMouseEnter, false);
            this.canvas.addEventListener('mouseleave', this.onMouseLeave, false);
            this.selectedAnnotation = null;
            invalidate(this);
            drawAnnotationBoxes(this);
            this.annotationBoxes.forEach(function eachBox(box) {
                box.setReadOnly(true);
                box.hideAnnotationEdit(instance);
            });
        }
        else {
            this.readonly = false;
            this.canvas.addEventListener('mousedown', this.onMouseDown, false);
            this.canvas.addEventListener('mouseup', this.onMouseUp, false);
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('mouseenter', this.onMouseEnter, false);
            this.canvas.addEventListener('mouseleave', this.onMouseLeave, false);
            this.canvas.addEventListener('selectstart', this.onSelectStart, false);
            if (this.annotationBoxes.length > 0) {
                this.selectedAnnotation = this.annotationBoxes[0];
            }
            invalidate(this);
            drawAnnotationBoxes(this);
            this.annotationBoxes.forEach(function eachBox(box) {
                box.setReadOnly(false);
                box.hideAnnotationEdit(instance);
            });
        }
    };

    Annotator.prototype.clearAnnotation = function clearAnnotation(annId) {
        var box, eventData, inst;

        assertAnnotatorRendered(this);
        inst = this.selectedAnnotation;
        box = getBoxWithId(annId, this);
        eventData = box.annotation.getData();
        box.annotation.destroy();
        box.opened = false;
        this.selectedAnnotation = inst;
        this.hasAnyOpenedBox = false;
        invalidate(this);
        drawAnnotationBoxes(this);

        this.eBus.publish('Ann:onRemove', eventData, this.image, this);
    };

    Annotator.prototype.updateAnnotationGeometry = function updateAnnGeometry(annId, geometry) {
        var box;

        assertAnnotatorRendered(this);
        box = getBoxWithId(annId, this);
        box.x = geometry.x;
        box.y = geometry.y;
        box.w = geometry.width;
        box.h = geometry.height;
        invalidate(this);

        this.eBus.publish(
            'Ann:onAnnotate', box.annotation.getData(), this.image, this
        );
    };

    Annotator.prototype.updateAnnotationText = function updateAnnotationText(annId, text) {
        var box;

        assertAnnotatorRendered(this);
        box = getBoxWithId(annId, this);
        box.annotation.setText(text);
        box.annotation.state = SAVED;
        box.saved = true;
        this.hasAnyOpenedBox = false;
        box.opened = false;
        hideAllText(this);
        this.eBus.publish(
            'Ann:onAnnotate', box.annotation.getData(), this.image, this
        );
    };

    Annotator.prototype.getAnnotations = function getAnnotations() {
        var i = 0,
            len = this.annotationBoxes.length,
            annotations = [], data;

        assertAnnotatorRendered(this);
        for (; i < len; i += 1) {
            data = this.annotationBoxes[i].annotation.getData();
            if (data.text !== '') {
                annotations.push(data);
            }
        }

        return annotations;
    };

    Annotator.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    Annotator.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    Annotator.prototype.render = function render() {
        var resizeRect,
            getComputedStyle = function getComputedStyle(elem, style, instance) {
                var value;

                if (instance.htmlDoc.defaultView &&
                    instance.htmlDoc.defaultView.getComputedStyle) {
                    value = instance.htmlDoc.defaultView.getComputedStyle(elem, null)[style];
                    value = parseInt(value, 10) || 0;
                }

                return value;
            },
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('annotation.rendered.already');
        }

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        wrapImageWithCanvas(this);

        // fixes mouse co-ordinate problems when there's a border or padding
        // see getMouse for more detail
        if (this.htmlDoc.defaultView && this.htmlDoc.defaultView.getComputedStyle) {
            this.stylePaddingLeft = getComputedStyle(this.canvas, 'paddingLeft', this);
            this.stylePaddingTop = getComputedStyle(this.canvas, 'paddingTop', this);
            this.styleBorderLeft = getComputedStyle(this.canvas, 'borderLeftWidth', this);
            this.styleBorderTop = getComputedStyle(this.canvas, 'borderTopWidth', this);
        }

        resizeRect = new Box(this);
        this.selectionHandles.push(resizeRect);
        this.isRendered = true;
        this.eBus.publish('Ann:onRender', this.image, this);
    };

    Annotator.prototype.setAnnoationId = function setAnnoationId(id) {
        this.id = id;
    };

    Annotator.prototype.setAnnoationType = function setAnnoationType(type) {
        if (Helper.isString(type) === false) {
            throw new Error('annotator.type.not.string');
        }
        this.type = type;
    };

    Annotator.prototype.destroy = function destroy() {
        var eb = this.eBus,
            img = this.image,
            parentNode;

        assertAnnotatorRendered(this);
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
        this.annotationBoxes.forEach(function eachBox(box) {
            box.annotation.destroy();
        });

        parentNode = this.canvasContainer.parentNode;
        parentNode.insertBefore(this.image, this.canvasContainer);
        this.canvas.removeEventListener('mousedown', this.onMouseDown, false);
        this.canvas.removeEventListener('mouseup', this.onMouseUp, false);
        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
        this.canvas.removeEventListener('mouseenter', this.onMouseEnter, false);
        this.canvas.removeEventListener('mouseleave', this.onMouseLeave, false);
        this.canvas.removeEventListener('selectstart', this.onSelectStart, false);
        parentNode.removeChild(this.canvasContainer);
        eb.unsubscribe('Annotator:destroy', this.destroy);
        eb.publish('Ann:onDestroy', img);
        initializeVariables(this);
    };

    // Static Method
    Annotator.removeWrapper = function removeWrapper(node) {
        var canvasContainer, parentNode, image, len,
            i = 0, annotateContainers;

        annotateContainers = node.querySelectorAll('.annotator-container');
        len = annotateContainers.length;
        for (; i < len; i += 1) {
            canvasContainer = annotateContainers[i];
            parentNode = canvasContainer.parentNode;
            image = canvasContainer.querySelector('img');
            parentNode.insertBefore(image, canvasContainer);
            parentNode.removeChild(canvasContainer);
        }

        return node;
    };

    return Annotator;
});

define(['scripts/Helper', 'scripts/Util', 'scripts/SelectBox', 'scripts/ConfigReader'],
function editSummaryLoader(Helper, Util, SelectBox, Config) {
    var currentActorType, locale,
        tooltipClass = 'hint--bottom',
        replaceClasses = ['optreplace', 'pc_cpereplace'],
        rejectClass = 'optreject',
        comntxtClass = 'comntText',
        commentClass = 'optcomment',
        template = [
            '<ol class="edit-summary"></ol>'
        ],
        attachmentFileTemplate = [
            '<ol class="file-list"></ol>'
        ],
        categoryDropdownTemplate = [
            '<div class="select-box-container">',
                '<div class="category-select-box"></div>',
            '</div>'
        ],
        categoriesOptions = [
            {
                'id': 'all',
                'text': 'All'
            },
            {
                'id': 'edits',
                'text': 'Edits'
            },
            {
                'id': 'instruction',
                'text': 'Instructions'
            },
            {
                'id': 'figure',
                'text': 'Figures'
            },
            {
                'id': 'equation',
                'text': 'Equations'
            }
        ],
        instructTemplate = [
            '<div class="editlog-instruction-wrapper">',
    			'<div class="editlog-instruction-wrapperinner">',
    				'<ul class="instructionPointNote"></ul>',
    			'</div>',
				
				'<div class="instruction-sucess-alert insertSuccessAlert">',
					'<p class="successAlertMsg">Instruction added successfully</p>',
				'</div>',
            '</div>'
        ],


        saAffiliationSelector = Util.getSelector('saAffiliation'),
        ceAffiliationSelector = Util.getSelector('ceAffiliation'),
        saAffiliationClass = Util.selectorToClass('saAffiliation'),
        figureSelector = Util.getSelector('figure'),
        figureClass = Util.selectorToClass('figure'),
        equationClass = Util.selectorToClass('equation'),
        inlineEquationClass = Util.selectorToClass('inlineFormula'),
        inlineFigureSelector = Util.getSelector('inlineFigure'),
        inlineFigureClass = Util.selectorToClass('inlineFigure'),
        labelSelector = Util.getSelector('label'),
        tableCaptionClass = Util.selectorToClass('tableCaption'),
        biographyClass = Util.selectorToClass('biography'),
        orcResIdSelector = Util.selectorToClass('researchGroup'),
        categories = {
            'instruction': ['optcomment'],
            'edits': ['optbold', 'optitalic', 'optsup', 'optsub', 'optinsert',
                'optdel', 'optreject', 'pc_cpereplace', 'optreplace', 'optdelreference',
                'optsmallcaps', 'optmono'
            ],
            'figure': [figureClass, inlineFigureClass],
            'equation': [equationClass]
        },
        generalAttachmentEditLogTemplate = [
            '<span class="attachment"></span>',
            '<span class="general-attach" data-name="generalAttach"></span>'
        ],
        elementSync = false;

    function initializeVariables(instance) {
        instance.container = null;
        instance.win = null;
        instance.eBus = null;
        instance.clickFn = null;
        instance.element = null;
        instance.htmlDoc = null;
        instance.emptyMsg = null;
        instance.categorySelectBox = null;
        currentActorType = 'au';
        instance.selectBoxName = 'edit-summary-categories';
        instance.filterElement = null;
        instance.enableCategoryFilter = false;
        locale = Config.getLocale();
        instance.articleContainer = null;
        instance.syncElementContainer = null;
        instance.instructContainer = false;
    }

    function getCategory(node) {
        var i, category, categoryArray, categoryLength,
            nodeClassList = node.classList;

        for (category in categories) {
            if (categories.hasOwnProperty(category) === true) {
                categoryArray = categories[category];
                categoryLength = categoryArray.length;
                for (i = 0; i < categoryLength; i += 1) {
                    if (nodeClassList.contains(categoryArray[i]) === true) {
                        return category;
                    }
                }
            }
        }
        return null;
    }

    function getTabName(targetNode) {
        var parent = targetNode.parentNode;

        while (parent.nodeName.toLowerCase() !== 'div') {
            if (parent.tagName.toLowerCase() === 'li' &&
                parent.hasAttribute('data-tab') === true) {
                return parent.getAttribute('data-tab');
            }
            parent = parent.parentNode;
        }
        return null;
    }

    function onClick(event) {
        var targetNode = event.target,
            targetName = targetNode.dataset.name,
            targetTagName = targetNode.tagName.toLowerCase();

        if (
            (Helper.isUndefined(targetName) === true) &&
            (targetNode.className === 'instruct-icon')
        ) {
            while (Helper.isNull(targetNode) === false &&
                targetNode.className !== 'optcomment') {
                targetNode = targetNode.parentNode;
                if (Helper.isNull(targetNode) === true) {
                    return;
                }
                targetNode = targetNode.querySelector('.optcomment');
            }

            targetName = targetNode.dataset.name;
            targetTagName = targetNode.tagName.toLowerCase();
        }

        if (
            targetTagName === 'li' ||
            (targetTagName === 'ol' &&
              targetNode.classList.contains('edit-summary')
            ) ||
            (targetNode.classList.contains('edit-summary-instruct') === true &&
              targetNode.classList.contains('empty') === true
            ) ||
            (targetNode.classList.contains('edit-summary-copy-editor') === true &&
              targetNode.classList.contains('empty') === true
            ) ||
            (targetNode.classList.contains('edit-summary-author') === true &&
              targetNode.classList.contains('empty') === true
            ) ||
            targetNode.classList.contains('empty-msg') === true
        ) {
            return;
        }

        if (Helper.isUndefined(targetNode.parentNode) === false) {
            while (targetNode.parentNode !== document && targetNode.parentNode.tagName.toLowerCase() !== 'li') {
                targetNode = targetNode.parentNode;
                targetTagName = targetNode.tagName.toLowerCase();
                targetName = targetNode.dataset.name;
            }
        }

        if (Helper.isString(targetName) === false) {
            targetName = targetNode.getAttribute('name');  // For CE tags
        }
        if (Helper.isString(targetName) === false) {
            return;
        }
        if (targetName === 'generalAttach' && targetNode.dataset.name === 'generalAttach') {
            this.eBus.publish('GeneralAttachmentPanel:Show');
        }
        if (getTabName(targetNode) === 'supplementary') {
            this.eBus.publish(
                'Supplementary:ScrollTo', targetTagName, targetName, 'edit-summary'
            );
        }
        else {
            this.eBus.publish(
                'Editor:ScrollTo', targetTagName, targetName, 'edit-summary'
            );
        }
    }

    function removeTooltip(element) {
        var nodeClass,
            i = 0,
            nodeList = element.querySelectorAll('.' + tooltipClass);

        for (; i < nodeList.length; i += 1) {
            nodeClass = nodeList[i].classList;
            nodeList[i].removeAttribute('data-hint');
            nodeClass.remove(tooltipClass);
        }
    }

    function convertLeadingAndTrailingSpaces(node, doc) {
        var text, charCode, spaceText,
            treeWalker = doc.createTreeWalker(
                node, NodeFilter.SHOW_ALL, null, false
            ),
            counter = 0,
            replaceLeadingSpaceInNode = null,
            replaceTrailingSpaceInNode = null,
            hasTextNodeAsLastChild = false;

        while (treeWalker.nextNode() !== null) {
            if (
                counter === 0 &&
                treeWalker.currentNode.nodeType === Node.TEXT_NODE
            ) {
                replaceLeadingSpaceInNode = treeWalker.currentNode;
            }
            if (treeWalker.currentNode.nodeType === Node.TEXT_NODE) {
                hasTextNodeAsLastChild = true;
                replaceTrailingSpaceInNode = treeWalker.currentNode;
            }
            else {
                hasTextNodeAsLastChild = false;
                replaceTrailingSpaceInNode = null;
            }
            counter += 1;
        }

        if (replaceLeadingSpaceInNode !== null) {
            text = replaceLeadingSpaceInNode.nodeValue;
            charCode = text.charCodeAt(0);
            if (charCode === 160 || charCode === 32) {
                replaceLeadingSpaceInNode.nodeValue = '[SPACE]' + text.slice(1);
            }
        }

        if (
            hasTextNodeAsLastChild === true &&
            replaceTrailingSpaceInNode !== null
        ) {
            text = replaceTrailingSpaceInNode.nodeValue;
            charCode = text.charCodeAt(text.length - 1);
            if (charCode === 160 || charCode === 32) {
                spaceText = text.slice(0, text.length - 1) + '[SPACE]';
                replaceTrailingSpaceInNode.nodeValue = spaceText;
            }
        }
    }

    function convertHyphens(node) {
        var child, text;

        if (node.hasChildNodes()) {
            child = node.firstChild;
            while (child !== null) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    convertHyphens(child);
                }
                else if (child.nodeType === Node.TEXT_NODE) {
                    text = child.nodeValue;
                    text = text.replace(/\-/g, '[HYPHEN]');
                    child.nodeValue = text;
                }
                child = child.nextSibling;
            }
        }
    }

    function addMathItem(
        doc, eqnVersionOne, eqnVersionLast, nameAttr
    ) {
        var item = doc.createElement('li'),
            span = doc.createElement('span'),
            img1 = doc.createElement('img'),
            img2 = doc.createElement('img'),
            strike = doc.createElement('span');

        item.appendChild(span);
        span.dataset.name = nameAttr;
        strike.classList.add('line-through');
        strike.appendChild(img1);
        span.appendChild(strike);
        span.appendChild(img2);
        img1.dataset.name = nameAttr;
        img2.dataset.name = nameAttr;
        img1.src = eqnVersionOne.innerHTML;
        img2.src = eqnVersionLast.innerHTML;
        item.classList.add('equation');
        return item;
    }

    function addImageAnnotationItem(
        container, doc, node, label, nameAttr, annotationMap, isMathAnnotation,
        tabName
    ) {
        var item, span, anns;

        if (Helper.isUndefined(annotationMap[nameAttr]) === true) {
            return;
        }
        anns = annotationMap[nameAttr];
        anns.forEach(function loop(ann) {
            item = doc.createElement('li');
            span = doc.createElement('span');
            item.appendChild(span);
            span.dataset.name = nameAttr;
            if (label !== null) {
                span.appendChild(label.cloneNode(true));
                span.appendChild(doc.createTextNode(' - '));
            }
            span.appendChild(doc.createTextNode(ann.text));
            if (isMathAnnotation === true) {
                item.classList.add('equation');
            }
            else {
                item.classList.add('figure');
            }
            item.dataset.tab = tabName;
            container.appendChild(item);
        });
    }

    function addAttachedFiles(doc, dataName, attachments, isReplaceImage) {
        var tempElement, file, url, i, attachmentData, attachmentElement;

        tempElement = doc.createElement('span');
        tempElement.innerHTML = attachmentFileTemplate.join('');
        attachmentElement = tempElement.firstChild;
        tempElement = null;
        attachmentData = attachments[dataName];
        if (isReplaceImage === true) {
            attachmentData = attachments;
        }
        for (i = 0; i < attachmentData.length; i += 1) {
            file = doc.createElement('li');
            url = doc.createElement('a');
            url.setAttribute('target', '_blank');
            url.href = attachmentData[i].url;
            url.innerHTML = attachmentData[i].name;
            file.appendChild(url);
            attachmentElement.appendChild(file);
        }
        return attachmentElement;
    }

    function addReplaceImageInstructions(
        container, doc, node, label, nameAttr, replaceImageMetaData, tabName
    ) {
        var replaceImage, item, span, fileElement, attachment;

        if (Helper.isUndefined(replaceImageMetaData) === true ||
            Helper.isUndefined(replaceImageMetaData[nameAttr]) === true) {
            return;
        }
        replaceImage = replaceImageMetaData[nameAttr];
        item = doc.createElement('li');
        span = doc.createElement('span');
        item.appendChild(span);
        span.dataset.name = nameAttr;
        span.appendChild(label.cloneNode(true));
        attachment = doc.createElement('span');
        attachment.classList.add('attachment');
        span.appendChild(attachment);
        span.appendChild(doc.createTextNode(' - '));
        span.appendChild(doc.createTextNode(replaceImage.instruction));
        item.classList.add('figure');
        item.dataset.tab = tabName;

        if (Helper.isUndefined(replaceImage.attachments) === false) {
            fileElement = addAttachedFiles(
                doc, nameAttr, replaceImage.attachments, true
            );
            item.appendChild(fileElement);
        }

        container.appendChild(item);
    }

    function addEditSummaryItem(
        doc, node, optError, attachments
    ) {
        var item = doc.createElement('li'),
            txtNode, errorTag, attachmentTag, fileElement,
            commentIconTag,
            dataName = node.dataset.name,
            categoryName = getCategory(node);

        convertLeadingAndTrailingSpaces(node, doc);
        convertHyphens(node);
        if (node.classList.contains(rejectClass) === true) {
            txtNode = doc.createTextNode('Rejected: ');
            node.insertBefore(txtNode, node.firstChild);
        }

        if (optError.indexOf(dataName) !== -1) {
            errorTag = doc.createElement('span');
            errorTag.classList.add('error');
            errorTag.innerHTML = 'Error';
            item.appendChild(errorTag);
        }

        if (node.classList.contains(commentClass) === true) {
            commentIconTag = doc.createElement('span');
            commentIconTag.classList.add('instruct-icon');
            item.appendChild(commentIconTag);
        }

        if (Helper.isUndefined(attachments) === false &&
            attachments.hasOwnProperty(dataName) === true) {
            attachmentTag = doc.createElement('span');
            attachmentTag.classList.add('attachment');
            item.appendChild(attachmentTag);
        }

        item.appendChild(node);

        if (Helper.isNull(categoryName) === false) {
            item.classList.add(categoryName);
        }

        if (node.classList.contains(commentClass) === true) {
            item.appendChild(node);
        }

        removeTooltip(item);
        if (Helper.isUndefined(attachments) === false &&
            attachments.hasOwnProperty(dataName) === true) {
            fileElement = addAttachedFiles(doc, dataName, attachments, false);
            item.appendChild(fileElement);
        }
        return item;
    }

    function addGeneralAttachItem(doc, generalAttachments) {
        var textElem, len, text,
            item = null;

        if (Helper.isNull(generalAttachments.attachments) === true ||
            Helper.isUndefined(generalAttachments.attachments) === true) {
            return;
        }
        len = generalAttachments.attachments.length;
        if (len > 0) {
            item = doc.createElement('li');
            item.dataset.tab = 'supplementary';
            item.classList.add('instruction');
            item.innerHTML = generalAttachmentEditLogTemplate.join('');
            textElem = item.querySelector('.general-attach');
            text = generalAttachments.instruction.generalInstruction;
            textElem.innerHTML = '- ' + text;
        }
        return item;
    }

    //FIX the ce_labels in the edit summary split
    function checkLabel(figureLabel) {
        var len = figureLabel.length,
            i = 0,
            text = '',
            removeCommentText = function removeCommentTextFn(labelNode) {
                var commentTextNode = labelNode.querySelector('.' + comntxtClass);

                if (Helper.isNull(commentTextNode) === false) {
                    commentTextNode.parentNode.removeChild(commentTextNode);
                }
            };

        for (; i < len; i += 1) {
            removeCommentText(figureLabel[i]);
            text += figureLabel[i].textContent;
        }
        if (len <= 0) {
            text = 'Img';
        }
        return text;
    }

    function setFilterValue(options, selectBoxObj) {
        var elementClassList = this.element.classList;

        categoriesOptions.forEach(function categoriesOptionsFn(option) {
            elementClassList.remove(option.id);
        });
        elementClassList.add(selectBoxObj.getValue());
    }

    function setTopPosition(instance) {
        var filterStyle;

        if (instance.enableCategoryFilter === true) {
            filterStyle = getComputedStyle(instance.filterElement);
            instance.container.parentNode.style.paddingTop = filterStyle.height;
        }
    }

    function editSummary(editSummaryContainer, eventBus, win, doc) {
        var actorType;

        if (editSummaryContainer instanceof win.HTMLElement === false) {
            throw new Error('error.editsummary.container.missing');
        }
        initializeVariables(this);
        this.container = editSummaryContainer;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.clickFn = onClick.bind(this);
        this.container.addEventListener('click', this.clickFn, false);
        actorType = Helper.getUrlParams('type');
        if (Helper.isEmptyString(actorType) === false) {
            currentActorType = actorType;
        }
    }

    editSummary.prototype.setEnableFilter = function setEnableFilterfn(
        enable, name
    ) {
        if (enable === true && Helper.isString(name) === true) {
            this.enableCategoryFilter = true;
            this.selectBoxName = name;
        }
        else {
            this.enableCategoryFilter = false;
        }
    };

    editSummary.prototype.render = function render() {
        var tempWrapper,
            instance = this;

        tempWrapper = this.htmlDoc.createElement('span');
        instructWrapper = this.htmlDoc.createElement('span');

        if (this.enableCategoryFilter === true) {
            tempWrapper.innerHTML = categoryDropdownTemplate.join('');
            this.filterElement = tempWrapper.firstChild;
            this.container.appendChild(this.filterElement);
            this.categorySelectBox = new SelectBox(
                this.filterElement.firstChild, this.htmlDoc, this.win,
                this.eBus, this.selectBoxName, locale
            );
            this.categorySelectBox.renderComponentStyle();
            this.categorySelectBox.render();
            categoriesOptions.forEach(function categoriesOptionsFn(option) {
                instance.categorySelectBox.addOption(option.text, option.id);
            });
            this.categorySelectBox.setValue('all');
            this.eBus.subscribe(
                'SelectBox:' + this.selectBoxName + ':OnChange',
                setFilterValue.bind(this)
            );
        }

        tempWrapper.innerHTML = template.join('');
        instructWrapper.innerHTML =instructTemplate.join(""); 
        
        this.element = tempWrapper.firstChild;  
        this.container.appendChild(this.element);
        
        //Add instruction
        if(this.container.classList.contains("edit-summary-instruct")){
            this.container.appendChild(instructWrapper.firstChild);
            $('.edit-summary-instruct').children()[0].remove();    
        }
        setTopPosition(this);
    };

    editSummary.prototype.clear = function clear() {
        this.element.innerHTML = '';
    };

    function isAffiliation(node) {
        var parent = node.parentNode,
            saAffiliationNode, ceAffiliationNode;

        while (
            parent.nodeName.toLowerCase() !== 'div'
        ) {
            parent = parent.parentNode;
        }
        if (
            parent.classList !== null &&
            parent.classList.contains(saAffiliationClass) === true
        ) {
            return true;
        }

        saAffiliationNode = node.querySelector(saAffiliationSelector);
        ceAffiliationNode = node.querySelector(ceAffiliationSelector);
        if (Helper.isNull(saAffiliationNode) === false &&
            Helper.isNull(ceAffiliationNode) === false
        ) {
            return false;
        }
        else if (Helper.isNull(saAffiliationNode) === false) {
            return true;
        }
        return false;
    }

    function isResearchGroup(node, selector) {
        var parent = node.parentNode;

        while (
            parent.nodeName.toLowerCase() !== 'div'
        ) {
            parent = parent.parentNode;
            if (parent.classList.contains(selector) === true) {
                return true;
            }
        }
        return false;
    }

    function checkEmptyEditSummaryTab(instance) {
        var editSummaryListNode = instance.element,
            emptyMsgNode = instance.container.querySelector('.empty-msg'),
            nodeClassList = instance.container.classList;

        if (emptyMsgNode !== null) {
            emptyMsgNode.parentNode.removeChild(emptyMsgNode);
        }
        nodeClassList.remove('empty');
        if (editSummaryListNode.hasChildNodes() === false &&
           editSummaryListNode.childNodes.length === 0) {
            emptyMsgNode = instance.htmlDoc.createElement('span');
            emptyMsgNode.classList.add('empty-msg');
            emptyMsgNode.innerHTML = instance.emptyMsg;
            nodeClassList.add('empty');
            instance.container.appendChild(emptyMsgNode);
        }
    }

    editSummary.prototype.add = function add(
        nodeList, annotationMap, optError, attachments, attachmentsMetaData,
        tabName, replaceImageMetaData
    ) {
        var node, i = 0,
            len = nodeList.length,
            classList, img, label, nameAttr,
            currVersion, eqnCurrVersion, eqnVersionOne,
            eqnVersionLast, editable, parentElementClass,
            parentNode, innerFigure, childs, imageDataId,
            figureLabel, isMathAnnotation = false,
            item, hasResearchGroup = false;

        if (nodeList instanceof this.win.NodeList === false) {
            throw new Error('error.edit.summary.node.list.empty');
        }
        if (
            Helper.isNull(attachmentsMetaData) === false &&
            Helper.isUndefined(attachmentsMetaData) === false
        ) {
            item = addGeneralAttachItem(
                this.htmlDoc, attachmentsMetaData
            );
            if (Helper.isNull(item) === false) {
                this.element.appendChild(item);
            }
        }
        for (; i < len; i += 1) {
            if (currentActorType.toLowerCase() === 'au' ||
                currentActorType.toLowerCase() === 'ed') {
                if (isAffiliation(nodeList[i]) === true) {
                    continue;
                }
            }
            node = nodeList[i].cloneNode(true);
            classList = node.classList;
            editable = node.getAttribute('editable');
            if ((classList.contains(equationClass) === true ||
                classList.contains(inlineEquationClass) === true) &&
                editable === 'true'
            ) {
                currVersion = node.querySelector('.current_version');
                if (currVersion === null) {
                    continue;
                }
                eqnCurrVersion = currVersion.innerHTML;
                eqnCurrVersion = eqnCurrVersion.replace(/^\s+|\s+$/, '');
                eqnCurrVersion = parseInt(eqnCurrVersion, 10);

                if (eqnCurrVersion > 1) {
                    nameAttr = node.getAttribute('name');
                    eqnVersionOne = node.querySelector(
                        'span[version="0"] .image'
                    );
                    eqnVersionLast = node.querySelector(
                        'span[version="' + eqnCurrVersion + '"] .image'
                    );
                    item = addMathItem(
                        this.htmlDoc, eqnVersionOne, eqnVersionLast, nameAttr
                    );
                    item.dataset.tab = tabName;
                    this.element.appendChild(item);
                }
                continue;
            }

            if (classList.contains(figureClass) === true ||
                classList.contains(biographyClass) === true ||
                classList.contains(inlineFigureClass) === true ||
                classList.contains(equationClass) === true ||
                classList.contains(inlineEquationClass) === true ||
                classList.contains(tableCaptionClass) === true
            ) {
                childs = node.querySelector(inlineFigureSelector);
                if (classList.contains(tableCaptionClass) === true &&
                    childs instanceof this.win.HTMLElement === true) {
                    continue;
                }

                nameAttr = node.getAttribute('name');
                img = node.querySelector('img');
                innerFigure = node.querySelector(figureSelector);
                if (img === null || Helper.isUndefined(nameAttr) === true ||
                    innerFigure instanceof this.win.HTMLElement === true) {
                    continue;
                }
                imageDataId = img.dataset.id;
                if (Helper.isUndefined(imageDataId) === false &&
                    nameAttr !== imageDataId
                ) {
                    nameAttr = imageDataId;
                }

                label = this.htmlDoc.createElement('span');
                if (classList.contains(equationClass) === true ||
                    classList.contains(inlineEquationClass) === true) {
                    label.innerHTML = 'Eqn';
                    isMathAnnotation = true;
                }
                else {
                    figureLabel = node.querySelectorAll(labelSelector);
                    label.innerHTML = checkLabel(figureLabel);
                }
                addImageAnnotationItem(
                    this.element, this.htmlDoc, img,
                    label, nameAttr, annotationMap, isMathAnnotation, tabName
                );
                addReplaceImageInstructions(
                    this.element, this.htmlDoc, img, label, nameAttr,
                    replaceImageMetaData, tabName
                );
                isMathAnnotation = false;
                continue;
            }
            parentNode = nodeList[i].parentNode;
            if (parentNode.tagName.toLowerCase() === 'span') {
                parentElementClass = parentNode.classList;
                if (parentElementClass.contains(replaceClasses[0]) === true ||
                    parentElementClass.contains(replaceClasses[1]) === true ||
                    parentElementClass.contains(rejectClass) === true
                ) {
                    continue;
                }
            }
            if (node.hasChildNodes() === false) {
                continue;
            }
            if (elementSync === true &&
                tabName === 'supplementary' &&
                this.syncElementContainer.contains(nodeList[i]) === true) {
                continue;
            }
            if (elementSync === true &&
                this.articleContainer.contains(nodeList[i]) === true) {
                hasResearchGroup = isResearchGroup(nodeList[i], orcResIdSelector);
            }
            item = addEditSummaryItem(this.htmlDoc, node, optError, attachments);
            item.dataset.tab = tabName;
            if (hasResearchGroup === true) {
                item.dataset.tab = 'supplementary';
            }
            this.element.appendChild(item);
            hasResearchGroup = false;
        }

        checkEmptyEditSummaryTab(this);
    };

    editSummary.prototype.setEmptyMessage = function setEmptyMessage(msg) {
        if (Helper.isString(msg) === true) {
            this.emptyMsg = msg;
        }
    };

    editSummary.prototype.destroy = function destroy() {
        this.container.removeEventListener('click', this.clickFn, false);
        initializeVariables(this);
    };

    editSummary.prototype.setSyncElementsCont = function setSyncElementsCont(
        articleContainer, syncElementContainer
    ) {
        if (articleContainer instanceof this.win.HTMLElement === false ||
            syncElementContainer instanceof this.win.HTMLElement === false
        ) {
            throw new Error('error.sync.elements.nodes');
        }
        this.articleContainer = articleContainer;
        this.syncElementContainer = syncElementContainer;
        elementSync = true;
    };

    return editSummary;
});

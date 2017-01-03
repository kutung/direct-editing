define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/RequestBuilder',
    'scripts/Panel', 'scripts/ConfigReader', 'scripts/Util', 'scripts/Sanitizer',
    'scripts/Dom2Xml', 'scripts/ErrorHandler'
], function ReplaceImagePanelLoader(
    Helper, RTE, RequestBuilder, Panel, Config, Util, Sanitizer, Dom2Xml,
    ErrorHandler
) {
    var instructTemplate, saveErrorMessage, saveSuccessMessage, placeholderMessage,
        errorHandler, saveErrorReloadMessage, cssRules;

    instructTemplate = [
        '<div class="pc-replace">',
            '<div class="info"></div>',
            '<div class="file-upload-container">',
                '<h5>Attach</h5>',
                '<span class="optional">(optional)</span>',
                '<div class="info">Limit upto <span class="file-upload-limit">20MB</span>/file</div>',
                '<form class="replace-file-form">',
                    '<input type="file" class="replace-file">',
                '</form>',
            '</div>',
            '<ul class="replace-file-list"></ul>',
            '<div class="instruction"></div>',
            '<div class="buttons-container">',
            '</div>',
        '</div>'
    ];
    var imagePlaceHolder = [
        '<div id="" name="" class="figure new-fig-nav highResImageView imagePlaceholder">',
        '<div class="image-placeholder">',
        '<span class="cam-icon"></span>',
        '<h1>Replacement image received</h1>',
        '</div></div>'
    ], 
    replaceImagetemplate = [
        '<div id="" name="" class="figure new-fig-nav highResImageView">',
        '<div class="wrapper" name="" id="">',
        '<span class="container-image" name="">',
          '<span class="paper-annotations-counts">',
                '<i class="annotation-number-count">10</i>',
          '</span>',
          '<img src="https://s3.amazonaws.com/pgc-dev-test/pgqa/proofs/elsevier/BAE/7463/images/gr1.png" class="imgrsize" width="311px" height="329px" data-id="" data-original-web-src="">',
          '</span>',
    '</div>',
    '<div class="figcaption" name="" id="">',
       '<span class="ce_label" name="">Fig.1</span>',
        '<span class="ce_caption" id="" name=""></span>',
    '</div>',
    '<div class="ce_keywords" name="" id=""></div>',
    '<ul class="figureEditor" style="display: none"><li><button class="expand-icon" title="Click to view the high resolution image" data-web-image-path=""></button></li><li><button class="replace-icon" title="Click to replace the image" data-image-reference-id=""></button></li></ul>',
    '</div>'
    ];
    cssRules = {
        '.replaceImage-container': {
            'display': 'none'
        },

        '.Replace-Image .replaceImage-container': {
            'display': 'block'
        },

        '.replaceImage-container .panel .panel-header .text': {
            'font-size': '0.917em',
            'font-weight': 'normal'
        },

        '.replaceImage-container .panel .panel-content': {
            'padding': '0'
        },

        '.replaceImage-container .panel .panel-header .icon': {
            'background': '#b5b5b5 url(/images/hand.svg) center center no-repeat'
        },

        '.replaceImage-container .panel.open .panel-header .icon': {
            'background': '#2d2d2d url("/images/hand-open.svg") center center no-repeat'
        },

        '.pc-replace': {
            'padding': '0.833em',
            'font': '1em "Helvetica Neue",Helvetica,Arial,sans-serif'
        },

        '.pc-replace h3': {
            'font-size': '1.167em',
            'height': '2.5em',
            'background-color': '#888',
            'color': '#fff',
            'padding': '0.833em 0 0 0.833em',
            'display': 'none'
        },

        '.pc-replace .info': {
            'margin': '0 0 0.833em 0',
            'color': '#DA9257',
            'font': '1em "Lucida Grande", calibri'
        },

        '.pc-replace .instruction': {
            'margin': '0 0 0.833em 0'
        },

        '.pc-replace .file-upload-container h5, .pc-replace ul.replace-file-list li.no-files': {
            'font-size': '1em',
            'font-weight': 'bold',
            'color': '#2883D6',
            'margin': '0'
        },

        '.pc-replace .file-upload-container .optional': {
            'font-size': '1em',
            'color': '#2883D6',
            'margin': '0.333em'
        },

        '.pc-replace .file-upload-container .optional.hide': {
            'display': 'none'
        },

        '.pc-replace .file-upload-container h5': {
            'display': 'inline'
        },

        '.pc-replace .file-upload-container .info': {
            'float': 'right'
        },

        '.pc-replace .replace-file-form.disable': {
            'opacity': '0.5'
        },

        '.pc-replace .replace-file-form': {
            'opacity': '1',
            'font-size': '1em',
            'padding': '0.833em 0 0 0'
        },

        '.pc-replace .replace-file': {
            'margin-bottom': '0.833em',
            'border': '0.083em solid #bfbcbf',
            'width': '100%'
        },

        '.pc-replace ul.replace-file-list': {
            'list-style': 'none',
            'padding': '0',
            'margin': '0'
        },

        '.pc-replace ul.replace-file-list li': {
            'position': 'relative'
        },

        '.pc-replace ul.replace-file-list li .filename': {
            'display': 'inline-block',
            'width': '11em',
            'overflow': 'hidden',
            'white-space': 'nowrap',
            'text-overflow': 'ellipsis'
        },

        '.pc-replace ul.replace-file-list li .size': {
            'vertical-align': 'top'
        },

        '.pc-replace ul.replace-file-list .delete': {
            'position': 'absolute',
            'top': '0',
            'right': '0',
            'cursor': 'pointer',
            'opacity': '1',
            'color': 'red'
        },

        '.highResImageView .container-image.imagereplaced': {
            'border-color': 'red'
        }
    };

    function createUploadedFileElement(instance, name, url, fileId, size) {
        var elem = instance.htmlDoc.createElement('li'),
            anchor = instance.htmlDoc.createElement('a'),
            delFile = instance.htmlDoc.createElement('a'),
            sizeWrapper = instance.htmlDoc.createElement('span');

        if (Helper.isString(url) === false) {
            throw new Error('instruction.uploaded.file.url.must.be.string');
        }
        if (Helper.isString(name) === false) {
            throw new Error('instruction.uploaded.file.name.must.be.string');
        }
        if (Helper.isEmptyString(url) === true) {
            throw new Error('instruction.uploaded.file.url.cannot.be.empty');
        }
        if (Helper.isEmptyString(name) === true) {
            throw new Error('instruction.uploaded.file.name.cannot.be.empty');
        }
        if (Helper.isEmptyString(size) === true) {
            throw new Error('instruction.uploaded.file.size.cannot.be.empty');
        }
        if (isNaN(size) === true) {
            throw new Error('instruction.uploaded.file.size.should.be.number');
        }
        size = Helper.formatBytes(size, 2);
        anchor.setAttribute('href', url);
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('title', name);
        anchor.classList.add('filename');
        anchor.appendChild(instance.htmlDoc.createTextNode(name));
        delFile.classList.add('delete');
        delFile.dataset.id = fileId;
        delFile.appendChild(instance.htmlDoc.createTextNode('x'));
        delFile.setAttribute('title', 'Delete');
        elem.appendChild(anchor);
        sizeWrapper.appendChild(instance.htmlDoc.createTextNode(' [' + size + ']'));
        sizeWrapper.classList.add('size');
        elem.appendChild(sizeWrapper);
        elem.appendChild(delFile);

        return elem;
    }

    function initializeVariables(instance) {
        instance.rteContainer = null;
        instance.eBus = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.uploadFileWhiteList = null;
        instance.maxUploadFileSize = null;
        instance.replaceImageContainer = null;
        instance.s3UploadFormData = null;
        instance.s3UploadEnable = false;
        instance.rte = null;
        instance.uploadUri = null;
        instance.fileInput = null;
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.formSubmitFn = null;
        instance.uploadForm = null;
        instance.uploadedFileListContainer = null;
        instance.requestBuilder = null;
        instance.requestFragment = null;
        instance.requestContext = null;
        instance.replaceImageId = null;
        instance.replaceImageMetaData = null;
        instance.panel = null;
        instance.fileUploadLimit = null;
        instance.uploadValidate = null;
        instance.attachmentsHeader = null;
        instance.attachmentsOptional = null;
        instance.saveFlag = false;
        instance.clearFlag = false;
        instance.saveInprogress = false;
        instance.instructCommand = null;
        instance.hasContentChange = false;
        instance.hasAttachmentChange = false;
        instance.content = null;
        instance.imageId = null;
        instance.stylesheetId = 'replaceimagepanel-style';
    }

    function resetFlag(instance) {
        instance.saveFlag = false;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('instruction.not.rendered');
        }
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function checkChanges(data) {
        data = data.replace(/ /, '&nbsp');
        if (this.content !== data) {
            this.hasContentChange = true;
        }
        if (Helper.isEmptyString(this.fileInput.value) === false) {
            this.hasAttachmentChange = true;
        }
    }

    function removeFileList(instance) {
        var fileListCont = instance.uploadedFileListContainer;

        Helper.emptyNode(fileListCont);
    }

    function resetAttachHeader(instance) {
        instance.attachmentsHeader.innerHTML = 'Attach';
        instance.attachmentsOptional.classList.remove('hide');
    }

    function clearForm(instance) {
        instance.rte.clear();
        instance.fileInput.value = '';
        removeFileList(instance);
        resetAttachHeader(instance);
    }

    function enableForm(instance) {
        instance.rte.setEditable();
        instance.focusOnInstruction();
        instance.fileInput.disabled = false;
        instance.uploadForm.classList.remove('disable');
    }

    function disableForm(instance) {
        instance.rte.setReadOnly();
        instance.fileInput.disabled = true;
        instance.uploadForm.classList.add('disable');
    }

    function cancelFormSubmit(evt) {
        evt.preventDefault();
    }

    function uploadSuccess(responseText) {
        var responseData = JSON.parse(responseText),
            replaceImageMetaData = this.replaceImageMetaData[this.imageId],
            newFileData = {}, length;

        if (Helper.isObject(replaceImageMetaData) === false) {
            this.replaceImageMetaData[this.imageId] = {};
            this.replaceImageMetaData[this.imageId].attachments = [];
        }
        if (Helper.isUndefined(responseData.data.fileName) === false) {
            newFileData.id = responseData.data.uuid;
            newFileData.name = responseData.data.fileName;
            newFileData.url = responseData.data.downloadUrl;
            newFileData.size = responseData.data.size;
            this.replaceImageMetaData[this.imageId].attachments.push(newFileData);
            length = this.replaceImageMetaData[this.imageId].attachments.length;
            this.addUploadedFile(
                newFileData.name, newFileData.url, newFileData.id,
                newFileData.size
            );
            if (length === 1) {
                this.eBus.publish('Delete:AnnotationForImage', this.imageNode);
                this.eBus.publish('replaceImage:Initiated', this.imageId);
            }
        }
        this.replaceImageMetaData[this.imageId].instruction = responseData.data.attachmentData;
        this.content = this.replaceImageMetaData[this.imageId].instruction;
        this.saveInprogress = false;
        clearForm(this);
        this.renderAttachmentHeader();
        this.setLoading(false);
        this.setEnabled(false);
        this.eBus.publish('FlashMessage:show', saveSuccessMessage,
            {'closeButton': false, 'success': true}
        );
        this.eBus.publish('EditSummary:Load');
    }

    /*
     TODO: Failure and retry scenarios must be tested.
     */
    function uploadFailure() {
        //TODO: Log responseText to server
        this.setEnabled(true);
        this.setLoading(false);
        this.eBus.publish('replaceImage:OnUploadFailure', this);
        throw new Error('replaceImage.file.upload.failed');
    }

    /*
     TODO: Timeout and retry scenarios must be tested.
     */
    function uploadTimedOut() {
        //TODO: Log Time out info to server
        this.setEnabled(true);
        this.setLoading(false);
        this.eBus.publish('replaceImage:OnUploadTimeout', this);
        throw new Error('replaceImage.file.upload.timed.out');
    }

    function checkUploadSizeAndType(instance, file) {
        var size = file.files[0].size,
            filename = file.files[0].name,
            ext = filename.split('.').pop();

        ext = ext.toLowerCase();
        if (Helper.isUndefined(ext) === true ||
            instance.uploadFileWhiteList.indexOf(ext) === -1
        ) {
            file.value = '';
            throw new Error('upload.file.type');
        }
        if (Helper.isUndefined(size) === true || instance.maxUploadFileSize < size) {
            file.value = '';
            throw new Error('upload.file.max.size');
        }

        if (Helper.isUndefined(size) === true || size <= 0) {
            file.value = '';
            throw new Error('upload.file.min.size');
        }
    }

    function checkFileAlreadyExists(instance, file) {
        var replaceImageAttachmentsLength, replaceImageAttachments,
            i = 0,
            replaceImageMetaData = instance.replaceImageMetaData[instance.imageId],
            name = file.files[0].name;

        if (Helper.isUndefined(replaceImageMetaData) === true) {
            return;
        }
        replaceImageAttachments = replaceImageMetaData.attachments;
        replaceImageAttachmentsLength = replaceImageAttachments.length;
        for (; i < replaceImageAttachmentsLength; i += 1) {
            if (replaceImageAttachments[i].name === name) {
                file.value = '';
                throw new Error('upload.file.already.exists');
            }
        }
    }
    function uploadValidate(input) {
        if (Helper.isUndefined(input.target.files[0]) === true) {
            return;
        }
        checkUploadSizeAndType(this, input.target);
        checkFileAlreadyExists(this, input.target);
    }

    function getUploadedFileDetails(instance, fileId) {
        var i = 0, attachments,
            replaceImageMetaData = instance.replaceImageMetaData[instance.imageId];

        attachments = replaceImageMetaData.attachments;
        for (; i < attachments.length; i += 1) {
            if (attachments[i].id === fileId) {
                return attachments[i];
            }
        }
        return null;
    }

    function deleteReplaceImageInstruction(instance) {
        var rb = instance.requestBuilder, request,
            fd = new FormData();

        fd.append('data', JSON.stringify({
            'token': instance.articleToken,
            'referenceId': instance.imageId
        }));
        rb.setUrl(Config.getRoute('replaceImageInstructionRemove'));
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function successCallback() {
            instance.eBus.publish('replaceImage:Undo', instance.imageId);
        });
        request = rb.build();
        request.send();
    }

    function deleteFile(event) {
        var fileId, filename, request, fileDetails,
            uniquekeyData = [],
            elem = event.target,
            rb = this.requestBuilder,
            fd = new FormData(),
            self = this,
            getFileElem = function getFileElem(fileId) {
                var cont = self.uploadedFileListContainer,
                    qs = cont.querySelector.bind(cont);

                return qs('a[data-id="' + fileId + '"]');
            },
            failCallback = function failCallback() {
                /*
                 TODO: Log to server
                 */
                var element = getFileElem(fileId);

                if (element !== null) {
                    element.classList.remove('disabled');
                }
                self.setLoading(false);
                self.eBus.publish('alert:show', saveErrorMessage);
                self.eBus.publish('replaceImage:onFileDeleteFail', self, fileId);
            };

        fileId = elem.id;
        elem = getFileElem(fileId);
        if (elem === null) {
            return;
        }

        fileDetails = getUploadedFileDetails(this, fileId);
        filename = fileDetails.name;
        if (confirm('Do you want to delete the file "' + filename + '"?') === false) {
            return;
        }
        if (elem.classList.contains('delete') === false) {
            return;
        }

        if (elem.classList.contains('disabled') === true) {
            return;
        }
        self.eBus.publish('ActionLog:save',
            {'action': 'replace-file-delete', 'fileId': fileId}, true
        );
        self.setLoading(true);
        elem.classList.add('disabled');
        uniquekeyData.push(fileId);
        fd.append('data', JSON.stringify({
            'token': this.articleToken,
            'uniqueKey': uniquekeyData
        }));
        rb.setUrl(Config.getRoute('attachmentRemove'));
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function successCallback() {
            var replaceImageMetaData, len,
                cont = self.uploadedFileListContainer;

            elem = getFileElem(fileId);
            if (elem !== null) {
                cont.removeChild(elem.parentNode);
                self.renderAttachmentHeader();
            }
            self.setLoading(false);
            self.updateMetaData(fileId);
            replaceImageMetaData = self.replaceImageMetaData[self.imageId];
            len = replaceImageMetaData.attachments.length;
            if (len === 0) {
                deleteReplaceImageInstruction(self);
                self.eBus.publish('Undo:ReplaceImage', self.imageId);
                self.eBus.publish('Render:Annotator', self.imageNode);
            }
        });
        rb.setFailureCallback(failCallback);
        rb.setTimeoutCallback(failCallback);
        request = rb.build();
        request.send();
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true,
            'extraWhitelistedTags': ['br']
        });
    }

    function proceedFn() {
        var data, instructContent,
            imageId = this.imageId,
            instructData = getRTEData(this);

        checkChanges.call(this, instructData);

        if (this.hasAttachmentChange === false) {
            this.setEnabled(false);
            return;
        }
        instructContent = instructData.replace(/ /g, '').trim();
        if (Util.checkCKEditorEmpty(instructContent, this.htmlDoc) === true) {
            if (this.hasAttachmentChange === true) {
                this.rte.clear();
                throw new Error('instruct.text.empty');
            }
            else {
                this.setEnabled(false);
                return;
            }
        }
        this.saveFlag = true;
        this.saveInprogress = true;
        this.save(imageId, instructData);
    }

    function onShow(imageNode) {
        var replaceImageMetaData, attachments, attachment, filename,
            downloadUrl, uuid, size,
            instruction = null,
            message = Config.getLocaleByKey('image.replace.confirmation.message'),
            image = imageNode.querySelector('img'),
            i = 0, len = 0;

        this.imageId = image.dataset.id;
        this.imageNode = image;
        replaceImageMetaData = this.replaceImageMetaData[this.imageId];
        if (Helper.isUndefined(replaceImageMetaData) === false) {
            attachments = replaceImageMetaData.attachments;
            instruction = replaceImageMetaData.instruction;
            len = attachments.length;
        }
        /*if (len === 0) {
            if(confirm(message) === false) {
                return;
            }
        }*/
        this.setEnabled(true);
        if (Helper.isNull(instruction) === false) {
            this.setInstruction(instruction);
        }
        this.eBus.publish('Supplementary:SetBlock');
        this.eBus.publish('Editor:SetBlock');
        this.renderAttachmentHeader();
        for(;i < len; i += 1) {
            attachment = attachments[i];
            filename = attachment.name;
            downloadUrl = attachment.url;
            uuid = attachment.id;
            size = attachment.size;

            if (Helper.isString(filename) === true) {
                this.addUploadedFile(filename, downloadUrl, uuid, size);
            }
        }
    }

    function openImageFolder(imageNode){
        $('.replaced-file').trigger('click');
    }

    function changeImage(event, file){
       console.log('file', file.files);
       console.log('event', event.target);
       event.target.className = event.target.className+' fig-nav';
       var tempNode = event.target.cloneNode(true);
       var tempPlaceHolder = document.createElement('div');
       tempPlaceHolder.innerHTML = imagePlaceHolder.join('');
       var tempId = tempPlaceHolder.firstChild.id = 'imgplch_' + event.target.id;
       var wraperImage = event.target.querySelector('.wrapper');
		var wraperImageClone = event.target.querySelector('.wrapper').cloneNode(true);
		wraperImageClone.innerHTML = '';
		wraperImageClone.appendChild(tempPlaceHolder.firstChild);
		wraperImage.parentNode.insertBefore(wraperImageClone,wraperImage.nextSibling);
       // if you want to show Image to inageplaceholder uncomment the function
        /*setTimeout(function(){
            insertReplacedImage(event, file, tempId)
        },2000);*/
    }
    
    function insertReplacedImage(event, file, tempId){
        var imgplaceHolder = document.querySelector('#'+tempId);
        var newReplacedImage = document.createElement('div');
        newReplacedImage.innerHTML = replaceImagetemplate.join('');
        newReplacedImage.firstChild.id = 'repimg_' + event.target.id;
        newReplacedImage.querySelector('img').src = URL.createObjectURL(file.files[0]);
        // newReplacedImage.appendChild(event.target.querySelector('.figcaption').cloneNode(true));
        var keywordsNode = event.target.querySelector(Util.getSelector('keywords'));
        newReplacedImage.querySelector('.figcaption').parentNode.replaceChild(event.target.querySelector('.figcaption').cloneNode(true), newReplacedImage.querySelector('.figcaption'));
        if(keywordsNode)
            newReplacedImage.querySelector(Util.getSelector('keywords')).parentNode.replaceChild(keywordsNode.cloneNode(true), newReplacedImage.querySelector(Util.getSelector('keywords')));
        else
            newReplacedImage.querySelector(Util.getSelector('keywords')).outerHTML = '';
        newReplacedImage.querySelector('.paper-annotations-counts').outerHTML = '';
        // newReplacedImage.appendChild(event.target.querySelector(Util.getSelector('keywords')).cloneNode(true));
        imgplaceHolder.parentNode.replaceChild(newReplacedImage, imgplaceHolder);
        file.value = '';
    }

    function renderStyles(instance) {
        var styleEl;

        styleEl = instance.htmlDoc.createElement('style');
        styleEl.id = instance.stylesheetId;
        instance.htmlDoc.head.appendChild(styleEl);
        instance.styleSheet = styleEl;
        Helper.addRulesToStyleSheet(
            instance.htmlDoc, instance.styleSheet, cssRules
        );
    }

    function ReplaceImage(cont, doc, win, eventBus, articleToken) {
        if (win instanceof win.Window === false) {
            throw new Error('replaceImage.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('replaceImage.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('replaceImage.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('replaceImage.requires.eventbus');
        }
        initializeVariables(this);
        this.articleToken = articleToken;
        this.replaceImageContainer = cont;
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.uploadUri = Config.getRoute('replaceImageEndPoint');
        placeholderMessage = Config.getLocaleByKey('replace.panel.placeholder');
        // document.off('click', openImageFolder).on('click', openImageFolder);
        // this.eBus.subscribe('ReplaceImage:offClick', openImageFolder.bind(this));
        // this.eBus.subscribe('ReplaceImage:onClick', openImageFolder.bind(this));
        errorHandler = new ErrorHandler(this.win, this.htmlDoc);
        setTimeout(function(){
            var clickedImage;
            $('.replace-icon').off('click').on('click', function(){
                openImageFolder(this);
                clickedImage = $(this).parents('.figure');
            });
            $('.replaced-file').off('change').on('change', function(){
                var e = {target : clickedImage[0]};
                if(this.files.length == 0){
                    return;
                }
                changeImage(e, this);
            });
        }, 1000);
    }

    ReplaceImage.prototype.setS3FormUpload = function setS3FormUpload(s3FormData) {
        if (Helper.isUndefined(s3FormData) === true) {
            return;
        }
        this.s3UploadFormData = s3FormData;
        this.s3UploadEnable = true;
    };

    ReplaceImage.prototype.setMetadata = function setMetadata(metadata) {
        this.replaceImageMetaData = metadata;
    };

    ReplaceImage.prototype.setUploadLimit = function setUploadLimit(size) {
        var limit = Helper.formatBytes(size);

        this.maxUploadFileSize = size;
        if (limit !== null) {
            this.fileUploadLimit.innerHTML = limit;
        }
    };

    ReplaceImage.prototype.setUploadType = function setUploadType(types) {
        this.uploadFileWhiteList = types;
    };

    ReplaceImage.prototype.renderAttachmentHeader = function renderAttachmentHeader() {
        var text, textNode;

        if (Helper.isUndefined(this.replaceImageMetaData[this.imageId]) === false &&
         this.replaceImageMetaData[this.imageId].attachments.length > 0) {
            text = 'Attachments';
            this.attachmentsOptional.classList.add('hide');
        }
        else {
            text = 'Attach';
            this.attachmentsOptional.classList.remove('hide');
        }
        textNode = this.htmlDoc.createTextNode(text);
        this.attachmentsHeader.removeChild(this.attachmentsHeader.firstChild);
        this.attachmentsHeader.appendChild(textNode);
    };

    ReplaceImage.prototype.updateMetaData = function updateMetaData(fileId) {
        var i = 0,
            len = this.replaceImageMetaData[this.imageId].attachments.length;

        for (; i < len; i += 1) {
            if (this.replaceImageMetaData[this.imageId].attachments[i].id === fileId) {
                this.replaceImageMetaData[this.imageId].attachments.splice(i, 1);
                break;
            }
        }
        this.renderAttachmentHeader();
        this.eBus.publish('EditSummary:Load');
    };

    ReplaceImage.prototype.getMetaData = function getMetaData() {
        return this.replaceImageMetaData;
    };

    ReplaceImage.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.replaceImageContainer;
    };

    ReplaceImage.prototype.setEnabled = function setEnabled(enable) {
        if (this.saveInprogress === true) {
            throw new Error('instruction.save.inprogress');
        }
        if (
            (this.isEnabled === true && enable === true) ||
            (this.isEnabled === false && enable === false)
        ) {
            return;
        }
        if (enable === false) {
            clearForm(this);
            disableForm(this);
            this.isEnabled = false;
            this.hasContentChange = false;
            this.hasAttachmentChange = false;
            this.content = null;
            this.eBus.publish('Supplementary:RemoveBlock');
            this.eBus.publish('Editor:RemoveBlock');
            this.eBus.publish('RightPane:Hide', 'Replace-Image');
        }
        else {
            this.panel.show();
            enableForm(this);
            this.isEnabled = true;
        }
    };

    ReplaceImage.prototype.render = function render() {
        var qs = this.replaceImageContainer.querySelector.bind(this.replaceImageContainer),
            frag = this.htmlDoc.createDocumentFragment(), child,
            tmpNode = this.htmlDoc.createElement('div'),
            styleSheet;

        if (this.isRendered === true) {
            throw new Error('replaceImage.already.rendered');
        }
        styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId);
        if(Helper.isNull(styleSheet) === true) {
            renderStyles(this);
        }

        this.requestBuilder = new RequestBuilder();

        this.panel = new Panel(
            this.replaceImageContainer, this.htmlDoc, this.win, this.eBus
            );
        tmpNode.innerHTML = instructTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.render();
        this.panel.add(frag);
        this.replaceImageContainer.appendChild(this.panel.getElement());
        this.rteContainer = qs('.pc-replace .instruction');
        this.fileInput = qs('.pc-replace input[type="file"]');
        this.uploadForm = qs('.pc-replace .replace-file-form');
        this.attachmentsHeader = qs('.pc-replace .file-upload-container h5');
        this.attachmentsOptional = qs(
            '.pc-replace .file-upload-container .optional'
        );
        this.uploadedFileListContainer = qs('.pc-replace .replace-file-list');
        this.fileUploadLimit = qs('.pc-replace .file-upload-limit');
        this.rte = new RTE(this.win, this.htmlDoc, this.rteContainer,
            {
                'allowedContent': 'b i sub sup',
                'placeholder': placeholderMessage,
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.proceedFn = proceedFn.bind(this);
        this.fileDeleteFn = deleteFile.bind(this);
        this.formSubmitFn = cancelFormSubmit.bind(this);
        this.uploadValidate = uploadValidate.bind(this);
        this.uploadForm.addEventListener('submit', this.formSubmitFn, false);
        this.uploadedFileListContainer.addEventListener(
            'click', this.fileDeleteFn, false
        );
        this.fileInput.addEventListener('change', this.uploadValidate, false);
        this.isRendered = true;
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.eBus.publish('ReplaceImage:OnRender', this);
    };

    ReplaceImage.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    ReplaceImage.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('replaceImage.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    ReplaceImage.prototype.setName = function setName(name) {
        assertRendered(this);
        if (Helper.isString(name) === false) {
            throw new Error('replaceImage.name.must.be.a.string');
        }
        this.panel.setName(name);
    };

    ReplaceImage.prototype.uploadFile = function uploadFile(imageId, attachmentData) {
        var request,
            fd = new FormData(),
            file = this.fileInput,
            rb = this.requestBuilder,
            data = {};

        this.setLoading(true);
        if (this.s3UploadEnable === true) {
            data.s3UploadEnable = true;
        }
        else {
            fd.append('uploadFile', file.files[0]);
            data.s3UploadEnable = false;
        }

        data.category = 'replace_image';
        data.name = file.files[0].name;
        data.referenceId = Helper.getUniqueId('opt');
        data.imageId = imageId;
        // For Demo - Start
        var response,
            file = file.files[0];

        response = '{"data":{"fileName":"' + file.name + '","downloadUrl":"#","uuid":"1","size":' + file.size + ',"attachmentData":"' + attachmentData + '"}}';
        uploadSuccess.call(this, response);
        return;
        // For Demo - end
        data.token = this.articleToken;
        data.attachmentData = attachmentData;
        fd.append('attachmentInfo', JSON.stringify(data));

        fd.append('submit', 'true');

        rb.setUrl(this.uploadUri);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(uploadSuccess.bind(this));
        rb.setFailureCallback(uploadFailure.bind(this));
        rb.setTimeoutCallback(uploadTimedOut.bind(this));
        request = rb.build();
        request.send();
    };

    ReplaceImage.prototype.uploadFileToS3 = function uploadFileToS3(imageId, instructData) {
        var request, uploadInputKey, s3UploadInputs,
            fd = new FormData(),
            file = this.fileInput,
            rb = this.requestBuilder,
            self = this,
            s3Upload = this.s3UploadFormData;

        if (file.files.length === 0) {
            self.uploadFile(imageId, instructData);
            return;
        }
        this.setLoading(true);
        s3UploadInputs = s3Upload.inputs;
        for (uploadInputKey in s3UploadInputs) {
            if (s3UploadInputs.hasOwnProperty(uploadInputKey) === true) {
                fd.append(uploadInputKey, s3UploadInputs[uploadInputKey]);
            }
        }
        fd.append('key', s3Upload.filePath + '/' + this.articleToken + '/' + file.files[0].name);
        fd.append('file', file.files[0]);
        rb.setUrl(s3Upload.url);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function successCallback(response) {
            self.uploadFile(imageId, instructData);
        });
        rb.setFailureCallback(uploadFailure.bind(this));
        rb.setTimeoutCallback(uploadTimedOut.bind(this));
        request = rb.build();
        request.setResponseType('document');
        request.send();
    };

    ReplaceImage.prototype.save = function saveFn(imageId, instructData) {
        if (this.saveFlag === false && this.clearFlag === false) {
            return;
        }
        else if (this.saveFlag === true && this.s3UploadEnable === true) {
            this.uploadFileToS3(imageId, instructData);
        }
        else if (this.saveFlag === true) {
            this.uploadFile(imageId, instructData);
        }
        resetFlag(this);
    };

    ReplaceImage.prototype.setreplaceImageId = function setreplaceImageId(id) {
        if (Helper.isString(id) === false) {
            throw new Error('instruction.id.must.be.a.string');
        }
        if (Helper.isEmptyString(id) === true) {
            throw new Error('instruction.id.cannot.be.empty');
        }

        this.replaceImageId = id;
    };

    ReplaceImage.prototype.getData = function getData() {
        var data = {};

        assertRendered(this);
        data.id = this.imageId;
        data.instruction = getRTEData(this);
        data.files = this.fileIds;

        return data;
    };

    ReplaceImage.prototype.setInstruction = function setInstruction(instruction) {
        assertRendered(this);
        this.rte.setData(instruction);
        this.focusOnInstruction();
    };

    ReplaceImage.prototype.focusOnInstruction = function focusOnInstruction() {
        assertRendered(this);
        this.rte.focus();
    };

    ReplaceImage.prototype.addUploadedFile = function addUploadedFile(
        filename, url, fileId, size
    ) {
        var elem;

        assertRendered(this);
        elem = createUploadedFileElement(this, filename, url, fileId, size);
        this.uploadedFileListContainer.appendChild(elem);
    };

    ReplaceImage.prototype.autoSave = function autoSaveFn() {
        if (this.isEnabled === false || this.saveInprogress === true) {
            return;
        }
        this.proceedFn();
    };

    ReplaceImage.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.uploadForm.removeEventListener('submit', this.formSubmitFn, false);
        this.fileInput.removeEventListener('change', this.uploadValidate, false);
        this.uploadedFileListContainer.removeEventListener(
            'click', this.fileDeleteFn, false
        );
        this.panel.destroy();
        this.replaceImageContainer.innerHTML = '';
        this.eBus.unsubscribe('InstructPanel:OnSetEnabled', this.setEnabled);
        this.eBus.unsubscribe('InstructPanel:destroy', this.destroy);
        this.eBus.unsubscribe('InstructPanel:SetSelection', this.setSelection,
            this);
        initializeVariables(this);
        eb.publish('Instruct:OnDestroy', this);
    };

    ReplaceImage.prototype.setSelection = function setSelection() {
        this.rte.setSelection();
    };
    return ReplaceImage;
});

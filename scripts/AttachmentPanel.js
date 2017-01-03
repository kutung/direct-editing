define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/RequestBuilder',
    'scripts/Panel', 'scripts/ConfigReader', 'scripts/Util', 'scripts/ErrorHandler'
], function AttachmentPanelLoader(
    Helper, RTE, RequestBuilder, Panel, Config, Util, ErrorHandler
) {
    var attachmentTemplate = [
            '<div class="pc-attachment">',
                '<div class="info"></div>',
                '<div class="attachment"></div>',
                '<div class="file-upload-container">',
                    '<h5>Attach</h5>',
                    '<span class="optional">(optional)</span>',
                    '<div class="info">Limit upto <span class="file-upload-limit">20MB</span>/file</div>',
                    '<form class="attachment-file-form">',
                        '<input type="file" class="attachment-file">',
                    '</form>',
                '</div>',
                '<ul class="attachment-file-list"></ul>',
                '<div class="buttons-container">',
                '</div>',
            '</div>'
        ],
        attachmentButtonTemplate = [
            '<div class="attachment">',
                '<div class="attachment-button clearfix">',
                  '<div class="attachment-title"><span class="attachment-badge"></span></div>',
                  '<div class="attachment-content" data-name="generalAttach">Attach additional files</div>',
                '</div>',
            '</div>'
        ],
        cssRules = {
            '.supplementary .attachment': {
                'display': 'block',
                'margin-top': '15px',
                'text-align': 'center'
            },
            '.supplementary .attachment-button': {
                'cursor': 'pointer',
                'display': 'inline-block',
                'background': '#2F2F2F',
                'margin': '0px auto',
                'color': '#fff',
                '-webkit-box-shadow': '5px 5px 25px -6px #474747',
                '-moz-box-shadow': '5px 5px 25px -6px rgb(71, 71, 71)',
                'box-shadow': '5px 5px 25px -6px #474747'
            },
            '.supplementary .attachment-button .fattachment-title': {
                'width': '16px',
                'float': 'left',
                'padding': '0px 0px 0px 5px'
            },
            '.supplementary .attachment-badge': {
                'background': '#FF6300',
                'width': '16px',
                'height': '16px',
                'border-radius': '50%',
                'line-height': '16px',
                'font-size': '12px',
                'font-weight': 'bold',
                'display': 'inline-block',
                'text-align': 'center',
                'padding': '1px 0px'
            },
            '.supplementary .attachment-title': {
                'float': 'left',
                'border-right': '1px solid #fff',
                'padding': '0 6px'
            },
            '.supplementary .attachment-button .attachment-content': {
                'float': 'left',
                'font-weight': 'bold',
                'padding': '0px 15px'
            }
        },
        saveErrorMessage, saveSuccessMessage, errorHandler, placeholderMessage;

    function createUploadedFileElement(instance, name, url, fileId, size) {
        var elem = instance.htmlDoc.createElement('li'),
            anchor = instance.htmlDoc.createElement('a'),
            delFile = instance.htmlDoc.createElement('a'),
            sizeWrapper = instance.htmlDoc.createElement('span');

        if (Helper.isString(url) === false) {
            throw new Error('attachment.uploaded.file.url.must.be.string');
        }
        if (Helper.isString(name) === false) {
            throw new Error('attachment.uploaded.file.name.must.be.string');
        }
        if (Helper.isEmptyString(url) === true) {
            throw new Error('attachment.uploaded.file.url.cannot.be.empty');
        }
        if (Helper.isEmptyString(name) === true) {
            throw new Error('attachment.uploaded.file.name.cannot.be.empty');
        }
        if (Helper.isEmptyString(size) === true) {
            throw new Error('attachment.uploaded.file.size.cannot.be.empty');
        }
        if (isNaN(size) === true) {
            throw new Error('attachment.uploaded.file.size.should.be.number');
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
        instance.stylesheetId = 'generalattachment-style';
        instance.styleSheet = null;
        instance.rteContainer = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.uploadFileWhiteList = null;
        instance.maxUploadFileSize = null;
        instance.attachmentContainer = null;
        instance.s3UploadFormUpload = null;
        instance.rte = null;
        instance.uploadUri = null;
        instance.deleteUri = null;
        instance.fileInput = null;
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.formSubmitFn = null;
        instance.uploadForm = null;
        instance.uploadedFileListContainer = null;
        instance.requestBuilder = null;
        instance.proceedBtn = null;
        instance.requestFragment = null;
        instance.requestContext = null;
        instance.attachmentId = null;
        instance.attachmentsMetaData = null;
        instance.instructionMetaData = null;
        instance.panel = null;
        instance.fileUploadLimit = null;
        instance.uploadValidate = null;
        instance.attachmentsHeader = null;
        instance.attachmentsOptional = null;
        instance.generalAttachBtn = null;
        instance.saveInprogress = false;
        instance.content = null;
        instance.hasContentChange = false;
        instance.hasAttachmentChange = false;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('attachment.not.rendered');
        }
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function checkChanges(data) {
        if (this.content !== data) {
            this.hasContentChange = true;
        }
        if (Helper.isEmptyString(this.fileInput.value) === false) {
            this.hasAttachmentChange = true;
        }
    }

    function resetAttachHeader(instance) {
        instance.attachmentsHeader.innerHTML = 'Attach';
        instance.attachmentsOptional.classList.remove('hide');
    }

    function clearForm(instance) {
        instance.fileInput.value = '';
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
            attachmentsMetaData = this.attachmentsMetaData[this.attachmentId],
            newFileData = {}, length;

        if (Helper.isObject(attachmentsMetaData) === false) {
            this.attachmentsMetaData[this.attachmentId] = [];
        }
        if (Helper.isUndefined(responseData.data.fileName) === false) {
            newFileData.id = responseData.data.uuid;
            newFileData.name = responseData.data.fileName;
            newFileData.url = responseData.data.downloadUrl;
            newFileData.size = responseData.data.size;
            this.attachmentsMetaData.push(newFileData);
            length = this.attachmentsMetaData.length;
            this.generalAttachBadge.innerHTML = length;
            this.addUploadedFile(
                newFileData.name, newFileData.url, newFileData.id,
                newFileData.size
            );
        }
        this.instructionMetaData.generalInstruction = responseData.data.attachmentData;
        this.content = this.instructionMetaData.generalInstruction;
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
        this.eBus.publish('Instruct:OnUploadFailure', this);
        throw new Error('attachment.file.upload.failed');
    }

    /*
     TODO: Timeout and retry scenarios must be tested.
     */
    function uploadTimedOut() {
        //TODO: Log Time out info to server
        this.setEnabled(true);
        this.setLoading(false);
        this.eBus.publish('Instruct:OnUploadTimeout', this);
        throw new Error('attachment.file.upload.timed.out');
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
        var attachmentsMetaDataLength,
            i = 0,
            attachmentsMetaData = instance.attachmentsMetaData,
            name = file.files[0].name;

        if (Helper.isUndefined(attachmentsMetaData) === true) {
            return;
        }
        attachmentsMetaDataLength = attachmentsMetaData.length;
        for (; i < attachmentsMetaDataLength; i += 1) {
            if (attachmentsMetaData[i].name === name) {
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
        var i = 0,
            attachmentsMetaData = instance.attachmentsMetaData;

        for (; i < attachmentsMetaData.length; i += 1) {
            if (attachmentsMetaData[i].id === fileId) {
                return attachmentsMetaData[i];
            }
        }
        return null;
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
                self.eBus.publish('Instruct:onFileDeleteFail', self, fileId);
            };

        fileId = elem.dataset.id;
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

        self.setLoading(true);
        elem.classList.add('disabled');
        uniquekeyData.push(fileId);
        fd.append('data', JSON.stringify({
            'token': this.articleToken,
            'uniqueKey': uniquekeyData
        }));
        rb.setUrl(this.deleteUri);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function successCallback() {
            var cont = self.uploadedFileListContainer;

            elem = getFileElem(fileId);
            if (elem !== null) {
                cont.removeChild(elem.parentNode);
                self.renderAttachmentHeader();
            }
            self.setLoading(false);
            self.eBus.publish('generalAttachmentPanel:onDeleteFile', fileId);
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
        var instructContent, attachmentData = getRTEData(this),
            referenceId = Helper.getUniqueId('opt');

        checkChanges.call(this, attachmentData);
        if (this.hasContentChange === false &&
            this.hasAttachmentChange === false
        ) {
            this.setEnabled(false);
            return;
        }

        instructContent = attachmentData.replace(/ /g, '').trim();
        if (Util.checkCKEditorEmpty(instructContent, this.htmlDoc) === true) {
            if (this.hasAttachmentChange === true) {
                RTE.clear(this.rte);
                throw new Error('attachment.text.empty');
            }
            else {
                this.setEnabled(false);
                return;
            }
        }
        this.saveInprogress = true;
        disableForm(this);
        this.uploadFile(referenceId, attachmentData);
    }

    function clearFn() {
        this.eBus.publish(
            'Instruct:OnExecute',
            null, this.requestFragment, this.requestContext, true
        );
        this.setEnabled(false);
    }

    function onShow() {
        this.setEnabled(true);
        this.eBus.publish('Supplementary:SetBlock');
        this.eBus.publish('Editor:SetBlock');
    }

    function attachment(
        cont, doc, win, eventBus, articleToken
    ) {
        if (win instanceof win.Window === false) {
            throw new Error('attachment.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('attachment.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('attachment.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('attachment.requires.eventbus');
        }

        initializeVariables(this);
        this.articleToken = articleToken;
        this.uploadUri = Config.getRoute('generalInstructionEndPoint');
        this.deleteUri = Config.getRoute('attachmentRemove');
        this.attachmentContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        saveErrorMessage = Config.getLocaleByKey('server.save.error');
        saveSuccessMessage = Config.getLocaleByKey('correction.success');
        placeholderMessage = Config.getLocaleByKey('attachment.panel.placeholder');
        this.eBus.subscribe('GeneralAttachmentPanel:Show', onShow.bind(this));
        this.eBus.subscribe('generalAttachmentPanel:OnSetEnabled', this.setEnabled, this);
        this.eBus.subscribe('generalAttachmentPanel:onDeleteFile', this.updateMetaData, this);
        this.eBus.subscribe('generalAttachmentPanel:destroy', this.destroy, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    attachment.prototype.setS3FormUpload = function setS3FormUpload(s3FormData) {
        this.s3UploadFormUpload = s3FormData;
    };

    attachment.prototype.setButtonContainer = function setButtonContainer(
        container
    ) {
        if (container instanceof this.global.HTMLElement === false) {
            throw new Error('supplementary.container.requires.htmlelement');
        }
        if (this.isRendered === true) {
            throw new Error('attachment.panel.already.rendered');
        }
        this.buttonContainer = container;
    };

    attachment.prototype.setMetadata = function setMetadata(metaData) {
        this.attachmentsMetaData = metaData.attachments;
        this.instructionMetaData = metaData.instruction;
    };

    attachment.prototype.setUploadLimit = function setUploadLimit(size) {
        var limit = Helper.formatBytes(size);

        this.maxUploadFileSize = size;
        if (limit !== null) {
            this.fileUploadLimit.innerHTML = limit;
        }
    };

    attachment.prototype.setUploadType = function setUploadType(types) {
        this.uploadFileWhiteList = types;
    };

    attachment.prototype.renderAttachmentHeader = function renderAttachmentHeader() {
        if (Helper.isUndefined(this.attachmentsMetaData) === false &&
         this.attachmentsMetaData.length > 0) {
            this.attachmentsHeader.innerHTML = 'Attachments';
            this.attachmentsOptional.classList.add('hide');
        }
        else {
            this.attachmentsHeader.innerHTML = 'Attach';
            this.attachmentsOptional.classList.remove('hide');
        }
    };

    attachment.prototype.updateMetaData = function updateMetaData(fileId) {
        var i = 0,
            len = this.attachmentsMetaData.length;

        for (; i < len; i += 1) {
            if (this.attachmentsMetaData[i].id === fileId) {
                this.attachmentsMetaData.splice(i, 1);
                break;
            }
        }
        this.renderAttachmentHeader();
        this.generalAttachBadge.innerHTML = this.attachmentsMetaData.length;
        this.eBus.publish('EditSummary:Load');
    };

    attachment.prototype.getMetaData = function getMetaData() {
        return this.attachmentsMetaData;
    };

    attachment.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.attachmentContainer;
    };

    attachment.prototype.setEnabled = function setEnabled(enable) {
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
            this.eBus.publish('Supplementary:RemoveBlock');
            this.eBus.publish('Editor:RemoveBlock');
            this.eBus.publish('RightPane:Hide', 'attachment');
        }
        else {
            this.panel.show();
            enableForm(this);
            this.isEnabled = true;
        }
    };

    attachment.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    attachment.prototype.render = function render() {
        var child, len, generalInstruction, currentAttachment,
            i = 0, styleEl,
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            qs = this.attachmentContainer.querySelector.bind(this.attachmentContainer),
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = this.htmlDoc.createElement('div');

        if (this.isRendered === true) {
            throw new Error('attachment.already.rendered');
        }

        if (Helper.isNull(styleSheet) === true) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.insertStylesToHead = true;
            this.renderStyles();
        }

        this.requestBuilder = new RequestBuilder();

        this.panel = new Panel(
            this.attachmentContainer, this.htmlDoc, this.global, this.eBus
            );
        tmpNode.innerHTML = attachmentTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode.innerHTML = attachmentButtonTemplate.join('');
        this.buttonContainer.appendChild(tmpNode.firstChild);
        tmpNode = null;
        this.panel.render();
        this.panel.add(frag);
        this.attachmentContainer.appendChild(this.panel.getElement());
        this.generalAttachBtn = this.buttonContainer.querySelector('.attachment-button');
        this.generalAttachBadge = this.buttonContainer.querySelector('.attachment-badge');
        this.rteContainer = qs('.pc-attachment .attachment');
        this.fileInput = qs('.pc-attachment input[type="file"]');
        this.uploadForm = qs('.pc-attachment .attachment-file-form');
        this.attachmentsHeader = qs('.pc-attachment .file-upload-container h5');
        this.attachmentsOptional = qs(
            '.pc-attachment .file-upload-container .optional'
        );
        this.uploadedFileListContainer = qs('.pc-attachment .attachment-file-list');
        this.fileUploadLimit = qs('.pc-attachment .file-upload-limit');
        this.rte = new RTE(this.global, this.htmlDoc, this.rteContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'placeholder': placeholderMessage,
                'height': '110px'
            }
        );

        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        generalInstruction = this.instructionMetaData.generalInstruction;
        if (generalInstruction === null) {
            generalInstruction = placeholderMessage;
        }
        this.content = generalInstruction;
        this.rte.setData(generalInstruction);
        this.proceedFn = proceedFn.bind(this);
        this.clearFn = clearFn.bind(this);
        this.fileDeleteFn = deleteFile.bind(this);
        this.formSubmitFn = cancelFormSubmit.bind(this);
        this.uploadValidate = uploadValidate.bind(this);
        this.uploadForm.addEventListener('submit', this.formSubmitFn, false);
        this.uploadedFileListContainer.addEventListener(
            'click', this.fileDeleteFn, false
        );
        this.fileInput.addEventListener('change', this.uploadValidate, false);
        this.generalAttachBtn.addEventListener('click', onShow.bind(this));
        this.isRendered = true;
        len = this.attachmentsMetaData.length;
        this.renderAttachmentHeader();
        for (; i < len; i += 1) {
            currentAttachment = this.attachmentsMetaData[i];
            this.addUploadedFile(currentAttachment.name, currentAttachment.url,
                currentAttachment.id, currentAttachment.size
            );
        }
        this.generalAttachBadge.innerHTML = this.attachmentsMetaData.length;
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.eBus.publish('Instruct:OnRender', this);
    };

    attachment.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    attachment.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('attachment.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    attachment.prototype.setName = function setName(name) {
        assertRendered(this);
        if (Helper.isString(name) === false) {
            throw new Error('insertion.name.must.be.a.string');
        }
        this.panel.setName(name);
    };

    attachment.prototype.uploadFile = function uploadFile(referenceId, attachmentData) {
        var request,
            fd = new FormData(),
            file = this.fileInput,
            rb = this.requestBuilder;

        this.setLoading(true);
        this.attachmentId = referenceId;
        if (file.files.length !== 0) {
            fd.append('uploadFile', file.files[0]);
            fd.append('category', 'General-Attachment');
            fd.append('name', file.files[0].name);
            fd.append('referenceId', referenceId);
        }

        fd.append('token', this.articleToken);
        fd.append('attachmentData', attachmentData);
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

    attachment.prototype.setInstructionId = function setInstructionId(id) {
        if (Helper.isString(id) === false) {
            throw new Error('attachment.id.must.be.a.string');
        }
        if (Helper.isEmptyString(id) === true) {
            throw new Error('attachment.id.cannot.be.empty');
        }

        this.attachmentId = id;
    };

    attachment.prototype.getData = function getData() {
        var data = {};

        assertRendered(this);
        data.id = this.attachmentId;
        data.attachment = getRTEData(this);
        data.files = this.fileIds;

        return data;
    };

    attachment.prototype.setInstruction = function setInstruction(attachment) {
        assertRendered(this);
        this.rte.setData(attachment);
        this.focusOnInstruction();
    };

    attachment.prototype.focusOnInstruction = function focusOnInstruction() {
        assertRendered(this);
        this.rte.focus();
    };

    attachment.prototype.addUploadedFile = function addUploadedFile(
        filename, url, fileId, size
    ) {
        var elem;

        assertRendered(this);
        elem = createUploadedFileElement(this, filename, url, fileId, size);
        this.uploadedFileListContainer.appendChild(elem);
    };

    attachment.prototype.autoSave = function autoSaveFn() {
        if (this.isEnabled === false || this.saveInprogress === true) {
            return;
        }
        this.proceedFn();
    };

    attachment.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.uploadForm.removeEventListener('submit', this.formSubmitFn, false);
        this.fileInput.removeEventListener('change', this.uploadValidate, false);
        this.generalAttachBtn.removeEventListener('click', onShow.bind(this));
        this.uploadedFileListContainer.removeEventListener(
            'click', this.fileDeleteFn, false
        );
        this.panel.destroy();
        this.attachmentContainer.innerHTML = '';
        this.eBus.unsubscribe('generalAttachmentPanel:OnSetEnabled', this.setEnabled);
        this.eBus.unsubscribe('generalAttachmentPanel:onDeleteFile', this.updateMetaData);
        this.eBus.unsubscribe('generalAttachmentPanel:destroy', this.destroy);
        initializeVariables(this);
        eb.publish('generalAttachment:OnDestroy', this);
    };

    return attachment;
});

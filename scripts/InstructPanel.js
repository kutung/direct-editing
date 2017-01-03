define([
    'scripts/Helper', 'scripts/InstructCommand', 'scripts/RichTextEditor',
    'scripts/RequestBuilder', 'scripts/Panel', 'scripts/ConfigReader',
    'scripts/Util', 'scripts/Sanitizer', 'scripts/Dom2Xml', 'scripts/ErrorHandler',
    'scripts/FeatureToggle', 'scripts/UnwantedWrapper'
], function InstructPanelLoader(
    Helper, InstructCommand, RTE, RequestBuilder, Panel, Config, Util,
    Sanitizer, Dom2Xml, ErrorHandler, Features, UnwantedWrapper
) {
    var instructTemplate, saveErrorMessage, saveSuccessMessage, placeholderMessage,
        errorHandler, saveErrorReloadMessage,
        cssRules = {
            '.instruction-container .panel .panel-header .text': {
                'font-size': '11px',
                'font-weight': 'normal',
                'padding': '.7em .7em'
            },
            '.instruction-container .panel .panel-content': {
                'padding': '0'
            },
            '.instruction-container .panel .panel-header .icon': {
                'background-image': 'url("/images/hand.svg")',
                'background-repeat': 'no-repeat',
                'background-position': 'center center',
                'width': '2.6em'
            },
            '.instruction-container .panel.open .panel-header .icon': {
                'background-image': 'url("/images/hand-open.svg")'
            },
            '.instruction-container': {
                'display': 'none'
            },
            '.pc-instruct': {
                'font-family': '"Helvetica Neue",Helvetica,Arial,sans-serif',
                'padding': '10px',
                'font-size': '12px'
            },
            '.pc-instruct h3': {
                'font-size': '14px',
                'height': '30px',
                'background-color': '#888',
                'color': '#fff',
                'padding': '10px 0 0 10px',
                'display': 'none'
            },
            '.pc-instruct .info': {
                'margin': '0 0 10px 0',
                'font-family': '"Lucida Grande", calibri',
                'font-size': '12px',
                'color': '#DA9257'
            },
            '.pc-instruct .instruction': {
                'margin': ' 0 0 10px 0'
            },
            '.pc-instruct .file-upload-container h5, .pc-instruct ul.instruct-file-list li.no-files': {
                'font-size': '12px',
                'font-weight': 'bold',
                'color': '#2883D6',
                'margin': '0'
            },
            '.pc-instruct .file-upload-container .optional': {
                'font-size': '12px',
                'color': '#2883D6',
                'margin': '4px'
            },
            '.pc-instruct .file-upload-container .optional.hide': {
                'display': 'none'
            },
            '.pc-instruct .file-upload-container.hide': {
                'display': 'none'
            },
            '.pc-instruct .file-upload-container h5': {
                'display': 'inline'
            },
            '.pc-instruct .file-upload-container .info': {
                'float': 'right'
            },
            '.pc-instruct .instruct-file-form.disable': {
                'opacity': '0.5'
            },
            '.pc-instruct .instruct-file-form': {
                'opacity': '1',
                'font-size': '12px',
                'padding': '10px 0 0 0'
            },
            '.pc-instruct .instruct-file': {
                'margin-bottom': '10px',
                'border': '1px solid #bfbcbf',
                'box-sizing': 'border-box',
                'width': '100%'
            },
            '.pc-instruct .instruct-file-remark': {
                'margin-bottom': '10px',
                'border': '1px solid #bfbcbf',
                'width': '100%',
                'resize': 'none',
                'border-radius': '0',
                'box-sizing': 'border-box'
            },
            '.pc-instruct ul.instruct-file-list': {
                'list-style': 'none',
                'padding': '0',
                'margin': '0'
            },
            '.pc-instruct ul.instruct-file-list li': {
                'position': 'relative'
            },
            '.pc-instruct ul.instruct-file-list li .size': {
                'vertical-align': 'top'
            },
            '.pc-instruct ul.instruct-file-list li .filename': {
                'display': 'inline-block',
                'width': '11em',
                'overflow': 'hidden',
                'white-space': 'nowrap',
                'text-overflow': 'ellipsis'
            },
            '.pc-instruct ul.instruct-file-list .delete': {
                'position': 'absolute',
                'top': '0',
                'right': '0',
                'cursor': 'pointer',
                'opacity': '1',
                'color': 'red'
            },
            '.pc-instruct ul.instruct-file-list .delete.disabled': {
                'opacity': '0.5',
                'cursor': 'not-allowed'
            },
            '.pc-instruct .buttons-container': {
                'text-align': 'right',
                'padding': '0',
                'font-weight': 'bold'
            },
            '.pc-instruct .proceed': {
                'background-color': '#2F2F2F',
                'border': '1px solid #2F2F2F',
                'color': '#FFF'
            },
            '.pc-instruct .proceed[disabled]': {
                'background-color': '#EEE',
                'color': '#ccc',
                'border': '1px solid #EEE'
            }
        };

    instructTemplate = [
        '<div class="pc-instruct">',
            '<div class="info"></div>',
            '<div class="instruction"></div>',
            '<div class="file-upload-container">',
                '<h5>Attach</h5>',
                '<span class="optional">(optional)</span>',
                '<div class="info">Limit upto <span class="file-upload-limit">20MB</span>/file</div>',
                '<form class="instruct-file-form">',
                    '<input type="file" class="instruct-file">',
                '</form>',
            '</div>',
            '<ul class="instruct-file-list"></ul>',
            '<div class="buttons-container">',
            '</div>',
        '</div>'
    ];

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
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.uploadFileWhiteList = null;
        instance.maxUploadFileSize = null;
        instance.instructionContainer = null;
        instance.s3UploadFormData = null;
        instance.s3UploadEnable = false;
        instance.rte = null;
        instance.fileInput = null;
        instance.proceedFn = null;
        instance.clearFn = null;
        instance.formSubmitFn = null;
        instance.uploadForm = null;
        instance.uploadedFileListContainer = null;
        instance.requestBuilder = null;
        instance.requestFragment = null;
        instance.requestContext = null;
        instance.instructionId = null;
        instance.instructsMetaData = null;
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
        instance.attachmentConatiner = null;
        instance.stylesheetId = 'instructpanel-style';
        instance.styleSheet = null;
    }

    function resetFlag(instance) {
        instance.saveFlag = false;
        instance.clearFlag = false;
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
        var fileListCont = instance.uploadedFileListContainer,
            qs = fileListCont.querySelectorAll.bind(fileListCont),
            elems = qs('li'),
            i = 0;

        for (; i < elems.length; i += 1) {
            elems[i].parentNode.removeChild(elems[i]);
        }
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

    function enableAttachment(instance) {
        instance.fileInput.disabled = false;
    }

    function disableAttachment(instance) {
        instance.fileInput.disabled = true;
    }

    function cancelFormSubmit(evt) {
        evt.preventDefault();
    }

    function uploadSuccess(instance, response) {
        var instructsMetaData = instance.instructsMetaData[instance.instructionId],
            newFileData = {};

        if (Helper.isObject(instructsMetaData) === false) {
            instance.instructsMetaData[instance.instructionId] = [];
        }
        newFileData.id = response.data.uuid;
        newFileData.name = response.data.fileName;
        newFileData.url = response.data.downloadUrl;
        newFileData.size = response.data.size;
        newFileData.remarks = null;
        instance.instructsMetaData[instance.instructionId].push(newFileData);
        instance.eBus.publish('Instruct:OnUpload', instance);
        instance.eBus.publish('EditSummary:Load');
    }

    function saveFailure(response, req, xmlHttp) {
        var eb = this.eBus,
            options = {
                'showCloseButton': false,
                'callback': function removeChangedFlagFn() {
                    eb.publish('Save:removeChanges');
                    eb.publish('Browser:reload');
                }
            };

        this.saveInprogress = false;
        this.setEnabled(false);
        this.setLoading(false);
        if (xmlHttp.status === ErrorHandler.getCode('ForceReloadException')) {
            this.eBus.publish('alert:show', saveErrorReloadMessage, options);
            return;
        }
        this.eBus.publish('alert:show', saveErrorMessage);
        throw new Error('instruction.save.failed');
    }

    function saveTimedOut() {
        this.saveInprogress = false;
        this.setEnabled(false);
        this.setLoading(false);
        this.eBus.publish('alert:show', saveErrorMessage);
        throw new Error('instruction.save.timed.out');
    }

    function saveSuccess(response) {
        var responseData = JSON.parse(response);

        if (Helper.isNull(responseData.data) === false &&
            Helper.isUndefined(responseData.data.uuid) === false) {
            uploadSuccess(this, responseData);
        }
        this.saveInprogress = false;
        this.setLoading(false);
        this.setEnabled(false);
        this.eBus.publish('FlashMessage:show', saveSuccessMessage,
            {'closeButton': false, 'success': true}
        );
    }

    function deleteSuccess(response) {
        this.saveInprogress = false;
        this.setLoading(false);
        this.setEnabled(false);
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
        var instructsMetaDataLength,
            i = 0,
            instructsMetaData = instance.instructsMetaData[instance.instructionId],
            name = file.files[0].name;

        if (Helper.isUndefined(instructsMetaData) === true) {
            return;
        }
        instructsMetaDataLength = instructsMetaData.length;
        for (; i < instructsMetaDataLength; i += 1) {
            if (instructsMetaData[i].name === name) {
                file.value = '';
                throw new Error('upload.file.already.exists');
            }
        }
    }
    function uploadValidate(input) {
        if (Helper.isUndefined(input.target.files[0]) === true ||
            Helper.isNull(input.target.files[0]) === true) {
            return;
        }
        checkUploadSizeAndType(this, input.target);
        checkFileAlreadyExists(this, input.target);
    }

    function getUploadedFileDetails(instance, fileId) {
        var i = 0,
            instructsMetaData = instance.instructsMetaData[instance.instructionId];

        for (; i < instructsMetaData.length; i += 1) {
            if (instructsMetaData[i].id === fileId) {
                return instructsMetaData[i];
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
                self.eBus.publish('alert:show', saveErrorMessage);
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
        self.eBus.publish('ActionLog:save',
            {'action': 'instruct-file-delete', 'fileId': fileId}, true
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
            var cont = self.uploadedFileListContainer;

            elem = getFileElem(fileId);
            if (elem !== null) {
                cont.removeChild(elem.parentNode);
                self.renderAttachmentHeader();
            }
            self.setLoading(false);
            self.updateMetaData(fileId);
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
            instructData = getRTEData(this);

        checkChanges.call(this, instructData);
        if (this.hasContentChange === false &&
            this.hasAttachmentChange === false
        ) {
            this.setEnabled(false);
            return;
        }
        instructContent = instructData.replace(/ /g, '').trim();
        if (Util.checkCKEditorEmpty(instructContent, this.htmlDoc) === true) {
            if (this.requestContext.indexOf('onInstruct') !== -1 ||
                this.hasAttachmentChange === true) {
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
        this.eBus.publish('ActionLog:save',
            {'action': 'instruct-proceed', 'data': instructData}
        );
        data = this.instructCommand.execute(
            instructData, this.requestFragment, this.requestContext, false
        );
        if (Helper.isUndefined(data.uniqueId) === false) {
            this.instructionId = data.uniqueId;
        }
        this.eBus.publish('Instruct:Complete', data.dom, 'Instruct');
    }

    function validate(requestFragment) {
        var requestNode,
            winDom = this.global.DocumentFragment;

        if (requestFragment instanceof winDom === false ||
            requestFragment.hasChildNodes() === false
        ) {
            throw new Error('error.fragment.missing');
        }
        requestNode = requestFragment.querySelector('[data-request-id]');
        if (requestNode === null) {
            throw new Error('error.request.id.missing');
        }
    }

    function clearFn(domFragment, context) {
        var data;

        validate.call(this, domFragment);
        this.requestFragment = domFragment;
        this.requestContext = context;

        data = this.instructCommand.execute(
            null, this.requestFragment, this.requestContext, true
        );
        if (Helper.isUndefined(data.uniqueId) === false) {
            this.instructionId = data.uniqueId;
        }

        this.eBus.publish('Instruct:Complete', data.dom, 'Instruct');
        this.clearFlag = true;
        this.saveInprogress = true;
    }

    function getSanitizedHtml(parentNode, instance) {
        var tempNode, html, fragment = {};

        tempNode = instance.htmlDoc.createElement('div');
        tempNode.appendChild(parentNode.cloneNode(true));
        html = Dom2Xml.toXml(tempNode.firstChild);
        fragment.id = parentNode.getAttribute('name');
        fragment.html = Sanitizer.sanitize(
            html, true, false, instance.global, ['br']
        );
        return fragment;
    }

    function instruction(
        cont, doc, win, eventBus, articleToken
        ) {
        if (win instanceof win.Window === false) {
            throw new Error('instruction.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('instruction.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('instruction.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('instruction.requires.eventbus');
        }
        initializeVariables(this);
        this.articleToken = articleToken;
        this.instructionContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        saveErrorMessage = Config.getLocaleByKey('server.save.error');
        saveErrorReloadMessage = Config.getLocaleByKey('server.save.reload');
        saveSuccessMessage = Config.getLocaleByKey('instruct.save.success');
        placeholderMessage = Config.getLocaleByKey('instruct.panel.placeholder');
        this.instructCommand = new InstructCommand(
            this.htmlDoc, this.eBus, this.global
        );
        this.eBus.subscribe('Instruct:Load', this.loadInstruction, this);
        this.eBus.subscribe('Instruct:applyFormatting', this.save, this);
        this.eBus.subscribe('InstructPanel:OnSetEnabled', this.setEnabled, this);
        this.eBus.subscribe('Instruct:Clear', clearFn, this);
        this.eBus.subscribe('InstructPanel:destroy', this.destroy, this);
        this.eBus.subscribe('InstructPanel:SetSelection', this.setSelection,
            this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    instruction.prototype.setS3FormUpload = function setS3FormUpload(s3FormData) {
        if (Helper.isUndefined(s3FormData) === true) {
            return;
        }
        this.s3UploadFormData = s3FormData;
        this.s3UploadEnable = true;
    };

    instruction.prototype.setMetadata = function setMetadata(metadata) {
        this.instructsMetaData = metadata;
    };

    instruction.prototype.setUploadLimit = function setUploadLimit(size) {
        var limit = Helper.formatBytes(size);

        this.maxUploadFileSize = size;
        if (limit !== null) {
            this.fileUploadLimit.innerHTML = limit;
        }
    };

    instruction.prototype.setUploadType = function setUploadType(types) {
        this.uploadFileWhiteList = types;
    };

    instruction.prototype.renderAttachmentHeader = function renderAttachmentHeader() {
        if (Helper.isUndefined(this.instructsMetaData[this.instructionId]) === false &&
         this.instructsMetaData[this.instructionId].length > 0) {
            this.attachmentsHeader.innerHTML = 'Attachments';
            this.attachmentsOptional.classList.add('hide');
        }
        else {
            this.attachmentsHeader.innerHTML = 'Attach';
            this.attachmentsOptional.classList.remove('hide');
        }
    };

    instruction.prototype.updateMetaData = function updateMetaData(fileId) {
        var i = 0,
            len = this.instructsMetaData[this.instructionId].length;

        for (; i < len; i += 1) {
            if (this.instructsMetaData[this.instructionId][i].id === fileId) {
                this.instructsMetaData[this.instructionId].splice(i, 1);
                break;
            }
        }
        this.renderAttachmentHeader();
        this.eBus.publish('EditSummary:Load');
    };

    instruction.prototype.getMetaData = function getMetaData() {
        return this.instructsMetaData;
    };

    instruction.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.instructionContainer;
    };

    instruction.prototype.setEnabled = function setEnabled(enable) {
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
            this.eBus.publish('RightPane:Hide', 'instruct');
        }
        else {
            this.panel.show();
            enableForm(this);
            this.isEnabled = true;
        }
    };

    instruction.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    instruction.prototype.render = function render() {
        var qs = this.instructionContainer.querySelector.bind(this.instructionContainer),
            frag = this.htmlDoc.createDocumentFragment(), child,
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('instruction.already.rendered');
        }
        if (styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }
        this.requestBuilder = new RequestBuilder();

        this.panel = new Panel(
            this.instructionContainer, this.htmlDoc, this.global, this.eBus
            );
        tmpNode.innerHTML = instructTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.renderComponentStyle();
        this.panel.render();
        this.panel.add(frag);
        this.instructionContainer.appendChild(this.panel.getElement());
        this.rteContainer = qs('.pc-instruct .instruction');
        this.fileInput = qs('.pc-instruct input[type="file"]');
        this.uploadForm = qs('.pc-instruct .instruct-file-form');
        this.attachmentsHeader = qs('.pc-instruct .file-upload-container h5');
        this.attachmentsOptional = qs(
            '.pc-instruct .file-upload-container .optional'
        );
        this.uploadedFileListContainer = qs('.pc-instruct .instruct-file-list');
        this.fileUploadLimit = qs('.pc-instruct .file-upload-limit');
        this.attachmentConatiner = qs('.pc-instruct .file-upload-container');
        this.rte = new RTE(this.global, this.htmlDoc, this.rteContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
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
        this.isEnabled = true;
        if (Features.isFeatureEnabled('Editor.Instruct.Attach') === false) {
            this.attachmentConatiner.classList.add('hide');
        }
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.eBus.publish('Instruct:OnRender', this);
    };

    instruction.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    instruction.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('instruction.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    instruction.prototype.setName = function setName(name) {
        assertRendered(this);
        if (Helper.isString(name) === false) {
            throw new Error('insertion.name.must.be.a.string');
        }
        this.panel.setName(name);
    };

    instruction.prototype.loadInstruction = function loadInstruction(
        requestFragment, context, content
    ) {
        var instructsMetaData = this.instructsMetaData,
            element, elementName, filename, downloadUrl, uuid, size,
            instructMetaData,
            i = 0;

        if (this.saveInprogress === true) {
            throw new Error('instruction.save.inprogress');
        }
        this.uploadedFileListContainer.innerHTML = '';
        validate.call(this, requestFragment);
        this.setEnabled(true);
        this.eBus.publish('Supplementary:SetBlock');
        this.eBus.publish('Editor:SetBlock');
        this.requestFragment = requestFragment;
        this.requestContext = context;
        if (context.indexOf('onInstruct') === -1) {
            this.instructionId = null;
            return;
        }
        if (Helper.isString(content) === true) {
            this.setInstruction(content);
            this.content = content;
        }
        element = requestFragment.querySelector('span.optcomment');
        elementName = element.dataset.name;
        this.setInstructionId(elementName);
        if (Helper.isUndefined(instructsMetaData[elementName]) === true) {
            return;
        }
        this.renderAttachmentHeader();
        for (; i < instructsMetaData[elementName].length; i += 1) {
            instructMetaData = instructsMetaData[elementName][i];
            filename = instructMetaData.name;
            downloadUrl = instructMetaData.url;
            uuid = instructMetaData.id;
            size = instructMetaData.size;

            if (Helper.isString(filename) === true) {
                this.addUploadedFile(filename, downloadUrl, uuid, size);
            }
        }
    };

    instruction.prototype.uploadFileToS3 = function uploadFileToS3(parentNode) {
        var request, uploadInputKey, s3UploadInputs,
            fd = new FormData(),
            file = this.fileInput,
            rb = this.requestBuilder,
            self = this,
            s3Upload = this.s3UploadFormData;

        if (file.files.length === 0) {
            this.saveInstruct(parentNode);
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
            var fileName,
                responseKey = response.querySelector('Key');

            if (responseKey !== null) {
                fileName = responseKey.textContent.trim();
                fileName = fileName.replace(
                    self.s3UploadFormData.filePath + '/' + self.articleToken + '/', ''
                );
            }
            self.saveInstruct(parentNode, fileName);
        });
        rb.setFailureCallback(saveFailure.bind(this));
        rb.setTimeoutCallback(saveTimedOut.bind(this));
        request = rb.build();
        request.setResponseType('document');
        request.send();
    };

    instruction.prototype.save = function saveFn(parentNode) {
        if (this.saveFlag === false && this.clearFlag === false) {
            return;
        }
        else if (this.saveFlag === true && this.s3UploadEnable === true) {
            this.uploadFileToS3(parentNode);
        }
        else if (this.saveFlag === true) {
            this.saveInstruct(parentNode);
        }
        else if (this.clearFlag === true) {
            this.deleteInstruct(parentNode);
        }
        resetFlag(this);
    };

    instruction.prototype.saveInstruct = function saveInstruct(parentNode, fileName) {
        var cloneNode, request, saveData,
            file = this.fileInput,
            rB = new RequestBuilder(),
            attachmentData = {},
            formData = new FormData(),
            saveEndPoint = Config.getRoute('instructSave');

        this.setLoading(true);
        cloneNode = parentNode.cloneNode(true);
        saveData = getSanitizedHtml(UnwantedWrapper.remove(cloneNode), this);
        if (file.files.length !== 0) {
            attachmentData.category = 'Instruct';
            attachmentData.referenceId = this.instructionId;
            if (this.s3UploadEnable === true) {
                attachmentData.name = fileName;
                attachmentData.s3UploadEnable = true;
            }
            else {
                attachmentData.name = file.files[0].name;
                formData.append('uploadFile', file.files[0]);
            }
            formData.append('attachmentInfo', JSON.stringify(attachmentData));
            // For Demo - Start
            var response,
                file = file.files[0];

            response = {'data':{'fileName':file.name,'downloadUrl':'#','uuid':'1','size':file.size}};
            uploadSuccess(this, response);
            // For Demo - end
        }
        formData.append('token', this.articleToken);
        formData.append('data', JSON.stringify(saveData));
        rB.setUrl(saveEndPoint);
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(saveSuccess.bind(this));
        rB.setFailureCallback(saveFailure.bind(this));
        rB.setTimeoutCallback(saveTimedOut.bind(this));
        request = rB.build();
        request.send();
        this.eBus.publish('ActionLog:save',
            {'action': 'instruct-save', 'instructionId': this.instructionId,
            'attachmentData': attachmentData}, true
        );
    };

    instruction.prototype.deleteInstruct = function deleteInstruct(parentNode) {
        var cloneNode, request, saveData, instructsMetaData,
            i = 0,
            rB = new RequestBuilder(),
            attachmentData = {},
            formData = new FormData(),
            saveEndPoint = Config.getRoute('instructRemove');

        this.setLoading(true);
        cloneNode = parentNode.cloneNode(true);
        saveData = getSanitizedHtml(UnwantedWrapper.remove(cloneNode), this);
        instructsMetaData = this.instructsMetaData[this.instructionId];
        if (Helper.isUndefined(instructsMetaData) === false &&
            instructsMetaData.length > 0) {
            attachmentData.uniqueKey = [];
            for (; i < instructsMetaData.length; i += 1) {
                attachmentData.uniqueKey.push(instructsMetaData[i].id);
            }
            formData.append('attachmentInfo', JSON.stringify(attachmentData));
        }
        formData.append('token', this.articleToken);
        formData.append('data', JSON.stringify(saveData));
        rB.setUrl(saveEndPoint);
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(deleteSuccess.bind(this));
        rB.setFailureCallback(saveFailure.bind(this));
        rB.setTimeoutCallback(saveTimedOut.bind(this));
        request = rB.build();
        request.send();
        this.eBus.publish('ActionLog:save',
            {'action': 'instruct-delete', 'instructionId': this.instructionId,
            'attachmentData': attachmentData}, true
        );
    };

    instruction.prototype.setInstructionId = function setInstructionId(id) {
        if (Helper.isString(id) === false) {
            throw new Error('instruction.id.must.be.a.string');
        }
        if (Helper.isEmptyString(id) === true) {
            throw new Error('instruction.id.cannot.be.empty');
        }

        this.instructionId = id;
    };

    instruction.prototype.getData = function getData() {
        var data = {};

        assertRendered(this);
        data.id = this.instructionId;
        data.instruction = getRTEData(this);
        data.files = this.fileIds;

        return data;
    };

    instruction.prototype.setInstruction = function setInstruction(instruction) {
        assertRendered(this);
        this.rte.setData(instruction);
        this.focusOnInstruction();
    };

    instruction.prototype.focusOnInstruction = function focusOnInstruction() {
        assertRendered(this);
        this.rte.focus();
    };

    instruction.prototype.addUploadedFile = function addUploadedFile(
        filename, url, fileId, size
    ) {
        var elem;

        assertRendered(this);
        elem = createUploadedFileElement(this, filename, url, fileId, size);
        this.uploadedFileListContainer.appendChild(elem);
    };

    instruction.prototype.autoSave = function autoSaveFn() {
        if (this.isEnabled === false || this.saveInprogress === true) {
            return;
        }
        this.proceedFn();
    };

    instruction.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.uploadForm.removeEventListener('submit', this.formSubmitFn, false);
        this.fileInput.removeEventListener('change', this.uploadValidate, false);
        this.uploadedFileListContainer.removeEventListener(
            'click', this.fileDeleteFn, false
        );
        this.panel.destroy();
        this.instructionContainer.innerHTML = '';
        this.eBus.unsubscribe('Instruct:Load', this.loadInstruction);
        this.eBus.unsubscribe('Instruct:applyFormatting', this.save);
        this.eBus.unsubscribe('InstructPanel:OnSetEnabled', this.setEnabled);
        this.eBus.unsubscribe('Instruct:Clear', clearFn);
        this.eBus.unsubscribe('InstructPanel:destroy', this.destroy);
        this.eBus.unsubscribe('InstructPanel:SetSelection', this.setSelection,
            this);
        initializeVariables(this);
        eb.publish('Instruct:OnDestroy', this);
    };

    instruction.prototype.setSelection = function setSelection() {
        this.rte.setSelection();
    };

    return instruction;
});

define([
    'scripts/Helper', 'scripts/RichTextEditor', 'scripts/RequestBuilder',
    'scripts/Panel', 'scripts/PerformanceLog', 'scripts/ConfigReader',
    'scripts/Util', 'scripts/ErrorHandler', 'scripts/FeatureToggle'
], function querypanelLoader(
    Helper, RTE, RequestBuilder, Panel, PerformanceLog, Config, Util, ErrorHandler,
    Features
) {
    var performanceLog, queryTemplate, querySuccessMessage,
        startTime, startDate, errorHandler, binaryQueryConfirmMsg;

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + s4();
    }

    queryTemplate = [
        '<div class="pc-query">',
            '<p class="query"></p>',
            '<div class="binary-query">',
                '<span class="info">Reply</span>',
                '<input type="radio" name="binary-query-{{guid}}" class="binary-query-option1">',
                '<label class="binary-query-option1-label"></label>',
                '<input type="radio" name="binary-query-{{guid}}" class="binary-query-option2">',
                '<label class="binary-query-option2-label"></label>',
            '</div>',
            '<div class="answer"></div>',
            /*'<div class="file-upload-container dsfsdfsdfd">',
                '<h5>Attach</h5>',
                '<span class="optional">(optional)</span>',
                '<div class="info">Limit upto <span class="file-upload-limit">0</span>/file</div>',
                '<form class="query-file-form">',
                    '<input type="file" class="query-file">',
                '</form>',
            '</div>',*/
		
			'<div class="uploda-wrapper">',
		'<div class="info">Limit upto <span class="file-upload-limit">0</span>/file</div>',
			'<form class="query-file-form">',
			 '<input id="supportFormFile" class="author-name fileUploadSupport" value="gij, png, jpg, docx, xls, ect" type="file">',
			 
			'</form>',
		'<div class="duplicate-choose">Attach file<span>(optional)</span><p class="limited-access-text">(Limit upto 20 mb)</p></div>',
			'</div>',
		
            '<ul class="query-file-list"></ul>',
            '<div class="buttons-container query-btn-container">',
				'<span class="respond-btn">Respond</span>',
				'<span class="reset-btn">Reset</span>',
            '</div>',
        '</div>'
    ];

    function queryFromTemplate() {
        var id = guid(),
            queryTemp = queryTemplate.join('');

        return queryTemp.replace(/{{guid}}/g, id);
    }

    function createUploadedFileElement(instance, name, url, fileId, size) {
        var elem = instance.htmlDoc.createElement('li'),
            anchor = instance.htmlDoc.createElement('a'),
            delFile = instance.htmlDoc.createElement('a'),
            sizeWrapper = instance.htmlDoc.createElement('span');

        if (Helper.isString(url) === false) {
            throw new Error('query.uploaded.file.url.must.be.string');
        }
        if (Helper.isString(name) === false) {
            throw new Error('query.uploaded.file.name.must.be.string');
        }
        if (Helper.isEmptyString(url) === true) {
            throw new Error('query.uploaded.file.url.cannot.be.empty');
        }
        if (Helper.isEmptyString(name) === true) {
            throw new Error('query.uploaded.file.name.cannot.be.empty');
        }
        anchor.setAttribute('href', url);
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('title', name);
        anchor.classList.add('filename');
        anchor.appendChild(instance.htmlDoc.createTextNode(name));
        delFile.classList.add('delete');
        delFile.dataset.id = fileId;
        delFile.appendChild(instance.htmlDoc.createTextNode('x'));
        elem.appendChild(anchor);
        sizeWrapper.appendChild(instance.htmlDoc.createTextNode(' [' + size + ']'));
        sizeWrapper.classList.add('size');
        elem.appendChild(sizeWrapper);
        elem.appendChild(delFile);

        return elem;
    }

    function initializeVariables(instance) {
        instance.answerContainer = null;
        instance.queryId = null;
        instance.articleToken = null;
        instance.question = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.isBinaryQuery = false;
        instance.queryContainer = null;
        instance.questionContainer = null;
        instance.binaryQueryContainer = null;
        instance.binaryQueryLabel1 = null;
        instance.binaryQueryLabel2 = null;
        instance.binaryQueryValue = null;
        instance.binaryQueryValue1 = null;
        instance.binaryQueryValue2 = null;
        instance.binaryQueryOption1 = null;
        instance.binaryQueryOption2 = null;
        instance.binaryQueryOption1Editable = false;
        instance.binaryQueryOption2Editable = false;
        instance.rte = null;
        instance.uploadUri = null;
        instance.saveQuery = null;
        instance.deleteUri = null;
        instance.fileInput = null;
        instance.clearFn = null;
        instance.uploadFn = null;
        instance.formSubmitFn = null;
        instance.uploadForm = null;
        instance.uploadedFileListContainer = null;
        instance.requestQueue = null;
        instance.requestBuilder = null;
        instance.selectedBinaryOption = null;
        instance.fileIds = [];
        instance.panel = null;
        instance.uploadFileWhiteList = null;
        instance.maxUploadFileSize = null;
        instance.fileUploadLimit = null;
        instance.uploadValidate = null;
        instance.uploadedFiles = null;
        instance.isQueryAnswered = false;
        instance.scrollToQueryLocationFn = null;
        instance.attachmentsOptional = null;
        instance.attachmentsHeader = null;
        instance.s3UploadFormUpload = null;
        binaryQueryConfirmMsg = Config.getLocaleByKey(
            'binary.query.confirm.message'
        );
        instance.proceedFn = null;
        instance.content = null;
        instance.hasChange = false;
        instance.attachmentContainer = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('query.not.rendered');
        }
    }

    function verifyUploadOptions(uploadOptions) {
        if (Helper.isObject(uploadOptions) === false) {
            throw new Error('query.uploadOptions.must.be.an.object');
        }
        if (Helper.objectHasKey(uploadOptions, 'uri') === false) {
            throw new Error('query.upload.uri.is.mandatory');
        }
        if (Helper.objectHasKey(uploadOptions, 'deleteUri') === false) {
            throw new Error('query.delete.uri.is.mandatory');
        }
        if (Helper.isString(uploadOptions.uri) === false) {
            throw new Error('query.upload.uri.must.be.a.string');
        }
        if (Helper.isString(uploadOptions.deleteUri) === false) {
            throw new Error('query.delete.uri.must.be.a.string');
        }
        if (Helper.isEmptyString(uploadOptions.uri) === true) {
            throw new Error('query.upload.uri.cannot.be.empty');
        }
        if (Helper.isEmptyString(uploadOptions.deleteUri) === true) {
            throw new Error('query.delete.uri.cannot.be.empty');
        }
    }

    function clearForm(instance) {
        instance.fileInput.value = '';
    }

    function enableForm(instance) {
        instance.fileInput.disabled = false;
        instance.binaryQueryOption1.disabled = false;
        instance.binaryQueryOption2.disabled = false;
        instance.uploadForm.classList.remove('disable');
    }

    function disableForm(instance) {
        instance.fileInput.disabled = true;
        instance.binaryQueryOption1.disabled = true;
        instance.binaryQueryOption2.disabled = true;
        instance.uploadForm.classList.add('disable');
    }

    function disableFileList(instance) {
        var fileListCont = instance.uploadedFileListContainer,
            qs = fileListCont.querySelectorAll.bind(fileListCont),
            elems = qs('.delete'),
            len = elems.length,
            i = 0;

        for (; i < len; i += 1) {
            elems[i].classList.add('disabled');
        }
    }

    function enableFileList(instance) {
        var fileListCont = instance.uploadedFileListContainer,
            qs = fileListCont.querySelectorAll.bind(fileListCont),
            elems = qs('.delete'),
            len = elems.length,
            i = 0;

        for (; i < len; i += 1) {
            elems[i].classList.remove('disabled');
        }
    }

    function cancelFormSubmit(evt) {
        evt.preventDefault();
    }

    function bindCollectionTosave(data, token) {
        var queryData = {},
            dataContainer = {};

        queryData.id = data.id;
        queryData.question = data.question;
        queryData.answer = data.answer;
        queryData.option = data.option;
        dataContainer[data.id] = queryData;
        return JSON.stringify({
            'query': dataContainer,
            'token': token
        });
    }

    function proceedSuccess() {
        var data = this.getData();

        enableForm(this);
        this.isQueryAnswered = true;
        this.setLoading(false);
        this.setEnabled(true);
        this.content = data.answer;
        this.hasChange = false;
        this.renderAttachmentHeader();
        performanceLog.pushLoadTimeline('Save', startTime, startDate);
        this.eBus.publish('QueryBag:SetReply', data.id, data.answer);
        this.eBus.publish('Query:onproceedSuccess', data);
        this.eBus.publish('FlashMessage:show',
            querySuccessMessage.replace('{{queryName}}', data.id),
            {'closeButton': false, 'success': true}
        );
    }

    function proceedFailure() {
        this.setLoading(false);
        this.eBus.publish('Query:onUploadFail', this);
        throw new Error('query.save.failed');
    }

    function proceedTimedOut() {
        this.setLoading(false);
        throw new Error('query.save.timed.out');
    }

    function saveQueryToServer(instance) {
        var request, saveData, data = instance.getData(), rb = instance.requestBuilder,
            queue = instance.requestQueue, token = instance.articleToken,
            formData = new FormData();

        instance.eBus.publish('ActionLog:save',
            {'action': 'query-save', 'data': data}
        );
        saveData = bindCollectionTosave(data, token);
        formData.append('input', saveData);

        rb.setUrl(instance.saveQuery);
        rb.setMethod('POST');
        rb.setData(formData);
        startTime = new Date().getTime();
        startDate = new Date().toString();
        rb.setSuccessCallback(proceedSuccess.bind(instance));
        rb.setFailureCallback(proceedFailure.bind(instance));
        rb.setTimeoutCallback(proceedTimedOut.bind(instance));
        request = rb.build();
        disableForm(instance);
        queue.send(request);
    }

    function uploadSuccess(responseText) {
        var responseData = JSON.parse(responseText), newUploadedFile;

        this.addUploadedFile(
            responseData.data.fileName,
            responseData.data.downloadUrl,
            responseData.data.uuid,
            responseData.data.size
        );
        newUploadedFile = {
            'name': responseData.data.fileName,
            'id': responseData.data.uuid,
            'size': responseData.data.size,
            'url': responseData.data.downloadUrl
        };
        if (this.uploadedFiles === null) {
            this.uploadedFiles = [];
        }
        this.uploadedFiles.push(newUploadedFile);
        this.renderAttachmentHeader();
        saveQueryToServer(this);
        clearForm(this);
        this.setLoading(false);
        this.setEnabled(true);
        this.eBus.publish('Query:onUpload', this);
    }

    /*
        TODO: Failure and retry scenarios must be tested.
    */
    function uploadFailure() {
        //TODO: Log responseText to server
        enableForm(this);
        this.setLoading(false);
        this.eBus.publish('Query:onUploadFail', this);
        throw new Error('query.file.upload.failed');
    }

    /*
        TODO: Timeout and retry scenarios must be tested.
    */
    function uploadTimedOut() {
        //TODO: Log Time out info to server
        enableForm(this);
        this.setLoading(false);
        this.eBus.publish('Query:onUploadTimeout', this);
        throw new Error('query.file.upload.timed.out');
    }

    function checkUploadSizeAndType(instance, file) {
        var size = file.files[0].size,
            filename = file.files[0].name,
            ext = filename.split('.').pop();

        ext = ext.toLowerCase();
        if (Helper.isUndefined(ext) === true ||
            instance.uploadFileWhiteList.indexOf(ext) === -1) {
            file.value = '';
            throw new Error('upload.file.type');
        }
        if (Helper.isUndefined(size) === true ||
            (instance.maxUploadFileSize < size)
        ) {
            file.value = '';
            throw new Error('upload.file.max.size');
        }

        if (Helper.isUndefined(size) === true ||
            (size <= 0)
        ) {
            file.value = '';
            throw new Error('upload.file.min.size');
        }
    }

    function checkFileAlreadyExists(instance, file) {
        var i = 0, uploadedFileLength,
            uploadedFile = instance.uploadedFiles,
            name = file.files[0].name;

        if (Helper.isUndefined(uploadedFile) === true ||
            uploadedFile === null
        ) {
            return;
        }
        uploadedFileLength = uploadedFile.length;
        for (; i < uploadedFileLength; i += 1) {
            if (uploadedFile[i].name === name) {
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
        // For Demo - Start
        //this.uploadFn();
        var response,
            file = input.target.files[0];

        response = '{"data":{"fileName":"' + file.name + '","downloadUrl":"#","uuid":"1","size":' + file.size + '}}';
        uploadSuccess.call(this, response);
        // For Demo - end
    }

    function uploadFileToServerFromS3(referenceId, fileName, instance) {
        var request,
            fd = new FormData(),
            rB = new RequestBuilder();

        fd.append('category', 'Query');
        fd.append('name', fileName);
        fd.append('referenceId', referenceId);
        fd.append('token', instance.articleToken);
        rB.setUrl(Config.getRoute('s3UploadCallback'));
        rB.setMethod('POST');
        rB.setData(fd);
        rB.setSuccessCallback(uploadSuccess.bind(instance));
        rB.setFailureCallback(uploadFailure.bind(instance));
        rB.setTimeoutCallback(uploadTimedOut.bind(instance));
        request = rB.build();
        instance.setLoading(true);
        request.send();
    }

    function uploadFile() {
        var fd = new FormData(), request, uploadInputKey,
            file = this.fileInput,
            self = this,
            rb = this.requestBuilder,
            queue = this.requestQueue,
            s3Upload = this.s3UploadFormUpload;

        if (file.files.length === 0) {
            saveQueryToServer(this);
            return;
        }
        this.setLoading(true);
        this.setEnabled(false);
        this.eBus.publish('ActionLog:save',
            {'action': 'query-file-upload', 'query': this.queryId,
            'fileName': file.files[0].name}, true
        );
        if (Helper.isUndefined(s3Upload) === false) {
            for (uploadInputKey in s3Upload.inputs) {
                fd.append(uploadInputKey, s3Upload.inputs[uploadInputKey]);
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
                        self.s3UploadFormUpload.filePath + '/' + self.articleToken + '/', ''
                    );
                }
                uploadFileToServerFromS3(self.getData().id, fileName, self);
            });
            rb.setFailureCallback(function failureCallback(res) {
                enableForm(self);
                self.setLoading(false);
                throw new Error('query.save.failed');
            });
            rb.setTimeoutCallback(uploadTimedOut.bind(this));
            request = rb.build();
            request.setResponseType('document');
            queue.send(request);
        }
        else {
            fd.append('uploadFile', file.files[0]);
            fd.append('category', 'Query');
            fd.append('name', file.files[0].name);
            fd.append('referenceId', this.getData().id);
            fd.append('token', this.articleToken);
            fd.append('submit', 'true');

            rb.setUrl(this.uploadUri);
            rb.setMethod('POST');
            rb.setData(fd);
            rb.setSuccessCallback(uploadSuccess.bind(this));
            rb.setFailureCallback(uploadFailure.bind(this));
            rb.setTimeoutCallback(uploadTimedOut.bind(this));
            request = rb.build();
            disableForm(this);
            queue.send(request);
        }
    }

    function updateUploadedFiles(instance, fileId) {
        var i = 0;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (instance.uploadedFiles[i].id === fileId) {
                instance.uploadedFiles.splice(i, 1);
            }
        }
    }

    function getUploadedFileDetails(instance, fileId) {
        var i = 0;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (instance.uploadedFiles[i].id === fileId) {
                return instance.uploadedFiles[i];
            }
        }
        return null;
    }

    function deleteFile(event) {
        var fileDetails, request, fileId, filename,
            elem = event.target,
            rb = this.requestBuilder,
            queue = this.requestQueue,
            fd = new FormData(),
            self = this,
            uniquekeyData = [],
            getFileElem = function getfileElement(fileId) {
                var cont = self.uploadedFileListContainer,
                    qs = cont.querySelector.bind(cont);

                return qs('a[data-id="' + fileId + '"]');
            },
            failCallback = function failCallback() {
                var element;

                /*
                    TODO: Log to server
                */
                element = getFileElem(fileId);
                if (element !== null) {
                    element.classList.remove('disabled');
                }
                self.setLoading(false);
                self.eBus.publish('Query:onFileDeleteFail', self, fileId);
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

        this.setLoading(true);
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
            var cont = self.uploadedFileListContainer, index, element;

            element = getFileElem(fileId);
            if (element !== null) {
                cont.removeChild(element.parentNode);
            }
            index = self.fileIds.indexOf(fileId);
            self.fileIds.splice(index, 1);
            self.setLoading(false);
            updateUploadedFiles(self, fileId);
            self.renderAttachmentHeader();
            self.eBus.publish('Query:onFileDeleted', self, fileId);
        });
        rb.setFailureCallback(failCallback);
        rb.setTimeoutCallback(failCallback);
        request = rb.build();
        queue.send(request);
    }

    function scrollToQueryLocationFn() {
        var locatorTag,
            targetTagName = 'span';

        locatorTag = 'L' + this.queryId;
        this.eBus.publish(
            'Editor:ScrollTo', targetTagName, locatorTag, 'query');
        this.eBus.publish(
            'Supplementary:ScrollTo', targetTagName, locatorTag, 'query');
    }

    function getRTEData(instance) {
        return instance.rte.getData({
            'encodeHtml': true,
            'sanitize': true,
            'extraWhitelistedTags': ['br']
        });
    }

    function hideBinaryQuery(instance) {
        instance.binaryQueryContainer.style.display = 'none';
        instance.binaryQueryOption1.checked = false;
        instance.binaryQueryOption2.checked = false;
    }

    function showBinaryQuery(instance) {
        instance.binaryQueryContainer.style.display = 'block';
        instance.binaryQueryOption1.checked = false;
        instance.binaryQueryOption2.checked = false;
    }

    function checkChanges(data) {
        if (this.content !== data) {
            this.hasChange = true;
        }
    }

    function proceedFn() {
        var data = this.getData();

        checkChanges.call(this, data.answer);
        if (this.isEnabled === false || this.hasChange === false) {
            return;
        }
        if (Util.checkCKEditorEmpty(
                Helper.stringTrim(data.answer), this.htmlDoc
            ) === true
        ) {
            if (this.isQueryAnswered === true) {
                this.eBus.publish('QueryPanel:Empty', this.queryId);
                throw new Error('query.panel.empty.answer');
            }
            return;
        }
        this.setLoading(true);
        this.setEnabled(false);
        saveQueryToServer(this);
    }

    function rteErrorCallback(e) {
        errorHandler.handleErrors(e);
    }

    function query(
        cont, doc, win, eventBus, queue, uploadOptions, articleToken,
        currentActor
    ) {
        if (win instanceof win.Window === false) {
            throw new Error('query.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('query.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('query.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('query.requires.eventbus');
        }
        verifyUploadOptions(uploadOptions);
        initializeVariables(this);
        querySuccessMessage = Config.getLocaleByKey('query.save.success');
        this.requestQueue = queue;
        this.uploadUri = uploadOptions.uri;
        this.saveQuery = uploadOptions.saveQuery;
        this.deleteUri = uploadOptions.deleteUri;
        this.queryContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.articleToken = articleToken;
        this.currentActor = currentActor;
        performanceLog = new PerformanceLog(
            this.articleToken, this.currentActor
        );
        this.eBus.subscribe('Query:setReadonly', this.setReadonly, this);
        this.eBus.subscribe('Query:disableReadonly', this.disableReadonly, this);
        errorHandler = new ErrorHandler(this.global, this.htmlDoc);
    }

    query.prototype.setS3FormUpload = function setS3FormUpload(s3FormData) {
        this.s3UploadFormUpload = s3FormData;
    };

    query.prototype.setEnabled = function setEnabled(enable) {
        if (enable === false) {
            disableForm(this);
            disableFileList(this);
            this.rte.setReadOnly();
            this.isEnabled = false;
        }
        else {
            enableForm(this);
            enableFileList(this);
            this.rte.setEditable();
            this.isEnabled = true;
        }
    };
    //TODO: added for server failure readonly mode.
    query.prototype.setReadonly = function setReadonly() {
        this.setEnabled(false);
    };

    query.prototype.disableReadonly = function disableReadonly() {
        this.setEnabled(true);
    };

    query.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.queryContainer;
    };

    query.prototype.renderAttachmentHeader = function renderAttachmentHeader() {
        var len;

        if (this.uploadedFiles === null) {
            return;
        }
        len = this.uploadedFiles.length;

        if (len > 0) {
            this.attachmentsHeader.innerHTML = 'Attachments';
            this.attachmentsOptional.classList.add('hide');
        }
        else {
            this.attachmentsHeader.innerHTML = 'Attach';
            this.attachmentsOptional.classList.remove('hide');
        }
    };

    query.prototype.getData = function getData() {
        var data = {};

        assertRendered(this);
        data.id = this.queryId;
        data.question = this.question;
        data.option = this.binaryQueryValue;
        data.answer = getRTEData(this);
        data.isBinary = this.isBinaryQuery;
        if (this.isBinaryQuery === true) {
            data.binaryAcceptedValue = this.selectedBinaryOption;
        }
        data.files = this.fileIds;

        return data;
    };

    query.prototype.render = function render() {
        var qs = this.queryContainer.querySelector.bind(this.queryContainer),
            frag = this.htmlDoc.createDocumentFragment(), child,
            tmpNode = document.createElement('div'),
            limit = Helper.formatBytes(this.maxUploadFileSize);

        if (this.isRendered === true) {
            throw new Error('query.already.rendered');
        }
        this.requestBuilder = new RequestBuilder();

        this.panel = new Panel(
            this.queryContainer, this.htmlDoc, this.global, this.eBus
        );
        tmpNode.innerHTML = queryFromTemplate();
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panel.render();
        this.panel.add(frag);
        this.queryContainer.appendChild(this.panel.getElement());
        this.questionContainer = qs('.pc-query .query');
        this.binaryQueryContainer = qs('.pc-query .binary-query');
        this.binaryQueryOption1 = qs('.pc-query .binary-query-option1');
        this.binaryQueryOption2 = qs('.pc-query .binary-query-option2');
        this.binaryQueryLabel1 = qs('.pc-query .binary-query-option1-label');
        this.binaryQueryLabel2 = qs('.pc-query .binary-query-option2-label');
        this.fileUploadLimit = qs('.pc-query .file-upload-limit');
        this.answerContainer = qs('.pc-query .answer');
        this.fileInput = qs('.pc-query input[type="file"]');
        this.uploadForm = qs('.pc-query .query-file-form');
        this.attachmentsOptional = qs(
            '.pc-query .file-upload-container .optional'
        );
        this.attachmentsHeader = qs('.pc-query .file-upload-container h5');
        this.attachmentContainer = qs('.pc-query .file-upload-container');
        this.uploadedFileListContainer = qs('.pc-query .query-file-list');
        this.rte = new RTE(this.global, this.htmlDoc, this.answerContainer,
            {
                'allowedContent': 'b i sub sup span(smallcaps,mono)',
                'height': '110px'
            }
        );
        this.rte.render();
        this.rte.setErrorCallback(rteErrorCallback);
        this.uploadFn = uploadFile.bind(this);
        this.fileDeleteFn = deleteFile.bind(this);
        this.proceedFn = proceedFn.bind(this);
        this.formSubmitFn = cancelFormSubmit.bind(this);
        this.scrollToQueryLocationFn = scrollToQueryLocationFn.bind(this);
        this.uploadValidate = uploadValidate.bind(this);
        this.uploadForm.addEventListener('submit', this.formSubmitFn, false);
        this.uploadedFileListContainer.addEventListener(
            'click', this.fileDeleteFn, false
        );
        this.binaryQueryOption1Fn = this.binaryQueryOption1Fn.bind(this);
        this.binaryQueryOption2Fn = this.binaryQueryOption2Fn.bind(this);
        this.binaryQueryOption1.addEventListener(
            'click', this.binaryQueryOption1Fn, false
        );
        this.binaryQueryOption2.addEventListener(
            'click', this.binaryQueryOption2Fn, false
        );
        this.fileInput.addEventListener(
            'change', this.uploadValidate, false
        );
        this.questionContainer.addEventListener(
            'click', this.scrollToQueryLocationFn, false
        );
        hideBinaryQuery(this);
        if (limit !== null) {
            this.fileUploadLimit.innerHTML = limit;
        }
        if (Features.isFeatureEnabled('Editor.Query.Attach') === false) {
            this.attachmentContainer.classList.add('hide');
        }
        this.isRendered = true;
        this.isEnabled = true;
        this.rte.observeKeyEvent({'13': this.proceedFn});
        this.eBus.publish('Query:OnRender', this);
    };

    query.prototype.binaryQueryOption1Fn = function binaryQueryOption1Fn() {
        var data = this.getData();

        if (this.rte.isEditable() === false && data.answer !== '') {
            if (this.global.confirm(binaryQueryConfirmMsg) === false) {
                this.binaryQueryOption2.checked = true;
                return;
            }
        }

        this.binaryQueryValue = this.binaryQueryValue1;
        this.hasChange = true;
        if (this.binaryQueryOption1Editable === true) {
            this.rte.clear();
            this.rte.setEditable();
        }
        else {
            this.rte.setReadOnly();
            this.setAnswer(this.binaryQueryOption1.value);
        }
    };

    query.prototype.binaryQueryOption2Fn = function binaryQueryOption2Fn() {
        var data = this.getData();

        if (this.rte.isEditable() === false && data.answer !== '') {
            if (this.global.confirm(binaryQueryConfirmMsg) === false) {
                this.binaryQueryOption1.checked = true;
                return;
            }
        }

        this.binaryQueryValue = this.binaryQueryValue2;
        this.hasChange = true;
        if (this.binaryQueryOption2Editable === true) {
            this.rte.clear();
            this.rte.setEditable();
        }
        else {
            this.rte.setReadOnly();
            this.setAnswer(this.binaryQueryOption2.value);
        }
    };

    query.prototype.setLoading = function setLoading(loading) {
        this.panel.setLoading(loading);
    };

    query.prototype.setQueryId = function setQueryId(id) {
        if (Helper.isString(id) === false) {
            throw new Error('query.id.must.be.a.string');
        }
        if (Helper.isEmptyString(id) === true) {
            throw new Error('query.id.cannot.be.empty');
        }

        if (this.queryId !== null) {
            throw new Error('query.id.cannot.be.set.more.than.once');
        }

        this.queryId = id;
    };

    query.prototype.getQueryId = function getQueryId() {
        return this.queryId;
    };

    query.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('query.title.must.be.a.string');
        }
        this.panel.setTitle(title);
    };

    query.prototype.setBinaryMode = function setBinaryMode(options) {
        assertRendered(this);
        if (Helper.isObject(options) === false) {
            throw new Error('query.binary.query.options.must.be.an.object');
        }
        if (Helper.objectHasKey(options, 'label1') === false) {
            throw new Error('query.binary.query.label1.is.mandatory');
        }
        if (Helper.objectHasKey(options, 'value1') === false) {
            throw new Error('query.binary.query.value1.is.mandatory');
        }
        if (Helper.objectHasKey(options, 'option1Editable') === false) {
            throw new Error('query.binary.query.option1Editable.is.mandatory');
        }
        if (Helper.objectHasKey(options, 'label2') === false) {
            throw new Error('query.binary.query.label2.is.mandatory');
        }
        if (Helper.objectHasKey(options, 'value2') === false) {
            throw new Error('query.binary.query.value2.is.mandatory');
        }
        if (Helper.objectHasKey(options, 'option2Editable') === false) {
            throw new Error('query.binary.query.option2Editable.is.mandatory');
        }

        this.binaryQueryLabel1.innerHTML = '';
        this.binaryQueryLabel1.appendChild(
            this.htmlDoc.createTextNode(options.label1)
        );
        this.binaryQueryLabel2.innerHTML = '';
        this.binaryQueryLabel2.appendChild(
            this.htmlDoc.createTextNode(options.label2)
        );
        this.binaryQueryOption1.value = options.label1;
        this.binaryQueryOption2.value = options.label2;
        this.binaryQueryValue1 = options.value1;
        this.binaryQueryValue2 = options.value2;
        this.binaryQueryOption1Editable = options.option1Editable;
        this.binaryQueryOption2Editable = options.option2Editable;
        showBinaryQuery(this);
    };

    query.prototype.setBinaryAnswer = function setBinaryAnswer(options) {
        assertRendered(this);
        if (Helper.isObject(options) === false) {
            throw new Error('query.binary.query.answer.options.must.be.an.object');
        }
        if (Helper.objectHasKey(options, 'option') === false) {
            throw new Error('query.binary.query.answer.option.is.mandatory');
        }
        if (options.accept === false && Helper.objectHasKey(options, 'value') === false) {
            throw new Error('query.binary.query.answer.value.is.mandatory');
        }
        this.selectedBinaryOption = options.value;
        this.binaryQueryValue = options.option;
        if (options.option === this.binaryQueryValue1) {
            this.binaryQueryOption1.checked = true;
            this.rte.setReadOnly();
        }
        else {
            this.binaryQueryOption2.checked = true;
            this.rte.clear();
            this.rte.setEditable();
        }
        this.setAnswer(options.answer);
    };

    query.prototype.setQuestion = function setQuestion(question) {
        assertRendered(this);
        this.question = question;
        this.questionContainer.innerHTML = question;
    };

    query.prototype.setAnswer = function setAnswer(answer) {
        assertRendered(this);
        this.rte.setData(answer);
        this.content = answer;
    };

    query.prototype.setAnswered = function setAnswered(bool) {
        this.isQueryAnswered = bool;
    };

    query.prototype.isAnswered = function isAnswered() {
        return this.isQueryAnswered;
    };

    query.prototype.focusOnAnswer = function focusOnAnswer() {
        assertRendered(this);
        this.rte.focus();
    };

    query.prototype.setUploadLimit = function setUploadLimit(size) {
        this.maxUploadFileSize = size;
    };

    query.prototype.setUploadType = function setUploadType(types) {
        this.uploadFileWhiteList = types;
    };

    query.prototype.setUploadedFiles = function setUploadedFiles(files) {
        var tot,
            i = 0;

        this.uploadedFiles = files;
        tot = this.uploadedFiles.length;
        for (; i < tot; i += 1) {
            this.addUploadedFile(
                files[i].name, files[i].url, files[i].id, files[i].size
            );
        }
    };

    query.prototype.addUploadedFile = function addUploadedFile(
        filename, url, fileId, size
    ) {
        var elem;

        assertRendered(this);
        if (this.uploadedFileListContainer.hasChildNodes() === false) {
            this.uploadedFileListContainer.innerHTML = '';
        }

        elem = createUploadedFileElement(
            this, filename, url, fileId, Helper.formatBytes(size, 2)
        );
        this.uploadedFileListContainer.appendChild(elem);
        this.fileIds.push(fileId);
        this.renderAttachmentHeader();
    };

    query.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.rte.destroy();
        this.uploadForm.removeEventListener('submit', this.formSubmitFn, false);
        this.uploadedFileListContainer.removeEventListener(
            'click', this.fileDeleteFn, false
        );
        this.binaryQueryOption1.removeEventListener(
            'click', this.binaryQueryOption1Fn, false
        );
        this.binaryQueryOption2.removeEventListener(
            'click', this.binaryQueryOption2Fn, false
        );
        this.fileInput.removeEventListener(
            'change', this.uploadValidate, false
        );
        this.questionContainer.removeEventListener(
            'click', this.scrollToQueryLocationFn, false
        );
        this.panel.destroy();
        this.queryContainer.innerHTML = '';
        this.eBus.unsubscribe('Query:setReadonly', this.setReadonly);
        initializeVariables(this);
        eb.publish('Query:OnDestroy');
    };

    return query;
});

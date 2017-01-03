define(['scripts/ConfigReader', 'scripts/Helper', 'scripts/RequestBuilder',
        'scripts/TemplateHelper', 'templates/ArticleDetails',
         'scripts/Dialog', 'templates/Header', 'templates/Main',
        'templates/Footer', 'scripts/templates/Locale', 'templates/Attachments',
        'templates/OfflineProofCorrector', 'templates/OfflineProofValidator',
        'scripts/Connectivity'
        ],
function OfflinepageLoader(
    Config, Helper, RequestBuilder, TemplateHelper, ArticleDetailsTemplate,
    Dialog, HeaderTemplate, MainTemplate, FooterTemplate, LocaleTemplate,
    AttachmentsTemplate, OfflineProofCorrectorTemplate,
    OfflineProofValidatorTemplate, Connectivity
) {
    var attachmentCompiledTemplate;

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.token = null;
        instance.eBus = null;
        instance.templateContainer = null;
        instance.isRendered = false;
        instance.metaData = null;
        instance.submitButton = null;
        instance.submitClick = null;
        instance.uploadFile = null;
        instance.deleteClick = null;
        instance.uploadValidate = null;
        instance.footerContainer = null;
        instance.attachmentListContainer = null;
        instance.attachmentContainer = null;
        instance.templates = {};
        instance.fileInput = null;
        instance.locale = null;
        instance.maxUploadFileSize = null;
        instance.uploadFileWhiteList = null;
        instance.requestBuilder = null;
        instance.uploadedFiles = [];
        instance.annotateFileExtension = 'pdf';
        instance.annotateFileName = null;
    }

    function Offlinepage(
        Win, Doc, EventBus, Token, TemplateContainer, Locale
    ) {
        if (Win instanceof Win.Window === false) {
            throw new Error('offlinepage.window.missing');
        }
        if (Doc instanceof Win.Document === false) {
            throw new Error('offlinepage.document.missing');
        }
        if (Helper.isFunction(EventBus.subscribe) === false) {
            throw new Error('offlinepage.eventbus.missing');
        }
        if (Helper.isEmptyString(Token) === true) {
            throw new Error('offlinepage.token.empty');
        }
        if (TemplateContainer instanceof Win.HTMLElement === false) {
            throw new Error('offlinepage.container.not.htmlelement');
        }
        initializeVariables(this);
        this.win = Win;
        this.htmlDoc = Doc;
        this.eBus = EventBus;
        this.token = Token;
        this.templateContainer = TemplateContainer;
        this.locale = Locale;
        this.templates.proofCorrector = OfflineProofCorrectorTemplate;
        this.templates.proofValidator = OfflineProofValidatorTemplate;
        this.templates.queryReplier = OfflineProofValidatorTemplate;
        this.templates.proofEditor = OfflineProofValidatorTemplate;
    }

    function updateLocaleLink(localeList, facadeLink, instance) {
        var i = 0, localeLinkElement, localeLink, localeName, localePrefix,
            spanElement, currentLocale,
            length = localeList.length;

        currentLocale = Config.get('currentLocale');
        for (; i < length; i += 1) {
            localeLinkElement = localeList[i];
            localeName = localeLinkElement.getAttribute('data-name');
            localePrefix = localeName.substring(0, 2);
            localeLink = facadeLink.replace('{{locale}}', localePrefix);
            if (currentLocale === localeName) {
                spanElement = instance.htmlDoc.createElement('span');
                spanElement.innerHTML = localeLinkElement.innerHTML;
                spanElement.classList.add('locale-link');
                spanElement.classList.add('active');
                localeLinkElement.parentNode.replaceChild(
                    spanElement, localeLinkElement
                );
            }
            else {
                localeLinkElement.setAttribute('href', localeLink);
            }
        }
    }

    function renderLocale(instance) {
        var facadeLink, localeList,
            token = instance.token,
            actor = instance.metaData.actor;

        localeList = instance.templateContainer.querySelectorAll('.locale-link');
        facadeLink = Config.getRoute('offlineLink');
        facadeLink = facadeLink.replace('{{token}}', token);
        facadeLink = facadeLink.replace('{{actor}}', actor);
        updateLocaleLink(localeList, facadeLink, instance);
    }

    function removeUploadFile(instance, fileId) {
        var i = 0,
            id = fileId;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (instance.uploadedFiles[i].id === id) {
                instance.uploadedFiles.splice(i, 1);
            }
        }
    }

    function getUploadFile(instance, fileId) {
        var i = 0,
            id = fileId;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (instance.uploadedFiles[i].id === id) {
                return instance.uploadedFiles[i];
            }
        }
        return null;
    }

    function getUploadFileByName(instance, name) {
        var i = 0;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (instance.uploadedFiles[i].name === name) {
                return instance.uploadedFiles[i];
            }
        }
        return null;
    }

    function clearForm(instance) {
        instance.fileInput.value = '';
    }

    function renderAttachment(instance) {
        var template,
            data = {};

        data.attachments = instance.uploadedFiles;
        data.readOnly = instance.metaData.readOnly;
        data.annotateFileName = instance.annotateFileName;
        data.actor = instance.metaData.actor;
        template = attachmentCompiledTemplate(data);
        instance.attachmentListContainer.innerHTML = template;
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
            instance.maxUploadFileSize < size) {
            file.value = '';
            throw new Error('upload.file.max.size');
        }

        if (Helper.isUndefined(size) === true || size <= 0) {
            file.value = '';
            throw new Error('upload.file.min.size');
        }
    }

    function checkFileAlreadyExists(instance, file) {
        var i = 0,
            uploadedFile = instance.uploadedFiles,
            name = file.files[0].name,
            confirmMessage = Config.getLocaleByKey(
                'offline.page.file.exists.replace'
            ),
            uploadedFileLength;

        if (Helper.isUndefined(uploadedFile) === true ||
            uploadedFile === null) {
            return;
        }
        uploadedFileLength = uploadedFile.length;
        for (; i < uploadedFileLength; i += 1) {
            if (uploadedFile[i].name === name) {
                if (confirm(confirmMessage) === false) {
                    clearForm(instance);
                    throw new Error('upload.terminated');
                }
            }
        }
    }

    function uploadValidate(input) {
        if (Helper.isUndefined(input.target.files[0]) === true) {
            return;
        }
        if (Connectivity.getStatus() === false) {
            return;
        }
        checkUploadSizeAndType(this, input.target);
        checkFileAlreadyExists(this, input.target);
        this.uploadFile();
    }

    function uploadSuccess(responseText) {
        var fileExists,
            responseData = JSON.parse(responseText),
            newUploadedFile = {
                'name': responseData.data.fileName,
                'id': responseData.data.uuid,
                'size': Helper.formatBytes(responseData.data.size),
                'url': responseData.data.downloadUrl
            };

        if (this.uploadedFiles === null) {
            this.uploadedFiles = [];
        }
        fileExists = getUploadFile(this, newUploadedFile.id);
        if (fileExists !== null) {
            removeUploadFile(this, newUploadedFile.id);
        }
        this.uploadedFiles.push(newUploadedFile);
        renderAttachment(this);
        this.setLoading(false);
    }

    function uploadFailure() {
        this.setLoading(false);
        throw new Error('offline.file.upload.failed');
    }

    function uploadTimedOut() {
        this.setLoading(false);
        throw new Error('offline.file.upload.timed.out');
    }

    function deleteFailure() {
        this.setLoading(false);
        throw new Error('offline.file.delete.failed');
    }

    function getFileElem(instance, fId) {
        var cont = instance.attachmentListContainer,
            qs = cont.querySelector.bind(cont);

        return qs('[data-id="' + fId + '"]');
    }

    function deleteFile(event) {
        var filename, fileDetails, request, fileId, uniqueKey,
            elem = event.target,
            url = Config.getRoute('attachmentRemove'),
            rb = this.requestBuilder,
            fd = new FormData(),
            self = this,
            uniquekeyData = [],
            confirmMessage = Config.getLocaleByKey('offline.page.want.delete');

        if (Connectivity.getStatus() === false) {
            return;
        }
        fileId = elem.dataset.id;
        elem = getFileElem(this, fileId);
        if (elem === null) {
            return;
        }
        fileDetails = getUploadFile(this, fileId);
        filename = fileDetails.name;
        uniqueKey = fileDetails.id;

        if (confirm(
            confirmMessage + filename + '?'
        ) === false) {
            return;
        }

        if (elem.classList.contains('delete') === false) {
            return;
        }

        this.setLoading(true);
        uniquekeyData.push(uniqueKey);
        fd.append('data', JSON.stringify({
            'token': this.token,
            'uniqueKey': uniquekeyData,
            'category': 'Offline proofing generic'
        }));
        rb.setUrl(url);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function deleteSuccess() {
            var cont = self.attachmentListContainer;

            if (elem !== null) {
                cont.removeChild(elem.parentNode.parentNode);
            }
            self.setLoading(false);
            removeUploadFile(self, fileId);
            renderAttachment(self);
        });
        rb.setFailureCallback(deleteFailure.bind(this));
        rb.setTimeoutCallback(deleteFailure.bind(this));
        request = rb.build();
        request.send();
        clearForm(this);
    }

    function uploadFile() {
        var request, fileExists,
            file = this.fileInput,
            fd = new FormData(),
            url = Config.getRoute('attachmentAdd'),
            rb = this.requestBuilder;

        if (file.files.length === 0) {
            return false;
        }
        fileExists = getUploadFileByName(this, file.files[0].name);
        this.setLoading(true);
        fd.append('uploadFile', file.files[0]);
        fd.append('category', 'Offline proofing generic');
        fd.append('name', file.files[0].name);
        fd.append('referenceId', 'offlinefiles');
        fd.append('token', this.token);
        if (fileExists !== null) {
            fd.append('uniqueKey', fileExists.id);
        }

        rb.setUrl(url);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(uploadSuccess.bind(this));
        rb.setFailureCallback(uploadFailure.bind(this));
        rb.setTimeoutCallback(uploadTimedOut.bind(this));
        request = rb.build();
        request.send();
        clearForm(this);
    }

    function checkAnnoateFileExists(instance) {
        var i = 0;

        for (; i < instance.uploadedFiles.length; i += 1) {
            if (
                instance.uploadedFiles[i].name === instance.annotateFileName
            ) {
                return true;
            }
        }
        return false;
    }

    function submit(instance) {
        var request, submitMessage,
            fd = new FormData(),
            url = Config.getRoute('submitEndPoint'),
            rb = instance.requestBuilder;

        if (instance.metaData.currentActor === 'AU') {
            submitMessage = Config.getLocaleByKey(
                'offline.page.submit.message'
            );
        }
        else {
            submitMessage = Config.getLocaleByKey(
                'offline.page.validator.submit.message'
            );
        }

        instance.eBus.publish('Loader:show');
        fd.append('json', JSON.stringify({
            'optToken': instance.token,
            'mode': 'Offline',
            'actor': instance.metaData.currentActor
        }));
        rb.setUrl(url);
        rb.setMethod('POST');
        rb.setData(fd);
        rb.setSuccessCallback(function success() {
            instance.eBus.publish('Loader:hide');
            alert(submitMessage);
            instance.win.location.reload();
        });
        rb.setFailureCallback(function failure() {
            throw new Error('offline.page.submit.failure');
        });
        rb.setTimeoutCallback(function failure() {
            throw new Error('offline.page.submit.failure');
        });
        request = rb.build();
        request.send();
    }

    function submitClick() {
        var message,
            self = this,
            confrimSubmitMessage = Config.getLocaleByKey(
                'offline.page.want.submit'
            ),
            correctedPdfMessage = Config.getLocaleByKey(
                'offline.page.upload.corrected.pdf'
            ),
            container = this.htmlDoc.createElement('div'),
            dialog = new Dialog(
                this.htmlDoc, this.win, this.eBus, this.locale
            );

        if (checkAnnoateFileExists(this) === false) {
            message = correctedPdfMessage + this.annotateFileName;
            this.eBus.publish('alert:show', message);
            return;
        }
        container.classList.add('dialog-alert');
        container.innerHTML = confrimSubmitMessage;
        dialog.setName('confirmation');
        dialog.setWidth(400);
        dialog.setModal(true);
        dialog.showButtons(['no', 'ok']);
        dialog.setButtonText(
            'ok', Config.getLocaleByKey('offline.page.proceed')
        );
        dialog.setButtonText(
            'no', Config.getLocaleByKey('offline.page.return.proofing')
        );
        dialog.setTitle(Config.getLocaleByKey('offline.page.confirmation'));
        dialog.showClose();
        dialog.setContent(container);
        dialog.setOkCallback(this, function okCallback() {
            submit(self);
        });
        dialog.renderComponentStyle();
        dialog.render();
    }

    function applyLocale(template, locale) {
        return Helper.replaceLocaleString(template, locale);
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('Landing.page.header.not.rendered');
        }
    }

    function assertMetaData(instance) {
        if (instance.metaData === null) {
            throw new Error('Landing.page.meta.data.null');
        }
    }

    function bindOnLoadJournalImage(instance) {
        var defaultImage,
            journalImage = instance.templateContainer.querySelector(
                '.js-journal-img'
            );

        if (Helper.isUndefined(instance.metaData.journalImage) === false) {
            defaultImage = journalImage.dataset.src;
            journalImage.onerror = function onerror() {
                this.setAttribute('src', defaultImage);
            };
        }

        journalImage.onload = function onload() {
            journalImage.classList.remove('overlay-image');
        };
    }

    function bindEvents(instance) {
        instance.uploadFile = uploadFile.bind(instance);
        instance.uploadValidate = uploadValidate.bind(instance);
        instance.deleteClick = deleteFile.bind(instance);
        instance.submitClick = submitClick.bind(instance);
        instance.fileInput.addEventListener(
            'change', instance.uploadValidate, false
        );
        instance.submitButton.addEventListener(
            'click', instance.submitClick, false
        );
        instance.attachmentListContainer.addEventListener(
            'click', instance.deleteClick, false
        );
    }

    function checkRoleAndChooseTemplate(instance) {
        var actorMode,
            template = null;

        if (Helper.isUndefined(instance.metaData.actorMode) === true ||
            Helper.isEmptyString(instance.metaData.actorMode) === true) {
            throw new Error('Landing.page.mode.missing');
        }
        actorMode = instance.metaData.actorMode;
        if (Helper.isUndefined(instance.templates[actorMode]) === true) {
            throw new Error('Landing.page.template.missing');
        }
        template = instance.templates[actorMode];
        return applyLocale(template, instance.locale);
    }

    function renderTemplate(instance) {
        var attachments, attachmentLength, newUploadedFile, template,
            tempElement, localeTemplate,
            partials = {},
            locale = {},
            actor = instance.metaData.actor,
            localeShow = Config.get('locale'),
            localeEnalbeFor = Config.get('localeEnable'),
            i = 0,
            qs = instance.templateContainer.querySelector.bind(
                instance.templateContainer
            );

        partials.header = applyLocale(HeaderTemplate, instance.locale);
        partials.footer = applyLocale(FooterTemplate, instance.locale);
        partials.articleDetails = applyLocale(
            ArticleDetailsTemplate, instance.locale
        );
        partials.actorContent = checkRoleAndChooseTemplate(instance);
        partials.actorContent = partials.actorContent.replace(
            '{{size}}', Helper.formatBytes(instance.maxUploadFileSize)
        );

        if (localeShow === true &&
            localeEnalbeFor.indexOf(actor) !== -1
        ) {
            locale.data = Config.get('localeSetting');
            localeTemplate = applyLocale(LocaleTemplate, instance.locale);
            partials.locale = TemplateHelper.render(
                localeTemplate, {}, locale
            );
        }
        template = applyLocale(MainTemplate, instance.locale);
        template = TemplateHelper.render(
            template, partials, instance.metaData
        );
        tempElement = instance.htmlDoc.createElement('div');
        tempElement.innerHTML = template;
        instance.templateContainer.appendChild(tempElement.firstChild);

        instance.annotateFileName = instance.metaData.jid + '_' + instance.metaData.aid;
        instance.annotateFileName += '.' + instance.annotateFileExtension;
        attachmentLength = instance.metaData.attachments.length;
        attachments = instance.metaData.attachments;
        instance.fileInput = qs('.attach-file');
        instance.attachmentListContainer = qs('.uploaded-file-list');
        instance.submitButton = qs('.submit');
        instance.attachmentContainer = qs('.upload-corrections');
        for (; i < attachmentLength; i += 1) {
            newUploadedFile = {
                'name': attachments[i].name,
                'id': attachments[i].id,
                'url': attachments[i].url,
                'size': Helper.formatBytes(attachments[i].size)
            };
            instance.uploadedFiles.push(newUploadedFile);
        }
    }

    Offlinepage.prototype.setLoading = function setLoading(show) {
        var overlayDiv,
            compStyle = this.win.getComputedStyle(this.attachmentContainer);

        if (show === true) {
            overlayDiv = this.htmlDoc.createElement('div');
            overlayDiv.classList.add('attachment-overlay');
            overlayDiv.style.height = compStyle.height;
            overlayDiv.style.width = compStyle.width;
            this.attachmentContainer.appendChild(overlayDiv);
        }
        else {
            overlayDiv = this.attachmentContainer.querySelector(
                '.attachment-overlay'
            );
            if (overlayDiv !== null) {
                overlayDiv.parentNode.removeChild(overlayDiv);
            }
        }
    };

    Offlinepage.prototype.setMetaData = function setMetaData(metaData) {
        if (Helper.isObject(metaData) === false) {
            throw new Error('offline.page.metaData.missing');
        }
        this.metaData = metaData;
        this.metaData.page = 'offline';
    };

    Offlinepage.prototype.render = function render() {
        this.requestBuilder = new RequestBuilder();
        attachmentCompiledTemplate = TemplateHelper.compile(
            applyLocale(AttachmentsTemplate, this.locale), {}
        );
        this.maxUploadFileSize = Config.get('uploadSizeLimit');
        this.uploadFileWhiteList = Config.get('supportedExtension');
        assertMetaData(this);
        renderTemplate(this);
        this.isRendered = true;
        renderLocale(this);
        bindOnLoadJournalImage(this);
        if (this.metaData.readOnly === false) {
            bindEvents(this);
        }
        renderAttachment(this);
    };

    return Offlinepage;
});

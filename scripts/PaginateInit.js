/*global navigator*/

define([
    'scripts/Helper',
    'scripts/EventBus',
    'scripts/ConfigReader',
    'pagination/scripts/LayoutIdentifier',
    'pagination/scripts/PdfDownloader',
    'scripts/Logger', 'pagination/scripts/Overlay',
    'pagination/scripts/browserDetector',
    'scripts/RequestBuilder',
    'pagination/scripts/ProofErrorHandler',
    'scripts/Dialog',
    'scripts/analytics'
], function paginateInitLoader(
    Helper, EventBus, Config, ProofPaginator, PdfDownloader, Logger, Overlay,
    BrowserDetector, RequestBuilder, ProofErrorHandler, DialogPopupPanel
) {
    var proofViewBtn, editorViewBtn, pdfDownloadBtn, pager,
        proofViewContainer, parentContainer, overlay, proofOverlay,
        proofXmlEditorBtn, editorBtn, xmlToProofEventSubscribed = false,
        proofViewContainer, parentContainer, proofOverlay,
        proofErrorHandler = null;

    function toggleTopMenuAction(status) {
        if (status === true) {
            pdfDownloadBtn.disabled = false;
            pdfDownloadBtn.style.display = 'inline';
            return;
        }

        pdfDownloadBtn.disabled = true;
        pdfDownloadBtn.style.display = 'none';
    }

    function PaginateInit(Win, Doc, ArticleToken, CurrentActor) {
        this.win = Win;
        this.doc = Doc;
        this.articleToken = ArticleToken;
        this.currentActor = CurrentActor;
        EventBus.subscribe('connectivity:status', toggleTopMenuAction);
    }

    function fireAnalytics(win, JID) {
        var currentActorType = Helper.getUrlParams('type'),
            currentToken = Helper.getUrlParams('token'),
            readOnly = Helper.getUrlParams('readonly'),
            gA = win.ga;

        if (typeof gA !== 'function') {
            Logger.warn('Analytics func missing.');
            return;
        }
        if (
            Helper.isEmptyString(readOnly) === false &&
            readOnly === 'true'
        ) {
            Logger.info('In readonly mode, Analytics disabled');
            return;
        }
        if (
            Helper.isEmptyString(currentActorType) === true ||
            Helper.isUndefined(currentActorType) === true
        ) {
            currentActorType = 'au';
        }
        Logger.info('Pushing analytics...');

        gA('create', Config.get('analyticsKey'), 'auto');
        gA(
            'send', 'event',
            currentToken + ' - ' + JID, currentActorType.toUpperCase() +
            ' Clicked', {
                'useBeacon': true
            }
        );
        gA('send', 'pageview', {
            'title': 'Proof: ' + currentToken + ' - ' + currentActorType.toUpperCase(),
            'hitCallback': function hitCallbackFn() {
                console.log('Analytics success.');
            }
        });
    }

    function isNeedServerPagination() {
        var len = 0, i = 0,
            serverSidePaginationEnabled = Config.get('isNeedServerSidePagination'),
            Browsers = Config.get('noNeedServerSidePaginationBrowsers'),
            userAgent = new BrowserDetector(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
            );

        userAgent = userAgent.name.toLowerCase();
        len = Browsers.length;
        if (serverSidePaginationEnabled === false) {
            return false;
        }

        for (; i < len; i += 1) {
            if (userAgent === Browsers[i]) {
                return false;
            }
        }

        return true;
    }

    function getSaveAsPdfPoint() {
        if (isNeedServerPagination() === true) {
            return Config.getRoute('serverSidePaginateEndPoint');
        }

        return Config.getRoute('saveAsPdfEndPoint');
    }

    function triggerPdfDownload(
        win, doc, articleToken, metaData, proofPager
    ) {
        var saveAsPdfEndPoint = '',
            pdfDownloader = new PdfDownloader();

        saveAsPdfEndPoint = getSaveAsPdfPoint();

        pdfDownloader.download(
            win, doc, proofPager.innerHTML, proofPager, saveAsPdfEndPoint,
            Config.getRoute('downloadPdfEndPoint'), articleToken, EventBus,
            metaData.jid, pdfDownloadBtn,
            Config.get('pdfCallBackRate'), metaData.readOnly, metaData.template
        );
    }

    function saveProofViewPageCount(articleToken, currentActor, pageCount) {
        var saveData, formData = new FormData(), rB = new RequestBuilder(),
            postData, request = null;

        postData = {
            'optToken': articleToken,
            'actor': currentActor.toUpperCase()
        };
        if (typeof pageCount !== 'undefined') {
            postData.pageCount = pageCount;
        }
        saveData = JSON.stringify(postData);
        formData.append('json', saveData);
        rB.setUrl(Config.getRoute('saveProofPageCountEndPoint'));
        rB.setMethod('POST');
        rB.setData(formData);
        request = rB.build();
        request.send();
    }

    PaginateInit.prototype.load = function load(
        editorInst, metaData, revisionCallback, saveCallback
    ) {
        var win = this.win,
            doc = this.doc,
            articleToken = this.articleToken,
            proofPaginator = new ProofPaginator(),
            editorHtml, revision,
            currentActor = this.currentActor,
            hitPageProofCountFlag = Config.get('hitPageProofCount'),
            warning, warningMsg;

        proofErrorHandler = new ProofErrorHandler(this, metaData, EventBus);

        proofViewBtn.addEventListener('click', function proofClickFn() {
            proofOverlay = new Overlay(doc, EventBus);

            if (
                (hitPageProofCountFlag === false && metaData &&
                    metaData.readOnly === false
                ) || hitPageProofCountFlag === true
            ) {
                saveProofViewPageCount(articleToken, currentActor);
            }

            if (Config.get('enableAnalyticsOnProof') === true) {
                fireAnalytics(win, metaData.jid);
            }

            if (editorBtn.disabled === false) {
                proofXmlEditorBtn.style.display = 'inline-block';
                editorViewBtn.style.display = 'none';
            }
            else {
                editorViewBtn.style.display = 'inline-block';
                proofXmlEditorBtn.style.display = 'none';
            }

            if (editorBtn.disabled === false && xmlToProofEventSubscribed === false) {
                warningMsg = [
                    'Changes made in XML editor will not get reflected in Proof view'
                ];
                warning = new DialogPopupPanel(doc, win, EventBus);
                warning.setTitle('Note');
                warning.setName('xmlToProofMode');
                warning.setWidth(400);
                warning.showButtons(['ok']);
                warning.setButtonText('ok', 'OK');
                warning.setContent(warningMsg.join(''));

                EventBus.subscribe('dialog:xmlToProofMode:ok', function htmlToProofClick() {
                    proofOverlay.render();
                    parentContainer.style.display = 'none';
                    proofViewContainer.style.display = 'block';
                    editorHtml = editorInst.getHtml();
                    revision = revisionCallback();
                    proofPaginator.execute(
                        win, doc, editorHtml, pager, metaData.journalTitle,
                        metaData.customerImageUrl, metaData.journalImageUrl,
                        metaData.crossMarkUrl, EventBus, metaData.jid, revision,
                        metaData.template, metaData.abbreviatedTitle
                    );
                });

                warning.render();
                xmlToProofEventSubscribed = true;
            }
            else {
                proofOverlay.render();
                parentContainer.style.display = 'none';
                proofViewContainer.style.display = 'block';
                editorHtml = editorInst.getHtml();
                revision = revisionCallback();
                proofPaginator.execute(
                    win, doc, editorHtml, pager, metaData.journalTitle,
                    metaData.customerImageUrl, metaData.journalImageUrl,
                    metaData.crossMarkUrl, EventBus, metaData.jid, revision,
                    metaData.template, metaData.abbreviatedTitle
                );
            }
        }, false);

        proofXmlEditorBtn.addEventListener('click', function renderXmlMode() {
            parentContainer.style.display = 'block';
            proofViewContainer.style.display = 'none';
        }, false);

        editorViewBtn.addEventListener('click', function editClickFn() {
            parentContainer.style.display = 'block';
            proofViewContainer.style.display = 'none';
        }, false);

        pdfDownloadBtn.addEventListener('click', function pdfClickFn() {
            if (editorInst.hasUnsavedChanges() === false) {
                triggerPdfDownload(
                    win, doc, articleToken, metaData, pager
                );
                return;
            }

            // EventBus.publish('Loader:show', 9999);

            saveCallback({
                'successCallback': function successFn() {
                    EventBus.publish('DownloadPdfSave:Complete');
                    triggerPdfDownload(
                        win, doc, articleToken, metaData, pager
                    );
                },
                'failureCallback': function failureFn() {
                    EventBus.publish('DownloadPdfSave:Error');
                },
                'timeoutCallback': function timeoutFn() {
                    EventBus.publish('DownloadPdfSave:Error');
                }
            });
            return;
        }, false);
        EventBus.subscribe('paginate:onComplete', function onCompleteFn(
            pageCount, isPaginated
        ) {
            proofViewContainer.style.height = (
                pager.scrollHeight + pager.offsetTop
            ) + 'px';
            console.log(pageCount, isPaginated);
            proofOverlay.destroy();

            if ((pageCount > 0 && isPaginated === true) &&
                ((hitPageProofCountFlag === false && metaData && metaData.readOnly === false) ||
                  hitPageProofCountFlag === true)
            ) {
                saveProofViewPageCount(articleToken, currentActor, pageCount);
            }
        });
    };

    PaginateInit.prototype.initiate = function initiateFn() {
        var doc = this.doc;

        // TODO: Editor container and buttons should not be defined here.

        proofViewBtn = doc.querySelector(
            '.container .mode-buttons .proofBtn'
        );
        editorViewBtn = doc.querySelector(
            '.proofview .mode-buttons .editorBtn'
        );
        pdfDownloadBtn = doc.querySelector(
            '.proofview .mode-buttons .downloadBtn'
        );
        proofXmlEditorBtn = doc.querySelector(
            '.proofview .mode-buttons .xmlEditorBtn'
        );
        editorBtn = doc.querySelector(
            '.container .mode-buttons .editorBtn'
        );

        pager = doc.querySelector('.proofview .pager');
        parentContainer = doc.querySelector('.container');
        proofViewContainer = doc.querySelector('.proofview');
    };
    return PaginateInit;
});

(function autoLoader(require, win, doc) {
    'use strict';
    require([
        'scripts/Helper', 'scripts/Actor', 'scripts/ProofCorrectorApp',
        'scripts/ProofEditorApp', 'scripts/ProofValidatorApp',
        'scripts/QueryReplierApp', 'scripts/ConfigReader', 'scripts/EventBus',
        'scripts/ErrorHandler', 'scripts/RequestBuilder',
        'scripts/PerformanceLog', 'scripts/SessionReport', 'scripts/HtmlReport',
        'scripts/DialogPopupPanel', 'scripts/Logger', 'scripts/HeaderMenuItems',
        'scripts/ViewPageProof', 'scripts/BrowserCompatibility', 'scripts/ActionLogger',
        'scripts/AlertDialog', 'templates/SupportLinks', 'scripts/PopOver',
        'customer/Config', 'scripts/FeatureToggle', 'scripts/browser-compatability',
        'scripts/polyfills/polyfills', 'scripts/polyfills/classList',
        'scripts/polyfills/dataset', 'scripts/polyfills/assign', 'scripts/polyfills/dialog',
        'scripts/polyfills/beacon'
    ],
    function appLoader(
        Helper, Actor, ProofCorrectorApp, ProofEditorApp, ProofValidatorApp,
        QueryReplierApp, Config, EventBus, ErrorHandler, RequestBuilder, PerformanceLog,
        SessionReport, HtmlReport, DialogPopupPanel, Logger, HeaderMenuItems, ViewPageProof,
        BrowserCompatibility, ActionLogger, AlertDialog, SupportLinkTemplate, PopOver,
        CustomerConfig, FeatureToggle

    ) {
        var performanceLog, token, currentActorType, headerMenuItems, readonly,
            localeData, browserCompatibility, browserVersion, supportedBrowser,
            actionLogger, alertDialog, metaData, popOverInst, clearFrame, loaderPrecentage,
        CustomerConfig, FeatureToggle, ConfirmDialog, DataChangeAttributeHandler
    ) {
        var performanceLog, token, currentActorType, headerMenuItems, readonly,
            localeData, browserCompatibility, browserVersion, supportedBrowser,
            actionLogger, alertDialog, confirmDialog, metaData, popOverInst,
            clearFrame, loaderPrecentage, changeAttributeHandler,
            loaderBlock = doc.querySelector('.overlay'),
            parentContainer = doc.querySelector('.container'),
            articleContainer = doc.querySelector('.editor'),
            supplementaryContainer = doc.querySelector('.supplementary'),
            flashMessageContainer = doc.querySelector('.flash-message-container'),
            flashMessageContainerClose = doc.querySelector('.flash-message-container .close'),
            flashMessageContainerContent = doc.querySelector('.flash-message-container .content'),
            helpLinkElement = doc.querySelector('.action-buttons a.help-link'),
            bootstrapLoaderElement = doc.querySelector('.progress-container progress'),
            errorHandler = new ErrorHandler(win, doc), viewPageProof,
            loaderWidth = 0;

        function hideFlashMessage() {
            var classList = flashMessageContainer.classList;

            classList.remove('show');
            classList.remove('green');
        }

        function showFlashMessage(content, options) {
            var defaultOptions = {
                'closeButton': true,
                'success': false,
                'error': true,
                'autoClose': true
            };

            options = options || {};
            options = Object.assign({}, defaultOptions, options);
            if (Helper.isUndefined(content) === true ||
                Helper.isNull(content) === true ||
                Helper.isEmptyString(content) === true) {
                return;
            }
            if (options.success === true) {
                flashMessageContainer.classList.add('green');
            }
            if (options.closeButton === false) {
                flashMessageContainerClose.classList.add('hide');
            }
            if (options.closeButton === false && options.autoClose === true) {
                setTimeout(function timeOutFn() {
                    hideFlashMessage();
                }, 4000);
            }
            flashMessageContainerContent.innerHTML = content;
            flashMessageContainer.classList.add('show');
        }

        function hideLoader() {
            loaderBlock.removeAttribute('style');
            loaderBlock.style.display = 'none';
        }

        function showLoader(zIndex) {
            var loderStyle = loaderBlock.style;

            if (Helper.isNumber(zIndex)) {
                loderStyle.zIndex = zIndex;
            }
            loderStyle.display = 'block';
        }

        function removeEditorBootstrapLoader() {
            var loader = doc.querySelector('.progress-overlay');

            if (Helper.isNull(loader) === true) {
                return;
            }
            loader.parentNode.removeChild(loader);
        }

        function frame() {
            if (loaderWidth >= loaderPrecentage) {
                if (loaderPrecentage === 100) {
                    removeEditorBootstrapLoader();
                }
                clearInterval(clearFrame);
            }
            else {
                loaderWidth += 1;
                bootstrapLoaderElement.value = loaderWidth;
            }
        }

        function setBootstrapLoader(percentage) {
            loaderPrecentage = percentage;
            clearFrame = setInterval(frame, 250);
        }

        function invalidArticle() {
            parentContainer.style.display = 'none';
            showFlashMessage(Config.getLocaleByKey('article.not.found'), true);
            hideLoader();
            removeEditorBootstrapLoader();
        }

        function loadConfiguration() {
            var configReader = new Config(win);

            configReader.load();
        }

        function bindLogger() {
            var logger = new Logger(win, doc);

            logger.configure(
                Config.get('Log').Level,
                Config.get('Log').PersistOnServer,
                Config.getRoute('logEndPoint')
            );
        }

        function bindErrorEvent() {
            win.addEventListener('error', function error(errorData) {
                errorHandler.handleErrors(errorData);
            });
        }

        function generateSessionReport(conformation) {
            var sessionReport, alertMessage;

            if (conformation === true) {
                EventBus.publish('Loader:show', 9999);
                alertMessage = Config.getLocaleByKey('article.session.report');
                alert(alertMessage);
            }

            sessionReport = new SessionReport(win, doc, token, currentActorType);
            sessionReport.generateReport();
        }

        function bindSessionReport() {
            var sessionReportBtn = doc.querySelector('.sessionBtn');

            sessionReportBtn.classList.remove('hide');
            sessionReportBtn.addEventListener('click', function click() {
                generateSessionReport(true);
            }, false);
        }

        function bindHtmlReport() {
            var htmlReport,
                htmlReportBtn = doc.querySelector('.htmlReportBtn');

            htmlReportBtn.classList.remove('hide');
            htmlReportBtn.addEventListener('click', function htmlReportClick() {
                htmlReport = new HtmlReport(win, doc, token);
                htmlReport.render(metaData.data);
            });
        }

        function bindViewPageProof() {
            viewPageProof = new ViewPageProof(
                win, doc, token, {
                    'downloadPageProofEndPoint': Config.getRoute(
                        'downloadPageProofEndPoint'
                    )
                }
            );
        }

        function applyLocale(template, locale) {
            return Helper.replaceLocaleString(template, locale);
        }

        function bindKeepAliveProcess() {
            var request,
                requestBuilder = new RequestBuilder();
            requestBuilder.setUrl(Config.getRoute('keepAliveEndPoint'));
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function onSuccessCallback() {
                console.log('Keep alive saved');
            });
            requestBuilder.setTimeoutCallback(function onTimeoutCallback(response) {
                console.log('Timeout ', response);
            });
            requestBuilder.setFailureCallback(function onFailureCallback(response) {
                console.log('Keep alive failed ', response);
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function bindExpireIdleSessionProcess() {
            var sessionLandingPageLink, request, currentlocaleVal,
                requestBuilder = new RequestBuilder(),
                sessionBaseLink = Config.getRoute('SessionLandingPageLink');

            sessionLandingPageLink = sessionBaseLink.replace('{{token}}', token);
            sessionLandingPageLink = sessionLandingPageLink.replace('{{actor}}', currentActorType.toUpperCase());

            if (Config.get('locale') === true) {
                currentlocaleVal = Config.get('currentLocale');
                sessionLandingPageLink = sessionLandingPageLink.replace('{{locale}}', currentlocaleVal);
            }

            requestBuilder.setUrl(Config.getRoute('expireIdleSessionEndPoint') + '/' + token);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function onSuccessCallback(response) {
                metaData = JSON.parse(response);
                if (metaData.data === true) {
                    window.location.replace(sessionLandingPageLink);
                }
                else if (metaData.data === Config.getLocaleByKey('session.expired.message')) {
                    console.log(metaData.data);
                }
                else {
                    console.log('Session Keep Active');
                }
            });
            requestBuilder.setTimeoutCallback(function onTimeoutCallback(response) {
                console.log('Timeout ', response);
            });
            requestBuilder.setFailureCallback(function onFailureCallback(response) {
                console.log('Idle Session Expiration failed ', response);
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function clearSessionOnClose() {
            var request,
                requestBuilder = new RequestBuilder(),
                url = Config.getRoute('clearSessionEndPoint'),
                formData = new FormData();

            formData.append('token', token);
            requestBuilder.setUrl(url);
            requestBuilder.setMethod('POST');
            requestBuilder.setData(formData);
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function pageCloseHandler() {
            actionLogger.save({'action': 'Browser-reloaded'});
            actionLogger.pushToServer();
            if (Helper.isObject(win.opener) === true) {
                win.opener.location.reload();
            }
        }

        function isXmlEditorEnabled() {
            var Plugins = Config.get('Plugins'),
                aC = new Actor(),
                actor = aC.getValidActor(currentActorType);

            if (actor !== 'proofValidator') {
                return false;
            }

            if (
                Helper.objectHasKey(Plugins, 'XmlEditor') === true &&
                Helper.objectHasKey(Plugins.XmlEditor, 'enable') === true
            ) {
                return Plugins.XmlEditor.enable;
            }
            return false;
        }

        function renderHeaderButtons() {
            if (
                FeatureToggle.isFeatureEnabled('ShowDownloadProof') === true ||
                Config.get('showPaginateProofOverride') === true
            ) {
                headerMenuItems.showDownloadProof();
            }
            if (
                FeatureToggle.isFeatureEnabled('ShowPaginateProof') === true ||
                Config.get('showPaginateProofOverride') === true
            ) {
                headerMenuItems.showPaginateProof();
            }
            if (
                FeatureToggle.isFeatureEnabled('ShowViewProof') === true ||
                Config.get('showViewProofOverride') === true
            ) {
                headerMenuItems.showViewProof();
            }
            if (isXmlEditorEnabled() === true) {
                headerMenuItems.showXmlEditor();
            }
        }

        function getHelpLink(token, actor) {
            var helpLink, currentLocale, localePrefix;

            currentLocale = Config.get('currentLocale');
            localePrefix = currentLocale.substring(0, 2);
            helpLink = Config.getRoute('helpLink');
            helpLink = helpLink.replace('{{token}}', token);
            helpLink = helpLink.replace('{{actor}}', actor);
            helpLink = helpLink.replace('{{locale}}', localePrefix);
            return helpLink;
        }

        function getSupportLink() {
            var supportLink;

            supportLink = metaData.data.supportLink;
            return supportLink;
        }

        function createPopOverFragment() {
            var supportLinkTemplate, temp, domFragment, genAuthorLink,
                helpLink, navigateHelpLink, supportLink;

            supportLinkTemplate = applyLocale(SupportLinkTemplate, localeData);
            temp = document.createElement('span');
            temp.innerHTML = supportLinkTemplate;
            domFragment = temp.firstChild;
            genAuthorLink = domFragment.querySelector('a.gen-author');
            helpLink = domFragment.querySelector('a.online-proof');
            supportLink = getSupportLink();
            genAuthorLink.setAttribute('href', supportLink);
            navigateHelpLink = getHelpLink(token, currentActorType);
            helpLink.setAttribute('href', navigateHelpLink);
            return domFragment;
        }

        function initiatePopOver() {
            var fragment = createPopOverFragment();

            popOverInst = new PopOver(window, document);
            popOverInst.render(fragment, helpLinkElement);
        }

        function renderHelpLink(actor) {
            var navigateHelpLink;

            if (
                actor === 'proofValidator' ||
                actor === 'queryReplier' ||
                FeatureToggle.isFeatureEnabled('ShowSupportLink') === false
            ) {
                navigateHelpLink = getHelpLink(token, currentActorType);
                helpLinkElement.setAttribute('href', navigateHelpLink);
            }
            else {
                initiatePopOver();
            }
        }

        function browserVerification() {
            var isSupport, message,
                supportedBrowsers = Config.get('browserCompatible');

            browserCompatibility = new BrowserCompatibility(win, EventBus);
            isSupport = browserCompatibility.verifyBrowser();
            browserVersion = browserCompatibility.getBrowserInfo();

            if (isSupport === false) {
                message = Config.getLocaleByKey('browser.support.message');
                message = message.replace('{{FIREFOX}}', supportedBrowsers.Firefox);
                message = message.replace('{{IE}}', supportedBrowsers.InternetExplorer);
                message = message.replace('{{CHROME}}', supportedBrowsers.Chrome);
                EventBus.publish('Loader:hide');
                showFlashMessage(message, true);
                parentContainer.style.display = 'none';
                throw new Error('unsupport.browser');
            }
        }

        function initiateRevision() {
            var saveBtn = doc.querySelector('div.action-buttons .saveBtn');

            saveBtn.dataset.revisionId = 1;
        }

        function metaFailureCallback() {
            console.log('Meta Download Failure');
            invalidArticle();
        }

        function bindSessionManagement() {
            var idleSessionExpireTime = Config.get('idleSessionExpirationTime'),
                enableInvalidateSession = FeatureToggle.isFeatureEnabled('ValidateUserSession');

            if ((enableInvalidateSession === false) &&
                (metaData.data.readOnly === false)) {
                setInterval(function keepAlive() {
                    bindKeepAliveProcess();
                }, idleSessionExpireTime);
            }
            else if (enableInvalidateSession === true &&
                metaData.data.readOnly === false) {
                setInterval(function expireIdleSession() {
                    bindExpireIdleSessionProcess();
                }, idleSessionExpireTime);
            }
        }
        function loadPaginationScript() {
            var scriptRef, sourceFilePath,
                modeButtonBlock = doc.querySelector('.container .mode-buttons'),
                proofModeButtons = modeButtonBlock.querySelector('.proofBtn'),
                paginationEnabled = FeatureToggle.isFeatureEnabled('ShowPaginateProof');

            if (Config.get('Environment') === 'prod' && paginationEnabled === true) {
                sourceFilePath = '/' + Config.get('sourceFilePath');
                scriptRef = doc.createElement('script');
                scriptRef.setAttribute('type', 'text/javascript');
                scriptRef.setAttribute('src', sourceFilePath);
                scriptRef.onerror = function scriptErrFn() {
                    proofModeButtons.classList.remove('show');
                    proofModeButtons.classList.add('hide');
                };
                doc.head.appendChild(scriptRef);
            }
        }
        function downloadMetaData(url, metaSuccessCallback, metaFailureCallback) {
            var actor, featureToggle,
                startTime, startDate, request,
                aC = new Actor(),
                requestBuilder = new RequestBuilder();

            startTime = new Date().getTime();
            startDate = new Date().toString();

            requestBuilder.setUrl(url);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function(response) {
                initiateRevision();
                setBootstrapLoader(90);
                metaData = JSON.parse(response);
                actor = aC.getValidActor(currentActorType);
                featureToggle = new FeatureToggle(metaData.data.features);
                bindSessionManagement();
                if (FeatureToggle.isFeatureEnabled('ShowHtmlReport') === true) {
                    bindHtmlReport(metaData.data);
                }
                else if(FeatureToggle.isFeatureEnabled('ShowSessionReport') === true) {
                    bindSessionReport();
                }
                bindViewPageProof();
                performanceLog.pushLoadTimeline(
                    'Load', startTime, startDate, 'InterfaceLoad'
                );
                articleContainer.classList.add(actor);
                supplementaryContainer.classList.add(actor);
                renderHelpLink(actor);
                renderHeaderButtons(metaData.data);
                metaSuccessCallback.call(this, response);
            });
            requestBuilder.setFailureCallback(metaFailureCallback);
            requestBuilder.setTimeoutCallback(function() {
                console.log('Timeout!');
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function handleActorRedirection(currentActor, token, isOpenReadOnly) {
            var proofCorrector, proofValidator, proofEditor,
                queryReplier, successCallback,
                aC = new Actor(),
                endPoint = Config.getRoute('loadEndPoint'),
                actor = aC.getValidActor(currentActor),
                metaURL = endPoint;

            if (isOpenReadOnly === true) {
                metaURL += '/readonly';
            }

            if (actor === 'proofCorrector') {
                proofCorrector = new ProofCorrectorApp(token, currentActor);
                proofCorrector.bootstrap();
                successCallback = proofCorrector.metaSuccessCallback;
            }
            else if (actor === 'proofEditor') {
                proofEditor = new ProofEditorApp(token, currentActor);
                proofEditor.bootstrap();
                successCallback = proofEditor.metaSuccessCallback;
            }
            else if (actor === 'proofValidator') {
                proofValidator = new ProofValidatorApp(token, currentActor);
                proofValidator.bootstrap();
                successCallback = proofValidator.metaSuccessCallback;
            }
            else if (actor === 'queryReplier') {
                queryReplier = new QueryReplierApp(token, currentActor);
                queryReplier.bootstrap();
                successCallback = queryReplier.metaSuccessCallback;
            }
            else {
                invalidArticle();
                return;
            }
            downloadMetaData(metaURL, successCallback, metaFailureCallback);
        }

        function bindFlashMessage() {
            flashMessageContainerClose.addEventListener('click',
            function closeFn() {
                hideFlashMessage();
            }, false);
        }

        function reloadBrowser() {
            win.location.reload();
        }

        function bootstrap() {
            var winEventListner, winEventLoader, body,
                isReadOnly = false, aC, actor;

            localeData = Config.getLocale();
            currentActorType = Helper.getUrlParams('type');
            token = Helper.getUrlParams('token');
            readonly = Helper.getUrlParams('readonly');
            EventBus.subscribe('Loader:show', showLoader);
            EventBus.subscribe('Loader:hide', hideLoader);
            EventBus.subscribe('FlashMessage:show', showFlashMessage);
            EventBus.subscribe('FlashMessage:hide', hideFlashMessage);
            EventBus.subscribe('Browser:reload', reloadBrowser);
            EventBus.subscribe('BootstrapLoader:remove', removeEditorBootstrapLoader);
            EventBus.subscribe('BootstrapLoader:setPercentage', setBootstrapLoader);
            supportedBrowser = Config.get('browserCompatible');
            browserVerification();
            if (
                Helper.isEmptyString(token) === true ||
                Helper.isUndefined(token) === true
            ) {
                invalidArticle();
                return;
            }

            if (
                Helper.isEmptyString(readonly) === false &&
                readonly === 'true'
            ) {
                isReadOnly = true;
            }

            if (
                Helper.isEmptyString(currentActorType) === true ||
                Helper.isUndefined(currentActorType) === true
            ) {
                currentActorType = 'au';
            }
            currentActorType = currentActorType.toLowerCase();
            performanceLog = new PerformanceLog(token, currentActorType);
            headerMenuItems = new HeaderMenuItems(doc);
            handleActorRedirection(currentActorType, token, isReadOnly);
            aC = new Actor();
            actor = aC.getValidActor(currentActorType);

            win.browserDetails = browserDetect(
                typeof navigator !== 'undefined' ? navigator.userAgent : ''
            );
            if (
                win.browserDetails.msie === true &&
                win.browserDetails.version >= 11
            ) {
                winEventListner = win.attachEvent || win.addEventListener;
                winEventLoader = win.attachEvent ? 'onbeforeunload' : 'beforeunload';
                winEventListner(winEventLoader, function closeHandler(e) {
                    pageCloseHandler();
                });
            }
            else {
                win.onunload = pageCloseHandler;
            }

            if (Config.get('Environment') === 'prod') {
                body = doc.querySelector('body');
                body.setAttribute('oncontextmenu', 'return false');
            }

            actionLogger = new ActionLogger(win, EventBus, token, currentActorType);
            alertDialog = new AlertDialog(
                win, doc, EventBus, token, currentActorType
            );
        }
        setBootstrapLoader(30);
        loadConfiguration();
        EventBus.subscribe('Configuration:Loaded', function configureLoad() {
            setBootstrapLoader(60);
            bindLogger();
            bindErrorEvent();
            bindFlashMessage();
            bootstrap();
        });
        EventBus.subscribe('Download:ViewPageProof', function viewPage() {
            viewPageProof.generateReport(currentActorType);
        });
        EventBus.subscribe('Download:SessionReport', generateSessionReport);
    });
})(require, window, document);

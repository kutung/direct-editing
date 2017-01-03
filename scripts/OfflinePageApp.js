(function OfflinePageAppLoader(require, win, doc) {
    'use strict';
    require(['scripts/Helper', 'scripts/Actor', 'scripts/ConfigReader',
        'scripts/EventBus', 'scripts/ErrorHandler', 'scripts/RequestBuilder',
        'scripts/Logger', 'scripts/BrowserCompatibility',
        'scripts/PerformanceLog', 'scripts/OfflinePage', 'scripts/AlertDialog',
        'scripts/Connectivity',
        'scripts/polyfills/classList', 'scripts/polyfills/dataset',
        'scripts/polyfills/assign', 'scripts/polyfills/polyfills',
        'scripts/polyfills/dialog', 'scripts/polyfills/beacon'
    ],
    function onOfflinePageAppDependenciesLoaded(
        Helper, Actor, Config, EventBus, ErrorHandler, RequestBuilder, Logger,
        BrowserCompatibility, PerformanceLog, OfflinePage, AlertDialog, Connectivity
    ) {
        var loaderBlock, browserCompatibility, metaData,
            browserVersion, supportedBrowser, flashContainer, alertDialog,
            errorContainer, performanceLog, startTime,
            startDate, localeData, offlinePage,
            templateElement, qs, isSupportedBrowser,
            attachmentContainer, footerBtnContainer,
            errorHandler = new ErrorHandler(win, doc);

        function loadConfiguration() {
            (new Config(win)).load();
        }

        function bindLogger() {
            var logger = new Logger(win, doc),
                config = Config.get('Log');

            logger.configure(
                config.Level, config.PersistOnServer, Config.getRoute('logEndPoint')
            );
        }

        function bindErrorEvent() {
            win.addEventListener('error', function onError(errorData) {
                errorHandler.handleErrors(errorData);
            });
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

        function showError(msg) {
            var errClassList = errorContainer.classList;

            if (Helper.isEmptyString(msg) === true) {
                throw new Error('error.message.not.string');
            }
            errorContainer.innerHTML = msg;
            errClassList.remove('hide');
            errClassList.add('show');
        }

        function browserVerification() {
            var message,
                supportedBrowsers = Config.get('browserCompatible');

            if (isSupportedBrowser === false) {
                templateElement.classList.add('unsupport-browser');
                message = Config.getLocaleByKey('browser.support.message');
                message = message.replace('{{FIREFOX}}', supportedBrowsers.Firefox);
                message = message.replace('{{IE}}', supportedBrowsers.InternetExplorer);
                message = message.replace('{{CHROME}}', supportedBrowsers.Chrome);
                flashContainer.innerHTML = message;
                flashContainer.classList.add('show');
            }
        }

        function getSelectionAlertMessage(key, elementName) {
            var tmpNode, errorMessage;

            errorMessage = Config.getLocaleByKey(key);
            tmpNode = document.createElement(elementName);
            tmpNode.innerHTML = errorMessage;
            return tmpNode;
        }

        function showConnectionPopUp(status) {
            var content, okCallbackFn, tmpNode, firstAlertNode;

            okCallbackFn = function callbackFn() {
                if (status === true) {
                    window.location.reload();
                }
            };

            if (status === false) {
                content = Config.getLocaleByKey('offline.connection.not.alive');
                EventBus.publish('alert:show', content, {'name': 'connectivity', 'width': 500});
                return;
            }

            firstAlertNode = getSelectionAlertMessage('offline.connection.alive', 'div');
            tmpNode = document.createElement('div');
            tmpNode.appendChild(firstAlertNode);

            EventBus.publish('alert:show', tmpNode,
                {'name': 'connectivityOn', 'callback': okCallbackFn, 'width': 500}
            );
        }

        function toggleReadOnlyMode(status) {
            var content;

            if (status === true) {
                errorContainer.classList.remove('show');
                errorContainer.classList.add('hide');
                attachmentContainer.classList.remove('readonly');
                footerBtnContainer.classList.remove('readonly');
            }
            else {
                content = Config.getLocaleByKey('offline.connection.not.alive');
                attachmentContainer.classList.add('readonly');
                footerBtnContainer.classList.add('readonly');
                showError(content);
            }
            showConnectionPopUp(status);
        }

        function checkConnectivity() {
            var pingEndPoint, pingInterval, pingTimeout;

            pingEndPoint = Config.getRoute('pingEndPoint');
            pingInterval = Config.get('pingInterval');
            pingTimeout = Config.get('pingTimeout');
            Connectivity.check(pingEndPoint, {'interval': pingInterval, 'timeout': pingTimeout});
        }

        function metaFailureCallback(response) {
            var parseData, log = {};

            if (Helper.isEmptyString(response)) {
                throw new Error('error.invalid_response_data');
            }
            parseData = JSON.parse(response);
            if (parseData.success === false &&
                Helper.isString(parseData.message)
            ) {
                showError(parseData.message);
            }
            EventBus.publish('Loader:hide');
            log.message = 'Meta Download Failure';
            log.type = 'error';
            Logger.error(log, true);
        }

        function metaSuccessCallback(response) {
            var parseData;

            if (Helper.isEmptyString(response)) {
                throw new Error('error.invalid_response_data');
            }
            parseData = JSON.parse(response);
            metaData = parseData.data;
            if (isSupportedBrowser === false) {
                metaData.readOnly = true;
            }
            offlinePage.setMetaData(metaData);
            offlinePage.render();
            flashContainer = qs('.flash-message-container');
            attachmentContainer = qs('.upload-corrections');
            footerBtnContainer = qs('footer .buttons');
            browserVerification();
            performanceLog.pushLoadTimeline(
                'Load', startTime, startDate, 'OfflineLoad'
            );
            EventBus.publish('Loader:hide');
            if (metaData.readOnly === false) {
                checkConnectivity();
            }
        }

        function downloadMetaData(url) {
            var request,
                requestBuilder = new RequestBuilder();

            startTime = new Date().getTime();
            startDate = new Date().toString();
            EventBus.publish('Loader:show');
            requestBuilder.setUrl(url);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(metaSuccessCallback);
            requestBuilder.setFailureCallback(metaFailureCallback);
            request = requestBuilder.build();
            request.send();
        }

        function handleActorRedirection(token, role) {
            var endPoint = Config.getRoute('offlinePageEndPoint'),
                metaURL = endPoint + '/' + token + '/' + role;

            downloadMetaData(metaURL);
        }

        function bootstrap() {
            var token = Helper.getUrlParams('token'),
                role = Helper.getUrlParams('type');

            role = (Helper.isEmptyString(role)) ? 'au' : role;
            localeData = Config.getLocale();
            performanceLog = new PerformanceLog(token, role);
            templateElement = doc.querySelector('.template');
            qs = templateElement.querySelector.bind(templateElement);
            errorContainer = doc.querySelector('.error-message-container');
            offlinePage = new OfflinePage(
                win, doc, EventBus, token, templateElement, localeData
            );
            supportedBrowser = Config.get('browserCompatible');
            browserCompatibility = new BrowserCompatibility(win, EventBus);
            isSupportedBrowser = browserCompatibility.verifyBrowser();
            browserVersion = browserCompatibility.getBrowserInfo();
            EventBus.subscribe('Loader:show', showLoader);
            EventBus.subscribe('Loader:hide', hideLoader);
            alertDialog = new AlertDialog(
                win, doc, EventBus, token, role
            );
            loaderBlock = doc.querySelector('.overlay');
            handleActorRedirection(token, role);
        }

        EventBus.subscribe('Configuration:Loaded', function onConfigurationLoaded() {
            bindLogger();
            bindErrorEvent();
            bootstrap();
        });
        EventBus.subscribe('connectivity:status', toggleReadOnlyMode);

        loadConfiguration();
    });
})(require, window, document);

(function SessionPageAppLoader(require, win, doc) {
    'use strict';
    require(['scripts/Helper', 'scripts/Actor', 'scripts/ConfigReader',
        'scripts/EventBus', 'scripts/ErrorHandler', 'scripts/RequestBuilder',
        'scripts/Logger', 'scripts/BrowserCompatibility', 'scripts/PerformanceLog', 'scripts/SessionPage',
        'scripts/polyfills/classList', 'scripts/polyfills/dataset',
        'scripts/polyfills/assign', 'scripts/polyfills/polyfills',
        'scripts/polyfills/dialog', 'scripts/polyfills/beacon'
    ],
    function onSessionPageAppDependenciesLoaded(
        Helper, Actor, Config, EventBus, ErrorHandler, RequestBuilder, Logger,
        BrowserCompatibility, PerformanceLog, SessionPage
    ) {
        var loaderBlock, browserCompatibility, metaData,
            browserVersion, flashContainer,
            errorContainer, performanceLog, startTime,
            startDate, localeData, sessionPage,
            templateElement, qs, token, role,
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
            sessionPage.setMetaData(metaData);
            sessionPage.render();
            flashContainer = qs('.flash-message-container');
            //browserVerification();
            performanceLog.pushLoadTimeline(
                'Load', startTime, startDate, 'SessionLoad'
            );
            EventBus.publish('Loader:hide');
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

        function handleActorRedirection() {
            var endPoint = Config.getRoute('sessionPageEndPoint'),
                metaURL = endPoint + '/' + token + '/' + role;

            downloadMetaData(metaURL);
        }

        function bootstrap() {
            token = Helper.getUrlParams('token');
            role = Helper.getUrlParams('type');

            role = (Helper.isEmptyString(role)) ? 'au' : role;
            localeData = Config.getLocale();
            performanceLog = new PerformanceLog(token, role);
            templateElement = doc.querySelector('.template');
            qs = templateElement.querySelector.bind(templateElement);
            errorContainer = doc.querySelector('.error-message-container');
            sessionPage = new SessionPage(
                win, doc, EventBus, token, templateElement, localeData
            );
            EventBus.subscribe('Loader:show', showLoader);
            EventBus.subscribe('Loader:hide', hideLoader);

            loaderBlock = doc.querySelector('.overlay');
            handleActorRedirection();
        }

        EventBus.subscribe('Configuration:Loaded', function onConfigurationLoaded() {
            bindLogger();
            bindErrorEvent();
            bootstrap();
        });

        loadConfiguration();
    });
})(require, window, document);

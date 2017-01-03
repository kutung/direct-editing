/*global window, document*/
(function (require, win, doc) {
    'use strict';
    require([
        'scripts/ConfigReader', 'scripts/EventBus', 'scripts/RequestBuilder',
        'scripts/Logger', 'scripts/Helper', 'scripts/PaginatePrintInit',
        'scripts/polyfills/assign'
    ],
    function (
        Config, EventBus, RequestBuilder, Logger, Helper, PaginatePrintInit
    ) {
        function downloadMetaData(successCallback, failureCallback) {
            var metaData,
                startTime, startDate, request,
                requestBuilder = new RequestBuilder(),
                endPoint = Config.getRoute('printLoadEndPoint'),
                token = Helper.getUrlParams('token'),
                // metaURL = "http://uatapi.elsevierproofcentral.com/app/web/index.php/load/62b02d03f0deaf4905f8e13fbf94f8a62b3c/au";
                metaURL = endPoint + '/' + token + '/AU';

            startTime = new Date().getTime();
            startDate = new Date().toString();
            requestBuilder.setUrl(metaURL);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function onSuccessCallback(response) {
                metaData = JSON.parse(response);
                successCallback.call(this, metaData);
            });
            requestBuilder.setFailureCallback(failureCallback);
            requestBuilder.setTimeoutCallback(function onTimeoutCallback() {
                console.log('Timeout!');
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function metaSuccessCallback(meta) {
            var Paginator = new PaginatePrintInit(win, doc, 'pdf'),
                editor = doc.querySelector('.editor'),
                supplementary = ['#extended1', '#extended2', '#ga', '#supplfile'],
                i = 0,
                nodeToBeRemoved = null,
                len = 0,
                parentItem = null;

            editor.innerHTML = meta.data.htmlContent;
            len = supplementary.length;
            for (; i < len; i += 1) {
                parentItem = null;
                nodeToBeRemoved = editor.querySelector(supplementary[i]);
                if (nodeToBeRemoved !== null) {
                    parentItem = nodeToBeRemoved.parentNode;
                }

                if (parentItem !== null) {
                    parentItem.removeChild(nodeToBeRemoved);
                }
            }
            Paginator.load(meta);
        }

        function metaFailureCallback() {
            console.log('Error');
        }

        function loadConfiguration() {
            var configReader = new Config(win);

            configReader.load();
        }

        function bindLogger() {
            var logger = new Logger(win, doc),
                config = Config.get('Log');

            logger.configure(
                config.Level, config.PersistOnServer, Config.getRoute('logEndPoint')
            );
        }

        loadConfiguration();
        EventBus.subscribe('Configuration:Loaded', function() {
            bindLogger();
            downloadMetaData(metaSuccessCallback, metaFailureCallback);
        });
    });
})(require, window, document);

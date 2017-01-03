/*global window, document*/
(function appFn(require, win, doc) {
    'use strict';
    require([
        'scripts/ConfigReader', 'scripts/EventBus', 'scripts/RequestBuilder',
        'scripts/Logger', 'scripts/Helper',
        'pagination/validator/scripts/ProofValidatorInit',
        'scripts/Dom2Xml', 'scripts/Sanitizer',
        'scripts/browser-compatability', 'scripts/polyfills/polyfills',
        'scripts/polyfills/classList', 'scripts/polyfills/dataset',
        'scripts/polyfills/assign', 'scripts/polyfills/dialog',
        'scripts/polyfills/beacon'
    ],
    function requireFn(
        Config, EventBus, RequestBuilder, Logger, Helper,
        ProofValidator, Dom2Xml, Sanitizer
    ) {
        var proofValidator = new ProofValidator(win, doc, EventBus);

        function alertMessage(message) {
            alert(message);
        }

        function enableValidationUI() {
            var validateBtn = doc.querySelector('#validation-submitBtn');

            validateBtn.addEventListener('click', function validateClickFn() {
                var validateHtml = doc.querySelector('#validation-html'),
                    htmlContent = '';

                if (validateHtml !== null) {
                    htmlContent = validateHtml.value;
                    proofValidator.validateOnExistingProof(htmlContent);
                    validateHtml.value = '';
                }
            }, false);
        }

        function downloadMetaData(successCallback) {
            var metaData, request,
                requestBuilder = new RequestBuilder(),
                endPoint = Config.getRoute('printLoadEndPoint'),
                token = Helper.getUrlParams('token'),
                metaURL = endPoint + '/' + token + '/AU';

            if (Helper.isEmptyString(token) === true) {
                alertMessage('No token parameter Found!');
                return;
            }
            requestBuilder.setUrl(metaURL);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function onSuccessCallback(response) {
                metaData = JSON.parse(response);
                successCallback(metaData);
            });
            requestBuilder.setFailureCallback(function onFailureCallback() {
                alertMessage('Token Not Found!');
            });
            requestBuilder.setTimeoutCallback(function onTimeoutCallback() {
                alertMessage('Request Timeout!');
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function removeAllNodes(target, selectors) {
            var i = 0, length = 0, nodes = null,
                node = null, parent = null;

            nodes = target.querySelectorAll(selectors.join(','));
            length = nodes.length;
            for (; i < length; i += 1) {
                node = nodes[i];
                parent = node.parentNode;
                if (parent !== null) {
                    parent.removeChild(node);
                }
            }
        }

        function metaSuccessCallback(meta) {
            var htmlNode = doc.createElement('div'),
                htmlContent = '';

            htmlNode.innerHTML = meta.data.htmlContent;
            removeAllNodes(
                htmlNode, ['#extended1', '#extended2', '#ga', '#supplfile']
            );
            htmlContent = Dom2Xml.toXml(htmlNode.firstElementChild);
            htmlContent = Sanitizer.sanitize(
                htmlContent, true, false, win, ['br']
            );
            proofValidator.validateOnGeneratedProof(htmlContent, meta);
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
        EventBus.subscribe('Configuration:Loaded', function configLoadFn() {
            bindLogger();
            downloadMetaData(metaSuccessCallback);
            enableValidationUI();
        });
    });
})(require, window, document);

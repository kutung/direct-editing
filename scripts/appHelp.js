(function appPrintLoader(require, win, doc) {
    'use strict';
    require([
        'scripts/ConfigReader', 'scripts/EventBus', 'scripts/RequestBuilder',
        'scripts/Helper', 'templates/Help', 'templates/Header',
        'scripts/templates/Locale', 'scripts/TemplateHelper',
        'scripts/polyfills/classList', 'scripts/polyfills/dataset',
        'scripts/polyfills/assign', 'scripts/polyfills', 'scripts/polyfills/beacon',
        'scripts/analytics'
    ],
    function onHelpPageLoad(Config, EventBus, RequestBuilder, Helper,
        HelpTemplate, HeaderTemplate, LocaleTemplate, TemplateHelper
    ) {
        var localeData, templateContainer, qs, helpContainer, moveTopLink,
            errorContainer, loaderBlock;

        function fireAnalytics(actor, token) {
            var gA = win.ga;

            gA('create', Config.get('analyticsKey'), 'auto');
            gA('send', 'event',
                'Help ' + token, actor, {
                    'useBeacon': true
                }
            );
            gA('send', 'pageview', {
                'title': 'Help: ' + token + ' - ' + actor,
                'hitCallback': function hitcallback() {
                    console.log('Analytics success.');
                }
            });
        }

        function applyLocale(template, locale) {
            return Helper.replaceLocaleString(template, locale);
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

        function downloadMetaData(successCallback, failureCallback) {
            var request, metaData,
                requestBuilder = new RequestBuilder(),
                endPoint = Config.getRoute('loadHelpConfiguration'),
                token = Helper.getUrlParams('token'),
                metaURL = endPoint;

            if (
                Helper.isEmptyString(token) === true ||
                Helper.isUndefined(token) === true
            ) {
                throw new Error('help.page.token.missing');
            }

            requestBuilder.setUrl(metaURL);
            requestBuilder.setMethod('GET');
            requestBuilder.setSuccessCallback(function successFn(response) {
                metaData = JSON.parse(response);
                successCallback.call(win, metaData);
            });
            requestBuilder.setFailureCallback(failureCallback);
            requestBuilder.setTimeoutCallback(function timeoutFn() {
                EventBus.publish('Loader:hide');
                console.log('Timeout!');
            });
            request = requestBuilder.build();
            request.withCredentials(true);
            request.send();
        }

        function updateLocaleLink(LocaleList, HelpLink) {
            var i = 0, localeLinkElement, localeLink, localeName, localePrefix,
                spanElement, currentLocale,
                length = LocaleList.length;

            currentLocale = Config.get('currentLocale');
            for (; i < length; i += 1) {
                localeLinkElement = LocaleList[i];
                localeName = localeLinkElement.getAttribute('data-name');
                localePrefix = localeName.substring(0, 2);
                localeLink = HelpLink.replace('{{locale}}', localePrefix);
                if (currentLocale === localeName) {
                    spanElement = doc.createElement('span');
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

        function renderLocale(token, actor) {
            var helpLink, localeList;

            localeList = templateContainer.querySelectorAll('.locale-link');
            helpLink = Config.getRoute('helpLink');
            helpLink = helpLink.replace('{{token}}', token);
            helpLink = helpLink.replace('{{actor}}', actor);
            updateLocaleLink(localeList, helpLink);
        }

        function renderHelpTemplate(MetaData) {
            var partials = {},
                locale = {},
                token = Helper.getUrlParams('token'),
                role = Helper.getUrlParams('type'),
                localeShow = Config.get('locale'),
                localeEnalbeFor = Config.get('localeEnable'),
                helpContent, tempElement, localeTemplate;

            role = (Helper.isEmptyString(role)) ? 'au' : role;
            partials.header = applyLocale(HeaderTemplate, localeData);
            helpContent = applyLocale(HelpTemplate, localeData);
            if (localeShow === true &&
                    localeEnalbeFor.indexOf(role.toUpperCase()) !== -1
            ) {
                locale.data = Config.get('localeSetting');
                localeTemplate = applyLocale(LocaleTemplate, localeData);
                partials.locale = TemplateHelper.render(
                    localeTemplate, {}, locale
                );
            }
            if (Config.get('enableAnalyticsOnProof') === true) {
                fireAnalytics(role, token);
            }
            helpContent = TemplateHelper.render(
                helpContent, partials, MetaData
            );
            tempElement = doc.createElement('div');
            tempElement.innerHTML = helpContent;
            templateContainer.appendChild(tempElement.firstChild);
            renderLocale(token, role);
            EventBus.publish('Loader:hide');
        }

        function showMoveTopIcon() {
            win.onscroll = function onscroll() {
                if (
                    doc.body.scrollTop > 160 ||
                    doc.documentElement.scrollTop > 160
                ) {
                    moveTopLink.style.display = 'inline-block';
                }
                else {
                    moveTopLink.style.display = 'none';
                }
            };
        }

        function metaSuccessCallback(Meta) {
            var metaData = Meta.data;

            if (Meta.success === false) {
                showError('Problem in loading help page content');
                EventBus.publish('Loader:hide');
                throw new Error('help.content.loading.problem');
            }
            renderHelpTemplate(metaData);
            helpContainer = qs('section.help-container');
            moveTopLink = qs('.move-top');
            showMoveTopIcon();
        }

        function metaFailureCallback() {
            showError('Problem in loading help page content');
            EventBus.publish('Loader:hide');
        }

        function loadConfiguration() {
            (new Config(win)).load();
        }

        loadConfiguration();
        EventBus.subscribe('Configuration:Loaded', function onConfigurationLoaded() {
            templateContainer = doc.querySelector('.template');
            localeData = Config.getLocale();
            qs = templateContainer.querySelector.bind(templateContainer);
            errorContainer = doc.querySelector('.error-message-container');
            EventBus.subscribe('Loader:show', showLoader);
            EventBus.subscribe('Loader:hide', hideLoader);
            loaderBlock = doc.querySelector('.overlay');
            downloadMetaData(metaSuccessCallback, metaFailureCallback);
        });
    });
})(require, window, document);

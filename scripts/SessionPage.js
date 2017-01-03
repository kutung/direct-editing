define(['scripts/ConfigReader', 'scripts/Helper', 'scripts/TemplateHelper',
        'templates/Header', 'templates/SessionPageDetails', 'templates/SessionLoginPage'],
    function SessionPageLoader(
        Config, Helper, TemplateHelper, HeaderTemplate, SessionPageDetailsTemplate, SessionLoginPageTemplate
    ) {
        function initializeVariables(instance) {
            instance.win = null;
            instance.doc = null;
            instance.token = null;
            instance.eBus = null;
            instance.bodyContainer = null;
            instance.isRendered = false;
            instance.metaData = null;
            instance.clickHereLink = null;
            instance.templates = {};
            instance.locale = null;
        }

        function SessionPage(
            Win, Doc, EventBus, Token, BodyContainer, Locale
        ) {
            if (Win instanceof Win.Window === false) {
                throw new Error('sessionPage.window.missing');
            }
            if (Doc instanceof Win.Document === false) {
                throw new Error('sessionPage.document.missing');
            }
            if (Helper.isFunction(EventBus.subscribe) === false) {
                throw new Error('sessionPage.eventbus.missing');
            }
            if (Helper.isEmptyString(Token) === true) {
                throw new Error('sessionPage.token.empty');
            }
            if (BodyContainer instanceof Win.HTMLElement === false) {
                throw new Error('sessionPage.container.not.htmlelement');
            }
            initializeVariables(this);
            this.win = Win;
            this.htmlDoc = Doc;
            this.eBus = EventBus;
            this.token = Token;
            this.bodyContainer = BodyContainer;
            this.locale = Locale;
        }

        function updateLocaleLink(facadeLinkElement, facadeLink) {
            var localeLink, localePrefix, currentLocale;

            currentLocale = Config.get('currentLocale');
            localePrefix = currentLocale.substring(0, 2);
            localeLink = facadeLink.replace('{{locale}}', localePrefix);
            facadeLinkElement.setAttribute('href', localeLink);
        }

        function renderLocaleFacadeLink(instance) {
            var facadeLink, facadeLinkElement,
                token = instance.token,
                actor = instance.metaData.currentActor;

            facadeLinkElement = instance.htmlDoc.querySelector('.facade-link');
            facadeLink = Config.getRoute('facadeLink');
            facadeLink = facadeLink.replace('{{token}}', token);
            facadeLink = facadeLink.replace('{{actor}}', actor);
            updateLocaleLink(facadeLinkElement, facadeLink);
        }

        function applyLocale(template, locale) {
            return Helper.replaceLocaleString(template, locale);
        }

        function assertMetaData(instance) {
            if (instance.metaData === null) {
                throw new Error('SessionPage.page.meta.data.null');
            }
        }

        function renderTemplate(instance) {
            var template, tempElement, sessionPageDetails, sessionPageLink,
                partials = {};

            sessionPageDetails = applyLocale(SessionPageDetailsTemplate, instance.locale);
            sessionPageDetails = sessionPageDetails.replace('{{title}}', instance.metaData.title);

            partials.header = applyLocale(HeaderTemplate, instance.locale);
            partials.sessionPageDetails = applyLocale(sessionPageDetails, instance.locale);
            template = applyLocale(SessionLoginPageTemplate, instance.locale);
            template = TemplateHelper.render(
                template, partials, instance.metaData
            );
            tempElement = instance.htmlDoc.createElement('div');
            tempElement.innerHTML = template;
            instance.bodyContainer.appendChild(tempElement.firstChild);
        }

        SessionPage.prototype.setMetaData = function setMetaData(metaData) {
            if (Helper.isObject(metaData) === false) {
                throw new Error('sessionPage.right.panel.metaData.missing');
            }
            this.metaData = metaData;
            this.metaData.page = 'online';
        };

        SessionPage.prototype.render = function render() {
            assertMetaData(this);
            renderTemplate(this);
            this.isRendered = true;
            renderLocaleFacadeLink(this);
        };

        return SessionPage;
    });

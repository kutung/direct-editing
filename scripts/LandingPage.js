define(['scripts/ConfigReader', 'scripts/Helper', 'scripts/TemplateHelper',
        'templates/ArticleDetails', 'templates/Header',
        'templates/Main', 'templates/Footer',
        'scripts/templates/Locale', 'templates/ProofCorrector',
        'templates/ProofValidator', 'templates/ProofEditor',
        'templates/QueryReplier'],
    function LandingPageLoader(
        Config, Helper, TemplateHelper, ArticleDetailsTemplate,
        HeaderTemplate, MainTemplate, FooterTemplate, LocaleTemplate,
        ProofCorrectorTemplate, ProofValidatorTemplate, ProofEditorTemplate,
        QueryReplierTemplate
    ) {
        function initializeVariables(instance) {
            instance.win = null;
            instance.doc = null;
            instance.token = null;
            instance.eBus = null;
            instance.bodyContainer = null;
            instance.isRendered = false;
            instance.metaData = null;
            instance.proceedClick = null;
            instance.proceedButton = null;
            instance.footerContainer = null;
            instance.templates = {};
            instance.locale = null;
        }

        function LandingPage(
            Win, Doc, EventBus, Token, BodyContainer, Locale
        ) {
            if (Win instanceof Win.Window === false) {
                throw new Error('landingPage.window.missing');
            }
            if (Doc instanceof Win.Document === false) {
                throw new Error('landingPage.document.missing');
            }
            if (Helper.isFunction(EventBus.subscribe) === false) {
                throw new Error('landingPage.eventbus.missing');
            }
            if (Helper.isEmptyString(Token) === true) {
                throw new Error('landingPage.token.empty');
            }
            if (BodyContainer instanceof Win.HTMLElement === false) {
                throw new Error('landingPage.container.not.htmlelement');
            }
            initializeVariables(this);
            this.win = Win;
            this.htmlDoc = Doc;
            this.eBus = EventBus;
            this.token = Token;
            this.bodyContainer = BodyContainer;
            this.locale = Locale;
            this.templates.proofCorrector = ProofCorrectorTemplate;
            this.templates.proofEditor = ProofEditorTemplate;
            this.templates.proofValidator = ProofValidatorTemplate;
            this.templates.queryReplier = QueryReplierTemplate;
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

            localeList = instance.bodyContainer.querySelectorAll('.locale-link');
            facadeLink = Config.getRoute('facadeLink');
            facadeLink = facadeLink.replace('{{token}}', token);
            facadeLink = facadeLink.replace('{{actor}}', actor);
            updateLocaleLink(localeList, facadeLink, instance);
        }

        function updateHelpLink(instance) {
            var helpLink, helpContainer, currentLocale, localePrefix,
                token = instance.token,
                actor = instance.metaData.actor;

            currentLocale = Config.get('currentLocale');
            localePrefix = currentLocale.substring(0, 2);
            helpLink = Config.getRoute('helpLink');
            helpLink = helpLink.replace('{{token}}', token);
            helpLink = helpLink.replace('{{actor}}', actor);
            helpLink = helpLink.replace('{{locale}}', localePrefix);

            helpContainer = instance.bodyContainer.querySelector('.help-link');
            helpContainer.setAttribute('href', helpLink);
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
                journalImage = instance.bodyContainer.querySelector(
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

        function proceedClick() {
            var currentLocale = Config.get('currentLocale'),
                localePrefix = currentLocale.substring(0, 2),
                link = Config.getRoute('interfaceLink');

            if (this.metaData.articleMode === 'offline') {
                link = Config.getRoute('offlineLink');
            }
            link = link.replace('{{token}}', this.token);
            link = link.replace('{{locale}}', localePrefix);
            link = link.replace('{{actor}}', this.metaData.actor);
            this.proceedButton.disabled = true;
            this.win.open(link);
        }

        function bindProceedButton(instance) {
            instance.proceedClick = proceedClick.bind(instance);
            instance.proceedButton = instance.bodyContainer.querySelector('.proceed');
            instance.proceedButton.addEventListener(
                'click', instance.proceedClick, false
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
            var template, tempElement, localeTemplate,
                partials = {},
                locale = {},
                actor = instance.metaData.actor,
                localeShow = Config.get('locale'),
                localeEnalbeFor = Config.get('localeEnable');

            partials.header = applyLocale(HeaderTemplate, instance.locale);
            partials.footer = applyLocale(FooterTemplate, instance.locale);
            partials.articleDetails = applyLocale(ArticleDetailsTemplate, instance.locale);
            partials.actorContent = checkRoleAndChooseTemplate(instance);

            if (localeShow === true &&
                localeEnalbeFor.indexOf(actor) !== -1
            ) {
                locale.data = Config.get('localeSetting');
                localeTemplate = applyLocale(LocaleTemplate, instance.locale);
                partials.locale = TemplateHelper.render(localeTemplate, {}, locale);
            }
            template = applyLocale(MainTemplate, instance.locale);
            template = TemplateHelper.render(
                template, partials, instance.metaData
            );
            tempElement = instance.htmlDoc.createElement('div');
            tempElement.innerHTML = template;
            instance.bodyContainer.appendChild(tempElement.firstChild);
        }

        LandingPage.prototype.setMetaData = function setMetaData(metaData) {
            if (Helper.isObject(metaData) === false) {
                throw new Error('landingpage.right.panel.metaData.missing');
            }
            this.metaData = metaData;
            this.metaData.page = 'online';
        };

        LandingPage.prototype.render = function render() {
            assertMetaData(this);
            renderTemplate(this);
            this.isRendered = true;
            renderLocale(this);
            if (this.metaData.articleMode.toLowerCase() === 'online') {
                updateHelpLink(this);
            }
            else {
                this.bodyContainer.querySelector('.help-link').innerHTML = '';
            }
            bindOnLoadJournalImage(this);
            bindProceedButton(this);
        };

        return LandingPage;
    });

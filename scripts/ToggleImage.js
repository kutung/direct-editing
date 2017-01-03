define(['scripts/Helper'],
    function ToggleImageLoader(Helper) {
        var template = [
                '<div class="div-toggle-images">',
                '<button class="web-btn" aria-label="{{toggleimage.weblabel.text}}" title ="{{toggleimage.weblabel.title}}"><span class="rbweb selected"></span>{{toggleimage.weblabel.text}}</button>',
                '<button class="print-btn" aria-label="{{toggleimage.printlabel.text}}" title ="{{toggleimage.printlabel.title}}"><span class="rbprint"></span>{{toggleimage.printlabel.text}}</button>',
                '</div>'
            ],
            overlayTemplate = [
                '<div class="toggleoverlay"></div>'
            ];

        function initializeVariables(instance) {
            instance.toggleImageContainer = null;
            instance.annotatorcontainer = null;
            instance.overlayContainer = null;
            instance.win = null;
            instance.htmlDoc = null;
            instance.container = null;
            instance.isRendered = false;
            instance.metaData = null;
            instance.addToggleAction = null;
            instance.webRadioBtn = null;
            instance.printRadioBtn = null;
            instance.locale = null;
            instance.loading = false;
            instance.loaderClickDelay = 500;
        }

        function setOverLayLoading(container, loading) {
            var style = container.querySelector('div.toggleoverlay').style,
                imgageNode = container.querySelector('img'),
                compStyle = window.getComputedStyle(imgageNode);

            if (loading === true) {
                style.display = 'block';
                style.top = compStyle.top;
                style.left = compStyle.left;
                style.height = compStyle.height;
                style.width = compStyle.width;
                this.loading = true;
            }
            else {
                this.loading = false;
                style.display = 'none';
            }
        }

        function bindOnLoadImage(container) {
            var defaultImage,
                articleImage = container.querySelector(
                    '.imgrsize'
                );

            setOverLayLoading(container, true);
            if (Helper.isUndefined(articleImage.src) === false) {
                defaultImage = articleImage.src;
                articleImage.onerror = function onerror() {
                    this.setAttribute('src', defaultImage);
                };
            }

            articleImage.onload = function onload() {
                setOverLayLoading(container, false);
            };
        }

        function addToggleAction(e) {
            var eleNode, instance = this;

            if ((Helper.isUndefined(e) === true) && (e.target === null) ||
                (e.target.nodeName !== 'BUTTON')) {
                return false;
            }

            this.container = e.target.parentNode.parentNode;
            this.webRadioBtn = e.target.parentNode.querySelector('span.rbweb');
            this.printRadioBtn = e.target.parentNode.querySelector('span.rbprint');
            bindOnLoadImage(this.container);
            eleNode = e.target;

            if ((this.webRadioBtn.classList.contains('selected') === true) &&
                (eleNode.classList.contains('print-btn') === true)) {
                instance.showPrintView(eleNode.getAttribute('data-print-src'));
            }
            else if ((this.printRadioBtn.classList.contains('selected') === true) &&
                  (eleNode.classList.contains('web-btn') === true)) {
                instance.showWebView(eleNode.getAttribute('data-web-src'));
            }
            else {
                setOverLayLoading(this.container, false);
                return false;
            }
            return true;
        }

        function assertRendered(instance) {
            if (instance.isRendered === false) {
                throw new Error('toggle.image.not.rendered');
            }
        }

        function ToggleImage(Win, Doc, EventBus, Containers, locale) {
            if (Win instanceof Win.Window === false) {
                throw new Error('toggle.image.window.missing');
            }
            if (Doc instanceof Win.Document === false) {
                throw new Error('toggle.image.document.missing');
            }

            initializeVariables(this);
            this.win = Win;
            this.htmlDoc = Doc;
            this.eBus = EventBus;
            this.containers = Containers;
            if (typeof locale === 'object') {
                this.locale = locale;
            }
        }

        ToggleImage.prototype.showPrintView = function showPrintView(printSrc) {
            var imageSrc = this.container.querySelector('.imgrsize');

            imageSrc.setAttribute('src', printSrc);
            this.webRadioBtn.classList.remove('selected');
            this.printRadioBtn.classList.add('selected');
        };

        ToggleImage.prototype.showWebView = function showWebView(webSrc) {
            var imageSrc = this.container.querySelector('.imgrsize');

            imageSrc.setAttribute('src', webSrc);
            this.webRadioBtn.classList.add('selected');
            this.printRadioBtn.classList.remove('selected');
        };

        ToggleImage.prototype.render = function render() {
            var qs, qSelect, i, imageSrc, imageNode, imageParent,
                tempElement = this.htmlDoc.createElement('div'),
                tempOverlayElement = this.htmlDoc.createElement('div');

            for (i = 0; i < this.containers.length; i += 1) {
                tempElement.innerHTML = Helper.replaceLocaleString(
                    template.join(''), this.locale
                );
                tempOverlayElement.innerHTML = Helper.replaceLocaleString(
                    overlayTemplate.join(''), this.locale
                );
                this.toggleImageContainer = tempElement.firstChild;
                qs = this.toggleImageContainer.querySelector.bind(this.toggleImageContainer);
                this.webButton = qs('.web-btn');
                this.printButton = qs('.print-btn');
                imageSrc = this.containers[i].querySelector('.imgrsize');
                this.webButton.dataset.webSrc = imageSrc.getAttribute('data-web-src');
                this.printButton.dataset.printSrc = imageSrc.getAttribute('data-print-src');
                this.overlaycontainer = tempOverlayElement.firstChild;
                this.containers[i].appendChild(this.toggleImageContainer);
                qSelect = this.containers[i].querySelector.bind(this.containers[i]);
                imageNode = qSelect('img');
                this.containers[i].insertBefore(this.overlaycontainer, this.containers[i].firstChild);
                this.addToggleAction = addToggleAction.bind(this);
                this.webButton.addEventListener('click', this.addToggleAction, false);
                this.printButton.addEventListener('click', this.addToggleAction, false);
                this.isRendered = true;
                this.eBus.publish('ToggleImage:onRender', this);
            }
        };

        ToggleImage.removeWrapper = function removeWrapperFn(container) {
            var wrapper,
                i = 0,
                wrappers = container.querySelectorAll('.div-toggle-images'),
                len = wrappers.length;

            for (; i < len; i += 1) {
                wrapper = wrappers[i];
                wrapper.parentNode.removeChild(wrapper);
            }
            return container;
        };

        ToggleImage.prototype.destroy = function destroy() {
            assertRendered(this);
            this.webButton.removeEventListener('click', this.addToggleAction, false);
            this.printButton.removeEventListener('click', this.addToggleAction, false);
            initializeVariables(this);
        };

        return ToggleImage;
    });

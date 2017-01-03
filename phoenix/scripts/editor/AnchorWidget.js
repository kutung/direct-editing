define([
    'scripts/editor/FormattingConfig', 'scripts/Panel', 'scripts/EventBus', 'scripts/editor/Normalizer'
], function anchorWidgetLoader(FormattingConfig, Panel, EventBus, Normalizer) {
    'use strict';

    var anchorWidgetTemplate = [
        '<div class="anchor-editor">',
            '<div class="anchor-url-container">',
                '<span class="label">URL:</span>',
                '<input class="anchor-url-value" type="text" />',
            '</div>',
            '<div class="anchor-text-container">',
                '<span class="label">Text:</span>',
                '<textarea class="anchor-text-value"></textarea>',
            '</div>',
            '<div class="anchor-button-container">',
                '<span class="anchor-submit btn">Submit</span>',
            '</div>',
        '</div>'
    ];

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance Action Instance
     * @return {void}
     */
    function initVariables(instance) {
        /**
         * Global Window object
         * @property {Window} win
         * @private
         */
        Object.defineProperty(instance, 'win', {
            'value': null,
            'writable': true
        });
        /**
         * Global Document object
         * @property {HTMLDocument} doc
         * @private
         */
        Object.defineProperty(instance, 'doc', {
            'value': null,
            'writable': true
        });
        /**
         * Editor element to attach events to
         * @property {HTMLElement} editor
         * @private
         */
        Object.defineProperty(instance, 'editor', {
            'value': null,
            'writable': true
        });
        /**
         * WidgetPanel instance
         * @property {Object} widgetPanel
         * @private
         */
        Object.defineProperty(instance, 'widgetPanel', {
            'value': null,
            'writable': true
        });
        /**
         * The css selector beyond which we don't want to traverse
         * @property {String} stopElementSelector
         * @private
         */
        Object.defineProperty(instance, 'stopElementSelector', {
            'value': 'p',
            'writable': false
        });
        /**
         * FormattingConfig instance
         * @property {FormattingConfig} formatConfig
         * @private
         */
        Object.defineProperty(instance, 'formatConfig', {
            'value': null,
            'writable': true
        });
        /**
         * Normalizer instance
         * @property {Normalize} normalizer
         * @private
         */
        Object.defineProperty(instance, 'normalizer', {
            'value': null,
            'writable': true
        });
    }

    function AnchorWidget(editor, widgetPanel, win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.editor = editor;
        this.widgetPanel = widgetPanel;
        this.formatConfig = FormattingConfig.get(this.win);
        this.normalizer = new Normalizer(this.win, this.doc);
    }

    function onFocusEditor() {
        this.hide();
    }

    function createWidgetTemplate(instance) {
        var anchorEditHtmlStr = anchorWidgetTemplate.join(''), frag,
            anchorEditHtml;

        frag = instance.doc.createElement('div');
        frag.innerHTML = anchorEditHtmlStr;
        anchorEditHtml = frag.firstElementChild;

        return anchorEditHtml;
    }

    function renderPanel(instance) {
        var widgetHtmlTemplate;

        instance.widgetPanel.classList.add('show-widget');
        instance.panel = new Panel(
            instance.widgetPanel, instance.doc, instance.win, EventBus
        );
        widgetHtmlTemplate = createWidgetTemplate(instance);
        instance.panel.render();
        instance.panel.setTitle('Link Editor');
        instance.panel.add(widgetHtmlTemplate);
        instance.panel.ignoreHeaderClick(true);
    }

    function insertModifiedAnchorElem(instance, parentNode) {
        var insertWrapper = instance.formatConfig.getInsertWrapper(),
            widgetUrl = instance.widgetPanel.querySelector('.anchor-url-value').value,
            widgetText = instance.widgetPanel.querySelector('.anchor-text-value').value,
            parentNode, cloneNode;

        cloneNode = instance.anchorElem.cloneNode(true);
        cloneNode.setAttribute('href', widgetUrl);
        cloneNode.textContent = widgetText;
        insertWrapper.appendChild(cloneNode);
        parentNode.insertBefore(insertWrapper, instance.anchorElem.nextSibling);
    }

    function deleteExistingAnchorElem(instance, parentNode) {
        var deleteWrapper = instance.formatConfig.getDeleteWrapper();

        deleteWrapper.appendChild(instance.anchorElem.cloneNode(true));
        parentNode.insertBefore(deleteWrapper, instance.anchorElem);
    }

    function updateAnchorElem(instance) {
        var widgetUrl = instance.widgetPanel.querySelector('.anchor-url-value').value,
            widgetText = instance.widgetPanel.querySelector('.anchor-text-value').value;

        instance.anchorElem.setAttribute('href', widgetUrl);
        instance.anchorElem.textContent = widgetText;
    }

    function onSubmitClick(anchorToolInstance) {
        var widgetUrl = this.widgetPanel.querySelector('.anchor-url-value').value,
            widgetText = this.widgetPanel.querySelector('.anchor-text-value').value,
            anchorUrl = this.anchorElem.getAttribute('href'),
            anchorText = this.anchorElem.textContent,
            spanNode = this.anchorElem.closest('span'),
            parentNode = this.anchorElem.parentNode;

        if (widgetText.trim() === '' || widgetUrl.trim() === '') {
            throw new Error('fields.should.not.be.empty');
        }
        if (widgetUrl === anchorUrl && widgetText === anchorText) {
            throw new Error('no.modification');
        }
        else if (this.formatConfig.isInsert(spanNode) === true) {
            updateAnchorElem(this);
        }
        else {
            deleteExistingAnchorElem(this, parentNode);
            insertModifiedAnchorElem(this, parentNode);
            parentNode.removeChild(this.anchorElem);
            this.normalizer.normalize(
                this.anchorElem.closest(this.stopElementSelector)
            );
        }
        this.hide();
        anchorToolInstance.destroy();
    }

    AnchorWidget.prototype.render = function render(anchorElem, anchorToolInstance) {
        var widgetHref, widgetText, anchorHref, anchorInnerText, submitBtn;

        this.anchorElem = anchorElem;

        renderPanel(this);
        anchorHref = this.anchorElem.getAttribute('href');
        anchorInnerText = this.anchorElem.textContent;
        widgetHref = this.widgetPanel.querySelector('.anchor-url-value');
        widgetText = this.widgetPanel.querySelector('.anchor-text-value');
        widgetHref.value = anchorHref;
        widgetText.value = anchorInnerText;
        submitBtn = this.widgetPanel.querySelector('.anchor-submit');

        submitBtn.addEventListener('click', onSubmitClick.bind(this, anchorToolInstance), false);
        this.editor.addEventListener('click', onFocusEditor.bind(this), false);
    };

    AnchorWidget.prototype.hide = function hide() {
        this.widgetPanel.classList.remove('show-widget');
    };

    return AnchorWidget;
});

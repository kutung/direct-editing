define([
    'scripts/editor/FormattingConfig', 'scripts/Panel', 'scripts/EventBus', 'scripts/editor/AnchorWidget'
], function anchorWidgetLoader(FormattingConfig, Panel, EventBus, AnchorWidget) {
    'use strict';

    var anchorToolBarHtml = [
        '<div class="anchor-toolBar-panel user-select-none">',
            '<div class="anchor-wrapper">',
                '<span class="view-link"></span>',
                '<span class="edit-link">Edit</span>',
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
         * AnchorToolPanel instance
         * @property {Object} anchorToolPanel
         * @private
         */
        Object.defineProperty(instance, 'anchorToolPanel', {
            'value': null,
            'writable': true
        });
        /**
         * AnchorWidgetPanel instance
         * @property {Object} anchorWidgetPanel
         * @private
         */
        Object.defineProperty(instance, 'anchorWidgetPanel', {
            'value': null,
            'writable': true
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
         * Focus Event Callback Function
         * @property {FunctionReference} onFocusEditorFn
         * @private
         */
        Object.defineProperty(instance, 'onFocusEditorFn', {
            'value': null,
            'writable': true
        });
    }

    function AnchorToolBar(editor, anchorWidgetPanel, win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.editor = editor;
        this.anchorWidgetPanel = anchorWidgetPanel;
        this.formatConfig = FormattingConfig.get(this.win);
        this.onFocusEditorFn = onFocusEditor.bind(this);
    }

    function setAnchorBarPosition(anchorElem, instance) {
        var clientRect,
            lineHeight = instance.win.getComputedStyle(anchorElem).getPropertyValue('line-height'),
            cssRule = instance.win.getComputedStyle(instance.anchorToolPanel),
            toolBarWidth = cssRule.getPropertyValue('width');

        lineHeight = parseInt(lineHeight.substr(0, lineHeight.indexOf('p')), 10);
        toolBarWidth = parseInt(toolBarWidth.substr(0, toolBarWidth.indexOf('p')), 10);

        clientRect = anchorElem.getBoundingClientRect();
        instance.anchorToolPanel.style.top = clientRect.top + scrollY + lineHeight + 'px';
        instance.anchorToolPanel.style.left = (clientRect.right - toolBarWidth) + 'px';
    }

    function createViewLink(anchorElem, instance) {
        var aTag = instance.doc.createElement('a'),
            viewLink = instance.anchorToolPanel.querySelector('.view-link');

        aTag.setAttribute('href', anchorElem.getAttribute('href'));
        /* istanbul ignore else */
        if (anchorElem.getAttribute('href').slice(0, 1) !== '#') {
            aTag.target = '_blank';
        }
        aTag.textContent = 'view link';
        viewLink.innerHTML = '';
        viewLink.appendChild(aTag);
    }

    /**
     * Returns a new instance of AnchorWidget
     *
     * @method getAnchorWidget
     * @return {Object} Instance of getAnchorWidget
     */
    AnchorToolBar.prototype.getAnchorWidget = function getAnchorWidget() {
        return new AnchorWidget(
            this.editor, this.anchorWidgetPanel, this.win, this.doc
        );
    };

    function onClickEditLink(anchorElem) {
        var anchorWidget;

        anchorWidget = this.getAnchorWidget();
        anchorWidget.render(anchorElem, this);
    }

    function renderAnchorBar(anchorElem, instance) {
        var editLink;

        instance.anchorToolPanel = instance.doc.querySelector('.anchor-toolBar-panel');
        editLink = instance.anchorToolPanel.querySelector('.edit-link');

        createViewLink(anchorElem, instance);
        setAnchorBarPosition(anchorElem, instance);
        instance.anchorToolPanel.classList.add('show-anchor-bar');
        editLink.addEventListener('click', onClickEditLink.bind(instance, anchorElem), false);
    }

    function onFocusEditor() {
        this.destroy();
    }

    function createAnchorBarTemplate(instance) {
        var anchorToolBarStr = anchorToolBarHtml.join(''), temp;

        temp = instance.doc.createElement('div');
        temp.innerHTML = anchorToolBarStr;
        instance.doc.body.appendChild(temp.firstChild);
    }

    AnchorToolBar.prototype.show = function show(target, anchorElem) {
        var parentNode = anchorElem.closest('span'),
            deleteNode = target.closest('span[data-format-delete]');

        this.destroy();
        /* istanbul ignore else */
        if (parentNode !== null || deleteNode !== null) {
            /* istanbul ignore else */
            if (this.formatConfig.isDelete(parentNode) === true ||
                this.formatConfig.isDelete(deleteNode) === true
            ) {
                throw new Error('editing.not.allowed');
            }
        }
        createAnchorBarTemplate(this);
        renderAnchorBar(anchorElem, this);

        this.editor.addEventListener('focus', this.onFocusEditorFn.bind(this), false);
    };

    AnchorToolBar.prototype.destroy = function destroy() {
        var toolbar = this.doc.querySelector('.anchor-toolBar-panel');

        if (toolbar !== null) {
            toolbar.parentNode.removeChild(toolbar);
        }
    };

    return AnchorToolBar;
});

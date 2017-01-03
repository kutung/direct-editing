define([
    'scripts/editor/FormattingConfig', 'scripts/editor/Selection', 'scripts/editor/Util',
    'scripts/editor/Comment', 'scripts/EventBus'
], function InstructCommandLoader(FormattingConfig, SelectionContext, Util, Comment, EventBus) {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance InstructCommand
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
         * FormatConfig instance
         * @property {Object} formatConfig
         * @private
         */
        Object.defineProperty(instance, 'formatConfig', {
            'value': null,
            'writable': true
        });
        /**
         * Util instance
         * @property {Object} util
         * @private
         */
        Object.defineProperty(instance, 'util', {
            'value': null,
            'writable': true
        });
        /**
         * Html selectors array
         * @property {Array} closestSelectors
         * @private
         */
        Object.defineProperty(instance, 'closestSelectors', {
            'value': [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'p', 'dl'
            ],
            'writable': true
        });
        /**
         * CommentsMapper instance
         * @property {Object} mapper
         * @private
         */
        Object.defineProperty(instance, 'mapper', {
            'value': null,
            'writable': true
        });
        /**
         * CommentsPanel element to attach comments
         * @property {HTMLElement} commentPanel
         * @private
         */
        Object.defineProperty(instance, 'commentPanel', {
            'value': null,
            'writable': true
        });
    }

    /**
    * Create instruct
    *
    * @class InstructCommand
    * @constructor
    * @param {Window} win window global object
    * @param {HTMLDocument} doc document global object
    * @param {Object} commentsMapper CommentsMapper instance
    * @param {HTMLElement} commentPanel element to attach comments to
    *
    * @example
    *   var panel = document.querySelector('.comments-panel'),
    *       commentsMapper = new CommentsMapper(window, document);
    *
    *   new InstructCommand(
    *       this.win, this.doc, commentsMapper, panel
    *   );
    */
    function InstructCommand(win, doc, commentsMapper, commentPanel) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.util = new Util(this.win, this.doc);
        this.formatConfig = FormattingConfig.get(this.win);
        this.mapper = commentsMapper;
        this.commentPanel = commentPanel;
    }

    /**
     * Create instruction along with comments and svg line
     * @method execute
     * @return {void}
     */
    InstructCommand.prototype.execute = function execute() {
        var selection = SelectionContext.get(this.win),
            instructWrapper = this.formatConfig.getInstructWrapper(),
            uniqueKey = this.util.generateUniqueKey(),
            cloneContents, hasAnyInstruct;

        if (this.util.isValidSelection(selection) === false) {
            throw new Error('multiple.section.formatting.not.allowed');
        }

        cloneContents = selection.cloneContents();
        hasAnyInstruct = cloneContents.querySelector('span[data-format-instruct="true"]');
        if (hasAnyInstruct !== null || selection.hasFormattingParentOf('instruct') === true) {
            throw new Error('instruction.not.allowed.over.instruction');
        }

        //Temp
        if (selection.collapsed === false) {
            throw new Error('instruction.not.allowed');
        }

        instructWrapper.appendChild(selection.cloneContents());
        instructWrapper.dataset.instructId = uniqueKey;
        instructWrapper.dataset.requestId = uniqueKey;
        selection.deleteContents();
        selection.insertNode(instructWrapper);
        EventBus.publish(
            'DirectEditing:onInstruct', selection.cloneContents()
        );
    };

    /**
     * Destroy instruct
     * @method destroy
     * @return {void}
     */
    InstructCommand.prototype.destroy = function destroy() {
        initVariables(this);
    };

    return InstructCommand;
});

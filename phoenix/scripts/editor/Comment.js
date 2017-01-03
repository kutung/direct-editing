define(['scripts/editor/SvgLine'], function CommentLoader(SvgLine) {
    'use strict';

    /**
     * List item template
     * @property {HTMLString} commentTemplate
     * @private
     */
    var commentTemplate = [
        '<li tabindex="-1">',
            '<span class="close">x</span>',
            '<p contenteditable="true" autocomplete="off" autocorrect="off" autocapitalize="off"',
                ' spellcheck="false">',
            '</p>',
        '</li>'
    ];

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance Comment
     * @return {void}
     */
    function initVariables(instance) {
        var obj = instance;

        /**
         * Global Window object
         * @property {Window} win
         * @private
         */
        Object.defineProperty(obj, 'win', {
            'value': null,
            'writable': true
        });
        /**
         * Global Document object
         * @property {HTMLDocument} doc
         * @private
         */
        Object.defineProperty(obj, 'doc', {
            'value': null,
            'writable': true
        });
        /**
         * To provide comment text
         * @property {HTMLElement} editor
         * @private
         */
        Object.defineProperty(obj, 'editor', {
            'value': null,
            'writable': true
        });
        /**
         * To remove comment
         * @property {HTMLElement} closeBtn
         * @private
         */
        Object.defineProperty(obj, 'closeBtn', {
            'value': null,
            'writable': true
        });
        /**
         * List item
         * @property {HTMLElement} commentItem
         * @private
         */
        Object.defineProperty(obj, 'commentItem', {
            'value': null,
            'writable': true
        });
        /**
         * SVGLine Instance
         * @property {Object} svg
         * @private
         */
        Object.defineProperty(obj, 'svg', {
            'value': null,
            'writable': true
        });
        /**
         * Instruction Element
         * @property {HTMLElement} instructEl
         * @private
         */
        Object.defineProperty(obj, 'instructEl', {
            'value': null,
            'writable': true
        });
        /**
         * Callback function reference for close button click event
         * @property {FuntionReference} removeCommentFn
         * @private
         */
        Object.defineProperty(obj, 'removeCommentFn', {
            'value': null,
            'writable': true
        });
        /**
         * Callback function reference for editor blur event
         * @property {FuntionReference} onBlurFn
         * @private
         */
        Object.defineProperty(obj, 'onBlurFn', {
            'value': null,
            'writable': true
        });
        /**
         * CommentsMapper instance
         * @property {Object} mapper
         * @private
         */
        Object.defineProperty(obj, 'mapper', {
            'value': null,
            'writable': true
        });
        /**
         * Unordered List to attach comments
         * @property {HTMLElement} list
         * @private
         */
        Object.defineProperty(obj, 'list', {
            'value': null,
            'writable': true
        });
    }

    /**
    * Create comment
    *
    * @class Comment
    * @constructor
    * @param {Window} win window global object
    * @param {HTMLDocument} doc document global object
    * @param {Object} commentsMapper CommentsMapper instance
    *
    * @example
    *   var commentsMapper = new CommentsMapper(window, document);
    *
    *   new Comment(
    *       window, window.document, commentsMapper
    *   );
    */
    function Comment(win, doc, mapper) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.removeCommentFn = this.removeComment.bind(this);
        this.onBlurFn = this.onBlur.bind(this);
        this.mapper = mapper;
    }

    function removeInstruction(instance) {
        var childNodes = instance.instructEl.childNodes,
            parent = instance.instructEl.parentNode,
            len = childNodes.length,
            i = 0;

        for (; i < len; i += 1) {
            parent.insertBefore(childNodes[0], instance.instructEl);
        }

        parent.removeChild(instance.instructEl);
    }

    /*
     * Remove a comment
     * @method removeComment
     * @return {void}
     */
    Comment.prototype.removeComment = function removeComment() {
        this.list.removeChild(this.commentItem);
        removeInstruction(this);
        this.svg.destroy();
        this.mapper.remove(this.commentItem.dataset.commentId);
        this.destroy();
    };

    /*
     * Editor change event callback
     * @method onBlur
     * @return {void}
     */
    Comment.prototype.onBlur = function onEditorBlur(e) {
        var target = e.target, contents = target.innerHTML;

        /* istanbul ignore else */
        if (contents === '') {
            this.removeComment();
        }
    };

    /*
     * Create a comment
     * @method create
     * @return {void}
     */
    Comment.prototype.create = function create(uniqueKey, instructEl) {
        var commentHtmlStr = commentTemplate.join(''),
            frag;

        frag = this.doc.createElement('div');
        frag.innerHTML = commentHtmlStr;
        this.commentItem = frag.firstElementChild;
        this.commentItem.dataset.commentId = uniqueKey;
        this.editor = this.commentItem.querySelector('p[contenteditable="true"]');
        this.closeBtn = this.commentItem.querySelector('.close');
        this.instructEl = instructEl;
    };

    /*
     * Render a comment
     * @method renderTo
     * @return {void}
     */
    Comment.prototype.renderTo = function renderTo(elem) {
        this.list = elem;
        this.list.appendChild(this.commentItem);
        this.mapper.reOrderComments();
        this.editor.focus();
    };

    /*
     * Create a svg lime
     * @method createSvgLine
     * @return {void}
     */
    Comment.prototype.createSvgLine = function createSvgLine() {
        this.svg = new SvgLine(this.win, this.doc);
        this.svg.breakLineAtX = Math.floor((Math.random() * 30) + 1);
        this.svg.connect(
            this.commentItem.getClientRects()[0], this.instructEl.getClientRects()[0],
            this.win.scrollX, this.win.scrollY
        );
        this.svg.renderTo(this.doc.body);
    };

    /*
     * Set up comment events
     * @method setUp
     * @return {void}
     */
    Comment.prototype.setUp = function setUp() {
        this.closeBtn.addEventListener('click', this.removeCommentFn, false);
        this.editor.addEventListener('blur', this.onBlurFn, false);
    };

    /*
     * Destroy a comment
     * @method destroy
     * @return {void}
     */
    Comment.prototype.destroy = function destroy() {
        this.closeBtn.removeEventListener('click', this.removeCommentFn, false);
        this.editor.removeEventListener('blur', this.onBlurFn, false);
        initVariables(this);
    };

    return Comment;
});


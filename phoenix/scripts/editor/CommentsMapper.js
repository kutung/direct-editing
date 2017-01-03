define([

], function CommentsMapperLoader(

) {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance CommentsMapper Instance
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
         * CommentsMapper instance
         * @property {Object} mapper
         * @private
         */
        Object.defineProperty(obj, 'mapper', {
            'value': {},
            'writable': true
        });
        /**
         * Callback function reference window resize event
         * @property {FuntionReference} reOrderCommentsFn
         * @private
         */
        Object.defineProperty(obj, 'reOrderCommentsFn', {
            'value': null,
            'writable': true
        });
    }

    /**
    * Create comments mapper
    *
    * @class CommentsMapper
    * @constructor
    * @param {Window} win window global object
    * @param {HTMLDocument} doc document global object
    *
    * @example
    *   var commentsMapper = new CommentsMapper(window, document);
    *
    *   new CommentsMapper(
    *       window, window.document
    *   );
    */
    function CommentsMapper(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.reOrderCommentsFn = this.reOrderComments.bind(this);
    }

    /**
     * Get a comment from mapper
     * @method get
     * @return {Comment}
     */
    CommentsMapper.prototype.get = function get(key) {
        return this.mapper[key];
    }

    /**
     * Set key along with comment into mapper
     * @method set
     * @return {void}
     */
    CommentsMapper.prototype.set = function set(key, commentInstance) {
        this.mapper[key] = commentInstance;
    }

    /**
     * Remove a key along with comment from mapper
     * @method remove
     * @return {void}
     */
    CommentsMapper.prototype.remove = function remove(key) {
        delete this.mapper[key];
    }

    /**
     * Remove all keys along with comments from mapper
     * @method removeAllComments
     * @return {void}
     */
    CommentsMapper.prototype.removeAllComments = function removeAllComments() {
        var key, commentInstance;

        for (key in this.mapper) {
            /* istanbul ignore else */
            if (this.mapper.hasOwnProperty(key) === true) {
                commentInstance = this.mapper[key];
                commentInstance.removeComment.call(commentInstance);
                this.reOrderComments();
            }
        }
    }

    /**
     * Reorder comments while create, delete or window resize
     * @method reOrderComments
     * @return {void}
     */
    CommentsMapper.prototype.reOrderComments = function reOrderComments() {
        var key, mapper = this.mapper, instance;

        for (key in mapper) {
            /* istanbul ignore else */
            if (mapper.hasOwnProperty(key) === true) {
                instance = mapper[key];

                instance.svg.destroy();
                instance.createSvgLine();
            }
        }
    }

    /**
     * Set up mapper events
     * @method setUp
     * @return {void}
     */
    CommentsMapper.prototype.setUp = function setUp() {
        this.win.addEventListener('resize', this.reOrderCommentsFn, false);
    }

    /**
     * Destroy a mapper
     * @method destroy
     * @return {void}
     */
    CommentsMapper.prototype.destroy = function destroy() {
        this.win.removeEventListener('resize', this.reOrderCommentsFn, false);
        initVariables(this);
    };

    return CommentsMapper;
});

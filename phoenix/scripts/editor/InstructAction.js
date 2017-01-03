define([
    'scripts/editor/Selection', 'scripts/editor/KeysList', 'scripts/editor/CommandsConfig',
    'scripts/editor/Util', 'scripts/editor/BoldCommand', 'scripts/editor/ItalicCommand',
    'scripts/editor/SuperScriptCommand', 'scripts/editor/SubScriptCommand',
    'scripts/editor/PasteCommand', 'scripts/editor/GenericFormatCommand'
], function ActionLoader(
    Selection, KeysList, CommandsConfig, Util, BoldCommand, ItalicCommand, SuperScriptCommand, SubScriptCommand, PasteCommand, GenericFormatCommand
) {
    'use strict';

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
         * @property {HTMLElement} element
         * @private
         */
        Object.defineProperty(instance, 'element', {
            'value': null,
            'writable': true
        });
        /**
         * keycode-name pair object
         * @property {Object} keys
         * @private
         */
        Object.defineProperty(instance, 'keys', {
            'value': null,
            'writable': true
        });
        /**
         * keyboard shortcut and command name pair object
         * @property {Object} commands
         * @private
         */
        Object.defineProperty(instance, 'commands', {
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
    }

    function getKeys(keys) {
        var keysList = KeysList.get();

        if (keysList !== null && keysList.hasOwnProperty(keys)) {
            return keysList[keys];
        }
        return null;
    }

    function getCommands() {
        var commandsConfig = CommandsConfig.get();

        if (commandsConfig !== null &&
            commandsConfig.hasOwnProperty('instructCommands')
        ) {
            return commandsConfig.commands;
        }
        return null;
    }

    function getSelector(instance) {
        var node = instance.querySelector('li[data-comment-id]');

        return node.nodeName.toLowerCase();
    }

    /**
    * Sets up event handlers for various actions of editor
    *
    * @class Action
    * @constructor
    * @param {HTMLElement} element editor element to attach events to
    * @param {Window} win window global object
    * @param {HTMLDocument} doc document global object
    * @param {Object} undoManager UndoManager instance
    *
    * @example
    *     require(['scripts/UndoManager', 'scripts/Action'], function onLoad(UndoManager, Action) {
    *         var undoManager = new UndoManager(
    *                 window, document.querySelector('#editor'),
    *                 document.querySelector('#hidden_iframe')
    *             ),
    *             action = new Action(
    *                 document.querySelector('#editor'), window, document, undoManager
    *             );
    *
    *         action.setup();
    *     });
    */
    function Action(element, win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.element = element;
        this.keys = getKeys('instructKeys');
        this.commands = getCommands();
        this.util = new Util(win, doc);
    }

    /**
     * Returns a new instance of BoldCommand
     *
     * @method getBoldCommand
     * @return {Object} Instance of BoldCommand
     */
    Action.prototype.getBoldCommand = function getBoldCommand() {
        return new BoldCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of ItalicCommand
     *
     * @method getItalicCommand
     * @return {Object} Instance of ItalicCommand
     */
    Action.prototype.getItalicCommand = function getItalicCommand() {
        return new ItalicCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of SuperScriptCommand
     *
     * @method getSuperScriptCommand
     * @return {Object} Instance of SuperScriptCommand
     */
    Action.prototype.getSuperScriptCommand = function getSuperScriptCommand() {
        return new SuperScriptCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of SubScriptCommand
     *
     * @method getSubScriptCommand
     * @return {Object} Instance of SubScriptCommand
     */
    Action.prototype.getSubScriptCommand = function getSubScriptCommand() {
        return new SubScriptCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Sets up all event handlers for keydown and button click events
     *
     * @method setUp
     * @return {void}
     */
    Action.prototype.setUp = function setUp() {
        this.element.addEventListener('keydown', this.onKeyDown.bind(this), false);
        this.element.addEventListener('cut', this.onCut.bind(this), false);
        this.element.addEventListener('paste', this.onPaste.bind(this), false);
    };

    /**
     * Event handler for onCut event. We just stop this event and do nothing.
     *
     * @method onCut
     * @param {ClipboardEvent} e event object of onCut
     * @return {void}
     */
    Action.prototype.onCut = function onCut(e) {
        e.preventDefault();
        e.stopPropagation();
    };

    /**
     * Event handler for onPaste event. We get the text data from clipboard and pass it on to insertCommand. It inserts the text at the cursor position.
     *
     * @method onPaste
     * @param {ClipboardEvent} e clipboard event object of onPaste
     * @return {void}
     */
    Action.prototype.onPaste = function onPaste(e) {
        var html = e.clipboardData.getData('text/html'),
            text = e.clipboardData.getData('text/text'),
            pasteCommand = new PasteCommand(html, text, this.win, this.doc);

        e.preventDefault();
        e.stopPropagation();
        pasteCommand.execute();
    };

    /**
     * Event handler for onPaste event. We get the text data from clipboard and pass it on to insertCommand. It inserts the text at the cursor position.
     *
     * @private
     * @throws {command.not.found} If command is not one of bold, italic, insert, delete
     * @param {string} command - command type
     * @param {string} key - key identifier
     * @param {Object} instance - instance of Action class
     * @return {void}
     */
    function executeCommand(command, key, instance) {
        switch (command) {
        case 'bold':
            command = instance.getBoldCommand();
            command.execute();
            break;
        case 'italic':
            command = instance.getItalicCommand();
            command.execute();
            break;
        case 'sub':
            command = instance.getSubScriptCommand();
            command.execute();
            break;
        case 'sup':
            command = instance.getSuperScriptCommand();
            command.execute();
            break;
        default:
            throw new Error('command.not.found');
        }
    }

    /**
     * Event handler for onKeyDown event. Depending on the key code, ctrl and shift key status, appropriate command class is instanciated and executed.
     *
     * @method onKeyDown
     * @param {Object} e event object of onKeyDown
     * @return {void}
     */
    Action.prototype.onKeyDown = function onKeyDown(e) {
        var commands = this.commands, keys = this.keys,
            cmdKey = null, keyCode = String(e.keyCode);

        this.selection = Selection.get(this.win);
        /*
        Chrome and Webkit based browsers trigger this key, when a compound
        character is being typed. Like european and Asian characters. These
        are typed with 2 or more keyboard characters
        */
        if (e.keyCode === 229) {
            return;
        }

        if (keys[keyCode] === 'ctrl' || keys[keyCode] === 'shift') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if ((e.metaKey === true || e.ctrlKey === true) && e.shiftKey === true && keyCode in keys) {
            cmdKey = '[ctrl][shift][' + keys[keyCode] + ']';
            if (commands[cmdKey] === 'redo') {
                this.undoManager.redo();
            }
            else if (commands[cmdKey] === 'paste' || commands[cmdKey] === 'copy') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if ((e.metaKey === true || e.ctrlKey === true) && keyCode in keys) {
            cmdKey = '[ctrl][' + keys[keyCode] + ']';

            if (cmdKey in commands) {
                // if (commands[cmdKey] === 'undo') {
                //     this.undoManager.undo();
                // }
                // else
                if (commands[cmdKey] === 'paste' || commands[cmdKey] === 'copy') {
                    return;
                }
                else {
                    executeCommand(commands[cmdKey], keys[keyCode], this);
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    };

    return Action;
});

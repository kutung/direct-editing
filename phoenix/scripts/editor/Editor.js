define([
    'scripts/editor/Selection', 'scripts/editor/KeysList', 'scripts/editor/CommandsConfig',
    'scripts/editor/Util', 'scripts/editor/BoldCommand', 'scripts/editor/InsertCommand',
    'scripts/editor/DeleteCommand', 'scripts/editor/ItalicCommand',
    'scripts/editor/SuperScriptCommand', 'scripts/editor/SubScriptCommand',
    'scripts/editor/PasteCommand', 'scripts/editor/GenericFormatCommand',
    'scripts/editor/EnterCommand', 'scripts/editor/InstructCommand',
    'scripts/editor/EditorConfigReader', 'scripts/FeatureToggle',
    'scripts/EventBus', 'scripts/Helper'
], function EditorLoader(
    Selection, KeysList, CommandsConfig, Util, BoldCommand, InsertCommand, DeleteCommand,
    ItalicCommand, SuperScriptCommand, SubScriptCommand, PasteCommand, GenericFormatCommand,
    EnterCommand, InstructCommand, EditorConfigReader, FeatureToggle, EventBus,
    Helper
) {
    'use strict';

    /**
     * initializes instance variables
     * @private
     * @param  {Object} instance Editor Instance
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
         * keycode-name pair object
         * @property {Object} nonPrintablekeys
         * @private
         */
        Object.defineProperty(instance, 'nonPrintablekeys', {
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
        /**
         * CommentsMapper instance
         * @property {Object} commentsMapper
         * @private
         */
        Object.defineProperty(instance, 'commentsMapper', {
            'value': null,
            'writable': true
        });
        /**
         * CommentPanel Element for add comments
         * @property {HTMLDocument} commentPanel
         * @private
         */
        Object.defineProperty(instance, 'commentPanel', {
            'value': null,
            'writable': true
        });
        /**
         * DoubleClick Event Callback Function
         * @property {FunctionReference} setTimerFn
         * @private
         */
        Object.defineProperty(instance, 'setTimerFn', {
            'value': null,
            'writable': true
        });
        /**
         * Click Event Callback Function
         * @property {FunctionReference} onClickEditorFn
         * @private
         */
        Object.defineProperty(instance, 'onClickEditorFn', {
            'value': null,
            'writable': true
        });
        /**
         * SetTimeOut Callback Function
         * @property {FunctionReference} timer
         * @private
         */
        Object.defineProperty(instance, 'timer', {
            'value': null,
            'writable': true
        });
        /**
         * TrripleClick timeout value
         * @property {Numeric} timeout
         * @private
         */
        Object.defineProperty(instance, 'timeout', {
            'value': 200,
            'writable': false
        });
        /**
         * KeyDown Event Callback Function
         * @property {FunctionReference} onKeyDownFn
         * @private
         */
        Object.defineProperty(instance, 'onKeyDownFn', {
            'value': null,
            'writable': true
        });
        /**
         * Cut Event Callback Function
         * @property {FunctionReference} onCutFn
         * @private
         */
        Object.defineProperty(instance, 'onCutFn', {
            'value': null,
            'writable': true
        });
        /**
         * Paste Event Callback Function
         * @property {FunctionReference} onPasteFn
         * @private
         */
        Object.defineProperty(instance, 'onPasteFn', {
            'value': null,
            'writable': true
        });
        /**
         * Drag Event Callback Function
         * @property {FunctionReference} onDragFn
         * @private
         */
        Object.defineProperty(instance, 'onDragFn', {
            'value': null,
            'writable': true
        });
        /**
         * Drop Event Callback Function
         * @property {FunctionReference} onDropFn
         * @private
         */
        Object.defineProperty(instance, 'onDropFn', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(instance, 'editorConfig', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(instance, 'features', {
            'value': {},
            'writable': true
        });
    }

    function getKeys(keys) {
        var keysList = KeysList.get();

        /* istanbul ignore else */
        if (keysList !== null && keysList.hasOwnProperty(keys)) {
            return keysList[keys];
        }
        return null;
    }

    function getCommands() {
        var commandsConfig = CommandsConfig.get();

        /* istanbul ignore else */
        if (commandsConfig !== null &&
            commandsConfig.hasOwnProperty('commands')
        ) {
            return commandsConfig.commands;
        }
        return null;
    }

    function onDrag(e) {
        var targetNode = e.target;

        if (targetNode.nodeType === this.win.Node.TEXT_NODE) {
            targetNode = targetNode.parentNode;
        }

        if (targetNode.closest('section') !== null) {
            e.preventDefault();
        }
    }

    function onDrop(e) {
        e.preventDefault();
    }

    function setTimer(e) {
        var self = this;

        self.timer = setTimeout(function timeout() {
            clearTimeout(self.timer);
            self.timer = null;
        }, self.timeout);
    }

    function getElement(context, selectors) {
        var node = context.commonAncestorContainer;

        while (node.matches(selectors) === false) {
            node = node.parentNode;
        }

        return node;
    }

    function onClickEditor(e) {
        var selection, range, context;

        if (this.timer) {
            selection = this.win.getSelection();
            context = selection.getRangeAt(0);
            range = this.doc.createRange();
            range.selectNodeContents(
                getElement(context, this.editorConfig.getCommonSelectors())
            );
            selection.removeAllRanges();
            selection.addRange(range);
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
    * Sets up event handlers for various actions of editor
    *
    * @class Editor
    * @constructor
    * @param {HTMLElement} element editor element to attach events to
    * @param {Window} win window global object
    * @param {HTMLDocument} doc document global object
    * @param {Object} undoManager UndoManager instance
    *
    * @example
    *     require(['scripts/editor/UndoManager', 'scripts/editor/Editor'], function onLoad(UndoManager, Editor) {
    *         var undoManager = new UndoManager(
    *                 window, document.querySelector('#editor'),
    *                 document.querySelector('#hidden_iframe')
    *             ),
    *             editor = new Editor(
    *                 document.querySelector('#editor'), window, document, undoManager
    *             );
    *
    *         editor.setup();
    *     });
    */
    function setFeatureToggleVariables(instance) {
        instance.features.bold = FeatureToggle.isFeatureEnabled('Editor.Format.Bold');
        instance.features.italic = FeatureToggle.isFeatureEnabled('Editor.Format.Italic');
        instance.features.subscript = FeatureToggle.isFeatureEnabled('Editor.Format.Subscript');
        instance.features.superscript = FeatureToggle.isFeatureEnabled('Editor.Format.Superscript');
        instance.features.delete = FeatureToggle.isFeatureEnabled('Editor.Format.Delete');
        instance.features.insert = FeatureToggle.isFeatureEnabled('Editor.Insert');
        instance.features.instruct = FeatureToggle.isFeatureEnabled('Editor.Instruct.Enable');
        instance.features.newPara = FeatureToggle.isFeatureEnabled('Editor.NewPara');
        instance.features.paste = FeatureToggle.isFeatureEnabled('Editor.Paste');
    }

    function Editor(
        element, win, doc, undoManager, commentsMapper, commentPanel
    ) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
        this.element = element;
        setFeatureToggleVariables(this);
        this.undoManager = undoManager;
        this.commentsMapper = commentsMapper;
        this.commentPanel = commentPanel;
        this.keys = getKeys('keys');
        this.commands = getCommands();
        this.nonPrintablekeys = getKeys('nonPrintablekeys');
        this.util = new Util(win, doc);
        this.setTimerFn = setTimer.bind(this);
        this.onClickEditorFn = onClickEditor.bind(this);
        this.onKeyDownFn = this.onKeyDown.bind(this);
        this.onCutFn = this.onCut.bind(this);
        this.onPasteFn = this.onPaste.bind(this);
        this.onDragFn = onDrag.bind(this);
        this.onDropFn = onDrop.bind(this);
        this.editorConfig = EditorConfigReader.get();
    }

    /**
     * Returns a new instance of BoldCommand
     *
     * @method getBoldCommand
     * @return {Object} Instance of BoldCommand
     */
    Editor.prototype.getBoldCommand = function getBoldCommand() {
        return new BoldCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of ItalicCommand
     *
     * @method getItalicCommand
     * @return {Object} Instance of ItalicCommand
     */
    Editor.prototype.getItalicCommand = function getItalicCommand() {
        return new ItalicCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of InsertCommand
     *
     * @method getInsertCommand
     * @return {Object} Instance of InsertCommand
     */
    Editor.prototype.getInsertCommand = function getInsertCommand() {
        return new InsertCommand(this.win, this.doc, this.commentsMapper);
    };

    /**
     * Returns a new instance of DeleteCommand
     *
     * @method getDeleteCommand
     * @return {Object} Instance of DeleteCommand
     */
    Editor.prototype.getDeleteCommand = function getDeleteCommand() {
        return new DeleteCommand(this.win, this.doc, this.commentsMapper);
    };

    /**
     * Returns a new instance of SuperScriptCommand
     *
     * @method getSuperScriptCommand
     * @return {Object} Instance of SuperScriptCommand
     */
    Editor.prototype.getSuperScriptCommand = function getSuperScriptCommand() {
        return new SuperScriptCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of SubScriptCommand
     *
     * @method getSubScriptCommand
     * @return {Object} Instance of SubScriptCommand
     */
    Editor.prototype.getSubScriptCommand = function getSubScriptCommand() {
        return new SubScriptCommand(new GenericFormatCommand(this.win, this.doc));
    };

    /**
     * Returns a new instance of EnterComman
     *
     * @method getEnterCommand
     * @return {Object} Instance of getEnterCommand
     */
    Editor.prototype.getEnterCommand = function getEnterCommand() {
        return new EnterCommand(this.win, this.doc);
    };

    /**
     * Returns a new instance of InstructCommand
     *
     * @method getInstructCommand
     * @return {Object} Instance of InstructCommand
     */
    Editor.prototype.getInstructCommand = function getInstructCommand() {
        return new InstructCommand(
            this.win, this.doc, this.commentsMapper, this.commentPanel
        );
    };

    /**
     * Returns a new instance of PasteCommand
     *
     * @method getPasteCommand
     * @return {Object} Instance of PasteCommand
     */
    Editor.prototype.getPasteCommand = function getPasteCommand(html, text) {
        return new PasteCommand(
            html, text, this.win, this.doc, this.commentsMapper
        );
    };

    /**
     * Sets up all event handlers for keydown, click, etc events
     *
     * @method setUp
     * @return {void}
     */
    Editor.prototype.setUp = function setUp() {
        this.element.addEventListener('keydown', this.onKeyDownFn, false);
        this.element.addEventListener('cut', this.onCutFn, false);
        this.element.addEventListener('paste', this.onPasteFn, false);
        this.element.addEventListener('dragstart', this.onDragFn, false);
        this.element.addEventListener('drop', this.onDropFn, false);
        this.element.addEventListener('dblclick', this.setTimerFn, false);
        this.element.addEventListener('click', this.onClickEditorFn, false);
    };

    /**
     * Event handler for onCut event. We just stop this event and do nothing.
     *
     * @method onCut
     * @param {ClipboardEvent} e event object of onCut
     * @return {void}
     */
    Editor.prototype.onCut = function onCut(e) {
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
    Editor.prototype.onPaste = function onPaste(e) {
        var html, text, pasteCommand;

        e.preventDefault();
        e.stopPropagation();

        if (this.features.paste === false) {
            return;
        }

        html = e.clipboardData.getData('text/html');
        text = e.clipboardData.getData('text/text');
        pasteCommand = this.getPasteCommand(html, text);

        pasteCommand.execute();
    };

    /**
     * Event handler for onPaste event. We get the text data from clipboard and pass it on to insertCommand. It inserts the text at the cursor position.
     *
     * @private
     * @throws {command.not.found} If command is not one of bold, italic, insert, delete
     * @param {string} command - command type
     * @param {string} key - key identifier
     * @param {Object} instance - instance of action class
     * @return {void}
     */
    Editor.prototype.executeCommand = function executeCommand(command, key, instance, e) {
        if (command === 'bold' &&
           this.features.bold === true
        ) {
            command = instance.getBoldCommand();
            command.execute();
        }
        else if (command === 'italic' &&
            this.features.italic === true
        ) {
            command = instance.getItalicCommand();
            command.execute();
        }
        else if (command === 'sub' &&
            this.features.subscript === true
        ) {
            command = instance.getSubScriptCommand();
            command.execute();
        }
        else if (command === 'sup' &&
            this.features.superscript === true
        ) {
            command = instance.getSuperScriptCommand();
            command.execute();
        }
        else if (command === 'insert' &&
            this.features.insert === true
        ) {
            command = instance.getInsertCommand();
            command.execute(e);
        }
        else if (command === 'delete' &&
            this.features.delete === true
        ) {
            command = instance.getDeleteCommand();
            command.execute(key);
        }
        else if (command === 'enter' &&
            this.features.newPara === true
        ) {
            command = instance.getEnterCommand();
            command.execute(key);
        }
        else if (command === 'instruct' &&
            this.features.instruct === true
        ) {
            command = instance.getInstructCommand();
            command.execute();
        }
        else {
            e.preventDefault();
            e.stopPropagation();
            throw new Error('command.not.found');
        }
    };

    /**
     * Event handler for onKeyDown event. Depending on the key code, ctrl and shift key status, appropriate command class is instantiated and executed.
     *
     * @method onKeyDown
     * @param {Object} e event object of onKeyDown
     * @return {void}
     */
    Editor.prototype.onKeyDown = function onKeyDown(e) {
        var commands = this.commands, keys = this.keys,
            nonPrintablekeys = this.nonPrintablekeys,
            cmdKey = null, keyCode = String(e.keyCode),
            selection;

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
        cmdKey = '[' + keys[keyCode] + ']';
        if (cmdKey in commands) {
            e.preventDefault();
            e.stopPropagation();
            this.executeCommand(commands[cmdKey], keys[keyCode], this, e);
            return;
        }

        if ((e.metaKey === true || e.ctrlKey === true) && e.shiftKey === true && keyCode in keys) {
            cmdKey = '[ctrl][shift][' + keys[keyCode] + ']';
            if (cmdKey in commands) {
                if (commands[cmdKey] === 'redo') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.undoManager.redo();
                }
                else if (commands[cmdKey] === 'paste' || commands[cmdKey] === 'copy') {
                    return;
                }
                else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeCommand(commands[cmdKey], keys[keyCode], this, e);
                }
            }
            return;
        }

        if ((e.metaKey === true || e.ctrlKey === true) && e.altKey === true && keyCode in keys) {
            cmdKey = '[ctrl][alt][' + keys[keyCode] + ']';
            if (cmdKey in commands) {
                e.preventDefault();
                e.stopPropagation();
                this.executeCommand(commands[cmdKey], keys[keyCode], this, e);
            }
            return;
        }

        if ((e.metaKey === true || e.ctrlKey === true) && keyCode in keys) {
            cmdKey = '[ctrl][' + keys[keyCode] + ']';

            if (cmdKey in commands) {
                if (commands[cmdKey] === 'undo') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.undoManager.undo();
                }
                else if (commands[cmdKey] === 'paste' || commands[cmdKey] === 'copy') {
                    return;
                }
                else {
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeCommand(commands[cmdKey], keys[keyCode], this, e);
                }
            }
            return;
        }

        if ((e.metaKey === false && e.ctrlKey === false) &&
            typeof nonPrintablekeys[keyCode] === 'undefined'
        ) {
            selection = Selection.get(this.win);

            if (this.util.isValidSelection(selection) === false) {
                e.preventDefault();
                e.stopPropagation();
                throw new Error('multiple.section.formatting.not.allowed');
            }
            cmdKey = '[default]';
            this.executeCommand(commands[cmdKey], keys[keyCode], this, e);
        }
    };

    return Editor;
});

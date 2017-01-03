define([
    'scripts/Helper', 'scripts/Util', 'scripts/CustomerConfigReader',
    'scripts/editor/AbstractConfig', 'scripts/editor/Editor',
    'scripts/editor/UndoManager', 'scripts/editor/EditorConfigReader',
    'scripts/editor/EditorContextualTemp', 'scripts/DataChangeAttributeHandler'],
    function DirectEditorLoader(
        Helper, Util, CustomerConfig, EditorAbstractConfig,
        Editor, UndoManager, EditorConfigReader, EditorContextual,
        DataChangeAttributeHandler
    ) {
        var editableAttributes = {
                'typeof': 'schema:ScholarlyArticle',
                'contenteditable': 'true',
                'autocomplete': 'off',
                'autocorrect': 'off',
                'autocapitalize': 'off',
                'spellcheck': 'false'
            },
            nonEditableAttributes = {
                'contenteditable': 'false'
            },
            figCaption = Util.getSelector('figureCaption'),
            config = CustomerConfig.get('directEditing');

        function EditorConfig() {}

        function setupConfig(instance) {
            EditorConfig.prototype = new EditorAbstractConfig();
            EditorConfig.prototype.getCommonSelectors = function getCommonSelectorsFn() {
                return config.commonSelectors;
            };

            EditorConfig.prototype.getSectionSelector = function getSectionSelectorFn() {
                return config.baseSelector;
            };

            EditorConfig.prototype.getUniqueAttributeSelector = function getUniqueAttributeSelectorFn() {
                return config.uniqueSelector;
            };

            EditorConfig.prototype.getWrapperAttributes = function getWrapperAttributesFn() {
                return instance.wrapperAttributes;
            };
        }

        function setAttributes(element, attributes) {
            var key;

            for (key in attributes) {
                if (Helper.objectHasKey(attributes, key) === true) {
                    element.setAttribute(key, attributes[key]);
                }
            }
        }

        function setNonEditableForChildNodes(parentNode) {
            var divElement,
                divElements = parentNode.querySelectorAll(config.baseSelector),
                len = divElements.length,
                i = 0;

            for (; i < len; i += 1) {
                divElement = divElements[i];
                if (divElement.matches(figCaption) === true) {
                    setAttributes(divElement, editableAttributes);
                    continue;
                }
                setAttributes(divElement, nonEditableAttributes);
            }
        }

        function setNonEditableAttributes(container) {
            var nonEditableElement,
                classes = Util.selectorToArray(config.NonEditableSelectors, ['a']),
                elements = container.querySelectorAll(classes),
                len = elements.length,
                i = 0;

            for (; i < len; i += 1) {
                nonEditableElement = elements[i];
                setAttributes(nonEditableElement, nonEditableAttributes);
                setNonEditableForChildNodes(nonEditableElement);
            }
        }

        function setDataChange(selector) {
            var node, key, container,
                nonEditableClasses = Util.selectorToArray(config.NonEditableSelectors);

            for (key in this.items) {
                if (Helper.objectHasKey(this.items, key) === true) {
                    container = this.items[key].container;
                    node = container.querySelector(selector);
                    if (Helper.isNull(node) === true ||
                        node.tagName.toLowerCase() !== config.baseSelector
                    ) {
                        continue;
                    }
                    if (node.matches(nonEditableClasses) === true ||
                        (node.hasAttributes('contenteditable') === true &&
                        node.getAttribute('contenteditable') === 'false')
                    ) {
                        throw new Error('data.change.on.non.editable.content');
                    }
                    DataChangeAttributeHandler.applyAttribute(node);
                    break;
                }
            }
            this.eb.publish('Editor:SaveComplete');
            this.eb.publish('EditSummary:Load');
        }

        function DirectEditor(win, doc, eventBus) {
            this.win = win;
            this.doc = doc;
            this.eb = eventBus;
            this.isEnabled = false;
            this.wrapperAttributes = {};
            this.items = {};
            this.eb.subscribe('DirectEditing:Action:Complete', setDataChange, this);
        }

        DirectEditor.prototype.setWrapperAttributes = function setWrapperAttributesFn(attributes) {
            if (this.isEnabled === true) {
                throw new Error('direct.editor.already.enabled');
            }

            if (Helper.isObject(attributes) === false) {
                throw new Error('direct.editor.attributes.non.object');
            }

            this.wrapperAttributes = attributes;
        };

        DirectEditor.prototype.setup = function setupFn() {
            var undoManager, editor, key, container, editorContextual;

            if (this.isEnabled === true) {
                throw new Error('direct.editor.already.enabled');
            }
            setupConfig(this);
            EditorConfigReader.set(EditorConfig);
            for (key in this.items) {
                if (Helper.objectHasKey(this.items, key) === true) {
                    container = this.items[key].container;
                    setAttributes(container, editableAttributes);
                    setNonEditableAttributes(container);

                    undoManager = new UndoManager(
                        this.win, this.doc, container
                    );
                    editor = new Editor(
                        container, this.win, this.doc, undoManager
                    );
                    undoManager.setUp();
                    editor.setUp();
                    editorContextual = new EditorContextual(this.win, this.doc, container);
                    editorContextual.execute();
                }
            }
            this.isEnabled = true;
        };

        DirectEditor.prototype.addContainer = function addContainerFn(name, container) {
            if (Helper.isEmptyString(name) === true) {
                throw new Error('direct.editor.item.name.not.string');
            }
            if (container instanceof this.win.HTMLElement === false) {
                throw new Error('direct.editor.item.container.not.element');
            }

            this.items[name] = {
                'container': container
            };
        };

        return DirectEditor;
    });

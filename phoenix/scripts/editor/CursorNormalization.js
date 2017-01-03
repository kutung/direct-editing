define(
    ['scripts/editor/FormattingConfig', 'scripts/editor/Selection', 'scripts/editor/EditorHelper'],
    function cursorLoader(FormattingConfig, Selection, EditorHelper) {
        function initVariables(instance) {
            Object.defineProperty(instance, 'win', {
                'value': null,
                'writable': true
            });
            Object.defineProperty(instance, 'doc', {
                'value': null,
                'writable': true
            });
            Object.defineProperty(instance, 'formatConfig', {
                'value': null,
                'writable': true
            });
            Object.defineProperty(instance, 'stopElementSelector', {
                'value': null,
                'writable': true
            });
        }

        function CursorNormalization(win, doc) {
            initVariables(this);
            this.win = win;
            this.doc = doc;
            this.formatConfig = FormattingConfig.get(win);
            this.stopElementSelector = 'p';
            this.helper = EditorHelper.get(this.win);
        }

        function moveCursorBackward(instance, selection) {
            var prevSibling,
                currParent = selection.commonAncestorContainer;

            prevSibling = currParent.previousSibling;

            while (prevSibling === null) {
                if (currParent.matches(instance.stopElementSelector) === true) {
                    return selection;
                }

                currParent = currParent.parentNode;
                prevSibling = currParent.previousSibling;
            }

            selection.setStart(prevSibling, prevSibling.length);
            selection.setEnd(prevSibling, prevSibling.length);

            return selection;
        }

        function moveCursorForward(selection) {
            selection.setStart(selection.endContainer, selection.endContainer.length);
            selection.setEnd(selection.endContainer, selection.endContainer.length);

            return selection;
        }

        CursorNormalization.prototype.moveCursorInToNode = function moveCursorInToNode(node) {
            var range = this.doc.createRange(), selection = Selection.get(this.win);

            range.setStart(node.firstChild, node.firstChild.length);
            range.setEnd(node.firstChild, node.firstChild.length);
            selection.removeAllRanges();
            selection.addRange(range);

            // if (node.nodeType === this.win.Node.TEXT_NODE) {
            //     node = node.parentNode;
            // }

            // range = this.doc.createRange();
            // node.appendChild(this.doc.createTextNode(zeroWidthChar));
// console.log(node);
            // range.setStart(node.firstChild, 0);

            // selection.removeAllRanges();
            // selection.addRange(range);
        };

        CursorNormalization.prototype.setCaretposition = function setCaretposition() {
            var selection;

            this.sel = Selection.get(this.win);
            selection = this.sel;

            if (selection.collapsed !== true) {
                return selection;
            }

            /*istanbul ignore else*/
            if (selection.startOffset === 0) {
                selection = moveCursorBackward(this, selection);
            }
            else if (selection.endOffset === selection.endContainer.length) {
                selection = moveCursorForward(selection);
            }

            return selection;
        };

        return CursorNormalization;
    });

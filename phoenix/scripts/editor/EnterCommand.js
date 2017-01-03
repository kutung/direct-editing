define(['scripts/editor/Selection'], function enterCommandLoader(selectionContext) {
    'use strict';
    function initVariables(instance) {
        var obj = instance;

        Object.defineProperty(obj, 'win', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'doc', {
            'value': null,
            'writable': true
        });
        Object.defineProperty(obj, 'selectionContext', {
            'value': null,
            'writable': true
        });
    }

    function EnterCommand(win, doc) {
        initVariables(this);
        this.win = win;
        this.doc = doc;
    }

    EnterCommand.prototype.execute = function execute() {
        var selection = selectionContext.get(this.win), element, paraNode, range;

        if (selection.commonAncestorContainer.nodeName.toLowerCase() === 'p' &&
            selection.endOffset === selection.endContainer.textContent.length
        ) {
            paraNode = selection.commonAncestorContainer;
            element = this.doc.createElement('p');
            element.innerHTML = '&#8203';
            paraNode.parentNode.insertBefore(element, paraNode.nextSibling);
            range = this.doc.createRange();
            range.setStartAfter(element.firstChild);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else {
            throw Error('enter.key.not.allowed.between.the.paragraph');
        }
    };

    EnterCommand.prototype.destroy = function destroy() {
        initVariables(this);
    };

    return EnterCommand;
});

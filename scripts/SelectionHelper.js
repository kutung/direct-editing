define(function selectionhelperLoader() {
    var hasDirtySelection = false,
        isDirtySelection = function isDirtySelection() {
            return hasDirtySelection;
        },
        getDOMSelectionNode = function getDOMSelectionNode(win, doc) {
            var selectionNode, selectionTxtNode,
                selectNodetxt = 'DOM selection check node';

            selectionNode = doc.createElement('div');
            selectionTxtNode = doc.createTextNode(selectNodetxt);
            selectionNode.classList.add('selectionnode');
            selectionNode.style.visibility = 'hidden';
            selectionNode.appendChild(selectionTxtNode);
            doc.body.appendChild(selectionNode);

            return selectionNode;
        },
        checkDirtySelection = function checkDirtySelection(win, doc) {
            var range, selectionNode, currentRange, domFragment,
                selectionElem;

            selectionNode = getDOMSelectionNode(win, doc);
            range = doc.createRange();
            range.selectNode(selectionNode);
            selectionElem = win.getSelection();
            selectionElem.removeAllRanges();
            selectionElem.addRange(range);
            currentRange = selectionElem.getRangeAt(0);
            domFragment = currentRange.extractContents();

            if (domFragment instanceof win.DocumentFragment === false) {
                throw new Error('error.fragment_missing');
            }

            if (domFragment.contains(selectionNode) === false) {
                hasDirtySelection = true;
            }

            setTimeout(function removeSelectionNode() {
                if (doc.contains(selectionNode) === true) {
                    selectionNode.parentNode.removeChild(selectionNode);
                }
            }, 5000);
            return hasDirtySelection;
        },
        SelectionHelper = {
            'isDirtySelection': isDirtySelection,
            'checkDirtySelection': checkDirtySelection
        };

    return SelectionHelper;
});

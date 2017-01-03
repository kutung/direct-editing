define([
    'rangy', 'rangyselection'
    ], function RangeHelperLoader(
    Rangy, RangySelection
) {
    function RangeHelper() {
    }

    function getSelection() {
        return Rangy.getSelection();
    }

    function hasSelection() {
        var selection = Rangy.getNativeSelection();

        if (selection.rangeCount === 0) {
            return false;
        }

        if (selection.isCollapsed === true) {
            return false;
        }

        return true;
    }

    function getRange() {
        var sel, range;

        // FIXME: Remove try-catch
        try {
            sel = Rangy.getSelection();
            range = sel && sel.getRangeAt(0);
        }
        catch (e) {
            return null;
        }

        if (range !== null) {
            return range;
        }

        return null;
    }

    function saveSelection() {
        return RangySelection.saveSelection();
    }

    function restoreSelection(savedDocSelectionRange) {
        RangySelection.restoreSelection(savedDocSelectionRange, true);
    }

    function removeMarkers(savedDocSelectionRange) {
        RangySelection.removeMarkers(savedDocSelectionRange);
    }

    function getFragmentCloned() {
        return getRange().cloneContents();
    }

    function getSelectionNodes() {
        return getRange().getNodes();
    }

    function getFragment() {
        return getRange().extractContents();
    }

    function getParentNode() {
        return getRange().commonAncestorContainer.parentNode;
    }

    RangeHelper.prototype.getSelectedNodeList = function getSelectedNodeList(
        isCloned
    ) {
        var nodes = getSelectionNodes();

        if (nodes.length === 1) {
            return [getParentNode()];
        }
        return nodes;
    };

    RangeHelper.prototype.insertNodeAt = function insertNodeAt(node) {
        var range,
            sel = Rangy.getSelection();

        range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(node);
        range.collapseBefore(node);
        sel.setSingleRange(range);
    };

    RangeHelper.prototype.getSelectionFragment = function getSelectionFragment(
        isCloned
    ) {
        if (isCloned === true) {
            return getFragmentCloned();
        }
        return getFragment();
    };

    // FIXME: Change the original name in all the places
    RangeHelper.prototype.getClonedFragment = function getClonedFragment() {
        return getFragmentCloned();
    };

    RangeHelper.prototype.extractFragment = function extractFragment(currentRange) {
        return currentRange.extractContents();
    };

    RangeHelper.prototype.removeAllSelections = function removeAllSelectionsFn() {
        var sel = Rangy.getSelection();

        sel.removeAllRanges();
    };

    RangeHelper.prototype.selectNode = function selectNode(node) {
        var sel,
            range = getRange();

        range.selectNode(node);
        sel = Rangy.getSelection();
        sel.setSingleRange(range);
    };

    RangeHelper.prototype.selectMultipleNodes = function selectMultipleNodes(
        startingNode, endingNode
    ) {
        var range, sel;

        range = Rangy.createRange();
        range.setStartBefore(startingNode);
        range.setEndAfter(endingNode);
        sel = Rangy.getSelection();
        return sel.setSingleRange(range);
    };

    RangeHelper.prototype.getRange = function getrange() {
        return getRange();
    };

    RangeHelper.prototype.saveSelection = function saveselection() {
        return saveSelection();
    };

    RangeHelper.prototype.restoreSelection = function restoreselection(
        savedDocSelectionRange
    ) {
        return restoreSelection(savedDocSelectionRange);
    };

    RangeHelper.prototype.removeMarkers = function removearkers(
        savedDocSelectionRange
    ) {
        return removeMarkers(savedDocSelectionRange);
    };

    RangeHelper.prototype.insertNode = function insertnode(node, currentRange) {
        currentRange.normalizeBoundaries();
        currentRange.insertNode(node);
        currentRange.collapse(true);
        return currentRange;
    };

    RangeHelper.prototype.insertAfter = function insertafter(node, afterNode) {
        var range = getRange();

        range.normalizeBoundaries();
        Rangy.dom.insertAfter(node, afterNode);
        range.collapse(true);
        return range;
    };

    RangeHelper.prototype.hasSelection = function hasselection() {
        return hasSelection();
    };

    return RangeHelper;
});

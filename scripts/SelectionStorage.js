 define(['scripts/RangeHelper', 'scripts/Helper'],
function SelectionStorageLoader(RangeHelper, Helper) {
    var SelectionStorage, storedSelections;

    function SelectionStorage(Win, EventBus, Doc) {
        this.win = Win;
        this.eventBus = EventBus;
        this.doc = Doc;
        this.rangeHelper = new RangeHelper();
    }

    SelectionStorage.prototype.restoreDocSelection = function restoreDocSelection() {
        var instance = this;

        if (Helper.isObject(storedSelections) === true) {
            instance.rangeHelper.restoreSelection(storedSelections);
            instance.clearStoredSelections();
        }
    };

    SelectionStorage.prototype.storeDocSelection = function storeDocSelection() {
        var instance = this, docSelectedRange;

        if (Helper.isObject(storedSelections) === true) {
            instance.rangeHelper.removeMarkers(storedSelections);
        }

        docSelectedRange = instance.rangeHelper.saveSelection();
        if (Helper.isObject(docSelectedRange) === true) {
            storedSelections = docSelectedRange;
        }
        else {
            throw new Error('selectionStorage.no.selection');
        }
    };

    SelectionStorage.prototype.clearStoredSelections = function clearStoredSelections() {
        var instance = this;

        if (Helper.isObject(storedSelections) === true) {
            instance.rangeHelper.removeMarkers(storedSelections);
        }

        storedSelections = null;
    };

    return SelectionStorage;
});

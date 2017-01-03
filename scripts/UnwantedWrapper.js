define([
    'scripts/Helper', 'scripts/Annotate', 'scripts/ToggleImage',
    'scripts/ImageViewer'
],
function UnwantedWrapperLoader(Helper, Annotate, ToggleImage, ImageViewer) {
    var removeWrapperClass = ['.rangySelectionBoundary', '.cursor'];

    function UnwantedWrapper(Win) {
        this.win = Win;
    }

    UnwantedWrapper.remove = function removeFn(node) {
        var len, cursorNodes, parent,
            i = 0;

        cursorNodes = node.querySelectorAll(removeWrapperClass);
        len = cursorNodes.length;
        for (; i < len; i += 1) {
            parent = cursorNodes[i].parentNode;

            parent.removeChild(cursorNodes[i]);
            parent.normalize();
        }
        node = Annotate.removeWrapper(node);
        node = ToggleImage.removeWrapper(node);
        node = ImageViewer.removeWrapper(node);

        return node;
    };

    return UnwantedWrapper;
});

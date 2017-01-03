define([],
function ElementSyncFormatLoader() {
    function ElementSyncFormatter() {}

    function createDataAttribute(prefix, attrName) {
        return 'data-' + prefix + '-' + attrName;
    }

    ElementSyncFormatter.changeElementSyncAttrs = function changeElementSyncAttrs(
            win, targetElem, elementSyncPrefix
        ) {
        var treeWalker, currentNode, name, id,
            doc = win.document,
            elementsyncName = createDataAttribute(elementSyncPrefix, 'name'),
            elementsyncId = createDataAttribute(elementSyncPrefix, 'id');

        treeWalker = doc.createTreeWalker(
            targetElem, win.NodeFilter.SHOW_ELEMENT, null, false
        );
        currentNode = targetElem;

        while (currentNode !== null) {
            if (currentNode.hasAttribute('name') === true) {
                name = currentNode.getAttribute('name');
                currentNode.setAttribute(elementsyncName, name);
                currentNode.removeAttribute('name');
            }
            if (currentNode.hasAttribute('id') === true) {
                id = currentNode.getAttribute('id');
                currentNode.setAttribute(elementsyncId, id);
                currentNode.removeAttribute('id');
            }
            if (currentNode.hasAttribute('data-changes') === true) {
                currentNode.removeAttribute('data-changes');
            }
            if (currentNode.classList.contains('scrollEffect')) {
                currentNode.classList.remove('scrollEffect');
            }

            currentNode = treeWalker.nextNode();
        }
        return targetElem;
    };

    ElementSyncFormatter.changeActualElementAttrs = function changeActualElementAttrs(
            win, targetElem, elementSyncPrefix
        ) {
        var treeWalker, currentNode, name, id,
            doc = win.document,
            elementsyncName = createDataAttribute(elementSyncPrefix, 'name'),
            elementsyncId = createDataAttribute(elementSyncPrefix, 'id');

        treeWalker = doc.createTreeWalker(
            targetElem, win.NodeFilter.SHOW_ELEMENT, null, false
        );
        currentNode = targetElem;

        while (currentNode !== null) {
            if (currentNode.hasAttribute(elementsyncName) === true) {
                name = currentNode.getAttribute(elementsyncName);
                currentNode.setAttribute('name', name);
                currentNode.removeAttribute(elementsyncName);
            }
            if (currentNode.hasAttribute(elementsyncId) === true) {
                id = currentNode.getAttribute(elementsyncId);
                currentNode.setAttribute('id', id);
                currentNode.removeAttribute(elementsyncId);
            }
            if (currentNode.classList.contains('scrollEffect')) {
                currentNode.classList.remove('scrollEffect');
            }
            currentNode = treeWalker.nextNode();
        }
        return targetElem;
    };

    return ElementSyncFormatter;
});

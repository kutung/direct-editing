define(['scripts/Helper'], function elementSyncLoader(Helper) {
    function initializeVariables(instance) {
        instance.htmlDoc = null;
        instance.win = null;
        instance.actualElem = null;
        instance.syncElem = null;
        instance.options = {};
        instance.elementSyncPrefix = 'elementsync';
        instance.observer = null;
        instance.changeElementSyncAttrs = function changeElementSyncAttrs() {};
        instance.changeActualElementAttrs = function changeActualElementAttrs() {};
    }

    function ElementSync(win, doc) {
        initializeVariables(this);
        this.win = win;
        this.htmlDoc = doc;
    }

    function updateSyncedNode(elem, clonedNode) {
        elem.insertAdjacentHTML('afterend', clonedNode.outerHTML);
        elem.parentNode.removeChild(elem);
    }

    function createDataAttribute(prefix, attrName) {
        return 'data-' + prefix + '-' + attrName;
    }

    function createSyncElSelector(syncElAttr, value) {
        return '[' + syncElAttr + '="' + value + '"]';
    }

    function getAtrributeSelectors(instance, attributes) {
        var selector,
            prefix = instance.elementSyncPrefix,
            elementSyncId = createDataAttribute(prefix, 'id'),
            elementSyncName = createDataAttribute(prefix, 'name');

        if (attributes.hasOwnProperty('id') === true) {
            selector = createSyncElSelector(elementSyncId, attributes.id.value);
        }
        else if (attributes.hasOwnProperty('name') === true) {
            selector = createSyncElSelector(
                elementSyncName,
                attributes.name.value
            );
        }
        else if (attributes.hasOwnProperty(elementSyncId) === true) {
            selector = '#' + attributes[elementSyncId].value;
        }
        else if (attributes.hasOwnProperty(elementSyncName) === true) {
            selector = '[name="' + attributes[elementSyncName].value + '"]';
        }
        return selector;
    }

    function mutationObserverCallback(instance, mutations) {
        var elem, selector, replaceNode,
            mutationRecord = mutations[0],
            targetElem = mutationRecord.target,
            clonedNode = targetElem.cloneNode(true),
            attributes = clonedNode.attributes;

        if (targetElem.tagName.toLowerCase() !== 'div') {
            return;
        }

        instance.stopObserver();
        selector = getAtrributeSelectors(instance, attributes);
        if (instance.actualElem.contains(targetElem) === true) {
            elem = instance.syncElem.querySelector(selector);
            replaceNode = instance.changeElementSyncAttrs(
                instance.win, clonedNode, instance.elementSyncPrefix
            );
        }

        if (instance.syncElem.contains(targetElem) === true) {
            instance.changeElementSyncAttrs(
                instance.win, targetElem, instance.elementSyncPrefix
            );
            elem = instance.actualElem.querySelector(selector);
            replaceNode = instance.changeActualElementAttrs(
                instance.win, clonedNode, instance.elementSyncPrefix
            );
        }

        if (Helper.isUndefined(replaceNode) === true) {
            replaceNode = clonedNode;
        }
        updateSyncedNode(elem, replaceNode);
        instance.startObserver();
    }

    function generateMuatationObserver(instance) {
        return new MutationObserver(function mutationObserver(mutations) {
            mutationObserverCallback(instance, mutations);
        });
    }

    ElementSync.prototype.setOptions = function setOptions(options) {
        this.options = options;
    };

    ElementSync.prototype.setSyncElementAttrPrefix = function setSyncElementAttrPrefix(prefix) {
        this.elementSyncPrefix = prefix;
    };

    ElementSync.prototype.setChangeElementSyncAttrCallbacks = function setChangeElementSyncAttrCallbacks(
        changeElementSyncAttrs, changeActualElementAttrs
    ) {
        this.changeElementSyncAttrs = changeElementSyncAttrs;
        this.changeActualElementAttrs = changeActualElementAttrs;
    };

    ElementSync.prototype.startObserver = function startObserver() {
        this.observer.observe(this.actualElem, this.options);
        this.observer.observe(this.syncElem, this.options);
    };

    ElementSync.prototype.stopObserver = function stopObserver() {
        this.observer.disconnect();
    };

    ElementSync.prototype.synchronize = function synchronize(actual, syncElem) {
        if (Helper.isNull(actual) === true || Helper.isNull(syncElem) === true) {
            throw new Error('nodes.should.not.null');
        }

        this.actualElem = actual;
        this.syncElem = syncElem;
        this.observer = generateMuatationObserver(this);
        this.startObserver();
    };

    return ElementSync;
});

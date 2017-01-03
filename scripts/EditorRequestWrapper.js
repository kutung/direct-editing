define(['scripts/Normalizer'], function editorRequestWrapperLoader(Normalizer) {
    var requestId = 0;

    function editorRequestWrapper(Win) {
        this.win = Win;
        this.normalizer = new Normalizer();
    }

    editorRequestWrapper.prototype.clearOldWrapper = function clearOldWrapper(
        container
    ) {
        var requestTags, requestTag, node, requestTagsLength, nextSibling,
            refParent,
            win = this.win,
            i = 0;

        if (container instanceof win.HTMLElement === false) {
            throw new Error('error.container_missing');
        }
        requestTags = container.querySelectorAll('[data-request-id]');
        requestTagsLength = requestTags.length;
        for (; i < requestTagsLength; i += 1) {
            requestTag = requestTags[i];
            refParent = requestTag.parentNode;
            if (requestTag instanceof win.HTMLElement === false) {
                continue;
            }
            nextSibling = requestTag.nextSibling;
            while (node = requestTag.lastChild) {
                nextSibling = refParent.insertBefore(node, nextSibling);
            }
            refParent.removeChild(requestTag);
            this.normalizer.normalize(refParent);
        }
    };

    editorRequestWrapper.prototype.getSelectionWrapper = function getSelectionWrapper(
        fragment
    ) {
        var requestTag,
            doc = document;

        requestTag = doc.createElement('span');
        requestId += 1;
        requestTag.dataset.requestId = requestId;
        requestTag.appendChild(fragment);
        return requestTag;
    };

    editorRequestWrapper.prototype.getCursorWrapper = function getCursorWrapper() {
        var requestTag,
            doc = document;

        requestTag = doc.createElement('span');
        requestId += 1;
        requestTag.dataset.requestId = requestId;
        requestTag.classList.add('cursor');
        return requestTag;
    };

    editorRequestWrapper.prototype.getInsertWrapper = function getInsertWrapper(
        container
    ) {
        var requestTags, requestTag, requestTagsLength, win = this.win;

        if (container instanceof win.HTMLElement === false) {
            throw new Error('error.container_missing');
        }
        requestTags = container.querySelectorAll('[data-request-id]');
        requestTagsLength = requestTags.length;
        if (requestTagsLength > 0) {
            requestTag = requestTags[requestTagsLength - 1];
        }

        return requestTag;
    };

    return editorRequestWrapper;
});

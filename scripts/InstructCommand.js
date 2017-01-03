define(['scripts/Helper'], function(Helper) {
    var commentWrapperClass = 'optcomment',
        commentTextClass = 'comntText';

    function initializeVariables(instance) {
        instance.doc = null;
        instance.eventBus = null;
        instance.win = null;
        instance.uId = null;
    }

    function InstructCommand(Document, EventBus, Win) {
        initializeVariables(this);
        this.doc = Document;
        this.eventBus = EventBus;
        this.win = Win;
    }

    function wrapInstructNode(instance, requestNode, instructText) {
        var commentWrapperNode, commentTextNode,
            doc = instance.doc,
            childNode = requestNode.childNodes,
            childNodeLength = childNode.length;

        if (
            childNodeLength === 1 &&
            childNode[0].nodeType === Node.ELEMENT_NODE &&
            childNode[0].tagName.toLowerCase() === 'span'

        ) {
            commentWrapperNode = childNode[0];
        }
        else {
            commentWrapperNode = doc.createElement('span');
            commentWrapperNode.innerHTML = requestNode.innerHTML;
        }
        commentWrapperNode.classList.add(commentWrapperClass);
        commentWrapperNode.dataset.name = instance.uId;
        commentWrapperNode.dataset.empty = 'true';
        commentTextNode = doc.createElement('span');
        commentTextNode.classList.add(commentTextClass);
        commentTextNode.dataset.name = instance.uId.replace('opt', 'cm');
        commentTextNode.innerHTML = instructText;
        commentWrapperNode.appendChild(commentTextNode);
        return commentWrapperNode;
    }

    function removeInstructNode(requestNode) {
        var comntTxtNode, commentNode, commentNodeClass, classLen;

        comntTxtNode = requestNode.querySelector('.' + commentTextClass);
        comntTxtNode.parentNode.removeChild(comntTxtNode);
        commentNode = requestNode.querySelector('.' + commentWrapperClass);
        commentNodeClass = commentNode.classList;
        classLen = commentNodeClass.length;
        if (classLen === 1) {
            requestNode.innerHTML = commentNode.innerHTML;
        }
        else {
            commentNodeClass.remove(commentWrapperClass);
        }
    }

    function checkNameExistsAndSetUniqueId(instance, requestNode) {
        var childNode = requestNode.firstChild;

        if (requestNode.hasChildNodes() === true && childNode.nodeType === 1 &&
            Helper.isUndefined(childNode.dataset.name) === false
        ) {
            instance.uId = childNode.dataset.name;
            return;
        }
        instance.uId = Helper.getUniqueId('opt');
    }

    InstructCommand.prototype.execute = function execute(
        instructText, domFragment, context, isRemove
        ) {
        var wrappedNode, requestNode, existingCommentNode,
            data = {};

        if (
            domFragment instanceof this.win.DocumentFragment === false ||
            domFragment.hasChildNodes() === false
        ) {
            throw new Error('error.fragment_missing');
        }
        requestNode = domFragment.querySelector('[data-request-id]');
        checkNameExistsAndSetUniqueId(this, requestNode);
        if (Helper.isNull(requestNode) === true) {
            throw new Error('error.request_id_missing');
        }
        if (context.indexOf('onInstruct') >= 0 && isRemove === true) {
            removeInstructNode(requestNode);
        }
        else if (isRemove === false) {
            if (context.indexOf('onInstruct') !== -1) {
                existingCommentNode = domFragment.querySelector(
                    'span.comntText'
                );
                existingCommentNode.innerHTML = instructText;
            }
            else {
                wrappedNode = wrapInstructNode(
                    this, requestNode.cloneNode(true), instructText
                );
                requestNode.innerHTML = '';
                requestNode.appendChild(wrappedNode);
            }
        }
        domFragment.normalize();

        data.dom = domFragment;
        data.uniqueId = this.uId;
        return data;
    };

    return InstructCommand;
});

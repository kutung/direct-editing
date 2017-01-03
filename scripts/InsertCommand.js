define(['scripts/Helper'], function insertcommandLoader(Helper) {
    var formattedClasses = [
        '.optbold', '.optitalic', '.optsup', '.optsub', '.optcomment',
        '.optsmallcaps', '.optmono'
    ];

    function initializeVariables(instance) {
        instance.eBus = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.uId = null;
        instance.nodeName = 'span';
        instance.nodeClass = 'optinsert';
        instance.nodeDeleteClass = 'optdel';
        instance.nodeReplaceClass = 'optreplace';
    }

    function removeStyling(instance, element) {
        var i = 0,
            elementChildNode, commentNode,
            elementChildNodes = element.querySelectorAll(
                formattedClasses.join(', ')
            ),
            elementCount = elementChildNodes.length;

        for (; i < elementCount; i += 1) {
            elementChildNode = elementChildNodes[i];

            if (elementChildNode.classList.contains('optcomment') === true) {
                commentNode = elementChildNode.querySelector('.comntText');
                commentNode.parentNode.removeChild(commentNode);
            }
            elementChildNode.insertAdjacentHTML(
                'afterend', elementChildNode.innerHTML
            );
            elementChildNode.parentNode.removeChild(elementChildNode);
        }
    }

    function createDeleteWrapper(instance) {
        var deleteWrapper = instance.htmlDoc.createElement(instance.nodeName);

        deleteWrapper.dataset.name = instance.uId;
        deleteWrapper.classList.add(instance.nodeDeleteClass);

        return deleteWrapper;
    }

    function createReplaceWrapper(instance) {
        var replaceWrapper;

        replaceWrapper = instance.htmlDoc.createElement(instance.nodeName);
        replaceWrapper.classList.add(instance.nodeReplaceClass);
        replaceWrapper.dataset.name = Helper.getUniqueId('opt');
        return replaceWrapper;
    }

    function applyInsertWrapper(instance, insertionHtml) {
        var insertWrapper;

        insertWrapper = instance.htmlDoc.createElement(instance.nodeName);
        insertWrapper.dataset.name = instance.uId;
        insertWrapper.classList.add(instance.nodeClass);
        insertWrapper.innerHTML = insertionHtml;

        return insertWrapper;
    }

    function editInsertion(instance, element, insertionHtml) {
        var commentNode,
            insertNode = element.querySelector('span.' + instance.nodeClass);

        if (insertNode.classList.contains('optcomment') === true) {
            commentNode = insertNode.querySelector('.comntText');
            if (commentNode instanceof instance.win.HTMLElement === true) {
                commentNode = commentNode.cloneNode(true);
            }
        }
        insertNode.innerHTML = insertionHtml;
        if (insertNode.classList.contains('optcomment') === true &&
            commentNode instanceof instance.win.HTMLElement === true
        ) {
            insertNode.appendChild(commentNode);
        }
    }

    function removeInsertion(instance, element, context) {
        var deleteNode = element.querySelector(
            'span.' + instance.nodeDeleteClass
        );

        if (context.indexOf('onReplace') !== -1) {
            element.innerHTML = deleteNode.innerHTML;
        }
        else {
            element.innerHTML = '';
        }
    }

    function insertCommand(win, doc, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('insertcommand.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('insertcommand.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.subscribe) === false) {
            throw new Error('insertcommand.eventbus.missing');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('insertcommand.eventbus.missing');
        }

        initializeVariables(this);
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
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

    insertCommand.prototype.execute = function execute(
        domFragment, context, insertionHtml, isRemove
        ) {
        var insertWrapper, deleteWrapper, replaceWrapper, element;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('insertion.command.domFragment.missing');
        }
        element = domFragment.querySelector('span[data-request-id]');
        if (
            context.indexOf('onInsert') >= 0 && isRemove === true
        ) {
            removeInsertion(this, element, context);
            this.eBus.publish('InsertPanel:OnSetEnabled', false);
        }
        else if (isRemove === false) {
            checkNameExistsAndSetUniqueId(this, element);
            insertWrapper = applyInsertWrapper(this, insertionHtml);
            if (context.indexOf('onInsert') >= 0 &&
                element.hasChildNodes() === true
            ) {
                editInsertion(this, element, insertionHtml);
            }
            else if (element.hasChildNodes() === true) {
                removeStyling(this, element);
                deleteWrapper = createDeleteWrapper(this);
                replaceWrapper = createReplaceWrapper(this);
                deleteWrapper.innerHTML = element.innerHTML;
                replaceWrapper.appendChild(deleteWrapper);
                replaceWrapper.appendChild(insertWrapper);
                element.innerHTML = '';
                element.appendChild(replaceWrapper);
            }
            else {
                element.innerHTML = '';
                element.appendChild(insertWrapper);
            }
        }

        domFragment.appendChild(element);
        domFragment.normalize();
        this.eBus.publish('Insert:Complete', domFragment, 'Insert');
    };

    return insertCommand;
});

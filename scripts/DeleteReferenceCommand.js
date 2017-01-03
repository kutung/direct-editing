define(['scripts/Helper'],
function DeleteReferenceCommandLoader(Helper) {
    var deleteWrapperTag = 'span',
        deleteWrapperClass = 'optdelreference',
        optInsertWrapperClass = 'optinsert',
        classesToRemove = [
            '.optbold',
            '.optitalic',
            '.optsup',
            '.optsub',
            '.optinsert',
            '.optdel',
            '.optreject',
            '.optsmallcaps',
            '.optmono'
        ],
        classesToRetain = [
            '.pc_cpereplace',
            '.optcomment'
        ];

    function DeleteReferenceCommand(eventBus, win, doc) {
        this.win = win;
        this.doc = doc;
        this.eventBus = eventBus;
        this.uId = null;
    }

    function checkNameExistsAndSetUniqueId(instance, requestNode) {
        var childNode = requestNode.firstChild;

        if (requestNode.hasChildNodes() === true &&
            childNode.nodeType === Node.ELEMENT_NODE &&
            childNode.dataset.hasOwnProperty('name') === true
        ) {
            instance.uId = childNode.dataset.name;
            return;
        }
        instance.uId = Helper.getUniqueId('opt');
    }

    function removeDeleteFromElementNode(element, requestParent) {
        if (element.classList.contains(deleteWrapperClass) === true) {
            while (element.firstChild !== null) {
                requestParent.appendChild(element.firstChild);
            }
            return requestParent;
        }
        element.classList.remove(deleteWrapperClass);
        requestParent.appendChild(element.cloneNode(true));
    }

    function applyDeleteAroundElementNode(element, requestParent, instance) {
        var newElement, elementClone = element.cloneNode(true);

        newElement = instance.doc.createElement(deleteWrapperTag);
        newElement.classList.add(deleteWrapperClass);
        newElement.dataset.name = instance.uId;
        while (elementClone.firstChild !== null) {
            newElement.appendChild(elementClone.firstChild);
        }
        requestParent.appendChild(newElement);
    }

    function modifyReferenceFragment(
        requestParentWithNode, formatedElements, instance
    ) {
        var i = 0, classToRetain,
            formatedElementsClasses, classesToRetainLen = classesToRetain.length,
            isClasstoRetainExists, frag = instance.doc.createDocumentFragment();

        formatedElementsClasses = formatedElements.classList;
        isClasstoRetainExists = false;
        for (; i < classesToRetainLen; i += 1) {
            classToRetain = classesToRetain[i].substr(1);
            if (formatedElementsClasses.contains(classToRetain) === true) {
                if (formatedElementsClasses.length > 1) {
                    formatedElements.setAttribute('class', classToRetain);
                }
                isClasstoRetainExists = true;
            }
        }
        if (isClasstoRetainExists === false) {
            if (formatedElementsClasses.contains(optInsertWrapperClass) !== true) {
                while (formatedElements.firstChild !== null) {
                    frag.appendChild(formatedElements.firstChild);
                }
            }
            requestParentWithNode.replaceChild(frag, formatedElements);
        }
    }

    function removeFormattingClass(
        formatedElements, requestParent, requestParentWithNode, instance
    ) {
        var j = 0, innerElementsLen = formatedElements.length,
            actualRequestParentWithNode = requestParentWithNode;

        innerElementsLen = formatedElements.length;
        for (; j < innerElementsLen; j += 1) {
            if (formatedElements[j].nodeType === Node.ELEMENT_NODE) {
                requestParentWithNode = formatedElements[j].parentNode;
                modifyReferenceFragment(
                    requestParentWithNode, formatedElements[j], instance
                );
            }
        }
        return actualRequestParentWithNode;
    }

    function doDeleteReferenceAction(requestedNode, instance) {
        var formatClasses, formatedElements,
            requestParent = requestedNode.cloneNode(), cleanedElement,
            requestParentWithNode = requestedNode.cloneNode(true);

        formatClasses = classesToRemove.concat(classesToRetain);
        formatClasses = formatClasses.join(', ');
        formatedElements = requestParentWithNode.querySelectorAll(formatClasses);
        if (formatedElements.length > 0) {
            cleanedElement = removeFormattingClass(
                formatedElements, requestParent, requestParentWithNode, instance
            );
        }
        else {
            cleanedElement = requestParentWithNode;
        }

        applyDeleteAroundElementNode(
            cleanedElement, requestParent, instance
        );

        requestParent.normalize();
        return requestParent;
    }

    function doUndoAction(requestedNode) {
        var i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length;

        for (; i < len; i += 1) {
            if (children[i].nodeType === Node.ELEMENT_NODE &&
                children[i].classList.contains(deleteWrapperClass) === true
            ) {
                removeDeleteFromElementNode(children[i], requestParent);
                continue;
            }
            requestParent.appendChild(children[i].cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    DeleteReferenceCommand.prototype.execute = function execute(domFragment, context) {
        var requestedNode, modifiedFragment, deleteReferenceNodeExist;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment_missing');
        }
        if (Array.isArray(context) === false) {
            throw new Error('error.context_missing');
        }
        if (
            domFragment.hasChildNodes() === false ||
            domFragment.querySelector('[data-request-id]') === null
        ) {
            throw new Error('error.request_id_missing');
        }
        domFragment.normalize();
        requestedNode = domFragment.querySelector('[data-request-id]');
        checkNameExistsAndSetUniqueId(this, requestedNode);
        if (context.indexOf('onDeleteReference') === -1) {
            deleteReferenceNodeExist = domFragment.querySelectorAll('.' + deleteWrapperClass);
            if (deleteReferenceNodeExist.length > 0) {
                this.eventBus.publish('contextMenu:hide');
                throw new Error('error.reference.delete.already.done');
            }
            modifiedFragment = doDeleteReferenceAction(requestedNode, this);
        }
        else {
            modifiedFragment = doUndoAction(requestedNode);
        }
        domFragment.replaceChild(modifiedFragment, requestedNode);
        this.eventBus.publish(
            'ReferenceDelete:onComplete', domFragment, 'ReferenceDelete'
        );
    };

    return DeleteReferenceCommand;
});

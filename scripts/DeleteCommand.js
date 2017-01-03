define(['scripts/Helper', 'scripts/Util'],
function DeleteCommandLoader(Helper, Util) {
    var deleteWrapperTag = 'span',
        deleteWrapperClass = 'optdel',
        classesToRemove = [
            'optbold',
            'optitalic',
            'optsup',
            'optsub',
            'optinsert',
            'optdel',
            'optreject',
            'comntText',
            'optsmallcaps',
            'optmono'
        ],
        classesToMerge = [
            'pc_cpereplace',
            'optcomment'
        ];

    function DeleteCommand(eventBus, win, doc) {
        this.win = win;
        this.doc = doc;
        this.eventBus = eventBus;
        this.uId = null;
        classesToMerge = Util.selectorToClassArray(
            ['copyEditorInsert'], classesToMerge
        );
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

    function removeDeleteFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === deleteWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(deleteWrapperClass);
        requestParent.appendChild(element.cloneNode(true));
    }

    function isWhiteListedClass(element) {
        var i = 0,
            elementClassLists = element.classList,
            tot = elementClassLists.length;

        for (; i < tot; i += 1) {
            if (classesToRemove.indexOf(elementClassLists[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function isMergeListedClass(element) {
        var i = 0,
            elementClassLists = element.classList,
            tot = elementClassLists.length;

        for (; i < tot; i += 1) {
            if (classesToMerge.indexOf(elementClassLists[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function applyDeleteAroundElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(deleteWrapperTag);
        newElement.classList.add(deleteWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(element.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function applyDeleteToTextNode(textNode, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(deleteWrapperTag);
        newElement.classList.add(deleteWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(textNode.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendDeleteToElementNode(element, requestParent, instance) {
        element.classList.add(deleteWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }

    function surroundDeleteToElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(deleteWrapperTag);
        newElement.classList.add(deleteWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.insertAdjacentHTML('afterBegin', element.innerHTML);
        requestParent.appendChild(newElement);
    }

    function removeFormattingClass(element, requestParent) {
        var matchedClassLst,
            classList = element.classList,
            classListLength = classList.length,
            i = classListLength;

        for (; i >= 0; i -= 1) {
            matchedClassLst = classesToRemove.indexOf(classList[i]);
            if (matchedClassLst >= 0) {
                classList.remove(classesToRemove[matchedClassLst]);
            }
        }
        return element;
    }

    function doDeleteAction(requestedNode, instance) {
        var cleanedElement,
            i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length;

        for (; i < len; i += 1) {
            if (children[i].nodeType === 3) {
                applyDeleteToTextNode(children[i], requestParent, instance);
            }
            else if (children[i].nodeType === 1) {
                if (
                    isWhiteListedClass(children[i]) === false &&
                    isMergeListedClass(children[i]) === false
                ) {
                    applyDeleteAroundElementNode(
                        children[i], requestParent, instance
                    );
                    continue;
                }
                cleanedElement = removeFormattingClass(
                    children[i], requestParent
                );
                if (isMergeListedClass(cleanedElement) === true) {
                    appendDeleteToElementNode(
                        cleanedElement, requestParent, instance
                    );
                }
                else {
                    surroundDeleteToElementNode(
                        cleanedElement, requestParent, instance
                    );
                }
            }
            else {
                requestParent.appendChild(children[i].cloneNode(true));
            }
        }
        requestParent.normalize();
        return requestParent;
    }

    function doUndoAction(requestedNode) {
        var i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length;

        for (; i < len; i += 1) {
            if (
                children[i].nodeType === 1 &&
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

    DeleteCommand.prototype.execute = function execute(domFragment, context) {
        var requestedNode, modifiedFragment;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment_missing');
        }
        if (context instanceof Array === false) {
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
        if (context.indexOf('onDelete') === -1) {
            modifiedFragment = doDeleteAction(requestedNode, this);
        }
        else {
            modifiedFragment = doUndoAction(requestedNode);
        }
        domFragment.replaceChild(modifiedFragment, requestedNode);
        this.eventBus.publish('Delete:onComplete', domFragment, 'Delete');
    };

    return DeleteCommand;
});

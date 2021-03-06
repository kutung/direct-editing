define(['scripts/Helper', 'scripts/Util'],
function MonospaceCommandLoader(Helper, Util) {
    var monospaceWrapperTag = 'span',
        monospaceWrapperClass = 'optmono',
        whitelistedClasses = [
            'optbold',
            'optitalic',
            'optsup',
            'optsub',
            'optinsert',
            'optdel',
            'optcomment',
            'optreject',
            'pc_cpereplace',
            'optsmallcaps'
        ];

    function MonospaceCommand(eventBus, win, doc) {
        this.win = win;
        this.doc = doc;
        this.eventBus = eventBus;
        this.uId = null;
        whitelistedClasses = Util.selectorToClassArray(
            ['copyEditorInsert'], whitelistedClasses
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

    function removeMonospaceFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === monospaceWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(monospaceWrapperClass);
        requestParent.appendChild(element.cloneNode(true));
        return null;
    }

    function isWhiteListedClass(element) {
        var i = 0,
            elementClassLists = element.classList,
            tot = elementClassLists.length;

        for (; i < tot; i += 1) {
            if (whitelistedClasses.indexOf(elementClassLists[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function applyMonospaceToNode(node, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(monospaceWrapperTag);
        newElement.classList.add(monospaceWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(node.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendMonospaceToElementNode(element, requestParent, instance) {
        element.classList.add(monospaceWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }

    function doMonospaceAction(requestedNode, instance) {
        var i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length,
            child;

        for (; i < len; i += 1) {
            child = children[i];
            if (child.nodeType === 3) {
                applyMonospaceToNode(child, requestParent, instance);
            }
            else if (child.nodeType === 1) {
                if (isWhiteListedClass(child) === false) {
                    applyMonospaceToNode(child, requestParent, instance);
                    continue;
                }
                appendMonospaceToElementNode(child, requestParent, instance);
            }
            else {
                requestParent.appendChild(child.cloneNode(true));
            }
        }
        requestParent.normalize();
        return requestParent;
    }

    function doUndoAction(requestedNode) {
        var i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length,
            child;

        for (; i < len; i += 1) {
            child = children[i];
            if (
                child.nodeType === 1 &&
                child.classList.contains(monospaceWrapperClass) === true
            ) {
                child.classList.remove('hint--bottom');
                removeMonospaceFromElementNode(child, requestParent);
                continue;
            }
            requestParent.appendChild(child.cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    MonospaceCommand.prototype.execute = function execute(domFragment, context) {
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
        if (context.indexOf('onMonospace') === -1) {
            modifiedFragment = doMonospaceAction(requestedNode, this);
        }
        else {
            modifiedFragment = doUndoAction(requestedNode);
        }
        domFragment.replaceChild(modifiedFragment, requestedNode);
        this.eventBus.publish('Monospace:onComplete', domFragment, 'Monospace');
    };

    return MonospaceCommand;
});

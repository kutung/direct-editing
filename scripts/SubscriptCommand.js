define(['scripts/Helper', 'scripts/Util'],
function SubscriptCommandLoader(Helper, Util) {
    var subscriptWrapperTag = 'span',
        subscriptWrapperClass = 'optsub',
        blacklistedClasses = ['optsup'],
        whitelistedClasses = [
            'optbold', 'optitalic', 'optsup', 'optsub', 'optinsert', 'optdel',
            'optcomment', 'optreject', 'pc_cpereplace', 'optsmallcaps',
            'optmono'
        ];

    function SubscriptCommand(eventBus, win, doc) {
        this.win = win;
        this.doc = doc;
        this.eventBus = eventBus;
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

    function removeSubscriptFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === subscriptWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(subscriptWrapperClass);
        requestParent.appendChild(element.cloneNode(true));
        return null;
    }

    function isWhiteListedClass(element) {
        var i = 0, elementClassLists = element.classList,
            tot = elementClassLists.length;

        for (; i < tot; i += 1) {
            if (whitelistedClasses.indexOf(elementClassLists[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function removeBlackListedClasses(element) {
        var i = 0, blacklistLength = blacklistedClasses.length;

        for (; i < blacklistLength; i += 1) {
            element.classList.remove(blacklistedClasses[i]);
        }
    }

    function applySubscriptAroundElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(subscriptWrapperTag);
        newElement.classList.add(subscriptWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(element.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function applySubscriptToTextNode(textNode, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(subscriptWrapperTag);
        newElement.classList.add(subscriptWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(textNode.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendSubscriptToElementNode(element, requestParent, instance) {
        element.classList.add(subscriptWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }
    function doSubscriptAction(element, instance) {
        var i = 0, children = element.childNodes, len = children.length,
            requestParent = element.cloneNode();

        for (; i < len; i += 1) {
            if (children[i].nodeType === 3) {
                applySubscriptToTextNode(children[i], requestParent, instance);
            }
            else if (children[i].nodeType === 1) {
                if (isWhiteListedClass(children[i]) === false) {
                    applySubscriptAroundElementNode(
                        children[i], requestParent, instance
                    );
                    continue;
                }
                removeBlackListedClasses(children[i]);
                appendSubscriptToElementNode(children[i], requestParent, instance);
            }
            else {
                requestParent.appendChild(children[i].cloneNode(true));
            }
        }
        requestParent.normalize();
        return requestParent;
    }

    function doUndoAction(element) {
        var i = 0, children = element.childNodes, len = children.length,
            requestParent = element.cloneNode();

        for (; i < len; i += 1) {
            if (children[i].nodeType === 1 &&
                children[i].classList.contains(subscriptWrapperClass) === true
            ) {
                children[i].classList.remove('hint--bottom');
                removeSubscriptFromElementNode(children[i], requestParent);
                continue;
            }
            requestParent.appendChild(children[i].cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    SubscriptCommand.prototype.execute = function execute(domFragment, context) {
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
        if (context.indexOf('onSubscript') === -1) {
            modifiedFragment = doSubscriptAction(requestedNode, this);
        }
        else {
            modifiedFragment = doUndoAction(requestedNode);
        }
        domFragment.replaceChild(modifiedFragment, requestedNode);
        this.eventBus.publish('Subscript:onComplete', domFragment, 'Subscript');
    };

    return SubscriptCommand;
});

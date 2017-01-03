define(['scripts/Helper', 'scripts/Util'],
function SuperscriptCommandLoader(Helper, Util) {
    var superscriptWrapperTag = 'span',
        superscriptWrapperClass = 'optsup',
        blacklistedClasses = ['optsub'],
        whitelistedClasses = [
            'optbold', 'optitalic', 'optsup', 'optsub', 'optinsert', 'optdel',
            'optcomment', 'optreject','pc_cpereplace', 'optsmallcaps',
            'optmono'
        ];

    function SuperscriptCommand(eventBus, win, doc) {
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

    function removeSuperscriptFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === superscriptWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(superscriptWrapperClass);
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

    function applySuperscriptAroundElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(superscriptWrapperTag);
        newElement.classList.add(superscriptWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(element.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function applySuperscriptToTextNode(textNode, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(superscriptWrapperTag);
        newElement.classList.add(superscriptWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(textNode.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendSuperscriptToElementNode(element, requestParent, instance) {
        element.classList.add(superscriptWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }

    function doSuperscriptAction(element, instance) {
        var i = 0, children = element.childNodes, len = children.length,
            requestParent = element.cloneNode();

        for(; i < len; i += 1) {
            if (children[i].nodeType === 3) {
                applySuperscriptToTextNode(
                    children[i], requestParent, instance
                );
            }
            else if (children[i].nodeType === 1) {
                if (isWhiteListedClass(children[i]) === false) {
                    applySuperscriptAroundElementNode(
                        children[i], requestParent, instance
                    );
                    continue;
                }
                removeBlackListedClasses(children[i]);
                appendSuperscriptToElementNode(children[i], requestParent, instance);
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
                children[i].classList.contains(superscriptWrapperClass) === true
            ) {
                children[i].classList.remove('hint--bottom');
                removeSuperscriptFromElementNode(children[i], requestParent);
                continue;
            }
            requestParent.appendChild(children[i].cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    SuperscriptCommand.prototype.execute = function execute(domFragment, context) {
        var element, modifiedFragment;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment_missing');
        }
        if (context instanceof Array === false) {
            throw new Error('error.context_missing');
        }
        if (domFragment.hasChildNodes() === false ||
            domFragment.querySelector('[data-request-id]') === null
        ) {
            throw new Error('error.request_id_missing');
        }
        domFragment.normalize();
        element = domFragment.querySelector('[data-request-id]');
        checkNameExistsAndSetUniqueId(this, element);
        if (context.indexOf('onSuperscript') === -1) {
            modifiedFragment = doSuperscriptAction(element, this);
        }
        else {
            modifiedFragment = doUndoAction(element);
        }
        domFragment.replaceChild(modifiedFragment, element);
        this.eventBus.publish('Superscript:onComplete', domFragment, 'Superscript');
    };

    return SuperscriptCommand;
});

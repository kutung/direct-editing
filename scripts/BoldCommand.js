define(['scripts/Helper', 'scripts/Util'],
function BoldCommandLoader(Helper, Util) {
    var boldWrapperTag = 'span',
        boldWrapperClass = 'optbold',
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
            'optsmallcaps',
            'optmono'
        ];

    function BoldCommand(eventBus, win, doc) {
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

    function removeBoldFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === boldWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(boldWrapperClass);
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

    function applyBoldAroundElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(boldWrapperTag);
        newElement.classList.add(boldWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(element.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function applyBoldToTextNode(textNode, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(boldWrapperTag);
        newElement.classList.add(boldWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(textNode.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendBoldToElementNode(element, requestParent, instance) {
        element.classList.add(boldWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }

    function doBoldAction(requestedNode, instance) {
        var i = 0,
            children = requestedNode.childNodes,
            requestParent = requestedNode.cloneNode(),
            len = children.length;

        for (; i < len; i += 1) {
            if (children[i].nodeType === 3) {
                applyBoldToTextNode(children[i], requestParent, instance);
            }
            else if (children[i].nodeType === 1) {
                if (isWhiteListedClass(children[i]) === false) {
                    applyBoldAroundElementNode(
                        children[i], requestParent, instance
                    );
                    continue;
                }
                appendBoldToElementNode(children[i], requestParent, instance);
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
                children[i].classList.contains(boldWrapperClass) === true
            ) {
                children[i].classList.remove('hint--bottom');
                removeBoldFromElementNode(children[i], requestParent);
                continue;
            }
            requestParent.appendChild(children[i].cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    BoldCommand.prototype.execute = function execute(domFragment, context) {
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
        if (context.indexOf('onBold') === -1) {
            modifiedFragment = doBoldAction(requestedNode, this);
        }
        else {
            modifiedFragment = doUndoAction(requestedNode);
        }
        domFragment.replaceChild(modifiedFragment, requestedNode);
        this.eventBus.publish('Bold:onComplete', domFragment, 'Bold');
    };

    return BoldCommand;
});

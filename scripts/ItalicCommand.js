define(['scripts/Helper', 'scripts/Util'],
function ItalicCommandLoader(Helper, Util) {
    var italicWrapperTag = 'span',
        italicWrapperClass = 'optitalic',
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

    function ItalicCommand(EventBus, Window, Document) {
        this.win = Window;
        this.doc = Document;
        this.eventBus = EventBus;
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

    function removeItalicFromElementNode(element, requestParent) {
        if (element.className.toLowerCase() === italicWrapperClass) {
            return requestParent.insertAdjacentHTML(
                'beforeEnd', element.innerHTML
            );
        }
        element.classList.remove(italicWrapperClass);
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

    function applyItalicAroundElementNode(element, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(italicWrapperTag);
        newElement.classList.add(italicWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(element.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function applyItalicToTextNode(textNode, requestParent, instance) {
        var newElement;

        newElement = instance.doc.createElement(italicWrapperTag);
        newElement.classList.add(italicWrapperClass);
        newElement.dataset.name = instance.uId;
        newElement.appendChild(textNode.cloneNode(true));
        requestParent.appendChild(newElement);
    }

    function appendItalicToElementNode(element, requestParent, instance) {
        element.classList.add(italicWrapperClass);
        element.dataset.name = instance.uId;
        requestParent.appendChild(element.cloneNode(true));
    }

    function doItalicAction(element, instance) {
        var i = 0,
            children = element.childNodes,
            len = children.length,
            requestParent = element.cloneNode();

        for (; i < len; i += 1) {
            if (children[i].nodeType === 3) {
                applyItalicToTextNode(children[i], requestParent, instance);
            }
            else if (children[i].nodeType === 1) {
                if (isWhiteListedClass(children[i]) === false) {
                    applyItalicAroundElementNode(
                        children[i], requestParent, instance
                    );
                    continue;
                }
                appendItalicToElementNode(children[i], requestParent, instance);
            }
            else {
                requestParent.appendChild(children[i].cloneNode(true));
            }
        }
        requestParent.normalize();
        return requestParent;
    }

    function doUndoAction(element) {
        var i = 0,
            children = element.childNodes,
            len = children.length,
            requestParent = element.cloneNode();

        for (; i < len; i += 1) {
            if (children[i].nodeType === 1 &&
                children[i].classList.contains(italicWrapperClass) === true
            ) {
                children[i].classList.remove('hint--bottom');
                removeItalicFromElementNode(children[i], requestParent);
                continue;
            }
            requestParent.appendChild(children[i].cloneNode(true));
        }
        requestParent.normalize();
        return requestParent;
    }

    ItalicCommand.prototype.execute = function execute(domFragment, Context) {
        var element, modifiedFragment;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('error.fragment_missing');
        }
        if (Context instanceof Array === false) {
            throw new Error('error.context_missing');
        }
        if (
            domFragment.hasChildNodes() === false ||
            domFragment.querySelector('[data-request-id]') === null
        ) {
            throw new Error('error.request_id_missing');
        }
        domFragment.normalize();
        element = domFragment.querySelector('[data-request-id]');
        checkNameExistsAndSetUniqueId(this, element);
        if (Context.indexOf('onItalic') === -1) {
            modifiedFragment = doItalicAction(element, this);
        }
        else {
            modifiedFragment = doUndoAction(element);
        }
        domFragment.replaceChild(modifiedFragment, element);
        this.eventBus.publish('Italic:onComplete', domFragment, 'Italic');
    };

    return ItalicCommand;
});

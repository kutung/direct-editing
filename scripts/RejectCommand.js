define(['scripts/Helper'], function RejectCommandLoader(Helper) {
    function initializeVariables(instance) {
        instance.eBus = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.uId = null;
        instance.nodeName = 'span';
        instance.nodeClass = 'optreject';
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

    function createRejecteWrapper(instance, element) {
        var rejectWrapper, replaceNodeClass,
            replaceNode = element.firstChild;

        replaceNodeClass = replaceNode.classList;

        if (replaceNodeClass.contains('pc_cpereplace') === true) {
            replaceNodeClass.add(instance.nodeClass);
        }
        else {
            rejectWrapper = instance.htmlDoc.createElement(instance.nodeName);
            rejectWrapper.classList.add(instance.nodeClass);
            rejectWrapper.dataset.name = instance.uId;
            rejectWrapper.innerHTML = element.innerHTML;
            element.innerHTML = '';
            element.appendChild(rejectWrapper);
        }
    }

    function removeRejection(instance, element) {
        var rejectNode = element.querySelector('span.' + instance.nodeClass),
            rejectNodeClass = rejectNode.classList;

        if (rejectNodeClass.contains('pc_cpereplace') === true) {
            rejectNodeClass.remove(instance.nodeClass);
        }
        else {
            element.innerHTML = rejectNode.innerHTML;
        }
    }

    function RejectCommand(win, doc, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('rejectcommand.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('rejectcommand.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.subscribe) === false) {
            throw new Error('rejectcommand.eventbus.missing');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('rejectcommand.eventbus.missing');
        }

        initializeVariables(this);
        this.win = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
    }

    RejectCommand.prototype.execute = function execute(domFragment, context) {
        var element;

        if (domFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('rejection.command.domFragment.missing');
        }
        element = domFragment.querySelector('span[data-request-id]');
        checkNameExistsAndSetUniqueId(this, element);
        if (context.indexOf('onReject') >= 0 && element.hasChildNodes() === true) {
            removeRejection(this, element);
        }
        else {
            createRejecteWrapper(this, element);
        }
        element.normalize();
        domFragment.appendChild(element);
        this.eBus.publish('Reject:Complete', domFragment, 'Reject');
    };

    return RejectCommand;
});

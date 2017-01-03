define(['scripts/Helper'],
function NotifierLoader(Helper) {
    var defaultConatinerOptions = {
            'position': 'bottom-right'
        },
        defaultNotificationOptions = {
            'delay': 5,
            'dismiss': false,
            'autoclose': true,
            'forceDismiss': false,
            'callback': function nullCallback() {}
        },
        classes = {
            'base': 'notifier',
            'message': 'notifier-message',
            'success': 'notifier-success',
            'error': 'notifier-error',
            'warning': 'notifier-warning',
            'info': 'notifier-info',
            'top': 'notifier-top',
            'right': 'notifier-right',
            'bottom': 'notifier-bottom',
            'left': 'notifier-left',
            'visible': 'notifier-visible',
            'hidden': 'notifier-hidden'
        },
        baseTemplate = ['<div class="notifier"></div>'],
        messageTemplate = [
            '<div class="notifier-message" role="alert" aria-live="assertive">',
            '</div>'
        ],
        closeButtonTemplate = [
            '<button class="close" aria-label="Close">',
            '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 8 8">',
            '<path fill="#8a8a8a" stroke="none" d="M4 0c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-1.5 1.78l1.5 1.5 1.5-1.5.72.72-1.5 1.5 1.5 1.5-.72.72-1.5-1.5-1.5 1.5-.72-.72 1.5-1.5-1.5-1.5.72-.72z" />',
            '</svg>',
            '</button>'
        ],
        transistionTimeOut = 1;

    function deepFreeze(obj) {
        var prop,
            propNames = Object.getOwnPropertyNames(obj);

        propNames.forEach(function eachName(name) {
            prop = obj[name];

            if (typeof prop === 'object' && prop !== null) {
                this.deepFreeze(prop);
            }
        });

        return Object.freeze(obj);
    }

    classes = deepFreeze(classes);
    defaultConatinerOptions = deepFreeze(defaultConatinerOptions);
    defaultNotificationOptions = deepFreeze(defaultNotificationOptions);

    function initializeVariables() {
        this.counter = 0;
        this.notifierContainer = null;
        this.positionTop = false;
        this.notifications = {};
    }

    function initializeNotificationVariables() {
        this.win = null;
        this.doc = null;
        this.name = null;
        this.container = null;
        this.transitionTimer = null;
        this.delayTimer = null;
        this.content = null;
        this.type = null;
        this.closeButton = null;
        this.enableClose = false;
        this.callback = null;
    }

    function addOptions(options) {
        options = options || {};
        this.options = Object.assign({}, defaultConatinerOptions, options);
        this.options = deepFreeze(this.options);
    }

    function updatePosition() {
        var positions, containerClassList;

        if (Helper.isEmptyString(this.options.position) === true) {
            throw new Error('notification.position.empty');
        }
        if (this.notifierContainer instanceof this.win.HTMLElement === false) {
            throw new Error('notification.container.not.element');
        }
        positions = this.options.position.split('-');
        containerClassList = this.notifierContainer.classList;
        if (positions.length === 2) {
            if (positions.indexOf('top') !== -1) {
                this.positionTop = true;
            }
            positions.forEach(function eachPosition(pos) {
                if (pos in classes) {
                    containerClassList.add(classes[pos]);
                }
            });
        }
    }

    function createContainer() {
        var tempElement = this.doc.createElement('div');

        tempElement.innerHTML = baseTemplate.join('');
        this.notifierContainer = tempElement.firstChild;
        this.doc.body.appendChild(this.notifierContainer);
    }

    function setDelay(notificationInstance, options) {
        var instance = this;

        notificationInstance.show();
        if (options.autoclose === false) {
            return;
        }
        notificationInstance.delayTimer = setTimeout(function addVisible() {
            delete instance.notifications[notificationInstance.name];
            notificationInstance.dismiss();
        }, options.delay * 1000);
    }

    function clearTimers() {
        clearTimeout(this.transitionTimer);
        clearTimeout(this.delayTimer);
    }

    function Notification(Win, Doc) {
        initializeNotificationVariables.call(this);
        this.win = Win;
        this.doc = Doc;
    }

    function show(content, options, messageType) {
        var notification;

        this.counter = this.counter + 1;
        options = options || {};
        options.messageType = messageType;
        options = Object.assign({}, defaultNotificationOptions, options);
        if (options.forceDismiss === true) {
            this.dismissAll(true);
        }
        else if (options.dismiss === true) {
            this.dismissAll(false);
        }
        notification = new Notification(this.win, this.doc);
        notification.setContent(content);
        notification.setName(this.counter);
        notification.setCallback(options.callback);
        notification.setMessageType(options.messageType);
        if (options.autoclose === false) {
            notification.enableCloseButton();
        }
        this.notifications[this.counter] = notification;
        notification.render();
        if (this.positionTop === true) {
            this.notifierContainer.insertBefore(
                notification.container, this.notifierContainer.firstChild
            );
        }
        else {
            this.notifierContainer.appendChild(notification.container);
        }
        setDelay.call(this, notification, options);
    }

    function Notifier(Win, Doc, EventBus, options) {
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        initializeVariables.call(this);
        addOptions.call(this, options);
        createContainer.call(this);
        updatePosition.call(this);
        this.eb.subscribe('notifier:success', this.success, this);
        this.eb.subscribe('notifier:error', this.error, this);
        this.eb.subscribe('notifier:info', this.info, this);
        this.eb.subscribe('notifier:warning', this.warning, this);
    }

    Notifier.prototype.success = function successFn(content, options) {
        show.call(this, content, options, 'success');
    };

    Notifier.prototype.error = function errorFn(content, options) {
        show.call(this, content, options, 'error');
    };

    Notifier.prototype.info = function infoFn(content, options) {
        show.call(this, content, options, 'info');
    };

    Notifier.prototype.warning = function warningFn(content, options) {
        show.call(this, content, options, 'warning');
    };

    Notifier.prototype.dismissAll = function dismissAllFn(force) {
        var notification, key;

        for (key in this.notifications) {
            if (this.notifications.hasOwnProperty(key) === true) {
                notification = this.notifications[key];
                if (force === false && notification.enableClose === true) {
                    continue;
                }
                notification.dismiss();
                notification.container.classList.remove(classes.visible);
                delete this.notifications[notification.name];
            }
        }
    };

    Notifier.prototype.destroy = function destroy() {
        this.notifierContainer.parentNode.removeChild(this.notifierContainer);
        initializeVariables.call(this);
        this.eb.unsubscribe('notifier:success', this.success, this);
        this.eb.unsubscribe('notifier:error', this.error, this);
        this.eb.unsubscribe('notifier:info', this.info, this);
        this.eb.unsubscribe('notifier:warning', this.warning, this);
    };

    Notification.prototype.setName = function setNameFn(name) {
        if (Helper.isEmptyString(name) === true) {
            throw new Error('notification.name.not.string');
        }
        this.name = name;
    };

    Notification.prototype.setContent = function setContentFn(content) {
        if (Helper.isEmptyString(content) === true) {
            throw new Error('notification.content.not.empty');
        }
        this.content = content;
    };

    Notification.prototype.enableCloseButton = function enableCloseButtonFn() {
        this.enableClose = true;
    };

    Notification.prototype.setCallback = function setCallbackFn(callback) {
        if (Helper.isFunction(callback) === false) {
            return;
        }
        this.callback = callback;
    };

    Notification.prototype.show = function showFn() {
        /*
            http://stackoverflow.com/a/24195559
            New added element needs to be reflow for css transition animation.
        */
        var reflow = this.container.offsetWidth;

        this.container.classList.add(classes.visible);
    };

    Notification.prototype.hide = function hideFn() {
        this.container.classList.remove(classes.visible);
    };

    Notification.prototype.setMessageType = function setMessageTypeFn(type) {
        if (Helper.isUndefined(classes[type]) === true) {
            throw new Error('unknown.notification.type');
        }
        this.type = type;
    };

    Notification.prototype.dismiss = function dismissFn() {
        var instance = this;

        clearTimers.call(this);
        this.hide();
        if (Helper.isFunction(this.callback) === true) {
            this.callback.call(this.callback);
        }
        this.transitionTimer = setTimeout(function removeElement() {
            instance.destroy();
        }, transistionTimeOut * 1000);
    };

    Notification.prototype.destroy = function destroyFn() {
        if (this.enableClose === true) {
            this.closeButton.removeEventListener('click', this.dismiss, false);
        }
        this.container.parentNode.removeChild(this.container);
        initializeNotificationVariables.call(this);
    };

    Notification.prototype.render = function renderFn() {
        var classList,
            messageContainer = this.doc.createElement('span'),
            tempElement = this.doc.createElement('div');

        tempElement.innerHTML = messageTemplate.join('');
        this.container = tempElement.firstChild;
        tempElement = null;

        messageContainer.innerHTML = this.content;
        this.container.appendChild(messageContainer);
        if (this.enableClose === true) {
            tempElement = this.doc.createElement('span');

            tempElement.innerHTML = closeButtonTemplate.join('');
            this.closeButton = tempElement.firstChild;
            this.container.appendChild(this.closeButton);
            this.closeButton.addEventListener(
                'click', this.dismiss.bind(this), false
            );
        }
        classList = this.container.classList;
        classList.add(classes[this.type]);
    };

    return Notifier;
});

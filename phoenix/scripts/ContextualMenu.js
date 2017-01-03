define(['scripts/Helper'], function contextualMenuLoader(Helper) {
    'use strict';
    var template = [
        '<div class="contextual-menu hide" aria-hidden="true" role="menubar">',
        '</div>'
    ];

    function initializeVariables(instance) {
        instance.eventBus = null;
        instance.menuContainer = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.menuItems = [];
        instance.menuExtraTopPosition = 20;
        instance.menuItemLength = 0;
        instance.menuHeight = 0;
        instance.menuWidth = 0;
        instance.menuHideLeftPosition = 0;
        instance.domFragment = null;
        instance.context = null;
        instance.menuRules = null;
    }

    function ContextualMenu(Win, Doc, EventBus, menuRules) {
        if (Win instanceof Win.Window === false) {
            throw new Error('contextualmenu.window.missing');
        }
        if (Doc instanceof Win.HTMLDocument === false) {
            throw new Error('contextualmenu.document.missing');
        }
        if (Helper.isFunction(EventBus.subscribe) === false) {
            throw new Error('contextualmenu.eventbus.missing');
        }
        if (Helper.isObject(menuRules) === false) {
            throw new Error('contextualmenu.rules.missing');
        }

        initializeVariables(this);
        this.win = Win;
        this.htmlDoc = Doc;
        this.eventBus = EventBus;
        this.menuRules = menuRules;
        this.eventBus.subscribe('contextMenu:hide', this.hide, this);
        this.eventBus.subscribe('contextMenu:show', this.show, this);
        this.eventBus.subscribe('contextMenu:destroy', this.destroy, this);
    }

    function applyRulesOnMenu(instance, contexts) {
        var j, rules, context, pluginRules, menuItem, menuItemClass, pluginRule,
            i = 0,
            len = 0,
            activeMenus = [];

        rules = instance.menuRules;
        for (; i < contexts.length; i += 1) {
            context = contexts[i];
            if (Helper.isObject(rules[context]) === false) {
                continue;
            }
            pluginRules = rules[context];
            len = pluginRules.length;
            for (j = 0; j < len; j += 1) {
                menuItem = instance.menuContainer.querySelector(
                    '[data-id="' + pluginRules[j].name + '"]'
                );
                if (Helper.isNull(menuItem) === true) {
                    continue;
                }
                menuItemClass = menuItem.classList;
                pluginRule = pluginRules[j];
                if (pluginRule.disable === true) {
                    menuItem.disabled = true;
                    menuItem.setAttribute('aria-disabled', 'true');
                }
                else {
                    menuItem.disabled = false;
                    menuItem.removeAttribute('aria-disabled');
                }
                if (pluginRule.show === true) {
                    menuItemClass.add('show');
                    menuItemClass.remove('hide');
                    menuItem.removeAttribute('aria-hidden');
                }
                if (pluginRule.show === false) {
                    menuItemClass.add('hide');
                    menuItemClass.remove('show');
                    menuItem.setAttribute('aria-hidden', 'true');
                }
                if (pluginRule.active === true) {
                    menuItemClass.add('active');
                    menuItem.setAttribute('aria-checked', 'true');
                    activeMenus.push(pluginRules[j].name);
                }
            }
        }

        i = 0;
        len = instance.menuItems.length;
        for (; i < len; i += 1) {
            if (activeMenus.indexOf(instance.menuItems[i].id) !== -1) {
                instance.menuItems[i].item.setActive(true);
            }
            else {
                instance.menuItems[i].item.setActive(false);
            }
        }
    }

    function removeAllClassesOnMenu(instance) {
        var menuClass, menu, dataId,
            i = 0,
            len = instance.menuItemLength;

        for (; i < len; i += 1) {
            dataId = instance.menuItems[i].id;
            menu = instance.menuContainer.querySelector(
                '[data-id="' + dataId + '"]'
            );
            menuClass = menu.classList;
            menu.disabled = false;
            menu.removeAttribute('aria-disabled');
            menu.setAttribute('aria-checked', 'false');
            menuClass.remove('active');
            menuClass.remove('ui-corner-left');
            menuClass.remove('ui-corner-right');
            if (dataId === 'reject') {
                menuClass.add('hide');
                menuClass.remove('show');
                menu.setAttribute('aria-hidden', 'true');
            }
            else {
                menuClass.remove('hide');
                menuClass.add('show');
                menu.removeAttribute('aria-hidden');
            }
        }
    }

    function finalizePosition(instance, position, editor) {
        position.top -= editor.top;
        position.left -= editor.left;

        if (Helper.isUndefined(instance.win.pageYOffset) === false) {
            position.top -= instance.win.pageYOffset;
        }

        if (Helper.isNumber(editor.scrollTop) === true) {
            position.top += editor.scrollTop;
            editor.top += editor.scrollTop;
        }
        if ((position.top - instance.menuHeight) <= editor.top) {
            position.top = (position.top + instance.menuHeight) -
                instance.menuExtraTopPosition;
        }
        else {
            position.top = (position.top - instance.menuHeight) -
                instance.menuExtraTopPosition;
        }

        if ((position.left + (instance.menuWidth / 2)) >= editor.width) {
            position.left = (editor.width - instance.menuWidth) - 1;
        }
        else if ((position.left - (instance.menuWidth / 2)) <= 0) {
            position.left = 0;
        }
        else {
            position.left -= (instance.menuWidth / 2);
        }

        return position;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('contextualmenu.not.rendered');
        }
    }

    function destroyMenuItem(instance) {
        var i = 0;

        if (instance.menuItemLength <= 0) {
            return;
        }

        for (; i < instance.menuItemLength; i += 1) {
            instance.menuItems[i].item.destroy();
        }

        instance.menuContainer.innerHTML = '';
    }

    function setMenuHeightAndWidth(instance) {
        var menuWidth = 0,
            i = 0,
            activeMenuItems, activeMenuLength;

        activeMenuItems = instance.menuContainer.querySelectorAll('.show');
        activeMenuLength = activeMenuItems.length;
        if (activeMenuLength > 0) {
            instance.menuHeight = activeMenuItems[0].offsetHeight;
        }

        for (; i < activeMenuLength; i += 1) {
            menuWidth += activeMenuItems[i].offsetWidth;
        }

        /* FIXME: additional width */
        instance.menuWidth = menuWidth + 10;
        instance.menuHideLeftPosition = (instance.menuWidth * (-1000));
    }

    function renderMenuItems(instance) {
        var dom, menuItem, i = 0;

        if (instance.menuItemLength <= 0) {
            return;
        }
        for (; i < instance.menuItemLength; i += 1) {
            menuItem = instance.menuItems[i];
            menuItem.item.setContextualMenu(instance);
            dom = menuItem.item.render();
            if (dom instanceof instance.win.HTMLElement === true) {
                dom.dataset.id = menuItem.id;
                if (menuItem.id === 'reject') {
                    dom.classList.add('hide');
                    dom.setAttribute('aria-hidden', 'true');
                }
                else {
                    dom.classList.add('show');
                    dom.removeAttribute('aria-hidden');
                }
                instance.menuContainer.appendChild(dom);
            }
        }
    }

    function setCorner(instance) {
        var activeMenuItems, activeMenuLength;

        activeMenuItems = instance.menuContainer.querySelectorAll('.show');
        activeMenuLength = activeMenuItems.length;
        if (activeMenuLength > 0) {
            activeMenuItems[0].classList.add('ui-corner-left');
            activeMenuItems[activeMenuLength - 1].classList.add('ui-corner-right');
        }
    }

    ContextualMenu.prototype.render = function render() {
        var tmpNode;

        tmpNode = this.htmlDoc.createElement('span');
        tmpNode.innerHTML = template.join('');
        this.menuContainer = tmpNode.firstChild;
        renderMenuItems(this);
        setMenuHeightAndWidth(this);
        this.menuContainer.style.left = this.menuHideLeftPosition + 'px';
        this.isRendered = true;
        return this.menuContainer;
    };

    ContextualMenu.prototype.show = function show(position, editorMetrics, DomFragment, context) {
        var finalPosition,
            menuStyle = this.menuContainer.style,
            classList = this.menuContainer.classList;

        assertRendered(this);
        if (Helper.isObject(position) === false ||
            isNaN(position.left) || isNaN(position.top)) {
            throw new Error('contextualmenu.position.missing');
        }
        if (
            Helper.isObject(editorMetrics) === false ||
            isNaN(editorMetrics.left) || isNaN(editorMetrics.top) ||
            isNaN(editorMetrics.height) || isNaN(editorMetrics.width) ||
            isNaN(editorMetrics.scrollTop)
        ) {
            throw new Error('contextualmenu.editorMetrics.missing');
        }

        if (DomFragment instanceof this.win.DocumentFragment === false) {
            throw new Error('contextualmenu.DomFragment.missing');
        }
        if (Helper.isObject(context) === false) {
            throw new Error('contextualmenu.context.missing');
        }
        this.domFragment = DomFragment;
        this.context = context;
        removeAllClassesOnMenu(this);
        applyRulesOnMenu(this, context);
        setMenuHeightAndWidth(this);
        finalPosition = finalizePosition(this, position, editorMetrics);
        menuStyle.left = finalPosition.left + 'px';
        menuStyle.top = finalPosition.top + 'px';
        setCorner(this);
        classList.remove('hide');
        classList.add('visible');
        this.menuContainer.removeAttribute('aria-hidden');
    };

    ContextualMenu.prototype.hide = function hide() {
        var menuStyle = this.menuContainer.style,
            classList = this.menuContainer.classList;

        assertRendered(this);
        classList.remove('visible');
        this.menuContainer.setAttribute('aria-hidden', 'true');
        classList.add('hide');
        menuStyle.left = this.menuHideLeftPosition + 'px';
        menuStyle.top = '0px';
    };

    ContextualMenu.prototype.add = function add(id, menuItem) {
        var menu;

        if (Helper.isEmptyString(id) === true) {
            throw new Error('contextualmenu.id.missing');
        }

        if (Helper.isFunction(menuItem.render) === false) {
            throw new Error('contextualmenu.menuitem.missing');
        }

        if (Helper.isFunction(menuItem.setContextualMenu) === false) {
            throw new Error('contextualmenu.menuitem.missing');
        }
        menu = {
            'id': id,
            'item': menuItem
        };
        this.menuItems.push(menu);
        this.menuItemLength = this.menuItems.length;
    };

    ContextualMenu.prototype.remove = function remove(id) {
        var i = this.menuItems.length - 1;

        if (Helper.isEmptyString(id) === true) {
            throw new Error('contextualmenu.id.missing');
        }
        for (; i >= 0; i -= 1) {
            if (this.menuItems[i].id === id) {
                this.menuItems.splice(i, 1);
                break;
            }
        }
        this.menuItemLength = this.menuItems.length;
        setMenuHeightAndWidth(this);
        destroyMenuItem(this);
        renderMenuItems(this);
    };

    ContextualMenu.prototype.destroy = function destroy() {
        assertRendered(this);
        destroyMenuItem(this);
        this.menuContainer.parentNode.removeChild(this.menuContainer);
        this.eventBus.publish('contextMenu:onDestroy');
        this.eventBus.unsubscribe('contextMenu:hide', this.hide);
        this.eventBus.unsubscribe('contextMenu:show', this.show);
        this.eventBus.unsubscribe('contextMenu:destroy', this.destroy);
        initializeVariables(this);
    };

    return ContextualMenu;
});

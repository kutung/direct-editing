define(['scripts/Helper'], function reorderableListPanelLoader(Helper) {
    var panelTemplate = [
            '<div class="reorderable-list-panel">',
                '<div class="panel-header no-selection">',
                    '<span class="icon">&nbsp;</span>',
                    '<span class="text"></span>',
                '</div>',
                '<div class="panel-overlay"></div>',
                '<ul></ul>',
            '</div>'
        ],
        listItemTemplate = [
            '<li draggable="true" tabindex="0"></li>'
        ],
        cssRules = {
            '.reorderable-list-panel ul': {
                'list-style': 'none',
                'margin': '1em 0 0',
                'overflow': 'hidden',
                'padding': '0 1em'
            },
            '.reorderable-list-panel ul li.dragging': {
                'background-color': 'yellow',
                'opacity': '0.5'
            },
            '.reorderable-list-panel.panel-header, .reorderable-list-panel.panel-header .text, .reorderable-list-panel.panel-header .icon': {
                'cursor': 'pointer',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none'
            },
            '.reorderable-list-panel .panel-header': {
                'margin': '0',
                'color': '#333',
                'background-color': '#cdcdcd',
                'border-bottom': '1px solid #cdcdcd',
                'display': 'none',
                'clear': 'both'
            },
            '.reorderable-list-panel.open .panel-header': {
                'background-color': '#474747'
            },
            '.reorderable-list-panel.open .panel-header .text': {
                'color': '#fff'
            },
            '.reorderable-list-panel.open .panel-header .icon': {
                'background-color': '#2d2d2d'
            },
            '.reorderable-list-panel .panel-header .icon': {
                'align-items': 'stretch',
                'flex': 'none',
                'width': '2em',
                'background-color': '#b5b5b5'
            },
            '.reorderable-list-panel .panel-header .text': {
                'flex': '1',
                'font-weight': 'bold',
                'padding': '.5em .7em',
                'color': '#333'
            },
            '.reorderable-list-panel .panel-content': {
                'display': 'none',
                'background': '#FFFFFF',
                'border': '1px solid #999',
                'overflow-y': 'auto',
                'padding': '.6em'
            },
            '.reorderable-list-panel': {
                'position': 'relative'
            },
            '.reorderable-list-panel .panel-overlay': {
                'display': 'none',
                'position': 'absolute',
                'z-index': '999',
                'background': 'url("../images/ajax-loader.gif") no-repeat center center #aaaaaa',
                'opacity': '0.6'
            }
        };

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('reorderable.list.panel.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'reorderable-list-panel-style';
        instance.styleSheet = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.panelContainer = null;
        instance.panel = null;
        instance.panelHeader = null;
        instance.panelTitle = null;
        instance.panelName = null;
        instance.panelContent = null;
        instance.panelLoader = null;
        instance.loading = false;
        instance.onPanelHeaderClick = null;
        instance.ignoreHeaderToggle = false;
        instance.onDragOverFn = null;
        instance.onDragStartFn = null;
        instance.onDropFn = null;
        instance.onKeyDownFn = null;
        instance.draggedElem = null;
    }

    function toggleCollapse() {
        var panelClassList = this.panel.classList;

        if (this.ignoreHeaderToggle === true) {
            return;
        }

        if (panelClassList.contains('open')) {
            this.hide();
            return;
        }
        this.show();
    }

    function ReorderableListPanel(cont, doc, win, eBus) {
        if (win instanceof win.Window === false) {
            throw new Error('reorderable.list.panel.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false) {
            throw new Error('reorderable.list.panel.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('reorderable.list.panel.requires.htmldocument');
        }
        if (Helper.isFunction(eBus.publish) === false) {
            throw new Error('reorderable.list.panel.requires.eventbus');
        }

        initializeVariables(this);
        this.panelContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eBus;
    }

    ReorderableListPanel.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    ReorderableListPanel.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        this.panelTitle.innerHTML = '';
        if (Helper.isEmptyString(title) === true) {
            this.panelHeader.style.display = 'none';
        }
        else {
            this.panelHeader.style.display = 'flex';
            this.panelTitle.appendChild(this.htmlDoc.createTextNode(title));
        }
    };

    ReorderableListPanel.prototype.setName = function setName(name) {
        assertRendered(this);

        if (Helper.isEmptyString(name) === true) {
            throw new Error('reorderable.list.panel.name.empty.string');
        }

        this.panelName = name;
        this.panel.dataset.name = this.panelName;
    };

    ReorderableListPanel.prototype.getListOrder = function getListOrder() {
        var data = [], nodes = this.panelContent.querySelectorAll('li'), i = 0,
            len = nodes.length;

        for (; i < len; i += 1) {
            data.push(nodes[i].dataset.id);
        }

        return data;
    };

    ReorderableListPanel.prototype.add = function add(id, content) {
        var tmpNode, listItem, li = null;

        assertRendered(this);
        content = content || null;

        if (content !== null &&
            content instanceof this.global.HTMLElement === false &&
            content instanceof this.global.DocumentFragment === false) {
            throw new Error('reorderable.list.panel.content.must.be.an.htmlelement');
        }

        tmpNode = this.htmlDoc.createElement('div');
        tmpNode.innerHTML = listItemTemplate.join('');
        listItem = tmpNode.firstChild;
        listItem.dataset.id = id;
        listItem.appendChild(content);
        this.panelContent.appendChild(listItem);
        li = this.panelContent.firstElementChild;
        if (li !== null) {
            li.focus();
        }
    };

    ReorderableListPanel.prototype.getElement = function getElement() {
        return this.panelContainer.querySelector('.reorderable-list-panel');
    };

    ReorderableListPanel.prototype.render = function render() {
        var qs, child,
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('reorderable.list.panel.rendered.already');
        }

        if (styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        tmpNode.innerHTML = panelTemplate.join('');
        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panelContainer.innerHTML = '';
        this.panelContainer.appendChild(frag);
        qs = this.panelContainer.querySelector.bind(this.panelContainer);
        this.panel = qs('.reorderable-list-panel');
        this.panelHeader = qs('.panel-header');
        this.panelTitle = qs('.panel-header .text');
        this.panelContent = qs('ul');
        this.panelLoader = qs('.panel-overlay');
        this.onPanelHeaderClick = toggleCollapse.bind(this);
        this.onPanelHeaderClick();
        this.onDragStartFn = this.onDragStart.bind(this);
        this.onDragOverFn = this.onDragOver.bind(this);
        this.onDropFn = this.onDrop.bind(this);
        this.onKeyDownFn = this.onKeyDown.bind(this);
        this.panelHeader.addEventListener('click', this.onPanelHeaderClick, false);
        this.panelContent.addEventListener('dragover', this.onDragOverFn, false);
        this.panelContent.addEventListener('drop', this.onDropFn, false);
        this.panelContent.addEventListener('dragstart', this.onDragStartFn, false);
        this.panelContent.addEventListener('keydown', this.onKeyDownFn, false);
        this.isRendered = true;
        this.eBus.publish('ReorderableListPanel:onRender', this);
    };

    ReorderableListPanel.prototype.onDragOver = function onDragOver(ev) {
        var item = ev.target;

        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';

        if (item.hasAttribute('draggable') !== true) {
            item = item.closest('[draggable="true"]');
        }
        this.panelContent.insertBefore(this.draggedElem, item);
    };

    ReorderableListPanel.prototype.onDrop = function onDrop(ev) {
        ev.preventDefault();
        this.draggedElem.classList.remove('dragging');
        this.draggedElem = null;
    };

    ReorderableListPanel.prototype.onDragStart = function onDragStart(ev) {
        var item = ev.target;

        ev.dataTransfer.dropEffect = 'move';
        if (item.hasAttribute('draggable') !== true) {
            item = item.closest('[draggable="true"]');
        }
        item.classList.add('dragging');
        this.draggedElem = item;
    };

    ReorderableListPanel.prototype.onKeyDown = function onKeyDown(ev) {
        var keyCodes = {'up': 38, 'down': 40}, item = ev.target, sibling = null;

        if (ev.altKey || ev.shiftKey) {
            return;
        }

        if (item.hasAttribute('draggable') !== true) {
            item = item.closest('[draggable="true"]');
        }

        switch (ev.keyCode) {
        case keyCodes.up:
            sibling = item.previousElementSibling;
            if (sibling === null) {
                return;
            }
            if (ev.ctrlKey === false) {
                item = sibling;
            }
            else {
                this.panelContent.insertBefore(item, sibling);
            }
            break;
        case keyCodes.down:
            if (item === this.panelContent.lastChild) {
                return;
            }
            sibling = item.nextElementSibling;
            if (ev.ctrlKey === false) {
                item = sibling;
            }
            else {
                this.panelContent.insertBefore(item, sibling.nextElementSibling);
            }
            break;
        default:
            break;
        }
        item.focus();
    };

    ReorderableListPanel.prototype.ignoreHeaderClick = function ignoreHeaderClick(ignore) {
        this.ignoreHeaderToggle = (ignore === true);
    };

    ReorderableListPanel.prototype.setLoading = function setLoading(loading) {
        var style = this.panelLoader.style,
            compStyle = this.global.getComputedStyle(this.panelContent);

        if (loading === true) {
            this.loading = true;
            style.display = 'block';
            style.top = compStyle.top;
            style.left = compStyle.left;
            style.height = compStyle.height;
            style.width = compStyle.width;
        }
        else {
            this.loading = false;
            style.display = 'none';
        }
    };

    ReorderableListPanel.prototype.hide = function hide() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'none';
        this.panelLoader.style.display = 'none';
        panelClassList.remove('open');
    };

    ReorderableListPanel.prototype.show = function show() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'block';
        if (this.loading === true) {
            this.setLoading(true);
        }
        panelClassList.add('open');
        this.eBus.publish('ReorderableListPanel:onShow', this.panelName);
    };

    ReorderableListPanel.prototype.destroy = function destroy() {
        assertRendered(this);
        this.panelHeader.removeEventListener('click', this.onPanelHeaderClick, false);
        this.panelContent.removeEventListener('dragover', this.onDragOverFn, false);
        this.panelContent.removeEventListener('drop', this.onDropFn, false);
        this.panelContent.removeEventListener('dragstart', this.onDragStartFn, false);
        this.panelContent.removeEventListener('keydown', this.onKeyDownFn, false);
        this.panelContainer.innerHTML = '';
        this.eBus.publish('ReorderableListPanel:onDestroy');
        initializeVariables(this);
    };

    return ReorderableListPanel;
});

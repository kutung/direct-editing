define(['scripts/Helper'], function listPanelLoader(Helper) {
    var panelTemplate = [
            '<div class="list-panel">',
                '<div class="panel-header no-selection">',
                    '<span class="icon">&nbsp;</span>',
                    '<span class="text"></span>',
                '</div>',
                '<div class="panel-overlay"></div>',
                '<ul></ul>',
            '</div>'
        ],
        listItemTemplate = [
            '<li tabindex="0"></li>'
        ],
        cssRules = {
            '.list-panel ul': {
                'list-style': 'none',
                'margin': '1em 0 0',
                'overflow': 'hidden',
                'padding': '0 1em'
            },
            '.list-panel.panel-header, .list-panel.panel-header .text, .list-panel.panel-header .icon': {
                'cursor': 'pointer',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none'
            },
            '.list-panel .panel-header': {
                'margin': '0',
                'color': '#333',
                'background-color': '#cdcdcd',
                'border-bottom': '1px solid #cdcdcd',
                'display': 'none',
                'clear': 'both'
            },
            '.list-panel.open .panel-header': {
                'background-color': '#474747'
            },
            '.list-panel.open .panel-header .text': {
                'color': '#fff'
            },
            '.list-panel.open .panel-header .icon': {
                'background-color': '#2d2d2d'
            },
            '.list-panel .panel-header .icon': {
                'align-items': 'stretch',
                'flex': 'none',
                'width': '2em',
                'background-color': '#b5b5b5'
            },
            '.list-panel .panel-header .text': {
                'flex': '1',
                'font-weight': 'bold',
                'padding': '.5em .7em',
                'color': '#333'
            },
            '.list-panel .panel-content': {
                'display': 'none',
                'background': '#FFFFFF',
                'overflow-y': 'auto',
                'padding': '.6em'
            },
            '.list-panel': {
                'position': 'relative'
            },
            '.list-panel .panel-overlay': {
                'display': 'none',
                'position': 'absolute',
                'z-index': '999',
                'background': 'url("../images/ajax-loader.gif") no-repeat center center #aaaaaa',
                'opacity': '0.6'
            }
        };

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('list.panel.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'list-panel-style';
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
        instance.onKeyDownFn = null;
        instance.onNodeClickFn = function dummy() {};
        instance.onNodeEnterClickFn = function dummy() {};
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

    function ListPanel(cont, doc, win, eBus) {
        if (win instanceof win.Window === false) {
            throw new Error('list.panel.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false) {
            throw new Error('list.panel.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('list.panel.requires.htmldocument');
        }
        if (Helper.isFunction(eBus.publish) === false) {
            throw new Error('list.panel.requires.eventbus');
        }

        initializeVariables(this);
        this.panelContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eBus;
    }

    ListPanel.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    ListPanel.prototype.setTitle = function setTitle(title) {
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

    ListPanel.prototype.setName = function setName(name) {
        assertRendered(this);

        if (Helper.isEmptyString(name) === true) {
            throw new Error('list.panel.name.empty.string');
        }

        this.panelName = name;
        this.panel.dataset.name = this.panelName;
    };

    ListPanel.prototype.add = function add(content, data) {
        var tmpNode, listItem, li = null, prop;

        assertRendered(this);
        content = content || null;

        tmpNode = this.htmlDoc.createElement('div');
        tmpNode.innerHTML = listItemTemplate.join('');
        listItem = tmpNode.firstChild;
        listItem.innerHTML = content;
        if(listItem.querySelector('.eqn-container')){
            listItem.className = 'eqnListItem';
            listItem.querySelector('.eqn-container').removeAttribute('title');
        }
        if (data && Helper.isObject(data) === true) {
            for (prop in data) {
                if (data.hasOwnProperty(prop) === true) {
                    listItem.dataset[prop] = data[prop];
                }
            }
        }
        this.panelContent.appendChild(listItem);
        li = this.panelContent.firstElementChild;
        if (li !== null) {
            li.focus();
        }
    };

    ListPanel.prototype.onNodeClick = function onNodeClick(callback) {
        this.onNodeClickFn = callback;
    };

    ListPanel.prototype.onNodeEnterClick = function onNodeEnterClick(callback) {
        this.onNodeEnterClickFn = callback;
    };

    ListPanel.prototype.onClick = function onClick(event) {
        var target = event.target, prop, data = {};

        if (target.matches('.list-panel li') === true ||
            target.matches('.list-panel li *') === true) {
            target = target.closest('li');
            this.activeNode = target;
            for (prop in target.dataset) {
                if (target.dataset.hasOwnProperty(prop) === true) {
                    data[prop] = target.dataset[prop];
                }
            }
            this.onNodeClickFn(data, target);
            return;
        }
        else if (target.matches('.list-panel ul') === false) {
            return;
        }
    };

    ListPanel.prototype.getElement = function getElement() {
        return this.panelContainer.querySelector('.list-panel');
    };

    ListPanel.prototype.render = function render() {
        var qs, child,
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('list.panel.rendered.already');
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
        this.panel = qs('.list-panel');
        this.panelHeader = qs('.panel-header');
        this.panelTitle = qs('.panel-header .text');
        this.panelContent = qs('ul');
        this.panelLoader = qs('.panel-overlay');
        this.onPanelHeaderClick = toggleCollapse.bind(this);
        this.onPanelHeaderClick();
        this.onKeyDownFn = this.onKeyDown.bind(this);
        this.onClickFn = this.onClick.bind(this);
        this.panelHeader.addEventListener('click', this.onPanelHeaderClick, false);
        this.panelContent.addEventListener('keydown', this.onKeyDownFn, false);
        this.panelContent.addEventListener('click', this.onClickFn, false);
        this.isRendered = true;
        this.eBus.publish('ListPanel:onRender', this);
    };

    function onEnter(instance, event) {
        var target = event.target, prop, data = {};

        if (instance.activeNode === null) {
            return;
        }
        for (prop in target.dataset) {
            if (target.dataset.hasOwnProperty(prop) === true) {
                data[prop] = target.dataset[prop];
            }
        }
        instance.onNodeEnterClickFn(data);
    }

    ListPanel.prototype.onKeyDown = function onKeyDown(ev) {
        var keyCodes = {'up': 38, 'down': 40, 'enter': 13, 'end': 35, 'home': 36}, item = ev.target, sibling = null;

        if (ev.altKey || ev.ctrlKey || ev.shiftKey) {
            return;
        }

        switch (ev.keyCode) {
        case keyCodes.up:
            sibling = item.previousElementSibling;
            if (sibling === null) {
                return;
            }
            item = sibling;
            break;
        case keyCodes.down:
            if (item === this.panelContent.lastChild) {
                return;
            }
            sibling = item.nextElementSibling;
            item = sibling;
            break;
        case keyCodes.enter:
            onEnter(this, ev);
            break;
        case keyCodes.home:
            item = this.panelContent.firstChild;
            break;
        case keyCodes.end:
            item = this.panelContent.lastChild;
            break;
        default:
            break;
        }
        item.focus();
    };

    ListPanel.prototype.ignoreHeaderClick = function ignoreHeaderClick(ignore) {
        this.ignoreHeaderToggle = (ignore === true);
    };

    ListPanel.prototype.setLoading = function setLoading(loading) {
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

    ListPanel.prototype.hide = function hide() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'none';
        this.panelLoader.style.display = 'none';
        panelClassList.remove('open');
    };

    ListPanel.prototype.show = function show() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'block';
        if (this.loading === true) {
            this.setLoading(true);
        }
        panelClassList.add('open');
        this.eBus.publish('ListPanel:onShow', this.panelName);
    };

    ListPanel.prototype.destroy = function destroy() {
        assertRendered(this);
        this.panelHeader.removeEventListener('click', this.onPanelHeaderClick, false);
        this.panelContent.removeEventListener('keydown', this.onKeyDownFn, false);
        this.panelContent.removeEventListener('click', this.onClickFn, false);
        this.panelContainer.innerHTML = '';
        this.eBus.publish('ListPanel:onDestroy');
        initializeVariables(this);
    };

    return ListPanel;
});

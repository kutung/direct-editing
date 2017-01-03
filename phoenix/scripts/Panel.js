define(['scripts/Helper'], function panelLoader(Helper) {
    var panelTemplate = [
            '<div class="panel">',
                '<div class="panel-header no-selection">',
                    '<span class="icon"> </span>',
                    '<span class="text"></span>',
                '</div>',
                '<div class="panel-overlay"></div>',
                '<div class="panel-content"></div>',
            '</div>'
        ],
        cssRules = {
            '.panel .panel-header, .panel .panel-header .text, .panel .panel-header .icon': {
                'cursor': 'pointer',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none'
            },
            '.panel .panel-header': {
                'margin': '0',
                'color': '#333',
                'background-color': '#cdcdcd',
                'border-bottom': '1px solid #cdcdcd',
                'display': 'none',
                'clear': 'both'
            },
            '.panel.open .panel-header': {
                'background-color': '#474747'
            },
            '.panel.open .panel-header .text': {
                'color': '#fff'
            },
            '.panel.open .panel-header .icon': {
                'background-color': '#2d2d2d'
            },
            '.panel .panel-header .icon': {
                'align-items': 'stretch',
                'flex': 'none',
                'width': '2em',
                'background-color': '#b5b5b5'
            },
            '.panel .panel-header .text': {
                'flex': '1',
                'font-weight': 'bold',
                'padding': '.5em .7em',
                'color': '#333'
            },
            '.panel .panel-content': {
                'display': 'none',
                'background': '#FFFFFF',
                'overflow-y': 'auto',
                'padding': '.6em'
            },
            '.panel': {
                'position': 'relative'
            },
            '.panel .panel-overlay': {
                'display': 'none',
                'position': 'absolute',
                'z-index': '999',
                'background': 'url("../images/ajax-loader.gif") no-repeat center center #aaaaaa',
                'opacity': '0.6'
            }
        };

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('panel.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'panel-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
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

    function Panel(cont, doc, win, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('panel.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false) {
            throw new Error('panel.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('panel.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('panel.requires.eventbus');
        }

        initializeVariables(this);
        this.panelContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
    }

    Panel.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    Panel.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    Panel.prototype.setTitle = function setTitle(title) {
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

    Panel.prototype.setName = function setName(name) {
        assertRendered(this);

        if (Helper.isEmptyString(name) === true) {
            throw new Error('panel.name.empty.string');
        }

        this.panelName = name;
        this.panel.dataset.name = this.panelName;
    };

    Panel.prototype.add = function add(content) {
        assertRendered(this);
        content = content || null;

        if (content !== null &&
            content instanceof this.global.HTMLElement === false &&
            content instanceof this.global.DocumentFragment === false) {
            throw new Error('panel.content.must.be.an.htmlelement');
        }

        this.panelContent.innerHTML = '';
        this.panelContent.appendChild(content);
    };

    Panel.prototype.getElement = function getElement() {
        return this.panelContainer.querySelector('.panel');
    };

    Panel.prototype.render = function render() {
        var qs, child,
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div'),
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('panel.rendered.already');
        }

        if (this.insertStylesToHead === true && styleSheet === null) {
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
        this.panel = qs('.panel');
        this.panelHeader = qs('.panel-header');
        this.panelTitle = qs('.panel-header .text');
        this.panelContent = qs('.panel-content');
        this.panelLoader = qs('.panel-overlay');
        this.onPanelHeaderClick = toggleCollapse.bind(this);
        this.onPanelHeaderClick();
        this.panelHeader.addEventListener(
            'click', this.onPanelHeaderClick, false
        );
        this.isRendered = true;
        this.eBus.publish('Panel:onRender', this);
    };

    Panel.prototype.ignoreHeaderClick = function ignoreHeaderClick(ignore) {
        this.ignoreHeaderToggle = (ignore === true);
    };

    Panel.prototype.setLoading = function setLoading(loading) {
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

    Panel.prototype.hide = function hide() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'none';
        this.panelLoader.style.display = 'none';
        panelClassList.remove('open');
    };

    Panel.prototype.show = function show() {
        var panelClassList = this.panel.classList;

        this.panelContent.style.display = 'block';
        if (this.loading === true) {
            this.setLoading(true);
        }
        panelClassList.add('open');
        this.eBus.publish('Panel:onShow', this.panelName);
    };

    Panel.prototype.destroy = function destroy() {
        assertRendered(this);
        this.panelHeader.removeEventListener(
            'click', this.onPanelHeaderClick, false
        );
        this.panelContainer.innerHTML = '';
        this.eBus.publish('Panel:onDestroy');
        initializeVariables(this);
    };

    return Panel;
});

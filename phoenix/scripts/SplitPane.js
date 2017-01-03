define(['scripts/Helper'], function splitPaneLoader(Helper) {
    var splitPaneVerticalTemplate = [
            '<div class="split-pane vertical">',
                '<div class="pane top"></div>',
                '<div class="separator"></div>',
                '<div class="pane bottom"></div>',
            '</div>'
        ],
        splitPaneHorizontalTemplate = [
            '<div class="split-pane horizontal">',
                '<div class="pane left"></div>',
                '<div class="separator"></div>',
                '<div class="pane right"></div>',
            '</div>'
        ],
        cssRules = {
            '.split-pane': {
                'display': 'flex',
                'flex-wrap': 'nowrap',
                'position': 'relative'
            },
            '.split-pane .separator-clone': {
                'opacity': '0.5',
                'position': 'absolute'
            },
            '.split-pane .separator, .split-pane .separator-clone': {
                'box-sizing': 'border-box',
                'background-color': 'gray'
            },
            '.split-pane.vertical': {
                'flex-direction': 'column'
            },
            '.split-pane.vertical .pane.top': {
                'height': '50%'
            },
            '.split-pane.vertical .pane.bottom': {
                'height': '50%'
            },
            '.split-pane.vertical .separator, .split-pane.vertical .separator-clone': {
                'height': '5px',
                'cursor': 'row-resize'
            },
            '.split-pane.horizontal': {
                'flex-direction': 'row'
            },
            '.split-pane.horizontal .pane.left': {
                'width': '50%'
            },
            '.split-pane.horizontal .pane.right': {
                'width': '50%'
            },
            '.split-pane.horizontal .separator, .split-pane.horizontal .separator-clone': {
                'width': '5px',
                'cursor': 'col-resize'
            }
        };

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('splitpane.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'splitpane-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.panelContainer = null;
        instance.panel = null;
        instance.leftPane = null;
        instance.rightPane = null;
        instance.topPane = null;
        instance.bottomPane = null;
        instance.separator = null;
        instance.separatorWidth = null;
        instance.separatorHeight = null;
        instance.type = 'vertical';
        instance.startPosition = 0;
        instance.position = 0;
        instance.leftPos = 0;
        instance.topPos = 0;
        instance.diffPos = 0;
        instance.dragStarted = false;
        instance.separatorClone = null;
    }

    function SplitPane(cont, doc, win, eventBus) {
        if (win instanceof win.Window === false) {
            throw new Error('splitpane.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false) {
            throw new Error('splitpane.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('splitpane.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('splitpane.requires.eventbus');
        }

        initializeVariables(this);
        this.panelContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
    }

    function onDragStart(e) {
        var computedStyle = this.global.getComputedStyle(this.separator);

        this.separatorClone = this.separator.cloneNode(true);
        this.separatorClone.setAttribute('class', 'separator-clone');
        this.topPos = this.separator.offsetTop;
        this.leftPos = this.separator.offsetLeft;
        this.separatorClone.style.top = this.topPos + 'px';
        this.separatorClone.style.left = this.leftPos + 'px';
        this.separatorClone.style.width = computedStyle.width;
        this.separatorClone.style.height = computedStyle.height;
        this.separatorClone.style.zIndex = -1;
        this.panel.appendChild(this.separatorClone);
        if (this.type === SplitPane.VERTICAL) {
            this.startPosition = e.screenY;
        }
        else {
            this.startPosition = e.screenX;
        }
        this.dragStarted = true;
        e.preventDefault();
    }

    function onDrag(e) {
        if (this.dragStarted === false) {
            return;
        }
        this.dragStarted = true;
        if (this.type === SplitPane.VERTICAL) {
            this.diff = this.startPosition - e.screenY;
            this.position = this.topPos - this.diff;
            this.separatorClone.style.top = this.position + 'px';
        }
        else {
            this.diff = this.startPosition - e.screenX;
            this.position = this.leftPos - this.diff;
            this.separatorClone.style.left = this.position + 'px';
        }
    }

    function onDragEnd() {
        var bottomPaneHeight, rightPaneWidth, leftPaneWidth, totalWidth, currSize,
            totalHeight, topPaneHeight, computedStyle = this.global.getComputedStyle;

        if (this.dragStarted === false) {
            return;
        }
        this.dragStarted = false;
        totalWidth = computedStyle(this.panel).getPropertyValue('width');
        totalWidth = parseFloat(totalWidth.replace('px', ''));
        totalHeight = computedStyle(this.panel).getPropertyValue('height');
        totalHeight = parseFloat(totalHeight.replace('px', ''));
        if (this.type === SplitPane.VERTICAL) {
            bottomPaneHeight = computedStyle(this.bottomPane).getPropertyValue('height');
            bottomPaneHeight = parseFloat(bottomPaneHeight.replace('px', ''));
            currSize = bottomPaneHeight + this.diff;
            bottomPaneHeight = (currSize / totalHeight) * 100;
            topPaneHeight = ((totalHeight - currSize - this.separatorHeight) / totalHeight) * 100;
            this.bottomPane.style.height = bottomPaneHeight + '%';
            this.topPane.style.height = topPaneHeight + '%';
        }
        else {
            rightPaneWidth = computedStyle(this.rightPane).getPropertyValue('width');
            rightPaneWidth = parseFloat(rightPaneWidth.replace('px', ''));
            currSize = rightPaneWidth + this.diff;
            rightPaneWidth = (currSize / totalWidth) * 100;
            leftPaneWidth = ((totalWidth - currSize - this.separatorWidth) / totalWidth) * 100;
            this.rightPane.style.width = rightPaneWidth + '%';
            this.leftPane.style.width = leftPaneWidth + '%';
        }
        if (this.panel && this.separatorClone) {
            this.panel.removeChild(this.separatorClone);
            this.separatorClone = null;
        }
        this.diff = 0;
        this.startPosition = 0;
        this.position = 0;
    }

    SplitPane.prototype.setType = function setType(type) {
        if (type !== SplitPane.VERTICAL && type !== SplitPane.HORIZONTAL) {
            throw new Error('splitpane.type.invalid');
        }
        this.type = type;
    };

    SplitPane.prototype.getElement = function getElement() {
        return this.panelContainer.querySelector('.split-panel');
    };

    SplitPane.prototype.getLeftContainer = function getLeftContainer() {
        return this.panel.querySelector('.pane.left');
    };

    SplitPane.prototype.getRightContainer = function getRightContainer() {
        return this.panel.querySelector('.pane.right');
    };

    SplitPane.prototype.getTopContainer = function getTopContainer() {
        return this.panel.querySelector('.pane.top');
    };

    SplitPane.prototype.getBottomContainer = function getBottomContainer() {
        return this.panel.querySelector('.pane.bottom');
    };

    SplitPane.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    SplitPane.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    SplitPane.prototype.render = function render() {
        var qs, child,
            frag = this.htmlDoc.createDocumentFragment(),
            tmpNode = document.createElement('div'),
            computedStyle = this.global.getComputedStyle,
            styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('splitpane.rendered.already');
        }

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        if (this.type === SplitPane.VERTICAL) {
            tmpNode.innerHTML = splitPaneVerticalTemplate.join('');
        }
        else {
            tmpNode.innerHTML = splitPaneHorizontalTemplate.join('');
        }

        child = tmpNode.firstChild;
        while (child !== null) {
            frag.appendChild(child);
            child = tmpNode.firstChild;
        }
        tmpNode = null;
        this.panelContainer.innerHTML = '';
        this.panelContainer.appendChild(frag);
        qs = this.panelContainer.querySelector.bind(this.panelContainer);
        this.panel = qs('.split-pane');
        if (this.type === SplitPane.VERTICAL) {
            this.topPane = qs('.pane.top');
            this.bottomPane = qs('.pane.bottom');
        }
        else {
            this.leftPane = qs('.pane.left');
            this.rightPane = qs('.pane.right');
        }
        this.separator = qs('.separator');
        this.separatorWidth = computedStyle(this.separator).getPropertyValue('width');
        this.separatorWidth = parseFloat(this.separatorWidth.replace('px', ''));
        this.separatorHeight = computedStyle(this.separator).getPropertyValue('height');
        this.separatorHeight = parseFloat(this.separatorHeight.replace('px', ''));
        this.separator.addEventListener('mousedown', onDragStart.bind(this), false);
        this.htmlDoc.addEventListener('mousemove', onDrag.bind(this), false);
        this.htmlDoc.addEventListener('mouseup', onDragEnd.bind(this), false);
        this.isRendered = true;
        this.eBus.publish('SplitPane:onRender', this);
    };

    SplitPane.prototype.destroy = function destroy() {
        var eBus = this.eBus;

        assertRendered(this);
        this.panelContainer.innerHTML = '';
        initializeVariables(this);
        eBus.publish('SplitPane:onDestroy');
    };

    SplitPane.HORIZONTAL = 1;
    SplitPane.VERTICAL = 2;

    return SplitPane;
});

define(['scripts/Helper'], function tabPanelLoader(Helper) {
    var tabPanelTemplate = [
            '<div class="tab-panel open">',
                '<div class="header no-selection">',
                    '<span class="icon"> </span>',
                    '<span class="text"></span>',
                    '<span class="tools"></span>',
                    '<span class="state">',
                        '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ',
                            'height="20" width="20" viewBox="0 0 64 64">',
                            '<polygon fill="#fff" points="32,15 4,50 60,50"/>',
                        '</svg>',
                    '</span>',
                '</div>',
                '<div class="panel-body">',
                    '<div class="tab-header-container no-selection">',
                        '<button class="tab-panel-left-scroller no-selection" role="button" ',
                            'aria-label="{{tabpanel.left.scroller.aria.label}}" tabindex="-1">',
                        '</button>',
                        '<div class="tab-header-wrapper">',
                            '<ul class="tab-header" role="tablist"></ul>',
                        '</div>',
                        '<button class="tab-panel-right-scroller no-selection" role="button" ',
                            'aria-label="{{tabpanel.right.scroller.aria.label}}" tabindex="-1">',
                        '</button>',
                    '</div>',
                    '<div class="tab-content-container"></div>',
                    '<div class="tab-empty-content tabEmptyContent"></div>',
                '</div>',
                '<div class="tab-overlay"></div>',
            '</div>'
        ],
        tabHandleTemplate = [
            '<li role="tab" tabindex="-1" aria-selected="false" aria-controls="" id=""><span></span></li>'
        ],
        tabContentTemplate = [
            '<div role="tabpanel" aria-labelledby="" class="tab-content" id=""></div>'
        ],
        cssRules = {
            '.tab-panel': {
				'position': 'relative',
				'overflow': 'hidden',
				'width': '100%',
				'float': 'left',
				'margin-bottom': '5px'		
            },
            '.tab-panel .tab-overlay': {
                'display': 'none',
                'background-color': '#aaa',
                'opacity': '0.5',
                'position': 'absolute'
            },
            '.tab-panel .header': {
                'margin': '0',
                'background': '#cdcdcd',
                'cursor': 'pointer',
                '-khtml-user-select': 'none',
                '-moz-user-select': 'none',
                '-ms-user-select': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none',
                'display': 'none',
                'clear': 'both',
				'color':'#474747'
            },
            '.tab-panel.open .header': {
                'background': '#252525'
            },
            '.tab-panel.open .header .text': {
                'color': '#fff'
            },
            '.tab-panel.open .header .icon': {
                'background-color': '#2d2d2d'
            },
            '.tab-panel .header .icon': {
                'display': 'block',
                'flex': 'none',
                'width': '2.5em',
                'background-color': '#b5b5b5',
                'align-items': 'stretch'
            },
            '.tab-panel .header .text': {
                'font-weight': 'bold',
                'padding-left': '.5em',
                'color': '#333',
                'line-height': '2.5em',
                'display': 'block',
                'flex': '1',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'align-items': 'stretch',
				'font-size': '12px',
				'font-weight': 'normal',
				'padding': '4px 10px'
            },
            '.tab-panel .header .tools': {
                'display': 'flex',
                'flex': 'none',
                'margin-right': '.5em',
                'align-items': 'stretch'
            },
            '.tab-panel .header .state': {
                'display': 'flex',
                'padding-right': '.6em',
                'width': '1.5em',
                'align-items': 'center',
                'justify-content': 'center'
            },
            '.tab-panel .header .state > svg': {
                'transform': 'rotate(90deg)'
            },
            '.tab-panel .header .state > svg > polygon': {
                'fill': '#333'
            },
            '.tab-panel.open .header .state > svg > polygon': {
                'fill': '#fff'
            },
            '.tab-panel.open .header .state > svg': {
                'transform': 'rotate(180deg)'
            },
            '.tab-panel .header .tools .tool': {
                'display': 'flex',
                'flex': 'none',
                'width': '2.5em',
                'align-items': 'center',
                'justify-content': 'center'
            },
            '.tab-panel .header .tools .tool:last-child': {
                'margin-right': '0'
            },
            '.tab-panel .header .tools .tool.disabled': {
                'opacity': '0.5',
                'cursor': 'default'
            },
            '.tab-panel .panel-body': {
                'position': 'relative'
            },
            '.tab-header-container': {
                'overflow': 'hidden',
                'background': '#fff',
                'display': 'flex',
                'flex-direction': 'row'
            },
            '.tab-header-container.disabled': {
                'background': '#aaa',
                'opacity': '0.5'
            },
            '.tab-header-container .tab-header-wrapper': {
                'overflow': 'hidden',
                'flex': '1',
                'height': '40px',
                /*'border-bottom': '3px solid #555'*/
            },
            '.tab-panel-left-scroller, .tab-panel-right-scroller': {
                'padding': '0',
                'position': 'relative',
                'background-color': '#a3a3a3',
                'border': '0',
				'width':'40px',
				'height':'40px',
            },
            '.tab-panel-right-scroller:before': {
                'left': '32px',
                'top': '26px',
                'content': '" "',
                'height': '0',
                'width': '0',
                'position': 'absolute',
                'pointer-events': 'none',
                'border-style': 'solid',
                'border-width': '8px 0 8px 8px',
                'border-color': 'transparent transparent transparent #000',
                'margin-top': 'calc(0.375em - 50%)',
                'margin-left': 'calc(0.54em - 50%)'
            },
            '.tab-panel-left-scroller:before': {
                'left': '31px',
                'top': '26px',
                'border': 'solid transparent',
                'content': '" "',
                'height': '0',
                'width': '0',
                'position': 'absolute',
                'pointer-events': 'none',
                'border-style': 'solid',
                'border-color': 'transparent #000 transparent transparent',
                'border-width': '8px 8px 8px 0',
                'margin-top': 'calc(0.375em - 50%)',
                'margin-left': 'calc(0.45em - 50%)'
            },
            '.tab-panel-left-scroller.disable, .tab-panel-right-scroller.disable': {
                'background-color': '#cccdce',
                'cursor': 'default',
				'opacity': '0.3'
            },
            '.tab-panel .tool.add svg .fill, .tab-panel .tool.del svg .fill': {
                'fill': '#fff'
            },
            'ul.tab-header': {
                'list-style': 'none',
                'margin': '0',
                'padding': '0',
                'transition': 'opacity 0.00001s linear, margin-left 0.3s linear',
                'height': '40px',
                'display': 'flex',
                'flex-direction': 'row',
				'background':'#cdcdcd'
            },
            'ul.tab-header > li:first-child': {
                'margin-left': '0'
            },
            'ul.tab-header > li:last-child': {
                'margin-right': '0'
            },
            'ul.tab-header > li': {
                'padding': '0',
                'display': 'block',
                'color': '#555',
                '-webkit-user-select': 'none',
                '-moz-user-select': 'none',
                'user-select': 'none',
                'background-color': 'none',
                'cursor': 'pointer',
				'width': '50%'
            },
			'.editor-container .tab-header-wrapper ul.tab-header > li': {
				'width': 'auto'
			},
			
			'.editor-container .tab-header-wrapper ul.tab-header > li > span': {
				'width': 'auto'
			},
			
            'ul.tab-header > li > span': {
                'float': 'left',
                'line-height': '42px',
                'height': '0',
                'margin-right': '.1em',
                'color': '#2f2f2f',
                // 'border-right': '2.5em solid transparent',
                'border-bottom': '40px solid #d8d8d8',
				'font-size': '12px',
                'padding': '0 1em',
				'width': '100%',
				'text-align': 'center'
            },
            'ul.tab-header > li:hover': {
                'background': 'none'
            },
            'ul.tab-header > li:hover > span': {
                'border-bottom': '40px solid #ababab'
            },
            'ul.tab-header > li:focus': {
                'outline': 'none'
            },
            'ul.tab-header > li.active': {
                'background': 'none',
                'color': '#fff'
            },
            '.tab-header-container  ul.tab-header > li.active span': {
                'border-bottom': '40px solid #fff',
                'border-top': '4px solid #e47d37',
                'color': '#e57d37',
                'line-height': '35px',
                'z-index': '1'
            },
            '.tab-header-container  ul.tab-header > li span': {
                'background' : '#e6e6e6',
                'border-bottom': '0px solid #ffffff',
            },                         
            'ul.tab-header > li.active span': {
                'border-bottom': '40px solid #ffffff',
				'border-top': '4px solid #e47d37',
                'color': '#e57d37',
				'line-height': '35px',
                'z-index': '1'
            },
            'ul.tab-header > li.answered': {
                'background': 'none'
            },
            'ul.tab-header > li.answered span': {
                'border-bottom': '40px solid #47A447',
                'color': '#fff'
            },
            '.tab-content': {
                'padding': '0px',
                'background': '#FFF',
                'color': '#333',
                /*'border': '1px solid #eee',*/
                'display': 'none'
            },
            '.tab-content.active': {
                'display': 'block'
            },
            '.tab-empty-content': {
                'display': 'none',
                'background-color': '#FFF',
                'padding': '.6em',
                'font-weight': 'bold'
            }
        };

    function randId() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function createTool(instance, cls, title, handler, options) {
        var tool = instance.htmlDoc.createElement('span');

        tool.classList.add('tool');
        if (cls !== '') {
            tool.classList.add(cls);
        }
        if (title !== '') {
            tool.setAttribute('title', title);
        }
        if (Helper.objectHasKey(options, 'svg') === true) {
            tool.innerHTML = options.svg;
        }

        instance.toolCount += 1;
        tool.dataset.id = instance.toolCount;
        instance.toolsContainer.appendChild(tool);
        instance.toolHandlers[instance.toolCount] = handler;
    }

    function tabPanelHandleTemplate(id, title, label, instance) {
        var dummy = instance.htmlDoc.createElement('div'),
            handle, span;

        dummy.innerHTML = tabHandleTemplate.join('');
        handle = dummy.firstElementChild;
        span = handle.querySelector('span');
        span.appendChild(instance.htmlDoc.createTextNode(title));
        handle.dataset.id = id;
        handle.id = instance.tabPanelPrefix + '-' + 'tab-' + id;
        handle.setAttribute('aria-controls', instance.tabPanelPrefix + '-' + 'tabpanel-' + id);
        if (label !== null && typeof label !== 'undefined') {
            handle.setAttribute('aria-label', label);
        }

        return handle;
    }

    function tabPanelContentTemplate(id, elem, instance) {
        var dummy = instance.htmlDoc.createElement('div'),
            content;

        dummy.innerHTML = tabContentTemplate.join('');
        content = dummy.firstElementChild;
        content.dataset.id = id;
        content.classList.add('tab-content');
        content.id = instance.tabPanelPrefix + '-' + 'tabpanel-' + id;
        content.setAttribute('aria-labelledby', instance.tabPanelPrefix + '-' + 'tab-' + id);
        if (elem !== null) {
            content.appendChild(elem);
        }

        return content;
    }

    function setActiveTabUnlessThereIsOne(instance) {
        var tabId,
            tabs = instance.panelMapper;

        if (tabs.hasOwnProperty(instance.activeTabId) === true) {
            return;
        }

        for (tabId in tabs) {
            if (tabs.hasOwnProperty(tabId) === true) {
                instance.activate(tabId);
                break;
            }
        }
    }

    function getPanelCount(instance) {
        var tabId,
            count = 0,
            tabs = instance.panelMapper;

        for (tabId in tabs) {
            if (tabs.hasOwnProperty(tabId) === true) {
                count += 1;
            }
        }
        return count;
    }

    function activateFn(event) {
        var tab = event.target;

        if (tab && (tab.matches('li[role="tab"] > span'))) {
            tab = tab.parentNode;
        }
        else if (tab && tab.matches('li[role="tab"]') === false) {
            return;
        }
        else if (tab === null) {
            return;
        }

        if (this.tabNavigationEnabled === false) {
            return;
        }

        if (tab.classList.contains('active')) {
            return;
        }

        this.activate(tab.dataset.id);
    }

    function keyDownFn(event) {
        var tab = event.target,
            keyCode = event.keyCode,
            RIGHT_ARROW = 39, LEFT_ARROW = 37,
            activeTab = this.panelMapper[this.activeTabId].tabHandle,
            next = null, prev = null;

        if (tab && tab.nodeName.toLowerCase() !== 'li') {
            return;
        }

        if (this.tabNavigationEnabled === false) {
            return;
        }

        if (keyCode === RIGHT_ARROW) {
            next = activeTab.nextElementSibling;
            if (next !== null) {
                this.onTabClick({'target': next});
            }
        }
        else if (keyCode === LEFT_ARROW) {
            prev = activeTab.previousElementSibling;
            if (prev !== null) {
                this.onTabClick({'target': prev});
            }
        }
    }

    function getPixels(str) {
        str = str.replace('px', '');
        return parseFloat(str) || 0;
    }

    function getElementWidthWithMargin(element, instance) {
        var styles, margin = 0;

        if (instance.global.getComputedStyle) {
            styles = instance.global.getComputedStyle(element);
            margin = getPixels(styles.getPropertyValue('margin-left'));
            margin += getPixels(styles.getPropertyValue('margin-right'));
            margin += getPixels(styles.getPropertyValue('width'));
            margin += getPixels(styles.getPropertyValue('border-left-width'));
            margin += getPixels(styles.getPropertyValue('border-right-width'));
        }

        return margin;
    }

    function setTabScroller(instance) {
        var currentTab, prevTab, nextTab,
            count = getPanelCount(instance),
            leftScrollerClasses = instance.leftScroller.classList,
            rightScrollerClasses = instance.rightScroller.classList,
            marginLeft = 0;

        if (count === 0 || instance.activeTabId === null) {
            return;
        }
        currentTab = instance.panelMapper[instance.activeTabId].tabHandle;
        prevTab = currentTab.previousElementSibling;
        nextTab = currentTab.nextElementSibling;

        if (prevTab !== null && nextTab !== null) {
            leftScrollerClasses.remove('disable');
            leftScrollerClasses.add('enable');
            rightScrollerClasses.remove('disable');
            rightScrollerClasses.add('enable');
        }
        else if (prevTab === null && nextTab !== null) {
            leftScrollerClasses.remove('enable');
            leftScrollerClasses.add('disable');
            rightScrollerClasses.remove('disable');
            rightScrollerClasses.add('enable');
        }
        else if (prevTab !== null && nextTab === null) {
            leftScrollerClasses.remove('disable');
            leftScrollerClasses.add('enable');
            rightScrollerClasses.add('disable');
            rightScrollerClasses.remove('enable');
            marginLeft = instance.tabPanelHandleContainer.clientWidth -
                instance.tabPanelHeaderWrapper.clientWidth;
            instance.tabPanelHandleContainer.style.marginLeft = -(marginLeft) + 'px';
        }
        else {
            leftScrollerClasses.remove('enable');
            leftScrollerClasses.add('disable');
            rightScrollerClasses.remove('enable');
            rightScrollerClasses.add('disable');
        }
    }

    function setTabPanelHandleWrapperWidth(instance, doNotResetPosition) {
        var style = instance.tabPanelHandleContainer.style;

        instance.widthDiff = 0;
        if (instance.tabPanelHandleWidth > instance.tabPanelHeaderWrapperWidth) {
            instance.widthDiff = (instance.tabPanelHandleWidth - instance.tabPanelHeaderWrapperWidth);
            style.width = instance.tabPanelHandleWidth + 'px';
        }
        else {
            style.width = instance.tabPanelHeaderWrapperWidth + 'px';
        }
        style.padding = '0';
        if (doNotResetPosition !== true) {
            style.marginLeft = '0';
            setTabScroller(instance);
        }
    }

    function hackOpacityForTransitionStartEvent(elem, compStyle) {
        if (compStyle.getPropertyValue('opacity') === '1') {
            elem.style.opacity = '0.9999';
        }
        else {
            elem.style.opacity = '1';
        }
    }

    function scrollRightFn(activateNext) {
        var marginLeft = 0, tab, nextTab, compStyle, prevTabWidth = 0, prevTabMargin = 0,
            tabHeadCompStyle, tabHeadMargin = 0;

        if (this.transitionInProgress === true) {
            return;
        }

        tab = this.panelMapper[this.activeTabId].tabHandle;
        nextTab = tab.nextElementSibling;

        if (this.tabNavigationEnabled === false) {
            return;
        }

        tabHeadCompStyle = this.global.getComputedStyle(this.tabPanelHandleContainer);
        tabHeadMargin = getPixels(tabHeadCompStyle.getPropertyValue('margin-left'));

        if (activateNext !== false && nextTab !== null) {
            this.activate(nextTab.dataset.id);
            compStyle = this.global.getComputedStyle(nextTab);
            prevTabWidth = getPixels(compStyle.getPropertyValue('width'));
            prevTabMargin = getPixels(compStyle.getPropertyValue('margin-left'));
            prevTabWidth += prevTabMargin;
        }
        if (Math.abs(tabHeadMargin - prevTabWidth) >= this.widthDiff) {
            marginLeft = 0 - this.widthDiff;
        }
        else {
            marginLeft = tabHeadMargin - prevTabWidth;
            hackOpacityForTransitionStartEvent(
                this.tabPanelHandleContainer,
                this.global.getComputedStyle(this.tabPanelHandleContainer)
            );
        }
        this.tabPanelHandleContainer.style.marginLeft = marginLeft + 'px';
    }

    function scrollLeftFn(activatePrev) {
        var marginLeft = 0, tab, prevTab, compStyle, prevTabWidth = 0, prevTabMargin = 0,
            tabHeadCompStyle, tabHeadMargin;

        if (this.transitionInProgress === true) {
            return;
        }

        tab = this.panelMapper[this.activeTabId].tabHandle;
        prevTab = tab.previousElementSibling;

        if (this.tabNavigationEnabled === false) {
            return;
        }

        tabHeadCompStyle = this.global.getComputedStyle(this.tabPanelHandleContainer);
        tabHeadMargin = getPixels(tabHeadCompStyle.getPropertyValue('margin-left'));

        if (activatePrev !== false && prevTab !== null) {
            this.activate(prevTab.dataset.id);
            compStyle = this.global.getComputedStyle(prevTab);
            prevTabWidth = getPixels(compStyle.getPropertyValue('width'));
            prevTabMargin = getPixels(compStyle.getPropertyValue('margin-left'));
            prevTabWidth += prevTabMargin;
        }

        if ((tabHeadMargin + prevTabWidth) >= 0) {
            marginLeft = 0;
        }
        else {
            marginLeft = tabHeadMargin + prevTabWidth;
            hackOpacityForTransitionStartEvent(
                this.tabPanelHandleContainer,
                this.global.getComputedStyle(this.tabPanelHandleContainer)
            );
        }
        this.tabPanelHandleContainer.style.marginLeft = marginLeft + 'px';
    }

    function setHandleContainerMarginLeft(instance, marginLeft) {
        var scrollLimit = 0;

        scrollLimit = (instance.tabPanelHandleWidth - instance.tabPanelHeaderWrapperWidth);
        if (marginLeft > 0) {
            marginLeft = 0;
        }
        else if (scrollLimit < (marginLeft * -1)) {
            marginLeft = (scrollLimit * -1);
        }
        instance.tabPanelHandleContainer.style.marginLeft = marginLeft + 'px';
    }

    function scrollIntoView(tabId, instance) {
        var id, handle, tabs = instance.panelMapper, marginLeft = 0, width = 0;

        if (instance.tabPanelHeaderWrapperWidth > instance.tabPanelHandleWidth) {
            return;
        }
        for (id in tabs) {
            if (tabs.hasOwnProperty(id) === true) {
                handle = tabs[id].tabHandle;
                width += getElementWidthWithMargin(handle, instance);
                if (handle.dataset.id === tabId) {
                    break;
                }
            }
        }
        marginLeft = instance.tabPanelHeaderWrapperWidth - width;
        setHandleContainerMarginLeft(instance, marginLeft);
    }

    function assertTab(instance, id) {
        if (Helper.isUndefined(instance.panelMapper[id]) === true) {
            throw new Error('tabpanel.tab.not.found');
        }
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('tabpanel.not.rendered');
        }
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'tabpanel-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.transitionInProgress = false;
        instance.transitionInProgressTimer = false;
        instance.onTransitionEnd = null;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isRendered = false;
        instance.leftScroller = null;
        instance.rightScroller = null;
        instance.panel = null;
        instance.panelBody = null;
        instance.tabPanelContainer = null;
        instance.tabPanelContainerWidth = 0;
        instance.tabPanelContentContainer = null;
        instance.tabPanelHandleContainer = null;
        instance.tabPanelHeaderContainer = null;
        instance.tabPanelHeaderWrapper = null;
        instance.tabPanelTitleContainer = null;
        instance.tabPanelHeaderWrapperWidth = 0;
        instance.tabPanelHandleWidth = 0;
        instance.activeTabId = null;
        instance.tabPanelTitle = null;
        instance.tabPanelIcon = null;
        instance.uuid = 0;
        instance.widthDiff = null;
        instance.onTabClick = null;
        instance.onTabKeyDown = null;
        instance.onScrollLeft = null;
        instance.onScrollRight = null;
        instance.onTitleClick = null;
        instance.classAdded = [];
        instance.panelName = null;
        instance.toolsContainer = null;
        instance.toolHandlers = {};
        instance.toolHandler = null;
        instance.toolCount = 0;
        instance.tabNavigationEnabled = true;
        instance.overlay = null;
        instance.enabled = true;
        instance.emptyTabpanelContainer = null;
        instance.actiaveTabOnCreate = false;
        instance.tabPanelPrefix = randId();
        instance.locale = {};
        instance.panelMapper = {};
    }

    function onTitleClick(e) {
        var panelClassList = this.panel.classList,
            elem = e.target.closest('.tool'),
            classList = elem && elem.classList,
            id;

        if (elem !== null) {
            if (classList.contains('disabled') === true) {
                return;
            }
            id = elem.dataset.id;
            this.toolHandlers[id].call(this.global);
            return;
        }
        if (panelClassList.contains('open')) {
            this.hide();
            return;
        }
        this.show();
    }

    function getPrevOrNextTabId(instance, id) {
        var tabId,
            prevTab = null,
            tabs = instance.panelMapper;

        for (tabId in tabs) {
            if (tabs.hasOwnProperty(tabId) === true) {
                if (tabId === id && prevTab !== null) {
                    return prevTab;
                }
                else if (prevTab === id) {
                    return tabId;
                }
                prevTab = tabId;
            }
        }
        return null;
    }

    function clearTransitionTimer() {
        clearTimeout(this.transitionInProgressTimer);
        this.transitionInProgress = false;
        this.transitionInProgressTimer = false;
    }

    function transitionEndFn(e) {
        if (e.propertyName === 'opacity' && e.elapsedTime < 0.01) {
            this.transitionInProgress = true;
            if (this.transitionInProgressTimer !== false) {
                clearTransitionTimer.call(this);
            }
            this.transitionInProgressTimer = setTimeout(clearTransitionTimer.bind(this), 1000);
        }
        else {
            this.transitionInProgress = false;
        }
    }

    function TabPanel(cont, doc, win, eventBus, locale) {
        if (win instanceof win.Window === false) {
            throw new Error('tabpanel.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('tabpanel.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('tabpanel.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('tabpanel.requires.eventbus');
        }

        initializeVariables(this);
        this.tabPanelContainer = cont;
        this.global = win;
        this.tabPanelContainerWidth = getElementWidthWithMargin(cont, this);
        this.htmlDoc = doc;
        this.eBus = eventBus;
        if (typeof locale === 'object') {
            this.locale = locale;
        }
    }

    TabPanel.prototype.setEmptyTabpanelContent = function setEmptyTabpanelContent(text) {
        var elem;

        assertRendered(this);
        this.emptyTabpanelContainer.innerHTML = '';
        elem = this.htmlDoc.createTextNode(text);
        this.emptyTabpanelContainer.appendChild(elem);
    };

    TabPanel.prototype.hideTabScroller = function hideTabScroller() {
        this.leftScroller.style.display = 'none';
        this.rightScroller.style.display = 'none';
        setTabScroller(this);
        this.tabPanelHandleContainer.style.marginLeft = '0';
    };

    TabPanel.prototype.showTabScroller = function showTabScroller() {
        if (getPanelCount(this) === 0) {
            return;
        }
        if (this.tabPanelHandleContainer.clientWidth > this.tabPanelHeaderWrapper.clientWidth) {
            this.leftScroller.style.display = 'flex';
            this.rightScroller.style.display = 'flex';
            setTabScroller(this);
        }
    };

    TabPanel.prototype.setTitle = function setTitle(title) {
        assertRendered(this);
        if (Helper.isString(title) === false) {
            throw new Error('tabpanel.title.must.be.a.string');
        }
        this.tabPanelTitle.innerHTML = '';
        if (Helper.isEmptyString(title) === true) {
            this.tabPanelTitleContainer.style.display = 'none';
        }
        else {
            this.tabPanelTitleContainer.style.display = 'flex';
            this.tabPanelTitle.appendChild(this.htmlDoc.createTextNode(title));
        }
    };

    TabPanel.prototype.setName = function setName(name) {
        assertRendered(this);

        if (Helper.isEmptyString(name) === true) {
            throw new Error('panel.name.empty.string');
        }

        this.panelName = name;
        this.panel.dataset.name = this.panelName;
    };

    TabPanel.prototype.activateOnAdd = function activateOnAdd(enable) {
        this.actiaveTabOnCreate = enable;
    };

    function getTabpanelHandleWidth(instance) {
        var tabId, tabs = instance.panelMapper,
            width = 0;

        for (tabId in tabs) {
            if (tabs.hasOwnProperty(tabId) === true) {
                width += getElementWidthWithMargin(tabs[tabId].tabHandle, instance);
            }
        }

        return width;
    }

    TabPanel.prototype.add = function add(title, content, label) {
        var handle, tabContent, id;

        assertRendered(this);
        content = content || null;

        if (Helper.isEmptyString(title)) {
            throw new Error('tab.title.cannot.be.empty');
        }
        if (content !== null &&
            content instanceof this.global.HTMLElement === false) {
            throw new Error('tab.content.must.be.an.htmlelement');
        }

        this.uuid += 1;
        id = this.uuid.toString();
        this.panelMapper[id] = {};
        handle = tabPanelHandleTemplate(this.uuid, title, label, this);
        this.panelMapper[id].tabHandle = handle;
        tabContent = tabPanelContentTemplate(this.uuid, content, this);
        this.panelMapper[id].tabContent = tabContent;
        this.tabPanelHandleContainer.appendChild(handle);
        this.tabPanelContentContainer.appendChild(tabContent);
        this.eBus.publish('Tabpanel:onAdd', this.uuid, this);
        this.tabPanelHeaderWrapperWidth = this.tabPanelHeaderWrapper.clientWidth;
        this.tabPanelHandleWidth = getTabpanelHandleWidth(this);
        setTabPanelHandleWrapperWidth(this);
        setActiveTabUnlessThereIsOne(this);
        this.displayEmptyContentOnEmptyTabpanel();
        if (this.actiaveTabOnCreate === true) {
            this.activate(id);
        }
        return id;
    };

    TabPanel.prototype.getTabContentElement = function getTabContentElement(id) {
        var tab;

        assertRendered(this);
        assertTab(this, id);
        tab = this.panelMapper[id].tabContent;

        return tab;
    };

    TabPanel.prototype.setEnabled = function setEnabled(enable) {
        var rect, style = this.overlay.style;

        if (enable === false) {
            rect = this.panel.getBoundingClientRect();
            style.display = 'block';
            style.top = '0';
            style.left = '0';
            style.height = rect.height + 'px';
            style.width = rect.width + 'px';
        }
        else {
            style.display = 'none';
        }
        this.enabled = enable;
    };

    TabPanel.prototype.getTabHandleElement = function getTabHandleElement(id) {
        var tab;

        assertRendered(this);
        assertTab(this, id);
        tab = this.panelMapper[id].tabHandle;

        return tab;
    };

    TabPanel.prototype.enableTabNavigation = function enableTabNavigation(enable) {
        var classList = this.tabPanelHeaderContainer.classList;

        if (enable === true) {
            classList.remove('disabled');
            this.tabNavigationEnabled = true;
        }
        else {
            if (classList.contains('disabled') === false) {
                classList.add('disabled');
            }
            this.tabNavigationEnabled = false;
        }
    };

    TabPanel.prototype.setTabTitle = function setTabTitle(id, title) {
        var tabTitle, spanElem;

        assertRendered(this);
        assertTab(this, id);
        if (Helper.isString(title) === false) {
            throw new Error('tab.title.must.be.a.string');
        }
        if (Helper.isEmptyString(title) === true) {
            throw new Error('tab.title.cannot.be.empty');
        }
        spanElem = this.htmlDoc.createElement('span');
        spanElem.appendChild(this.htmlDoc.createTextNode(title));

        tabTitle = this.panelMapper[id].tabHandle;
        tabTitle.innerHTML = '';
        tabTitle.appendChild(spanElem);
    };

    TabPanel.prototype.setTabContent = function setTabContent(id, content) {
        var tab;

        assertRendered(this);
        assertTab(this, id);
        if (content instanceof this.global.HTMLElement === false &&
            content instanceof this.global.DocumentFragment === false) {
            throw new Error('tab.content.must.be.an.htmlelement');
        }

        tab = this.panelMapper[id].tabContent;
        tab.innerHTML = '';
        tab.appendChild(content);
        this.eBus.publish('Tabpanel:onUpdate', id, this);
    };

    TabPanel.prototype.setTabHandelClass = function setTabHandelClass(id, className) {
        var tab;

        assertTab(this, id);
        this.classAdded.push(className);
        tab = this.panelMapper[id].tabHandle;
        if (tab === null) {
            throw new Error('tabpanel.tab.handle.not.found');
        }
        tab.classList.add(className);
    };

    TabPanel.prototype.removeTabHandleClass = function removeTabHandleClass(id, className) {
        var index = this.classAdded.indexOf(className),
            tab;

        assertTab(this, id);
        if (index !== -1) {
            this.classAdded.splice(index, 1);
            tab = this.panelMapper[id].tabHandle;
            if (tab === null) {
                throw new Error('tabpanel.tab.handle.not.found');
            }
            tab.classList.remove(className);
        }
    };

    TabPanel.prototype.addTool = function addTool(cls, title, handler, options) {
        assertRendered(this);
        if (Helper.isString(cls) === false) {
            throw new Error('tabpanel.tools.cls.must.be.a.string');
        }
        if (Helper.isEmptyString(cls) === true) {
            throw new Error('tabpanel.tools.cls.cannot.be.empty');
        }
        if (Helper.isString(title) === false) {
            throw new Error('tabpanel.tools.title.must.be.a.string');
        }
        if (Helper.isFunction(handler) === false) {
            throw new Error('tabpanel.tools.handler.must.be.a.function');
        }
        createTool(this, cls, title, handler, options);
    };

    TabPanel.prototype.enableTool = function enableTool(cls, enable) {
        var tool;

        assertRendered(this);
        if (Helper.isString(cls) === false) {
            throw new Error('tabpanel.tools.cls.must.be.a.string');
        }
        if (Helper.isEmptyString(cls) === true) {
            throw new Error('tabpanel.tools.cls.cannot.be.empty');
        }

        tool = this.toolsContainer.querySelector('.tool.' + cls);
        if (tool !== null) {
            if (enable === false && tool.classList.contains('disabled') === false) {
                tool.classList.add('disabled');
            }
            if (enable === true && tool.classList.contains('disabled') === true) {
                tool.classList.remove('disabled');
            }
        }
    };

    TabPanel.prototype.getActiveTabId = function getActiveTabId() {
        var tabs, tab, id;

        assertRendered(this);
        tabs = this.panelMapper;

        for (id in tabs) {
            if (tabs.hasOwnProperty(id) === true) {
                tab = tabs[id].tabHandle;
                if (tab.classList.contains('active') === true) {
                    return id;
                }
            }
        }

        return null;
    };

    TabPanel.prototype.activate = function activate(id) {
        var tabs, tab, tabContent, tabId;

        if (Helper.isUndefined(id) === true || id === null) {
            return;
        }
        assertRendered(this);
        assertTab(this, id);
        tabs = this.panelMapper;
        for (tabId in tabs) {
            if (tabs.hasOwnProperty(tabId) === true) {
                tab = tabs[tabId].tabHandle;
                tabContent = tabs[tabId].tabContent;
                if (id === tabId) {
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                    tab.setAttribute('tabindex', '0');
                    tabContent.classList.add('active');
                    tabContent.removeAttribute('aria-hidden');
                    scrollIntoView(tabId, this);
                }
                else {
                    tab.classList.remove('active');
                    tab.setAttribute('aria-selected', 'false');
                    tab.setAttribute('tabindex', '-1');
                    tabContent.classList.remove('active');
                    tabContent.setAttribute('aria-hidden', 'true');
                }
            }
        }

        this.activeTabId = id;
        setTabScroller(this);
        this.eBus.publish('Tabpanel:onActivate', id, this, this.panelName);
    };

    TabPanel.prototype.remove = function remove(id) {
        var tab, tabContent, tabToActive;

        assertRendered(this);
        assertTab(this, id);
        tab = this.panelMapper[id].tabHandle;
        tabContent = this.panelMapper[id].tabContent;
        if (tab === null || tabContent === null) {
            throw new Error('tabpanel.tab.not.found');
        }
        tabToActive = getPrevOrNextTabId(this, id);
        tab.parentNode.removeChild(tab);
        tabContent.parentNode.removeChild(tabContent);
        delete this.panelMapper[id];

        this.tabPanelHeaderWrapperWidth = this.tabPanelHeaderWrapper.clientWidth;
        this.tabPanelHandleWidth = getTabpanelHandleWidth(this);
        this.eBus.publish('Tabpanel:onRemove', id, this);
        if (tabToActive !== null) {
            this.activate(tabToActive);
        }
        else {
            this.activeTabId = null;
        }

        setTabPanelHandleWrapperWidth(this, true);
        this.displayEmptyContentOnEmptyTabpanel();
    };

    TabPanel.prototype.displayEmptyContentOnEmptyTabpanel = function displayEmptyContentOnEmpty() {
        var tabCount = getPanelCount(this);

        if (tabCount === 0) {
            this.emptyTabpanelContainer.style.display = 'block';
            this.hideTabScroller();
            this.tabPanelHeaderContainer.style.display = 'none';
            this.tabPanelContentContainer.style.display = 'none';
        }
        else {
            this.emptyTabpanelContainer.style.display = 'none';
            if (this.tabPanelHandleContainer.clientWidth > this.tabPanelHeaderWrapper.clientWidth) {
                this.showTabScroller();
            }
            else {
                this.hideTabScroller();
            }
            this.tabPanelHeaderContainer.style.display = 'flex';
            this.tabPanelContentContainer.style.display = 'block';
        }
    };

    TabPanel.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    TabPanel.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    TabPanel.prototype.render = function render() {
        var qs, styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('tabpanel.rendered.already');
        }

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        this.tabPanelContainer.innerHTML = Helper.replaceLocaleString(
            tabPanelTemplate.join(''), this.locale
        );
        qs = this.tabPanelContainer.querySelector.bind(this.tabPanelContainer);
        this.panel = qs('.tab-panel');
        this.emptyTabpanelContainer = qs('.tab-empty-content');
        this.overlay = qs('.tab-panel .tab-overlay');
        this.tabPanelHandleContainer = qs('[role="tablist"]');
        this.tabPanelTitleContainer = qs('.tab-panel .header');
        this.panelBody = qs('.tab-panel .panel-body');
        this.tabPanelHeaderContainer = qs('.tab-header-container');
        this.tabPanelHeaderWrapper = qs('.tab-header-wrapper');
        this.tabPanelContentContainer = qs('.tab-content-container');
        this.leftScroller = qs('.tab-panel-left-scroller');
        this.rightScroller = qs('.tab-panel-right-scroller');
        this.tabPanelTitle = qs('.tab-panel .header .text');
        this.tabPanelIcon = qs('.tab-panel .header .icon');
        this.toolsContainer = qs('.tab-panel .header .tools');
        this.onTabClick = activateFn.bind(this);
        this.onTabKeyDown = keyDownFn.bind(this);
        this.onScrollLeft = scrollLeftFn.bind(this);
        this.onScrollRight = scrollRightFn.bind(this);
        this.onTransitionEnd = transitionEndFn.bind(this);
        this.tabPanelHandleContainer.addEventListener('click', this.onTabClick, false);
        this.tabPanelHandleContainer.addEventListener('keydown', this.onTabKeyDown, false);
        this.tabPanelHandleContainer.addEventListener('transitionend', this.onTransitionEnd, false);
        this.onTitleClick = onTitleClick.bind(this);
        this.tabPanelTitleContainer.addEventListener('click', this.onTitleClick, false);
        this.leftScroller.addEventListener('click', this.onScrollLeft, false);
        this.rightScroller.addEventListener('click', this.onScrollRight, false);
        this.isRendered = true;
        this.eBus.publish('Tabpanel:onRender', this);
        this.displayEmptyContentOnEmptyTabpanel();
        if(this.tabPanelContainer.classList.contains('references-container')){
            this.tabPanelContainer.getElementsByClassName('tab-header-container')[0].outerHTML = '';
        }
    };

    TabPanel.prototype.hide = function hide() {
        var panelClassList = this.panel.classList,
            styles = this.panelBody.style;

        styles.display = 'none';
        this.panelBody.setAttribute('aria-hidden', 'true');
        panelClassList.remove('open');
    };

    TabPanel.prototype.show = function show() {
        var panelClassList = this.panel.classList;

        this.panelBody.style.display = 'block';
        this.panelBody.removeAttribute('aria-hidden');
        this.tabPanelHeaderWrapperWidth = this.tabPanelHeaderWrapper.clientWidth;
        setActiveTabUnlessThereIsOne(this);
        this.tabPanelHandleWidth = getTabpanelHandleWidth(this);
        setTabPanelHandleWrapperWidth(this, true);
        panelClassList.add('open');
        this.setEnabled(this.enabled);
        this.eBus.publish('Panel:onShow', this.panelName);
    };

    TabPanel.prototype.destroy = function destroy() {
        var eb = this.eBus;

        assertRendered(this);
        this.tabPanelHandleContainer.removeEventListener('click', this.onTabClick, false);
        this.tabPanelHandleContainer.removeEventListener('keydown', this.onTabKeyDown, false);
        this.tabPanelHandleContainer.removeEventListener(
            'transitionend', this.onTransitionEnd, false
        );
        this.leftScroller.removeEventListener('click', this.onScrollLeft, false);
        this.rightScroller.removeEventListener('click', this.onScrollRight, false);
        this.tabPanelTitleContainer.removeEventListener('click', this.onTitleClick, false);
        this.tabPanelContainer.innerHTML = '';
        initializeVariables(this);
        eb.publish('Tabpanel:onDestroy');
    };

    return TabPanel;
});

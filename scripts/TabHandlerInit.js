define(['scripts/Helper', 'scripts/EventBus'],
function TabHandlerInitLoader(Helper, EventBus) {
    var renderedMenuId,
        panels = {},
        mainPanels = {},
        collapsePanel = {},
        collaspeFlag = [],
        addQueryBtnClicked = false;

    function isAddQueryClicked() {
        if (addQueryBtnClicked === false) {
            addQueryBtnClicked = true;
        }
    }

    function TabHandlerInit(Win, Doc, ArticleTabPanel) {
        this.win = Win;
        this.doc = Doc;
        this.articleTabPanel = ArticleTabPanel;
        this.rightPanelElement = null;
        this.currentActivePane = 'query';
        EventBus.subscribe('addQuery:click', isAddQueryClicked);
    }

    TabHandlerInit.prototype.setCollapsiblePanels = function setCollapsiblePanels(
        name, panelInst
    ) {
        collapsePanel[name] = panelInst;
    };

    TabHandlerInit.prototype.getPanels = function getPanels() {
        return panels;
    };

    TabHandlerInit.prototype.setMetaData = function setMetaData(metaData) {
        this.metaData = metaData;
    };

    TabHandlerInit.prototype.setQueryBag = function setQueryBag(queryBag) {
        this.queryBag = queryBag;
    };

    TabHandlerInit.prototype.setPanels = function setPanels(
        id, name, container, instance, showContextualMenu
    ) {
        panels[id] = {};
        mainPanels[name] = id;
        panels[id].container = container;
        panels[id].contextualmenu = showContextualMenu;
        panels[id].instance = instance;
        panels[id].name = name;
    };

    TabHandlerInit.prototype.setCollaspeFlag = function setCollaspeFlag(data) {
        collaspeFlag = data;
    };

    TabHandlerInit.prototype.showRightPanel = function showRightPanel(tabName) {
        var matchedNodeClass = this.rightPanelElement.classList;

        matchedNodeClass.add(tabName);
    };

    TabHandlerInit.prototype.hideRightPanels = function hideRightPanels(
        tabName
    ) {
        var matchedNodeClass, panelName;

        matchedNodeClass = this.rightPanelElement.classList;
        if (Helper.isUndefined(tabName) === false) {
            matchedNodeClass.remove(tabName);
            return;
        }
        for (panelName in collapsePanel) {
            if (collapsePanel.hasOwnProperty(panelName) === true) {
                matchedNodeClass.remove(panelName);
            }
        }
    };

    TabHandlerInit.prototype.onCollapse = function onCollapse(tabName) {
        var panel, panelName, firstUnAnsweredQuery, tabPanelInstance,
            activeTabPanelInstance;

        if (tabName === null || Helper.isUndefined(tabName) === true) {
            return;
        }
        if (tabName === 'query' && addQueryBtnClicked === false) {
            tabPanelInstance = collapsePanel[tabName];
            firstUnAnsweredQuery = this.queryBag.getFirstUnAnsweredQuery();
            if (Helper.isNull(firstUnAnsweredQuery) !== true) {
                tabPanelInstance.activate(firstUnAnsweredQuery.tabID);
            }
        }
        activeTabPanelInstance = collapsePanel[this.currentActivePane];
        if (Helper.isUndefined(activeTabPanelInstance) === false &&
            Helper.isNull(activeTabPanelInstance) === false &&
            Helper.isUndefined(activeTabPanelInstance.isEnabled) === false &&
            activeTabPanelInstance.isEnabled === true) {
            tabName = this.currentActivePane;
        }
        this.showRightPanel(tabName);
        for (panelName in collapsePanel) {
            if (collaspeFlag.indexOf(panelName) !== -1) {
                continue;
            }
            if (collapsePanel.hasOwnProperty(panelName) === true) {
                panel = collapsePanel[panelName];
                if (Helper.isNull(panel) === true) {
                    continue;
                }
                if (Helper.isObject(panel.panel) === true &&
                    Helper.isFunction(panel.panel.hide) === true
                ) {
                    panel = panel.panel;
                }
                if (panel.panelName === tabName) {
                    continue;
                }
                panel.hide();
                this.hideRightPanels(panelName);
            }
        }
        this.currentActivePane = tabName;
        addQueryBtnClicked = false;
        if (tabName === 'quick-links') {
            EventBus.publish('QuickLink:Reload');
        }
    };

    TabHandlerInit.prototype.regenerateMenuOnTabChange = function regenerateMenuOnTabChange() {
        if (Helper.isString(renderedMenuId) === true) {
            EventBus.publish('TabPanel:ReloadMenu', panels[renderedMenuId].container);
            panels[renderedMenuId].contextualmenu = true;
            panels[renderedMenuId].instance.attachEvents(true);
        }
    };

    TabHandlerInit.prototype.onEditorTabChange = function onEditorTabChange(tabName) {
        var tabId;

        if (Helper.isUndefined(mainPanels[tabName]) === true) {
            return;
        }
        tabId = mainPanels[tabName];
        this.articleTabPanel.activate(tabId);
    };

    TabHandlerInit.prototype.setRightPaneElement = function setRightPaneElementFn(
        element
    ) {
        this.rightPanelElement = element;
    };

    TabHandlerInit.prototype.onChange = function onChange(id, instance) {
        var tab, locatorTag, targetName, targetElement, targetTagName;

        if (Helper.isUndefined(panels[id]) === false &&
            instance.panelName === 'main' &&
            panels[id].contextualmenu === false
        ) {
            renderedMenuId = id;
            for (tab in panels) {
                if (panels.hasOwnProperty(tab) === true) {
                    panels[tab].contextualmenu = false;
                    panels[tab].instance.attachEvents(false);
                }
            }
            EventBus.publish('contextMenu:destroy');
        }
        else if (instance.panelName === 'query') {
            targetElement = instance.getTabHandleElement(id);
            targetTagName = 'span';
            targetName = targetElement.textContent;
            if (targetName.indexOf('M') === 0) {
                locatorTag = this.queryBag.getHtmlIDForQuery(targetName);
                if (locatorTag === null) {
                    return;
                }
            }
            else {
                locatorTag = 'L' + targetName;
            }
            EventBus.publish('Query:Save', id);
            EventBus.publish(
                'Editor:ScrollTo', targetTagName, locatorTag, instance.panelName
            );
            EventBus.publish(
                'Supplementary:ScrollTo', targetTagName, locatorTag, instance.panelName
            );
        }
    };
    return TabHandlerInit;
});

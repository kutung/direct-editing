define(['scripts/Helper'],
function LocatorLoader(Helper) {
    var scrollMatchNodeSelectors = [
            '[data-name="{{value}}"]',
            '[name="{{value}}"]',
            '[data-id="{{value}}"]',
            '[id="{{value}}"]',
            '[data-heading-level="{{value}}"]'
        ],
        blinkEffect = [
            'edit-summary', 'insert', 'instruct', 'replace_image', 'citation'
        ],
        arrowMark = ['query'];

    function initializeVariables() {
        this.win = null;
        this.doc = null;
        this.eb = null;
        this.tabHandler = null;
        this.items = {};
    }

    function Locator(Win, Doc, EventBus, tabHandlerInit) {
        initializeVariables.call(this);
        this.win = Win;
        this.doc = Doc;
        this.eb = EventBus;
        this.tabHandler = tabHandlerInit;
        this.eb.subscribe('Locator:locate', this.locate, this);
    }

    function findPos(node, container) {
        var curTop = 0, curLeft = 0;

        if (node.offsetParent !== null) {
            do {
                curTop += node.offsetTop;
                curLeft += node.offsetLeft;
                node = node.offsetParent;
            } while (node !== container);
        }

        return {'top': curTop, 'left': curLeft};
    }

    function locateNode(container, matchedNode) {
        var smoothScroll, difference, perTick,
            position = findPos(matchedNode, container),
            parent = null,
            dataSetName = matchedNode.dataset.name,
            tableSelector = '.table [data-name="' + dataSetName + '"]';

        smoothScroll = function smoothScrollFn(to, duration) {
            if (duration <= 0) {
                return;
            }
            difference = to - container.scrollTop;
            perTick = difference / duration * 10;

            setTimeout(function scrollTopFn() {
                container.scrollTop += perTick;
                if (container.scrollTop === to) {
                    return;
                }
                smoothScroll(to, duration - 10);
            }, 10);
        };
        smoothScroll(position.top - 100, 300);
        if (matchedNode.matches(tableSelector) === true) {
            parent = matchedNode.closest('table');
            if (Helper.isNull(parent) === false) {
                parent.scrollLeft = position.left;
            }
        }
    }

    function isVisibleNode(node) {
        var comStyle = getComputedStyle(node);

        if (comStyle.display !== 'none') {
            return true;
        }
        return false;
    }

    function setEffect(node, effectClass) {
        var classList;

        classList = node.classList;
        classList.add(effectClass);
        setTimeout(function removeFn() {
            classList.remove(effectClass);
        }, 2500);
    }

    Locator.prototype.removeOldEffects = function removeOldEffectsFn() {
        var removeClassNode, key, container, i, len;

        for (key in this.items) {
            if (Helper.objectHasKey(this.items, key) === true) {
                container = this.items[key].container;
                removeClassNode = container.querySelectorAll(
                    '.base', '.scrollEffect'
                );
                len = removeClassNode.length;
                for (i = 0; i < len; i += 1) {
                    removeClassNode[i].classList.remove('base', 'scrollEffect');
                }
            }
        }
    };

    Locator.prototype.locate = function locateFn(dataName, from) {
        var matchedNode, key, i, len,
            tabName, containerInstance, container,
            matchedNodeCompStyle,
            matchNodeSelectors,
            matchNodeSelectorLists,
            matchNodeList;

        if (Helper.isEmptyString(dataName) === true ||
            Helper.isString(dataName) === false
        ) {
            throw new Error('locator.params.missing');
        }

        matchNodeSelectors = scrollMatchNodeSelectors.join(',');
        matchNodeSelectorLists = Helper.replaceLocaleString(
            matchNodeSelectors, {'value': dataName}
        );
        for (key in this.items) {
            if (Helper.objectHasKey(this.items, key) === true) {
                container = this.items[key].container;
                matchNodeList = container.querySelectorAll(matchNodeSelectorLists);
                if (matchNodeList.length > 0) {
                    tabName = key;
                    containerInstance = this.items[key].instance;
                    if (isVisibleNode(matchNodeList[0]) === false) {
                        continue;
                    }
                    break;
                }
            }
        }

        if (matchNodeList.length === 0) {
            return;
        }

        if (containerInstance.isEnabled === false) {
            this.tabHandler.onEditorTabChange(tabName);
        }

        len = matchNodeList.length;
        locateNode(container, matchNodeList[0]);
        if (blinkEffect.indexOf(from) !== -1) {
            for (i = 0; i < len; i += 1) {
                setEffect(matchNodeList[i], 'scrollEffect');
            }
        }
        else if (arrowMark.indexOf(from) !== -1) {
            for (i = 0; i < len; i += 1) {
                matchedNode = matchNodeList[i];
                matchedNodeCompStyle = this.win.getComputedStyle(matchedNode);
                matchedNode.style.marginTop = matchedNodeCompStyle.fontSize;
                setEffect(matchedNode, 'base');
            }
        }
    };

    Locator.prototype.addItem = function addItemFn(name, container, instance) {
        if (Helper.isEmptyString(name) === true) {
            throw new Error('locator.item.name.not.string');
        }
        if (container instanceof this.win.HTMLElement === false) {
            throw new Error('locator.item.container.not.element');
        }

        this.items[name] = {
            'container': container,
            'instance': instance
        };
    };

    return Locator;
});

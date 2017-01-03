define(['scripts/Helper'], function treePanelLoader(Helper) {
    'use strict';
    var tocTemplate, tocParentTemplate, tocChildTemplate, cssRules, tocRootTemplate;

    tocTemplate = [
        '<div class="table-of-content" tabindex="-1">',
            '<header>',
                '<span class="section-toc" id={{toc.heading.id}}>{{toc.heading.text}}</span>',
            '</header>',
        '</div>'
    ];
    tocRootTemplate = [
        '<ul role="tree" aria-labelledby="{{toc.heading.id}}"></ul>'
    ];
    tocParentTemplate = [
        '<ul role="group"></ul>'
    ];
    tocChildTemplate = [
        '<li aria-expanded="true" aria-hidden="false" role="treeitem" tabindex="-1">',
            '<span class="icon"></span><span class="label"></span>',
        '</li>'
    ];
    cssRules = {
        '.table-of-content ul': {
            'list-style-type': 'none',
            'padding-left': '0'
        },
        '.table-of-content ul li': {
            'padding-left': '1em'
        },
        '.table-of-content li .label': {
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap',
            'display': 'inline-block',
            'width': 'calc(100% - 3em)',
            'padding': '0 .5em',
            'cursor': 'pointer'
        },
        '.table-of-content li[aria-expanded] > .icon': {
            'display': 'inline-block',
            'vertical-align': 'text-top'
        },
        '.table-of-content .section-toc': {
            'font-size': '2em',
            'padding-bottom': '1em'
        },
        '.table-of-content .toc-parent[aria-expanded="false"] > .icon': {
            'width': '0',
            'height': '0',
            'border-style': 'solid',
            'border-width': '.4em 0 .4em .6em',
            'border-color': 'transparent transparent transparent #000'
        },
        '.table-of-content .toc-parent[aria-expanded="true"] > .icon': {
            'width': '0',
            'height': '0',
            'border-style': 'solid',
            'border-width': '.6em .4em 0 .4em',
            'border-color': '#000 transparent transparent transparent'
        },
        '.table-of-content .toc-parent[aria-hidden="true"] > ul': {
            'display': 'none'
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

    function initializeVariables(instance) {
        instance.win = null;
        instance.doc = null;
        instance.model = null;
        instance.elem = null;
        instance.locale = {};
        instance.stylesheetId = 'treepanel-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = true;
        instance.rendered = false;
        instance.onClickFn = null;
        instance.onNodeClickFn = function dummy() {};
        instance.onNodeEnterClickFn = function dummy() {};
        instance.options = {};
        instance.keyCodes = {
            'enter': 13, 'end': 35, 'home': 36, 'left': 37,
            'up': 38, 'right': 39, 'down': 40, 'asterisk': 106
        };
        instance.activeNode = null;
        instance.rootNodeCreated = false;
        instance.index = 1;
        instance.nodes = {};
        instance.onModelChangeFn = null;
        instance.container = null;
    }

    function TreeView(win, doc, locale) {
        initializeVariables(this);
        this.win = win;
        this.doc = doc;
        if (typeof locale === 'object') {
            this.locale = locale;
        }
    }

    TreeView.prototype.setModel = function setModel(model) {
        this.model = model;
    };

    TreeView.prototype.onNodeClick = function onNodeClick(callback) {
        this.onNodeClickFn = callback;
    };

    TreeView.prototype.onNodeEnterClick = function onNodeEnterClick(callback) {
        this.onNodeEnterClickFn = callback;
    };

    TreeView.prototype.createChildNode = function createChildNode(node, hasChildren, parentNode) {
        var template = tocChildTemplate.join(''), tocChildNode, prop, groupNode,
            tmpWrapper = this.doc.createElement('div');

        tmpWrapper.innerHTML = template;
        tocChildNode = tmpWrapper.firstChild;
        if (hasChildren === true) {
            tocChildNode.classList.add('toc-parent');
            template = tocParentTemplate.join('');
            tmpWrapper = this.doc.createElement('div');
            tmpWrapper.innerHTML = template;
            groupNode = tmpWrapper.firstChild;
            tocChildNode.appendChild(groupNode);
        }
        else {
            tocChildNode.removeAttribute('aria-expanded');
            tocChildNode.removeAttribute('aria-hidden');
        }
        tocChildNode.dataset.id = node.key;
        tocChildNode.dataset.index = this.index;
        tocChildNode.querySelector('.label').innerHTML = node.node;
        this.nodes[node.key] = tocChildNode;
        this.index += 1;
        if (node.data && Helper.isObject(node.data) === true) {
            for (prop in node.data) {
                if (node.data.hasOwnProperty(prop) === true) {
                    tocChildNode.dataset[prop] = node.data[prop];
                }
            }
        }
        parentNode.appendChild(tocChildNode);

        return tocChildNode;
    };

    TreeView.prototype.buildNode = function buildNode(node, hasChildren, parentNodeId) {
        var tocNode, doc = this.doc, template, tmpWrapper = doc.createElement('div'), parent;

        // Append the root node
        if (typeof parentNodeId === 'undefined' || parentNodeId === null) {
            template = tocRootTemplate.join('');
            template = Helper.replaceLocaleString(template, this.options);
            parent = this.elem;
            tmpWrapper.innerHTML = template;
            tocNode = tmpWrapper.firstChild;
            parent.appendChild(tocNode);
            this.createChildNode(node, hasChildren, tocNode);
            return;
        }
        parent = this.elem.querySelector('[data-id="' + parentNodeId + '"] > ul');
        this.createChildNode(node, hasChildren, parent);
    };

    // Select the previous visible tree item.
    function onUpArrow(instance) {
        var nodeIndex, node;

        if (instance.activeNode === null) {
            return;
        }
        nodeIndex = parseInt(instance.activeNode.dataset.index, 10);
        if (nodeIndex === 1) {
            return;
        }
        do {
            nodeIndex -= 1;
            node = instance.elem.querySelector('[data-index="' + nodeIndex + '"]');

            // Check if the element is visible
            if (node.offsetParent !== null) {
                instance.activeNode = node;
                node.focus();
                return;
            }
        } while (nodeIndex >= 1);
    }

    // Select next visible tree item.
    function onDownArrow(instance) {
        var nodeIndex, node;

        if (instance.activeNode === null) {
            return;
        }
        nodeIndex = parseInt(instance.activeNode.dataset.index, 10);
        if (nodeIndex >= (instance.index - 1)) {
            return;
        }
        do {
            nodeIndex += 1;
            node = instance.elem.querySelector('[data-index="' + nodeIndex + '"]');

            // Check if the element is visible
            if (node.offsetParent !== null) {
                instance.activeNode = node;
                node.focus();
                return;
            }
        } while (nodeIndex < (instance.index - 1));
    }

    // Collapse the currently selected parent node if it is expanded.
    // Move to the previous parent node (if possible) when the current parent node is collapsed.
    function onLeftKey(instance) {
        var parent;

        if (instance.activeNode === null) {
            return;
        }

        parent = instance.activeNode.closest('[aria-expanded="true"]');
        if (parent === instance.activeNode) {
            parent = instance.activeNode.parentNode.closest('[aria-expanded="true"]');
        }

        if (parent === null) {
            return;
        }
        parent.setAttribute('aria-expanded', 'false');
        parent.setAttribute('aria-hidden', 'true');
        parent.focus();
        instance.activeNode = parent;
    }

    // Expand the currently selected parent node and move to the first child list item.
    function onRightKey(instance) {
        if (instance.activeNode === null) {
            return;
        }
        if (instance.activeNode.hasAttribute('aria-expanded') === true) {
            instance.activeNode.setAttribute('aria-expanded', 'true');
            instance.activeNode.setAttribute('aria-hidden', 'false');
            instance.activeNode = instance.activeNode.querySelector('li');
            instance.activeNode.focus();
        }
    }

    // similar to mouse click.
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

    // * (asterisk on the numpad): Expand all group nodes.
    function onAsterisk(instance) {
        var nodes = instance.elem.querySelectorAll('[aria-expanded="false"]'),
            len = nodes.length, i = 0;

        for (; i < len; i += 1) {
            nodes[i].setAttribute('aria-expanded', 'true');
            nodes[i].setAttribute('aria-hidden', 'false');
        }
    }

    TreeView.prototype.onKeyDown = function onKeyDown(event) {
        if (event.altKey || event.ctrlKey || event.shiftKey) {
            return;
        }

        switch (event.keyCode) {
        case this.keyCodes.up:
            onUpArrow(this);
            break;
        case this.keyCodes.down:
            onDownArrow(this);
            break;
        case this.keyCodes.left:
            onLeftKey(this);
            break;
        case this.keyCodes.right:
            onRightKey(this);
            break;
        case this.keyCodes.enter:
            onEnter(this, event);
            break;
        case this.keyCodes.home:
            this.elem.querySelector('[data-index="1"]').focus();
            break;
        case this.keyCodes.end:
            this.elem.querySelector('[data-index="' + (this.index - 1) + '"]').focus();
            break;
        case this.keyCodes.asterisk:
            onAsterisk(this);
            break;
        default:
            break;
        }
    };

    TreeView.prototype.onClick = function onClick(event) {
        var target = event.target, prop, data = {};

        if (target.matches('.toc-parent > .icon') === true) {
            target = target.closest('.toc-parent');
            this.onNodeClickFn(target);
        }
        else if (target.matches('.table-of-content .label') === true ||
                 target.matches('.table-of-content .label *') === true) {
            target = target.closest('li');
            this.activeNode = target;
            for (prop in target.dataset) {
                if (target.dataset.hasOwnProperty(prop) === true) {
                    data[prop] = target.dataset[prop];
                }
            }
            this.onNodeClickFn(data);
            target.focus();
            return;
        }
        else if (target.matches('.toc-parent') === false) {
            return;
        }

        if (target.getAttribute('aria-expanded') === 'false') {
            target.setAttribute('aria-expanded', 'true');
            target.setAttribute('aria-hidden', 'false');
        }
        else {
            target.setAttribute('aria-expanded', 'false');
            target.setAttribute('aria-hidden', 'true');
        }
    };

    function renderHtml(instance, container) {
        var tmpWrapper = instance.doc.createElement('div'),
            template = tocTemplate.join('');
        template = Helper.replaceLocaleString(template, instance.locale);
        tmpWrapper.innerHTML = template;
        instance.elem = tmpWrapper.firstChild;
        container.appendChild(instance.elem);
        instance.model.forEach(instance.buildNode.bind(instance));
    }

    TreeView.prototype.onModelChange = function onModelChange(node, hasChildren, parentId) {
        this.elem.removeEventListener('click', this.onClickFn, false);
        this.elem.removeEventListener('keydown', this.onKeyDownFn, false);
        this.container.innerHTML = '';
        renderHtml(this, this.container);
        this.elem.addEventListener('click', this.onClickFn, false);
        this.elem.addEventListener('keydown', this.onKeyDownFn, false);
    };

    TreeView.prototype.renderTo = function renderTo(elem, options) {
        var doc = this.doc, styleEl,
            styleSheet = doc.head.querySelector('#' + this.stylesheetId);

        if (this.rendered === true) {
            throw new Error('tree.rendered.already');
        }

        if (this.model === null) {
            throw new Error('empty.tree.model');
        }

        this.container = elem;
        if (options && Helper.isObject(options) === true) {
            this.options = options;
        }
        this.options['toc.heading.id'] = 'tree-id-' + randId();

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = doc.createElement('style');
            styleEl.id = this.stylesheetId;
            doc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            Helper.addRulesToStyleSheet(doc, this.styleSheet, cssRules);
        }

        renderHtml(this, elem);
        this.onModelChangeFn = this.onModelChange.bind(this);
        this.model.subscribe('change', this.onModelChangeFn);
        this.onClickFn = this.onClick.bind(this);
        this.onKeyDownFn = this.onKeyDown.bind(this);
        this.elem.addEventListener('click', this.onClickFn, false);
        this.elem.addEventListener('keydown', this.onKeyDownFn, false);
        this.rendered = true;
    };

    TreeView.prototype.destroy = function destroy() {
        this.model.unsubscribe('change', this.onModelChangeFn);
        this.model.destroy();
        this.elem.removeEventListener('click', this.onClickFn, false);
        this.elem.removeEventListener('keydown', this.onKeyDownFn, false);
        this.elem.innerHTML = '';
        initializeVariables(this);
    };

    return TreeView;
});

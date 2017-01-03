define(['scripts/Helper'], function ToolTipLoader(Helper) {
    var replaceClass = 'optreplace',
        cereplaceClass = 'pc_cpereplace',
        optrejectClass = 'optreject',
        commentClass = 'optcomment',
        commentTextClass = 'comntText',
        actor = ['Author', 'Copy Editor'],
        options = {
            'optbold': {
                'edit': 'Bold',
                'actor': 'Author'
            },
            'optitalic': {
                'edit': 'Italic',
                'actor': 'Author'
            },
            'optsub': {
                'edit': 'Subscript',
                'actor': 'Author'
            },
            'optsup': {
                'edit': 'Superscript',
                'actor': 'Author'
            },
            'optdel': {
                'edit': 'Delete',
                'actor': 'Author'
            },
            'optinsert': {
                'edit': 'Insert',
                'actor': 'Author'
            },
            'optreject': {
                'edit': 'Reject',
                'actor': 'Author'
            },
            'optreplace': {
                'edit': 'Replace',
                'actor': 'Author'
            },
            'cpeins': {
                'edit': 'Insert',
                'actor': 'Copy Editor'
            },
            'cpedel': {
                'edit': 'Delete',
                'actor': 'Copy Editor'
            },
            'pc_cpereplace': {
                'edit': 'Replace',
                'actor': 'Copy Editor'
            },
            'optsmallcaps': {
                'edit': 'Smallcaps',
                'actor': 'Author'
            },
            'optmono': {
                'edit': 'Monospace',
                'actor': 'Author'
            }
        },
        toolTipTags = [
            '.optbold', '.optitalic', '.optsup', '.optsub',
            '.optdel', '.optcomment', '.optinsert', '.cpedel',
            '.cpeins', '.optreplace', '.optreject',
            '.pc_cpereplace', '.optsmallcaps', '.optmono'
        ],
        tooltipTargets = toolTipTags.join(', ');

    function initializeVariables(instance) {
        instance.eBus = null;
        instance.win = null;
        instance.htmlDoc = null;
        instance.finalFragment = null;
        instance.element = null;
        instance.rendered = false;
        instance.timer = null;
        instance.tooltipText = null;
    }

    function getCommentContent(element) {
        var comTextTag = element.querySelector('.' + commentTextClass);

        if (Helper.isUndefined(comTextTag) === false) {
            return comTextTag.innerHTML;
        }
        return null;
    }

    function identifyFormatting(element) {
        var option, i = 0, changes = {},
            elementClass = element.classList;

        for (; i < elementClass.length; i += 1) {
            if (Helper.isObject(options[elementClass[i]]) === true) {
                option = options[elementClass[i]];
                if (Helper.isUndefined(changes[option.actor]) === true) {
                    changes[option.actor] = [];
                }
                changes[option.actor].push(option.edit);
            }
        }
        return changes;
    }

    function formatData(data, element, instance) {
        var txt = '',
            change = false;

        if (Helper.isUndefined(data.change) === false && data.change.length > 0) {
            txt = '<strong>Change: </strong>' + data.change.join(', ') + ' ';
            change = true;
        }
        if (Helper.isUndefined(data.comment) === false) {
            if (change === true) {
                txt += '<br/>';
            }
            txt += '<strong>Instruction: </strong>' + data.comment + '<br/>';
        }
        if (Helper.isUndefined(data.by) === false) {
            txt += '<strong>By: </strong>' + data.by;
        }
        instance.tooltipText += txt + '<br/>';
    }

    function setDataContent(element, instance) {
        var i = 0, comment,
            changes = identifyFormatting(element),
            elementClass = element.classList,
            parentNode = element.parentNode,
            parentElementClass = parentNode.classList,
            data = {};

        if (parentElementClass.contains(replaceClass) === true ||
            parentElementClass.contains(cereplaceClass) === true ||
            parentElementClass.contains(optrejectClass) === true
        ) {
            changes = identifyFormatting(parentNode);
            element = parentNode;
            elementClass = parentNode.classList;
        }

        if (elementClass.contains(commentClass) === true) {
            comment = getCommentContent(element);
            changes.comment = comment;
        }

        if (Helper.objectHasKey(changes, actor[0]) === false &&
            Helper.objectHasKey(changes, actor[1]) === false &&
            Helper.objectHasKey(changes, 'comment') === false) {
            return;
        }

        if (Helper.isUndefined(changes.comment) === false) {
            data.comment = changes.comment;
            data.by = 'Author';
            formatData(data, element, instance);
            data = {};
        }
        for (; i < actor.length; i += 1) {
            if (Helper.isUndefined(changes[actor[i]]) === false) {
                data.change = changes[actor[i]];
                data.by = actor[i];
                formatData(data, element, instance);
            }
        }
    }

    function showTooltip(instance, e) {
        var rect, style;

        instance.element.innerHTML = instance.tooltipText;

        rect = e.target.getClientRects();
        rect = rect[rect.length - 1];

        style = instance.element.style;
        style.top = (rect.bottom + 10) + 'px';
        if (Helper.isUndefined(instance.win.pageYOffset) === false) {
            style.top = ((rect.bottom + 10) + instance.win.pageYOffset) + 'px';
        }
        style.left = (rect.left + (rect.width / 2) - 20) + 'px';
        style.display = 'block';
    }

    function ToolTip(win, doc, eBus) {
        var classList;

        if (win instanceof win.Window === false) {
            throw new Error('tooltip.requires.window.object');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('tooltip.requires.htmldocument');
        }
        if (Helper.isFunction(eBus.subscribe) === false) {
            throw new Error('tooltip.eventbus.missing');
        }
        if (Helper.isFunction(eBus.publish) === false) {
            throw new Error('tooltip.eventbus.missing');
        }
        initializeVariables(this);
        this.eBus = eBus;
        this.win = win;
        this.htmlDoc = doc;
        this.element = doc.createElement('div');
        classList = this.element.classList;
        classList.add('tooltip');
        classList.add('bottom');
    }

    ToolTip.prototype.show = function show(event) {
        var self = this;

        if (this.timer !== null) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(function onSetTimeout() {
            showTooltip(self, event);
        }, 100);
    };

    ToolTip.prototype.clear = function clear() {
        this.element.innerHTML = '';
        if (this.timer !== null) {
            clearTimeout(this.timer);
        }
    };

    ToolTip.prototype.render = function render(elem) {
        var self = this;

        if (this.rendered === false) {
            this.htmlDoc.body.appendChild(this.element);
            this.rendered = true;
        }

        elem.addEventListener('mouseover', function onmouseover(e) {
            var target = e.target,
                parent = target.parentNode;

            self.tooltipText = '';
            if (target.matches(tooltipTargets) === true) {
                setDataContent(target, self);
                if (self.tooltipText !== '') {
                    self.show(e);
                }
            }
            else if (parent.matches(tooltipTargets) === true) {
                setDataContent(parent, self);
                if (self.tooltipText !== '') {
                    self.show(e);
                }
            }
            else {
                self.clear();
                self.element.style.display = 'none';
            }
        }, false);

        elem.addEventListener('scroll', function onscroll(e) {
            self.clear();
            self.element.style.display = 'none';
        }, false);
    };
    return ToolTip;
});

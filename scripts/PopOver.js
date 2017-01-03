define(['scripts/Helper', 'scripts/ConfigReader'], function PopOverLoader(Helper, Config) {
    var template = [
        '<div class="popover">',
        '</div>'
    ];

    function initializeVariables(instance) {
        instance.win = null;
        instance.htmlDoc = null;
        instance.popOverContainer = null;
        instance.content = null;
        instance.setPopOverPosition = null;
        instance.clickElem = null;
        instance.onMouseLeaveFn = null;
        instance.onClickFn = null;
        instance.clearTimer = null;
        instance.isShown = false;
    }

    function setPopOverPosition() {
        var rect, style;

        style = this.popOverContainer.style;
        rect = this.clickElem.getBoundingClientRect();
        if (Helper.isObject(rect) === false) {
            this.popOverContainer.classList.remove('show');
            return;
        }
        style.top = (rect.top + rect.height + 10) + 'px';
        style.left = (rect.left + (rect.width / 2) - 30) + 'px';
    }

    function onClick(e) {
        if (this.isShown === false) {
            this.setPopOverPosition();
        }
        this.isShown = true;
        this.popOverContainer.classList.add('show');
    }

    function onMouseLeave(e) {
        var classlist = this.popOverContainer.classList;

        this.clearTimer = setTimeout(function removeVisible() {
            classlist.remove('show');
        }, 1000);
    }

    function onMouseEnter(e) {
        var classlist = this.popOverContainer.classList;

        clearTimeout(this.clearTimer);
        classlist.add('show');
    }

    function PopOver(win, doc) {
        var temp;

        if (win instanceof win.Window === false) {
            throw new Error('popOver.requires.window');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('popOver.requires.htmldocument');
        }
        initializeVariables(this);
        this.win = win;
        this.htmlDoc = doc;
        temp = this.htmlDoc.createElement('span');
        temp.innerHTML = template.join('');
        this.popOverContainer = temp.firstChild;
        this.htmlDoc.body.appendChild(this.popOverContainer);
    }

    PopOver.prototype.destroy = function destroy() {
        this.popOverContainer.innerHTML = '';
        initializeVariables(this);
        this.clickElem.removeEventListener('click', this.onClickFn, false);
        this.popOverContainer.removeEventListener('mouseleave', this.onMouseLeaveFn, false);
        this.popOverContainer.removeEventListener('mouseenter', this.onMouseEnterFn, false);
    };

    PopOver.prototype.render = function render(popOverContent, clickElem) {
        var popOverTextNode;

        if (clickElem instanceof this.win.HTMLElement === true) {
            this.clickElem = clickElem;
        }
        if (popOverContent instanceof this.win.HTMLElement === true) {
            this.popOverContainer.appendChild(popOverContent);
        }
        else if (Helper.isString(popOverContent) === true) {
            popOverTextNode = this.htmlDoc.createTextNode(popOverContent);
            this.popOverContainer.appendChild(popOverTextNode);
        }
        this.onClickFn = onClick.bind(this);
        this.onMouseLeaveFn = onMouseLeave.bind(this);
        this.onMouseEnterFn = onMouseEnter.bind(this);
        this.setPopOverPosition = setPopOverPosition.bind(this);
        this.clickElem.addEventListener('click', this.onClickFn, false);
        this.win.addEventListener('resize', this.setPopOverPosition, false);
        this.popOverContainer.addEventListener('mouseleave', this.onMouseLeaveFn, false);
        this.popOverContainer.addEventListener('mouseenter', this.onMouseEnterFn, false);
    };

    return PopOver;
});

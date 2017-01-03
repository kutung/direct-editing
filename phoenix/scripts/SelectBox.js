define(['scripts/Helper'], function selectBoxLoader(Helper) {
    var selectTemplate = [
            '<span class="select-box" tabindex="-1" role="combobox" aria-autocomplete="none" aria-readonly="true">',
                '<span class="wrapper">',
                    '<span class="selection">',
                        '<span class="text">{{select.box.default.text}}</span>',
                        '<span class="trigger" role="button" ',
                            'aria-label="{{select.box.trigger.aria.label}}">',
                            '<span class="icon"></span>',
                        '</span>',
                    '</span>',
                '</span>',
                '<ul class="options" role="listbox" aria-expanded="false" tabindex="-1"></ul>',
            '</span>'
        ],
        optionTemplate = [
            '<li role="option"></li>'
        ],
        cssRules = {
            '.select-box[role="combobox"]': {
                'position': 'relative',
                'box-sizing': 'border-box',
                'display': 'inline-block',
                'width': '100%'
            },
            '.select-box[role="combobox"][aria-disabled="true"]': {
                'opacity': '0.5'
            },
            '.select-box[role="combobox"] .wrapper': {
                'border': '1px solid #aaa',
                'display': 'inline-block',
                'position': 'relative',
                'margin': '0',
                'width': '100%',
                'box-sizing': 'border-box'
            },
            '.select-box[role="combobox"] .wrapper .selection': {
                'position': 'relative',
                'display': 'inline-block',
                'width': '100%',
                'height': '100%',
                'padding': '.5em',
                'padding-right': '1em',
                'cursor': 'pointer',
                '-webkit-user-select': 'none',
                'user-select': 'none',
                '-moz-user-select': 'none',
                'box-sizing': 'border-box'
            },
            '.select-box[role="combobox"] .wrapper .text': {
                'display': 'inline-block',
                'box-sizing': 'border-box'
            },
            '.select-box[role="combobox"] [role="listbox"]': {
                'display': 'none',
                'position': 'absolute',
                'width': '100%',
                'margin': '0',
                'list-style': 'none',
                'padding': '0',
                'box-sizing': 'border-box',
                'border': '1px solid #aaa',
                'border-top': 'none',
                'background-color': '#fff',
                'z-index': '1000',
                'max-height': '10.6em',
                'overflow': 'auto'
            },
            '.select-box[role="combobox"] [role="listbox"] [role="option"]': {
                'display': 'block',
                'padding': '.5em',
                'cursor': 'pointer',
                'border-bottom': '1px solid gray'
            },
            '.select-box[role="combobox"] [role="listbox"] [role="option"]:last-child': {
                'border-bottom': 'none'
            },
            '.select-box[role="combobox"] [role="listbox"] [role="option"].highlight, .select-box[role="combobox"] [role="listbox"] [role="option"]:hover': {
                'background-color': '#5897fb',
                'color': '#fff'
            },
            '.select-box[role="combobox"] [role="listbox"] [role="option"][aria-selected="true"]': {
                'background-color': '#aaa',
                'color': '#fff'
            },
            '.select-box[role="combobox"]:focus .wrapper': {
                'box-shadow': '0 0 5px rgba(81, 203, 238, 1)',
                'border': '1px solid rgba(81, 203, 238, 1)'
            },
            '.select-box[role="combobox"] .wrapper [role="button"]': {
                'display': 'block',
                'right': '0',
                'top': '0',
                'position': 'absolute',
                'width': '1.3em',
                'height': '100%',
                'background-color': '#aaa',
                'cursor': 'pointer',
                'box-sizing': 'border-box'
            },
            '.select-box[role="combobox"] .wrapper [role="button"] .icon': {
                'border-color': '#000 transparent transparent transparent',
                'border-style': 'solid',
                'border-width': '.35em .25em 0 .25em',
                'left': 'calc(50% - .25em)',
                'position': 'absolute',
                'top': '50%'
            }
        };

    function createOptionItem(instance, text, value, dataset) {
        var prop, dummy = instance.htmlDoc.createElement('span'),
            currOptionCount = instance.optionCount += 1,
            optionId = instance.optionIdPrefix + '-' + currOptionCount,
            item;

        dummy.innerHTML = optionTemplate.join('');
        item = dummy.firstChild;

        if (Helper.isObject(dataset) === false) {
            dataset = {};
        }
        item.id = optionId;
        item.dataset.value = value;
        item.innerHTML = text;

        for (prop in dataset) {
            if (dataset.hasOwnProperty(prop) === true) {
                item.dataset[prop] = dataset[prop];
            }
        }

        return item;
    }

    function randId() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function initializeVariables(instance) {
        instance.stylesheetId = 'selectbox-style';
        instance.styleSheet = null;
        instance.insertStylesToHead = false;
        instance.eBus = null;
        instance.global = null;
        instance.htmlDoc = null;
        instance.isEnabled = false;
        instance.isRendered = false;
        instance.selectContainer = null;
        instance.selectBoxElem = null;
        instance.trigger = null;
        instance.optionsElem = null;
        instance.textElem = null;
        instance.selectBoxWrapper = null;
        instance.onClickFn = null;
        instance.onSelectFn = null;
        instance.selectedValues = [];
        instance.name = null;
        instance.tabIndex = -1;
        instance.searchText = '';
        instance.searchTextLimit = 10;
        instance.searchTextClearTimer = null;
        instance.searchTextClearTimeout = 1000;
        instance.stopPropagation = null;
        instance.stopPropagationFn = null;
        instance.onKeyPressFn = null;
        instance.onBlurFn = null;
        instance.clearSearchTextFn = null;
        instance.options = [];
        instance.optionsElems = [];
        instance.scrollIndex = -1;
        instance.optionIdPrefix = randId();
        instance.optionCount = 0;
        instance.locale = {};
        instance.optionScrollActive = false;
        instance.onScrollFn = null;
    }

    function assertRendered(instance) {
        if (instance.isRendered === false) {
            throw new Error('selectbox.not.rendered');
        }
    }

    function Select(cont, doc, win, eventBus, name, locale) {
        if (win instanceof win.Window === false) {
            throw new Error('selectbox.requires.window.object');
        }
        if (cont instanceof win.HTMLElement === false &&
            cont instanceof win.DocumentFragment === false) {
            throw new Error('selectbox.requires.htmlelement');
        }
        if (doc instanceof win.HTMLDocument === false) {
            throw new Error('selectbox.requires.htmldocument');
        }
        if (Helper.isFunction(eventBus.publish) === false) {
            throw new Error('selectbox.requires.eventbus');
        }
        if (Helper.isString(name) === false) {
            throw new Error('selectbox.must.have.a.unique.name');
        }
        if (Helper.isEmptyString(name) === true) {
            throw new Error('selectbox.name.cannot.be.empty');
        }
        initializeVariables(this);
        this.selectContainer = cont;
        this.global = win;
        this.htmlDoc = doc;
        this.eBus = eventBus;
        this.name = name;
        if (typeof locale === 'object') {
            this.locale = locale;
        }
    }

    Select.prototype.renderStyles = function renderStyles() {
        Helper.addRulesToStyleSheet(this.htmlDoc, this.styleSheet, cssRules);
    };

    // This will be removed once all projects start using this. This will be the default later.
    Select.prototype.renderComponentStyle = function renderComponentStyle() {
        this.insertStylesToHead = true;
    };

    Select.prototype.getElement = function getElement() {
        assertRendered(this);
        return this.selectContainer;
    };

    Select.prototype.setEnabled = function setEnabled(enable) {
        var disabled = this.selectBoxElem.getAttribute('aria-disabled');

        if (enable === false) {
            this.isEnabled = false;
            if (disabled === null || disabled === 'false') {
                this.selectBoxElem.setAttribute('aria-disabled', 'true');
            }
        }
        else {
            this.isEnabled = true;
            this.selectBoxElem.removeAttribute('aria-disabled');
        }
    };

    Select.prototype.setLoading = function setLoading() {};

    function hideOptionsElement(elem) {
        elem.style.display = 'none';
        elem.setAttribute('aria-hidden', 'true');
        elem.setAttribute('aria-expanded', 'false');
    }

    function showOptionsElement(elem) {
        elem.style.display = 'block';
        elem.removeAttribute('aria-hidden');
        elem.setAttribute('aria-expanded', 'true');
    }

    function onClick(e) {
        var i = 0, len = this.optionsElems.length;

        if (this.isEnabled === false) {
            return;
        }

        if (this.optionsElem.style.display !== 'block') {
            showOptionsElement(this.optionsElem);
            this.scrollIndex = 0;
            if (len > 0) {
                this.optionsElem.scrollTop = this.optionsElems[0].offsetTop;
            }
            for (i = 0; i < len; i += 1) {
                this.optionsElems[i].removeAttribute('aria-selected');
            }
        }
        else {
            hideOptionsElement(this.optionsElem);
        }
        e.stopPropagation();
    }

    function getDataset(selectedOption) {
        var prop, dataset = {};

        for (prop in selectedOption.dataset) {
            if (selectedOption.dataset.hasOwnProperty(prop) === true) {
                dataset[prop] = selectedOption.dataset[prop];
            }
        }

        return dataset;
    }

    function scrollOption(instance, selectedOption) {
        var i = 0, len = instance.optionsElems.length;

        for (i = 0; i < len; i += 1) {
            instance.optionsElems[i].classList.remove('highlight');
        }
        instance.scrollIndex = -1;

        if (selectedOption !== null) {
            selectedOption.classList.add('highlight');
            instance.optionsElem.scrollTop = selectedOption.offsetTop;
            instance.scrollIndex = instance.optionsElems.indexOf(selectedOption);
        }
    }

    function selectOption(instance, selectedOption) {
        var i = 0, len = instance.optionsElems.length, option = {}, dataset = {};

        scrollOption(instance, selectedOption);
        instance.selectBoxElem.setAttribute('aria-activedescendant', selectedOption.id);

        if (selectedOption !== null) {
            for (i = 0; i < len; i += 1) {
                instance.optionsElems[i].removeAttribute('aria-selected');
            }

            dataset = getDataset(selectedOption);
            selectedOption.setAttribute('aria-selected', 'true');
            instance.textElem.innerHTML = selectedOption.innerHTML;
            instance.selectedValues[0] = dataset.value;
            option.text = selectedOption.innerHTML;
            option.value = dataset.value;
            option.dataset = dataset;
            instance.selectBoxElem.focus();
            instance.eBus.publish(
                'SelectBox:' + instance.name + ':OnChange', option, instance
            );
        }
    }

    function onSelect(e) {
        var elem = e.target;

        if (this.isEnabled === false) {
            return;
        }

        while (elem !== this.optionsElem) {
            if (elem.getAttribute('role') === 'option') {
                selectOption(this, elem);
                break;
            }
            else {
                elem = elem.parentNode;
            }
        }

        hideOptionsElement(this.optionsElem);
    }

    function clearSearchText() {
        this.searchText = '';
    }

    function onBlur() {
        if (this.optionScrollActive === false) {
            hideOptionsElement(this.optionsElem);
        }
    }

    function onKeyPress(e) {
        var keyCode = e.keyCode, i = 0, option,
            len = this.options.length, UP = 38, DOWN = 40, ENTER = 13, ESC = 27, key,
            allowedSearchText = 'abcdefghijklmnopqrstuvwxyz:-_+=~!#%^&*(){}[]|;?<>';

        if (this.isEnabled === false) {
            return;
        }

        function stopPropagation() {
            e.preventDefault();
            e.stopPropagation();
        }

        if (keyCode === UP && this.scrollIndex > 0) {
            showOptionsElement(this.optionsElem);
            option = this.optionsElems[this.scrollIndex - 1];
            scrollOption(this, option);
            stopPropagation();
            return;
        }
        else if (keyCode === DOWN && this.scrollIndex < len - 1) {
            showOptionsElement(this.optionsElem);
            option = this.optionsElems[this.scrollIndex + 1];
            scrollOption(this, option);
            stopPropagation();
            return;
        }
        else if (keyCode === ESC) {
            hideOptionsElement(this.optionsElem);
            stopPropagation();
            return;
        }
        else if (keyCode === ENTER) {
            hideOptionsElement(this.optionsElem);
            option = this.optionsElems[this.scrollIndex];
            selectOption(this, option);
            stopPropagation();
            return;
        }

        if (this.searchTextClearTimer !== null) {
            clearTimeout(this.searchTextClearTimer);
        }

        this.searchTextClearTimer = setTimeout(this.clearSearchTextFn, this.searchTextClearTimeout);
        key = (String.fromCharCode(keyCode)).toLowerCase();
        if (allowedSearchText.indexOf(key) !== -1) {
            this.searchText += key;
        }

        for (i = 0; i < len; i += 1) {
            if (this.options[i].startsWith(this.searchText) === true) {
                this.optionsElem.scrollTop = this.optionsElems[i].offsetTop;
                break;
            }
        }
        if (this.searchText.length >= this.searchTextLimit) {
            this.searchText = '';
        }
        stopPropagation();
    }

    function onCompleteScroll() {
        this.optionScrollActive = false;
        this.selectBoxElem.focus();
    }

    function onScroll() {
        var timer,
            self = this;

        if (self.optionScrollActive === true) {
            return;
        }
        self.optionScrollActive = true;
        clearTimeout(timer);
        timer = setTimeout(onCompleteScroll.bind(self), 200);
    }

    Select.prototype.render = function render() {
        var qs = this.selectContainer.querySelector.bind(this.selectContainer),
            self = this, styleSheet = this.htmlDoc.head.querySelector('#' + this.stylesheetId),
            styleEl;

        if (this.isRendered === true) {
            throw new Error('selectbox.already.rendered');
        }

        if (this.insertStylesToHead === true && styleSheet === null) {
            styleEl = this.htmlDoc.createElement('style');
            styleEl.id = this.stylesheetId;
            this.htmlDoc.head.appendChild(styleEl);
            this.styleSheet = styleEl;
            this.renderStyles();
        }

        this.selectContainer.innerHTML = Helper.replaceLocaleString(
            selectTemplate.join(''), this.locale
        );
        this.selectBoxElem = qs('.select-box');
        this.selectBoxElem.tabIndex = this.tabIndex;
        this.trigger = qs('.trigger');
        this.textElem = qs('.text');
        this.optionsElem = qs('.options');
        hideOptionsElement(this.optionsElem);
        this.optionsElem.id = this.optionIdPrefix + '-' + 'list';
        this.selectBoxElem.setAttribute('aria-owns', this.optionsElem.id);
        this.trigger.setAttribute('aria-controls', this.optionsElem.id);
        this.selectBoxWrapper = qs('.selection');
        this.onClickFn = onClick.bind(this);
        this.onSelectFn = onSelect.bind(this);
        this.onKeyPressFn = onKeyPress.bind(this);
        this.onScrollFn = onScroll.bind(this);

        // Blur fires before 'click' and by that time, the element is hidden. So the click event
        // is never fired on <li> elements. Hence we delay blur handler by 200 milliseconds.
        this.onBlurFn = function onBlurFn() {
            var fn = onBlur.bind(self);

            setTimeout(fn, 200);
        };
        this.clearSearchTextFn = clearSearchText.bind(this);
        this.selectBoxWrapper.addEventListener('click', this.onClickFn, false);
        this.trigger.addEventListener('click', this.onClickFn, false);
        this.optionsElem.addEventListener('click', this.onSelectFn, false);
        this.optionsElem.addEventListener('scroll', this.onScrollFn, false);
        this.selectBoxElem.addEventListener('keydown', this.onKeyPressFn, false);
        this.selectBoxElem.addEventListener('blur', this.onBlurFn, false);
        this.isRendered = true;
        this.isEnabled = true;
        if (this.stopPropagation !== null) {
            this.stopPropagationFn = function stopPropagationOfEvent(e) {
                e.stopPropagation();
            };
            this.selectBoxElem.addEventListener(
                this.stopPropagation, this.stopPropagationFn, false
            );
        }

        this.eBus.publish('SelectBox:' + this.name + ':OnRender', this);
    };

    Select.prototype.stopPropagationOfEvent = function stopPropagation(event) {
        this.stopPropagation = event;
    };

    Select.prototype.addOption = function addOption(text, value, dataset) {
        var elem = createOptionItem(this, text, value, dataset),
            limitedText = text.toLowerCase().substring(0, this.searchTextLimit);

        this.options.push(limitedText);
        this.optionsElems.push(elem);
        this.optionsElem.appendChild(elem);
    };

    Select.prototype.setTabIndex = function setTabIndex(tabIndex) {
        this.tabIndex = tabIndex;
    };

    Select.prototype.clearOptions = function clearOptions() {
        this.optionsElem.innerHTML = '';
        this.textElem.innerHTML = '';
        this.selectedValues = [];
    };

    function getOptionAt(options, index) {
        var children = options.querySelectorAll('li');

        if (children.length === 0 || (index - 1) > children.length || index < 0) {
            throw new Error('selectbox.index.out.of.bounds');
        }
        return children[index - 1];
    }

    Select.prototype.getOptionAt = function getOptionAtFn(index) {
        var option = getOptionAt(this.optionsElem, index),
            value = {};

        value.text = option.innerHTML;
        value.value = option.dataset.value;
        value.dataset = getDataset(option);

        return value;
    };

    Select.prototype.getSelectedIndex = function getSelectedIndex() {
        var children = this.optionsElem.querySelectorAll('li'),
            i = 0,
            len = children.length;

        if (this.selectedValues.length === 0) {
            return -1;
        }

        for (; i < len; i += 1) {
            if (this.selectedValues[0] === children[i].dataset.value) {
                return i;
            }
        }

        return -1;
    };

    Select.prototype.getSelectedOptions = function getSelectedOptions() {
        var children = this.optionsElem.querySelectorAll('li'),
            i = 0,
            j = 0,
            len = children.length,
            jLen = this.selectedValues.length,
            option = {},
            options = [];

        if (this.selectedValues.length === 0) {
            return [];
        }

        for (; j < jLen; j += 1) {
            for (; i < len; i += 1) {
                if (this.selectedValues[j] === children[i].dataset.value) {
                    option = {};
                    option.text = children[i].innerHTML;
                    option.value = children[i].dataset.value;
                    option.dataset = getDataset(children[i]);
                    options.push(option);
                }
            }
        }

        return options;
    };

    Select.prototype.removeHightlight = function removeHightlight() {
        var i = 0, len = this.optionsElems.length;

        for (i = 0; i < len; i += 1) {
            this.optionsElems[i].classList.remove('highlight');
        }
    };

    Select.prototype.setValue = function setValue(value) {
        var children, len, i = 0;

        assertRendered(this);
        children = this.optionsElem.querySelectorAll('li');
        len = children.length;

        if (len > 0) {
            for (; i < len; i += 1) {
                children[i].removeAttribute('aria-selected');
                if (value === children[i].dataset.value) {
                    this.textElem.innerHTML = children[i].innerHTML;
                    children[i].setAttribute('aria-selected', 'true');
                    children[i].classList.add('highlight');
                    this.selectedValues[0] = value;
                }
            }
            return;
        }

        throw new Error('selectbox.value.not.found');
    };

    Select.prototype.getValue = function getValue() {
        if (this.selectedValues.length === 0) {
            return null;
        }

        return this.selectedValues[0];
    };

    Select.prototype.collapse = function collapse() {
        this.optionsElem.style.display = 'none';
    };

    Select.prototype.destroy = function destroy() {
        var eb = this.eBus,
            name = this.name;

        this.trigger.removeEventListener('click', this.onClickFn, false);
        this.selectBoxWrapper.removeEventListener('click', this.onClickFn, false);
        this.selectBoxElem.removeEventListener('keydown', this.onKeyPressFn, false);
        this.selectBoxElem.removeEventListener('blur', this.onBlurFn, false);
        this.optionsElem.removeEventListener('click', this.onSelectFn, false);
        this.optionsElem.removeEventListener('scroll', this.onScrollFn, false);
        if (this.stopPropagation !== null) {
            this.selectBoxElem.removeEventListener(
                this.stopPropagation, this.stopPropagationFn, false
            );
        }
        this.selectContainer.innerHTML = '';
        initializeVariables(this);
        eb.publish('SelectBox:' + name + ':OnDestroy');
    };

    return Select;
});

define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/ConfigReader'
], function inlineMath(Helper, EventBus, Config) {
    'use strict';
    function isImgLoaded(img, callback) {
        var src = null, image = new Image();

        if (img.hasAttribute('src') === true) {
            src = img.getAttribute('src');
        }
        image.onerror = callback;
        image.onload = callback;
        image.src = src;
    }

    function doResize(action, onItems) {
        var clientRect = null, i = 0, item = null, fontSize = 0,
            computedStyle = null, img = null, height = 0;

        for (; i < onItems.length; i += 1) {
            item = onItems[i];
            item.style.height = null;
            img = item.querySelector(action.selector.join(', '));
            if (img === null) {
                continue;
            }
            if (img.hasAttribute('style') === true) {
                img.removeAttribute('style');
            }
            clientRect = img.getBoundingClientRect();
            computedStyle = window.getComputedStyle(item);
            fontSize = computedStyle['font-size'];
            fontSize = parseFloat('0' + fontSize, 0);
            height = (clientRect.height / action.fontSize) * fontSize;
            img.style.height = height + 'px';
        }
    }

    function doWaitImgLoadAndResize(action, onItems) {
        var i = 0, item = null, img = null, counter = 0, imgs = [];

        function doCount() {
            counter += 1;
            if (imgs.length === counter) {
                doResize(action, onItems);
            }
        }
        for (; i < onItems.length; i += 1) {
            item = onItems[i];
            img = item.querySelector(action.selector.join(', '));
            if (img === null) {
                continue;
            }
            imgs.push(img);
            isImgLoaded(img, doCount);
        }
    }

    function resizeInlineMath() {
        var items = null,
            action = Config.get('stripinResize');

        items = document.querySelectorAll(action.target);
        if (items !== null) {
            doWaitImgLoadAndResize(action, items);
        }
    }

    function removeImgAttribute(e) {
        if (e.hasAttribute('style') === true) {
            e.removeAttribute('style');
        }
    }

    function resizeEditedInlineMath(e) {
        var item = null, action = Config.get('stripinResize'), nodeId = null;

        if (e.hasAttribute('id') === true) {
            nodeId = e.getAttribute('id');
        }
        if (nodeId === null) {
            return;
        }
        item = document.querySelectorAll(action.target + ' div#' + nodeId);
        if (item === null) {
            return;
        }
        doWaitImgLoadAndResize(action, item);
    }

    EventBus.subscribe('Resize:OnLoad:Inline:Equation', resizeInlineMath);
    EventBus.subscribe('Resize:OnEdit:Inline:Equation', resizeEditedInlineMath);
    EventBus.subscribe('Resize:OnEdit:Loader:Equation', removeImgAttribute);
});

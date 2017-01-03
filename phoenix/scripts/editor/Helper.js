define([], function helperLoader() {
    var singleton = {};

    function initProperties(instance) {

    }

    function Helper() {
        this.win = null;
        initProperties(this);
    }

    Helper.prototype.capitalize = function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    Helper.prototype.isTextNode = function isTextNode(node) {
        return node.nodeType === window.Node.TEXT_NODE;
    };

    Helper.prototype.isElementNode = function isElementNode(node) {
        return node.nodeType === window.Node.ELEMENT_NODE;
    };

    Helper.prototype.isEmptyNode = function isEmptyNode(node) {
        if (node.textContent === '') {
            return true;
        }
        return false;
    };

    singleton.get = function get(win) {
        var helper = new Helper(win);

        return helper;
    };

    return singleton;
});

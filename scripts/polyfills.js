if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

if (!Element.matches) {
    (function(ElementPrototype) {
        var matches = function (selector) {
            var node = this,
                parent = node.parentNode || node.document,
                nodes = parent.querySelectorAll(selector),
                len = nodes.length, i = 0;

            for (; i < len; i += 1) {
                if (nodes[i] === node) {
                    return true;
                }
            }

            return false;
        };

        ElementPrototype.matches = ElementPrototype.matchesSelector ||
            ElementPrototype.mozMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            ElementPrototype.oMatchesSelector ||
            ElementPrototype.webkitMatchesSelector || matches;
    })(Element.prototype);
}

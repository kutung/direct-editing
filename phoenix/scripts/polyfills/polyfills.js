(function polyfills() {
    if (!Array.isArray) {
        Array.isArray = function isArrayPolyfill(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }

    if (!Element.matches) {
        (function elementMatchesPolyfill(ElementPrototype) {
            var matches = function matches(selector) {
                var instance = this,
                    parent = instance.parentNode || instance.document,
                    nodes = parent.querySelectorAll(selector),
                    len = nodes.length,
                    i = 0;

                for (; i < len; i += 1) {
                    if (nodes[i] === instance) {
                        return true;
                    }
                }

                return false;
            };

            ElementPrototype.matches = ElementPrototype.matchesSelector ||
                ElementPrototype.mozMatchesSelector || ElementPrototype.msMatchesSelector ||
                ElementPrototype.oMatchesSelector || ElementPrototype.webkitMatchesSelector ||
                matches;
        })(Element.prototype);
    }

    if (typeof Element.prototype.closest !== 'function') {
        Element.prototype.closest = function closest(selector) {
            var element = this;

            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }

                element = element.parentNode;
            }

            return null;
        };
    }
})();

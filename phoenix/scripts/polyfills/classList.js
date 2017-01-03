(function classListPolyfill() {
    var prototype = Array.prototype,
        push = prototype.push,
        splice = prototype.splice,
        join = prototype.join;

    if (typeof window.Element === 'undefined' || 'classList' in document.documentElement) {
        return;
    }

    function DOMTokenList(el) {
        var classes, i = 0;

        this.el = el;

        // The className needs to be trimmed and split on whitespace
        // to retrieve a list of classes.
        classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
        for (; i < classes.length; i += 1) {
            push.call(this, classes[i]);
        }
    }

    DOMTokenList.prototype = {
        'add': function add(token) {
            if (this.contains(token)) {
                return;
            }
            push.call(this, token);
            this.el.className = this.toString();
        },
        'contains': function contains(token) {
            return this.el.className.indexOf(token) !== -1;
        },
        'item': function item(index) {
            return this[index] || null;
        },
        'remove': function remove(token) {
            var i = 0;

            if (!this.contains(token)) {
                return;
            }
            for (; i < this.length; i += 1) {
                if (this[i] === token) {
                    break;
                }
            }
            splice.call(this, i, 1);
            this.el.className = this.toString();
        },
        'toString': function toString() {
            return join.call(this, ' ');
        },
        'toggle': function toggle(token) {
            if (this.contains(token) === false) {
                this.add(token);
            }
            else {
                this.remove(token);
            }

            return this.contains(token);
        }
    };

    window.DOMTokenList = DOMTokenList;

    function defineElementGetter(obj, prop, getter) {
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, {
                'get': getter
            });
        }
        else {
            obj.__defineGetter__(prop, getter);
        }
    }

    defineElementGetter(Element.prototype, 'classList', function classList() {
        return new DOMTokenList(this);
    });
})();

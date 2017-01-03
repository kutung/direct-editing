(function objectAssignPolyfill() {
    var to, i, nextSource, keysArray, nextIndex, len, nextKey, desc;

    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            'enumerable': false,
            'configurable': true,
            'writable': true,
            'value': function value(target) {
                'use strict';
                if (typeof target === 'undefined' || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }

                to = Object(target);
                for (i = 1; i < arguments.length; i += 1) {
                    nextSource = arguments[i];
                    if (typeof nextSource === 'undefined' || nextSource === null) {
                        continue;
                    }
                    nextSource = Object(nextSource);
                    keysArray = Object.keys(Object(nextSource));
                    len = keysArray.length;
                    for (nextIndex = 0; nextIndex < len; nextIndex += 1) {
                        nextKey = keysArray[nextIndex];
                        desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (typeof desc !== 'undefined' && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }
})();

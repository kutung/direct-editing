/*
    Taken from Gist https://gist.github.com/brettz9/4093766#file_html5_dataset.js
*/
(function datasetPolyfill() {
    var propDescriptor, i, that, HTML5_DOMStringMap, attrVal, attrName, propName, attribute,
        attributes, attsLength;

    if (!document.documentElement.dataset &&
        (!Object.getOwnPropertyDescriptor(Element.prototype, 'dataset') ||
        !Object.getOwnPropertyDescriptor(Element.prototype, 'dataset').get)
    ) {
        propDescriptor = {
            'enumerable': true,
            'get': function get() {
                'use strict';
                attributes = this.attributes;
                attsLength = attributes.length;
                function toUpperCase(n0) {
                    return n0.charAt(1).toUpperCase();
                }
                function getter() {
                    return this;
                }
                function setter(attName, value) {
                    return (typeof value !== 'undefined') ?
                        this.setAttribute(attName, value) :
                        this.removeAttribute(attName);
                }

                // Simulate DOMStringMap w/accessor support
                // Test setting accessor on normal object
                // Use a DOM object for IE8
                try {
                    ({}).__defineGetter__('test', function test() {});
                    HTML5_DOMStringMap = {};
                }
                catch (e1) {
                    HTML5_DOMStringMap = document.createElement('div');
                }
                for (i = 0; i < attsLength; i += 1) {
                    attribute = attributes[i];

                    // Fix: This test really should allow any XML Name without
                    //         colons (and non-uppercase for XHTML)
                    if (attribute && attribute.name && (/^data-\w[\w\-]*$/).test(attribute.name)) {
                        attrVal = attribute.value;
                        attrName = attribute.name;

                        // Change to CamelCase
                        propName = attrName.substr(5).replace(/-./g, toUpperCase);
                        try {
                            Object.defineProperty(HTML5_DOMStringMap, propName, {
                                'enumerable': this.enumerable,
                                'get': getter.bind(attrVal || ''),
                                'set': setter.bind(that, attrName)
                            });
                        }
                        catch (e2) {
                            HTML5_DOMStringMap[propName] = attrVal;
                        }
                    }
                }
                return HTML5_DOMStringMap;
            }
        };

        // FF enumerates over element's dataset, but not
        //   Element.prototype.dataset; IE9 iterates over both
        try {
            Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
        }
        catch (e) {
            propDescriptor.enumerable = false;
            Object.defineProperty(Element.prototype, 'dataset', propDescriptor);
        }
    }
})();

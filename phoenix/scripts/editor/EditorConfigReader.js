define(['scripts/editor/AbstractConfig'], function configLoader(
    AbstractConfig
) {
    'use strict';

    var Config = AbstractConfig,
        singleton = {},
        instance = null;

    function SelectorConfig() {}

    singleton.set = function set(abstractConfig) {
        Config = abstractConfig;
    };

    singleton.get = function get() {
        if (instance === null) {
            SelectorConfig.prototype = new Config();
            instance = new SelectorConfig();
        }

        return instance;
    };

    return singleton;
});

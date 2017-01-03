define(['scripts/Helper', 'customer/GeneralConfig', 'customer/Selectors', 'customer/ActorMapping',
    'customer/DirectEditing', 'customer/Sanitizer'], function ConfigurationLoader(
        Helper, GeneralConfig, Selectors, ActorMapping, DirectEditing, Sanitizer
) {
    var configurations = Object.assign(
            {}, GeneralConfig, Selectors, ActorMapping, DirectEditing, Sanitizer
        );

    configurations = Helper.deepFreeze(configurations);

    function Configuration() {}

    Configuration.get = function get(key) {
        if (Helper.objectHasKey(configurations, key) === false) {
            throw new Error('error.key.missing ' + key);
        }
        return configurations[key];
    };

    return Configuration;
});

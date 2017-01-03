define(['scripts/Helper', 'scripts/Util'],
function FeatureToggleLoader(Helper, Util) {
    var featureObj;

    function FeatureToggle(features) {
        if (Helper.isObject(features) === false) {
            throw new Error('feature.toggle.features.non.object');
        }
        featureObj = Util.deepFreeze(features);
    }
    FeatureToggle.isFeatureEnabled = function isFeatureEnabledFn(featureKey) {
        var toggle, findKey;

        if (Helper.isNull(featureObj) === true ||
            Helper.isObject(featureObj) === false
        ) {
            throw new Error('feature.toggle.object.empty');
        }
        findKey = function findKeyFn(obj, key) {
            var newKey, newObj,
                parts = key.split('.'),
                len = parts.length;

            newObj = obj[parts[0]];
            if(Helper.isObject(newObj) === true &&
                len > 1 && Helper.isUndefined(parts[1]) === false &&
                Helper.isString(parts[1]) === true
            ) {
                parts.splice(0, 1);
                newKey = parts.join('.');
                return findKey(newObj, newKey);
            }
            return newObj;
        };

        toggle = findKey(featureObj, featureKey);
        return toggle === true;
    };
    return FeatureToggle;
});

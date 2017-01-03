define(['scripts/Helper', 'scripts/RequestBuilder', 'scripts/EventBus'],
function configReaderLoader(Helper, RequestBuilder, EventBus) {
    var buildConfig = {},
        Route = {},
        Locale = {},
        configCounter = 0,
        isLoaded = false;

    function assertLoaded() {
        if (isLoaded === false) {
            throw new Error('ConfigReader not loaded.');
        }
    }

    function makeRequest(URL, successCallback, version) {
        var rB = new RequestBuilder(),
            request;

        rB.setUrl(URL + '?t=' + version);
        rB.setMethod('GET');
        rB.setSuccessCallback(successCallback);
        request = rB.build();
        request.send(request);
    }

    function reduceCounter(step) {
        configCounter -= step;
        if (configCounter === 0) {
            isLoaded = true;
            EventBus.publish('Configuration:Loaded');
        }
    }

    function updateConfig(res) {
        var response = JSON.parse(res);

        Object.assign(buildConfig, response);
        reduceCounter(1);
    }

    function updateRoutes(res) {
        var response = JSON.parse(res);

        Object.assign(Route, response);
        reduceCounter(1);
    }

    function updateLocale(res) {
        var response = JSON.parse(res);

        Object.assign(Locale, response);
        reduceCounter(1);
    }

    function ConfigReader(Win) {
        this.win = Win;
        Object.assign(buildConfig, this.win.Configuration);
    }

    function addCounter(step) {
        configCounter += step;
    }

    function getVersion(Config) {
        if (Config.Version) {
            return Config.Version;
        }

        return (new Date()).getTime();
    }

    ConfigReader.prototype.load = function load() {
        var Plugins = this.win.Configuration.Plugins,
            version = getVersion(this.win.Configuration),
            key, config, routes, locale;

        for (key in Plugins) {
            if (Plugins.hasOwnProperty(key) === true) {
                config = Plugins[key].Config;
                routes = Plugins[key].Routes;
                locale = Plugins[key].Locale;
                if (Helper.isUndefined(config) === false) {
                    addCounter(1);
                    makeRequest(config, updateConfig, version);
                }
                if (Helper.isUndefined(routes) === false) {
                    addCounter(1);
                    makeRequest(routes, updateRoutes, version);
                }
                if (Helper.isUndefined(locale) === false) {
                    addCounter(1);
                    makeRequest(locale, updateLocale, version);
                }
            }
        }
    };

    ConfigReader.getAll = function getAll() {
        assertLoaded();
        return buildConfig;
    };

    ConfigReader.getRoute = function getRoute(key) {
        assertLoaded();
        if (Helper.objectHasKey(Route, key) === false) {
            throw new Error('error.route.key.missing ' + key);
        }
        return Route[key];
    };

    ConfigReader.getLocale = function getLocale() {
        assertLoaded();
        return Locale;
    };

    ConfigReader.getLocaleByKey = function getLocaleByKey(key) {
        assertLoaded();
        if (Helper.objectHasKey(Locale, key) === true) {
            return Locale[key];
        }
        return null;
    };

    ConfigReader.get = function get(key) {
        assertLoaded();
        if (Helper.objectHasKey(buildConfig, key) === false) {
            throw new Error('error.configuration.key.missing');
        }
        return buildConfig[key];
    };

    return ConfigReader;
});

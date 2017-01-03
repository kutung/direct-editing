define(['scripts/EventBus', 'scripts/Util'], function ConnectivityLoader(EventBus, Util) {
    var netConnectivityOptions = {
            'interval': 0
        }, connectionAlive = true, timer;

    function Connectivity() {
    }

    function pingRequestUrl(url, timeoutInterval, callback) {
        var xmlHttp = new XMLHttpRequest(), isSuccess = false;

        xmlHttp.open('HEAD', url, true);
        xmlHttp.addEventListener('load', function loadFn() {
            isSuccess = true;
        }, false);
        xmlHttp.addEventListener('loadend', function loadEndFn() {
            callback(isSuccess);
        }, false);
        xmlHttp.send();
    }

    function getRand() {
        return Math.random();
    }

    function appendParamsToUrl(url) {
        var params = [];

        params.push(['rand', getRand()]);
        return Util.appendParamsToUrl(url, params);
    }

    function updateResponse(status) {
        connectionAlive = status;
        EventBus.publish('connectivity:status', connectionAlive);
    }

    function updateResponseIfStateChange(isSuccess) {
        if (connectionAlive !== isSuccess) {
            connectionAlive = isSuccess;
            EventBus.publish('connectivity:status', connectionAlive);
        }
    }

    Connectivity.getStatus = function getStatus() {
        return connectionAlive;
    };

    Connectivity.clearTimer = function clearIntervalFn() {
        clearInterval(timer);
    };

    Connectivity.check = function check(url, options) {
        var pingUrl;

        options = options || {};
        options = Object.assign({}, netConnectivityOptions, options);
        if (options.interval > 0) {
            timer = setInterval(function timeInterval() {
                pingUrl = appendParamsToUrl(url);
                pingRequestUrl(pingUrl, options.timeout, updateResponseIfStateChange);
            }, options.interval);
        }
        else {
            pingUrl = appendParamsToUrl(url);
            pingRequestUrl(pingUrl, options.timeout, updateResponse);
        }
    };

    return Connectivity;
});

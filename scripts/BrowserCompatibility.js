define(['scripts/ConfigReader', 'scripts/BrowserDetector'],
    function BrowserCompatibilityCheck(Config, BrowserDetector) {
        function initializeVariables(instance) {
            instance.win = null;
            instance.eBus = null;
            instance.browserCompatible = null;
        }

        function BrowserCompatibility(Win, EventBus) {
            initializeVariables(this);
            this.win = Win;
            this.eBus = EventBus;
            this.browserCompatible = Config.get('browserCompatible');
        }

        function checkBrowser(instance) {
            var name,
                validBrowsers = instance.browserCompatible,
                currentBroswer = instance.getBrowserInfo(),
                isSupport = false;

            if (currentBroswer === null) {
                return isSupport;
            }
            for (name in validBrowsers) {
                if (currentBroswer.name === name &&
                    Number(validBrowsers[name] <= Number(currentBroswer.version))
                ) {
                    isSupport = true;
                    break;
                }
            }
            return isSupport;
        }

        BrowserCompatibility.prototype.getBrowserInfo = function getBrowserInfo() {
            var userAgent, browserInfo;

            userAgent = this.win.navigator.userAgent;
            browserInfo = BrowserDetector.browserDetect(userAgent);
            return browserInfo;
        };

        BrowserCompatibility.prototype.verifyBrowser = function verifyBrowser() {
            return checkBrowser(this);
        };
        return BrowserCompatibility;
    });

define([], function browserDetection() {
    var clientStrings = [
        {'s': 'Windows 10', 'r': /(Windows 10.0|Windows NT 10.0)/},
        {'s': 'Windows 8.1', 'r': /(Windows 8.1|Windows NT 6.3)/},
        {'s': 'Windows 8', 'r': /(Windows 8|Windows NT 6.2)/},
        {'s': 'Windows 7', 'r': /(Windows 7|Windows NT 6.1)/},
        {'s': 'Windows Vista', 'r': /Windows NT 6.0/},
        {'s': 'Windows Server 2003', 'r': /Windows NT 5.2/},
        {'s': 'Windows XP', 'r': /(Windows NT 5.1|Windows XP)/},
        {'s': 'Android', 'r': /Android/},
        {'s': 'Open BSD', 'r': /OpenBSD/},
        {'s': 'Sun OS', 'r': /SunOS/},
        {'s': 'Linux', 'r': /(Linux|X11)/},
        {'s': 'iOS', 'r': /(iPhone|iPad|iPod)/},
        {'s': 'Mac OS X', 'r': /Mac OS X/},
        {'s': 'Mac OS', 'r': /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {'s': 'QNX', 'r': /QNX/},
        {'s': 'UNIX', 'r': /UNIX/},
        {'s': 'BeOS', 'r': /BeOS/},
        {'s': 'OS/2', 'r': /OS\/2/},
        {'s': 'Search Bot', 'r': /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];

    function BrowserDetector() {
    }

    function getFirstMatch(userAgent, regex) {
        var match = userAgent.match(regex);

        return (match && match.length > 1 && match[1]) || '';
    }

    BrowserDetector.browserDetect = function browserDetect(userAgent) {
        var result = null;

        if (/msie|trident/i.test(userAgent)) {
            result = {
                'name': 'InternetExplorer',
                'msie': true,
                'version': getFirstMatch(
                            userAgent, /(?:msie |rv:)(\d+(\.\d+)?)/i
                        )
            };
        }
        else if (/chrome.+? edge/i.test(userAgent)) {
            result = {
                'name': 'MicrosoftEdge',
                'msedge': true,
                'version': getFirstMatch(userAgent, /edge\/(\d+(\.\d+)?)/i)
            };
        }
        else if (/chrome|crios|crmo/i.test(userAgent)) {
            result = {
                'name': 'Chrome',
                'chrome': true,
                'version': getFirstMatch(
                            userAgent, /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i
                        )
            };
        }
        else if (/firefox|iceweasel/i.test(userAgent)) {
            result = {
                'name': 'Firefox',
                'firefox': true,
                'version': getFirstMatch(
                            userAgent, /(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i
                        )
            };
        }
        return result;
    };

    BrowserDetector.getDetails = function getDetailsFn(navigator) {
        var mobile, id, cs, details, osVersion,
            os = 'unknown',
            appVersion = navigator.appVersion,
            userAgent = navigator.userAgent,
            platform = navigator.platform,
            browser = this.browserDetect(userAgent);

        mobile = new RegExp('/Mobile|mini|Fennec|Android|iP(ad|od|hone)/').test(appVersion);
        for (id in clientStrings) {
            if (clientStrings.hasOwnProperty(id) === true) {
                cs = clientStrings[id];
                if (cs.r.test(userAgent)) {
                    os = cs.s;
                    break;
                }
            }
        }

        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
        }

        switch (os) {
        case 'Mac OS X':
            osVersion = /Mac OS X (10[\.\_\d]+)/.exec(userAgent)[1];
            break;

        case 'Android':
            osVersion = /Android ([\.\_\d]+)/.exec(userAgent)[1];
            break;

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(appVersion);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' +
                (osVersion[3] || 0);
            break;
        default:
            osVersion = 'unknown';
            break;
        }

        details = {
            'browserName': browser.name,
            'browserVersion': browser.version,
            'mobile': mobile,
            'platform': platform,
            'operatingSystem': os,
            'operatingSystemVersion': osVersion
        };
        return details;
    };
    return BrowserDetector;
});

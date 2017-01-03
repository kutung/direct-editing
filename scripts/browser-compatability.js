/*
    Used from: Bowser.js
    https://github.com/ded/bowser
*/
function browserDetect(ua) {
    var versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
    result,
    t = true;

    function getFirstMatch(regex) {
        var match = ua.match(regex);
        return (match && match.length > 1 && match[1]) || '';
    }

    function getSecondMatch(regex) {
        var match = ua.match(regex);
        return (match && match.length > 1 && match[2]) || '';
    }

    if (/msie|trident/i.test(ua)) {
        result = {
            name: 'Internet Explorer',
            msie: t,
            version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
        };
    }
    else if (/chrome.+? edge/i.test(ua)) {
        result = {
            name: 'Microsoft Edge',
            msedge: t,
            version: edgeVersion
        };
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
        result = {
            name: 'Chrome',
            chrome: t,
            version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
        };
    }
    else if (/firefox|iceweasel/i.test(ua)) {
        result = {
            name: 'Firefox',
            firefox: t,
            version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
        };
    }
    return result;
}
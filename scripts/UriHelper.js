define(['uri'], function UriHelperLoader(Uri) {
    function UriHelper() {

    }

    function createUrlObject(url) {
        return new Uri(url);
    }

    UriHelper.isUrl = function isUrl(url) {
        var uri = createUrlObject(url);

        if ((uri.is('absolute') === true) &&
            (uri.is('url') === true) &&
            (uri.is('name') === true)) {
            return true;
        }
        return false;
    };

    return UriHelper;
});

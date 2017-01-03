define([], function requestLoader() {
    var counter = 0,
        appendParamsToUrl = function appendParamsToUrl(url, params) {
            var i = 0,
                len = params.length,
                qs = [];

            if (params.length === 0) {
                return url;
            }

            for (; i < len; i += 1) {
                qs.push(params[i][0] + '=' + encodeURIComponent(params[i][1]));
            }

            url += ((url.indexOf('?') >= 0) ? '&' : '?');
            url += qs.join('&');
            return url;
        },
        request = function Request(url, data, async, options) {
            var i = 0, headers, len;

            this.options = options || {'method': 'GET'};
            this.eBus = null;
            this.startTime = null;
            this.url = url;
            this.req = new XMLHttpRequest();
            this.data = data || null;
            this.timeout = 0;
            this.async = async === true;
            this.timeoutCallback = function timeoutCallback() {};
            this.failureCallback = function failureCallback() {};
            this.successCallback = function successCallback() {};
            this.progressCallback = function progressCallback() {};
            this.afterCompleteCallback = function afterCompleteCallback() {};
            this.isSuccess = false;
            this.hasTimedOut = false;
            if (this.options.method === 'GET' && this.options.params &&
                this.options.params.length > 0) {
                url = appendParamsToUrl(this.url, this.options.params);
            }
            this.options.method = 'GET';
            //this.url += '?bust=' + (new Date()).getTime();
            this.req.open(this.options.method, this.url, this.async);
            headers = this.options.headers;
            len = headers.length;
            if (headers && len) {
                for (; i < len; i += 1) {
                    this.req.setRequestHeader(headers[i][0], headers[i][1]);
                }
            }
        },
        onReadyStateChange = function onReadyStateChange(xmlHttp, req) {
            var progressCallback = function progressCallback(event) {
                    req.progressCallback(event);
                },
                loadCallback = function loadCallback() {
                    var response;

                    req.isSuccess = true;
                    counter -= 1;
                    if (xmlHttp.status >= 200 && xmlHttp.status < 300) {
                        if (xmlHttp.responseType === 'document') {
                            response = xmlHttp.responseXML;
                        }
                        else {
                            response = xmlHttp.responseText;
                        }
                        req.successCallback(response, req, xmlHttp);
                        if (req.eBus !== null) {
                            req.eBus.publish('pc.ajax.success', {
                                'url': req.url,
                                'timeTaken': ((new Date()).getTime() - req.startTime),
                                'timeout': req.timeout,
                                'async': req.async,
                                'method': req.options.method,
                                'userAgent': navigator.userAgent,
                                'responseStatus': xmlHttp.status
                            });
                        }
                    }
                    else {
                        if (xmlHttp.responseType === 'document') {
                            response = xmlHttp.responseXML;
                        }
                        else {
                            response = xmlHttp.responseText;
                        }
                        req.failureCallback(response, req, xmlHttp);
                        if (req.eBus !== null) {
                            req.eBus.publish('pc.ajax.failure', {
                                'url': req.url,
                                'timeTaken': ((new Date()).getTime() - req.startTime),
                                'timeout': req.timeout,
                                'async': req.async,
                                'method': req.options.method,
                                'userAgent': navigator.userAgent,
                                'responseStatus': xmlHttp.status
                            });
                        }
                    }
                },
                completeCallback = function completeCallback() {
                    req.afterCompleteCallback(req.hasTimedOut, req.isSuccess);
                };

            xmlHttp.upload.addEventListener('progress', progressCallback, false);
            xmlHttp.addEventListener('load', loadCallback, false);
            xmlHttp.addEventListener('loadend', completeCallback, false);
            xmlHttp.addEventListener('error', function xhrError() {
                counter -= 1;
                if (req.eBus === null) {
                    return;
                }
                req.eBus.publish('pc.ajax.error', {
                    'url': req.url,
                    'timeTaken': ((new Date()).getTime() - req.startTime),
                    'timeout': req.timeout,
                    'method': req.options.method,
                    'userAgent': navigator.userAgent,
                    'async': req.async
                });
            }, false);
            xmlHttp.addEventListener('abort', function xhrAbort() {
                if (req.eBus === null) {
                    return;
                }
                req.eBus.publish('pc.ajax.abort', {
                    'url': req.url,
                    'timeTaken': ((new Date()).getTime() - req.startTime),
                    'timeout': req.timeout,
                    'method': req.options.method,
                    'userAgent': navigator.userAgent,
                    'async': req.async
                });
            }, false);
        };

    request.prototype.abort = function abort() {
        this.req.abort();
    };

    request.prototype.setEventBus = function setEventBus(eBus) {
        this.eBus = eBus;
    };

    request.prototype.clone = function clone() {
        var Request = request,
            req = new Request(this.url, this.data, this.async, this.options);

        req.setTimeoutCallback(this.timeoutCallback);
        req.setFailureCallback(this.failureCallback);
        req.setSuccessCallback(this.successCallback);
        req.setProgressCallback(this.progressCallback);
        req.setAfterCompleteCallback(this.afterCompleteCallback);
        req.setTimeout(this.timeout);
        req.setEventBus(this.eBus);

        return req;
    };

    request.prototype.parseResponseHeaders = function parseResponseHeaders() {
        var headersStr = this.req.getAllResponseHeaders(),
            headers = headersStr.split('\r\n'),
            i = 0,
            len = headers.length,
            headerCollection = [],
            header, value, index;

        for (; i < len; i += 1) {
            index = headers[i].indexOf(':');
            header = headers[i].substring(0, index);
            value = headers[i].substring(index + 1);
            if (header.length > 0) {
                headerCollection.push([header, value]);
            }
        }

        return headerCollection;
    };

    request.prototype.setResponseType = function setResponseType(type) {
        var responseTypes = ['arraybuffer', 'blob', 'document', 'json', 'text'];

        this.req.responseType = '';
        if (type !== null) {
            type = type.toLowerCase();
        }
        if (responseTypes.indexOf(type) !== -1) {
            this.req.responseType = type;
        }
    };

    request.prototype.withCredentials = function withCredentials(enabled) {
        if (enabled === true) {
            this.req.withCredentials = true;
        }
    };

    request.prototype.setTimeout = function setTimeout(timeout) {
        this.timeout = timeout;
    };

    request.prototype.send = function send() {
        var ontimeout;

        counter += 1;
        if (this.timeout > 0) {
            this.req.timeout = this.timeout;
            ontimeout = function timeout() {
                this.hasTimedOut = true;
                this.timeoutCallback();
            };
            this.req.ontimeout = ontimeout.bind(this);
        }

        if (this.async === true) {
            onReadyStateChange(this.req, this);
        }

        this.startTime = (new Date()).getTime();
        if (this.data === null) {
            this.req.send();
        }
        else {
            this.req.send(this.data);
        }
        if (this.async === false) {
            this.afterCompleteCallback();
        }
    };
    request.prototype.setAfterCompleteCallback = function setAfterCompleteCallback(callback) {
        this.afterCompleteCallback = callback;
    };
    request.prototype.setTimeoutCallback = function setTimeoutCallback(callback) {
        this.timeoutCallback = callback;
    };
    request.prototype.setProgressCallback = function setProgressCallback(callback) {
        this.progressCallback = callback;
    };
    request.prototype.setFailureCallback = function setFailureCallback(callback) {
        this.failureCallback = callback;
    };
    request.prototype.setSuccessCallback = function setSuccessCallback(callback) {
        this.successCallback = callback;
    };
    request.prototype.getResponseText = function getResponseText() {
        return this.req.responseText;
    };
    request.hasPendingRequests = function hasPendingRequestsFn() {
        return counter !== 0;
    };

    return request;
});

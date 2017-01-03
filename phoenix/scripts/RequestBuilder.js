define(['scripts/Request', 'scripts/Helper'], function requestBuilderLoader(Request, Helper) {
    function RequestBuilder() {
        this.headers = [];
        this.url = '';
        this.method = 'GET';
        this.params = [];
        this.data = null;
        this.eBus = null;
        this.timeout = 0;
        this.async = true;
        this.withCredentials = false;
        this.responseType = null;
        this.successCallback = function successCallback() {};
        this.failureCallback = function failureCallback() {};
        this.timeoutCallback = function timeoutCallback() {};
        this.progressCallback = function progressCallback() {};
    }

    RequestBuilder.prototype.setAsync = function setAsync(async) {
        this.async = async === true;
    };
    RequestBuilder.prototype.setHeader = function setHeader(name, value) {
        if (Helper.isString(name) === false || Helper.isString(value) === false) {
            throw new Error('Request Header name and value must be string');
        }
        if (Helper.isEmptyString(name) === true) {
            throw new Error('Request Header name cannot be a blank string');
        }
        this.headers.push([name, value]);
    };
    RequestBuilder.prototype.setUrl = function setUrl(url) {
        if (Helper.isString(url) === false) {
            throw new Error('Request Url must be a string');
        }
        this.url = url;
    };
    RequestBuilder.prototype.setMethod = function setMethod(method) {
        if (Helper.isString(method) === false) {
            throw new Error('Request Method must be a string');
        }
        method = method.toUpperCase();
        if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) === -1) {
            throw new Error('Request Method must be one of ["GET", "POST", "DELETE", "PUT"]');
        }
        this.method = method;
    };
    RequestBuilder.prototype.setParams = function setParams(params) {
        var key, value;

        if (Helper.isObject(params) === false) {
            throw new Error('Request params must be an object');
        }

        for (key in params) {
            if (params.hasOwnProperty(key) === true) {
                value = params[key];
                if (Helper.isNumber(value) || Helper.isString(value)) {
                    this.params.push([key, value]);
                }
                else {
                    throw new Error('Request Param values must be number or string');
                }
            }
        }
    };
    RequestBuilder.prototype.setData = function setData(data) {
        this.data = data;
    };

    RequestBuilder.prototype.setResponseType = function setResponseType(type) {
        this.responseType = type;
    };

    RequestBuilder.prototype.withCredentials = function withCredentials(enabled) {
        this.withCredentials = enabled;
    };

    RequestBuilder.prototype.setTimeout = function setTimeout(timeout) {
        if (Helper.isNumber(timeout) === false) {
            throw new Error('Request timeout must be a number in milliseconds');
        }
        this.timeout = timeout;
    };
    RequestBuilder.prototype.setSuccessCallback = function setSuccessCallback(callback) {
        if (Helper.isFunction(callback) === false) {
            throw new Error('Request Success Callback must be a function');
        }
        this.successCallback = callback;
    };
    RequestBuilder.prototype.setFailureCallback = function setFailureCallback(callback) {
        if (Helper.isFunction(callback) === false) {
            throw new Error('Request Success Callback must be a function');
        }
        this.failureCallback = callback;
    };
    RequestBuilder.prototype.setProgressCallback = function setProgressCallback(callback) {
        if (Helper.isFunction(callback) === false) {
            throw new Error('Request Progress Callback must be a function');
        }
        this.progressCallback = callback;
    };
    RequestBuilder.prototype.setTimeoutCallback = function setTimeoutCallback(callback) {
        if (Helper.isFunction(callback) === false) {
            throw new Error('Request Success Callback must be a function');
        }
        this.timeoutCallback = callback;
    };
    RequestBuilder.prototype.setEventBus = function setEventBus(eBus) {
        this.eBus = eBus;
    };
    RequestBuilder.prototype.build = function build() {
        var req, options = {};

        options.method = this.method;
        options.headers = this.headers;
        options.url = this.url;
        options.params = this.params;
        req = new Request(this.url, this.data, this.async, options);
        if (this.eBus !== null) {
            req.setEventBus(this.eBus);
        }
        req.withCredentials(this.withCredentials);
        req.setResponseType(this.responseType);
        req.setTimeout(this.timeout);
        req.setTimeoutCallback(this.timeoutCallback);
        req.setSuccessCallback(this.successCallback);
        req.setFailureCallback(this.failureCallback);
        req.setProgressCallback(this.progressCallback);

        return req;
    };

    return RequestBuilder;
});

define(['scripts/Helper'], function (Helper) {
    var requestQueue = function () {
            this.queue = [];
            this.executing = false;
            this.offline = false;
            this.currentRequest = null;
            this.tries = 0;
            this.maxRetries = 3;
        };

    requestQueue.prototype.send = function(request) {
        var executeNextInQueue = function () {
            var request;
            if (this.executing === true) {
                return;
            }
            if (this.queue.length === 0) {
                return;
            }
            request = this.currentRequest = this.queue.shift();
            request.setAfterCompleteCallback(afterComplete);
            this.executing = true;
            request.send();
        },
        afterComplete = function(isTimedOut, isSuccess) {
            var req;
            if (isTimedOut === true || isSuccess === false) {
                if (this.tries >= (this.maxRetries - 1)) {
                    throw new Error('queue.failed.after.max.retries');
                }
                req = this.currentRequest.clone();
                this.queue.unshift(req);
                this.tries += 1;
            }
            else {
                this.tries = 0;
            }

            this.executing = false;
            executeNextInQueue();
        };
        executeNextInQueue = executeNextInQueue.bind(this);
        afterComplete = afterComplete.bind(this);
        this.queue.push(request);
        executeNextInQueue();
    };
    requestQueue.prototype.getQueueCount = function() {
        return this.queue.length;
    };
    requestQueue.prototype.isOffline = function() {
        return this.offline;
    };
    requestQueue.prototype.onNetworkOffline = function(callback) {};
    requestQueue.prototype.onNetworkOnline = function(callback) {};

    return requestQueue;
});

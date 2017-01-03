define([], function serverLoggerLoader() {
    function ServerLogger(ServerLogEndPoint) {
        var instance = this;

        this.serverLogEndPoint = ServerLogEndPoint;
        this.serverLogData = [];

        setInterval(function sendToServer() {
            if (instance.serverLogData.length === 0) {
                return;
            }
            instance.pushToServer();
        }, 20 * 1000);
    }

    ServerLogger.prototype.pushToServer = function pushToServer() {
        var formData = new FormData();

        formData.append('json', JSON.stringify(this.serverLogData));
        navigator.sendBeacon(this.serverLogEndPoint, formData);
        this.serverLogData = [];
    };

    ServerLogger.prototype.pushData = function pushData(data) {
        this.serverLogData.push(data);
    };

    return ServerLogger;
});

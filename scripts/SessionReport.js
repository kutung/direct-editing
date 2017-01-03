define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/RequestBuilder', 'scripts/ConfigReader'
], function SessionReportLoader(
    Helper, EventBus, RequestBuilder, Config
) {
    function validateEndPoint() {
        if (Helper.isNull(this.generateReportEndPoint) === true) {
            throw new Error('error.generate.report.end.point');
        }
        if (Helper.isNull(this.downloadSessionReportEndPoint) === true) {
            throw new Error('error.get.report.end.point');
        }
    }

    function SessionReport(
        Win, Doc, Token, actor
    ) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        this.actor = actor;
        this.generateReportEndPoint = Config.getRoute('sessionReportEndPoint');
        this.downloadSessionReportEndPoint = Config.getRoute('downloadSessionReportEndPoint');
        validateEndPoint.call(this);
    }

    function createTargetFrame(instance) {
        var doc = instance.doc,
            iframeInstance = null,
            body = null;

        body = doc.querySelector('body');
        iframeInstance = body.querySelector('iframe.sessionReport');
        if (Helper.isObject(iframeInstance) === true) {
            body.removeChild(iframeInstance);
        }
        iframeInstance = doc.createElement('iframe');
        iframeInstance.classList.add('sessionReport');
        body.appendChild(iframeInstance);
    }

    function getReport(instance, downloadUrl, actor) {
        var target,
            token = instance.token,
            downloadSessionReportEndPoint = instance.downloadSessionReportEndPoint,
            doc = instance.doc;

        target = doc.querySelector('iframe.sessionReport');
        target.src = downloadSessionReportEndPoint + '?path=' + downloadUrl + '&token=' + token + '&actor=' + actor;
        target.target = '_blank';
        EventBus.publish('Loader:hide');
    }

    SessionReport.prototype.generateReport = function generateReport() {
        var request,
            parsedData,
            token = this.token,
            generateReportEndPoint = this.generateReportEndPoint,
            requestBuilder = new RequestBuilder();

        requestBuilder.setUrl(generateReportEndPoint + '/' + token + '/' + this.actor);
        requestBuilder.setMethod('GET');
        createTargetFrame(this);
        EventBus.publish('Loader:show', 9999999);
        requestBuilder.setSuccessCallback(function SuccessCallback(response) {
            parsedData = JSON.parse(response);
            getReport(this, parsedData.data.path, this.actor);
        }.bind(this));
        requestBuilder.setFailureCallback(function FailureCallback(response) {
            alert(Config.getLocaleByKey('session.report.not.found'));
            console.log('session report failed ', response);
            EventBus.publish('Loader:hide');
        });
        request = requestBuilder.build();
        request.send();
    };

    return SessionReport;
});

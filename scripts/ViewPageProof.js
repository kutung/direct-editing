define([
    'scripts/Helper', 'scripts/EventBus'
], function ViewPageProofLoader(
    Helper, EventBus
) {
    function validateEndPoint(EndPoints) {
        if (Helper.isObject(EndPoints) === false) {
            throw new Error('error.view_proof_end_points_missing');
        }
        if (Helper.isUndefined(EndPoints.downloadPageProofEndPoint) === true) {
            throw new Error('error.download_page_proof_end_point');
        }
    }

    function ViewPageProof(
        Win, Doc, Token, EndPoints
    ) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        validateEndPoint(EndPoints);
        this.downloadPageProofEndPoint = EndPoints.downloadPageProofEndPoint;
    }

    function createTargetFrame(instance) {
        var doc = instance.doc,
            iframeInstance = null,
            body = null;

        body = doc.querySelector('body');
        iframeInstance = body.querySelector('iframe.sessionReport');

        if (Helper.isNull(iframeInstance) === true) {
            iframeInstance = doc.createElement('iframe');
            iframeInstance.classList.add('sessionReport');
        }

        body.appendChild(iframeInstance);
    }

    function getReport(instance, downloadUrl, userType) {
        var target,
            token = instance.token,
            doc = instance.doc;

        target = doc.querySelector('iframe.sessionReport');
        target.src = downloadUrl + '/' + token + '/' + userType;
        target.target = '_blank';
        EventBus.publish('Loader:hide');
    }

    ViewPageProof.prototype.generateReport = function generateReport(userType) {
        createTargetFrame(this);
        EventBus.publish('Loader:show', 9999);
        getReport(this, this.downloadPageProofEndPoint, userType);
    };

    return ViewPageProof;
});

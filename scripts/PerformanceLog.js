define(['scripts/RequestBuilder', 'scripts/ConfigReader', 'scripts/Helper'],
function PerformanceLogLoader(RequestBuilder, Config, Helper) {
    var performanceLogDetails = {
        'InterfaceLoad': 'TextContentServerLoad',
        'LandingLoad': 'LandingPageClientLoad'
    };

    function PerformanceLog(Token, Actor) {
        this.token = Token;
        this.actor = Actor;
    }

    function saveSuccess() {
        console.log('performance logging updated.');
    }

    function saveFailure() {
        console.log('performance logging failed.');
    }

    function makeRequest(saveData, instance) {
        var request, rB = new RequestBuilder(),
            formData = new FormData();

        formData.append('json', JSON.stringify(saveData));
        rB.setUrl(Config.getRoute('performaceLogEndPoint'));
        rB.setMethod('POST');
        rB.setData(formData);
        rB.setSuccessCallback(saveSuccess.bind(instance));
        rB.setFailureCallback(saveFailure.bind(instance));
        request = rB.build();
        request.send();
    }

    function getType(type) {
        if (Helper.isUndefined(type) === true ||
            Helper.isUndefined(performanceLogDetails[type]) === true) {
            return '';
        }

        return performanceLogDetails[type];
    }

    PerformanceLog.prototype.pushLoadTimeline = function pushLoadTimeline(
        action, startTime, startDate, type
    ) {
        var currentTime, saveDiffTime,
            saveObj = {},
            loadData = {};

        currentTime = new Date().getTime();
        saveDiffTime = (currentTime - startTime) / 1000;
        saveObj.optToken = this.token;
        saveObj.actor = this.actor.toUpperCase();
        loadData.action = action;
        loadData.startTime = startDate;
        loadData.seconds = saveDiffTime;
        loadData.type = getType(type);
        saveObj.data = [];
        saveObj.data.push(loadData);
        makeRequest(saveObj, this);
    };
    return PerformanceLog;
});

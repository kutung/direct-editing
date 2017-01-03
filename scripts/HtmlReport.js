define([
    'scripts/Helper', 'scripts/EventBus', 'scripts/RequestBuilder',
    'scripts/ConfigReader', 'scripts/Dialog'
], function HtmlReportLoader(
    Helper, EventBus, RequestBuilder, Config, DialogPopUp
) {
    function validateEndPoint() {
        if (Helper.isNull(this.generateHtmlReportEndPoint) === true) {
            throw new Error('error.generate.html.report.end.point');
        }
        if (Helper.isNull(this.downloadHtmlReportEndPoint) === true) {
            throw new Error('error.download.html.report.end.point');
        }
    }

    function HtmlReport(
        Win, Doc, Token
    ) {
        this.win = Win;
        this.doc = Doc;
        this.token = Token;
        this.generateHtmlReportEndPoint = Config.getRoute('generateHtmlReportEndPoint');
        this.downloadHtmlReportEndPoint = Config.getRoute('downloadHtmlReportEndPoint');
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

    function getReport(instance, downloadUrl) {
        var target,
            downloadHtmlReportEndPoint = instance.downloadHtmlReportEndPoint;

        target = document.querySelector('iframe.sessionReport');
        target.src = downloadHtmlReportEndPoint + '?path=' + downloadUrl;
        target.target = '_blank';
        EventBus.publish('Loader:hide');
    }

    function generateReport(role, instance) {
        var request,
            parsedData,
            token = instance.token,
            generateHtmlReportEndPoint = instance.generateHtmlReportEndPoint,
            requestBuilder = new RequestBuilder();

        EventBus.publish('Loader:show', 999999);
        requestBuilder.setUrl(generateHtmlReportEndPoint + '/' + token + '/' + role);
        requestBuilder.setMethod('GET');
        createTargetFrame(instance);
        requestBuilder.setSuccessCallback(function successCallback(response) {
            parsedData = JSON.parse(response);
            getReport(instance, parsedData.data.path);
        }.bind(instance));
        requestBuilder.setFailureCallback(function failureCallback(response) {
            alert(Config.getLocaleByKey('html.report.not.found'));
            console.log('session report failed ', response);
            EventBus.publish('Loader:hide');
        });
        request = requestBuilder.build();
        request.send();
    }

    function buildGenerateReportTemplate(instance, workflows, doc, elem, i) {
        var role, child, para;

        role = workflows[i].role;
        child = doc.createElement('button');
        para = doc.createElement('p');
        child.className = role.toLowerCase() + 'Proofing';
        child.innerHTML = workflows[i].description;

        child.addEventListener('click', function click(role) {
            EventBus.publish(role + 'Proofing:Trigger');
            generateReport(role, instance);
        }.bind(instance, role), false);

        para.appendChild(child);
        elem.appendChild(para);
        return elem;
    }

    function buildSessionReportTemplate(instance, elem, doc) {
        var child, sessionReportBtn = 'sessionPopBtn', para;

        child = doc.createElement('button');
        child.className = sessionReportBtn;
        child.innerHTML = Config.getLocaleByKey('session.report.text');
        para = doc.createElement('p');
        child.addEventListener('click', function sessionReportClick() {
            EventBus.publish('Download:SessionReport', false);
        });
        para.appendChild(child);
        elem.appendChild(para);
        return elem;
    }

    function getContent(metaData, instance) {
        var doc = instance.doc, elem = doc.createElement('div'),
            workflows = metaData.htmlReportDetails, i = 0, len = workflows.length,
            child = null;

        elem.className = 'html-reports-link';

        for (; i < len; i += 1) {
            elem = buildGenerateReportTemplate(instance, workflows, doc, elem, i);
        }

        if (metaData.sessionReport === true) {
            elem = buildSessionReportTemplate(instance, elem, doc);
        }

        return elem;
    }

    function getFooter(instance) {
        var closeBtn,
            doc = instance.doc;

        closeBtn = doc.createElement('input');
        closeBtn.setAttribute('type', 'button');
        closeBtn.setAttribute('value', 'Close');
        closeBtn.setAttribute('class', 'closeBtn');
        return closeBtn;
    }

    function renderDialog(instance, metaData) {
        var content = getContent(metaData, instance), dialog, locale = Config.getLocale();

        dialog = new DialogPopUp(instance.doc, instance.win, EventBus, locale);
        dialog.setName('reports');
        dialog.setTitle('Confirmation');
        dialog.setModal(true);
        dialog.setWidth(370);
        dialog.setContent(content);
        dialog.showClose();
        dialog.renderComponentStyle();
        dialog.render();
    }

    HtmlReport.prototype.render = function render(metaData) {
        renderDialog(this, metaData);
    };

    return HtmlReport;
});

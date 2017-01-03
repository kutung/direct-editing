define(['scripts/Helper', 'scripts/ServerLogger', 'scripts/ConfigReader',
    'scripts/Util', 'scripts/BrowserDetector'
], function actionLoggerLoader(
    Helper, ServerLogger, Config, Util, BrowserDetector
) {
    function ActionLogger(win, eventBus, Token, CurrentActor) {
        this.win = win;
        this.eventBus = eventBus;
        this.token = Token;
        this.actor = CurrentActor;
        this.serverLogger = new ServerLogger(Config.getRoute('actionLogEndPoint'));
        this.eventBus.subscribe('ActionLog:save', this.save, this);
        this.eventBus.subscribe('ActionLog:push', this.pushToServer, this);
        this.eventBus.subscribe('ActionLog:action', this.actionLog, this);
    }

    function validateNode(node) {
        if (Helper.isUndefined(node) === true ||
            Helper.isNull(node) === true
        ) {
            return false;
        }
        return true;
    }

    function getHtml(instance, node) {
        if (node instanceof instance.win.DocumentFragment === true) {
            node = node.firstChild;
            return node.outerHTML;
        }
        if (node instanceof instance.win.HTMLElement === true) {
            return node.outerHTML;
        }
        return null;
    }

    ActionLogger.prototype.save = function save(data, extraDetails) {
        var date = new Date();

        extraDetails = extraDetails || false;
        if (Helper.isObject(data) === false) {
            throw new Error('actionlog.data.error');
        }
        data.token = this.token;
        data.actor = this.actor;
        data.codeVersion = Config.get('codeVersion');
        data.timestamp = date.getTime();
        if (extraDetails === true) {
            data.browserDetail = BrowserDetector.getDetails(this.win.navigator);
            data.window = {
                'currentHeight': this.win.innerHeight,
                'currentWidth': this.win.innerWidth,
                'height': this.win.screen.height,
                'width': this.win.screen.width
            };
        }
        this.serverLogger.pushData(data);
    };

    ActionLogger.prototype.pushToServer = function pushToServer() {
        this.serverLogger.pushToServer();
    };

    ActionLogger.prototype.actionLog = function actionLog(
        action, content, originalNode, replaceNode, parentNode
    ) {
        var data = content || {};

        data.action = action;
        if (validateNode(originalNode) === true) {
            data.fragment = {};
            data.fragment.before = getHtml(this, originalNode);
        }
        if (validateNode(replaceNode) === true) {
            data.fragment.after = getHtml(this, replaceNode);
        }
        if (validateNode(parentNode) === true) {
            data.fragment.parentNodeName = parentNode.nodeName;
            data.fragment.parentAttribute = Util.getAllAtributes(parentNode);
        }
        this.save(data, true);
    };

    return ActionLogger;
});

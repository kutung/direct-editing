define(['scripts/Helper', 'scripts/ServerLogger'],
function serverLoggerLoader(Helper, ServerLogger) {
    var assignedLevel, configuredLevel, serverLogger, levels,
        isConfigured = false;

    function initializeVariables() {
        configuredLevel = null;
        levels = {
            'DEBUG': 1,
            'INFO': 2,
            'WARN': 3,
            'ERROR': 4,
            'SILENT': 5
        };
    }

    function Logger(Win, Doc) {
        this.win = Win;
        this.doc = Doc;
        initializeVariables();
    }

    function setLevel(level) {
        if (Helper.isEmptyString(level) === true) {
            throw new Error('log.level.empty');
        }
        configuredLevel = levels[level.toUpperCase()];
    }

    function setPersistOnServer(isPersist, serverLogEndPoint) {
        if (Helper.isEmptyString(isPersist) === true) {
            throw new Error('log.persist.on.server.empty');
        }
        if (
            isPersist === true &&
            Helper.isEmptyString(serverLogEndPoint) === true
        ) {
            throw new Error('log.server.endpoint.empty');
        }
        serverLogger = new ServerLogger(serverLogEndPoint);
    }

    function assertConfigured() {
        if (isConfigured === false) {
            throw new Error('logger.not.configured');
        }
    }

    function printLog(msg, level) {
        if (level < configuredLevel) {
            return;
        }
        if (level === levels.DEBUG) {
            console.debug(msg);
        }
        else if (level === levels.INFO) {
            console.info(msg);
        }
        else if (level === levels.ERROR) {
            console.error(msg);
        }
        else if (level === levels.WARN) {
            console.warn(msg);
        }
        else {
            console.log(msg);
        }
    }

    Logger.prototype.configure = function configure(level, isPersistOnServer, serverLogEndPoint) {
        if (Helper.isUndefined(this.win.console) === true) {
            setLevel('silent');
        }
        else {
            assignedLevel = level;
            setLevel(level);
        }
        setPersistOnServer(isPersistOnServer, serverLogEndPoint);
        isConfigured = true;
    };

    Logger.info = function info(msg, doesPersistToServer) {
        assertConfigured();
        if (doesPersistToServer === true) {
            serverLogger.pushData(msg);
            return;
        }
        printLog(msg, levels.INFO);
    };

    Logger.warn = function warn(msg, doesPersistToServer) {
        assertConfigured();
        if (doesPersistToServer === true) {
            serverLogger.pushData(msg);
            return;
        }
        printLog(msg, levels.WARN);
    };

    Logger.error = function error(msg, doesPersistToServer) {
        assertConfigured();
        if (doesPersistToServer === true) {
            serverLogger.pushData(msg);
            return;
        }
        printLog(msg, levels.ERROR);
    };

    Logger.debug = function debug(msg, doesPersistToServer) {
        assertConfigured();
        if (doesPersistToServer === true) {
            serverLogger.pushData(msg);
            return;
        }
        printLog(msg, levels.DEBUG);
    };

    Logger.pause = function pause(msg) {
        assertConfigured();
        setLevel('silent');
    };

    Logger.resume = function resume(msg) {
        assertConfigured();
        setLevel(assignedLevel);
    };

    window.logger = Logger;

    return Logger;
});

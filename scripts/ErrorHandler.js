define([
    'scripts/ConfigReader', 'scripts/Helper', 'scripts/EventBus', 'scripts/Logger'
], function ErrorHandlerLoader(
    Config, Helper, EventBus, Logger
) {
    var errorCodes = {
        'FatalException': 500,
        'LogOnlyException': 515,
        'ForceReloadException': 520
    };

    function ErrorHandler(Win, Doc) {
        this.win = Win;
        this.doc = Doc;
    }

    ErrorHandler.getCode = function getCodeFn(name) {
        return errorCodes[name];
    };

    ErrorHandler.prototype.handleErrors = function handleErrors(errorData) {
        var error, message, errorMessage,
            log = {};

        if (Helper.isUndefined(errorData.error) === false) {
            error = errorData.error.message;
        }
        else if (Helper.isUndefined(errorData.message) === false) {
            error = errorData.message;
        }
        message = Config.getLocaleByKey(error);
        if (error.indexOf('Proof.Error.') > -1) {
            EventBus.publish('pagination:proofErrorHandler', errorData);
            return;
        }
        if (message !== null) {
            EventBus.publish('alert:show', message);
            return;
        }
        if (errorData.error.stack.indexOf('pagination') > -1) {
            EventBus.publish('pagination:proofErrorHandler', errorData);
            return;
        }
        errorMessage = 'Column: ' + errorData.colno + ', ';
        errorMessage += 'lineno: ' + errorData.lineno + ', ';
        errorMessage += 'filename: ' + errorData.filename + ', ';
        errorMessage += 'message: ' + errorData.error;
        log.message = errorMessage;
        log.type = 'error';
        Logger.error(log, true);
    };

    return ErrorHandler;
});

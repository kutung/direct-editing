define([
    'scripts/Helper', 'scripts/EventBus'
],
function QueryBagLoader(Helper, EventBus) {
    var queryBag = [];

    function updateBag(queryName, data) {
        this.put(queryName, data.id, data.position_id, this.queryTabPanel.activeTabId);
        EventBus.publish('QueryBag:Update');
    }

    function QueryBag(Win, Doc, QueryTabPanel) {
        this.win = Win;
        this.doc = Doc;
        this.queryTabPanel = QueryTabPanel;
        EventBus.subscribe('QueryBag:Add', updateBag, this);
        EventBus.subscribe('QueryBag:SetReply', this.setReply, this);
        EventBus.subscribe('QueryBag:Remove', this.remove, this);
    }

    QueryBag.prototype.getAll = function getAll() {
        return queryBag;
    };

    QueryBag.prototype.getFirstUnAnsweredQuery = function getFirstUnAnsweredQuery() {
        var key;

        for (key in queryBag) {
            if (Helper.isUndefined(queryBag[key].reply) === true ||
                Helper.isEmptyString(queryBag[key].reply) === true
            ) {
                return queryBag[key];
            }
        }

        return null;
    };

    QueryBag.prototype.getUnAnswerQueryCount = function getUnAnswerQueryCount() {
        var key,
            unAnswerQueryCount = 0;

        for (key in queryBag) {
            if (Helper.isUndefined(queryBag[key].reply) === true ||
                Helper.isEmptyString(queryBag[key].reply) === true
            ) {
                unAnswerQueryCount += 1;
            }
        }
        return unAnswerQueryCount;
    };

    QueryBag.prototype.put = function put(
        queryName, serverID, htmlID, tabID, reply
    ) {
        var temp = {};

        temp.queryName = queryName;
        temp.serverID = serverID;
        temp.htmlID = htmlID;
        temp.tabID = tabID;
        temp.reply = reply;
        queryBag.push(temp);
    };

    function getFromBag(queryName) {
        var key;

        for (key in queryBag) {
            if (queryBag[key].queryName === queryName) {
                return queryBag[key];
            }
        }
        return null;
    }

    QueryBag.prototype.remove = function remove(queryName) {
        var key;

        if (Helper.isEmptyString(queryName) === true) {
            throw new Error('query.bag.empty.query.name');
        }
        for (key in queryBag) {
            if (queryBag.hasOwnProperty(key) === true &&
                queryBag[key].queryName === queryName
            ) {
                delete queryBag[key];
                queryBag.splice(key, 1);
                EventBus.publish('QueryBag:Update');
                return;
            }
        }
    };

    QueryBag.prototype.getHtmlIDForQuery = function getHtmlIDForQuery(queryName) {
        var qBag = getFromBag(queryName);

        if (Helper.isObject(qBag) === false) {
            return null;
        }
        return qBag.htmlID;
    };

    QueryBag.prototype.getTabIDForQuery = function getTabIDForQuery(queryName) {
        var qBag = getFromBag(queryName);

        if (Helper.isObject(qBag) === false) {
            return null;
        }
        return qBag.tabID;
    };

    QueryBag.prototype.getServerIDForQuery = function getServerIDForQuery(
        queryName
    ) {
        var qBag = getFromBag(queryName);

        if (Helper.isObject(qBag) === false) {
            throw new Error('query.bag.mapping.not.found');
        }
        return qBag.serverID;
    };

    QueryBag.prototype.getQueryNameForTab = function getQueryNameForTab(tabID) {
        var key;

        for (key in queryBag) {
            if (queryBag.hasOwnProperty(key) === true &&
                queryBag[key].tabID === tabID
            ) {
                return queryBag[key];
            }
        }
        return null;
    };

    QueryBag.prototype.setQueryName = function setQueryNameFn(tabId, name) {
        var key;

        if (Helper.isEmptyString(name) === true) {
            throw new Error('query.bag.name.not.string');
        }
        for (key in queryBag) {
            if (queryBag.hasOwnProperty(key) === true &&
                queryBag[key].tabID === tabId
            ) {
                queryBag[key].queryName = name;
                return true;
            }
        }
        return false;
    };

    QueryBag.prototype.setReply = function setReplyFn(queryName, reply) {
        var key;

        if (Helper.isEmptyString(reply) === true) {
            throw new Error('query.bag.reply.not.string');
        }
        for (key in queryBag) {
            if (queryBag.hasOwnProperty(key) === true &&
                queryBag[key].queryName === queryName
            ) {
                queryBag[key].reply = reply;
                return true;
            }
        }
        return false;
    };

    return QueryBag;
});

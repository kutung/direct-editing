define([], function TreeModelLoader() {
    'use strict';

    function initializeVariables(instance) {
        instance.callBack = null;
        instance.tree = {};
        instance.nodes = {};
        instance.treeId = 0;
        instance.onChangeCallbacks = [];
    }

    function randId() {
        var text = '', i = 0,
            possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (i = 0; i < 10; i += 1) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function TreeModel() {
        initializeVariables(this);
    }

    TreeModel.ROOT_NODE = 100;

    TreeModel.prototype.subscribe = function subscribe(type, callback) {
        if (type !== 'change') {
            return;
        }
        if (this.onChangeCallbacks.indexOf(callback) === -1) {
            this.onChangeCallbacks.push(callback);
        }
    };

    TreeModel.prototype.unsubscribe = function unsubscribe(type, callback) {
        var index = -1;

        if (type !== 'change') {
            return;
        }
        index = this.onChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onChangeCallbacks.splice(index, 1);
        }
    };

    TreeModel.prototype.findNodeBy = function findNodeBy(predicate) {
        var keys = Object.keys(this.nodes), len = keys.length, i = 0;

        for (; i < len; i += 1) {
            if (predicate(this.nodes[keys[i]]) === true) {
                return this.nodes[keys[i]];
            }
        }

        return null;
    };

    TreeModel.prototype.addNode = function addNode(parentId, child, data) {
        var treeKey = 'node-' + randId(),
            node = {
                'node': child,
                'child': {},
                'key': treeKey,
                'data': data
            }, hasChildren = false;

        if (parentId === TreeModel.ROOT_NODE) {
            this.tree[treeKey] = node;
        }
        else if (this.nodes.hasOwnProperty(parentId) === true) {
            this.nodes[parentId].child[treeKey] = node;
            hasChildren = true;
        }
        else {
            throw new Error('invalid.parent.node');
        }
        this.nodes[treeKey] = node;
        this.onChangeCallbacks.forEach(function eachCallback(callback) {
            var nodeClone = JSON.parse(JSON.stringify(node)),
                fn = function onChangeFn() {
                    callback(nodeClone, hasChildren, parentId);
                };

            setTimeout(fn, 0);
        });

        return treeKey;
    };

    TreeModel.prototype.forEach = function forEach(callback, parentNodeId, tree) {
        var key, children = [], hasChildren = false, data;

        if (typeof tree === 'undefined') {
            tree = this.tree;
        }
        for (key in tree) {
            if (tree.hasOwnProperty(key) === true) {
                children = Object.getOwnPropertyNames(tree[key].child);
                hasChildren = children.length > 0;
                data = {
                    'node': tree[key].node,
                    'key': tree[key].key,
                    'data': tree[key].data
                };
                callback(data, hasChildren, parentNodeId);
                if (hasChildren === true) {
                    this.forEach(callback, key, tree[key].child);
                }
            }
        }
    };

    TreeModel.prototype.destroy = function destroy() {
        initializeVariables(this);
    };

    return TreeModel;
});

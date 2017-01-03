define(['scripts/Helper', 'scripts/Util'],
    function dataChangeAttributeHandlerLoad(Helper, Util) {
        var eb = null,
            uniqueAttribute = Util.getAttributeSelector('uniqueId');

        function DataChangeAttributeHandler(EventBus) {
            eb = EventBus;
            eb.subscribe('dataChange:applyAttribute', this.applyAttribute);
            eb.subscribe('dataChange:removeChange', this.removeChange);
            eb.subscribe('dataChange:removeAllChange', this.removeAllChange);
        }

        DataChangeAttributeHandler.applyAttribute = function applyAttributeFn(node) {
            var changes = 0,
                dataset;

            dataset = node.dataset;
            if (Helper.isUndefined(dataset.changes) === true) {
                changes = 0;
            }
            else {
                changes = parseInt(dataset.changes, 10);
            }
            changes += 1;
            dataset.changes = changes;
            eb.publish('Editor:HasUnsavedChanges');
        };

        DataChangeAttributeHandler.hasChanges = function hasChangesFn(container) {
            var nodes = container.querySelectorAll('[data-changes]'),
                len = nodes.length;

            return len > 0;
        };

        DataChangeAttributeHandler.removeChange = function removeChangeFn(node) {
            node.removeAttribute('data-changes');
        };

        DataChangeAttributeHandler.getChanges = function getChangesFn(container) {
            return container.querySelectorAll('[data-changes]');
        };

        DataChangeAttributeHandler.removeAllChange = function removeAllChangeFn(container) {
            var i = 0,
                nodes = this.getChanges(container),
                len = nodes.length;

            for (; i < len; i += 1) {
                this.removeChange(nodes[i]);
            }
        };

        DataChangeAttributeHandler.change = function changeFn(currentNode) {
            var parentNode,
                selector = 'div[' + uniqueAttribute + ']';

            parentNode = currentNode.closest(selector);
            if (Helper.isNull(parentNode) === true) {
                throw new Error('change.attributes.parentNode.null');
            }
            this.applyAttribute(parentNode);
        };

        return DataChangeAttributeHandler;
    });

define(['scripts/editor/EditorConfigReader', 'scripts/Helper', 'scripts/EventBus'
], function ActionCompleteHandlerLoader(EditorConfigReader, Helper, EventBus) {
    'use strict';
    var timer, prevNode,
        delay = 300;

    function ActionCompleteHandler() {}

    ActionCompleteHandler.actionComplete = function actionCompleteFn(node) {
        var editorConfigReader = EditorConfigReader.get(),
            uniqueSelector = editorConfigReader.getUniqueAttributeSelector(),
            publish = function publishFn(parentNode) {
                var selector, attributeSelector;

                if (uniqueSelector.indexOf('data') === -1) {
                    selector = parentNode.attributes[uniqueSelector].value;
                }
                else {
                    selector = parentNode.dataset[uniqueSelector];
                }
                attributeSelector = '[' + uniqueSelector + '="' + selector + '"]';
                EventBus.publish(
                    'DirectEditing:Action:Complete', attributeSelector
                );
            };

        if (prevNode === node) {
            clearTimeout(timer);
        }
        timer = setTimeout(function timerFn() {
            publish(node);
        }, delay);
        prevNode = node;
    };

    return ActionCompleteHandler;
});

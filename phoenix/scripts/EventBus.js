define(['scripts/radio'], function radio(radioJS) {
    var eventBus = {
        'publish': function publish(queue, data) {
            var eb, args;

            if (arguments.length < 1) {
                throw new Error('publish.requires.queue');
            }
            args = Array.prototype.slice.call(arguments);
            queue = args[0];
            data = args.slice(1);
            eb = radioJS(queue);
            eb.broadcast.apply(eb, data);
        },
        'subscribe': function subscribe(queue, callback, context) {
            radioJS(queue).subscribe([callback, context]);
        },
        'unsubscribe': function unsubscribe(queue, callback) {
            radioJS(queue).unsubscribe(callback);
        }
    };

    return eventBus;
});

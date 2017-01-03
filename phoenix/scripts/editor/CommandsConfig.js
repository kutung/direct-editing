define([], function commmandsConfigLoader() {
    'use strict';
    var singleton = {};

    function CommandsConfig() {
        var obj = this;

        Object.defineProperty(obj, 'commands', {
            'value': {
                '[ctrl][b]': 'bold',
                '[ctrl][i]': 'italic',
                '[backspace]': 'delete',
                '[delete]': 'delete',
                '[default]': 'insert',
                '[ctrl][z]': 'undo',
                '[ctrl][shift][z]': 'redo',
                '[ctrl][v]': 'paste',
                '[ctrl][c]': 'copy',
                '[ctrl][alt][c]': 'instruct',
                '[ctrl][=]': 'sub',
                '[ctrl][shift][=]': 'sup',
                '[enter]': 'enter'
            },
            'writable': false,
            'configurable': false
        });

        Object.defineProperty(obj, 'instructCommands', {
            'value': {
                '[ctrl][b]': 'bold',
                '[ctrl][i]': 'italic',
                '[ctrl][v]': 'paste',
                '[ctrl][c]': 'copy',
                '[ctrl][=]': 'sub',
                '[ctrl][shift][=]': 'sup'
            },
            'writable': false,
            'configurable': false
        });
    }

    singleton.get = function get() {
        return new CommandsConfig();
    };

    return singleton;
});

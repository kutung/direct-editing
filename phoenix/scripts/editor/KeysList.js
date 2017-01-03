define([], function keysConfigLoader() {
    'use strict';
    var singleton = {};

    function KeyList() {
        var obj = this;

        Object.defineProperty(obj, 'keys', {
            'value': {
                '8': 'backspace',
                '13': 'enter',
                '16': 'shift',
                '17': 'ctrl',
                '18': 'alt',
                '46': 'delete',
                '61': '=',
                '66': 'b',
                '67': 'c',
                '68': 'd',
                '70': 'f',
                '73': 'i',
                '85': 'u',
                '86': 'v',
                '88': 'x',
                '90': 'z',
                '187': '='
            },
            'writable': false,
            'configurable': false
        });

        Object.defineProperty(obj, 'instructKeys', {
            'value': {
                '16': 'shift',
                '17': 'ctrl',
                '18': 'alt',
                '66': 'b',
                '67': 'c',
                '73': 'i',
                '86': 'v',
                '88': 'x'
            },
            'writable': false,
            'configurable': false
        });

        Object.defineProperty(obj, 'nonPrintablekeys', {
            'value': {
                '8': 'backspace',
                '9': 'tab',
                '13': 'enter',
                '16': 'shift',
                '17': 'ctrl',
                '18': 'alt',
                '20': 'capsLock',
                '27': 'escape',
                '33': 'pageUp',
                '34': 'pageDown',
                '35': 'end',
                '36': 'home',
                '37': 'leftArrow',
                '38': 'upArrow',
                '39': 'rightArrow',
                '40': 'downArrow',
                '42': 'printScreen',
                '45': 'insert',
                '46': 'delete',
                '112': 'f1',
                '113': 'f2',
                '114': 'f3',
                '115': 'f4',
                '116': 'f5',
                '117': 'f6',
                '118': 'f7 ',
                '119': 'f8',
                '120': 'f9',
                '121': 'f10',
                '122': 'f11',
                '123': 'f12',
                '145': 'scrollLock',
                '144': 'numLock'
            },
            'writable': false,
            'configurable': false
        });
    }

    singleton.get = function get() {
        return new KeyList();
    };

    return singleton;
});

(function(mod) {
    if (typeof exports === 'object' && typeof module === 'object') {
        mod(require('../libs/codemirror-5.1.0/lib/codemirror'),
            require('../libs/codemirror-5.1.0/mode/xml/xml')
        );
    }
    else if (typeof define === 'function' && define.amd) {
        define([
            '../libs/codemirror-5.1.0/lib/codemirror',
            '../libs/codemirror-5.1.0/mode/xml/xml'
        ], mod);
    }
    else {
        mod(CodeMirror);
    }
})(function(CodeMirror) {
    'use strict';

    CodeMirror.defineMode('opt', function (config, parserConfig) {
        var htmlMode = CodeMirror.getMode(config, {
                name: 'xml',
                htmlMode: false,
                multilineTagIndentFactor: parserConfig.multilineTagIndentFactor,
                multilineTagIndentPastTag: parserConfig.multilineTagIndentPastTag
            });

        function html(stream, state) {
            var tagName = state.htmlState.tagName;
            var style = htmlMode.token(stream, state.htmlState);
            var tgname = stream.current();

            if (tgname === 'opt_COMMENT') {
                style = 'optcom';
            }
            if (tgname === 'opt_INS') {
                style = 'optins';
            }
            if (tgname === 'opt_DEL') {
                style = 'optdel';
            }
            if (tgname === 'opt_ERROR') {
                style = 'opterr';
            }

            return style;
        }

        return {
            startState: function() {
                var state = htmlMode.startState();
                return {
                    token: html,
                    localMode: null,
                    localState: null,
                    htmlState: state
                };
            },
            copyState: function(state) {
                var local;

                if (state.localState) {
                    local = CodeMirror.copyState(
                        state.localMode, state.localState
                    );
                }

                return {
                    token: state.token,
                    localMode: state.localMode,
                    localState: local,
                    htmlState: CodeMirror.copyState(htmlMode, state.htmlState)
                };
            },
            token: function(stream, state) {
                return state.token(stream, state);
            },
            indent: function(state, textAfter) {
                if (!state.localMode || /^\s*<\//.test(textAfter)) {
                    return htmlMode.indent(state.htmlState, textAfter);
                }
                else if (state.localMode.indent) {
                    return state.localMode.indent(state.localState, textAfter);
                }
                else {
                    return CodeMirror.Pass;
                }
            },
            innerMode: function(state) {
                return {
                    state: state.localState || state.htmlState,
                    mode: state.localMode || htmlMode
                };
            }
        };
    }, 'xml');

    CodeMirror.defineMIME('text/html', 'htmlmixed');
});

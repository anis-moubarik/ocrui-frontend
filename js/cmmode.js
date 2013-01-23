define(['jquery','codemirror'],function ($,CodeMirror) {
    "use strict";

    // CodeMirror mode for Ocrui

    function cmMode (config, parserConfig) {
        return {
            startState: function() {
                var alto = config.getAlto();
                var changedSequence = [];
                window.a=alto;
                if (alto) {
                    changedSequence = alto.getChangedSequence();
                }
                return {
                    language:'fi',
                    wordIndex:0,
                    changedSequence:changedSequence
                };
            },
            token: function(stream,state) {
                stream.eatSpace();
                var word = '';
                while (!stream.eol()) {
                    var next = stream.next();
                    if (/\s/.test(next)) { break; }
                    word += next;
                }
                stream.eatSpace();
                var changed = state.changedSequence[state.wordIndex]
                state.wordIndex++;
                if (config.showOriginalChanges && changed) {
                    return "changed"
                } else {
                    return null;
                }
            }
        };
    }
    CodeMirror.defineMode('ocrui',cmMode);

});

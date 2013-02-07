define(['jquery','codemirror'],function ($,CodeMirror) {
    "use strict";

    // CodeMirror mode for Ocrui

    function cmMode (config, parserConfig) {
        return {
            startState: function() {
                var state = {
                    language:'fi',
                    wordIndex:0,
                };
                return state;
            },
            token: function(stream,state) {
                //console.log(state.wordIndex);
                stream.eatSpace();
                var word = '';
                while (!stream.eol()) {
                    var next = stream.next();
                    if (/\s/.test(next)) { break; }
                    word += next;
                }
                stream.eatSpace();
                var features = [];
                if (config.showUnsavedChanges &&
                    config.changedSequence[state.wordIndex]) {

                    features.push('changed-unsaved');

                }
                if (config.showOriginalChanges &&
                    config.changedSequence[state.wordIndex]) {

                    features.push('changed');

                }
                if (config.showLanguage &&
                    config.languageSequence[state.wordIndex]) {

                    features.push('language');

                }
                state.wordIndex++;
                return features.join(' ');;
            }
        };
    }
    CodeMirror.defineMode('ocrui',cmMode);

});

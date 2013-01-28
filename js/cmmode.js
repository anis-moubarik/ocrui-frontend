define(['jquery','codemirror'],function ($,CodeMirror) {
    "use strict";

    // CodeMirror mode for Ocrui

    function cmMode (config, parserConfig) {
        return {
            startState: function() {
                var alto = config.getAlto();
                var state = {
                    language:'fi',
                    wordIndex:0,
                    changedSequence:[],
                    changedSinceSaveSequence:[],
                    languageSequence:[],
                };
                if (alto) {
                    state.changedSinceSaveSequence =
                            alto.getChangedSinceSaveSequence();
                    state.changedSequence = alto.getChangedSequence();
                    state.languageSequence = alto.getLanguageSequence();
                }
                return state;
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
                var features = [];
                if (config.showUnsavedChanges &&
                    state.changedSequence[state.wordIndex]) {

                    features.push('changed-unsaved');

                }
                if (config.showOriginalChanges &&
                    state.changedSequence[state.wordIndex]) {

                    features.push('changed');

                }
                if (config.showLanguage &&
                    state.languageSequence[state.wordIndex]) {

                    features.push('language');

                }
                state.wordIndex++;
                return features.join(' ');;
            }
        };
    }
    CodeMirror.defineMode('ocrui',cmMode);

});

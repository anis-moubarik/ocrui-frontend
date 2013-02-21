define(['codemirror'],function (CodeMirror) {
    "use strict";

    // CodeMirror mode for Ocrui

    function cmMode (config, parserConfig) {
        return {
            startState: function() {
                return {
                    language:'fi',
                    wordIndex:0
                };
            },
            token: function(stream,state) {

                // return whitespace as separate empty token
                stream.eatSpace();
                //if (stream.current().length > 0) return null;

                // get next word
                var word = '';
                while (!stream.eol()) {
                    if (/\s/.test(stream.peek())) { break; }
                    word += stream.next();
                }

                // set features of the word
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
                if (config.showHighlight &&
                    config.highlight[state.wordIndex]) {

                    features.push('highlight');

                }

                // next word
                state.wordIndex++;

                return features.join(' ');
            }
        };
    }
    CodeMirror.defineMode('ocrui',cmMode);

});

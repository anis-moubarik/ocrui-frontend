/**
 *  Ocrui
 *
 *  Word structure handling code. Contains the string content
 *  transformation code that reorganises word cordinates after an edit
 *  and some utility functions for handling data in word structure.
 *
 *  This code operates on word structure format. One gets this from
 *  wordconv.js.
 *
 *  The words structure is an array of words. The order of the words in
 *  array is interpreted to correspond to semantic order of words in text.
 *  For convenience word index in this array is also stored as a
 *  property in a word object.
 *
 *  Single word is an object:
 *
 *  {
 *      content: 'Word', 
 *      index: 4,           // Index in array == index of the word in
 *                          // whole text
 *      textBlock: 4,       // Index of the text block this words belongs
 *                          // to
 *      textLine: 4,        // Index of the text line this words belongs
 *                          // to
 *      inLineIndex: 4,     // Index of the word in current textline.
 *      language: null,     // or string describing the language of the
 *                          // word
 *      changed: true,      // true if this is changed since original
 *      changedSinceSave: false, // true if this is changed since save.
 *                          // this is initially always false
 *      hpos: 10,           // hpos, vpos, width, height describe the
 *      vpos: 10,           // ... bounding box of the word.
 *      width: 900,         // ... the coordinate system is unspecified
 *      height: 50,         // ...
 *      hyphenated: false,  // True for words that are hyphenated
 *      hyp1: 'Wo-',        // ... first part of a hyphenated word
 *      hyp2: 'rd',         // ... second part
 *      hpos2: null,        // ... bounding box of hyp2-part of a
 *      vpos2: null,        // ... word, hyp1-part is bounded by
 *      width2: null,       // ... hpos,vpos,width,heigt.
 *      height2: null,      // ...
 *  
 *  };
 *
 *  All indexes are 0-based.
 *
 *  Author: juho.vuori@helsinki.fi
 *
 */

define(['underscore','jsdiff'],function (_,jsdiff) {
    "use strict";

    function transform (originalWords, savedWords, previousWords, strings) {

        // Create new words structure from array of strings and a number
        // of word structures.
        //
        // Basic algorithm is to loop over three edit sequences. Edit
        // sequence is a sequence of 'match', 'add', 'replace' and 'delete'
        // verbs to identify a set steps required to transform one string
        // into another. The sequence is built using diff-algorithm.
        //
        // The three edit sequences are:
        //  1. from original to current words.
        //     This is to split bounding boxes between words.
        //     This is the complicated part of the algorithm.
        //  2. from last saved to current words. This is used to figure
        //     out which words to mark changed since save
        //  3. from previous to current words. Previous means the version that
        //     was just displayed before the last keystroke or so.
        //     This is used to track word attributes such as language.

        var transformState = {
            targetWords : [],   // New words array to be created
            stringStack : [],   // stack of pending words to add
            wordStack : [],     // stack of pending element indexes to replace
            inLineIndex : 0,
            dirtySince0 : false,
            dirtySinceSave : false
        }
        strings = _.filter(strings,_.identity); // strip empty strings.
            // these sometime occur in the beginning
            // and end of the array at least.

        iterateOverEditSequence(originalWords, strings, handleOriginalEdit);
        processPending(); // there might be still some pending words to handle
        iterateOverEditSequence(savedWords, strings, handleSavedEdit);
        iterateOverEditSequence(previousWords, strings, handlePreviousEdit);

        return transformState;


        function iterateOverEditSequence(oldWords, newStrings, handler) {

            // This iterates over a edit sequence between oldWords and

            var oldStrings = getStringSequence(oldWords);
            var diff = jsdiff.diff(oldStrings,_.clone(newStrings));
            var seq = getEditSequence(diff);
            var si = 0;
            var wi = 0;

            for (var i = 0; i < seq.length; i++) {

                var currentEdit = seq[i];

                handler( currentEdit, // replace, match, add or delete
                    oldWords[wi],   // current word from the original
                                    // sequence, this will point to
                                    // next original world in case of an add
                    newStrings[si], // current string from new strings. Points
                                    // to next string in case of a delete
                    transformState.targetWords[si], // This is valid only if
                                    // target words are already created.
                                    // undefined for the first pass
                    ( (transformState.targetWords[si-1]) ||
                      (transformState.targetWords[si+1]) || {} ) // Either
                                    // previous word, next word or {}
                                    // if neither exist
                );

                if (currentEdit != 'add') wi ++;

                if (currentEdit != 'delete') si ++;

            }

        }


        function handlePreviousEdit(currentEdit, currentWord,
                                    currentString, targetWord,
                                    targetWordEnvironment) {

            //console.log(currentEdit, currentWord);
            if ((currentEdit == 'match') || (currentEdit == 'replace')) {

                targetWord.language = currentWord.language;

            } else if (currentEdit == 'add') {

                targetWord.language = targetWordEnvironment.language;

            }

        }
  
        function handleOriginalEdit(currentEdit, currentWord,
                                    currentString, targetWord,
                                    targetWordEnvironment) {

            /*
            console.log(currentEdit, currentWord, currentString, targetWord,
                        targetWordEnvironment);
            */
            if (currentEdit == 'match') {

                var processResult = processPending(currentWord);

                if (processResult !== null) {

                    // add the matching word if pending edits didn't
                    // use its bounding box and it didin't get added
                    // in processPending()
                    var previousTextLineIndex = textLineIndex();
                    transformState.targetWords.push(
                        dupWordWithSideEffects(currentWord,false)
                    );
                    transformState.inLineIndex ++;

                    if (previousTextLineIndex != currentWord.textLine) {

                        transformState.inLineIndex = 0;

                    }

                }

            } else if (currentEdit == 'replace') {

                queueEdit( currentString, currentWord);
                transformState.dirtySince0 = true;

            } else if (currentEdit == 'delete') {

                queueEdit( undefined, currentWord);
                transformState.dirtySince0 = true;

            } else if (currentEdit == 'add') {

                queueEdit( currentString, undefined);
                transformState.dirtySince0 = true;

            }

        }

        function handleSavedEdit(currentEdit, currentWord,
                                    currentString, targetWord,
                                    targetWordEnvironment) {

            if ((currentEdit == 'add') || (currentEdit == 'replace')) {

                targetWord.changedSinceSave = true;

            }

            if (currentEdit != 'match') {

                //console.log(currentEdit,currentString);
                transformState.dirtySinceSave = true;

            }

        }


        function processPending (nextWord) {

            var nextWordUsed = false;

            if (    (transformState.stringStack.length === 0) &&
                    (transformState.wordStack.length === 0) ) {

                return nextWord; // nothing to do

            }

            // If there are no elements to replace try to use preceding and
            // subsequent words to get bounding box from.

            if (transformState.wordStack.length === 0) {

                if (transformState.targetWords.length > 0) {
                    var precedingWord = transformState.targetWords.pop();
                    transformState.stringStack.splice(0,0,precedingWord.content);
                    transformState.wordStack.splice(0,0,precedingWord);
                }

                if ((nextWord) && (nextWord.textLine == textLineIndex())) {
                    transformState.stringStack.push(nextWord.content);
                    transformState.wordStack.push(nextWord);
                    nextWordUsed = true;
                }
            }

            var boundingBoxes = _.filter(transformState.wordStack,isNonNullBB);

            // add words if they are too few
            while (transformState.wordStack.length < transformState.stringStack.length) {
                transformState.wordStack.splice(0,0,dummyWord());
                transformState.inLineIndex ++;
            }

            // remove words if they are too many
            while (transformState.wordStack.length > transformState.stringStack.length) {
                transformState.wordStack.splice(0,1);
                transformState.inLineIndex --;
            }

            // Set new content strings
            for (var i = 0; i < transformState.wordStack.length; i++) {
                transformState.wordStack[i].content = transformState.stringStack[i];
            }

            splitBoundingBoxes (transformState.wordStack, boundingBoxes);

            // Finally copy new words to target.
            Array.prototype.push.apply(transformState.targetWords,transformState.wordStack);

            transformState.stringStack = [];
            transformState.wordStack = [];

            return nextWordUsed ? null : nextWord;

        }

        function dummyWord (changed) {

            return {
                content: '',
                index: wordIndex(),
                textBlock: textBlockIndex(),
                textLine: textLineIndex(),
                inLineIndex: transformState.inLineIndex,
                language: null,
                changed: true,
                hpos: null,
                vpos: null,
                width: null,
                height: null

            };

        }

        function wordIndex () {

            return transformState.targetWords.length;

        }

        function textBlockIndex () {

            var l = transformState.targetWords.length;

            return ( l == 0 ) ? 0 : transformState.targetWords[l - 1].textBlock;

        }

        function textLineIndex () {
            // Current line edits will be sticked into. It is either the
            // line of words in current wordStack or the line of last
            // targetWord or defaults to 0.
            if (transformState.wordStack.length > 0) {
                return transformState.wordStack[0].textLine;
            } else if (transformState.targetWords.length > 0) {
                return transformState.targetWords[transformState.targetWords.length - 1].textLine;	
            } else {
                return 0;
            }
            
        }

        function dupWordWithSideEffects (original,changed) {

            var dup = _.extend({},original);
            if (changed) {
                dup.changed = true;
                transformState.inLineIndex ++;
            } else {
                dup.changed = false;
            }
            dup.index = wordIndex();
            dup.inLineIndex = transformState.inLineIndex;

            return dup;

        }

        function queueEdit (string, word) {

            // push edit and process earlier stack if this is a new line
            if ( (word !== undefined) && (textLineIndex() != word.textLine) ) {
                processPending(word);
            }

            if (string !== undefined) {
                transformState.stringStack.push(string);
            }

            if (word !== undefined) {
                transformState.wordStack.push(dupWordWithSideEffects(word,true));
            }

        }

    }

    function getEditSequence (diff) {
        /*
            diff = { o : [...], n : [...] }
            o contains entry for each word in original,
            n contains entry for each word in new string,
            words are confusingly called rows here.
            entry is a string if we don't know what word it corresponds
                to in the other sequence.
            otherwise it is {row: n, text: '...'} where row is index
                to the corresponding word in other sequence
        */
        var seq = [];
        for ( var ni = 0, oi = 0; ni < diff.n.length; ni++ ) {

            // looping over two sequences, ni indexes diff.n
            // oi indexes diff.o
            if (_.isString(diff.n[ni])) {

                // This is either add or replace
                if (_.isString(diff.o[oi])) {
                    seq.push('replace');
                    oi ++;
                } else {
                    seq.push('add');
                }

            } else {

                // this one corresponds to one original word
                // but there might be removes before this one
                while (_.isString(diff.o[oi])) {
                    seq.push('delete');
                    oi ++;
                }
                seq.push('match');
                oi ++;

            }
        }

        // There might still be deletes at the end so handle them
        while (_.isString(diff.o[oi])) {
            seq.push('delete');
            oi ++;
        }

        return seq;
    }

    function isNonNullBB(bb) {
        if (isNaN(bb.hpos)) return false;
        if (isNaN(bb.vpos)) return false;
        if (isNaN(bb.width)) return false;
        if (isNaN(bb.height)) return false;
        return true;
    }

    function getCombinedBoundingBox(bbs) {
        
        var xs = [];
        var ys = [];
        for (var i in bbs) {
            xs.push(bbs[i].hpos);
            xs.push(bbs[i].hpos + bbs[i].width);
            ys.push(bbs[i].vpos);
            ys.push(bbs[i].vpos + bbs[i].height);
        }
        var bb = {
            hpos: _.min(xs),
            vpos: _.min(ys)
        };
        bb.width = _.max(xs) - bb.hpos;
        bb.height = _.max(ys) - bb.vpos;

        return bb;

    }

    function splitBoundingBoxes(words,bbs) {
        if (bbs.length == 0) { return; }
        var stringLengths = _.map(words,function(word) {
            return word.content.length;
        });
        var totalLength = _.reduce(stringLengths,function(subTotal,length) {
            return subTotal + length;
        }, 0);
        var combinedBB = getCombinedBoundingBox(bbs);
        var elements = words.length;
        var precedingProportion = 0;
        for (var i in words) {
            var word = words[i];
            var proportion = stringLengths[i] / totalLength;
            var bb = {
                hpos : combinedBB.hpos + 
                       Math.floor(combinedBB.width * precedingProportion),
                vpos : combinedBB.vpos,
                width : combinedBB.width * proportion,
                height : combinedBB.height
            };
            precedingProportion += proportion;

            // TODO: what about hyphenations
            word.hpos = bb.hpos;
            word.vpos = bb.vpos;
            word.width = bb.width;
            word.height = bb.height;
            word.changed = true;
        }
    }

    function getWordAt (words, x,y) {
        var selection;

        var minDistance;
        var minDistanceWord;
        // find bounding box under or closest to the cursor.
        _.map(words,function(word,i) {

            var ok = false;
            if (word.hyphenated) {
                ok = search ({
                    hpos: word.hpos2,
                    vpos: word.vpos2,
                    width: word.width2,
                    height: word.height2
                })
            }

            return ok || search(word);

            function tryToSetClosestCorner(cornerX,cornerY) {
                var distance = Math.sqrt(
                    Math.pow((cornerX - x), 2) +
                    Math.pow((cornerY - y), 2)
                );
                if ((minDistance === undefined) || (distance < minDistance))
                {
                    minDistance = distance;
                    minDistanceWord = word;
                }
            }

            function search (box) {
                // look for an exact match
                if ((x >= box.hpos) && (x <= box.hpos + box.width) &&
                    (y >= box.vpos) && (y <= box.vpos + box.height)) {

                    selection = word;
                    return false;

                }

                tryToSetClosestCorner(box.hpos,box.vpos);
                tryToSetClosestCorner(box.hpos+box.width,box.vpos);
                tryToSetClosestCorner(box.hpos,box.vpos+box.height);
                tryToSetClosestCorner(box.hpos+box.width,box.vpos+box.height);
            }

        });
        if (selection === undefined) {
            selection = minDistanceWord;
        }
        return selection;
    };

    function getWordSequence (words) {
        return _.map(words,_.identity);
    }

    function getStringSequence (words) {
        return _.map(words,function(w) {return w.content;});
    }

    function getLanguageSequence (words) {
        return _.map(words,function(e,i) {return e.language;});
    }

    function getChangedSince0Sequence (words) {
        return _.map(words,function(e,i) {return e.changed;});
    }

    function getChangedSinceSaveSequence (words) {
        return _.map(words,function(e,i) {return e.changedSinceSave;});
    }

    return {
        getWordSequence : getWordSequence,
        getStringSequence : getStringSequence,
        getLanguageSequence : getLanguageSequence,
        getChangedSince0Sequence : getChangedSince0Sequence,
        getChangedSinceSaveSequence : getChangedSinceSaveSequence,
        getCombinedBoundingBox : getCombinedBoundingBox,
        getWordAt : getWordAt,
        transform : transform
    };

});



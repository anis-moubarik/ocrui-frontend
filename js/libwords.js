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

        // Create new words structure from array of strings
        // the two three required word structures original, saved
        // and previous. Original is needed for bounding box construction
        // saved to track dirty words and previous to track attributes should
        // as language of a word.

        var process = new ContentUpdateProcess( originalWords, savedWords, previousWords, strings );

        return {
            changedSince0 : process.dirtySince0,
            changedSinceSave : process.dirtySinceSave,
            words : process.targetWords
        }

    };

    function ContentUpdateProcess( originalWords, savedWords, previousWords, newStrings ) {

        if (newStrings[0] === "") newStrings.splice(0,1);
        var lastI = newStrings.length-1;
        if (newStrings[lastI] === "") newStrings.splice(lastI,1);

        var originalStrings = getStringSequence(originalWords);

        var diff = jsdiff.diff(originalStrings,_.map(newStrings,_.identity));
        var seq = getEditSequence(diff);
        this.dirtySince0 = _.reduce(seq,function(prev,cur){
            return prev || cur != 'match';
        },false);

        this.targetWords = []; // New words array to be created
        this.stringStack = []; // stack of pending words to add
        this.wordStack = []; // stack of pending element indexes to replace

        var si = 0;
        var wi = 0;

        this.inLineIndex = 0;

        for (var i = 0; i < seq.length; i++) {

            var currentWord = originalWords[wi];
            var currentString = newStrings[si];
            var currentEdit = seq[i];
            var oldWi = wi;

            if (currentEdit == 'match') {

                si ++;
                wi ++;
                if (this.processPending(currentWord) !== null) {

                    // add the matching word if pending edits didn't
                    // use its bounding box and it didin't get added
                    // in this.processPending()
                    var previousTextLineIndex = this.textLineIndex();
                    this.targetWords.push(
                        this.dupWordWithSideEffects(currentWord,false)
                    );
                    this.inLineIndex ++;
                    if (previousTextLineIndex != currentWord.textLine) {
                        this.inLineIndex = 0;
                    }

                }

            } else if (currentEdit == 'replace') {

                wi ++;
                si ++;
                this.queueEdit( currentString, currentWord);

            } else if (currentEdit == 'delete') {

                wi ++;
                this.queueEdit( undefined, currentWord);

            } else if (currentEdit == 'add') {

                si ++;
                this.queueEdit( currentString, undefined);

            }

        }

        this.processPending();

        // Handle langauages
        var previousStrings = getStringSequence(previousWords);
        var currentLangs = getLanguageSequence(previousWords);
        var diff = jsdiff.diff(previousStrings,_.map(newStrings,_.identity));
        var seq = getEditSequence(diff);

        var wi = 0;
        var li = 0;

        for (var i = 0; i < seq.length; i++) {
            //  i indexes edit edit sequence
            // wi indexes just created word objects
            // li indexes previous languages

            if ((seq[i] == 'match') || (seq[i] == 'replace')) {

                
                this.targetWords[wi].language = currentLangs[li];
                wi ++;
                li ++;

            } else if (seq[i] == 'delete') {

                li ++;

            } else if (seq[i] == 'add') {

                if (li > 0) {
                    this.targetWords[wi].language = currentLangs[li - 1];
                }
                wi ++;

            }

        }
  
        // handle changed since save
        var savedStrings = getStringSequence(savedWords);
        var diff = jsdiff.diff(_.map(savedStrings,_.identity),_.map(newStrings,_.identity));
        var seq = getEditSequence(diff);

        var wi = 0;

        this.dirtySinceSave = _.reduce(seq,function(prev,cur){
            return prev || cur != 'match';
        },false);

        for (var i = 0; i < seq.length; i++) {

            //  i indexes edit edit sequence
            // wi indexes just created word objects
            var e = seq[i];

            if ((e == 'add') || (e == 'replace')) {

                this.targetWords[wi].changedSinceSave = true;

            }

            if (e != 'delete') {

                wi++;

            }

        }

    }

    ContentUpdateProcess.prototype.queueEdit = function(string, word) {

        // push edit and process earlier stack if this is a new line

        if ( (word !== undefined) && (this.textLineIndex() != word.textLine) ) {
            this.processPending(word);
        }

        if (string !== undefined) {
            this.stringStack.push(string);
        }

        if (word !== undefined) {
            this.wordStack.push(this.dupWordWithSideEffects(word,true));
        }

    };

    ContentUpdateProcess.prototype.processPending = function(nextWord) {

        var nextWordUsed = false;

        if (    (this.stringStack.length === 0) &&
                (this.wordStack.length === 0) ) {

            return nextWord; // nothing to do

        }

        // If there are no elements to replace try to use preceding and
        // subsequent words to get bounding box from.

        if (this.wordStack.length === 0) {

            if (this.targetWords.length > 0) {
                var precedingWord = this.targetWords.pop();
                this.stringStack.splice(0,0,precedingWord.content);
                this.wordStack.splice(0,0,precedingWord);
            }

            if ((nextWord) && (nextWord.textLine == this.textLineIndex())) {
                this.stringStack.push(nextWord.content);
                this.wordStack.push(nextWord);
                nextWordUsed = true;
            }
        }

        var boundingBoxes = _.filter(this.wordStack,isNonNullBB);

        // add words if they are too few
        while (this.wordStack.length < this.stringStack.length) {
            this.wordStack.splice(0,0,this.dummyWord());
            this.inLineIndex ++;
        }

        // remove words if they are too many
        while (this.wordStack.length > this.stringStack.length) {
            this.wordStack.splice(0,1);
            this.inLineIndex --;
        }

        // Set new content strings
        for (var i = 0; i < this.wordStack.length; i++) {
            this.wordStack[i].content = this.stringStack[i];
        }

        splitBoundingBoxes (this.wordStack, boundingBoxes);

        // Finally copy new words to target.
        Array.prototype.push.apply(this.targetWords,this.wordStack);

        this.stringStack = [];
        this.wordStack = [];

        if (nextWordUsed) {
            return null;
        } else {
            return nextWord;
        }

    };

    ContentUpdateProcess.prototype.wordIndex = function () {
        return this.targetWords.length;
    };

    ContentUpdateProcess.prototype.textBlockIndex = function () {
        if (this.targetWords.length==0) return 0;
        return this.targetWords[this.targetWords.length - 1].textBlock;
    };

    ContentUpdateProcess.prototype.textLineIndex = function () {
		// Current line edits will be sticked into. It is either the
		// line of words in current wordStack or the line of last
		// targetWord or defaults to 0.
        if (this.wordStack.length > 0) {
			return this.wordStack[0].textLine;
		} else if (this.targetWords.length > 0) {
			return this.targetWords[this.targetWords.length - 1].textLine;	
        } else {
			return 0;
		}
        
    };

    ContentUpdateProcess.prototype.dummyWord = function (changed) {
        return {
            content: '',
            index: this.wordIndex(),
            textBlock: this.textBlockIndex(),
            textLine: this.textLineIndex(),
            inLineIndex: this.inLineIndex,
            language: null,
            changed: true,
            hpos: null,
            vpos: null,
            width: null,
            height: null

        };
    };

    ContentUpdateProcess.prototype.dupWordWithSideEffects
                = function(original,changed) {

        var dup = _.extend({},original);
        if (changed) {
            dup.changed = true;
            this.inLineIndex ++;
        } else {
            dup.changed = false;
        }
        dup.index = this.wordIndex();
        dup.inLineIndex = this.inLineIndex;

        return dup;

    };

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



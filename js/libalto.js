define(['jquery','underscore','jsdiff','utils'],function ($,_,jsdiff,utils) {
    "use strict";

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

                // This is either add replace
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
        return seq;
    }

    function isNonNullBB(bb) {
        if (isNaN(bb.hpos)) return false;
        if (isNaN(bb.vpos)) return false;
        if (isNaN(bb.width)) return false;
        if (isNaN(bb.height)) return false;
        return true;
    }
    function getBoundingBoxOf($object) {
        return {
            hpos : parseInt($object.attr('HPOS'),10),
            vpos : parseInt($object.attr('VPOS'),10),
            width : parseInt($object.attr('WIDTH'),10),
            height : parseInt($object.attr('HEIGHT'),10)
        };
    }

    function splitBoundingBoxes(words,bbs) {
        if (bbs.length == 0) { return; }
        var stringLengths = _.map(words,function(word) {
            return word.content.length;
        });
        var totalLength = _.reduce(stringLengths,function(subTotal,length) {
            return subTotal + length;
        }, 0);
        var combinedBB = utils.getCombinedBoundingBox(bbs);
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

    function ContentUpdateProcess( alto, newStrings ) {

        if (newStrings[0] === "") newStrings.splice(0,1);
        var lastI = newStrings.length-1;
        if (newStrings[lastI] === "") newStrings.splice(lastI,1);

        var originalStrings = alto.getOriginalStringSequence();

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

            var currentWord = alto.originalWords[wi];
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
        var previousStrings = alto.getStringSequence();
        var currentLangs = alto.getLanguageSequence();
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
        var savedStrings = alto.getSavedStringSequence();
        var diff = jsdiff.diff(_.map(savedStrings,_.identity),_.map(newStrings,_.identity));
        var seq = getEditSequence(diff);

        var wi = 0;

        this.dirtySinceSave = false;

        for (var i = 0; i < seq.length; i++) {

            //  i indexes edit edit sequence
            // wi indexes just created word objects

            if ((seq[i] == 'add') || (seq[i] == 'replace')) {

                this.targetWords[wi].changedSinceSave = true;
                this.dirtySinceSave = true;

            }

            if (seq[i] != 'delete') {

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


    function Alto () {

        this.dirtySince0 = false;
        this.dirtySinceSave = false;
        this.words = [];

    }

    Alto.prototype.setOriginalXML = function (xml) {
        this.originalXML = xml;
        this.originalWords = this.constructWords(xml);
    };

    Alto.prototype.setCurrentXML = function (xml) {
        this.currentXML = xml;
        this.words = this.constructWords(xml);
        this.savedWords = this.constructWords(xml);
        this.layoutBoxes = this.constructLayoutBoxes(this.words);

        // This is necessary to refresh sane state after saving a
        // page not currently visible.
        if (this.originalXML) {
            this.updateStringsContent(this.getStringSequence());
        }

    };

    Alto.prototype.constructWords = function(xml) {
        var words = [];
        var wordIndex = 0;
        var globaltlIndex = 0;

        $(xml).find('TextBlock').map(function (tbIndex,tb) {

            $(tb).find('TextLine').map(function(tlIndex,tl) {

                $(tl).find('String').map(function(sIndex,s) {

                    var word = {
                        index: wordIndex,
                        textBlock: tbIndex,
                        textLine: globaltlIndex,
                        inLineIndex: sIndex,
                        content: s.getAttribute('CONTENT'),
                        language: s.getAttribute('LANGUAGE'),
                        changed: s.getAttribute('CHANGED') ?
                            true : false,
                        hpos: parseInt(s.getAttribute('HPOS'),10),
                        vpos: parseInt(s.getAttribute('VPOS'),10),
                        width: parseInt(s.getAttribute('WIDTH'),10),
                        height: parseInt(s.getAttribute('HEIGHT'),10)

                    };

                    var subsType = s.getAttribute('SUBS_TYPE');
                    var subsContent = s.getAttribute('SUBS_CONTENT');

                    if (typeof(subsContent) == typeof('')) {
                        // strip whitespace as a workaround for some buggy alto
                        subsContent = subsContent.replace(/(^\s+|\s+$)/g,'');
                    }

                    if (subsType == 'HypPart2')  {

                        if (words[wordIndex] === undefined) {
                            
                            words.push(word);
                            //console.log('hyp2 without hyp1');

                        } else {

                            words[wordIndex].hyp2 = word.content;
                            words[wordIndex].content = subsContent;
                            words[wordIndex].hpos2 = word.hpos;
                            words[wordIndex].vpos2 = word.vpos;
                            words[wordIndex].width2 = word.width;
                            words[wordIndex].height2 = word.height;

                        }

                    } else {
                        words.push(word);
                    }
                    if (subsType == 'HypPart1') {
                        words[wordIndex].hyphenated = true;
                        words[wordIndex].hyp1 = word.content;
                    } else {
                        wordIndex++;
                    }
                    
                    return word;

                });
                globaltlIndex++;

            });

        });

        return words;
    };

    Alto.prototype.constructLayoutBoxes = function(words) {
        var layoutBoxes = Math.max.apply(null,
            _.map(words, function (w) { return w.textBlock; })
        );

        var boxes = [];
        for (var i = 0; i <= layoutBoxes; i++ ) {
            var myWords = _.filter(words,
                function (w) {return w.textBlock == i;}
            );

            var layoutBox = utils.getCombinedBoundingBox(myWords);
            layoutBox.index = i;
            layoutBox.fromIndex = Math.min.apply(null,
                _.map(myWords, function(w) { return w.index; })
            );
            layoutBox.toIndex = Math.max.apply(null,
                _.map(myWords, function(w) { return w.index; })
            );
            boxes.push(layoutBox);
        }
        return boxes;
    };


    Alto.prototype.isDirty = function() {
        return this.dirtySinceSave;
    };

    Alto.prototype.isDirty0 = function() {
        return this.dirtySince0;
    };

    Alto.prototype.getLayoutBoxes = function () {

        return this.layoutBoxes;

    };

    Alto.prototype.updateStringContent = function (content) {
        // Create new current structure from string content and
        // original alto structure

        var strings = content.split(/\s+/);
        this.updateStringsContent (strings);

    }

    Alto.prototype.updateStringsContent = function (strings) {
        // Create new current structure from array of strings and
        // original alto structure
        var process = new ContentUpdateProcess( this, strings );
        this.words = process.targetWords;
        this.dirtySinceSave = process.dirtySinceSave;
        this.dirtySince0 = process.dirtySince0;

    };

    Alto.prototype.getWordAt = function (x,y) {
        var selection;

        var minDistance;
        var minDistanceWord;
        var that=this;
        // find bounding box under or closest to the cursor.
        _.map(this.words,function(word,i) {

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

    Alto.prototype.getAsAltoXML = function () {

        var newXML = $(this.originalXML).find('alto').get(0);
        //var newXML = $(this.originalXML.firstChild).clone().get(0);

        // remove old strings and get lines array
        var $textlines = $(newXML).find('TextLine').map( function (i,tl) {

            $(tl).empty();
            return tl;

        });

        _.map(this.words,function (word) {

            var $textLine = $textlines.eq(word.textLine);
            var $word = $($.parseXML('<String/>').documentElement).attr({
                'CONTENT' : word.content,
                'LANGUAGE' : word.language,
                'CHANGED' : word.changed,
                'HPOS' : word.hpos,
                'VPOS' : word.vpos,
                'WIDTH' : word.width,
                'HEIGHT' : word.height
            });

            if (word.hyphenated) {

                $word.attr({
                    'SUBS_CONTENT' : word.content,
                    'SUBS_TYPE' : 'HypPart1',
                    'CONTENT' : word.hyp1
                });
                var $hyp2 = $word.clone();
                $hyp2.attr({
                    'SUBS_TYPE' : 'HypPart2',
                    'CONTENT' : word.hyp2
                });
                var $nextTextLine = $textlines.eq(word.textLine+1);
                $nextTextLine.append($hyp2);

            }

            $textLine.append($word);
            
        });

        return newXML;

    };

    Alto.prototype.setNthWordLanguage = function(index,language) {
        this.words[index].language = language;
        return this.words[index];
    };

    Alto.prototype.getNthWord = function(index) {
        return this.words[index];
    };
    Alto.prototype.getWordSequence = function() {
        return _.map(this.words,_.identity);
    };
    Alto.prototype.getSavedStringSequence = function() {
        return _.map(this.savedWords,function(w) {return w.content;});
    };
    Alto.prototype.getStringSequence = function() {
        return _.map(this.words,function(w) {return w.content;});
    };
    Alto.prototype.getOriginalStringSequence = function() {
        return _.map(this.originalWords,function(w) {return w.content;});
    };

    Alto.prototype.getLanguageSequence = function () {
        return _.map(this.words,function(e,i) {return e.language;});
    };

    Alto.prototype.getChangedSince0Sequence = function() {
        return _.map(this.words,function(e,i) {return e.changed;});
    };

    Alto.prototype.getChangedSinceSaveSequence = function() {
        return _.map(this.words,function(e,i) {return e.changedSinceSave;});
    };

    return {
        Alto : Alto
    };
});



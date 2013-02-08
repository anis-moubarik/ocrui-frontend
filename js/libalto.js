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
                // but there bight be removes before this one
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

    function markChanges($$elements) {
        for (var i in $$elements) {
            var $element = $$elements[i];
            $element.attr('CHANGED', 'true');
        }
    }

    function splitBoundingBoxes($$elements,bbs) {
        var stringLengths = _.map($$elements,function(element) {
            return element.attr('CONTENT').length;
        });
        var totalLength = _.reduce(stringLengths,function(subTotal,length) {
            return subTotal + length;
        }, 0);
        var combinedBB = utils.getCombinedBoundingBox(bbs);
        var elements = $$elements.length;
        var precedingProportion = 0;
        for (var i in $$elements) {
            var $element = $$elements[i];
            var proportion = stringLengths[i] / totalLength;
            var bb = {
                hpos : combinedBB.hpos + 
                       Math.floor(combinedBB.width * precedingProportion),
                vpos : combinedBB.vpos,
                width : combinedBB.width * proportion,
                height : combinedBB.height
            };
            precedingProportion += proportion;

            $element.attr('HPOS', bb.hpos);
            $element.attr('VPOS', bb.vpos);
            $element.attr('WIDTH', bb.width);
            $element.attr('HEIGHT', bb.height);
            $element.attr('CHANGED', 'true');
        }
    }

    function ContentUpdateProcess(
            original,
            newWords,
            currentStringSequence,
            currentLanguageSequence
            ) {

        this.$nextPosition = undefined; // next $position to come
        this.resetLine();
        this.$target = $(original).find('alto').clone();
        this.createAltoFromOriginalAndWords(original, newWords);
        this.updateLanguages(
            newWords,
            currentStringSequence,
            currentLanguageSequence
        );

    }

    ContentUpdateProcess.prototype.isDirty = function () {
        return this.dirty;
    };

    ContentUpdateProcess.prototype.createAltoFromOriginalAndWords = function (
            original, words) {

        words = words.map(_.identity); // jsdiff.diff edits second argument!!
        var originalWords = $(original).find('String').map( function() {
                return this.getAttribute('CONTENT') || '';
            }).get();
        var diff = jsdiff.diff(originalWords,words);
        var seq = getEditSequence(diff);
        this.dirty = seq.reduce(function(prev,cur){
            return prev || cur != 'match';
        },false);
        var $strings = this.$target.find('String');
        var wi = 0;
        var si = 0;

        this.$textline = this.$target.find('TextLine').first();
        for (var i = 0; i < seq.length; i++) {
            // Iterating simultaneously three sequences
            //  i indexes edit edit sequence
            // wi indexes editor words sequence
            // si indexes alto string elements

            var $currentString = $strings.eq(si);
            var currentWord = words[wi];
            var oldSi = si;
            this.prepareString($currentString);

            if (seq[i] == 'match') {

                wi ++;
                si ++;
                this.processPending();
                $currentString.removeAttr('CHANGED');

            } else if (seq[i] == 'replace') {

                si ++;
                wi ++;
                this.pushEdit( currentWord, $currentString);

            } else if (seq[i] == 'delete') {

                si ++;
                this.pushEdit( undefined, $currentString);

            } else if (seq[i] == 'add') {

                wi ++;
                this.pushEdit( currentWord, undefined);

            }

            if (si != oldSi) {
                this.stringDone();
            }

        }

        this.processPending();
    };

    ContentUpdateProcess.prototype.resetLine = function () {
        this.wordStack = []; // stack of pending words to add
        this.$$elementStack = []; // stack of pending elements to replace
        this.$textline = undefined; // textline of pending changes
        this.$position = undefined; // element just before pending changes
    };

    ContentUpdateProcess.prototype.pushEdit = function(word, $string) {
        // push edit and process earlier stack if this is a new line

        var $nextTextline = this.$textline;
        var elementsAdded = 0;

        if ($string !== undefined) $nextTextline = $string.parent();

        if ( ( this.$textline ) &&
             ($nextTextline) &&
             (this.$textline.get(0) != $nextTextline.get(0)) ) {
            elementsAdded = this.processPending();
        }

        if (word !== undefined) {
            this.wordStack.push(word);
        }

        if ($string !== undefined) {
            this.$$elementStack.push($string);
        }

        return elementsAdded;

    };

    ContentUpdateProcess.prototype.prepareString = function($string) {
        this.$nextPosition = $string;

    };

    ContentUpdateProcess.prototype.stringDone = function() {
        this.$position = this.$nextPosition;
        this.$textline = this.$position.parent();


    };

    ContentUpdateProcess.prototype.processPending = function() {

        var elementsAdded = 0;
        var needToAddNextElement = false;
        if (    (this.wordStack.length === 0) &&
                (this.$$elementStack.length === 0) ) {
            return 0; // no pending elements
        }

        // If there are no elements to replace try to add preceding and
        // subsequent elements and words.
        if (this.$$elementStack.length === 0) {
            // BUG: only add when these are at the same line
            if ((this.$position) && (this.$position.parent().get(0) == this.$textline.get(0))) {
                this.wordStack.splice(0,0,this.$position.attr('CONTENT'));
                this.$$elementStack.splice(0,0,this.$position);
            }
            needToAddNextElement = true;
        }

        var $insertPosition = this.$position;
        // add elements if they are too few
        while (this.$$elementStack.length < this.wordStack.length) {
            var $string = $($.parseXML('<String />')).find('String');
            if ($insertPosition !== undefined) {
                $insertPosition.after($string);
                $insertPosition = $insertPosition.next();
            } else if (this.$textline !== undefined) {
                // this happens, when edits occur in the beginning
                // of a line.
                this.$textline.prepend($string);
            } else {
                throw "no textline! cannot edit.";
            }
            this.$$elementStack.push($string);
            elementsAdded++;
        }
        if ((needToAddNextElement) && (this.$nextPosition) && (this.$nextPosition.parent().get(0) == this.$textline.get(0))) {
            this.wordStack.push(this.$nextPosition.attr('CONTENT'));
            this.$$elementStack.push(this.$nextPosition);
        }

        var unfilteredBBs = _.map(this.$$elementStack,getBoundingBoxOf);
        var boundingBoxes = _.filter(unfilteredBBs,isNonNullBB);

        // remove elements if they are too many
        while (this.$$elementStack.length > this.wordStack.length) {
            var $element = this.$$elementStack.pop();
            $element.remove();
            elementsAdded--;
        }

        for (var i = 0; i < this.$$elementStack.length; i++) {
            this.$$elementStack[i].attr('CONTENT',this.wordStack[i] || '');
        }

        if (boundingBoxes.length > 0) {
            splitBoundingBoxes (this.$$elementStack, boundingBoxes);
        }

        markChanges (this.$$elementStack);

        this.resetLine();

        return elementsAdded;

    };

    ContentUpdateProcess.prototype.updateLanguages =
                function(words,currentWords,currentLangs) {

        words = words.map(_.identity); // jsdiff.diff edits second argument!!
        var diff = jsdiff.diff(currentWords,words);
        var seq = getEditSequence(diff);
        
        var $strings = this.$target.find('String');
        var wi = 0;
        var si = 0;

        for (var i = 0; i < seq.length; i++) {
            // Iterating simultaneously three sequences
            //  i indexes edit edit sequence
            // wi indexes editor words sequence
            // si indexes alto string elements

            if ((seq[i] == 'match') || (seq[i] == 'replace')) {

                $strings.eq(si).attr('LANGUAGE',currentLangs[wi]);
                wi ++;
                si ++;

            } else if (seq[i] == 'delete') {

                wi ++;

            } else if (seq[i] == 'add') {

                if (wi > 0) {
                    $strings.eq(si).attr('LANGUAGE',currentLangs[wi - 1]);
                }
                si ++;

            }

        }
    };

    ContentUpdateProcess.prototype.getNewAlto = function() {
        return this.$target.get(0);
    };

    function Alto () {

        this.dirty = false;

    }

    Alto.prototype.setOriginalXML = function (xml) {
        this.original = xml;
    };

    Alto.prototype.setCurrentXML = function (xml) {
        this.current = xml;
        this.parseLayoutBoxes(xml);
    };

    Alto.prototype.parseLayoutBoxes = function(xml) {
        var that = this;
        var wordIndex = 0;
        var layoutBoxIndex = 0;
        var $textblocks = $(xml).find('TextBlock');
        this.words = [];
        this.layoutBoxes = $textblocks.map(function (e,i) {
            var fromIndex = wordIndex;
            var $strings = $(this).find('String');
            var words = $strings.map(function() {
                var word = that.dom2Word(this,wordIndex);
                that.words[wordIndex++] = word;
                return word;
            }).get();

            var layoutBox = utils.getCombinedBoundingBox(words);
            layoutBox.index=layoutBoxIndex ++;
            layoutBox.fromIndex=fromIndex;
            layoutBox.toIndex=wordIndex;

            return layoutBox;
        }).get();
    };

    Alto.prototype.isDirty = function() {
        return this.dirty;
    };

    Alto.prototype.dom2Word = function(dom,index) {
        return {
            index: index,
            content: dom.getAttribute('CONTENT'),
            language: dom.getAttribute('LANGUAGE'),
            changed: dom.getAttribute('CHANGED') ?
                true : false,
            changedSinceSave: dom.getAttribute('CHANGED_SINCE_SAVE') ?
                true : false,
            hpos: parseInt(dom.getAttribute('HPOS'),10),
            vpos: parseInt(dom.getAttribute('VPOS'),10),
            width: parseInt(dom.getAttribute('WIDTH'),10),
            height: parseInt(dom.getAttribute('HEIGHT'),10)

        };
    };

    Alto.prototype.getLayoutBoxes = function () {

        return this.layoutBoxes;

    };

    Alto.prototype.updateStringContent = function (content) {
        // Create new current structure from string content and
        // original alto structure

        var newWords = content.split(/\s+/);
        if (newWords[0] === "") newWords.splice(0,1);
        var lastI = newWords.length-1;
        if (newWords[lastI] === "") newWords.splice(lastI,1);
        var process = new ContentUpdateProcess(
            this.original,
            newWords,
            this.getStringSequence(),
            this.getLanguageSequence()
            );


        this.setCurrentXML( process.getNewAlto() );

        this.dirty = process.isDirty();
    };

    Alto.prototype.getWordAt = function (x,y) {
        var selection;

        var minDistance;
        var minDistanceWord;
        var that=this;
        // find bounding box under or closest to the cursor.
        this.words.map(function(word,i) {

            // look for an exact match
            if ((x >= word.hpos) && (x <= word.hpos + word.width) &&
                (y >= word.vpos) && (y <= word.vpos + word.height)) {

                selection = word;
                return false;

            }

            // look for a bounding box nearby
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
            tryToSetClosestCorner(word.hpos,word.vpos);
            tryToSetClosestCorner(word.hpos+word.width,word.vpos);
            tryToSetClosestCorner(word.hpos,word.vpos+word.height);
            tryToSetClosestCorner(word.hpos+word.width,word.vpos+word.height);

        });
        if (selection === undefined) {
            selection = minDistanceWord;
        }
        return selection;
    };

    Alto.prototype.setNthWordLanguage = function(index,language) {
        this.words[index].language = language;
        return this.words[index];
    };

    Alto.prototype.getNthWord = function(index) {
        return this.words[index];
    };

    Alto.prototype.getStringSequence = function() {
        return this.words.map(function(e,i) {return e.content;});
    };

    Alto.prototype.getLanguageSequence = function () {
        return this.words.map(function(e,i) {return e.language;});
    };

    Alto.prototype.getChangedSequence = function() {
        return this.words.map(function(e,i) {return e.changed;});
    };

    Alto.prototype.getChangedSinceSaveSequence = function() {
        return this.words.map(function(e,i) {return e.changedSinceSave;});
    };

    return {
        Alto : Alto
    };
});



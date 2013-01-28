define(['jquery','underscore','jsdiff'],function ($,_,jsdiff) {
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

    function splitBoundingBoxes($$elements,bbs) {
        var stringLengths = _.map($$elements,function(element) {
            return element.attr('CONTENT').length;
        });
        var totalLength = _.reduce(stringLengths,function(subTotal,length) {
            return subTotal + length;
        }, 0);
        var combinedBB = getCombinedBoundingBox(bbs);
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

    function ProcessingState() {
        this.$nextPosition = undefined; // next $position to come
        this.resetLine();
    }

    ProcessingState.prototype.createTarget = function ( original ) {
         this.$target = $(original).find('alto').clone();
    }
    ProcessingState.prototype.createAltoFromOriginalAndWords = function (
            original, words) {

        words = words.map(_.identity); // jsdiff.diff edits second argument!!
        var originalWords = $(original).find('String').map( function() {
                return this.getAttribute('CONTENT') || '';
            }).get();
        var diff = jsdiff.diff(originalWords,words);
        var seq = getEditSequence(diff);
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

    ProcessingState.prototype.resetLine = function () {
        this.wordStack = []; // stack of pending words to add
        this.$$elementStack = []; // stack of pending elements to replace
        this.$textline = undefined; // textline of pending changes
        this.$position = undefined; // element just before pending changes
    };

    ProcessingState.prototype.pushEdit = function(word, $string) {
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

    ProcessingState.prototype.prepareString = function($string) {
        this.$nextPosition = $string;

    };

    ProcessingState.prototype.stringDone = function() {
        this.$position = this.$nextPosition;
        this.$textline = this.$position.parent();


    };

    ProcessingState.prototype.processPending = function() {

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
        } else {
            // BUG: should write something to mark changes made
        }

        this.resetLine();
        return elementsAdded;

    };

    ProcessingState.prototype.updateLanguages = function(current,words) {

        words = words.map(_.identity); // jsdiff.diff edits second argument!!
        var currentWords = $(current).find('String').map(
            function() { return this.getAttribute('CONTENT') || ''; }
        ).get();
        var currentLangs = $(current).find('String').map(
            function() { return this.getAttribute('LANGUAGE') || ''; }
        ).get();
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

    function createAlto (original, current, words) {

        // Returns a new Alto DOM from three input objects:
        // original - the Original alto dom (bounding boxes come from here)
        // current - the alto just before the last change (word language and
        //   layout box information come from here)
        // words - sequence of words from editor.

        var processingState = new ProcessingState();

        processingState.createTarget(original);
        processingState.createAltoFromOriginalAndWords(original, words);
        processingState.updateLanguages(current,words);

        return processingState.$target.get(0);
    }

    return {
        createAlto : createAlto
    };
});



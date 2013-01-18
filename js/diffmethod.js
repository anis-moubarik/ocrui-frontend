define(['jsdiff'],function (jsdiff) {

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
        var oi = 0;
        for ( var i = 0; i < diff.n.length; i++ ) {

            if (_.isString(diff.n[i])) {
                // This is either add replace
                if (_.isString(diff.o[i])) {
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
            hpos : parseInt($object.attr('HPOS')),
            vpos : parseInt($object.attr('VPOS')),
            width : parseInt($object.attr('WIDTH')),
            height : parseInt($object.attr('HEIGHT')),
        }
    }
    function setBoundingBox($object,bb) {
        $object.attr('HPOS', bb.hpos);
        $object.attr('VPOS', bb.vpos);
        $object.attr('WIDTH', bb.width);
        $object.attr('HEIGHT', bb.height);
    }
    function getCombinedBoundingBox(bbs) {
        var bb = _.clone(bbs[0]);
        
        for (var i in bbs) {
            var bb2 = bbs[i];
            if (bb2.hpos < bb.hpos) {
                bb.hpos = bb2.hpos;
            }
            if (bb2.vpos < bb.vpos) {
                bb.vpos = bb2.vpos;
            }
            if (bb2.hpos+bb2.width > bb.hpos+bb.width) {
                bb.width = bb2.hpos + bb2.width - bb.hpos;
            }
            if (bb2.vpos+bb2.height > bb.vpos+bb.height) {
                bb.height = bb2.height + bb2.height - bb.vpos;
            }
        }
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
            }
            precedingProportion += proportion;
            setBoundingBox($element,bb);
        }
    };

    function ProcessingState() {
        this.$nextPosition = undefined; // next $position to come
        this.resetLine();
    }

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

        if ($string != undefined) $nextTextline = $string.parent();

        if ( ( this.$textline ) &&
             ($nextTextline) &&
             (this.$textline.get(0) != $nextTextline.get(0)) ) {
            elementsAdded = this.processPending();
        }

        if (word != undefined) {
            this.wordStack.push(word);
        }

        if ($string != undefined) {
            this.$$elementStack.push($string);
        }

        return elementsAdded;

    }

    ProcessingState.prototype.prepareString = function($string) {
        this.$nextPosition = $string;

    }

    ProcessingState.prototype.stringDone = function() {
        this.$position = this.$nextPosition;
        this.$textline = this.$position.parent();


    }

    ProcessingState.prototype.processPending = function() {

        var elementsAdded = 0;
        var needToAddNextElement = false;
        if ((this.wordStack.length == 0) && (this.$$elementStack.length == 0)) {
            return 0;
        }

        // If there are no elements to replace try to add preceding and
        // subsequent elements and words.
        if (this.$$elementStack.length == 0) {
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
            if ($insertPosition != undefined) {
                $insertPosition.after($string);
                $insertPosition = $insertPosition.next();
                
            } else if (this.$textline != undefined) {
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
            this.$$elementStack[i].attr('CONTENT',this.wordStack[i]);
        }
        splitBoundingBoxes (this.$$elementStack, boundingBoxes);

        this.resetLine();
        return elementsAdded;

    }

    function createAlto (source,words) {
        var originalWords = $(source).find('String').map(
            function() { return this.getAttribute('CONTENT'); }
        ).get();
        var diff = jsdiff.diff(originalWords,words);
        var seq = getEditSequence(diff);
        var $target = $(source).find('alto').clone();
        var $strings = $target.find('String');

        var processingState = new ProcessingState();

        processingState.$textline = $target.find('TextLine').first();
        for (var i = 0, wi=0, si=0; i < seq.length; i++) {
            // Iterating simultaneously three sequences
            //  i indexes edit sequence
            // wi indexes editor words sequence
            // si indexes alto string elements

            var $currentString = $strings.eq(si);
            var currentWord = words[wi];
            var oldSi = si;
            processingState.prepareString($currentString);

            if (seq[i] == 'match') {

                wi ++;
                si ++;
                si += processingState.processPending();

            } else if (seq[i] == 'replace') {

                si ++;
                wi ++;
                si += processingState.pushEdit( currentWord, $currentString);

            } else if (seq[i] == 'delete') {

                si ++; // skip the deleted elements for now.
                si += processingState.pushEdit( undefined, $currentString);

            } else if (seq[i] == 'add') {

                wi ++;
                si += processingState.pushEdit( currentWord, undefined);

            }

            if (si != oldSi) {
                processingState.stringDone();
            }

        }

        processingState.processPending();

        return $target.get(0);
    }

    return {
        createAlto : createAlto,
    };
});




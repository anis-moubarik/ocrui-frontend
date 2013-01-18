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
        console.log(stringLengths);
        console.log(totalLength);
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
            console.log(JSON.stringify(bb));
            precedingProportion += proportion;
            setBoundingBox($element,bb);
        }
    };

    function createAlto (source,words) {
        var originalWords = $(source).find('String').map(
            function() { return this.getAttribute('CONTENT'); }
        ).get();
        var diff = jsdiff.diff(originalWords,words);
        var seq = getEditSequence(diff);
        console.log(seq);
        var $target = $(source).find('alto').clone();
        var $strings = $target.find('String');

        var wi = 0; // content word index
        for (var i = 0; i < seq.length; i++) {
            if (seq[i] == 'match') {

                //match
                wi ++;

            } else if (seq[i] == 'replace') {

                //replace
                var $string = $strings.eq(wi);
                $string.attr('CONTENT',words[wi]);
                wi ++;

            } else if (seq[i] == 'delete') {

                //delete
                var $string = $strings.eq(wi);
                var myTL = $string.parent().get(0);
                var $textline = $string.parent();
                var bb = getBoundingBoxOf($string);

                // give deleted bounding box to the word before it
                // if it exists and is on the same line
                // Otherwise to the word after it if it exists and on the
                // same line, otherwise throw bounding box away.
                if ((wi > 0) && ($strings.eq(wi-1).parent().get(0) == myTL)) {

                    var $other = $strings.eq(wi-1);
                    var otherBB = getBoundingBoxOf($other);
                    splitBoundingBoxes([$other],[bb,otherBB]);

                } else if ((wi < $strings.length) &&
                           ($strings.eq(wi) == myTL)) {
                    var $other = $strings.eq(wi);
                    var otherBB = getBoundingBoxOf($other);
                    splitBoundingBoxes([$other],[bb,otherBB]);

                } else {
                    // throw bb away
                }
                $string.remove();

            } else if (seq[i] == 'add') {

                //add
                var $string = $($.parseXML('<String />')).find('String');
                $string.attr('CONTENT',words[wi]);

                if (wi > 0) {

                    var $other = $strings.eq(wi-1);
                    var $textline = $other.parent();
                    $other.after($string);
                    splitBoundingBoxes([$other,$string],
                            [getBoundingBoxOf($other)]);

                } else if (wi < $strings.length) {

                    var $other = $strings.eq(wi);
                    var $textline = $other.parent();
                    $other.eq(wi-1).before($string);
                    splitBoundingBoxes([$other,$string],
                            [getBoundingBoxOf($other)]);

                } else {

                    throw "No text, cannot edit.";

                }

                wi ++;

            }


        }

        return $target.get(0);
    }

    return {
        createAlto : createAlto,
    };
});

    /*
    function _createAlto (source,words) {

        /*
            words: array of words in version to be created
            source: original alto structure

            loop through diff and create alto structure
            for new content in words
            Handle each textline at a time so no merges or
            splits will ever cross line boundaries
            diff = { o : [...], n : [...] }
            o contains entry for each word in original,
            n contains entry for each word in new string,
            words are confusingly called rows here.
            entry is a string if we don't know what word it corresponds
                to in the other sequence.
            otherwise it is {row: n, text: '...'} where row is index
                to the corresponding word in other sequence
        * /

        var originalWords = this.getStringSequence(source);
        var diff = jsdiff.diff(originalWords,words);
        var $target = $(source).clone();
        var $strings = $target.find('String');

        var oi = 0;

        // We'll stick all non-matching words to stack until we hit
        // the next matching word or end of input and then distribute
        // equal amount of space to the elements in stack
        var stack = []
        // another stack for deleted or replaced words. Contains jquery
        // objects
        var $$deleted = [];
        // we also need to know what was the word just before and after
        // modifications
        var $stringBefore = undefined;
        var $stringAfter = undefined;

        function figureOutTextLine() {
            if ($$deleted.length > 0) {
                return $$deleted[0].parent();
            } else if ($stringBefore != undefined) {
                return $stringBefore.parent();
            } else if ($stringAfter != undefined) {
                return $stringAfter.parent();
            } else {
                throw "No strings! Cannot edit."
            }
        }

        function getLineToReplace($textline,$$candidates) {
            var $$line = []
            for (var i in $$candidates) {
                var $string = $$candidates[i];
                if ($string.parent().get(0) == $textline.get(0)) {
                }
            }
            return $$line;
        }

        function xxx() {
        }

        function handleDeletedWordsAndDistribute() {


            // find any pending deleted words and increment counter
            while (_.isString(diff.o[oi])) {
                // delete
                $$deleted.push($strings.get(oi));
                oi ++;
            }

            // distribute words
            var $textline = figureOutTextLine();
            var $$lineToReplace = getLineToReplace($textline,$$deleted);
            while (len($$lineToReplace)<line) {
                var $string = $.parseXML('<String />');
                addToCorrectPosition($textline,$string);
                $$lineToReplace.push($string);
            }

            var combinedBB = getCombinedBoundingBox($$lineToReplace);
            for (var i in $$lineToReplace) {

                var boundingBox = getPieceOfBoundingBox(combinedBB);
                var $s = $$lineToReplace[i];
                $s.attr('CONTENT',line[i]);
                $s.attr('HPOS',boundingBox.hpos);
                $s.attr('VPOS',boundingBox.vpos);
                $s.attr('WIDTH',boundingBox.width);
                $s.attr('HEIGHT',boundingBox.height);

            }
            $$deleted = [];
            $stringBefore = undefined;
            $stringAfter = undefined;

        }
        for ( var i = 0; i < diff.n.length; i++ ) {
            var $string = $strings.eq(i);
            var $textline = $string.parent();

            if (_.isString(diff.n[i])) {

                if (_.isString(diff.o[i])) {
                    $$deleted.push($strings.get(oi));
                    oi ++; // replace
                } else {
                    // add
                }

                stack.push(diff.n[i]);

                if ($stringBefore == undefined) {

                    $stringBefore = $strings.eq(i-1);

                }

            } else {

                // match, distribute any pending modified words and
                // go on.
                $stringAfter = $strings.eq(i);
                handleDeletedWordsAndDistribute();
                oi ++;

            }
        }

        // distribute any pending modified words.
        handleDeletedWordsAndDistribute();
        var s = seq.slice(0,20).join(' ')

            console.log(s);
        return $target;
    }
        */



/**
 *  Ocrui
 *
 *  Code to transform between Alto XML and Ocrui internal words-structure.
 *
 *  Author: juho.vuori@helsinki.fi
 */

define(['jquery','underscore'],function ($,_) {
    "use strict";

    /** Returns a new words structure from a given Alto XML
     *  See libwords for documentation of the word structure format
     */
    function alto2words(altoXML) {

        var words = [];
        var wordIndex = 0;
        var globaltlIndex = 0;

        $(altoXML).find('TextBlock').map(function (tbIndex,tb) {

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
                    
                });
                globaltlIndex++;

            });

        });

        //console.log(words);
        return words;

    }

    /** Returns a new Alto XML based on given words and original Alto XML.
     *  The original Alto XML is copied as such and then all the String-
     *  elements are removed and new ones are inserted based on words-
     *  strucute.
     */
    function words2alto(words,originalAlto) {

        var newXML = $(originalAlto).find('alto').get(0);

        // remove old strings and get lines array
        var $textlines = $(newXML).find('TextLine').map( function (i,tl) {

            $(tl).empty();
            return tl;

        });

        // These are needed if we get words that are not part of any lines
        // ( = editing a empty page)
        var $overflow;


        _.map(words,word2XML);
        
        return newXML;

        function word2XML(word) {

            var $textLine = getTextLine (word.textLine);
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
            
        }

        function getTextLine (i) {

            if (i < $textlines.length) {

                return $textlines.eq(i);

            } else {

                if (!$overflow) {

                    var $ps = $(newXML).find('PrintSpace');
                    var $block = $($.parseXML('<TextBlock/>').documentElement);
                    $overflow = $($.parseXML('<TextLine/>').documentElement);
                    $ps.append($block);
                    $block.append($overflow);
                        
                }

                return $overflow;

            }

        }

    }

    return {
        alto2words: alto2words,
        words2alto: words2alto
    };

});



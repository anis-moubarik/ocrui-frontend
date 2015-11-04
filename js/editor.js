define(['underscore','jquery','events','codemirror','alto','mybackbone','cmmode', 'dialog'],
    function (_,$,events,CodeMirror,alto,mybackbone, dialog) {
    "use strict";

    var View = mybackbone.View.extend({

        initialize: function () {
            var options = {
                type:'GET',
                url: "/api/id/"+uid+"/ping",
                statusCode: {
                    401: function() {events.trigger("saveFailed401", 'pinging the backend')},
                    403: function() {events.trigger("saveFailed", 'Forbidden')},
                }
            }
            var readonly = false;
            $.ajax(options)
                .done(function(data){
                    console.log(data)
                    if(data.code == 13){
                        console.log("ReadOnly");
                        $('#save').hide();
                        readonly = true;
                    }
                    view.render("ping");
                });
            var self = this;
            this.cmConfig = {
                value: "",
                lineWrapping: true,
                mode: 'ocrui',
                changedSince0Sequence: [],
                changedSinceSaveSequence: [],
                languageSequence: [],
                tagSequence: [],
                highlight: {},
                readOnly: readonly
            };
            this.cMirror = new CodeMirror(this.$el.get(0), this.cmConfig);

            // suppress default codemirror bindings
            CodeMirror.commands.goPageUp = function () { };
            CodeMirror.commands.goPageDown = function () { };

            this.cMirror.on('cursorActivity',function () {
                events.delayOrIgnore('setupHighlightChange',undefined,100);
            });
            this.cMirror.on('change',function (instance) {
                if (self.suppressChanged) return ;
                self.changed(instance);
            });

            self.cMirror.setOption('highlight',{17: true});

        },
        el: '#editor',
        myEvents: {
            'virtualKeyboard':'virtualKeyboard',
            'cursorToCoordinate': 'cursorToCoordinate',
            'refocus':'refocus',
            'changePage':'changePage',
            'changeMode':'changeMode',
            'requestLanguageChange':'requestLanguageChange',
            'setupHighlightChange':'setupHighlightChange',
            'pageDirtyStateChanged':'pageDirtyStateChanged',
            'showLanguage':'showLanguage',
            'showTag': 'showTag',
            'showOriginalChanges':'showOriginalChanges',
            'showSavedChanges':'showSavedChanges',
            'highlightEditorWord':'highlightEditorWord',
            'toggleLineBreak':'toggleLineBreak',
            'altoRefreshed':'altoRefreshed',
            'tagWord': 'tagWord',
            'tagTheWord': 'tagTheWord'
        },
        events: {
            'mouseover .cm-tag': 'mouseoverTag',
            'mouseout .cm-tag': 'mouseoutTag'
        },
        myModes: ['page'],
        altoRefreshed:function(alto) {

            // happens after save
            if (alto.get('pageNumber') == this.attributes.pageNumber) {

                this.setAlto(alto);

            }

        },
        setCMOption:function(opt,val) {
            this.cMirror.setOption(opt,val);
            this.refreshCM();
        },
        refreshCM:function() {

            // No idea what is the proper way, but these three lines together
            // seem to make it work always
            this.cMirror.doc.frontier = this.cMirror.doc.first;
            this.cMirror.setOption('mode',this.cmConfig.mode);
            this.cMirror.replaceSelection(this.cMirror.getSelection());

        },
        mouseoverTag:function(event){
            console.log(event.currentTarget.innerHTML)

            //For some reason for each doesn't work here
            //Loop through the words on a page and show a tooltip when a tagged word is hovered over
            var tagIndex = 0;
            for(var i = 0; i < this.alto.editorWords.length; i++){
                if(this.alto.editorWords[i].content == $.trim(event.currentTarget.innerHTML)){
                    tagIndex = i;
                    break;
                }
            }

            var offset = $(event.currentTarget).offset();

            $("#tagtcontainer").css({'top':offset.top-23,'left':offset.left+25});
            $("#tagt").html("<p id='taginfo'>Tag: "+this.alto.getTagSequence()[tagIndex]+"</p>");
            $("#tagt").fadeIn(200);

        },
        mouseoutTag:function(event){
            $("#tagt").fadeOut(100);
        },
        toggleLineBreak:function(newState) {

            this.lineBreaks = newState;
            this.setCMOption('lineWrapping', newState ? false : true);
            this.setValueFromAlto();

        },
        highlightEditorWord:function(newState) {
            this.setCMOption('showHighlight',newState);
        },
        showSavedChanges:function(newState) {
            this.setCMOption('showUnsavedChanges',newState);
        },
        showOriginalChanges:function(newState) {
            this.setCMOption('showOriginalChanges',newState);
        },
        showLanguage:function(newState) {
            this.setCMOption('showLanguage',newState);
        },
        showTag:function(newState) {
            this.setCMOption('showTag',newState);
        },
        virtualKeyboard: function(data) {
            this.cMirror.replaceSelection(data);
            this.cMirror.focus();
            var cursor = this.cMirror.getCursor();
            this.cMirror.setCursor(cursor);
        },
        requestLanguageChange: function(selected) {
            var wordIndexes = this.getCurrentWordIndexes();
            for (var wordIndexIndex in wordIndexes) {
                var i = wordIndexes[wordIndexIndex];
                this.alto.setNthWordLanguage(i,selected);
            }
            this.alto.changedSinceSave = true;
            this.cMirror.focus();
        },
        tagWord: function(ev){
            var wordIndexes = this.getCurrentWordIndexes();
            var i = 0;
            for (var wordIndexIndex in wordIndexes) {
                i = wordIndexes[wordIndexIndex];
            }
            events.trigger('showTagDialog', i);
        },
        tagTheWord: function(tagArray){
            console.log(tagArray.index + " " + tagArray.tag);
            this.alto.setNthWordTag(tagArray.index, tagArray.tag);
            this.alto.changedSinceSave = true;
            events.trigger("saveDocument");
            this.cMirror.focus();
        },
        refocus: function(ev) {
            this.cMirror.focus();
        },
        cursorToCoordinate: function(coords) {
            var content = this.cMirror.getValue();
            var line = 0;
            var ch = 0;
            var anchor,head;
            var betweenWords = false;
            if (!this.alto) { return; }
            var word = this.alto.getWordAt(coords.x,coords.y);
            if (word === undefined) {return;}
            var wordIndex = word.index;
            var wordLength = word.content.length;
            for (var i in content) {
                var c = content[i];
                if (c == '\n') {
                    line ++;
                    ch = -1;
                }
                if (c.match(/\s/)) {
                    betweenWords = true;
                } else {
                    if (betweenWords) wordIndex --;
                    if (wordIndex === 0) {
                        if (anchor === undefined) {
                            anchor = {
                                line: line,
                                ch: ch
                            }
                        }
                        head = {
                            line: line,
                            ch: ch + 1
                        }
                        wordLength --;
                        if (wordLength == 0) {
                            break;
                        }
                    }
                    betweenWords = false;
                }
                ch ++;
            }
            this.cMirror.setSelection(anchor,head);
            this.cMirror.focus();
        },
        configureCMMode: function () {
            this.cmConfig.changedSinceSaveSequence =
                this.alto.getChangedSinceSaveSequence();
            this.cmConfig.changedSince0Sequence
                = this.alto.getChangedSince0Sequence();
            this.cmConfig.languageSequence = this.alto.getLanguageSequence();
            this.cmConfig.tagSequence = this.alto.getTagSequence();
        },
        changed: function (instance) {
            var content = instance.getValue();

            if (!this.alto) return;

            this.alto.updateStringsContent(content.split(/\s+/));
            this.configureCMMode();
            this.setupHighlightChange();
        },
        getCurrentWordIndexes: function () {
            var wordIndexes = {};
            var wordIndex = -1; // in between words before first word...
            var content = this.cMirror.getValue();
            var start = this.cMirror.getCursor('start');
            var end = this.cMirror.getCursor('end');
            var s_line = start.line;
            var s_ch = start.ch;
            var e_line = end.line;
            var e_ch = end.ch;
            var betweenWords = true;
            var stillBetweenWords = false;

            for (var i in content) {

                var c = content[i];

                if (c.match(/\s/)) {

                    if (betweenWords) stillBetweenWords = true;
                    betweenWords = true;

                } else {

                    if (betweenWords) wordIndex ++;
                    betweenWords = false;
                    stillBetweenWords = false;

                }

                if (s_line <= 0) {
                    s_ch --;
                    if ((s_ch < 0) && (!stillBetweenWords)) {
                        wordIndexes[wordIndex] = true;
                    }
                }

                if (e_line <=0) {
                    e_ch --;
                    if (e_ch < 0) break;
                }

                if (c == '\n') {
                    s_line --;
                    e_line --;
                }
            }

            this.words = wordIndexes;
            var wordIndexArray = _.map(wordIndexes,function (v,k) {
                return parseInt(k,10);
            });
            return wordIndexArray;
        },
        setupHighlightChange: function () {

            var wordIndexes = this.getCurrentWordIndexes();
            var self = this;
            console.log(wordIndexes);
            var words = _.map(wordIndexes,function (v,k) {

                return self.alto.getNthWord(v);

            });


            self.cMirror.setOption('highlight',this.words);
            this.suppressChanged = true;
            this.cMirror.doc.frontier = this.cMirror.doc.first;
            this.cMirror.replaceSelection(this.cMirror.getSelection());
            this.suppressChanged = false;

            events.trigger('changeCoordinates',words);

        },
        changePage: function(attributes) {
            var self = this;
            this.attributes = attributes;
            alto.get(attributes).then(
                function(myAlto) {
                    /* if (this.attributes != attributes) return;*/
                    self.setAlto(myAlto);
                },
                function(msg) {
                    events.trigger('editorRenderError',{
                        error: 'editorRenderError',
                        message: msg
                    });
                }
            );
        },
        pageDirtyStateChanged: function() {
            if(this.alto.isDirty()) {
                this.$el.addClass('dirty');
            } else {
                this.$el.removeClass('dirty');
            }
        },
        setValueFromAlto: function(alto) {
            if (this.alto === undefined) {
                this.cMirror.setValue("");
            } else {
                var s = this.alto.getString(this.lineBreaks);
                this.cMirror.setValue(s);
            }
        },
        setAlto: function(alto) {
            this.alto = alto;
            this.setValueFromAlto();
            this.cMirror.clearHistory();
            var word = this.alto.getNthWord(0);
            this.cMirror.focus();
            events.trigger('editorRendered',this.attributes);
        },
        render: function() {
            return;     // Nothing to do, CodeMirror renders itself
        }
    });

    return {
        view: new View()
    };

});

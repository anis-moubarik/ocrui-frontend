/*global setTimeout:false */
define(['underscore','jquery','events','toolbar','codemirror','alto','backbone','cmmode'],
    function (_,$,events,toolbar,CodeMirror,alto,Backbone) {
    "use strict";

    var View = Backbone.View.extend({

        initialize: function () {
            var that = this;
            this.cMirror = new CodeMirror(this.$el.get(0), {
                value: "",
                lineWrapping: true,
                mode: 'ocrui',
                getAlto: function() {return that.getAlto();}
            });

            // Add reference to codemirror object to dom tree
            // to help automatic testing
            this.$el.data('CodeMirror',this.cMirror);

            toolbar.registerButton({
                id:'show-saved-changes',
                toggle:true,
                icon:'icon-check',
                title:'Show unsaved changes',
                modes:['page'],
                toggleCB:function(newState) {
                    that.cMirror.setOption('showUnsavedChanges',newState);
                    that.cMirror.replaceSelection(that.cMirror.getSelection());
                }});
            toolbar.registerButton({
                id:'show-original-changes',
                toggle:true,
                active:true,
                icon:'icon-edit',
                title:'Show changes made to original',
                modes:['page'],
                toggleCB:function(newState) {
                    that.cMirror.setOption('showOriginalChanges',newState);
                    that.cMirror.replaceSelection(that.cMirror.getSelection());
                }});
            toolbar.registerButton({
                id:'show-language',
                toggle:true,
                active:true,
                icon:'icon-globe',
                title:'Show language of words',
                modes:['page'],
                toggleCB:function(newState) {
                    that.cMirror.setOption('showLanguage',newState);
                    that.cMirror.replaceSelection(that.cMirror.getSelection());
                }});
            events.on('virtualKeyboard',function(data) {
                that.cMirror.replaceSelection(data);
                that.cMirror.focus();
                var cursor = that.cMirror.getCursor();
                that.cMirror.setCursor(cursor);
            });
            events.on('cursorToCoordinate',function(data) {
                
                that.moveCursorToWord(data);    

            });
            events.on('refocus',function(data) {
                that.refocus();
            });
            events.on('changePage',function(alto) {
                that.changePage(alto);
            });
            events.on('requestLanguageChange',function(selected) {
                that.requestLanguageChange(selected);
            });

            this.cMirror.on('cursorActivity',function (instance) {
                that.setupHighlightChange();
            });
            this.cMirror.on('change',function (instance) {
                that.changed(instance);
            });

        },
        requestLanguageChange: function(selected) {
            var wordIndexes = this.getCurrentWordIndexes();
            for (var wordIndex in wordIndexes) {
                this.alto.setNthWordLanguage(wordIndex,selected);
            }
            this.cMirror.replaceSelection(this.cMirror.getSelection());
            this.cMirror.focus();
        },
        el: '#editor',
        refocus: function(ev) {
            this.cMirror.focus();
        },
        moveCursorToWord: function(coords) {
            var content = this.cMirror.getValue();
            var line = 0;
            var ch = 0;
            var inMiddleOfWord = false;
            if (!this.alto) { return; }
            var wordIndex = this.alto.getWordIndexAt(coords.x,coords.y);
            if (wordIndex === undefined) {return;}
            for (var i in content) {
                var c = content[i];
                if (c == '\n') {
                    line ++;
                    ch = 0;
                }
                if (c.match(/\S/)) {
                    if (inMiddleOfWord) wordIndex --;
                    if (wordIndex === 0) {break;}
                    inMiddleOfWord = false;
                } else {
                    inMiddleOfWord = true;
                }
                ch ++;
            }
            this.cMirror.setCursor(line,ch);
            this.cMirror.focus();
        },
        changed: function (instance) {
            var content = instance.getValue();
            this.alto.updateStringContent(content);
            this.setupHighlightChange();
        },
        setupHighlightChange: function () {
            this.highlightChangePending = true;
            var that = this;
            setTimeout(function() {
                    that.triggerHighlightChange();
                }, 100);
        },
        getCurrentWordIndexes: function () {
            var wordIndexes = {};
            var wordIndex = 0;
            var content = this.cMirror.getValue();
            var start = this.cMirror.getCursor('start');
            var end = this.cMirror.getCursor('end');
            var s_line = start.line;
            var s_ch = start.ch;
            var e_line = end.line;
            var e_ch = end.ch;
            var inMiddleOfWord = false;
            for (var i in content) {
                var c = content[i];
                if (c == '\n') {
                    s_line --;
                    e_line --;
                }
                if (c.match(/\S/)) {
                    if (inMiddleOfWord) wordIndex ++;
                    inMiddleOfWord = false;
                } else {
                    inMiddleOfWord = true;
                }
                if (s_line <= 0) {

                    if (s_ch <= 0) {

                        wordIndexes[wordIndex] = true;
                    }
                    s_ch --;
                }
                if (e_line <=0) {
                    if (e_ch === 0) break;
                    e_ch --;
                }
            }
            return wordIndexes;
        },
        triggerHighlightChange: function () {

            if (!this.highlightChangePending) return;
            this.highlightChangePending = false;
            var wordIndexes = this.getCurrentWordIndexes();
            var that = this;
            var words = _.map(wordIndexes,function (v,k) {

                return that.alto.getNthWord(k);

            });

            events.trigger('changeCoordinates',words);
        },
        getAlto: function() {
            return this.alto;
        },
        changePage: function(attributes) {
            var that = this;
            this.attributes = attributes;
            alto.get(attributes).then(
                function(myAlto) {
                    /* if (this.attributes != attributes) return;*/
                    that.setAlto(myAlto);
                },
                function(msg) {
                    events.trigger('editorRenderError',{
                        error: 'editorRenderError',
                        message: msg
                    });
                }
            );
        },
        setAlto: function(alto) {
            this.alto = alto;
            var s = alto.getString();
            this.cMirror.setValue(s);
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
        view: new View(),
    };

});

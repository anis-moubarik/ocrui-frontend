/*global setTimeout:false */
define(['jquery','events','toolbar','codemirror','backbone','cmmode'],function ($,events,toolbar,CodeMirror,Backbone) {
    "use strict";

    var EmptyView = Backbone.View.extend({
        el: '#editor',
        render: function() {
            this.$el.html("<div>empty</div>");
        }
    });
    var View = Backbone.View.extend({

        initialize: function () {
            this.wordUnderCursor = {};
            var that = this;
            this.cMirror = new CodeMirror(this.$el.get(0), {
                value: "",
                lineWrapping: true,
                mode: 'ocrui',
                getAlto: function() {return that.getAlto();}
            });
            that.cMirror.setOption('showOriginalChanges',true);

            // Add reference to codemirror object to dom tree to help automatic testing
            this.$el.data('CodeMirror',this.cMirror);

            toolbar.registerButton({
                id:'show-saved-changes',
                toggle:true,
                icon:'icon-check',
                title:'Show changes made to last saved version',
                modes:['page'],
                click:function() {
                    var toggled = !($(this).hasClass("active"));
                    that.cMirror.setOption('showSavedChanges',toggled);

                    // trigger change to rehighlight
                    that.cMirror.replaceSelection(that.cMirror.getSelection());
                }});
            toolbar.registerButton({
                id:'show-original-changes',
                toggle:true,
                active:true,
                icon:'icon-edit',
                title:'Show changes made to original',
                modes:['page'],
                click:function() {
                    var toggled = !($(this).hasClass("active"));
                    that.cMirror.setOption('showOriginalChanges',toggled);

                    // trigger change to rehighlight
                    that.cMirror.replaceSelection(that.cMirror.getSelection());
                }});
            events.on('virtualKeyboard',function(data) {
                that.cMirror.replaceSelection(data);
                that.cMirror.focus();
                var cursor = that.cMirror.getCursor();
                that.cMirror.setCursor(cursor);
            });
            events.on('cursorToCoordinate',function(data) {

                if (that.alto) {
                    var index = that.alto.getWordIndexAt(data.x,data.y);
                    that.moveCursorToWord(index);    
                }

            });
            events.on('changePageAlto',function(alto) {
                that.setAlto(alto);
                that.render();
                that.cMirror.focus();
            });
        },
        el: '#editor',
        moveCursorToWord: function(wordIndex) {
            var content = this.cMirror.getValue();
            var line = 0;
            var ch = 0;
            var inMiddleOfWord = false;
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
            this.setupAltoUpdate(content);
        },
        setupAltoUpdate: function (content) {
            // instead of seting up timeout, call it strait away
            // to stay in sync with codemirror highlighter
            this.altoUpdatePending = true;
            var that = this;
            that.alto.updateAlto(content);
            that.setupHighlightChange();
        },
        setupHighlightChange: function () {
            this.highlightChangePending = true;
            var that = this;
            setTimeout(function() {
                    that.triggerHighlightChange();
                }, 100);
        },
        triggerHighlightChange: function () {

            if (!this.highlightChangePending) return;
            this.highlightChangePending = false;
            var content = this.cMirror.getValue();
            var cursor = this.cMirror.getCursor();
            var line = cursor.line;
            var ch = cursor.ch;
            var wordIndex = 0;
            var inMiddleOfWord = false;
            for (var i in content) {
                var c = content[i];
                if (c == '\n') line --;
                if (c.match(/\S/)) {
                    if (inMiddleOfWord) wordIndex ++;
                    inMiddleOfWord = false;
                } else {
                    inMiddleOfWord = true;
                }
                if (line === 0) {
                    if (ch === 0) {
                        break;
                    }
                    ch --;
                }
            }
            var word = this.alto.getNthWord(wordIndex);
            if (
                (this.wordUnderCursor && !word) ||
                (!this.wordUndeCursor && word) ||
                (word && (
                    (word.hpos != this.wordUnderCursor.hpos) ||
                    (word.vpos != this.wordUnderCursor.vpos) ||
                    (word.width != this.wordUnderCursor.width) ||
                    (word.height != this.wordUnderCursor.height)
                ))) {
                this.wordUnderCursor = word;
                events.trigger('changeCoordinates',word);
            }
        },
        getAlto: function(alto) {
            return this.alto;
        },
        setAlto: function(alto) {
            this.alto = alto;
        },
        render: function() {
            var s = this.alto.getString();
            this.cMirror.setValue(s);
            var that = this;
            this.cMirror.on('cursorActivity',function (instance) {
                that.setupHighlightChange();
            });
            this.cMirror.on('change',function (instance) {
                that.changed(instance);
            });
            var word = this.alto.getNthWord(0);
            events.trigger('changeCoordinates',word);
        }
    });

    return {
        view: new View(),
        empty: new EmptyView()
    };

});

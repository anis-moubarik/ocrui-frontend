define(['events','codemirror','backbone'],function (events) {

    EmptyView = Backbone.View.extend({
        el: '#editor',
        render: function() {
            this.$el.html("<div>empty</div>");
        }
    });
    View = Backbone.View.extend({

        initialize: function () {
            this.wordUnderCursor = {};
            var that = this;
            this.cMirror = CodeMirror(this.$el.get(0), {
                value: "",
                lineWrapping: true,
                mode: 'html'
            });
            events.on('cursorToCoordinate',function(data) {

                if (that.alto) {
                    var index = that.alto.getWordIndexAt(data.x,data.y)
                    that.moveCursorToWord(index);    
                }

            });
        },
        el: '#editor',
        moveCursorToWord: function(wordIndex) {
            var content = this.cMirror.getValue();
            var line = 0;
            var ch = 0;
            inMiddleOfWord = false;
            if (wordIndex == undefined) return;
            for (var i in content) {
                var c = content[i];
                if (c == '\n') {
                    line ++;
                    ch = 0
                }
                if (c.match(/\S/)) {
                    if (inMiddleOfWord) wordIndex --;
                    if (wordIndex == 0) break;
                    inMiddleOfWord = false;
                } else {
                    inMiddleOfWord = true;
                }
                ch ++;
            }
            this.cMirror.setCursor(line,ch);
            this.setFocus();
        },
        setFocus: function () {
            this.$el.find('.CodeMirror textarea').focus();
        },
        changed: function (instance) {
            var content = instance.getValue();
            this.alto.updateAlto(content);
            this.triggerHighlightChange();
        },
        triggerHighlightChange: function () {
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
                if (line == 0) {
                    if (ch == 0) {
                        break;
                    }
                    ch --;
                }
            }
            var word = this.alto.getNthWord(wordIndex) || {};
            if (
                (word.hpos != this.wordUnderCursor.hpos) ||
                (word.vpos != this.wordUnderCursor.vpos) ||
                (word.width != this.wordUnderCursor.width) ||
                (word.height != this.wordUnderCursor.height)
            ) {
                this.wordUnderCursor = word;
                events.trigger('changeCoordinates',word);
            }
        },
        setAlto: function(alto) {
            this.alto = alto;
        },
        render: function() {
            var s = this.alto.getString();
            this.cMirror.setValue(s);
            var that = this;
            if (this.alto.get('status') == 'success') {
                this.cMirror.on('cursorActivity',function (instance) {
                    that.triggerHighlightChange();
                });
                this.cMirror.on('change',function (instance) {
                    that.changed(instance);
                });
            } else {
            
                var $e = $('<div> ' + this.alto.get('status') + '. </div>');
                $e.css('width','100%');
                $e.css('height','100%');
                this.$el.html($e);
            }
            events.trigger('changeCoordinates',this.alto.getNthWord(0));
        }
    });

    return {
        view: new View(),
        empty: new EmptyView(),
    }

});

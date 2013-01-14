define(['events','codemirror','backbone'],function (events) {

    EmptyView = Backbone.View.extend({
        el: '#editor',
        render: function(options) {
            this.$el.html("<div>empty</div>");
        }
    });
    View = Backbone.View.extend({
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
            this.$el.find('.CodeMirror').focus();
        },
        render: function(options) {
            var s = options.alto.getString();
            if (options.alto.get('status') == 'success') {
                var element = this.$el.get(0);
                this.cMirror = CodeMirror(element, {
                    value: s,
                    lineWrapping: true,
                    mode: 'html'
                });
                this.cMirror.on('cursorActivity',function (instance) {
                    var content = instance.getValue();
                    var cursor = instance.getCursor();
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
                            ch --;
                            if (ch == 0) {
                                break;
                            }
                        }
                    }
                    word = options.alto.getNthWord(wordIndex);
                    console.log(JSON.stringify(word));
                    events.trigger('changeCoordinates',word);
                });
//                var $t = $('<textarea> ' + s + ' </textarea>');
 //               $t.css('width','100%');
  //              $t.css('height','100%');
            } else {
            
                var $e = $('<div> ' + alto.get('status') + '. </div>');
                $e.css('width','100%');
                $e.css('height','100%');
                this.$el.html($e);
            }
        }
    });

    return {
        view: new View(),
        empty: new EmptyView(),
    }

});

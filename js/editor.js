
Editor = Backbone.View.extend({
    el: '#editor',
    render: function(options) {
        var $t = $('<textarea> write here. </textarea>');
        $t.css('width','100%');
        $t.css('height','100%');
        this.$el.html($t);
    }
});

editorView = new Editor();


$.fn.facsimile = function() {

    return this.append('<p>Alpha is Go!</p>');
};
Facsimile = Backbone.View.extend({
    el: '#facsimile',
    render: function(options) {
        var $canvas = $('<canvas>HTML canvas required.</canvas>')
        $canvas.attr('width',500);
        $canvas.attr('height',500);
        this.$el.html('');
        this.$el.append($canvas);
    }
});

facsimileView = new Facsimile();



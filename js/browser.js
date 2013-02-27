define(['underscore','jquery','events','templates','mustache','mybackbone','languages'],
        function (_,$,events,templates,mustache,mybackbone,languages) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize:function() {

        },
        el: '#browser',
        events: {
        },
        myEvents: {
            'changeMode':'changeMode'
        },
        myModes: ['browser'],
        setViewActive: function () {
            this.render();
        },
        render: function (view) {
            this.$el.html('Try: <a href = "#URN:NBN:fi-fd2011-00003252">#URN:NBN:fi-fd2011-00003252</a> or <a href="#koe">#koe</a>');
        
        }

    });

    return {
        view: new View()
    };
});

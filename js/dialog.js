define(['jquery','events','mustache','mybackbone','templates'],function ($,events,mustache,mybackbone,templates) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize: function() {
            var that = this;
            this.errors = [];

        },
        el : '#dialog',
        myEvents: {
            'changePageMetsError': 'pushEvent',
            'changePageImageError': 'pushEvent',
            'changePageAltoError': 'pushEvent',
            'changePageError': 'pushEvent',
            'message': 'pushEvent'
        },
        events: {
            'click #dialog-ok': 'dropMessages'
        },
        dropMessages: function() {
            this.errors = [];
        },
        pushEvent: function(error) {
            this.errors.push(JSON.stringify(error));
            this.render();
        },
        render: function() {
            if (this.isRendered !== undefined)  {
                this.isRendered.modal('hide');
            }
            var context = {
                'dialogs': [
                    {
                        'header': 'Error',
                        'id':'messageDialog',
                        'messages': this.errors,
                        'buttons': [
                            {
                                'name':'Ok',
                                'extra':'data-dismiss="modal"',
                                'classes':'btn',
                                'id':'dialog-ok'
                            }
                        ]
                    }
                ]
            };
            var tpl = templates.get('dialog');
            this.$el.html(mustache.render(tpl,context));
            this.isRendered = $("#messageDialog");
            this.isRendered.modal();
        }
    });

    var view = new View();

    return {};
});



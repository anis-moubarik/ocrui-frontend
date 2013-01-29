/*globals console:true, $templates:false*/
define(['events','mustache','backbone'],function (events,mustache,Backbone) {
    "use strict";

    var View = Backbone.View.extend({
        initialize: function() {
            var that = this;
            this.errors = [];

            var closure = function(data) { that.pushError(data); };
            events.on('changePageMetsError', closure);
            events.on('changePageImageError', closure);
            events.on('changePageAltoError', closure);
            events.on('changePageError', closure);
            events.on('message', closure);
        },
        el : '#dialog',
        events: {
            'click #dialog-ok': 'dropMessages',
        },
        dropMessages: function() {
            this.errors = [];
        },
        pushError: function(error) {
            this.errors.push(error);
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
            var tpl = $templates.find('#dialog-template').html();
            this.$el.html(mustache.render(tpl,context));
            this.isRendered = $("#messageDialog");
            this.isRendered.modal();
        }
    });

    var view = new View();

    return {};
});



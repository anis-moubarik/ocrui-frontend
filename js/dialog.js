define(['jquery','events','mustache','mybackbone','templates', 'text!../templates/logindialog.html'],function ($,events,mustache,mybackbone,templates, logindialog) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize: function() {
            var that = this;
            this.errors = [];

        },
        el : '#dialog',
        myEvents: {
            'changeMetsError': 'pushEvent',
            'changeImageError': 'pushEvent',
            'changeAltoError': 'pushEvent',
            'changePageError': 'pushEvent',
            'saveFailed': 'pushEvent',
            'message': 'pushEvent',
            'saveFailed401': 'pushEventLogin'
        },
        events: {
            'click #dialog-ok': 'dropMessages',
            'click #modallogin': 'loginAction'
        },
        loginAction: function(){
            console.log("login!!!");
            event.preventDefault();
            var options = {
                    data : $('#loginform').serialize(),
                    type:'POST',
                    url: "/user/login"
            }

            $.ajax(options)
                .done(this.isRendered.modal('hide'))
        },
        dropMessages: function() {
            this.errors = [];
        },
        pushEventLogin: function(error){
            this.renderLoginDialog();
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
        },
        renderLoginDialog: function(){
            if(this.isRendered !== undefined) {
                this.isRendered.modal('hide');
            }
            var context = {
                'dialogs': [
                    {
                        'header': "Error saving.",
                        'id': 'messageDialog',
                        'messages': this.errors,
                        'buttons': [
                            {
                                'name': 'Ok',
                                'extra': 'data-dismiss="modal"',
                                'classes': 'btn',
                                'id': 'dialog-ok'
                            }
                        ]
                    }
                ]
            };
            this.$el.html(mustache.render(logindialog, context));
            this.isRendered = $('#messageDialog');
            this.isRendered.modal();
        }
    });

    var view = new View();

    return {};
});



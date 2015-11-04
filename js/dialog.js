define(['jquery','events','mustache','mybackbone','templates', 'text!../templates/logindialog.html', 'text!../templates/tagdialog.html', 'alto'],
    function ($,events,mustache,mybackbone,templates, logindialog, tagdialog, alto) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize: function() {
            var that = this;
            this.errors = [];
            this.index = 0;
        },
        el : '#dialog',
        myEvents: {
            'changeMetsError': 'pushEvent',
            'changeImageError': 'pushEvent',
            'changeAltoError': 'pushEvent',
            'changePageError': 'pushEvent',
            'saveFailed': 'pushEvent',
            'message': 'pushEvent',
            'saveFailed401': 'pushEventLogin',
            'showTagDialog': 'renderTagDialog',
            'readOnly': 'readOnly'
        },
        events: {
            'click #dialog-ok': 'dropMessages',
            'click #savetag': 'saveTagClicked',
            'click #modallogin': 'loginAction'
        },
        readOnly: function(){
          console.log("readonly")
        },
        loginAction: function(){
            event.preventDefault();
            var options = {
                    data : $('#loginform').serialize(),
                    type:'POST',
                    url: "/user/login"
            }

            $.ajax(options)
                .done(this.isRendered.modal('hide'))
        },
        saveTagClicked: function(event){
            event.preventDefault();
            var tag = $('#textareatag').val();
            var tagArray = {'index': this.index,
                            'tag': tag
            };
            events.trigger('tagTheWord', tagArray);
            this.isRendered.modal('hide');
        },
        dropMessages: function() {
            this.errors = [];
        },
        pushEventLogin: function(error){
            this.errors.push(JSON.stringify(error));
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
            var error = String(this.errors.pop());
            var context = {
                'dialogs': [
                    {
                        'header': "Error "+error+".",
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
        },
        renderTagDialog: function(index) {
            this.index = index;
            if (this.isRendered !== undefined)  {
                this.isRendered.modal('hide');
            }
            var context = {
                'dialogs': [
                    {
                        'header': 'Tag',
                        'id':'tagDialog',
                        'messages': null,
                        'buttons': [
                            {
                                'name':'Close',
                                'extra':'data-dismiss="modal"',
                                'classes':'btn',
                                'id':'dialog-ok'
                            }
                        ]
                    }
                ]
            };
            this.$el.html(mustache.render(tagdialog, context));
            this.isRendered = $("#tagDialog");
            this.isRendered.modal();
        }
    });

    var view = new View();

    return {};
});



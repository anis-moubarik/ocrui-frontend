/*globals console:false $templates:false */
define(['jquery','events','mustache','backbone','toolbar'],
        function ($,events,mustache,Backbone,toolbar) {
    "use strict";

    var View = Backbone.View.extend({
        initialize: function() {
            this.options = {};
            var that = this;

            events.on('changePageMets',function(mets) {
                that.setDocument(mets);
                that.render();
            });
            toolbar.registerWidget({
                id:'bib-info',
                view:this,
                classes: "btn-group form-horizontal input-prepend input-append",
                modes:['page'] });
        },

        el : '#bib-info',
        events: {
            'click #more-bib-info': 'moreBibInfo'
        },
        getMarcField : function(mets,tag,code) {
            var df = 'datafield[tag='+tag+']';
            var sf = 'subfield[code='+code+']';
            var $field = $(mets.data).
                    find('MARC\\:record, record').
                    find('MARC\\:'+df+', '+df).
                    find('MARC\\:'+sf+', '+sf);
            var text = $field.text();
            return text.replace(/[ \/.]*$/,'');
        },
        setDocument : function (mets) {
            this.title = this.getMarcField(mets,'100','a');
            this.author = this.getMarcField(mets,'245','a');
        },
        moreBibInfo : function (number) {
                console.log('x');
        },
        render: function() {
            var context = {
                author: this.author,
                title: this.title
            };
            var tpl = $templates.find('#bib-info-template').html();
            this.$el.html(mustache.render(tpl,context));
        }
    });

    var view = new View();

    return { }; // no external interface, this just registers a widget

});



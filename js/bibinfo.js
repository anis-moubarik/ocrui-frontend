define(['jquery','events','mustache','mybackbone','toolbar','templates'],
        function ($,events,mustache,mybackbone,toolbar,templates) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize: function() {
            this.options = {};
            var that = this;

            toolbar.registerWidget({
                id:'bib-info',
                index:0,
                view:this,
                classes: "btn-group form-horizontal input-prepend input-append",
                modes:['page'] });
        },

        el : '#bib-info',
        events: {
            //'click': 'moreBibInfo'
        },
        myEvents: {
            'changePageMets':function(mets) {
                    this.setDocument(mets);
                    this.render();
                },
        },
        getMarcXML : function(mets) {
            var $marc = $(mets.data).find('MARC\\:record, record');
            var node = $marc.get();
            return $marc.text(); // BUG: err, something...
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
            this.author = this.getMarcField(mets,'100','a');
            this.title = this.getMarcField(mets,'245','a');
            this.marcxml = this.getMarcXML(mets);
        },
        moreBibInfo : function (ev) {
                console.log('x');
                ev.preventDefault();
                ev.stopPropagation();
        },
        render: function() {
            var context = {
                author: this.author,
                title: this.title,
                marcxml: this.marcxml
            };
            var tpl = templates.get('bib-info');
            this.$el.html(mustache.render(tpl,context));
        }
    });

    var view = new View();

    return { }; // no external interface, this just registers a widget

});



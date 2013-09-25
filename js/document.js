define(['underscore','jquery','image','events','templates','mustache','mybackbone'],
        function (_,$,image,events,templates,mustache,mybackbone) {
    "use strict";

    var View = mybackbone.View.extend({
        initialize:function() {

            $('#document a img').appear();
        },
        el: '#document',
        events: {
            'appear':'appear',
            'scroll':'scroll',
        },
        myEvents: {
            'changeMode':'changeMode',
            'changeMets':'changeMets',
            'setDocumentOrPageMode':'setDocumentOrPageMode'
        },
        myModes: ['document'],
        setDocumentOrPageMode: function(newState) {
            if (newState) {
                events.trigger('changeMode','document');
            } else {
                events.trigger('changeMode','page');
            }
        },
        changeMets: function (mets) {
            this.pages = [];
            this.images = [];
            this.mets = mets;

            // request thumbnails
            for (var i = 0 ; i < mets.getNumberOfPages(); i++) {
                
                var pageNumber = i + 1;

                var that = this;
                var tn = image.get( {
                    docId: mets.id,
                    pageNumber: pageNumber
                });

                this.pages[i] = tn;

            }

            this.render();
        },
        setViewActive: function (mode) {
            $('#show-index').addClass('active');
        },
        setViewInctive: function (mode) {
            $('#show-index').removeClass('active');
        },
        appear: function (ev) {
            var i = parseInt($(ev.target).attr('data-pageindex'),10);
            this.pages[i].tnFetch();
        },
        scroll: function (ev) {
            $.force_appear();
        },
        render: function () {
            this.$el.html('');

            var $container = this.$el;
            for (var p in this.mets.pageInfo) {
                var pageNumber = parseInt(p,10) + 1;
                var url = '#'+this.mets.id+'/' + pageNumber;
                var $li = $('<a href="'+url+'" id="tn' + pageNumber + '"></a>');
                var tn = this.pages[p];
                if (tn === undefined) {
                    $li.append(pageNumber);
                } else {
                    $li.append(tn.tnImage);
                    $(tn.tnImage).attr('alt',pageNumber);
                    $(tn.tnImage).attr('data-pageindex',p);
                }
                $container.append($li);

            }
            this.scroll();

        }

    });

    return {
        view: new View()
    };
});

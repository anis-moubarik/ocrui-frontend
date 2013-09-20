/* A custom sync method to override backbone default */

define(['backbone','underscore','events'],function (Backbone,_,events) {
    "use strict";

    var Model = Backbone.Model.extend({sync:sync});

    // if an existing element is not provided...
    var View = function(options) {
        this.cid = _.uniqueId('view');
        this._configure(options || {});
        this._ensureElement();
        this.initialize.apply(this, arguments);
        this.delegateMyEvents();
        this.delegateEvents();
    };

    View.prototype.currentMode = function() {
        return this.mode;
    };

    View.prototype.isViewActive = function() {
        return this.viewIsActive ? true : false;
    };

    View.prototype.changeMode = function(mode) {
        if (this.mode == mode) { return; }
        this.mode = mode;
        if (this.myModes.indexOf(mode) != -1) {
            this.viewIsActive = true;
            this.$el.css('display','block');
            if (this.setViewActive !== undefined) this.setViewActive(mode);
        } else {
            this.viewIsActive = false;
            this.$el.css('display','none');
            if (this.setViewInactive !== undefined) this.setViewInactive(mode);
        }
    };

    View.prototype.delegateMyEvents = function (evs) {
        var that = this;
        function cbFactory(m) {
            return function () {m.apply(that,arguments);};
        }

        if (!(evs || (evs = _.result(this, 'myEvents')))) return;
        //this.undelegateMyEvents();
        for (var key in evs) {
            var method = evs[key];
            if (!_.isFunction(method)) method = this[evs[key]];
            if (!method) throw new Error('Method "' + evs[key] + '" does not exist');

            events.on(key,cbFactory(method));
        }
    };

    _.extend(View.prototype, Backbone.View.prototype);
    View.extend = Backbone.View.extend;

    var urlError = function() {
        throw new Error('A "url" property or function must be specified');
    };

    function sync(method, model, options) {

        var methodMap = {
            'create': 'POST',
            'update': 'PUT',
            'patch':  'PATCH',
            'delete': 'DELETE',
            'read':   'GET'
        };

        var type = methodMap[method];

        // Default options, unless specified.
        _.defaults(options || (options = {}), {
            emulateHTTP: Backbone.emulateHTTP,
            emulateJSON: Backbone.emulateJSON
        });

        // Default JSON-request options.
        var params = {type: type, dataType: this.dataType||'xml'};

        // Ensure that we have a URL.
        if (!options.url) {
            params.url = _.result(model, 'url') || urlError();
        }

        // Ensure that we have the appropriate request data.
        if (options.data === null && model && (method === 'create' || method === 'update' || method === 'patch')) {
            params.contentType = 'application/xml';
            params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (options.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? {model: params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
            params.type = 'POST';
            if (options.emulateJSON) params.data._method = type;
            var beforeSend = options.beforeSend;
            options.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
                if (beforeSend) return beforeSend.apply(this, arguments);
            };
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !options.emulateJSON) {
            params.processData = false;
        }

        var success = options.success;
        options.success = function(resp) {
            if (success) success(model, resp, options);
            model.trigger('sync', model, resp, options);
        };

        var error = options.error;
        options.error = function(xhr) {
            if (error) error(model, xhr, options);
            model.trigger('error', model, xhr, options);
        };

        // Make the request, allowing the user to override any Ajax options.
        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        model.trigger('request', model, xhr, options);
        return xhr;
    }

    return {
        Model : Model,
        View : View
    };
});




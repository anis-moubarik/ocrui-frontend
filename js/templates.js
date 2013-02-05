define([], function () {

    var templates = {

        "toolbar": ' {{#widgets}} <div class="{{classes}}" id="{{id}}"> </div> {{/widgets}} <div id="buttons" class="btn-group"> {{#buttons}} <button type="button" class="{{classes}}" id="{{id}}" {{{extra}}} title="{{title}}"> {{#icon}} <i class="{{icon}}"> </i> {{/icon}} {{#text}} {{text}} {{/text}} </button> {{/buttons}} </div>',

        "page-selector": ' <button class="btn" id="page-previous" title="Previous page"> <i class="icon-arrow-left"> </i> </button> <input type="text" class="span1" id="page-number" title="Page number" value="{{pageNumber}}"/> <button class="btn disabled" title="Number of pages">/ {{pages}}</button> <button class="btn" id="page-next" title="Next page"> <i class="icon-arrow-right"> </i> </button> ',

        "bib-info": ' <div class="dropdown"> <a class="dropdown-toggle bib-info" data-toggle="dropdown" data-target="#">{{author}}: {{title}}</a> <div class="more-bib-info dropdown-menu" role="menu" aria-labelledby="dLabel"> <h2> marcxml</h2> <p> {{marcxml}} </p> </div> </div>',


        "language-selector": ' <div class="pull-right"> <form id="language-selector" class="navbar-form"> <select> {{#languages}} <option {{{selected}}} value="{{code}}" >{{name}}</option> {{/languages}} </select> </form> </div> <div id="keyboard" class="btn-group"> {{#chars}} <a href="#" class="btn" data-character="{{.}}">{{.}}</a> {{/chars}} </div> ',

        "dialog": ' {{#dialogs}} <div class="modal hide" id="{{id}}"> <div class="modal-header"> <h3>{{header}}</h3> </div> <div class="modal-body"> {{#messages}} <p>{{.}}</p> {{/messages}} </div> <div class="modal-footer"> {{#buttons}} <button class="{{classes}}" {{{extra}}} id="{{id}}"> {{name}} </a> {{/buttons}} </div> </div> {{/dialogs}} '

    };

    function get(id) {
        var tpl = templates[id];
        if (tpl === undefined) { throw 'no such template'; }
        return tpl;
    }

    return {get:get};
});

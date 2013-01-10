var $toolbar = undefined;

$.fn.toolbar = function() {
    $toolbar = this;
    registerAction({name:'koenappi'});
    return;
};

function registerAction(options) {

    var $b = $('<div />');
    $b.attr("class","btn");
    $b.text(options.name);
    $toolbar.append($b);

}


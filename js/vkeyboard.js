var vkeyboard = undefined;


$.fn.vkeyboard = function() {

    $vkeyboard = this;
    registerLanguage();

};

function registerLanguage(lang) {
    var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o',
        'p','q','r','s','t','u','v','w','x','y','z'];
    _.each(chars,function(v) {
        var $b = $('<div />');
        $b.attr("class","btn");
        $b.text(v);
        $vkeyboard.append($b);
    });

}

function changeKeyboardLanguage(lang) {
};


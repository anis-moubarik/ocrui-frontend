casper.echo( "OC-62: Virtuaalinäppäimistö: klikattava näppäin tulee editoriin, kielen vaihtaminen vaihtaa näppäimistön halutuksi" );

casper.start(settings.defaultPageUrl,mytests.initCasper());

var cursor;
var initialContent;

casper.then(function() {
    casper.test.assertExists('#vkeyboard');
});

casper.waitForText( "Pienet", null, null, 10000 ); // ensure editor is there

casper.then(function() {

    initialContent = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    casper.fill('#language-selector',{lang:'fi'});
    casper.echo('clicked Suomi');
    casper.capture('koe.png');

});

// Wait for virtual keyboard to change
casper.waitFor(function () {

    var expectedButtons = [
        "A","a","Ä","ä","Å","å","B","в","C","c","Ç","ç","D","d","Ə",
        "ә","E","e","F","f","G","g","Y","y","I","i","J","j","K","k",
        "L","l","M","m","N","n","O","o","Ö","ö","P","p","R","r","S",
        "s","Ş ş","T","t","U","u","V","v","X","x","Z","z","Ƶ","ƶ","Ь",
        "ь","rx","lh"
    ];

    var buttons = casper.evaluate(function () {
        var buttons = $('#vkeyboard a').map(function () {
            return this.textContent;
        }).get();

        return buttons;
    });

    for (var i in expectedButtons) {
        if (buttons[i] != expectedButtons[i]) return false;
    }

    casper.test.assert(true,'expecting keyboard: ' + expectedButtons +
        ', got ' + buttons);

    return true;

});

casper.then(function() {
    casper.click('#vkeyboard a');
});

casper.waitFor(function () {
    var contentNow = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    if (contentNow == 'A' + initialContent) {
        casper.test.assert(true,'Got expected editor value change.');
        return true;
    }
    if (contentNow == initialContent) {
        casper.log('Editor content still unchanged');
    }
    return false;
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



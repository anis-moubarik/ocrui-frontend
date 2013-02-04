casper.echo( "OC-62: Virtuaalinäppäimistö: klikattava näppäin tulee editoriin, kielen vaihtaminen vaihtaa näppäimistön halutuksi" );

casper.start(settings.defaultPageUrl,mytests.initCasper());

var cursor;
var initialContent;

casper.then(function() {
    casper.test.assertExists('#vkeyboard');
});

casper.waitForText( "Pienet" ); // ensure editor is there

casper.then(function() {

    initialContent = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    casper.clickLabel('Suomi'); 
    casper.echo('clicked Suomi');

});

// Wait for virtual keyboard to change
casper.waitFor(function () {

    var expectedButtons = ['å','ä','ö'];

    var buttons = casper.evaluate(function () {
        var buttons = $('#vkeyboard div a').contents().get();
        var buttons = $('#vkeyboard div a').contents().get();
        var buttons = $('#vkeyboard div a').map(function () {
            return this.textContent;
        }).get();

        return buttons;
    });

    console.log(buttons);
    for (var i in expectedButtons) {
        if (buttons[i] != expectedButtons[i]) return false;
    }

    casper.test.assert(true,'expecting keyboard: ' + expectedButtons +
        ', got ' + buttons);

    return true;

});

casper.then(function() {
    casper.click('#vkeyboard div a');
});

casper.waitFor(function () {
    var contentNow = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    if (contentNow == 'å' + initialContent) {
        casper.test.assert(true,'Got expected editor value change.');
        return true;
    }
    if (contentNow == initialContent) {
        return casper.log('Editor content still unchanged');
    }
    return false;
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



var testName = "OC-62: Virtuaalinäppäimistö: klikattava näppäin tulee editoriin, kielen vaihtaminen vaihtaa näppäimistön halutuksi"

var settings = require('./settings');
var mytests = require('./mytests');
var utils = require('utils');
var casper = require('casper').create(mytests.debugOptions);
var url = settings.url+'#'+settings.testItem+'/11';

var cursor;

casper.start(url,mytests.initCasper(testName));

casper.log("","info");

casper.then(function() {
    casper.test.assertExists('#vkeyboard');
});

casper.waitForText( "Pienet" ); // ensure editor is there

var initialContent;
casper.then(function() {

    initialContent = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    casper.clickLabel('Suomi'); 

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
    casper.test.done();
    casper.exit();
});



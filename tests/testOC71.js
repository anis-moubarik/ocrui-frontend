casper.echo( "OC-71: Tekstiä editoitaessa, highlightboksit jakautuvat oikein sanoja splitatessa / mergetessä" );

var settings     = require('./settings');
var mytests      = require('./mytests');

casper.start(settings.defaultPageUrl);

casper.then(function() {
    this.test.assertExists('#editor');
});

casper.waitForText( "Pienet");

casper.then(function() {

    // place cursor on 'kultahanhet'
    var newCursor = this.evaluate( function () {
        require('editor').view.cMirror.setCursor(6,9);
        return require('editor').view.cMirror.getCursor();
    });

    this.test.assertEqual(newCursor.line,6, "cursor move line");
    this.test.assertEqual(newCursor.ch,9, "cursor move ch");

});

casper.waitForHighlight( [ { left:215, top:552, width:178, height:34 } ] );

casper.then(function () {
    this.page.sendEvent('keypress',' ');
});

casper.waitForHighlight( [ { left:375, top:552, width:17, height:34 } ] );

casper.then(function() {
    // place cursor on 'kultahanhet'
    var newCursor = this.evaluate( function () {
        require('editor').view.cMirror.setCursor(6,9);
        return require('editor').view.cMirror.getCursor();
    });

    this.test.assertEqual(newCursor.line,6, "cursor move line");
    this.test.assertEqual(newCursor.ch,9, "cursor move ch");

});

casper.waitForHighlight( [ { left:215, top:552, width:160, height:34 } ] );

casper.then(function () {
    
    // combine this and following words
    this.page.sendEvent('keypress',this.page.event.key.Delete);
    this.page.sendEvent('keypress',this.page.event.key.Right);
    this.page.sendEvent('keypress',this.page.event.key.Delete);
});

casper.waitForHighlight( [ { left:164, top:552, width:287, height:34 } ],
null, function() {casper.capture('failed.png');}, 4000 );

casper.run(function() {
    this.test.done();
});



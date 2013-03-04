casper.echo( "OC-110: tavutettu sana jakautuu oikein kahdeksi highlight boksiksi" );

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.then(function() {
    this.test.assertExists('#editor');
});

casper.waitForText( "Pienet");

casper.then(function() {

    // place cursor on 'kultahanhet'
    newCursor = this.evaluate( function () {
        require('editor').view.cMirror.setCursor(15,50);
        return require('editor').view.cMirror.getCursor();
    });

    this.test.assertEqual(newCursor.line,15, "cursor move line");
    this.test.assertEqual(newCursor.ch,50, "cursor move ch");

});

casper.waitFor(function() {

    expectedBoundss = [
        { left:373, top:640, width:78, height:26},
        { left:-367, top:686, width:110, height:27}
    ];
    if (casper.exists(".highlight-box")) {
        var boundss = [
            casper.getElementBounds(".highlight-box:nth-of-type(1)"),
            casper.getElementBounds(".highlight-box:nth-of-type(2)"),
        ];

        for (var i in expectedBoundss) {
            var eb = expectedBoundss[i];
            var b = boundss[i];

            if (mytests.cmpObjects(b,eb)) {
                this.test.assert(true, "Got correct highlight box after click");
                return true;
            }
        }
    }

    return false

});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



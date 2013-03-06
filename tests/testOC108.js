casper.echo( "OC-108: Teksti on rivitettyä, kun rivitys button on painettuna ja yhtä pötköä kun ei painettuna." );

casper.start(settings.defaultPageUrl);

casper.waitForText("Pienet");

casper.then(function() {
    var content = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    casper.test.assert(settings.expectedContent == content,
        'Original content is with linebreaks');
    casper.click('#toggle-linebreaks');
    casper.echo('toggled linebreaks on.');
});

casper.then(function() {
    var content = casper.evaluate(function () {
        return require('editor').view.cMirror.getValue();
    });
    casper.test.assert(settings.expectedNoLines == content,'Text is now displayed with linebreaks.');
});

casper.run(function() {
    this.test.done();
});



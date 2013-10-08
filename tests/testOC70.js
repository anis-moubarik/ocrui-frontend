casper.echo( "OC-70: Tekstiä editoitaessa muutetut sanat renderöidään omalla tyylillään" );

var settings     = require('./settings');
var mytests      = require('./mytests');


casper.start(settings.defaultPageUrl);

casper.waitForText( "Pienet" ); // ensure editor is there

casper.then(function() {
    var data = mytests.getEditorData(casper);

    var cursor = data.cursor;
    var content = data.content;
    var slice = content.substring(0,8);

    casper.test.assert(
        (cursor.ch == 0) && (cursor.line == 0),
        "Cursor is at the beginning"
    );

    casper.test.assertEqual(slice,"Sisällys");
    casper.sendKeys(".CodeMirror","koe");

    casper.log(slice);
});

casper.waitForText( "koeSisällys" ); // wait for text to be rendered

casper.then(function() {
    var info = casper.getElementInfo('.cm-changed');
    var text = info.text.replace(/[\s]/,'');
    casper.test.assertEqual(text,"koeSisällys");
});

casper.run(function() {
    this.test.done();
});



casper.echo( "OC-76: Työkalupalkki: Buttonit ja widgetit löytyvät dom-puusta. Show changes -toggle-nappulan tila vaihtuu klikatessa." );


var myButton = "#show-original-changes";

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.waitForSelector( myButton ); // wait for my button

casper.then(function() {
    var info = casper.getElementInfo(myButton);

    casper.test.assert(
        mytests.elementInfoContainsClass(info,'active'),
        'Initial original changes state active'
    );

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
    casper.click(myButton);
});

casper.waitFor(function (){
    var info = casper.getElementInfo(myButton);
    return ! mytests.elementInfoContainsClass(info,'active');
});

casper.then(function() {
    casper.test.assert(
        !casper.exists('.cm-changed'),
        "Edited word is no more rendered differently"
    );
    casper.click(myButton);
});

casper.waitFor(function (){
    var info = casper.getElementInfo(myButton);
    return mytests.elementInfoContainsClass(info,'active');
});

casper.then(function() {
    casper.test.assert(
        casper.exists('.cm-changed'),
        "Edited word is again rendered differently"
    );
    casper.click(myButton);
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});


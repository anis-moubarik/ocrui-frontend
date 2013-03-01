casper.echo( "OC-64: Editoitavan itemin tekijä ja otsikko näkyvät oikein" );

var selector = '#bib-info';
var selector2 = selector + ' a';

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.waitForSelector(selector2,undefined,function() {
    casper.echo( 'not found.' );
    // casper.echo( casper.page.content );
},10000);

casper.then(function() {


    this.test.assertExists(selector)
    var bibinfo = this.getElementInfo(selector2);
    var text = bibinfo.text;
    var expected = settings.testAuthor + ': ' + settings.testTitle
    this.test.assertEqual(text,expected,'Correct bibinfo');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});


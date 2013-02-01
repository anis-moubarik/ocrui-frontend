casper.echo( "OC-64: Editoitavan itemin tekijä ja otsikko näkyvät oikein" );

var selector = '#bib-info';

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.waitForSelector(selector,undefined,function() {
    casper.echo( 'not found.' );
    casper.echo( casper.page.content );
});

casper.then(function() {


    this.test.assertExists(selector)
    var bibinfo = this.getElementInfo(selector + ' input');
    var value = bibinfo.attributes.value;
    var expected = settings.testAuthor + ': ' + settings.testTitle
    this.test.assertEqual(value,expected,'Correct bibinfo');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});


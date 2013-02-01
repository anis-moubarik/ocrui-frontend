var testName = "OC-72: Sivun vaihto toimii. Uusi sivunumero näkyy oikein ja valitun sivun teksti ja faksimiili renderöityvät oikein."

var settings = require('./settings');
var mytests = require('./mytests');
var utils = require('utils');
var url = settings.url+'#'+settings.testItem+'/11';

var myButton = "#page-next";

casper.start(url,mytests.initCasper(testName));

casper.waitForSelector( myButton ); // wait for my button

casper.waitForText( "Pienet" ); // wait for editor text

casper.then(function() {
    var value = casper.getElementInfo('#page-number').attributes.value;
    casper.test.assertEqual(value,'11');
    casper.click(myButton);
});


casper.waitFor( function () {
    var value = casper.getElementInfo('#page-number').attributes.value;
    return value == '12';
});

casper.waitForText( "The age demanded an image ofits accelerated grimace" );

casper.then(function() {
    var value = casper.getElementInfo('#page-number').attributes.value;
    casper.test.assertEqual(value,'12');
    casper.click("#page-previous");
});

casper.waitForText( "Pienet" ); // wait for editor text

casper.waitFor( function () {
    var value = casper.getElementInfo('#page-number').attributes.value;
    return value == '11';
});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});


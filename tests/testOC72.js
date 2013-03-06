casper.echo( "OC-72: Sivun vaihto toimii. Uusi sivunumero näkyy oikein ja valitun sivun teksti ja faksimiili renderöityvät oikein." );


var myButton = "#page-next";

casper.start(settings.defaultPageUrl);

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

casper.waitForText( "The age demanded an image" );

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
});


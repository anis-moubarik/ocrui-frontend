casper.echo( "OC-115: Pan+zoom ja rotaation jälkeen viewport näkyy oikein url:ssä" );

var fs = require('fs');
var expected1 = btoa(fs.read('images/canvas.png','b'));
var expected2 = btoa(fs.read('images/canvas-panned.png','b'));
var expectedUrl = settings.defaultPageUrl + '/506.5x584x2xV'

casper.start(settings.defaultPageUrl);

casper.waitFor(function() {

    var canvasB64 = casper.captureBase64('png','#facsimile-container');
    //fs.write('koe.png',atob(canvasB64),'b'); // to see what we got
    return (canvasB64 == expected1);

});

casper.then(function() {

    casper.test.assert(true,'Original canvas renders ok.');
    casper.page.sendEvent('mousedown',400,400,'left');
    casper.page.sendEvent('mousemove',150,150);
    casper.test.assertExists('#zoom-in');
    casper.log('panned');
    casper.click('#zoom-in');
    casper.log('clicked #zoom-in');
    casper.test.assertExists('#layout-selector');
    casper.click('#layout-selector');
    casper.log('clicked #layout-selector');

});

casper.waitFor(function() {

    var url = casper.getCurrentUrl();

    return (url == expectedUrl);

}, function() {
    this.test.assert(true,'Url now ' + casper.getCurrentUrl());
}, function() {
    this.test.assert(false,'Url now '+casper.getCurrentUrl());
});

casper.run(function() {
    this.test.done();
});



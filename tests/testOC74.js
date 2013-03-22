casper.echo( "OC-74: Aluksi renderöityy joku kuva ja mouse down -> move -> up sekvenssin jälkeen renderöityy sama kuva eri paikkaan" );

var fs = require('fs');
var expected1 = btoa(fs.read('images/canvas.png','b'));
var expected2 = btoa(fs.read('images/canvas-panned.png','b'));

casper.start(settings.defaultPageUrl);

casper.waitFor(function() {

    var canvasB64 = casper.captureBase64('png','#facsimile-container');
    //fs.write('koe.png',atob(canvasB64),'b'); // to see what we got
    return (canvasB64 == expected1);

});

casper.then(function() {

    this.test.assert(true,'Original canvas renders ok.');
    this.page.sendEvent('mousedown',400,400,'left');
    this.page.sendEvent('mousemove',150,150);

});

casper.waitFor(function() {

    var canvasB64 = casper.captureBase64('png','#facsimile-container');
    //fs.write('koe2.png',atob(canvasB64),'b'); // to see what we got
    return (canvasB64 == expected2);

});

casper.then(function() {

    this.test.assert(true,'Panned canvas renders ok.');
    this.page.sendEvent('mouseup',400,400,'left');

});

casper.run(function() {
    this.test.done();
});



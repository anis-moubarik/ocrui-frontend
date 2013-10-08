casper.echo( "OC-75: Zoom: Zoom button renderöi faksimiilin zoomatussa muodossa" );

var settings     = require('./settings');
var mytests      = require('./mytests');

var fs = require('fs');
var expected1 = btoa(fs.read('images/canvas.png','b'));
var expected2 = btoa(fs.read('images/canvas-zoomed.png','b'));

casper.start(settings.defaultPageUrl);

casper.then(function() {
    var r = casper.evaluate(function() {
        window.facsimileRendered = false;
        require('events').on('facsimileRendered',function(data) {
            window.facsimileRendered = true;
        });
    });
    casper.test.assertExists('#facsimile-canvas');
});

casper.waitFor(function() {
    return casper.evaluate(function() {
        console.log(window.facsimileRendered);
        return window.facsimileRendered === true;
    });
});

casper.then(function() {

    var canvasB64 = casper.captureBase64('png','#facsimile-container');

    //fs.write('koe.png',atob(canvasB64),'b'); // to see what we got

    casper.test.assert(canvasB64 == expected1, "Canvas renders correctly");
    casper.evaluate(function() {
        window.facsimileRendered = false;
    });
    casper.test.assertExists('#zoom-in');
    casper.click('#zoom-in');
    casper.log('clicked #zoom-in');

});

casper.waitFor(function() {
    return casper.evaluate(function() {
        console.log(window.facsimileRendered);
        return window.facsimileRendered === true;
    });
});

casper.then(function() {
    var canvasB64 = casper.captureBase64('png','#facsimile-container');

    //fs.write('koe2.png',atob(canvasB64),'b'); // to see what we got

    casper.test.assert(canvasB64 == expected2, "Canvas renders correctly zoomed");

});

casper.run(function() {
    this.test.done();
});



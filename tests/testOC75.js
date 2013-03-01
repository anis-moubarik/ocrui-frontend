casper.echo( "OC-75: Zoom: Zoom button renderöi faksimiilin zoomatussa muodossa" );

var fs = require('fs');

casper.start(settings.defaultPageUrl,mytests.initCasper());

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
    var expected = btoa(fs.read('images/canvas.png','b'));

    //fs.write('koe.png',atob(canvasB64),'b'); // to see what we got

    casper.test.assert(canvasB64 == expected, "Canvas renders correctly");
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
    var expected = btoa(fs.read('images/canvas-zoomed.png','b'));

    //fs.write('koe2.png',atob(canvasB64),'b'); // to see what we got

    casper.test.assert(canvasB64 == expected, "Canvas renders correctly zoomed");

});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



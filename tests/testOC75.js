var testName = "OC-75: Zoom: Zoom button renderöi faksimiilin zoomatussa muodossa"

var settings = require('./settings');
var mytests = require('./mytests');
var utils = require('utils');
var url = settings.url+'#'+settings.testItem+'/11';

var expected_canvas = require('./expected_canvas').b64;
var expected_canvas_zoomed = require('./expected_canvas_zoomed').b64;

casper.start(url,mytests.initCasper(testName));

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
    var canvas = casper.captureBase64('png','#facsimile-canvas');
    casper.test.assert(canvas == expected_canvas,
        "Canvas renders correctly");
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
    var canvas = casper.captureBase64('png','#facsimile-canvas');
    casper.test.assert(canvas == expected_canvas_zoomed,
        "Canvas renders correctly zoomed");

});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



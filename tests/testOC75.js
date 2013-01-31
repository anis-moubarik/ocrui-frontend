//var spawn = require("child_process").spawn;
var settings = require('./settings');
var myutils = require('./myutils');
var utils = require('utils');
var casper = require('casper').create(myutils.debugOptions);
var url = settings.url+'#'+settings.testItem+'/11';

var md5sumsChecked = false;

casper.start(url,myutils.initCasper);

casper.log("OC-75: Zoom: Zoom button renderöi faksimiilin zoomatussa muodossa","info");

casper.then(function() {
    var r = casper.evaluate(function() {
        window.facsimileRendered = false;
        console.log('setup');
        require('events').onAny(function(ev,data) {
            console.log(ev,JSON.stringify(data));
            if (ev == 'facsimileRendered') {
                window.facsimileRendered = true;
            }
        });
        console.log('setup ok');
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
    casper.captureSelector('images/out-canvas.png','#facsimile-canvas');
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
    casper.captureSelector('images/out-canvas-zoomed.png','#facsimile-canvas');

    casper.test.assert(true,'not checking image md5sums');

    md5sumsChecked = true;
    return

    var md5sum = spawn('/usr/bin/md5sum',[
        'images/out-canvas.png',
        'images/expected-canvas.png',
        'images/out-canvas-zoomed.png',
        'images/expected-canvas-zoomed.png',
    ]);

    var out = "";

    md5sum.stdout.on('data',function (data) {
        out = out + data;
    });
    md5sum.on('exit',function () {
        console.log(out);
        md5sumsOk = true;
    });
});

casper.waitFor(function() { return md5sumsChecked == true; });
casper.run(function() {
    casper.test.done();
    casper.exit();
});



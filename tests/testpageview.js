var settings = require('./settings');
var casper = require('casper').create();

var url = settings.url+'#'+settings.testItem+'/11';
casper.start(url, function() {
    this.echo (url);
});

casper.then(function() {
    this.test.assertExists('#zoom-in');
    this.test.assertExists('#zoom-out');
    this.test.assertExists('#pan-zoom');
    this.test.assertExists('#save');
    this.test.assertExists('#page-selector')
});

casper.then(function() {
    //this.captureSelector('koe.png','body');
});

casper.run(function() {
    this.test.done();
    this.exit();
});


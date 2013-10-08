var expect = require('chai').expect,
    webdriverjs = require("webdriverjs"),
    conf = require("./conf"),
    client = webdriverjs.remote({
        hostname:conf.seleniumHost,
        port:conf.seleniumPort,
    });

describe('Run Selenium tests', function() {

    before(function(done) {
        // Add some helper commands
        client.addCommand('hasText', function(selector, text, callback) {
            this.getText(selector, function(err,result) {
                console.log('"laalaa"');
                console.log(selector,result);

                expect((result||{}).value).to.have.string(text);
                callback();
            });
        });
        client.addCommand('waitUntilHasText', function(selector, text, callback) {
            var self = this;
            function checkText() {
                console.log('"liilii"');
                self.getText(selector, function (err, result) {
                    console.log(result);
                    var value = (result||{}).value;
                    if (value!= -1) {
                        callback()
                    } else {
                        setTimeout(checkText, 500);
                    }
                })
            }
            checkText();
        });
        client.addCommand('waitUntilVisible', function(element, callback) {
            var self = this;
            function checkElement() {
                console.log('"zuuzuu"');
                self.isVisible(element, function(err,result) {
                    if (result === true) {
                        callback();
                    } else {
                        setTimeout(checkElement, 500);
                    }
                });
            }
            checkElement();
        });
        client.addCommand('getEditorContent', function(element, callback) {

            function clientSide (){

                return require('editor').view.cMirror.getValue();

            }
            this.execute( clientSide, [], function (val) {
                console.log('read ', val);
                callback(null,val);
                });
        });
        done();
    });

    beforeEach(function(done) {
        // Navigate to the URL for each test
        console.log('init');
        client.init();
        client.url(conf.defaultPageUrl, done);
    });
    
    it('OC-108: Teksti on rivitettyä, kun rivitys button on painettuna ja yhtä pötköä kun ei painettuna.', function(done) {
        console.log('"1"');
        client
            .waitUntilHasText(".CodeMirror","Pienet")
            .getEditorContent( function(err,content) {
                console.log('jee2');
                expect(content).to.equal(conf.expectedContent);
            })
            .click('#toggle-linebreaks')
            .getEditorContent( function (err, content) {
                expect(content).to.equal(conf.expectedNoLines);
            });
    });

    afterEach(function(done) {
        console.log('end');
        client.end();
        done();
    });

});


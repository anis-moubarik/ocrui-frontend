
'use strict';

function onError  (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line +
                (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    this.log(msgStack.join('\n'),'error');
}

function onConsoleMessage  (casper,msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum +
        ' in "' + sourceId + '")');
}

function onResourceReceived (casper,response) {
    if ( response.stage == 'end' ) {
        casper.log('Received: ' + JSON.stringify(response.url),'info');
    }
    //console.log('Response (#' + response.id + ', stage "' +
    //    response.stage + '"): ' + JSON.stringify(response));
}

function onResourceRequested (casper,request) {
    casper.log('Request (#' + request.id + '): ' +
        JSON.stringify(request.url),'info');
}

var _initDone = false;

function initCasper () {
    return function() {
        if (_initDone) return;
        _initDone = true;
        this.on('error',onError);
        this.on('resource.received', function (resource) {
            if ( resource.stage == 'end' ) {
                casper.log('Received: ' + JSON.stringify(resource.url),'info');
            }
        });

        this.on('resource.requested', function(req) {
            console.log('Request: ' + JSON.stringify(req.url));
        });
    };
}

function cmpObjects (o1,o2) {
    for (var key in o1) {
        if (o1[key] != o2[key]) return false;
    }
    for (var key in o2) {
        if (o1[key] != o2[key]) return false;
    }
    return true;
}

function assertEqualObjects (test,o1,o2) {

    test.assertEqual(Object.keys(o1).length, Object.keys(o2).length,
        "Objects have same amount of keys");

    for (var key in o1) {
        
        test.assertEqual (o1[key],o2[key], "property '"+key+"' matches.");

    }

}

function assertHighlightBoxes(c,hbs1,hbs2) {
    c.test.assertEqual(hbs1.length,hbs2.length,
        'right number of highlight boxes');
    for (var i in hbs1) {
        var hb1 = hbs1[i];
        var hb2 = hbs2[i];
        c.test.assertEqual(hb1.hpos, hb2.hpos, "hpos same");
        c.test.assertEqual(hb1.vpos, hb2.vpos, "vpos same");
        c.test.assertEqual(hb1.width, hb2.width, "width same");
        c.test.assertEqual(hb1.height, hb2.height, "height same")
    }
}

function getEditorData(casper) {
    var data = casper.evaluate(function () {
        var cMirror = require('editor').view.cMirror;
        return {
            cursor : cMirror.getCursor(),
            content : cMirror.getValue()
        };
    });

    if (data == null) {
        casper.assert(false,'Got null while fetching editor content');
        casper.die();
    }

    return data;
}

function elementInfoContainsClass(info,cls) {
    var classes = info.attributes.class.split(' ');
    var contains = false;
    for (var i in classes) {
        if (classes[i] == cls) {
            return true;
        }
    }
    return false;
}

var viewportSize = {
    width:1024,
    height:768
};

var debugOptions = {

    viewportSize: viewportSize,
    verbose: true,
    logLevel: 'debug'
};


var normalOptions = {

    viewportSize: viewportSize,
    waitTimeout: 10000
};


exports.elementInfoContainsClass = elementInfoContainsClass;
exports.assertEqualObjects = assertEqualObjects;
exports.assertHighlightBoxes = assertHighlightBoxes;
exports.cmpObjects = cmpObjects;
exports.onResourceRequested = onResourceRequested;
exports.onResourceReceived = onResourceReceived;
exports.onConsoleMessage = onConsoleMessage;
exports.initCasper = initCasper;
exports.getEditorData = getEditorData;

exports.viewportSize = viewportSize;
exports.normalOptions = normalOptions;
exports.debugOptions = debugOptions;


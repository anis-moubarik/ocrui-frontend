
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

function initCasper () {
    return function () {
        this.on('error',onError);
    }
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

    //onResourceRequested : onResourceRequested,
    //onResourceReceived : onResourceReceived,
    viewportSize: viewportSize,
    verbose: true,
    logLevel: 'debug'
};


var normalOptions = {

    viewportSize: viewportSize

};


exports.elementInfoContainsClass = elementInfoContainsClass;
exports.cmpObjects = cmpObjects;
exports.onResourceRequested = onResourceRequested;
exports.onResourceReceived = onResourceReceived;
exports.onConsoleMessage = onConsoleMessage;
exports.initCasper = initCasper
exports.getEditorData = getEditorData

exports.viewportSize = viewportSize;
exports.normalOptions = normalOptions;
exports.debugOptions = debugOptions


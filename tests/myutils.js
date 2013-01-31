function onError  (casper, msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line +
                (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    casper.log(msgStack.join('\n'),'error');
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
    this.page.onError = onError;
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

viewportSize = {
    width:1024,
    height:768
};


debugOptions = {

    //onResourceRequested : onResourceRequested,
    //onResourceReceived : onResourceReceived,
    onError : onError,
    viewportSize: viewportSize,
    verbose: true,
    logLevel: 'debug'
};


normalOptions = {

    viewportSize: viewportSize

};


exports.cmpObjects = cmpObjects;
exports.onResourceRequested = onResourceRequested;
exports.onResourceReceived = onResourceReceived;
exports.onError = onError;
exports.onConsoleMessage = onConsoleMessage;
exports.initCasper = initCasper

exports.viewportSize= viewportSize;
exports.normalOptions = normalOptions;
exports.debugOptions = debugOptions


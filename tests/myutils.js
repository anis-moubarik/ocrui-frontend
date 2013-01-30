exports.cmpObjects = function (o1,o2) {
    for (var key in o1) {
        if (o1[key] != o2[key]) return false;
    }
    for (var key in o2) {
        if (o1[key] != o2[key]) return false;
    }
    return true;
}

exports.debugOptions = {

    onResourceRequested : function(casper,request) {
        //console.log('Request (#' + request.id + '): ' +
        //    JSON.stringify(request.url));
    },

    onResourceReceived : function(casper,response) {
        if ( response.stage == 'end' ) {
            console.log('Received: ' + JSON.stringify(response.url));
        }
        //console.log('Response (#' + response.id + ', stage "' +
        //    response.stage + '"): ' + JSON.stringify(response));
    },

    onConsoleMessage : function (casper,msg, lineNum, sourceId) {
        console.log('CONSOLE: ' + msg + ' (from line #' + lineNum +
            ' in "' + sourceId + '")');
    },

    onError : function (casper,msg, trace) {
        var msgStack = ['ERROR: ' + msg];
        if (trace) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line +
                    (t.function ? ' (in function "' + t.function + '")' : ''));
            });
        }
        console.error(msgStack.join('\n'));
    }

}


exports.normalOptions = {}

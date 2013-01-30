exports.cmpObjects = function (o1,o2) {
    for (var key in o1) {
        if (o1[key] != o2[key]) return false;
    }
    for (var key in o2) {
        if (o1[key] != o2[key]) return false;
    }
    return true;
}

exports.onConsoleMessage = function (msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum +
        ' in "' + sourceId + '")');
};

exports.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
};


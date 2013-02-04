define(['jquery','spin','events'],function ($,spin,events) {
    "use strict";


    var options = {
        lines: 12, // The number of lines to draw
        length: 7, // The length of each line
        width: 5, // The line thickness
        radius: 10, // The radius of the inner circle
        color: '#000', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 100, // Afterglow percentage
        shadow: true // Whether to render a shadow
    };

    var spinner = new spin.Spinner(options);
    var nowSpinning = false;

    var stack = {};

    events.on('nowProcessing',startProcess);

    events.on('endProcessing',endProcess);

    function startProcess(process) {
        if (process in stack) {
            throw "Trying to start a process already in taking place";
        }
        stack[process] = true;
        if (!nowSpinning) {
            spinner.spin($('#spinner').get(0));
            $('#greyout').css('z-index','1000000');
            $('#spinner').css('z-index','1000001');
        }
        nowSpinning = true;
    }
    
    function endProcess(process) {
        if (!(process in stack)) {
            throw "Trying to end a process not in stack";
        }
        delete stack[process];
        var processes = false;
        for (var i in stack) {
            processes = true;
            break;
        }
        if (!processes) {
            spinner.stop();
            $('#spinner,#greyout').css('z-index','-1');
        }
    }
    
    return {
    };

});

define(['spin','backbone'],function (spin) {


    options = {
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
    var spinnerCount = 0;

    function showSpinner(i) {
        if (i==undefined) i = 1
        if (spinnerCount == 0) {
            spinner.spin($('#spinner').get(0));
            $('#greyout').css('z-index','1000000');
            $('#spinner').css('z-index','1000001');
        }
        spinnerCount += i;
    }
    
    function hideSpinner(i) {
        if (i==undefined) i = 1
        spinnerCount -= i;
        if (spinnerCount <= 0) {
            spinnerCount = 0;
            spinner.stop();
            $('#spinner,#greyout').css('z-index','-1');
        }
    }
    
    return {
        showSpinner : showSpinner,
        hideSpinner : hideSpinner,
    };

});

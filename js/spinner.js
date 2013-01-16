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

    function createSpinner() {
        return new spin.Spinner(options);
    }
    
    return {
        createSpinner : createSpinner,
    };

});

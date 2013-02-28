casper.echo( "OC-67: Siirrettäessä kursoria editorissa faksimiilin highlight siirtyy oikeaan kohtaan" );


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

function cmpObjects(o1,o2) {
    for (var key in o1) {
        if (o1[key] != o2[key]) return false;
    }
    for (var key in o2) {
        if (o1[key] != o2[key]) return false;
    }
    return true;
}

casper.start(settings.defaultPageUrl,mytests.initCasper());

casper.then(function() {
    this.test.assertExists('#editor');
});

casper.waitForText( "Pienet" );

casper.then(function() {

    var content = this.evaluate( function () {
        return require('editor').view.cMirror.getValue();
    });
    this.test.assertEqual(content,settings.expectedContent, "editor content");
    newCursor = this.evaluate( function () {
        require('editor').view.cMirror.setCursor(0,120);
        return require('editor').view.cMirror.getCursor();
    });

    this.test.assert((!!newCursor),'new cursor was read');
    this.test.assertEqual(newCursor.line,0, "cursor move line");
    this.test.assertEqual(newCursor.ch,8, "cursor move ch");

});

casper.waitFor(function() {

    var hb = this.evaluate( function () {return require('boxes').view.highlight;} );
    

    return hb;

},null,null,10000);

casper.then(function() {

    var hbs = this.evaluate( function () {return require('boxes').view.highlight;} );
    expectedHbs = [{
        hpos:96,
        vpos:112,
        width:163,
        height:43}];
    assertHighlightBoxes(this,hbs,expectedHbs);

});

casper.then(function() {
    var x = 680;
    var y = 550;
    this.echo('click',x,y);
    this.page.sendEvent('click',x,y); // on word 'päässä'
});

casper.waitFor(function () {
    var expectedBounds = {"height":36,"left":378,"top":648,"width":76};

    if (casper.exists(".highlight-box")) {
        var bounds = casper.getElementBounds(".highlight-box");

        if (cmpObjects(bounds,expectedBounds)) {
            this.test.assert(true, "Got correct highlight box after click");
            return true;
        }
    }

    return false;

});

casper.run(function() {
    this.test.done();
    this.test.renderResults();
});



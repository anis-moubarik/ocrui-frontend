casper.echo( "OC-67: Siirrettäessä kursoria editorissa faksimiilin highlight siirtyy oikeaan kohtaan" );


casper.start(settings.defaultPageUrl);

casper.then(function() {
    this.test.assertExists('#editor');
});

casper.waitForText( "Pienet");

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

});

casper.then(function() {

    var hbs = this.evaluate( function () {return require('boxes').view.highlight;} );
    expectedHbs = [{
        hpos:96,
        vpos:112,
        width:163,
        height:43}];
    mytests.assertHighlightBoxes(this,hbs,expectedHbs);

});

casper.then(function() {
    var x = 680;
    var y = 550;
    this.echo('click',x,y);
    this.page.sendEvent('click',x,y); // on word 'päässä'
});

casper.waitFor(function () {
    var expectedBounds = {"height":25,"left":392,"top":641,"width":59};

    if (casper.exists(".highlight-box")) {
        var bounds = casper.getElementBounds(".highlight-box");

        if (mytests.cmpObjects(bounds,expectedBounds)) {
            this.test.assert(true, "Got correct highlight box after click");
            return true;
        }
    }

    return false;

});

casper.run(function() {
    this.test.done();
});



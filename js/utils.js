define(['underscore'],function (_) {
    "use strict";

    function bounded(value,min,max) {
        if (min !== undefined) {
            value = _.max([value,min]);
        }
        if (max !== undefined) {
            value = _.min([value,max]);
        }
        return value;
    }

    function getCombinedBoundingBox(bbs) {
        
        var xs = [];
        var ys = [];
        for (var i in bbs) {
            xs.push(bbs[i].hpos);
            xs.push(bbs[i].hpos + bbs[i].width);
            ys.push(bbs[i].vpos);
            ys.push(bbs[i].vpos + bbs[i].height);
        }
        var bb = {
            hpos: _.min(xs),
            vpos: _.min(ys)
        };
        bb.width = _.max(xs) - bb.hpos;
        bb.height = _.max(ys) - bb.vpos;

        return bb;

    }

    return {
        bounded: bounded,
        getCombinedBoundingBox: getCombinedBoundingBox
    };
});




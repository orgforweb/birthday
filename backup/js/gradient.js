/// <reference path="./theme.js" />

// background gradient special effects animation
var Gradient = (function () {

    "use strict";

    var trg = Theme.resources.gradient;
    var currentMovingStop = trg.movingStop.max;

    // caching gradient colors
    var sR = trg.start.red, sG = trg.start.green, sB = trg.start.blue;
    var eR = trg.end.red, eG = trg.end.green, eB = trg.end.blue;

    // individual frame render routine
    function renderFrame(context) {
        // start with clean context
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        //prepare the gradient
        var gradient = context.createRadialGradient(
        // start x
            context.canvas.width / 2,
        // start y
            (context.canvas.height-400) / 2,
        // start r
            0,
        // stop x
            context.canvas.width / 2,
        // stop y
            context.canvas.height,
        // stop r
            context.canvas.height * 1.5);

        // compose the colors
        var colorStopElement = Math.ceil(255 * (1 - currentMovingStop));

        // start color stop
        var colorStart = "rgba(" + sR + ", " + sG + "," + sB + "," + currentMovingStop + ")"
        // mid color stop
        var colorMidStop = "rgba(" + eR + ", " + eG + ", " + eB + ", " + currentMovingStop / 1.5 + ")";
        // final color stop
        var colorStop = "rgba(" + eR + ", " + eG + ", " + eB + ", " + currentMovingStop + ")";

        // compose the gradient points dynamically for subtle glowing effect
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(currentMovingStop / 2, colorMidStop);
        gradient.addColorStop(currentMovingStop, colorStop);

        // advance the moving target
        currentMovingStop += trg.movingStop.increment;
        if (currentMovingStop >= trg.movingStop.max ||
            currentMovingStop <= trg.movingStop.min) {
            trg.movingStop.increment = -trg.movingStop.increment;
        }

        // all ready to draw the context:
        // setting gradient as fill style
        context.fillStyle = gradient;
        // outputting the gradient
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }

    return {
        "render": renderFrame
    }
})();
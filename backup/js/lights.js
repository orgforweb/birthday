/// <reference path="./theme.js" />

Lights = (function () {

    "use strict";

    var lightsActive = false;
    var lights = Theme.resources.lights;

    function getCoordinateByPosition(position, type) {
        var x, y;

        switch (type) {
            case "top":
                y = 0;
                break;
            case "bottom":
                y = window.innerHeight;
                break;
        }

        x = Math.ceil(position * window.innerWidth);

        return { "x": x, "y": y };
    }

    function advanceLight(light) {
        light.opacity += light.opacityIncrement;
        if (light.opacity > light.maxOpacity ||
            light.opacity < light.minOpacity) {
            light.opacityIncrement = -light.opacityIncrement;
        }
        light.bottomPosition += light.bottomPositionIncrement;
        if (light.bottomPosition > light.bottomPositionMax ||
            light.bottomPosition < light.bottomPositionMin) {
            light.bottomPositionIncrement = -light.bottomPositionIncrement;
        }
    }

    function render(context) {

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        if (!lightsActive) return;
        context.save();

        for (var ii = 0; ii < lights.length; ii++) {
            var light = lights[ii];

            var top = getCoordinateByPosition(light.topPosition, "top");
            var bottom = getCoordinateByPosition(light.bottomPosition, "bottom");

            context.beginPath();
            context.moveTo(top.x - light.topRadius, top.y);
            context.lineTo(top.x + light.topRadius, top.y);
            context.lineTo(bottom.x + light.bottomRadius, bottom.y);
            context.lineTo(bottom.x - light.bottomRadius, bottom.y);
            context.lineTo(top.x - light.topRadius, top.y);
            context.closePath();

            context.fillStyle = light.color;
            context.globalAlpha = light.opacity;

            context.fill();

            advanceLight(light);

        }

        context.restore();

    }

    function activate() {
        lightsActive = true;
    }

    function deactivate() {
        lightsActive = false;
    }

    return {
        "render": render,
        "activate": activate,
        "deactivate": deactivate
    }

})();
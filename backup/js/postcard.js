/// <reference path="./theme.js" />
/// <reference path="./default.js" />
/// <reference path="./systemInformation.js" />

Postcard = (function () {

    "use strict";

    // aliases
    var trp = Theme.resources.postcard;
    //    var trpfb = trp.fixedBounds;
    var trpm = trp.marks;

    // required DOM elements
    var postcardContainer = document.getElementById("postcardContainer");
    var postcard = document.getElementById("postcard");
  //  var hint = document.getElementById("hint");
    var message = document.getElementById("message");

    // store canvases and contexts in those
    var clearCanvas, clearContext;
    var clearPathCanvas, clearPathContext;
    var coverCanvas, coverContext;
    var maskCanvas, maskContext;
    var messageCanvas, messageContext;

    // image mask cache
    var maskImageDataCache;
    var imagesLoaded = false;

    // we're getting events from parent div, so we need placement information to adjust
    var bounds;

    // track user input
    var pointerDown = false;
    var stroke = [];

    // external initilization
    function show(mode) {
        createCompositePhoto(mode);
        //showHint();
    }

    // // show/hide the hint
    // function showHint() {
    //     hint.style.opacity = 1.0;
    // }
    //
    // function hideHint() {
    //     hint.style.opacity = 0;
    // }

    // request to render single frame on demand
    function requestFrameRender() {
        Animation.getRequestAnimationFrame(renderCompositePhoto);
    }

    function setPersonalizedMessage(messageString) {
        message.textContent = messageString;
    }

    // get personalized greeting message
    function getPersonalizedMessage(mode) {

        // detect browser to display custom message
        
        var returnMessage = "Happy birthday to you, sweetheart, with all my love. My heart is always with you";

        return returnMessage;
    }

    // render user input and compose layers
    function renderCompositePhoto() {
        var ro = Gfx.getDefaultRenderOptions();
        ro.context = clearPathContext;
        Gfx.renderPath(stroke, ro);
        stroke = [];

        Gfx.composeLayers(pipeline, composeOptions);

        // compose layers
        var pipeline = [
        // composing on cleared particles canvas
                    clearContext,
        // particles on a postcard
                    coverCanvas,
        // cleared path
                    clearPathCanvas,
        // mask image
                    maskCanvas
                    ];
        // "subtract" cleared path
        var composeOptions = ["", "", "destination-out", "destination-out"];
        Gfx.composeLayers(pipeline, composeOptions);
    }

    function createCanvas() {
        var canvas = document.createElement("canvas");
        canvas.width = postcard.clientWidth;
        canvas.height = postcard.clientHeight;
        return canvas;
    }

    function createCoverImage() {
        coverCanvas = createCanvas();
        coverCanvas.id = "coverCanvas"
        coverContext = coverCanvas.getContext("2d");
        coverContext.fillStyle = trp.coverColor;
        coverContext.fillRect(
            0,
            0,
            coverCanvas.width,
            coverCanvas.height);
    }

    function createMaskImage(mode) {
        maskCanvas = createCanvas();
        maskContext = maskCanvas.getContext("2d");

        var image = document.createElement("img");
        image.onload = function () {
            maskContext.drawImage(image, 0, 0);
            // chain load message image

            message.textContent = getPersonalizedMessage(mode);

            createCoverImage();
            // canvas to hold clear path + visible top-level canvas with "cleared path"
            createClearCanvas();
        }
        image.src = (mode === "alternate") ? trp.image.alternateMask : trp.image.defaultMask;
    }

    function createClearCanvas() {
        // cleared path
        clearPathCanvas = createCanvas();
        clearPathContext = clearPathCanvas.getContext("2d");

        // compose result - in DOM and visible
        clearCanvas = createCanvas();
        clearCanvas.className = "clearCanvas";
        clearCanvas.style.zIndex = "1";
        postcard.appendChild(clearCanvas);
        clearContext = clearCanvas.getContext("2d");

        imagesLoaded = true;

        renderCompositePhoto();
    }

    // correct by bounding rectangle
    function calcOffset(evt) {
        return {
            x: evt.clientX - bounds.left,
            y: evt.clientY - bounds.top
        }
    }

    // mouse and touch (IE) handlers
    function pointerDownHandler(evt) {
      //  hideHint();
        pointerDown = true;
        stroke.push(calcOffset(evt));
        requestFrameRender();
      //  App.hidePersonalMessageEditor();

    }

    function pointerMoveHandler(evt) {
        if (evt.buttons > 0) { pointerDown = true; }
        if (pointerDown) {
            stroke.push(calcOffset(evt));
            requestFrameRender();
        }
    }

    function pointerUpHandler(evt) {
        pointerDown = false;
        stroke = [];
    }

    function createCompositePhoto(mode) {
        // if we're repopulating the photo - flush childNodes
        if (postcard.childNodes.length > 0) {
            postcard.innerHTML = "";
            maskImageDataCache = null;
            imagesLoaded = false;
        };

        // create mask image and chain other methods
        createMaskImage(mode);

        // touch events (IE) if supported
        if (window.navigator.msPointerEnabled) {
            postcardContainer.addEventListener("MSPointerDown", pointerDownHandler);
            postcardContainer.addEventListener("MSPointerUp", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerCancel", pointerUpHandler);
            postcardContainer.addEventListener("MSPointerMove", pointerMoveHandler);
        } else {
            postcardContainer.addEventListener("mousedown", pointerDownHandler);
            postcardContainer.addEventListener("mouseup", pointerUpHandler);
            postcardContainer.addEventListener("mouseleave", pointerUpHandler);
            postcardContainer.addEventListener("mousemove", pointerMoveHandler);
        }
    }

    // place particle mark from landed particle that hit the postcard
    function placeMark(x, y, image) {
        // the particle will be scaled from min to max to add variety
        var scale = Math.random() * (trpm.maxScale - trpm.minScale) + trpm.minScale;
        var w = image.width;
        var h = image.height;

        if (clearPathContext) {
            clearPathContext.globalAlpha = Math.random() * (trpm.maxOpacity - trpm.minOpacity) + trpm.minOpacity;
            clearPathContext.globalCompositeOperation = "destination-out";
            clearPathContext.drawImage(
            // image
            image,
            // source x
            0,
            // source y
            0,
            // source width
            w,
            // source height
            h,
            // target x
            x - w / 2,
            // target y
            y - h / 2,
            // target width
            w * scale,
            // target height
            h * scale);
            // request to update that out of normal rendering loop
            requestFrameRender();
        }
    }

    // update postcard bounds to handle events
    function updateBounds() {
        bounds = {
            width: trp.fixedBounds.width,
            height: trp.fixedBounds.height,
            left: (window.innerWidth - trp.fixedBounds.width) / 2,
            right: (window.innerWidth + trp.fixedBounds.width) / 2,
            top: (window.innerHeight - trp.fixedBounds.height) / 2,
            bottom: (window.innerHeight + trp.fixedBounds.height) / 2
        }

        return bounds;
    }

    function isWithinBounds(x, y) {
        // check if particle is within bounds of postcard
        if (x < bounds.left) return false;
        if (y < bounds.top) return false;
        if (x > bounds.right) return false;
        if (y > bounds.bottom) return false;
        return true;
    }

    function isWithinMaskedArea(x, y) {

        if (imagesLoaded &&
            !maskImageDataCache) {
            var tempImageData = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            maskImageDataCache = [];
            for (var ii = 0; ii < maskCanvas.width; ii++) {
                maskImageDataCache[ii] = [];
                for (var jj = 0; jj < maskCanvas.height; jj++) {
                    var alpha = tempImageData.data[ii * 4 + jj * (maskCanvas.width * 4) + 3];
                    maskImageDataCache[ii][jj] = alpha;
                }
            }
        }

        var maskX = Math.ceil(x - bounds.left);
        var maskY = Math.ceil(y - bounds.top);

        alpha = (maskImageDataCache) ? (maskImageDataCache[maskX - 1][maskY - 1] > 0) : false;

        return alpha;
    }

    return {
        "show": show,
        "placeMark": placeMark,
        "updateBounds": updateBounds,
        "isWithinBounds": isWithinBounds,
        "isWithinMaskedArea": isWithinMaskedArea,
        "setPersonalizedMessage": setPersonalizedMessage
    };
})();

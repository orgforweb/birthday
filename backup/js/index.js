
var backgroundGradientCanvas = document.getElementById("backgroundGradient");

var backgroundGradientContext = backgroundGradientCanvas.getContext("2d");
var gradientScaleDelta = 400;
//        // resize and zoom-in background gradient
backgroundGradientCanvas.width = window.innerWidth + gradientScaleDelta;
backgroundGradientCanvas.height = window.innerHeight + gradientScaleDelta;

Animation.addFrameRenderer(Gradient.render, backgroundGradientContext);
Animation.start();

/// <reference path="./theme.js" />
/// <reference path="./particles.js" />
/// <reference path="./actor.js" />
/// <reference path="./lights.js" />

// Initialization and events code for the app
var App = (function () {
    "use strict";

    var alternativeIsPlaying = false;
    var musicIsPlaying = true;
    var muted = false;
    var togglePlaybackCode = 112;
    var secretCode = 114;
    var enteringText = false;
    var previousMessage;

    // preparing the elements we'll need further
    var particlesCanvas = document.getElementById("particlesCanvas");
    var lightCanvas = document.getElementById("lightCanvas");
    var backgroundGradientCanvas = document.getElementById("backgroundGradient");

    var particlesContext,
        lightContext,
        backgroundGradientContext;
    if (particlesCanvas.getContext &&
        lightCanvas.getContext &&
        backgroundGradientCanvas.getContext) {
        particlesContext = particlesCanvas.getContext("2d");
        lightContext = lightCanvas.getContext("2d");
        backgroundGradientContext = backgroundGradientCanvas.getContext("2d");
    }

    var siParticlesCount = document.getElementById("siParticlesCount");
    var message = document.getElementById("postcard");
    //var hint = document.getElementById("hint");

    var systemInformation = document.getElementById("systemInformation");
    //var systemInformationFps = document.getElementById("systemInformationFps");

    var music = document.getElementById("music");
    var muteControl = document.getElementById("muteControl");

    var messageTextEditor = document.getElementById("messageTextEditor");
  //  var personalMessageEditor = document.getElementById("personalMessageEditor");
    var copyPersonalURL = document.getElementById("copyPersonalURL");
    var createPersonalMessage = document.getElementById("createPersonalMessage");
    var copyResult = document.getElementById("copyResult");

    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", function () {




            // // initialize the music if required
            // music.src = Theme.resources.music.defaultTrack;
            // if (Theme.resources.music.autoplay) {
            //     music.setAttribute("autoplay", "");
            //     muteControl.src = Theme.resources.music.buttonAudioLoud;
            // }
            //
            // muteControl.addEventListener("click", function () {
            //     if (muted) {
            //         muteControl.src = Theme.resources.music.buttonAudioLoud;
            //         music.volume = 1;
            //     } else {
            //         muteControl.src = Theme.resources.music.buttonAudioMute;
            //         music.volume = 0;
            //     }
            //     muted = !muted;
            // });

            // initialiaze the particles covered postcard
            Postcard.show("default");

            // particles count selection control initialization
            // var particlesCountLabel = document.getElementById("particlesCountLabel");
            // particlesCountLabel.textContent = Theme.resources.particles.name;
            // var particlesCountSelect = document.getElementById("siParticles");
            // particlesCountSelect.addEventListener("change", function (evt) {
            //     var value = evt.target.options[evt.target.selectedIndex].value;
            //     if (value) {
            //         Theme.resources.particles.dynamic.active = (value === "auto");
            //         if (!Theme.resources.particles.dynamic.active) {
            //             Particles.generate(parseInt(value));
            //             siParticlesCount.textContent = "";
            //         }
            //     }
            // }, true);


            // post initial system information
            // SystemInformation.post(SystemInformation.getInformation());
            //
            // // if the particles count = auto - add/remove based on current fps
            // SystemInformation.setOnFpsReport(function (fps) {
            //     if (Theme.resources.particles.dynamic.active) {
            //         if (fps < 55) Particles.remove();
            //         else if (fps >= 59) Particles.add();
            //     }
            // });

            // genarate particles
            Particles.generate(250);

            // properly resize the canvases
            resizeCanvasElements();

            // initialize out animation functions and start animation:
            // falling particles
            Animation.addFrameRenderer(Particles.render, particlesContext);
            // background gradient
            Animation.addFrameRenderer(Gradient.render, backgroundGradientContext);
            // add secret lights
            Animation.addFrameRenderer(Lights.render, lightContext);
            // reminder we can add context-less animations (e.g. not using canvas), and those should go the last
            // actor dance
            //Animation.addFrameRenderer(Actor.render);

            // start the animation
            Animation.start();

        });
    } else {
        // check competibility for older IE versions
        var browser = SystemInformation.getBrowser();
        if (browser === "ie6" ||
            browser === "ie7" ||
            browser === "ie8") {
            // show compatibility warning
            var compatibilityWarning = document.getElementById("compatibilityWarning");
            var downloadModernMessage = document.getElementById("downloadModernMessage");
            var downloadModernURL = document.getElementById("downloadModernURL");

            if (compatibilityWarning &&
                downloadModernMessage &&
                downloadModernURL) {
                Classes.remove(compatibilityWarning, "hidden");
                downloadModernMessage.innerText = Theme.resources.compatibility.downloadModernMessage;
                downloadModernURL.innerText = Theme.resources.compatibility.downloadModernURL;
                downloadModernURL.href = Theme.resources.compatibility.downloadModernURL;
                // hide other elements
                //personalMessageEditor.className = "hidden";
              //  hint.className = "hidden";
                systemInformation.className = "hidden";
              //  systemInformationFps.className = "hidden";

                // avoid further potential problems
                return;
            }

        }
    }

    function resizeCanvasElements() {
        // gradient smoothness
        var gradientScaleDelta = 400;
        // update internal contraints for the postcard and particles container
        Postcard.updateBounds();
        Particles.updateBounds();
        // resize falling particles canvas to fit the screen
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
        //        // resize and zoom-in background gradient
        backgroundGradientCanvas.width = window.innerWidth + gradientScaleDelta;
        backgroundGradientCanvas.height = window.innerHeight + gradientScaleDelta;
        // lights
        lightCanvas.width = window.innerWidth;
        lightCanvas.height = window.innerHeight;
    }

    if (document.addEventListener) {
        document.addEventListener("keypress", function (evt) {
            if (enteringText) return;
            // do a secret power move of power AND secret and power
            if (evt.keyCode === secretCode) {
                alternativeIsPlaying = !alternativeIsPlaying;
                if (alternativeIsPlaying) {
                    Postcard.show("alternate");
                    //Actor.switchTheme("alternateTheme");
                    music.src = Theme.resources.music.alternativeTrack;
                    Lights.activate();
                } else {
                    Postcard.show("default");
                    //Actor.switchTheme("defaultTheme");
                    music.src = Theme.resources.music.defaultTrack;
                    Lights.deactivate();
                }
            }
            if (evt.keyCode === togglePlaybackCode) {
                musicIsPlaying = !musicIsPlaying;
                var toggleFunction = (musicIsPlaying) ? music.play() : music.pause();
                if (toggleFunction) { toggleFunction(); }
            }
        }, false);
    }

    var editorVisible = false;


    if (window.addEventListener) {
        window.addEventListener("resize", function () {
            // post updated screen size
            SystemInformation.post({ width: window.innerWidth, height: window.innerHeight });
            // properly resize the canvases
            resizeCanvasElements();
        });
    }

    return {
        //"hidePersonalMessageEditor": hidePersonalMessageEditor
    }

})();

/// <reference path="./theme.js" />
/// <reference path="./postcard.js" />

Particles = (function () {

    "use strict";

    // particles objects collection
    var particles = [];
    var sprites = [];

    // aliases
    var trp = Theme.resources.particles;
    var trps = trp.sprites;
    var trpm = trp.motion;
    var trpd = trp.dynamic;

    // canvas bounds used for particles animation
    var bounds = { width: window.innerWidth, height: window.innerHeight };
    // postcard bounds to perform landing
    var landingBounds;

    // create number of particles adding if required (or regenerate from scratch)
    function generate(number, add) {
        // initialize sprite
        var image = new Image();
        image.onload = function () {
            for (var ii = 0; ii < trps.count; ii++) {
                var sprite = document.createElement("canvas");
                sprite.width = trps.individualWidth;
                sprite.height = trps.individualHeight;
                var context = sprite.getContext("2d");
                context.drawImage(
                // source image
                    image,
                // source x
                    ii * sprite.width,
                // source y
                    0,
                // source width
                    sprite.width,
                // source height
                    sprite.height,
                // target x
                    0,
                //target y
                    0,
                // target width
                    sprite.width,
                // target height
                    sprite.height);
                sprites.push(sprite);
            }

            if (number) {
                //number of particles = number;
                trp.defaultCount = number;
            }
            if (!add) {
                particles = [];
            }
            for (var ii = 0; ii < trp.defaultCount; ii++) {
                particles.push(generateSingleParticle());
            }
        }
        image.src = trps.url;
    }

    function generateSingleParticle() {
        // particle generation
        var scale = Math.random() * (trpm.maxScale - trpm.minScale) + trpm.minScale;
        return {
            // x position
            x: Math.random() * bounds.width,
            // y position
            y: Math.random() * bounds.height,
            // vertical velocity
            vv: Math.random() *
                (trpm.maxVerticalVelocity - trpm.minVerticalVelocity) + trpm.minVerticalVelocity,
            // horizontal velocity
            hv: Math.random() * (trpm.maxHorizontalVelocity - trpm.minHorizontalVelocity) + trpm.minHorizontalVelocity,
            // scaled sprite width
            sw: scale * trps.individualWidth,
            // scaled sprite width
            sh: scale * trps.individualHeight,
            // maximum horizontal delta
            mhd: Math.random() * (trpm.maxHorizontalDelta - trpm.minHorizontalDelta) + trpm.minHorizontalDelta,
            // horizontal delta
            hd: 0,
            // horizontal delta increment
            hdi: Math.random() / (trpm.maxHorizontalVelocity * trpm.minHorizontalDelta),
            // opacity
            o: Math.random() * (trpm.maxOpacity - trpm.minOpacity) + trpm.minOpacity,
            // opacity increment
            oi: Math.random() / trpm.maxOpacityIncrement,
            // sprite index
            si: Math.ceil(Math.random() * (trps.count - 1)),
            // not landing flag
            nl: false
        }
    }

    //    // check if particle is within bounds of postcard
    //    function isWithinLandingRect(x, y) {
    //        if (x < landingBounds.left) return false;
    //        if (y < landingBounds.top) return false;
    //        if (x > landingBounds.right) return false;
    //        if (y > landingBounds.bottom) return false;
    //        return true;
    //    }

    // help particles move
    function advanceParticles() {
        for (var ii = 0; ii < particles.length; ii++) {
            var p = particles[ii];
            // we obey the gravity, 'cause it's the law
            p.y += p.vv * trpm.speedFactor;
            // while we're obeying the gravity, we do it with style
            p.x += (p.hd + p.hv) * trpm.speedFactor;
            // advance horizontal axis "bobbing"                
            p.hd += p.hdi;
            // inverse "bobbing" direction if we get to maximum delta limit
            if (p.hd < -p.mhd || p.hd > p.mhd) {
                p.hdi = -p.hdi;
            };

            // increment opacity and check opacity value bounds
            p.o += p.oi;
            if (p.o > trpm.maxOpacity || p.o < trpm.minOpacity) { p.oi = -p.oi };
            if (p.o > trpm.maxOpacity) p.o = trpm.maxOpacity;
            if (p.o < trpm.minOpacity) p.o = trpm.minOpacity;
            // return within dimensions bounds if we've crossed them
            // and don't forget to reset the not-landing (sf.nl) flag
            var resetNotLanding = false;
            if (p.y > bounds.height + trps.individualHeight / 2) {
                p.y = 0
                resetNotLanding = true;
            };
            if (p.y < -p.sh) {
                p.y = bounds.height
                resetNotLanding = true;
            };
            if (p.x > bounds.width + trps.individualWidth / 2) {
                p.x = 0
                resetNotLanding = true;
            };
            if (p.x < -p.sw) {
                p.x = bounds.width
                resetNotLanding = true;
            };
            if (resetNotLanding) { p.nl = false; }

            // try probable landing
            if (!p.nl && 
                Postcard.isWithinBounds(p.x, p.y) &&
                !Postcard.isWithinMaskedArea(p.x, p.y)) {
                // if within postcard - try if it should land

                var chance = Math.random();
                if (chance < trp.landingProbability) {
                    // leave a particle at random position
                    Postcard.placeMark(
                        Math.random() * landingBounds.width,
                        Math.random() * landingBounds.height,
                        sprites[p.si]);
                    // 
                    p.y = 0;
                    p.x = Math.random() * bounds.width;
                } else { p.nl = true; }
            }
        }
    }

    function renderFrame(context) {
        // fall down one iteration            
        advanceParticles();
        // clear context and save it 
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        for (var ii = 0; ii < particles.length; ii++) {
            var p = particles[ii];
            context.globalAlpha = p.o;
            context.drawImage(
            // image
                sprites[p.si],
            // source x
                0,
            // source y
                0,
            // source width
                trps.individualWidth,
            // source height
                trps.individualWidth,
            // target x
                p.x,
            // target y
                p.y,
            // target width
                p.sw,
            // target height
                p.sh);
        }
    }

    function updateBounds() {
        bounds.width = window.innerWidth;
        bounds.height = window.innerHeight;
        landingBounds = Postcard.updateBounds();
    }

    function count() {
        return particles.length;
    }

    // increase number of moving particles
    function add(number) {
        if (!number) { number = particles.length * trpd.countIncrement; }
        generate(number, true);
    }

    // remove some particles
    // by default we remove more aggressively (than adding) to free resources faster
    function remove(number) {
        if (!number) { number = particles.length * trpd.countIncrement * trpd.removeFactor; }
        if (particles.length - number > 0) {
            particles = particles.slice(0, particles.length - number);
        }
    }

    return {
        "generate": generate,
        "add": add,
        "remove": remove,
        "render": renderFrame,
        "count": count,
        "updateBounds": updateBounds
    }

})();
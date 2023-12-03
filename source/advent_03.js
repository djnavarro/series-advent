
// nodejs libraries
const {createCanvas, loadImage} = require('canvas')
const seedrandom = require('seedrandom') 
const fs = require('fs')
const { randomBytes } = require('crypto')

// generate an image using the seed
function drawImage(seed) {

    // message
    console.log("seed: " + seed)

    // constants 
    const pixels = 2000

    // create a canvas
    // // https://github.com/Automattic/node-canvas
    var canvas = createCanvas(pixels, pixels)
    var ctx = canvas.getContext('2d')

    // create a seeded random number generator
    // https://github.com/davidbau/seedrandom
    var rng = seedrandom.alea(seed)

    // function to sample an item from an array
    function sampleArray(items) {
        return(items[Math.floor(rng.double()*items.length)]);
    }

    // sample a palette
    const palettes = [
        ["#de9151", "#f34213", "#2e2e3a", "#bc5d2e", "#bbb8b2"],
        ["#a63446", "#fbfef9", "#0c6291", "#000004", "#7e1946"],
        ["#ffffff", "#ffcad4", "#b0d0d3", "#c08497", "#f7af9d"],
        ["#aa8f66", "#ed9b40", "#ffeedb", "#61c9a8", "#ba3b46"],
        ["#241023", "#6b0504", "#a3320b", "#d5e68d", "#47a025"],
        ["#64113f", "#de4d86", "#f29ca3", "#f7cacd", "#84e6f8"],
        ["#660000", "#990033", "#5f021f", "#8c001a", "#ff9000"],
        ["#c9cba3", "#ffe1a8", "#e26d5c", "#723d46", "#472d30"],
        ["#0e7c7b", "#17bebb", "#d4f4dd", "#d62246", "#4b1d3f"],
        ["#0a0908", "#49111c", "#f2f4f3", "#a9927d", "#5e503f"],
        ["#020202", "#0d324d", "#7f5a83", "#a188a6", "#9da2ab"],
        ["#c2c1c2", "#42213d", "#683257", "#bd4089", "#f51aa4"],
        ["#820263", "#d90368", "#eadeda", "#2e294e", "#ffd400"],
        ["#f4e409", "#eeba0b", "#c36f09", "#a63c06", "#710000"],
        ["#d9d0de", "#bc8da0", "#a04668", "#ab4967", "#0c1713"],
        ["#012622", "#003b36", "#ece5f0", "#e98a15", "#59114d"],
        ["#3c1518", "#69140e", "#a44200", "#d58936", "#fffb46"],
        ["#6e0d25", "#ffffb3", "#dcab6b", "#774e24", "#6a381f"],
        ["#bcabae", "#0f0f0f", "#2d2e2e", "#716969", "#fbfbfb"],
        ["#2b4162", "#385f71", "#f5f0f6", "#d7b377", "#8f754f"]
    ]
    const palette = sampleArray(palettes)

    // set background colour
    var background = sampleArray(palette);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, pixels, pixels);

    // sample the grain of the grid and number of iterations
    var grain = 25 + Math.floor(rng.double() * 10)
    var iter = 400 + Math.floor(rng.double() * 100)

    // define a discrete set of permissible grid locations
    var grid = []
    for (let i = 0; i < (grain - 1); i++) {
        grid[i] = (pixels / grain) * (i + 1)
    }

    // define a discrete set of permissible radii
    var radii = []
    for (let i = 0; i < 6; i ++) {
        radii[i] = (pixels / grain) * (.1 + (i / 6) * .35)
    }

    // function to draw a filled circle
    function drawCircle(grid, radii, palette) {
        // sample coords, radius, and colour
        var x = sampleArray(grid)
        var y = sampleArray(grid)
        var radius = sampleArray(radii)
        var shade = sampleArray(palette)

        // draw filled circle
        ctx.beginPath();
        ctx.fillStyle = shade;
        ctx.strokeStyle = shade;
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    // function to draw a barbell
    function drawBarbell(grid, radii, palette) {
        
        // sample primary coords
        var x1 = sampleArray(grid)
        var y1 = sampleArray(grid)
        
        // grid step
        var step = grid[1] - grid[0]

        // sample secondary coords: we permit long steps,
        // but make them rare using a somewhat silly heuristic
        var x2, y2
        var vertical = rng.double() < .5
        if (vertical) {
            x2 = x1
            y2 = sampleArray(grid)
            for (let i = 0; i < 3; i++) {
                if (Math.abs(y2 - y1) > (step * 5)) {
                    y2 = sampleArray(grid)
                }
            }
        } else {
            x2 = sampleArray(grid)
            for (let i = 0; i < 3; i++) {
                if (Math.abs(x2 - x1) > (step * 5)) {
                    x2 = sampleArray(grid)
                }
            }
            y2 = y1
        }

        // sample radii
        var radius1 = sampleArray(radii)
        var radius2 = sampleArray(radii)

        // sample shade
        var shade = sampleArray(palette)

        // draw filled circle in the primary location
        ctx.beginPath();
        ctx.fillStyle = shade;
        ctx.strokeStyle = shade;
        ctx.arc(x1, y1, radius1, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        
        // draw an unfilled circle in the secondary location
        ctx.beginPath();
        ctx.fillStyle = shade
        ctx.strokeStyle = shade
        ctx.lineWidth = Math.min(radius1, radius2) / 2
        ctx.arc(x2, y2, radius2, 0, Math.PI * 2, true)
        ctx.stroke();
        ctx.closePath();

        // add the connector
        ctx.beginPath()
        if (vertical) {
            if (y2 > y1) {
                ctx.moveTo(x1, y1 + radius1)
                ctx.lineTo(x2, y2 - radius2)
            } else {
                ctx.moveTo(x1, y1 - radius1)
                ctx.lineTo(x2, y2 + radius2)
            }
        } else {
            if (x2 > x1) {
                ctx.moveTo(x1 + radius1, y1)
                ctx.lineTo(x2 - radius2, y2)
            } else {
                ctx.moveTo(x1 - radius1, y1)
                ctx.lineTo(x2 + radius2, y2)
            }        
        }
        
        ctx.strokeStyle = shade
        ctx.lineWidth = Math.min(radius1, radius2) / 2
        ctx.stroke()

        ctx.lineWidth = 2 // reset

    }

    // add circles and barbelles to the grid
    ctx.lineWidth = 2
    for (let z = 0; z < iter; z++) {
        if (rng.double() < .8) {
            drawCircle(grid, radii, palette)
        } else {
            drawBarbell(grid, radii, palette)
        }
    }

    // path to file
    let file = "../output/03/advent_03_" + seed + ".png"

    // write the image to file
    const out = fs.createWriteStream(file)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
}

// generate all the images
for (seed = 200; seed < 300; seed++) {
    drawImage(seed)
}

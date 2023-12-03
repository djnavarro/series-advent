
// nodejs libraries
const {createCanvas, loadImage} = require('canvas')
const seedrandom = require('seedrandom') 
const fs = require('fs')

// generate an image using the seed
function drawImage(seed) {

    // message
    console.log("seed: " + seed)

    // constants 
    const pixels = 2000 // pixels in the image
    const border = 50   // pixels comprising the border
    const grain = 25    // rows and columns in the grid
    const bubbles = 50  // number of oversized locations
    const iter = 1000   // iterations to add to image

    // create a canvas
    // https://github.com/Automattic/node-canvas
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

    // define a discrete set of permissible grid locations
    var grid = []
    var k = 0
    for (let i = 0; i < (grain - 1); i++) {
        for (let j = 0; j < (grain - 1); j++) {
            grid[k] = {
                id: k,
                col: i,
                row: j,
                x: ((pixels - border * 2) / grain) * (i + 1) + border,
                y: ((pixels - border * 2) / grain) * (j + 1) + border,
                valid: true,
                size: 1
            }
            k++
        }
    }

    // create some "big" cells in the grid by merging a 3x3 grid or a 5x5 grid
    var cell
    var neighbours
    var aura
    for (let i = 0; i < bubbles; i++) {
        // select a random grid location
        cell = sampleArray(grid)

        // the "aura" defines the neighbourhood size
        if (i < 5) {
            aura = 2 // 5x5 grid
        } else {
            aura = 1 // 3x3 grid
        }

        // don't try to merge points on the edge of the grid
        if(cell.row > 0 & cell.row < (grain - 1)) {
            if(cell.row > 0 & cell.row < (grain - 1)) {
            
                // find the neighbourhood
                neighbours = grid.filter(
                    c => Math.abs(c.col - cell.col) < (aura + 1) & Math.abs(c.row - cell.row) < (aura + 1)
                )

                // don't try to merge unless all neighbours are marked as valid merge target
                if(neighbours.map(c => c.valid).reduce((a,b) => a & b)) {

                    // set the whole neighbourhood to be invalid targets
                    neighbours.map(c => c.valid = false)

                    // set the original cell to be a double size valid target
                    cell.valid = true
                    if (aura = 1) {
                        cell.size = 2.25
                    } else {
                        cell.size = 4.5
                    }

                }
            }
        }
    }

    // define a discrete set of permissible radii
    var radii = []
    for (let i = 0; i < 6; i ++) {
        radii[i] = (pixels / grain) * (.1 + (i / 6) * .3)
    }

    // function to draw a filled circle
    function drawCircle(grid, radii, palette) {
        
        // sample a cell to draw a circle to
        var cell = sampleArray(grid)

        // only draw if it's a valid drawing target
        if(cell.valid) {

            // sample a radius and a shade
            var radius = sampleArray(radii) * cell.size
            var shade = sampleArray(palette)

            // draw filled circle
            ctx.beginPath();
            ctx.fillStyle = shade;
            ctx.strokeStyle = shade;
            ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();
        }
    }

    // function to draw a barbell
    function drawBarbell(grid, radii, palette) {
        
        // sample primary cell
        var cell1 = sampleArray(grid)

        if(cell1.valid) {

            // sample secondary cell
            var slice
            var vertical = rng.double() < .5
            if (vertical) {
                slice = grid.filter(c => (c.col == cell1.col) & (Math.abs(c.row - cell1.row) < 5))
            } else {
                slice = grid.filter(c => (c.row == cell1.row) & (Math.abs(c.col - cell1.col) < 5))                
            }
            var cell2 = sampleArray(slice)

            if(cell2.valid) {

                // sample radii
                var radius1 = sampleArray(radii) * cell1.size
                var radius2 = sampleArray(radii) * cell2.size

                // sample shade
                var shade = sampleArray(palette)

                // draw filled circle in the primary location
                ctx.beginPath();
                ctx.fillStyle = shade;
                ctx.strokeStyle = shade;
                ctx.arc(cell1.x, cell1.y, radius1, 0, Math.PI * 2, true);
                ctx.stroke();
                ctx.fill();
                ctx.closePath();

                // draw an unfilled circle in the secondary location
                ctx.beginPath();
                ctx.fillStyle = shade
                ctx.strokeStyle = shade
                ctx.lineWidth = Math.min(radius1, radius2) / 2
                ctx.arc(cell2.x, cell2.y, radius2, 0, Math.PI * 2, true)
                ctx.stroke();
                ctx.closePath();

                // add the connector
                ctx.beginPath()
                if (vertical) {
                    if (cell2.y > cell1.y) {
                        ctx.moveTo(cell1.x, cell1.y + radius1)
                        ctx.lineTo(cell2.x, cell2.y - radius2)
                    } else {
                        ctx.moveTo(cell1.x, cell1.y - radius1)
                        ctx.lineTo(cell2.x, cell2.y + radius2)
                    }
                } else {
                    if (cell2.x > cell1.x) {
                        ctx.moveTo(cell1.x + radius1, cell1.y)
                        ctx.lineTo(cell2.x - radius2, cell2.y)
                    } else {
                        ctx.moveTo(cell1.x - radius1, cell1.y)
                        ctx.lineTo(cell2.x + radius2, cell2.y)
                    }        
                }

                ctx.strokeStyle = shade
                ctx.lineWidth = Math.min(radius1, radius2) / 2
                ctx.stroke()
                ctx.lineWidth = 2 // reset

            }
        }
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
    let file = "../output/04/advent_04_" + seed + ".png"

    // write the image to file
    const out = fs.createWriteStream(file)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
}

// generate all the images
for (seed = 200; seed < 400; seed++) {
    drawImage(seed)
}

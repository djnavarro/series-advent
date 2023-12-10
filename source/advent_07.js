
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
    const border = -20  // pixels comprising the border
    const grain = 30    // rows and columns in the grid
    const iter = 30     // iterations to add to image

    // create a canvas
    // https://github.com/Automattic/node-canvas
    const canvas = createCanvas(pixels, pixels)
    let ctx = canvas.getContext('2d')

    // create a seeded random number generator
    // https://github.com/davidbau/seedrandom
    let rng = seedrandom.alea(seed)

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
    ctx.fillStyle = sampleArray(palette);
    ctx.fillRect(0, 0, pixels, pixels);

    // define a discrete set of permissible grid locations
    let grid = []
    let k = 0
    for (let i = 0; i < (grain - 1); i++) {
        for (let j = 0; j < (grain - 1); j++) {
            grid[k] = {
                id: k,
                col: i,
                row: j,
                size: ((pixels - border * 2) / grain),
                x: ((pixels - border * 2) / grain) * (i + 1) + border,
                y: ((pixels - border * 2) / grain) * (j + 1) + border,
                valid: true,
                shade: sampleArray(palette)
            }
            k++
        }
    }


    // create the image
    for (let z = 0; z < iter; z++) {

        grid.map(cell => {

            // draw
            ctx.fillStyle = cell.shade
            ctx.strokeStyle = cell.shade
            ctx.beginPath()
            ctx.arc(cell.x, cell.y, cell.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            ctx.closePath();

            // update
            cell.size = cell.size * 0.9
            if (rng.double() < .1) cell.shade = sampleArray(palette)
            cell.x = cell.x + cell.size * (rng.double() - .5)
            cell.y = cell.y + cell.size * (rng.double() - .5)
        })

    }

    // write the image to file
    const out = fs.createWriteStream('../output/07/advent_07_' + seed + '.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
}

// generate all the images
for (seed = 700; seed < 800; seed++) {
    drawImage(seed)
}

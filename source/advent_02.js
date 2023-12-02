
// nodejs libraries
const {createCanvas, loadImage} = require('canvas')
const seedrandom = require('seedrandom') 
const fs = require('fs')

// generate an image using the seed
function drawImage(seed) {

    // message
    console.log("seed: " + seed)

    // constants 
    const pixels = 2000

    // create a canvas
    // // https://github.com/Automattic/node-canvas
    let canvas = createCanvas(pixels, pixels)
    let ctx = canvas.getContext('2d')

    // create a seeded random number generator
    // https://github.com/davidbau/seedrandom
    let rng = seedrandom.alea(seed)

    // function to sample an item from an array
    function sample(items) {
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
        ["#0a0908", "#49111c", "#f2f4f3", "#a9927d", "#5e503f"]
    ]
    const palette = sample(palettes)

    // set background colour
    ctx.fillStyle = sample(palette);
    ctx.fillRect(0, 0, pixels, pixels);

    // sample the grain of the grid and number of iterations
    let grain = 10 + Math.floor(rng.double() * 15)
    let iter = 200 + Math.floor(rng.double() * 200)
    let radiusMax = (pixels / grain) * (.4 + rng.double() * .1)

    // draw circles
    let radius, shade, x, y
    for (let z = 0; z < iter; z++) {

        // sample coords, radius, and colour
        x = (1 + Math.floor(rng.double() * (grain - 1))) * (pixels / grain)
        y = (1 + Math.floor(rng.double() * (grain - 1))) * (pixels / grain)
        radius = rng.double() * radiusMax
        shade = sample(palette)

        // draw filled circle
        ctx.beginPath();
        ctx.fillStyle = shade;
        ctx.strokeStyle = shade;
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    // path to file
    let file = "../output/02/advent_02_" + seed + ".png"

    // write the image to file
    const out = fs.createWriteStream(file)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
}

// generate all the images
for (seed = 100; seed < 200; seed++) {
    drawImage(seed)
}
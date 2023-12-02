
// constants 
const pixels = 2000
const grain = 1000 
const iter = 2000

// create a canvas (with node-canvas)
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(pixels, pixels)
const ctx = canvas.getContext('2d')

// function to decide if point is within circle
function withinCircle(x, y, r) {
   return (x*x + y*y < r*r)
}

// function to initialise the shade of a cell
function shadeCell(x, y, scale) {
    let xu = x / scale
    let yu = y / scale
    let g = 0
    let r = Math.floor((1 - xu) * 155)
    let b = Math.floor((1 - yu) * 155)
    for (let rad = .15; rad < .5; rad = rad + .05) {
        if (withinCircle(xu - .5, yu - .5, rad)) {
            r = r + 10
            b = b + 10
            g = g + 10
        }
    }
    return `rgb(${r}, ${g}, ${b})`
}

// nested array to hold the shades
let shade = new Array(grain);
for (let i = 0; i < shade.length; i++) {
  shade[i] = new Array(grain);
}

// assign each element its initial shade
for (let i = 0; i < grain; i++) {
    for (let j = 0; j < grain; j++) {
        shade[i][j] = shadeCell(i, j, grain)
    }
}

// function to sample an item from an array
function sample(items) {
    return(items[Math.floor(Math.random()*items.length)]);
}

// indices we can sample from
const inds = [-1, 0, 1];

// iterate
let u = 0;
let v = 0;
for (let z = 0; z < iter; z++) {
    for (let i = 1; i < grain - 1; i++) {
        for (let j = 1; j < grain - 1; j++) {
            u = i + sample(inds);
            v = j + sample(inds);
            shade[i][j] = shade[u][v];
        }
    }
}

// fill the grid with shades
for (let i = 0; i < grain; i++) {
    for (let j = 0; j < grain; j++) {
        ctx.fillStyle = shade[i][j]
        ctx.fillRect(i * (pixels/grain), j * (pixels/grain), (pixels/grain), (pixels/grain));
    }
}

// write the image to file
const fs = require('fs')
const out = fs.createWriteStream('../output/01/advent_01_c.png')
const stream = canvas.createPNGStream()
stream.pipe(out)
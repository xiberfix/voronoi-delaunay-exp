import './style.css'


// Prepare drawing surface

const canvas = document.getElementById('surface') as HTMLCanvasElement
const context = canvas.getContext('2d')

function scaleCanvas(canvas: HTMLCanvasElement) {
    const {width, height} = canvas.getBoundingClientRect()
    const dpr = devicePixelRatio
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    context.scale(dpr, dpr)
}

scaleCanvas(canvas)

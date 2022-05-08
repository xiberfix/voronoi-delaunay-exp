import './style.css'
import {Vec2} from './Vec2'


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


// Draw random points

function getCanvasSize(): Vec2 {
    const {width, height} = canvas.getBoundingClientRect()
    return new Vec2(width, height)
}

const CANVAS_SIZE = getCanvasSize()
const CANVAS_OFFSET = CANVAS_SIZE.scale(0.5)

function tx(x: number) { return +x + CANVAS_OFFSET.x }
function ty(y: number) { return -y + CANVAS_OFFSET.y }

const POINT_SIZE = 2

function drawPoint(p: Vec2, color: string = '#000000') {
    context.beginPath()
    context.fillStyle = color
    context.arc(tx(p.x), ty(p.y), POINT_SIZE, 0, Math.PI * 2)
    context.fill()
}

function* range(a: number, b: number) {
    for (let i = a; i < b; i++)
        yield i
}

const N = 30
const points = [...range(0, N)].map(_ => Vec2.random().mul(CANVAS_SIZE).sub(CANVAS_OFFSET))

for (const point of points)
    drawPoint(point)


// Draw random triangles

class Triangle {
    constructor(
        public a: Vec2,
        public b: Vec2,
        public c: Vec2,
    ) {}
}

function drawTriangle(t: Triangle, color: string = '#000000') {
    const {a, b, c} = t
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(tx(a.x), ty(a.y))
    context.lineTo(tx(b.x), ty(b.y))
    context.lineTo(tx(c.x), ty(c.y))
    context.lineTo(tx(a.x), ty(a.y))
    context.stroke()
}

function* chunks<T>(xs: T[], n: number) {
    for (let i = 0; i < xs.length; i += n)
        yield xs.slice(i, i + n)
}

for (const [a, b, c] of chunks(points, 3))
    drawTriangle(new Triangle(a, b, c))

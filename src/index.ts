import './style.css'
import {Vec2} from './Vec2'
import {counts, partition, range} from './collection'
import {Circle, Bounds, Triangle, extendBounds, findBounds} from './geom2'


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

function getCanvasSize(): Vec2 {
    const {width, height} = canvas.getBoundingClientRect()
    return new Vec2(width, height)
}

const CANVAS_SIZE = getCanvasSize()
const CANVAS_OFFSET = CANVAS_SIZE.scale(0.5)

function tx(x: number) { return +x + CANVAS_OFFSET.x }
function ty(y: number) { return -y + CANVAS_OFFSET.y }


// Drawing

const POINT_SIZE = 2

function drawPoint(p: Vec2, color: string = '#000000') {
    context.beginPath()
    context.fillStyle = color
    context.arc(tx(p.x), ty(p.y), POINT_SIZE, 0, Math.PI * 2)
    context.fill()
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

function drawCircle(c: Circle, color: string = '#000000') {
    const {p, r} = c
    context.strokeStyle = color
    context.beginPath()
    context.arc(tx(p.x), ty(p.y), r, 0, Math.PI * 2)
    context.stroke()
}

function drawBounds(b: Bounds, color: string = '#000000') {
    const {min, max} = b
    const tl = new Vec2(min.x, max.y)
    const tr = new Vec2(max.x, max.y)
    const bl = new Vec2(min.x, min.y)
    const br = new Vec2(max.x, min.y)
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(tx(tl.x), ty(tl.y))
    context.lineTo(tx(tr.x), ty(tr.y))
    context.lineTo(tx(br.x), ty(br.y))
    context.lineTo(tx(bl.x), ty(bl.y))
    context.lineTo(tx(tl.x), ty(tl.y))
    context.stroke()
}


// Triangulation

function delaunay(points: Vec2[], clean?: boolean, bounds?: Bounds): Triangle[] {
    // 1. find initial triangulation containing all points
    const GAP = 10
    const {min, max} = bounds ?? extendBounds(findBounds(points)!, GAP)

    const tl = new Vec2(min.x, max.y)
    const tr = new Vec2(max.x, max.y)
    const bl = new Vec2(min.x, min.y)
    const br = new Vec2(max.x, min.y)

    let result: Triangle[] = [
        new Triangle(tl, tr, bl),
        new Triangle(tr, br, bl),
    ]

    // 2. insert points iteratively
    const insert = (p: Vec2) => {
        // cut triangles whose circumcircle contains new point
        const [toRemove, unaffected] = partition(result, t => t.circumcircle.contains(p))

        // find the cavity border edges
        // the border edges are included once, the internal edges are included twice
        const edges = toRemove.flatMap(t => [...t.edges()])
        const border = counts(edges, (a, b) => a.eq(b))
            .filter(([_, count]) => count === 1)
            .map(([e, _]) => e)

        // add new triangles connecting new point to the edge of the cavity border
        const toAdd = border.map(({a, b}) => new Triangle(p, a, b))
        result.splice(0, result.length, ...toAdd, ...unaffected)
    }

    for (const point of points)
        insert(point)

    // 3. remove border triangles
    if (clean) {
        const border = [tl, tr, bl, br]
        const isBorder = (p: Vec2): boolean => border.some(x => p.eq(x))
        result = result.filter(t => !isBorder(t.a) && !isBorder(t.b) && !isBorder(t.c))
    }

    return result
}


// Example

const N = 9
const DATA_SIZE = CANVAS_SIZE.scale(0.5)
const DATA_OFFSET = DATA_SIZE.scale(-0.5)
const points = [...range(0, N)].map(_ => Vec2.random().mul(DATA_SIZE).add(DATA_OFFSET))

const triangulation = delaunay(points, true)

for (const point of points)
    drawPoint(point)
for (const t of triangulation)
    drawTriangle(t, '#00ffff')

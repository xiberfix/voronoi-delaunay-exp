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

const N = 9
const DATA_SIZE = CANVAS_SIZE.scale(0.5)
const DATA_OFFSET = DATA_SIZE.scale(0.5)
const points = [...range(0, N)].map(_ => Vec2.random().mul(DATA_SIZE).sub(DATA_OFFSET))

for (const point of points)
    drawPoint(point)


// Draw random triangles

class Triangle {
    constructor(
        public a: Vec2,
        public b: Vec2,
        public c: Vec2,
    ) {
        this.circumcircle = findCircumscribedCircle(this)
    }

    circumcircle: Circle

    * edges() {
        yield new Edge(this.a, this.b)
        yield new Edge(this.b, this.c)
        yield new Edge(this.c, this.a)
    }
}

class Edge {
    constructor(
        public a: Vec2,
        public b: Vec2,
    ) {}

    eq(rhs: Edge): boolean { return this.a.eq(rhs.a) && this.b.eq(rhs.b) || this.a.eq(rhs.b) && this.b.eq(rhs.a) }
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


// Draw random circles

class Circle {
    constructor(
        public p: Vec2,
        public r: number,
    ) {}

    contains(p: Vec2): boolean { return this.p.distanceTo(p) <= this.r }
}

function drawCircle(c: Circle, color: string = '#000000') {
    const {p, r} = c
    context.strokeStyle = color
    context.beginPath()
    context.arc(tx(p.x), ty(p.y), r, 0, Math.PI * 2)
    context.stroke()
}


// Circumscribed Circle

function findCircumscribedCircle(t: Triangle): Circle {
    // Equations:
    // v_i ~~ vertex
    // O ~~ center
    // p = O - v_0 ~~ radius
    // u_i = v_i - v_0 ~~ side
    // p - u_i ~~ radius
    // |p - u_i|^2 = |p|^2 <->
    // p * u_i = |u_i|^2 / 2 ~~ system

    const {a: v0, b: v1, c: v2} = t
    const u1 = v1.sub(v0)
    const u2 = v2.sub(v0)

    const q1 = u2.crossRight.scale(u1.lengthSq) // (u2 cross z) * |u1|^2
    const q2 = u1.crossLeft.scale(u2.lengthSq) // (z cross u1) * |u2|^2
    const q = q1.add(q2)
    const det = u1.cross(u2)
    const center = v0.add(q.scale(1 / (2 * det)))

    const r = v0.distanceTo(center)

    return new Circle(center, r)
}


// Bounds

interface Bounds {
    min: Vec2
    max: Vec2
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

function findBounds(points: Vec2[]): Bounds | undefined {
    if (points.length === 0) return

    let min = points[0]
    let max = points[0]
    for (const point of points) {
        min = point.min(min)
        max = point.max(max)
    }
    return {min, max}
}

function extendBounds(bounds: Bounds, gap: number): Bounds {
    const d = new Vec2(gap, gap)
    return {
        min: bounds.min.sub(d),
        max: bounds.max.add(d),
    }
}


// Triangulation

function partition<T>(xs: T[], pred: (x: T) => boolean): [T[], T[]] {
    return xs.reduce(
        (acc, x) => {
            acc[pred(x) ? 0 : 1].push(x)
            return acc
        },
        [[], []])
}

function counts<T>(xs: T[], compare: (a: T, b: T) => boolean): [T, number][] {
    const result: [T, number][] = []
    for (const x of xs) {
        let add = true
        for (const r of result) {
            if (compare(x, r[0])) {
                r[1] += 1
                add = false
                break
            }
        }
        if (add) result.push([x, 1])
    }
    return result
}

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

const triangulation = delaunay(points, true)

for (const t of triangulation)
    drawTriangle(t, '#00ffff')

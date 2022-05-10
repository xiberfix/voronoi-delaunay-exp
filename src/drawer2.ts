import {Vec2} from './Vec2'
import {Bounds, Circle, Triangle} from './geom2'


const POINT_SIZE = 2

export class Drawer2 {
    constructor(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement
        this.context = this.canvas.getContext('2d')
        this.prepare()
    }

    canvas: HTMLCanvasElement
    context: CanvasRenderingContext2D
    offset: Vec2

    prepare() {
        const {width, height} = this.canvas.getBoundingClientRect()
        const dpr = devicePixelRatio
        this.canvas.width = Math.floor(width * dpr)
        this.canvas.height = Math.floor(height * dpr)
        this.context.scale(dpr, dpr)
        this.offset = new Vec2(width, height).scale(0.5)
    }

    private tx(x: number) { return +x + this.offset.x }
    private ty(y: number) { return -y + this.offset.y }

    drawPoint(p: Vec2, color: string = '#000000') {
        const ctx = this.context
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.arc(this.tx(p.x), this.ty(p.y), POINT_SIZE, 0, Math.PI * 2)
        ctx.fill()
    }

    drawTriangle(t: Triangle, color: string = '#000000') {
        const ctx = this.context
        const {a, b, c} = t
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(this.tx(a.x), this.ty(a.y))
        ctx.lineTo(this.tx(b.x), this.ty(b.y))
        ctx.lineTo(this.tx(c.x), this.ty(c.y))
        ctx.lineTo(this.tx(a.x), this.ty(a.y))
        ctx.stroke()
    }

    drawCircle(c: Circle, color: string = '#000000') {
        const ctx = this.context
        const {p, r} = c
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.arc(this.tx(p.x), this.ty(p.y), r, 0, Math.PI * 2)
        ctx.stroke()
    }

    drawBounds(b: Bounds, color: string = '#000000') {
        const ctx = this.context
        const {min, max} = b
        const tl = new Vec2(min.x, max.y)
        const tr = new Vec2(max.x, max.y)
        const bl = new Vec2(min.x, min.y)
        const br = new Vec2(max.x, min.y)
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(this.tx(tl.x), this.ty(tl.y))
        ctx.lineTo(this.tx(tr.x), this.ty(tr.y))
        ctx.lineTo(this.tx(br.x), this.ty(br.y))
        ctx.lineTo(this.tx(bl.x), this.ty(bl.y))
        ctx.lineTo(this.tx(tl.x), this.ty(tl.y))
        ctx.stroke()
    }
}

import {Vec2} from './Vec2'


export class Triangle {
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


export class Edge {
    constructor(
        public a: Vec2,
        public b: Vec2,
    ) {}

    eq(rhs: Edge): boolean { return this.a.eq(rhs.a) && this.b.eq(rhs.b) || this.a.eq(rhs.b) && this.b.eq(rhs.a) }
}


export class Circle {
    constructor(
        public p: Vec2,
        public r: number,
    ) {}

    contains(p: Vec2): boolean { return this.p.distanceTo(p) <= this.r }
}


export interface Bounds {
    min: Vec2
    max: Vec2
}


export function findCircumscribedCircle(t: Triangle): Circle {
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


export function findBounds(points: Vec2[]): Bounds | undefined {
    if (points.length === 0) return

    let min = points[0]
    let max = points[0]
    for (const point of points) {
        min = point.min(min)
        max = point.max(max)
    }
    return {min, max}
}


export function extendBounds(bounds: Bounds, gap: number): Bounds {
    const d = new Vec2(gap, gap)
    return {
        min: bounds.min.sub(d),
        max: bounds.max.add(d),
    }
}

import {eq} from './math'


export class Vec2 {
    constructor(
        public x: number,
        public y: number,
    ) {}

    add(rhs: Vec2): Vec2 { return new Vec2(this.x + rhs.x, this.y + rhs.y) }
    sub(rhs: Vec2): Vec2 { return new Vec2(this.x - rhs.x, this.y - rhs.y) }
    mul(rhs: Vec2): Vec2 { return new Vec2(this.x * rhs.x, this.y * rhs.y) }
    div(rhs: Vec2): Vec2 { return new Vec2(this.x / rhs.x, this.y / rhs.y) }

    scale(s: number): Vec2 { return new Vec2(this.x * s, this.y * s) }

    dot(rhs: Vec2): number { return this.x * rhs.x + this.y * rhs.y }

    cross(rhs: Vec2): number { return this.x * rhs.y - this.y * rhs.x }
    get crossLeft(): Vec2 { return new Vec2(-this.y, this.x) }
    get crossRight(): Vec2 { return new Vec2(this.y, -this.x) }

    get lengthSq(): number { return this.dot(this) }
    get length(): number { return Math.sqrt(this.lengthSq) }

    distanceToSq(v: Vec2): number { return this.sub(v).lengthSq }
    distanceTo(v: Vec2): number { return this.sub(v).length }

    min(rhs: Vec2): Vec2 { return new Vec2(Math.min(this.x, rhs.x), Math.min(this.y, rhs.y)) }
    max(rhs: Vec2): Vec2 { return new Vec2(Math.max(this.x, rhs.x), Math.max(this.y, rhs.y)) }

    static random(): Vec2 { return new Vec2(Math.random(), Math.random()) }

    eq(rhs: Vec2): boolean { return eq(this.x, rhs.x) && eq(this.y, rhs.y) }
}

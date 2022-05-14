import './style.css'
import {Vec2} from './Vec2'
import {counts, partition, range} from './collection'
import {Bounds, Triangle, extendBounds, findBounds} from './geom2'
import {Drawer2} from './drawer2'


const drawer = new Drawer2('surface')


function delaunay(points: Vec2[], clean?: boolean, bounds?: Bounds): Triangle[] {
    // 1. find initial triangulation containing all points
    const GAP = 10000
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
const DATA_RANGE = new Vec2(200, 200)
const DATA_OFFSET = DATA_RANGE.scale(-0.5)
const points = [...range(0, N)].map(_ => Vec2.random().mul(DATA_RANGE).add(DATA_OFFSET))

const triangulation = delaunay(points, true)

for (const point of points)
    drawer.drawPoint(point)
for (const t of triangulation)
    drawer.drawTriangle(t, '#00ffff')

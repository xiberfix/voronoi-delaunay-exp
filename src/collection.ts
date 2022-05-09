export function* range(a: number, b: number) {
    for (let i = a; i < b; i++)
        yield i
}

export function* chunks<T>(xs: T[], n: number) {
    for (let i = 0; i < xs.length; i += n)
        yield xs.slice(i, i + n)
}

export function partition<T>(xs: T[], pred: (x: T) => boolean): [T[], T[]] {
    return xs.reduce(
        (acc, x) => {
            acc[pred(x) ? 0 : 1].push(x)
            return acc
        },
        [[], []])
}

export function counts<T>(xs: T[], compare: (a: T, b: T) => boolean): [T, number][] {
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

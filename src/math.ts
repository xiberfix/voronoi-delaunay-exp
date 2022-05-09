export const EPS = 1e-6

export function eq(a: number, b: number): boolean {
    return Math.abs(a - b) < EPS
}

export class OverlapKeeper {
  current: number[]
  previous: number[]

  constructor() {
    this.current = []
    this.previous = []
  }

  /**
   * getKey
   */
  getKey(i: number, j: number): number {
    if (j < i) {
      const temp = j
      j = i
      i = temp
    }
    return (i << 16) | j
  }

  /**
   * set
   */
  set(i: number, j: number): void {
    // Insertion sort. This way the diff will have linear complexity.
    const key = this.getKey(i, j)
    const current = this.current
    let index = 0
    while (key > current[index]) {
      index++
    }
    if (key === current[index]) {
      return // Pair was already added
    }
    for (let j = current.length - 1; j >= index; j--) {
      current[j + 1] = current[j]
    }
    current[index] = key
  }

  /**
   * tick
   */
  tick(): void {
    const tmp = this.current
    this.current = this.previous
    this.previous = tmp
    this.current.length = 0
  }

  /**
   * getDiff
   */
  getDiff(additions: number[], removals: number[]): void {
    const a = this.current
    const b = this.previous
    const al = a.length
    const bl = b.length

    let j = 0
    for (let i = 0; i < al; i++) {
      let found = false
      const keyA = a[i]
      while (keyA > b[j]) {
        j++
      }
      found = keyA === b[j]

      if (!found) {
        unpackAndPush(additions, keyA)
      }
    }
    j = 0
    for (let i = 0; i < bl; i++) {
      let found = false
      const keyB = b[i]
      while (keyB > a[j]) {
        j++
      }
      found = a[j] === keyB

      if (!found) {
        unpackAndPush(removals, keyB)
      }
    }
  }
}

function unpackAndPush(array: number[], key: number): void {
  array.push((key & 0xffff0000) >> 16, key & 0x0000ffff)
}

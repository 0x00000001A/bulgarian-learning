type PriorityQueueComparator<T> = (a: T, b: T) => boolean

function defaultComparator<T>(a: T, b: T) {
  return a < b
}

class PriorityQueue<T> {
  size: number
  nodes: T[]
  comparator: PriorityQueueComparator<T>
  
  constructor(initialSize = 1000) {
    this.size = 0
    this.nodes = new Array(initialSize)
    this.comparator = defaultComparator<T>
  }
  
  push(value: T) {
    this.nodes[++this.size] = value
    
    for (let i = this.size; i > 1 && this.compare(this.nodes[i], this.nodes[i >> 1]); i = i >> 1) {
      this.swap(i, i >> 1)
    }
  }
  
  compare(a: T, b: T) {
    return this.comparator(a, b)
  }
  
  shift() {
    if (this.size === 0) {
      return
    }
    
    this.swap(1, this.size)
    this.rebuild(1)
    
    return this.nodes[this.size--]
  }
  
  swap(i: number, j: number) {
    const a = this.nodes[i]
    
    this.nodes[i] = this.nodes[j]
    this.nodes[j] = a
  }
  
  rebuild(node: number) {
    let lf = 2 * node
    
    if (lf < this.size) {
      const rt = lf + 1
      
      if (rt < this.size && this.compare(this.nodes[rt], this.nodes[lf])) {
        lf = rt
      }
      
      if (this.compare(this.nodes[lf], this.nodes[node])) {
        this.swap(node, lf)
        this.rebuild(lf)
      }
    }
  }
  
  setComparator(comparator: PriorityQueueComparator<T>) {
    this.comparator = comparator
  }
}

export default PriorityQueue

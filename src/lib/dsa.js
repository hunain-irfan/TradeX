/**
 * PortfolioMap — HashMap wrapper around JS Map.
 * O(1) average lookup for portfolio holdings.
 */
export class PortfolioMap {
  constructor() {
    /** @type {Map<string, object>} */
    this._map = new Map()
  }

  set(symbol, data) {
    this._map.set(symbol, data)
  }

  get(symbol) {
    return this._map.get(symbol)
  }

  has(symbol) {
    return this._map.has(symbol)
  }

  delete(symbol) {
    return this._map.delete(symbol)
  }

  getAll() {
    return Array.from(this._map.entries()).map(([symbol, data]) => ({
      symbol,
      ...data,
    }))
  }

  updatePrice(symbol, price) {
    const holding = this._map.get(symbol)
    if (!holding) return false
    this._map.set(symbol, { ...holding, currentPrice: price })
    return true
  }
}

/**
 * TransactionStack — Stack (LIFO).
 * LIFO structure for undo last transaction.
 */
export class TransactionStack {
  constructor() {
    /** @type {object[]} */
    this._stack = []
  }

  push(transaction) {
    this._stack.push(transaction)
  }

  pop() {
    if (this.isEmpty()) return undefined
    return this._stack.pop()
  }

  peek() {
    if (this.isEmpty()) return undefined
    return this._stack[this._stack.length - 1]
  }

  isEmpty() {
    return this._stack.length === 0
  }

  toArray() {
    return [...this._stack]
  }
}

/**
 * binarySearch — searches a sorted array of objects by key field.
 * O(log n) search on sorted stock symbol list.
 * @returns {number} index if found, otherwise -1
 */
export function binarySearch(sortedArray, target, key) {
  let left = 0
  let right = sortedArray.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midValue = sortedArray[mid][key]

    if (midValue === target) {
      return mid
    }
    if (midValue < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return -1
}

/**
 * sortByField — sorts an array of objects by any field, asc or desc.
 * Used for leaderboard and portfolio sorting.
 */
export function sortByField(array, field, direction = 'asc') {
  const copy = [...array]
  const multiplier = direction === 'desc' ? -1 : 1

  copy.sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier
    }

    if (aVal < bVal) return -1 * multiplier
    if (aVal > bVal) return 1 * multiplier
    return 0
  })

  return copy
}

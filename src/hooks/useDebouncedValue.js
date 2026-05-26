import { useEffect, useState } from 'react'

/** Smooth rapid live price ticks for stat cards (ms delay). */
export function useDebouncedValue(value, delayMs = 2000) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}

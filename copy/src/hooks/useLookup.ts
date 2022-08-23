import { useRef } from 'react'

export type Lookup<K, V> = {
  access: (k: K) => V
  assign: (k: K, v: V) => void
  asData: () => LookupData<K, V>
}
export type LookupData<K, V> = object & {
  readonly __LookupData: { k: K; v: V }
}

export function useLookup<V, K extends string | number>(
  initialState: LookupData<K, V>
): Lookup<K, V> {
  const { current } = useRef(initialState)
  return {
    access: (k: K): V => {
      // @ts-ignore
      return current[k as string]
    },
    assign: (k: K, v: V): void => {
      // @ts-ignore
      current[k as string] = v
    },
    asData: () => current as LookupData<K, V>,
  }
}

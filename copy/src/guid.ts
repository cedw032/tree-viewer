export type Guid = string & { readonly __Guid: unique symbol }

export function guid(): Guid {
  const view = new DataView(new ArrayBuffer(16))
  crypto.getRandomValues(new Uint8Array(view.buffer))

  function p32(o: number): string {
    return view.getUint32(o).toString(16).padStart(8, '0')
  }

  function p16(o: number): string {
    return view.getUint16(o).toString(16).padStart(4, '0')
  }

  const a = p32(0)
  const b = p16(4)
  const c = p16(6)
  const d = p16(8)
  const e = p32(10)
  const f = p16(14)

  return `${a}-${b}-${c}-${d}-${e}${f}` as Guid
}

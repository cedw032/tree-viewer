import { useEffect } from 'react'

type KeyName =
  | 'Enter'
  | 'Shift'
  | 'ArrowLeft'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowRight'
type Keymap = {
  [k in KeyName]?: {
    up?: () => void
    down?: () => void
  }
}

let keymaps: Keymap[] = []
function onKeyDown(e: KeyboardEvent): void {
  keymaps.forEach((keymap) => {
    // @ts-ignore
    const down = keymap[e.key]?.down || (() => {})
    down()
  })
}
function onKeyUp(e: KeyboardEvent): void {
  keymaps.forEach((keymap) => {
    // @ts-ignore
    const up = keymap[e.key]?.up || (() => {})
    up()
  })
}
window.addEventListener('keydown', onKeyDown as any)
window.addEventListener('keyup', onKeyUp as any)

export function useKeyboard(keymap: Keymap, mute: boolean) {
  useEffect(() => {
    if (!mute) {
      keymaps = [...keymaps, keymap]
    }

    return () => {
      if (!mute) {
        keymaps = keymaps.filter((k) => k !== keymap)
      }
    }
  }, [mute, keymap])
}

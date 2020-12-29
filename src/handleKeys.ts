import { KeyboardEvent } from 'react'

type KeyName = 'Enter' | 'Shift' | 'ArrowLeft'
type KeyMap = {
  [k in KeyName]?: {
    up?: () => void
    down?: () => void
  }
}

export const handleKeys = (keymap: KeyMap) => ({
  handleKeyPress: (k: KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    const down = keymap[k.key]?.down || (() => {})
    down()
  },
  handleKeyRelease: (k: KeyboardEvent<HTMLInputElement>) => {
    // @ts-ignore
    const up = keymap[k.key]?.up || (() => {})
    up()
  },
})

import { useState } from 'react'
import { useKeyboard } from './useKeyboard'

export type KeyboardModifiers = {
  Shift: boolean
}

export function useKeyboardModifiers(): KeyboardModifiers {
  const [keyboardModifiers, setKeyboardModifiers] = useState({ Shift: false })
  useKeyboard(
    {
      Shift: {
        down: () => setKeyboardModifiers((prev) => ({ ...prev, Shift: true })),
        up: () => setKeyboardModifiers((prev) => ({ ...prev, Shift: false })),
      },
    },
    false
  )
  return keyboardModifiers
}

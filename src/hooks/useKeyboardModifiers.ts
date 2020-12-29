import { useEffect, useState } from 'react'

export type KeyboardModifiers = {
  Shift: boolean
}

export function useKeyboardModifiers(): KeyboardModifiers {
  const [keyboardModifiers, setKeyboardModifiers] = useState({ Shift: false })
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      switch (e.key) {
        case 'Shift':
            console.log('SHIFT DOWN')
          setKeyboardModifiers((prev) => ({ ...prev, Shift: true }))
          break
      }
    }

    function onKeyUp(e: KeyboardEvent): void {
      switch (e.key) {
        case 'Shift':
            console.log('SHIFT UP')
          setKeyboardModifiers((prev) => ({ ...prev, Shift: false }))
          break
      }
    }

    window.addEventListener('keydown', onKeyDown as any)
    window.addEventListener('keyup', onKeyUp as any)

    return () => {
      window.removeEventListener('keydown', onKeyDown as any)
      window.removeEventListener('keyup', onKeyUp as any)
    }
  }, [])
  console.log('KBM', keyboardModifiers);
  return keyboardModifiers
}

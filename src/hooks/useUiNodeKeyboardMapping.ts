import { useKeyboard } from './useKeyboard'
import { useKeyboardModifiers } from './useKeyboardModifiers'
import type { GenericUiNode } from './useUiTree'

export function useUiNodeKeyboardMapping(node: GenericUiNode) {
  const keyboardModifiers = useKeyboardModifiers()
  useKeyboard(
    {
      Enter: {
        down: () => {
          if (keyboardModifiers.Shift) {
            const action = node.action()
            action.createEmptyChild()
            action.focusChild()
          } else {
            const action = node.action()
            action.createEmptySiblingAfter()
            action.focusSiblingAfter()
          }
        },
      },
      ArrowLeft: {
        down: () => node.action().focusParent(),
      },
      ArrowUp: {
        down: () => {
          const action = node.action()
          keyboardModifiers.Shift && action.createEmptySiblingBefore()
          action.focusSiblingBefore()
        },
      },
      ArrowDown: {
        down: () => node.action().focusSiblingAfter(),
      },
      ArrowRight: {
        down: () => node.action().focusChild(),
      },
    },
    !node.query().isFocused()
  )
}

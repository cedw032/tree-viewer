import { useRef } from 'react'
import type { KeyboardModifiers } from '../hooks/useKeyboardModifiers'
import { handleKeys } from '../handleKeys'
import type { NodeInterface } from '../hooks/useTree'

type NodeRProps = {
  node: NodeInterface
  context: {
    keyboardModifiers: KeyboardModifiers
  }
}

export function NodeR({
  node: {
    value,
    children,
    actions: { addChild, addSibling, setValue },
  },
  context: { keyboardModifiers },
}: NodeRProps) {
  console.log('KBM2', keyboardModifiers)

  const { handleKeyPress, handleKeyRelease } = handleKeys({
    Enter: {
      // @ts-ignore
      down: () => (keyboardModifiers.Shift ? addChild() : addSibling()),
    },
    ArrowLeft: {
      down: () => undefined /*shift && focusParent()*/,
    },
  })

  // @ts-ignore
  const textI: MutableRefObject<HTMLInputElement> = useRef()

  return (
    <div style={styles.row}>
      <div style={styles.nodeValue}>
        <input
          type="text"
          ref={textI}
          autoFocus={true}
          style={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onKeyUp={handleKeyRelease}
        />
      </div>
      <div style={styles.column}>
        {children.map((child, i) => (
          <NodeR key={i} node={child} context={{ keyboardModifiers }} />
        ))}
      </div>
    </div>
  )
}

type FlexDirection = 'row' | 'column'
const row: FlexDirection = 'row'
const column: FlexDirection = 'column'

const styles = {
  nodeValue: {
    borderWidth: 1,
    padding: 5,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  row: {
    display: 'flex',
    flexDirection: row,
  },
  column: {
    display: 'flex',
    flexDirection: column,
  },
}

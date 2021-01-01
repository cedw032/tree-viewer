import { useEffect, useRef } from 'react'
import type { UiNode } from '../hooks/useUiTree'
import type { NodeValue } from '../hooks/useTree'
import {useUiNodeKeyboardMapping} from '../hooks/useUiNodeKeyboardMapping'

type ExpandingNodeViewProps = {
  node: UiNode<NodeValue>
}

export function ExpandingNodeView({
  node,
}: ExpandingNodeViewProps) {
  // @ts-ignore
  const textI: MutableRefObject<HTMLInputElement> = useRef()

  useUiNodeKeyboardMapping(node)

  useEffect(() => {
    const {current} = textI
    node.query().isFocused() && current.focus()

    const ensureSelfFocused = () => {
      !node.query().isFocused() && node.action().focusSelf()
    }

    current.addEventListener('focus', ensureSelfFocused)

    return () =>
      current.removeEventListener('focus', ensureSelfFocused)
  }, [node, textI])

  const nodeStyles = node.query().isFocused()
    ? { ...styles.nodeValue, ...styles.currentNode }
    : styles.nodeValue

    console.log(`RENDER  ---  ${node.query().isFocused()} --- ${node.query().key()}`)
  return (

    <div style={styles.row}>
      <div style={nodeStyles}>
        <input
          type="text"
          ref={textI}
          autoFocus={true}
          style={styles.input}
          value={node.query().value()}
          onChange={(e) => node.action().updateValue(e.target.value)}
        />
      </div>
      <div style={styles.column}>
        {node.query().children().map((child) => (
          <ExpandingNodeView
            key={child.query().key()}
            node={child}
          />
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
  currentNode: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'green',
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

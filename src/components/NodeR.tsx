import { useEffect, useRef, useState } from 'react'
import type { KeyboardModifiers } from '../hooks/useKeyboardModifiers'
import { useKeyboard } from '../hooks/useKeyboard'
import type { NodeInterface, NodePath } from '../hooks/useTree'

type NodeRProps = {
  node: NodeInterface
  context: {
    keyboardModifiers: KeyboardModifiers
    currentPath: string
    actions: {
      setCurrentPathAsParent: () => void
      setCurrentPathAsPreviousSibling: () => void
      setCurrentPathAsNextSibling: () => void
      setCurrentPath: (path: NodePath) => void
      setLastCurrentChildOfParent: (path: NodePath) => void
    }
  }
}

export function NodeR({
  node: {
    path,
    value,
    children,
    actions: { addChild, addSiblingAfter, addSiblingBefore, setValue },
  },
  context: {
    keyboardModifiers,
    currentPath,
    actions: {
      setCurrentPath,
      setCurrentPathAsParent,
      setCurrentPathAsPreviousSibling,
      setCurrentPathAsNextSibling,
      setLastCurrentChildOfParent,
    },
  },
}: NodeRProps) {
  // @ts-ignore
  const textI: MutableRefObject<HTMLInputElement> = useRef()

  const isCurrentNode = currentPath === path

  const initialLastCurrentChild: NodePath | null = null
  const [lastCurrentChild, setLastCurrentChild] = useState(
    initialLastCurrentChild
  )

  useKeyboard(
    {
      Enter: {
        down: () => {
          if (keyboardModifiers.Shift) {
            const newPath = addChild()
            setCurrentPath(newPath)
            // @ts-ignore
            setLastCurrentChild(newPath)
          } else {
            const newPath = addSiblingAfter()
            setCurrentPath(newPath)
            setLastCurrentChildOfParent(newPath)
          }
        },
      },
      ArrowLeft: {
        down: setCurrentPathAsParent,
      },
      ArrowUp: {
        down: () => {
          if (keyboardModifiers.Shift) {
            const newPath = addSiblingBefore()
            setCurrentPath(newPath)
            setLastCurrentChildOfParent(newPath)
          } else {
            setCurrentPathAsPreviousSibling()
          }
        },
      },
      ArrowDown: {
        down: setCurrentPathAsNextSibling,
      },
      ArrowRight: {
        down: () => {
          if (lastCurrentChild !== null) {
            // @ts-ignore
            setCurrentPath(lastCurrentChild)
          } else if (children[0] !== undefined) {
            setCurrentPath(children[0].path)
            // @ts-ignore
            setLastCurrentChild(children[0].path)
          }
        },
      },
    },
    !isCurrentNode
  )

  useEffect(() => {
    isCurrentNode && textI.current.focus()

    textI.current.addEventListener('focus', () => {
      setCurrentPath(path)
    })

    return () =>
      textI.current.removeEventListener('focus', () => {
        setCurrentPath(path)
      })
  }, [isCurrentNode, textI])

  const nodeStyles = isCurrentNode
    ? { ...styles.nodeValue, ...styles.currentNode }
    : styles.nodeValue

  return (
    <div style={styles.row}>
      <div style={nodeStyles}>
        <input
          type="text"
          ref={textI}
          autoFocus={true}
          style={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div style={styles.column}>
        {children.map((child, i) => (
          <NodeR
            key={child.path}
            node={child}
            context={{
              keyboardModifiers,
              currentPath,
              actions: {
                setCurrentPath,
                setCurrentPathAsParent: () => {
                  setCurrentPath(path)
                },
                setCurrentPathAsPreviousSibling: () => {
                  const childPath =
                    children[(children.length + i - 1) % children.length].path
                  setCurrentPath(childPath)
                  // @ts-ignore
                  setLastCurrentChild(childPath)
                },
                setCurrentPathAsNextSibling: () => {
                  const childPath = children[(i + 1) % children.length].path
                  setCurrentPath(childPath)
                  // @ts-ignore
                  setLastCurrentChild(childPath)
                },
                // @ts-ignore
                setLastCurrentChildOfParent: setLastCurrentChild,
              },
            }}
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

import { useState } from 'react'
import { useTree } from './hooks/useTree'
import { useKeyboardModifiers } from './hooks/useKeyboardModifiers'
import { NodeR } from './components/NodeR'
import type { NodePath } from './hooks/useTree'

export default function App() {
  const keyboardModifiers = useKeyboardModifiers()
  const nodes = useTree()
  const [currentPath, setCurrentPath] = useState(nodes[0].path)

  let initialLastCurrentChild: NodePath | null = null
  const [, setLastCurrentChild] = useState(initialLastCurrentChild)

  return (
    <div style={styles.container}>
      {nodes.map((node, i) => (
        <NodeR
          key={node.path}
          node={node}
          context={{
            keyboardModifiers,
            currentPath,
            actions: {
              setCurrentPath,
              setCurrentPathAsParent: () => {},
              setCurrentPathAsPreviousSibling: () => {
                setCurrentPath(
                  nodes[(nodes.length + i - 1) % nodes.length].path
                )
              },
              setCurrentPathAsNextSibling: () => {
                setCurrentPath(nodes[(i + 1) % nodes.length].path)
              },
              // @ts-ignore
              setLastCurrentChildOfParent: setLastCurrentChild,
            },
          }}
        />
      ))}
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

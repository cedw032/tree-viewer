import React from 'react'
import { useTree } from './hooks/useTree'
import { useKeyboardModifiers } from './hooks/useKeyboardModifiers'
import {NodeR} from './components/NodeR'

export default function App() {
  const keyboardModifiers = useKeyboardModifiers()
  const nodes = useTree()

  return (
    <div style={styles.container}>
      {nodes.map((node, i) => (
        <NodeR key={i} node={node} context={{ keyboardModifiers }} />
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

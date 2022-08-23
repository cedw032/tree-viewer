import { useState } from 'react'
import { useInitialTreeData } from './hooks/useTree'
import { useUiTree } from './hooks/useUiTree'
import { ExpandingNodeView } from './components/ExpandingNodeView'

export default function App() {
  const [, setLastUpdated] = useState(performance.now())
  function updateNotifier() {
    setLastUpdated(performance.now())
  }

  const { nodes } = useUiTree(updateNotifier, useInitialTreeData())

  return (
    <div style={styles.container}>
      {nodes.map((node) => (
        <ExpandingNodeView
          key={node.query().key()}
          node={node}
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

import { StatusBar } from 'expo-status-bar'
import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

export default function App() {
  const [roots, setRoots] = useState([emptyNode()])

  function addRoot() {
    setRoots([...roots, emptyNode()])
  }

  const setRoot = (i: number) => (root: Node) => {
    const newRoots = [...roots]
    newRoots[i] = root
    setRoots(newRoots)
  }

  const {Shift} = useKeyboardModifiers()

  return (
    <View
      style={styles.container}
    >
      {roots.map((root, i) => (
        <NodeR
          key={i}
          node={root}
          setNode={setRoot(i)}
          addSibling={addRoot}
          focusParent={() => {}}
          shift={Shift}
        />
      ))}

      <StatusBar style="auto" />
    </View>
  )
}

type Node = {
  value: string
  children: Node[]
}

type NodeRProps = {
  node: Node
  setNode: (node: Node) => void
  addSibling: () => void
  focusParent: () => void
  shift: boolean
}

function emptyNode(): Node {
  return { value: '', children: [] }
}

function NodeR({
  node: { children, value },
  setNode,
  addSibling,
  focusParent,
  shift,
}: NodeRProps) {
  function addChild() {
    setNode({ value, children: [...children, emptyNode()] })
  }

  const setChild = (i: number) => (child: Node) => {
    const newChildren = [...children]
    newChildren[i] = child
    setNode({ value, children: newChildren })
  }

  const { handleKeyPress, handleKeyRelease } = handleKeys({
    Enter: {
      down: () => (shift ? addChild() : addSibling()),
    },
    ArrowLeft: {
      down: () => shift && focusParent(),
    },
  })

  const textI = useRef()

  return (
    <View style={styles.row}>
      <TextInput
        ref={textI}
        autoFocus={true}
        style={styles.input}
        value={value}
        onChange={(e) => setNode({ children, value: e.target.value })}
        onKeyPress={handleKeyPress as any}
        onKeyRelease={handleKeyRelease as any}
      />
      <View style={styles.column}>
        {children.map((child, i) => (
          <NodeR
            key={i}
            node={child}
            setNode={setChild(i)}
            addSibling={addChild}
            focusParent={() => textI.current.focus()}
          />
        ))}
      </View>
    </View>
  )
}

type KeyboardEvent = {
  key: KeyName
}

type KeyName = 'Enter' | 'Shift' | 'ArrowLeft'
type KeyMap = {
  [k in KeyName]?: {
    up?: () => void
    down?: () => void
  }
}

const handleKeys = (keymap: KeyMap) => ({
  handleKeyPress: (k: KeyboardEvent) => {
    console.log('DOWN', k.key)
    const down = keymap[k.key]?.down || (() => {})
    down()
  },
  handleKeyRelease: (k: KeyboardEvent) => {
    console.log('UP', k.key)
    const up = keymap[k.key]?.down || (() => {})
    up()
  },
})

type KeyboardModfiers = {
  Shift: boolean
}

function useKeyboardModifiers(): KeyboardModfiers {
  const [keyboardModifiers, setKeyboardModifiers] = useState({ Shift: false })
  useEffect(() => {
    const onKeyDown = (_: any, e: KeyboardEvent) => {
      console.log('DOWN');
      switch (e.key) {
        case 'Shift':
          setKeyboardModifiers({ ...keyboardModifiers, Shift: true })
      }
    }

    const onKeyUp = (_:any, e: KeyboardEvent) => {
      switch (e.key) {
        case 'Shift':
          setKeyboardModifiers({ ...keyboardModifiers, Shift: false })
      }
    }

    console.log('ADDING DOWN');
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  })
  return keyboardModifiers
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderStyle: 'solid',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
})

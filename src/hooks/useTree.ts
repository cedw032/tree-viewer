import { useState } from 'react'

import type { Guid } from '../guid'
import { guid } from '../guid'

type NodeId = Guid & { readonly __NodeId: unique symbol }

type NodeShape = {
  children: NodeId[]
  value: string
}

type Node = NodeShape & {
  id: NodeId
  readonly __Node: unique symbol
}

function nodeId(): NodeId {
  return guid() as NodeId
}

export type NodeInterface = {
  value: string
  children: NodeInterface[]
  actions: {
    addChild: () => void
    addSibling: () => void
    setValue: (s: string) => void
  }
}

type Lookup<T, U extends string> = {
  [key in U]: T
}

export function useTree(): NodeInterface[] {
  const initialRootId = nodeId()
  const initialChildId = nodeId()
  const initialLookup: Lookup<Node, NodeId> = {
    [initialRootId]: {
      value: '',
      children: [initialChildId],
      id: initialRootId,
    },
    [initialChildId]: { ...emptyNode(), id: initialChildId },
  }

  const [rootId] = useState(initialRootId)
  const [lookup, setLookup] = useState(initialLookup)

  function viewNode(id: NodeId): Node {
    // @ts-ignore
    const n = lookup[id]
    return { ...n } as Node
  }

  function emptyNode(): NodeShape {
    return { children: [], value: '' }
  }

  function addNode(n: NodeShape): NodeId {
    const node = { ...n, id: nodeId() } as Node
    setNode(node)
    return node.id
  }

  function setNode(n: Node) {
    setLookup((prevLookup: Lookup<Node, NodeId>) => ({
      ...prevLookup,
      [n.id]: n,
    }))
  }

  function setChildren(n: Node, children: NodeId[]) {
    setNode({
      ...n,
      children,
    })
  }

  const addChildAfter = (pId: NodeId, eId: NodeId | null) => () => {
    const p = viewNode(pId)

    const newIndex = eId === null ? 0 : p.children.indexOf(eId) + 1
    const newNodeId = addNode(emptyNode())

    setChildren(p, [
      ...p.children.slice(0, newIndex),
      newNodeId,
      ...p.children.slice(newIndex, p.children.length),
    ])
  }

  const setValue = (id: NodeId) => (value: string) => {
    const n = viewNode(id)
    setNode({ ...n, value })
  }

  function lastChild({ children }: Node): NodeId | null {
    return children[children.length - 1] || null
  }

  function buildNodeInterface(id: string, parent: string): NodeInterface {
    // @ts-ignore
    const node: Node = viewNode(id)
    return {
      value: node.value,
      children: node.children.map((child) => buildNodeInterface(child, id)),
      actions: {
        addSibling:
          // @ts-ignore
          addChildAfter(parent, id),

        addChild:
          // @ts-ignore
          addChildAfter(id, lastChild(node)),
        // @ts-ignore
        setValue: setValue(id),
      },
    }
  }

  return viewNode(rootId).children.map((child) =>
    buildNodeInterface(child, rootId)
  )
}

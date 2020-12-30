import { useState } from 'react'

import type { Guid } from '../guid'
import { guid } from '../guid'

type NodeId = Guid & { readonly __NodeId: unique symbol }
export type NodePath = string & { readonly __NodePath: unique symbol }

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
  path: NodePath
  value: string
  children: NodeInterface[]
  actions: {
    addChild: () => NodePath
    addSiblingBefore: () => NodePath
    addSiblingAfter: () => NodePath
    setValue: (s: string) => void
  }
}

type Lookup<T, U extends string> = {
  [key in U]: T
}

type NodeChildIndex = number & { readonly __NodeChildIndex: unique symbol }

export function isNodeChildIndex(n: NodeInterface) {
  return function (i: number): i is NodeChildIndex {
    return i < n.children.length
  }
}

export function firstNodeChildIndex() {
  return 0 as NodeChildIndex
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

  function createNode(n: NodeShape): NodeId {
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

  function appendChildAt(pId: NodeId, id: NodeId, index: NodeChildIndex) {
    const p = viewNode(pId)

    setChildren(p, [
      ...p.children.slice(0, index),
      id,
      ...p.children.slice(index, p.children.length),
    ])
  }

  const setValue = (id: NodeId) => (value: string) => {
    const n = viewNode(id)
    setNode({ ...n, value })
  }

  function buildNodeInterface(
    id: NodeId,
    parent: NodeId,
    index: number,
    parentPath: NodePath
  ): NodeInterface {
    // @ts-ignore
    const node: Node = viewNode(id)
    const path = appendPath(id, parentPath)
    return {
      path,
      value: node.value,
      children: node.children.map((child, i) =>
        buildNodeInterface(child, id, i, path)
      ),
      actions: {
        addSiblingAfter: () => {
          const siblingId = createNode(emptyNode())
          appendChildAt(parent, siblingId, (index + 1) as NodeChildIndex)
          return appendPath(siblingId, parentPath)
        },

        addSiblingBefore: () => {
          const siblingId = createNode(emptyNode())
          appendChildAt(parent, siblingId, index as NodeChildIndex)
          return appendPath(siblingId, parentPath)
        },

        addChild: () => {
          const childId = createNode(emptyNode())
          appendChildAt(id, childId, node.children.length as NodeChildIndex)
          return appendPath(childId, path)
        },

        setValue: setValue(id),
      },
    }
  }

  const root = viewNode(rootId)
  return root.children.map((child, i) =>
    buildNodeInterface(child, rootId, i, appendPath(rootId, null))
  )
}

function appendPath(n: NodeId, p: NodePath | null): NodePath {
  // @ts-ignore
  return p === null ? n : `${n}.${p}`
}

import { useRef } from 'react'
import type {Lookup, LookupData} from './useLookup'
import { useLookup } from './useLookup'
import type { Guid } from '../guid'
import { guid } from '../guid'

export type NodeId = Guid & { readonly __NodeId: unique symbol }
export type NodeValue = string

export type TreeData = {
    root: NodeId
    lookup: NodeLookupData
}

type NodeLookup = Lookup<NodeId, Node>
type NodeLookupData = LookupData<NodeId, Node>



type AvailableNodeIndex = number & {
  readonly __AvailableNodeIndex: unique symbol
}
type NodeIndex = AvailableNodeIndex & { readonly __NodeIndex: unique symbol }

type NodeShape = {
  children: NodeId[]
  value: NodeValue
}

type Node = NodeShape & {
  readonly __Node: unique symbol
}

type NodeUpdateActionSet = {
  createEmpty: () => NodeId
  appendChild: (p: NodeId, c: NodeId, index: AvailableNodeIndex) => void
  setValue: (n: NodeId, v: NodeValue) => void
  removeChild: (p: NodeId, c: NodeId) => void
}

type NodeQuerySet = {
  children: (n: NodeId) => NodeId[]
  value: (n: NodeId) => NodeValue
  index: (p: NodeId, c: NodeId) => NodeIndex
  nextAvailableIndex: (p: NodeId, c: NodeId) => AvailableNodeIndex
  nextIndexWrapped: (p: NodeId, c: NodeId) => NodeIndex
  previousIndexWrapped: (p: NodeId, c: NodeId) => NodeIndex
  childCount: (n: NodeId) => AvailableNodeIndex
}

function nodeId(): NodeId {
  return guid() as NodeId
}

function emptyNode(): NodeShape {
  return { children: [], value: '' }
}

function createEmpty(s: NodeLookup): NodeId {
  const id = nodeId()
  s.assign(id, emptyNode() as Node)
  console.log(`creating empty!! ${id} ===== ${Object.keys({...s})}`)
  return id
}

export function useInitialTreeData(): TreeData {
  const lookup = useLookup({} as NodeLookupData)
  const root = createEmpty(lookup)
  const child = createEmpty(lookup)
  appendChild(lookup, root, child, 0 as AvailableNodeIndex)
  return {
    root,
    lookup: lookup.asData(),
  }
}

export type Tree = {
  root: NodeId
  action: () => NodeUpdateActionSet
  query: () => NodeQuerySet
}

function appendChild(
  l: NodeLookup,
  p: NodeId,
  c: NodeId,
  i: AvailableNodeIndex
) {
    l.access(p).children.splice(i, 0, c)
}

function removeChild(l: NodeLookup, p: NodeId, c: NodeId): void {
  const children = l.access(p).children
  children.splice(children.indexOf(c), 1)
}

function setValue(l: NodeLookup, n: NodeId, v: NodeValue): void {
    l.access(n).value = v
}

// function gather(l: NodeLookup, r: NodeId): NodeId[] {
//   // @ts-ignore
//   const deep = l[r].children.map((c) => gather(l, c))
//   const flattened = [r].concat(...deep)
//   return flattened
// }

// function prune(l: NodeLookup, r: NodeId): void {
//   const inUse = gather(l, r)
//   // @ts-ignore
//   const orphaned = Object.keys(l).filter((k) => inUse.indexOf(l[k]) === -1)
//   // @ts-ignore
//   orphaned.forEach((o) => delete l[o])
// }

export function useTree(updateNotifier: () => void, initial: TreeData): Tree {
  const {
    current: { lookup: lookupData, root },
  } = useRef(initial)

  const lookup = useLookup(lookupData)

  const {current: t} = useRef({
    root,
    action: (): NodeUpdateActionSet => {
      updateNotifier()
      return {
        createEmpty: () => createEmpty(lookup),
        appendChild: (p, c, i) => appendChild(lookup, p, c, i),
        setValue: (n, v) => setValue(lookup, n, v),
        removeChild: (p, c) => removeChild(lookup, p, c),
      }
    },
    query: (): NodeQuerySet => ({
      children: (id) => [
          ...lookup.access(id).children
      ],
      value: (id) =>
        lookup.access(id).value,
      index: (p, c) =>
        lookup.access(p).children.indexOf(c) as NodeIndex,
      nextAvailableIndex: (p, c) =>
        (lookup.access(p).children.indexOf(c) + 1) as AvailableNodeIndex,
      nextIndexWrapped: (p, c) => {
        const children = lookup.access(p).children
        const index = (children.indexOf(c) + 1) % children.length
        return index as NodeIndex
      },
      previousIndexWrapped: (p, c) => {
        const children = lookup.access(p).children
        const index =
          (children.length + children.indexOf(c) - 1) % children.length
        return index as NodeIndex
      },
      childCount: (n) =>
        lookup.access(n).children.length as AvailableNodeIndex,
    }),
  })

  return t
}

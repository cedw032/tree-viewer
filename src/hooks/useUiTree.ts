import { useState } from 'react'
import type { Tree, NodeId, NodeValue, TreeData } from './useTree'
import { useTree } from './useTree'
import type { Lookup, LookupData } from './useLookup'
import { useLookup } from './useLookup'

type UiTree = {
  nodes: UiNode<NodeValue>[]
}

type UiNodeStateLookupData = LookupData<NodePath, UiNodeState>
type UiNodeStateLookup = Lookup<NodePath, UiNodeState>
type UiNodeState = {
  lastFocusedChild: NodePath | undefined
  parent: NodePath
  path: NodePath
  dirty: boolean
}

export type NodePath = string & { readonly __NodePath: unique symbol }
export type GenericUiNode = UiNode<NodeValue>

type UiNodeQuerySet<V> = {
  isFocused: () => boolean
  children: () => UiNode<NodeValue>[]
  key: () => string
  value: () => V
}
type UiNodeActionSet<V> = {
  updateValue: (v: V) => UiNodeActionSet<V>
  createEmptySiblingBefore: () => UiNodeActionSet<V>
  createEmptySiblingAfter: () => UiNodeActionSet<V>
  createEmptyChild: () => UiNodeActionSet<V>
  focusParent: () => UiNodeActionSet<V>
  focusChild: () => UiNodeActionSet<V>
  focusSiblingBefore: () => UiNodeActionSet<V>
  focusSiblingAfter: () => UiNodeActionSet<V>
  focusSelf: () => UiNodeActionSet<V>
}
type UiNodeLookupData = LookupData<NodePath, UiNode<NodeValue>>
type UiNodeLookup = Lookup<NodePath, UiNode<NodeValue>>
export type UiNode<V extends NodeValue> = {
  query: () => UiNodeQuerySet<V>
  action: () => UiNodeActionSet<V>
}

function setLastFocusedChildOnParent(
  s: UiNodeStateLookup,
  p: NodePath,
  c: NodePath
) {
  const pState = s.access(p)
  if (pState) {
    pState.lastFocusedChild = c
    const grandParent = s.access(p).parent
    setLastFocusedChildOnParent(s, grandParent, p)
  }
}

export function useUiTree(
  updateNotifier: () => void,
  initial: TreeData
): UiTree {
  const t = useTree(updateNotifier, initial)
  const path = rootPath(t.root)
  const cPath = childPath(t.query().children(t.root)[0], path)
  const [focus, setFocus] = useState(cPath)

  const uiState = useLookup({} as UiNodeStateLookupData)
  const uiNodeLookup = useLookup({} as UiNodeLookupData)

  console.log(
    `UI NODE LOOKUP {${Object.keys(uiNodeLookup.asData())}}, {${path}}`
  )

  const uiTree = {
    nodes: t
      .query()
      .children(t.root)
      .map((n) =>
        uiNode(t, n, t.root, path, (i)=>{console.log('Set focus called'); setFocus(i)}, focus, uiState, uiNodeLookup)
      ),
  }

  return uiTree
}

function markDirtyToRoot(uiState: UiNodeStateLookup, n: NodePath) {
  console.log(`MARKING DIRTY {${Object.keys(uiState.asData())}}, {${n}}`)
  const ns = uiState.access(n)
  if (ns) {
    ns.dirty = true
    markDirtyToRoot(uiState, ns.parent)
  }
}

function uiNode<V extends NodeValue>(
  t: Tree,
  n: NodeId,
  pId: NodeId,
  pPath: NodePath,
  setFocus: (n: NodePath) => void,
  focus: NodePath,
  uiState: UiNodeStateLookup,
  uiNodeLookup: UiNodeLookup
): UiNode<V> {
  const path = childPath(n, pPath)
  uiState.access(path) === undefined &&
    uiState.assign(path, {
      path,
      parent: pPath,
      lastFocusedChild: undefined,
      dirty: false,
    })

  const ns = uiState.access(path)

  const requiresBuild =
    uiNodeLookup.access(path) === undefined || uiState.access(path).dirty

    console.log(`REQUIRES REBUILD  --- ${path} --- ${requiresBuild}`);

  requiresBuild &&
    uiNodeLookup.assign(path, {
      query: () => ({
        isFocused: () => path === focus,
        value: () => t.query().value(n) as V,
        children: () =>
          t
            .query()
            .children(n)
            .map((c) =>
              uiNode(t, c, n, path, setFocus, focus, uiState, uiNodeLookup)
            ),
        key: () => path,
      }),
      action: () => {
        markDirtyToRoot(uiState, path)
        const actions = {
          updateValue: (v: NodeValue) => {
            t.action().setValue(n, v)
            return actions
          },
          createEmptySiblingBefore: () => {
            const newNode = t.action().createEmpty()
            const newIndex = t.query().index(pId, n)
            t.action().appendChild(pId, newNode, newIndex)
            return actions
          },
          createEmptySiblingAfter: () => {
            const newNode = t.action().createEmpty()
            const newIndex = t.query().nextAvailableIndex(pId, n)
            t.action().appendChild(pId, newNode, newIndex)
            return actions
          },
          createEmptyChild: () => {
            const newNode = t.action().createEmpty()
            t.action().appendChild(n, newNode, t.query().childCount(n))
            return actions
          },
          focusParent: () => {
            setFocus(pPath)
            return actions
          },
          focusChild: () => {
            if (ns.lastFocusedChild === undefined) {
              const children = t.query().children(n)
              if (children.length !== 0) {
                ns.lastFocusedChild = childPath(children[0], path)
              }
            }
            ns.lastFocusedChild && setFocus(ns.lastFocusedChild)
            return actions
          },
          focusSiblingBefore: () => {
            const siblingIndex = t.query().nextIndexWrapped(pId, n)
            const siblingPath = childPath(
              t.query().children(pId)[siblingIndex],
              pPath
            )
            setLastFocusedChildOnParent(uiState, pPath, siblingPath)
            setFocus(siblingPath)
            return actions
          },
          focusSiblingAfter: () => {
            const siblingIndex = t.query().nextIndexWrapped(pId, n)
            const siblingPath = childPath(
              t.query().children(pId)[siblingIndex],
              pPath
            )
            setLastFocusedChildOnParent(uiState, pPath, siblingPath)
            setFocus(siblingPath)
            return actions
          },
          focusSelf: () => {
            setLastFocusedChildOnParent(uiState, pPath, path)
            setFocus(path)
            return actions
          },
        }

        return actions
      },
    })

  ns.dirty = false

  return (uiNodeLookup.access(path) as unknown) as UiNode<V>
}

function rootPath(root: NodeId): NodePath {
  return `${root}` as NodePath
}

function childPath(n: NodeId, p: NodePath): NodePath {
  return `${n}.${p}` as NodePath
}

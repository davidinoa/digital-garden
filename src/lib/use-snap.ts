import { useRef, type RefObject } from 'react'
import {
  type BoundingBox,
  type DragElastic,
  type DragHandlers,
  type MotionProps,
  type SpringOptions,
} from 'framer-motion'

export type Point = {
  x?: number
  y?: number
}

export type SnapPointsType =
  | {
      type: 'absolute'
      points: Point[]
    }
  | {
      type: 'constraints-box'
      unit: 'pixel' | 'percent'
      points: Point[]
    }
  | {
      type: 'relative-to-initial'
      points: Point[]
    }

export type SnapOptions = {
  direction: 'x' | 'y' | 'both'
  ref: RefObject<HTMLElement>
  snapPoints: SnapPointsType
  springOptions?: Omit<SpringOptions, 'velocity'>
  constraints?: Partial<BoundingBox> | RefObject<Element>
  dragElastic?: DragElastic
  onDragStart?: MotionProps['onDragStart']
  onDragEnd?: MotionProps['onDragEnd']
  onMeasureDragConstraints?: MotionProps['onMeasureDragConstraints']
}

export type UseSnapResult = {
  dragProps: Pick<
    MotionProps,
    | 'drag'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onMeasureDragConstraints'
    | 'dragMomentum'
  > &
    Partial<Pick<MotionProps, 'dragConstraints'>>
  snapTo: (index: number) => void
  currentSnapPointIndex: number | null
}

function minMax(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max)
}

export function useSnap({
  direction,
  snapPoints,
  ref,
  constraints,
  dragElastic,
  onDragStart,
  onDragEnd,
  onMeasureDragConstraints,
  springOptions = {},
}: SnapOptions): UseSnapResult {
  const constraintsBoxRef = useRef<BoundingBox | null>(null)

  function getTransformMatrix() {
    if (!ref.current) throw new Error('Element ref is empty')
    const style = window.getComputedStyle(ref.current)
    return new DOMMatrixReadOnly(style.transform)
  }

  function getBaseCoordinates() {
    if (!ref.current) throw new Error('Element ref is empty')
    const elementBox = ref.current.getBoundingClientRect()
    const transformMatrix = getTransformMatrix()
    const baseX = window.scrollX + elementBox.x - transformMatrix.e
    const baseY = window.scrollY + elementBox.y - transformMatrix.f
    return { baseX, baseY }
  }

  function resolveConstraints() {
    if (!constraints) return null
    if (!ref.current) throw new Error('Element ref is empty')

    const box =
      'current' in constraints ? constraintsBoxRef.current : constraints
    if (!box) throw new Error('Constraints were not measured')

    const { baseX, baseY } = getBaseCoordinates()
    const left = box.left ? baseX + box.left : undefined
    const right = box.right ? baseX + box.right : undefined
    const top = box.top ? baseY + box.top : undefined
    const bottom = box.bottom ? baseY + box.bottom : undefined
    const width = left && right ? right - left : undefined
    const height = top && bottom ? bottom - top : undefined

    return {
      left,
      top,
      right,
      bottom,
      width,
      height,
    }
  }

  function convertSnapPoints(snapPoints: SnapPointsType) {
    if (!ref.current) return null

    if (snapPoints.type === 'absolute') return snapPoints.points

    if (snapPoints.type === 'relative-to-initial') {
      const { baseX, baseY } = getBaseCoordinates()
      return snapPoints.points.map((point) => ({
        x: point.x ? baseX + point.x : undefined,
        y: point.y ? baseY + point.y : undefined,
      }))
    }

    if (snapPoints.type === 'constraints-box') {
      if (!constraints)
        throw new Error(
          'When using constraints-box, you must provide a "constraints" prop'
        )
      const box = resolveConstraints()
      if (!box) throw new Error('Constraints were not measured')
      if (['x', 'both'].includes(direction) && (!box.left || !box.right)) {
        throw new Error(
          'Constraints should describe both sides for each drag direction'
        )
      }
      if (['y', 'both'].includes(direction) && (!box.top || !box.bottom)) {
        throw new Error(
          'Constraints should describe both sides for each drag direction'
        )
      }
      return snapPoints.points.map((point) => {
        const result: Point = {}
        if (point.x) {
          if (!box.left || !box.width) throw new Error()
          if (snapPoints.unit === 'pixel') {
            result.x = box.left + point.x
          } else {
            result.x = box.left + box.width * point.x
          }
        }
        if (point.y) {
          if (!box.top || !box.height) throw new Error()
          if (snapPoints.unit === 'pixel') {
            result.y = box.top + point.y
          } else {
            result.y = box.top + box.height * point.y
          }
        }
        return result
      })
    }

    throw new Error('Invalid snapPoints type')
  }

  const onDragEndHandler: DragHandlers['onDragEnd'] = (event, info) => {
    onDragEnd?.(event, info)

    if (!ref.current) throw new Error('Element ref is empty')

    const points = convertSnapPoints(snapPoints)
    if (!points) return
    console.log('Converted points', points)

    const elementBox = ref.current.getBoundingClientRect()
    const transformMatrix = getTransformMatrix()
    const translate = { x: transformMatrix.e, y: transformMatrix.f }
    const base = {
      x: window.scrollX + elementBox.x - translate.x,
      y: window.scrollY + elementBox.y - translate.y,
    }

    const dropCoordinates = {
      x: window.scrollX + elementBox.x,
      y: window.scrollY + elementBox.y,
    }

    const distances = points.map((point) => {
      if (point.x && point.y) {
        return Math.sqrt(
          Math.pow(point.x - dropCoordinates.x, 2) +
            Math.pow(point.y - dropCoordinates.y, 2)
        )
      }
    })
  }

  const dragProps: Partial<MotionProps> = {
    drag: direction === 'both' ? true : direction,
    onDragEnd: onDragEndHandler,
    onMeasureDragConstraints(constraints) {
      constraintsBoxRef.current = constraints
      onMeasureDragConstraints?.(constraints)
    },
    dragMomentum: false,
    dragConstraints: constraints,
  }

  // TODO: fix types
  return dragProps as UseSnapResult
}

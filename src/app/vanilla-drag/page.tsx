'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './styles.css'

export default function VanillaDrag() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    setWidth(containerRef.current?.getBoundingClientRect().width ?? 0)
    setHeight(containerRef.current?.getBoundingClientRect().height ?? 0)
  }, [])

  const handleWidth = 100
  const handleHeight = 40

  const snapPoints = {
    type: 'constraints-box',
    unit: 'px',
    points: [
      { x: 0.1, y: 0.1 },
      { x: 0.3, y: 0.2 },
      { y: 0.5 },
      { x: 0.75 },
      { x: 0.9, y: 0.9 },
      { x: 1, y: 1 },
    ],
  }

  return (
    <motion.div className="SnappingExample" ref={containerRef}>
      {snapPoints.points.map((point, index) => (
        <div
          key={index}
          className="snappoint"
          style={{
            top:
              point.y === undefined ? '0' : (height - handleHeight) * point.y,
            bottom: point.y === undefined ? '0' : undefined,
            left: point.x === undefined ? '0' : (width - handleWidth) * point.x,
            right: point.x === undefined ? '0' : undefined,
            width:
              point.x === undefined ? undefined : point.y === undefined ? 4 : 8,
            height:
              point.y === undefined ? undefined : point.x === undefined ? 4 : 8,
          }}
        />
      ))}
      <motion.button
        drag
        className="drag-handle"
        dragConstraints={containerRef}
        style={{
          width: handleWidth,
          height: handleHeight,
        }}
      >
        Drag me!
      </motion.button>
    </motion.div>
  )
}

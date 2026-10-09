import React, { useRef, useState, useCallback, useMemo } from 'react'
import {
  type StatItem,
  MIN_VALUE,
  MAX_VALUE,
  MIN_CHART_SIZE,
  DEFAULT_CHART_SIZE,
} from '../types'

export interface RadarChartProps {
  stats: StatItem[]
  onValueChange: (index: number, newValue: number) => void
  onSelectStat?: (index: number) => void
  selectedStatIndex?: number | null
  size?: number
}

export const RadarChart: React.FC<RadarChartProps> = ({
  stats,
  onValueChange,
  onSelectStat,
  selectedStatIndex,
  size
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const effectiveSize = Math.max(
    MIN_CHART_SIZE,
    size ?? DEFAULT_CHART_SIZE
  )
  const chartWidth = effectiveSize
  const chartHeight = effectiveSize

  const cx = chartWidth / 2
  const cy = chartHeight / 2
  const maxRadius = Math.min(chartWidth, chartHeight) * 0.36 // 36% of dimension
  const n = stats.length

  // Calculate angle for axis i (start at top: -PI/2)
  const getAngle = useCallback(
    (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n,
    [n]
  )

  // Points for grid polygon at a specific value level (1 to 10)
  const getGridPolygonPoints = useCallback(
    (level: number) => {
      const r = (level / MAX_VALUE) * maxRadius
      return Array.from({ length: n })
        .map((_, i) => {
          const angle = getAngle(i)
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return `${x.toFixed(2)},${y.toFixed(2)}`
        })
        .join(' ')
    },
    [cx, cy, getAngle, maxRadius, n]
  )

  // Current vertex positions for data polygon
  const vertexPoints = useMemo(() => {
    return stats.map((stat, i) => {
      const angle = getAngle(i)
      const r = (stat.value / MAX_VALUE) * maxRadius
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      return { x, y, angle, stat, index: i }
    })
  }, [cx, cy, getAngle, maxRadius, stats])

  // Data polygon points string
  const polygonPointsString = useMemo(() => {
    return vertexPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  }, [vertexPoints])

  // Max radius points (axis ends)
  const axisEndPoints = useMemo(() => {
    return Array.from({ length: n }).map((_, i) => {
      const angle = getAngle(i)
      const x = cx + maxRadius * Math.cos(angle)
      const y = cy + maxRadius * Math.sin(angle)
      return { x, y, angle }
    })
  }, [cx, cy, getAngle, maxRadius, n])

  // Handle pointer drag logic
  const handlePointerDown = (index: number, e: React.PointerEvent<SVGCircleElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDraggingIndex(index)
    onSelectStat?.(index)
  }

  const handlePointerMove = (index: number, e: React.PointerEvent<SVGCircleElement>) => {
    if (draggingIndex !== index || !svgRef.current) return

    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgP = pt.matrixTransform(ctm.inverse())
    const dx = svgP.x - cx
    const dy = svgP.y - cy

    const angle = getAngle(index)
    const ux = Math.cos(angle)
    const uy = Math.sin(angle)

    // Project mouse vector onto the axis unit vector
    const projection = dx * ux + dy * uy

    // Convert projection to value scale (1 to 10)
    const rawVal = (projection / maxRadius) * MAX_VALUE
    const snapped = Math.round(rawVal)
    const clamped = Math.max(MIN_VALUE, Math.min(MAX_VALUE, snapped))

    if (clamped !== stats[index].value) {
      onValueChange(index, clamped)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // Ignore if capture was already released
    }
    setDraggingIndex(null)
  }

  // Label position helper
  const getLabelInfo = (index: number) => {
    const angle = getAngle(index)
    const labelDistance = maxRadius + 32
    const x = cx + labelDistance * Math.cos(angle)
    const y = cy + labelDistance * Math.sin(angle)

    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    let textAnchor: 'middle' | 'start' | 'end' = 'middle'
    if (cos > 0.2) textAnchor = 'start'
    else if (cos < -0.2) textAnchor = 'end'

    let dy = 4
    if (sin < -0.8) dy = -6
    else if (sin > 0.8) dy = 14

    return { x, y, textAnchor, dy }
  }

  const gridLevels = [2, 4, 6, 8, 10]
  const subLevels = [1, 3, 5, 7, 9]

  return (
    <div className="radar-chart__wrapper">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="radar-chart__svg"
        style={{ maxWidth: `${chartWidth}px` }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={maxRadius + 12}
          className="radar-chart__bg-circle"
        />

        {subLevels.map((lvl) => (
          <polygon
            key={`sub-${lvl}`}
            points={getGridPolygonPoints(lvl)}
            className="radar-chart__grid-sub"
          />
        ))}

        {gridLevels.map((lvl) => (
          <g key={`grid-${lvl}`}>
            <polygon
              points={getGridPolygonPoints(lvl)}
              className={`radar-chart__grid-primary ${lvl === 10 ? 'radar-chart__grid-primary--outer' : ''
                }`}
            />

            <text
              x={cx + 6}
              y={cy - (lvl / MAX_VALUE) * maxRadius + 3}
              className="radar-chart__level-number"
            >
              {lvl}
            </text>
          </g>
        ))}

        {axisEndPoints.map((end, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            className={`radar-chart__spoke ${selectedStatIndex === i ? 'radar-chart__spoke--selected' : ''
              }`}
          />
        ))}

        <circle cx={cx} cy={cy} r="3" className="radar-chart__center-dot" />

        <polygon
          points={polygonPointsString}
          className="radar-chart__polygon"
        />

        {/* Draggable Vertex Handles */}
        {vertexPoints.map((pt, i) => {
          const isDragging = draggingIndex === i
          const isHovered = hoveredIndex === i
          const isSelected = selectedStatIndex === i

          return (
            <g key={`vertex-${pt.stat.id}`} className="radar-chart__handle">
              {/* Outer halo ring on hover, drag, or select */}
              {(isDragging || isHovered || isSelected) && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isDragging ? 15 : 12}
                  className={`radar-chart__handle-halo ${isDragging ? 'radar-chart__handle-halo--dragging' : ''
                    }`}
                />
              )}

              {/* Main Visible Handle Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isDragging ? 7.5 : 6}
                className="radar-chart__handle-dot"
              />

              {/* Center Pip */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isDragging ? 2.5 : 2}
                className="radar-chart__handle-pip"
              />

              {/* Hit target for touch and pointer grab */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="20"
                className="radar-chart__handle-hitarea"
                onPointerDown={(e) => handlePointerDown(i, e)}
                onPointerMove={(e) => handlePointerMove(i, e)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerEnter={() => setHoveredIndex(i)}
                onPointerLeave={() => setHoveredIndex(null)}
              />

              {/* Floating Tooltip Value Badge */}
              {(isDragging || isHovered) && (
                <g pointerEvents="none">
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 30}
                    width="44"
                    height="20"
                    rx="5"
                    className="radar-chart__handle-tooltip-box"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 19}
                    className="radar-chart__handle-tooltip-text"
                  >
                    {pt.stat.value}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Labels at the polygon perimeter */}
        {stats.map((stat, i) => {
          const { x, y, textAnchor, dy } = getLabelInfo(i)
          const isSelected = selectedStatIndex === i
          const isHovered = hoveredIndex === i || draggingIndex === i

          return (
            <g
              key={`label-${stat.id}`}
              onClick={() => onSelectStat?.(i)}
            >
              <text
                x={x}
                y={y}
                dy={dy}
                textAnchor={textAnchor}
                className={`radar-chart__label ${isSelected || isHovered ? 'radar-chart__label--active' : ''
                  }`}
              >
                {stat.label || `stat ${i + 1}`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

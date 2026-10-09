import React from 'react'
import { type StatItem, MIN_VALUE, MAX_VALUE } from '../types'

interface StatCardProps {
  stat: StatItem
  index: number
  isSelected?: boolean
  canDelete?: boolean
  onLabelChange: (index: number, newLabel: string) => void
  onValueChange: (index: number, newValue: number) => void
  onDelete?: (index: number) => void
  onFocus?: (index: number) => void
}

export const StatCard: React.FC<StatCardProps> = ({
  stat,
  index,
  isSelected = false,
  canDelete = false,
  onLabelChange,
  onValueChange,
  onDelete,
  onFocus,
}) => {
  const percentage = ((stat.value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * 100

  return (
    <div
      onClick={() => onFocus?.(index)}
      className={`stat-card ${isSelected ? 'stat-card--selected' : ''}`}
    >
      <div className="stat-card__header">
        <div className="stat-card__label-group">
          <span className="stat-card__index-badge">{index + 1}</span>
          <input
            type="text"
            value={stat.label}
            onChange={(e) => onLabelChange(index, e.target.value)}
            placeholder={`stat ${index + 1}`}
            className="stat-card__input"
          />
        </div>

        <div className="stat-card__controls">
          <span className="stat-card__value-badge">{stat.value}</span>

          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(index)
              }}
              className="stat-card__delete-btn"
              title="Remove this axis"
              aria-label="Remove axis"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="stat-card__slider-section">
        <input
          type="range"
          min={MIN_VALUE}
          max={MAX_VALUE}
          step="1"
          value={stat.value}
          onChange={(e) => onValueChange(index, parseInt(e.target.value, 10))}
          className="stat-card__slider"
          style={{
            background: `linear-gradient(to right, var(--slider-fill, #3b82f6) 0%, var(--slider-fill, #3b82f6) ${percentage}%, var(--slider-track, #232839) ${percentage}%, var(--slider-track, #232839) 100%)`,
          }}
        />

        <div className="stat-card__footer">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onValueChange(index, Math.max(MIN_VALUE, stat.value - 1))
            }}
            disabled={stat.value <= MIN_VALUE}
            className="stat-card__step-btn"
          >
            -1
          </button>
          <div className="stat-card__range-limits">
            <span>min: {MIN_VALUE}</span>
            <span>max: {MAX_VALUE}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onValueChange(index, Math.min(MAX_VALUE, stat.value + 1))
            }}
            disabled={stat.value >= MAX_VALUE}
            className="stat-card__step-btn"
          >
            +1
          </button>
        </div>
      </div>
    </div>
  )
}

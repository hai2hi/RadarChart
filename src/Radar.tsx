import React, { useState, useCallback } from 'react'
import { RadarChart } from './components/RadarChart'
import { StatCard } from './components/StatCard'
import {
  type StatItem,
  DEFAULT_STATS,
  DEFAULT_VALUE,
  MIN_AXES,
  MAX_AXES,
  SHAPE_NAMES,
  DEFAULT_CHART_SIZE,
} from './types'

export interface RadarInputProps {
  size?: number // default 550px, minimum 500px
}

function getNextLabel(existingStats: StatItem[]): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  for (const letter of letters) {
    const candidate = `stat ${letter}`
    if (!existingStats.some((s) => s.label.toLowerCase() === candidate)) {
      return candidate
    }
  }
  return `stat ${existingStats.length + 1}`
}

export const RadarInput: React.FC<RadarInputProps> = ({ size = DEFAULT_CHART_SIZE }) => {
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS)
  const [selectedStatIndex, setSelectedStatIndex] = useState<number | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const handleValueChange = useCallback((index: number, newValue: number) => {
    setStats((prev) => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], value: newValue }
      }
      return next
    })
  }, [])

  const handleLabelChange = useCallback((index: number, newLabel: string) => {
    setStats((prev) => {
      const next = [...prev]
      if (next[index]) {
        next[index] = { ...next[index], label: newLabel }
      }
      return next
    })
  }, [])

  const handleAddAxis = useCallback(() => {
    if (stats.length >= MAX_AXES) return
    const newId = `stat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const newLabel = getNextLabel(stats)
    setStats((prev) => [...prev, { id: newId, label: newLabel, value: DEFAULT_VALUE }])
    setSelectedStatIndex(stats.length)
  }, [stats])

  const handleRemoveAxis = useCallback(() => {
    if (stats.length <= MIN_AXES) return
    setStats((prev) => prev.slice(0, prev.length - 1))
    setSelectedStatIndex(null)
  }, [stats.length])

  const handleDeleteSpecificAxis = useCallback(
    (index: number) => {
      if (stats.length <= MIN_AXES) return
      setStats((prev) => prev.filter((_, i) => i !== index))
      setSelectedStatIndex(null)
    },
    [stats.length]
  )

  const handleReset = useCallback(() => {
    setStats(
      DEFAULT_STATS.map((s) => ({
        ...s,
        value: DEFAULT_VALUE,
      }))
    )
    setSelectedStatIndex(null)
  }, [])

  const applyPreset = (preset: 'triangle' | 'square' | 'rpg' | 'balanced') => {
    switch (preset) {
      case 'triangle':
        handleReset()
        break
      case 'square':
        setStats([
          { id: 'stat-a', label: 'stat a', value: 5 },
          { id: 'stat-b', label: 'stat b', value: 5 },
          { id: 'stat-c', label: 'stat c', value: 5 },
          { id: 'stat-d', label: 'stat d', value: 5 },
        ])
        setSelectedStatIndex(null)
        break
      case 'rpg':
        setStats([
          { id: 'rpg-1', label: 'ATK', value: 9 },
          { id: 'rpg-2', label: 'DEF', value: 6 },
          { id: 'rpg-3', label: 'SPD', value: 8 },
          { id: 'rpg-4', label: 'MAG', value: 5 },
          { id: 'rpg-5', label: 'HP', value: 9 },
          { id: 'rpg-6', label: 'CRT', value: 7 },
        ])
        setSelectedStatIndex(null)
        break
      case 'balanced':
        setStats((prev) => prev.map((s) => ({ ...s, value: 5 })))
        break
    }
  }

  const handleCopyJSON = () => {
    const data = JSON.stringify(stats, null, 2)
    navigator.clipboard.writeText(data).then(() => {
      setCopiedNotification(true)
      setTimeout(() => setCopiedNotification(false), 2000)
    })
  }

  const shapeName = SHAPE_NAMES[stats.length] || `${stats.length}-gon`

  return (
    <div className="radar-input">
      <div className="radar-input__header">
        <div className="radar-input__titles">
          <h1 className="radar-input__title">
            Radar chart
          </h1>
        </div>

        <div className="radar-input__shape-badge">
          <span className="radar-input__shape-badge-dot" />
          <span>{shapeName} ({stats.length} axes)</span>
        </div>
      </div>

      <div className="radar-input__chart-card">
        <RadarChart
          stats={stats}
          size={size}
          onValueChange={handleValueChange}
          onSelectStat={setSelectedStatIndex}
          selectedStatIndex={selectedStatIndex}
        />
      </div>

      <div className="radar-input__toolbar">
        <div className="radar-input__actions">
          <button
            type="button"
            onClick={handleAddAxis}
            disabled={stats.length >= MAX_AXES}
            className="radar-input__btn radar-input__btn--add"
          >
            <span className="radar-input__btn-symbol">+</span>
            <span>Add Axis</span>
          </button>

          <button
            type="button"
            onClick={handleRemoveAxis}
            disabled={stats.length <= MIN_AXES}
            className="radar-input__btn radar-input__btn--remove"
            title={stats.length <= MIN_AXES ? 'Minimum 3 axes required' : 'Remove last axis'}
          >
            <span className="radar-input__btn-symbol">-</span>
            <span>Remove Axis</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="radar-input__btn radar-input__btn--reset"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Reset</span>
          </button>
        </div>

        <div className="radar-input__extras">
          <div className="radar-input__presets-group">
            <span className="radar-input__presets-label">Presets:</span>
            <button
              onClick={() => applyPreset('triangle')}
              className="radar-input__preset-btn"
            >
              Triangle
            </button>
            <button
              onClick={() => applyPreset('square')}
              className="radar-input__preset-btn"
            >
              Square
            </button>
            <button
              onClick={() => applyPreset('rpg')}
              className="radar-input__preset-btn"
            >
              Hexagon RPG
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyJSON}
            className="radar-input__copy-btn"
            title="Copy current stats data as JSON"
          >
            {copiedNotification ? '✓ Copied' : 'JSON'}
          </button>
        </div>
      </div>

      <div className="radar-input__cards-section">
        <div className="radar-input__cards-header">
          <h2 className="radar-input__cards-title">
            Stats
          </h2>
        </div>

        <div className="radar-input__cards-grid">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={i}
              isSelected={selectedStatIndex === i}
              canDelete={stats.length > MIN_AXES}
              onLabelChange={handleLabelChange}
              onValueChange={handleValueChange}
              onDelete={handleDeleteSpecificAxis}
              onFocus={setSelectedStatIndex}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

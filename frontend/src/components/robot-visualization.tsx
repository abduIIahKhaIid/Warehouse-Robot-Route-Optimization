"use client"

import { Package, Clock, AlertCircle, MapPin, Navigation, Route, Warehouse } from "lucide-react"
import { useState, useEffect } from "react"

interface RobotVisualizationProps {
  result: any
  locations: any[]
  animationProgress: number
  isAnimating: boolean
  currentAnimationLocation: string | null
  hoveredLocation: string | null
  onLocationHover: (locationId: string | null) => void
}

export  function RobotVisualization({
  result,
  locations,
  animationProgress,
  isAnimating,
  currentAnimationLocation,
  hoveredLocation,
  onLocationHover,
}: RobotVisualizationProps) {
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)
  const [robotStatus, setRobotStatus] = useState<"moving" | "loading">("moving")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [visitedLocations, setVisitedLocations] = useState<string[]>([])

  useEffect(() => {
    if (!isAnimating || !result) return

    const totalSegments = result.coordinates.length - 1
    const progress = animationProgress / 100
    const segmentProgress = progress * totalSegments
    const currentSegment = Math.floor(segmentProgress)
    const segmentFraction = segmentProgress - currentSegment

    // Update robot status and loading progress
    if (segmentFraction < 0.7) {
      setRobotStatus("moving")
      setLoadingProgress(0)
    } else {
      setRobotStatus("loading")
      const loadProg = (segmentFraction - 0.7) / 0.3
      setLoadingProgress(loadProg * 100)
    }

    // Track visited locations
    if (currentSegment >= 0 && currentSegment < result.route.length) {
      const currentLoc = result.route[currentSegment]
      if (!visitedLocations.includes(currentLoc)) {
        setVisitedLocations([...visitedLocations, currentLoc])
      }
    }
  }, [animationProgress, isAnimating, result, visitedLocations])

  const getRobotPosition = () => {
    if (!result || !result.coordinates) return null

    const totalSegments = result.coordinates.length - 1
    const progress = animationProgress / 100
    const segmentProgress = progress * totalSegments
    const currentSegment = Math.floor(segmentProgress)
    const segmentFraction = segmentProgress - currentSegment

    if (currentSegment >= totalSegments) {
      return result.coordinates[result.coordinates.length - 1]
    }

    const start = result.coordinates[currentSegment]
    const end = result.coordinates[currentSegment + 1]

    return [start[0] + (end[0] - start[0]) * segmentFraction, start[1] + (end[1] - start[1]) * segmentFraction]
  }

  const getCurrentLocationDetail = () => {
    if (!currentAnimationLocation || !result?.locationDetails) return null
    if (currentAnimationLocation === "Return to Start") {
      return {
        id: "Return to Start",
        x: 0,
        y: 0,
        arrivalTime: 0,
        loadingTime: 0,
        distance: 0,
        penalty: 0,
        penaltyApplied: false,
      }
    }
    return result.locationDetails.find((detail: any) => detail.id === currentAnimationLocation)
  }

  const getLocationDetail = (locationId: string) => {
    if (!result?.locationDetails) return null
    return result.locationDetails.find((detail: any) => detail.id === locationId)
  }

  const maxX = Math.max(...locations.map((l) => (typeof l.x === "number" ? l.x : 0)), 0, 10)
  const maxY = Math.max(...locations.map((l) => (typeof l.y === "number" ? l.y : 0)), 0, 10)
  const robotPos = getRobotPosition()
  const currentDetail = getCurrentLocationDetail()

  const getRobotRotation = () => {
    if (!result || !result.coordinates || !robotPos) return 0

    const totalSegments = result.coordinates.length - 1
    const progress = animationProgress / 100
    const segmentProgress = progress * totalSegments
    const currentSegment = Math.floor(segmentProgress)

    if (currentSegment >= totalSegments) return 0

    const start = result.coordinates[currentSegment]
    const end = result.coordinates[currentSegment + 1]

    const dx = end[0] - start[0]
    const dy = end[1] - start[1]

    return (Math.atan2(dy, dx) * 180) / Math.PI
  }

  const rotation = getRobotRotation()

  const hasVisited = (locationId: string) => {
    if (!result?.route || !isAnimating) return false
    return visitedLocations.includes(locationId)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          viewBox={`-2 -2 ${maxX + 4} ${maxY + 4}`}
          className="w-full h-[600px] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl border-4 border-gray-600 shadow-2xl"
          style={{ transform: "scaleY(-1)" }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#60a5fa" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="robotGradient">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </radialGradient>
            <pattern id="warehouseFloor" patternUnits="userSpaceOnUse" width="1" height="1">
              <rect width="1" height="1" fill="#1a1a1a" />
              <rect width="0.9" height="0.9" x="0.05" y="0.05" fill="#2a2a2a" />
            </pattern>
          </defs>

          {/* Warehouse floor */}
          <rect x="-2" y="-2" width={maxX + 4} height={maxY + 4} fill="url(#warehouseFloor)" />

          {/* Grid lines - warehouse aisles */}
          {Array.from({ length: Math.ceil(maxX) + 1 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i}
              y1={-1}
              x2={i}
              y2={maxY + 1}
              stroke="#3b82f6"
              strokeWidth="0.05"
              opacity="0.4"
              strokeDasharray="0.3 0.3"
            />
          ))}
          {Array.from({ length: Math.ceil(maxY) + 1 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={-1}
              y1={i}
              x2={maxX + 1}
              y2={i}
              stroke="#3b82f6"
              strokeWidth="0.05"
              opacity="0.4"
              strokeDasharray="0.3 0.3"
            />
          ))}

          {/* Route path - enhanced with glow */}
          {result && result.coordinates.length > 1 && (
            <>
              <polyline
                points={result.coordinates.map((coord: number[]) => `${coord[0]},${coord[1]}`).join(" ")}
                fill="none"
                stroke="#1e40af"
                strokeWidth="0.12"
                opacity="0.4"
                strokeDasharray="0.3 0.2"
              />
              {isAnimating && (
                <polyline
                  points={result.coordinates
                    .slice(0, Math.floor((animationProgress / 100) * result.coordinates.length))
                    .map((coord: number[]) => `${coord[0]},${coord[1]}`)
                    .join(" ")}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="0.2"
                  markerEnd="url(#arrowhead)"
                  filter="url(#strongGlow)"
                />
              )}
            </>
          )}

          {/* Start point - warehouse base with building */}
          <g>
            {/* Base platform */}
            <rect x={-0.8} y={-0.8} width="1.6" height="1.6" fill="#10b981" opacity="0.3" rx="0.2" />
            <rect x={-0.6} y={-0.6} width="1.2" height="1.2" fill="#10b981" opacity="0.5" rx="0.15" />

            {/* Pulsing ring */}
            <circle cx={0} cy={0} r="0.9" fill="none" stroke="#10b981" strokeWidth="0.08" opacity="0.3">
              <animate attributeName="r" from="0.6" to="1.2" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Center circle */}
            <circle cx={0} cy={0} r="0.5" fill="#10b981" filter="url(#strongGlow)" />

            {/* Home icon */}
            <text
              x={0}
              y={0}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ transform: "scaleY(-1)", transformOrigin: `${0}px ${0}px` }}
              fontSize="0.7"
              fontWeight="bold"
            >
              🏠
            </text>
          </g>

          {/* Package locations - warehouse shelves */}
          {locations.map((loc, idx) => {
            if (typeof loc.x !== "number" || typeof loc.y !== "number") return null

            const isPenalty = result?.penalties?.[loc.id]
            const isCurrent = currentAnimationLocation === loc.id
            const isVisited = hasVisited(loc.id)
            const isHovered = hoveredLocation === loc.id || hoveredPoint?.id === loc.id

            return (
              <g
                key={loc.id}
                onMouseEnter={() => {
                  onLocationHover(loc.id)
                  setHoveredPoint({ ...loc, detail: getLocationDetail(loc.id) })
                }}
                onMouseLeave={() => {
                  onLocationHover(null)
                  setHoveredPoint(null)
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Warehouse shelf structure */}
                <rect
                  x={loc.x - 0.7}
                  y={loc.y - 0.7}
                  width="1.4"
                  height="1.4"
                  fill={isPenalty ? "#7f1d1d" : isVisited ? "#064e3b" : "#1e3a8a"}
                  opacity="0.3"
                  rx="0.1"
                />

                {/* Platform */}
                <rect
                  x={loc.x - 0.5}
                  y={loc.y - 0.5}
                  width="1"
                  height="1"
                  fill={isPenalty ? "#991b1b" : isVisited ? "#065f46" : "#1e40af"}
                  opacity="0.5"
                  rx="0.08"
                />

                {/* Location marker circle */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={isCurrent ? "0.7" : "0.5"}
                  fill={isPenalty ? "#ef4444" : isVisited ? "#10b981" : "#3b82f6"}
                  opacity={isHovered ? 1 : 0.9}
                  filter={isCurrent ? "url(#strongGlow)" : "url(#glow)"}
                  stroke={isCurrent ? "#fb923c" : isHovered ? "#60a5fa" : "white"}
                  strokeWidth={isCurrent ? "0.2" : isHovered ? "0.15" : "0.08"}
                />

                {/* Pulsing effect for current location */}
                {isCurrent && (
                  <circle cx={loc.x} cy={loc.y} r="0.9" fill="none" stroke="#fb923c" strokeWidth="0.1" opacity="0.5">
                    <animate attributeName="r" from="0.7" to="1.3" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Package icon or checkmark */}
                <text
                  x={loc.x}
                  y={loc.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ transform: "scaleY(-1)", transformOrigin: `${loc.x}px ${loc.y}px` }}
                  fontSize="0.6"
                  fontWeight="bold"
                >
                  {isVisited ? "✓" : "📦"}
                </text>

                {/* Location number badge */}
                <circle cx={loc.x + 0.5} cy={loc.y + 0.5} r="0.25" fill="white" filter="url(#glow)" />
                <text
                  x={loc.x + 0.5}
                  y={loc.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ transform: "scaleY(-1)", transformOrigin: `${loc.x + 0.5}px ${loc.y + 0.5}px` }}
                  fontSize="0.35"
                  fontWeight="bold"
                  fill={isPenalty ? "#ef4444" : isVisited ? "#10b981" : "#3b82f6"}
                >
                  {idx + 1}
                </text>
              </g>
            )
          })}

          {/* Animated robot */}
          {robotPos && isAnimating && (
            <g>
              {/* Robot shadow */}
              <ellipse cx={robotPos[0]} cy={robotPos[1] - 0.1} rx="0.5" ry="0.2" fill="black" opacity="0.3" />

              {/* Robot body with rotation */}
              <g transform={`rotate(${rotation} ${robotPos[0]} ${robotPos[1]})`}>
                {/* Robot base */}
                <rect
                  x={robotPos[0] - 0.4}
                  y={robotPos[1] - 0.3}
                  width="0.8"
                  height="0.6"
                  fill="url(#robotGradient)"
                  rx="0.1"
                  filter="url(#strongGlow)"
                />

                {/* Robot wheels */}
                <circle cx={robotPos[0] - 0.3} cy={robotPos[1] - 0.35} r="0.1" fill="#374151" />
                <circle cx={robotPos[0] + 0.3} cy={robotPos[1] - 0.35} r="0.1" fill="#374151" />
              </g>

              {/* Pulse effect */}
              <circle cx={robotPos[0]} cy={robotPos[1]} r="0.8" fill="#fb923c" opacity="0.3">
                <animate attributeName="r" from="0.6" to="1.4" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Robot icon */}
              <text
                x={robotPos[0]}
                y={robotPos[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  transform: "scaleY(-1)",
                  transformOrigin: `${robotPos[0]}px ${robotPos[1]}px`,
                }}
                fontSize="0.8"
                filter="url(#glow)"
              >
                🤖
              </text>

              {/* Direction indicator */}
              <line
                x1={robotPos[0]}
                y1={robotPos[1]}
                x2={robotPos[0] + Math.cos((rotation * Math.PI) / 180) * 0.8}
                y2={robotPos[1] + Math.sin((rotation * Math.PI) / 180) * 0.8}
                stroke="#fbbf24"
                strokeWidth="0.08"
                opacity="0.8"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Loading indicator - CIRCULAR PROGRESS BAR */}
              {robotStatus === "loading" && (
                <>
                  {/* Background circle */}
                  <circle
                    cx={robotPos[0]}
                    cy={robotPos[1]}
                    r="0.9"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.15"
                    opacity="0.3"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={robotPos[0]}
                    cy={robotPos[1]}
                    r="0.9"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.15"
                    strokeDasharray={`${(loadingProgress / 100) * 5.65} 5.65`}
                    transform={`rotate(-90 ${robotPos[0]} ${robotPos[1]})`}
                    filter="url(#glow)"
                  />
                  {/* Percentage text */}
                  <text
                    x={robotPos[0]}
                    y={robotPos[1] + 1.5}
                    textAnchor="middle"
                    style={{ transform: "scaleY(-1)", transformOrigin: `${robotPos[0]}px ${robotPos[1] + 1.5}px` }}
                    fontSize="0.45"
                    fill="#10b981"
                    fontWeight="bold"
                    filter="url(#glow)"
                  >
                    {Math.round(loadingProgress)}%
                  </text>
                </>
              )}
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredPoint && hoveredPoint.detail && (
          <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-4 shadow-2xl z-10 min-w-[280px]">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white text-lg">{hoveredPoint.id}</h4>
              <span className="text-slate-400 text-sm">
                ({hoveredPoint.x}, {hoveredPoint.y})
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                <span className="text-slate-300 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Arrival
                </span>
                <span className="text-white font-bold">{hoveredPoint.detail.arrivalTime.toFixed(1)} min</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                <span className="text-slate-300 text-sm flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Loading
                </span>
                <span className="text-white font-bold">{hoveredPoint.detail.loadingTime} min</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2">
                <span className="text-slate-300 text-sm flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  Distance
                </span>
                <span className="text-white font-bold">{hoveredPoint.detail.distance.toFixed(2)} units</span>
              </div>
              {hoveredPoint.detail.penaltyApplied && (
                <div className="flex items-center justify-between bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                  <span className="text-red-300 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Penalty
                  </span>
                  <span className="text-red-400 font-bold">${hoveredPoint.detail.penalty.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar with gradient */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-700 text-lg flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            Route Progress
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600 text-xl">{animationProgress.toFixed(0)}%</span>
            {robotStatus === "loading" && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                <Package className="w-4 h-4" />
                Loading
              </span>
            )}
            {robotStatus === "moving" && isAnimating && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold flex items-center gap-1">
                <Route className="w-4 h-4" />
                Moving
              </span>
            )}
          </div>
        </div>
        <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-200 rounded-full shadow-lg"
            style={{ width: `${animationProgress}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-200"
            style={{ width: `${animationProgress}%` }}
          >
            <div className="w-full h-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current location panel */}
      {isAnimating && currentDetail && (
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl p-6 shadow-2xl border-2 border-orange-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {currentDetail.id === "Return to Start" ? "🏠" : currentDetail.id.replace("L", "")}
            </div>
            <div>
              <h3 className="font-bold text-xl">
                {currentDetail.id === "Return to Start" ? "Returning to Home Base" : `Robot at ${currentDetail.id}`}
              </h3>
              <p className="text-white/90 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Position: ({currentDetail.x}, {currentDetail.y})
              </p>
            </div>
          </div>
          {currentDetail.id !== "Return to Start" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-bold">Arrival</span>
                </div>
                <span className="text-2xl font-bold">{currentDetail.arrivalTime.toFixed(1)} min</span>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-bold">Loading</span>
                </div>
                <span className="text-2xl font-bold">{currentDetail.loadingTime} min</span>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Route className="w-5 h-5" />
                  <span className="text-sm font-bold">Distance</span>
                </div>
                <span className="text-2xl font-bold">{currentDetail.distance.toFixed(2)} u</span>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">Penalty</span>
                </div>
                <span className={`text-2xl font-bold ${currentDetail.penaltyApplied ? "text-yellow-300" : ""}`}>
                  {currentDetail.penaltyApplied ? `$${currentDetail.penalty.toFixed(2)}` : "None"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
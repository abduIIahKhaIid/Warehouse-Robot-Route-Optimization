"use client"
import { useState, useRef, useEffect } from "react"
import { Package, Play, RefreshCw, MapPin, Plus, Sparkles, Pause } from "lucide-react"
import { LocationInputCard } from "@/components/location-input-card"
import { OptimizationResult } from "@/components/optimization-result"
import { RobotVisualization } from "@/components/robot-visualization"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const API_URL = "https://expert-spork-xq4jgpgpv9r3p6jq-8000.app.github.dev"

export default function WarehouseRobotDemo() {
  const [locations, setLocations] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Load saved locations from localStorage after component mounts
    const savedLocations = localStorage.getItem("warehouse-robot-locations")
    if (savedLocations) {
      try {
        const parsedLocations = JSON.parse(savedLocations)
        setLocations(parsedLocations)
      } catch (e) {
        console.error("Failed to parse saved locations", e)
      }
    }
  }, [])

  const [algorithm, setAlgorithm] = useState("GA")
  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [currentAnimationLocation, setCurrentAnimationLocation] = useState<string | null>(null)
  const [showLocationInfo, setShowLocationInfo] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const newLocationRef = useRef<HTMLDivElement>(null)

  const algorithms = [
    { value: "GA", label: "Genetic Algorithm", icon: "🧬" },
    { value: "SA", label: "Simulated Annealing", icon: "🔥" },
    { value: "PSO", label: "Particle Swarm Optimization", icon: "🐝" },
    { value: "ACO", label: "Ant Colony Optimization", icon: "🐜" },
    { value: "TS", label: "Tabu Search", icon: "🎯" },
    { value: "DE", label: "Differential Evolution", icon: "🧮" },
    { value: "ABC", label: "Artificial Bee Colony", icon: "🐝" },
    { value: "MABC", label: "Modified Artificial Bee Colony", icon: "🐝" },
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("warehouse-robot-locations", JSON.stringify(locations))
    }
  }, [locations])

  useEffect(() => {
    if (!isAnimating || !result) return

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 100) {
          setIsAnimating(false)
          setCurrentAnimationLocation(null)
          return 100
        }

        const totalSegments = result.coordinates.length - 1
        const progress = (prev + 0.5 * animationSpeed) / 100
        const segmentProgress = progress * totalSegments
        const currentSegment = Math.floor(segmentProgress)

        if (currentSegment >= 0 && currentSegment < result.route.length) {
          setCurrentAnimationLocation(result.route[currentSegment])
        }

        return prev + 0.5 * animationSpeed
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isAnimating, result, animationSpeed])

  const addLocation = () => {
    const newId = `L${locations.length + 1}`
    const newLocation = {
      id: newId,
      x: "",
      y: "",
      loadingTime: "",
      penaltyTime: "",
      penaltyRate: "",
    }
    setLocations([...locations, newLocation])
    setResult(null)

    setTimeout(() => {
      if (newLocationRef.current) {
        const inputs = newLocationRef.current.querySelectorAll("input")
        if (inputs.length > 0) {
          inputs[0].focus()
        }
      }
    }, 100)
  }

  const removeLocation = (index: number) => {
    if (locations.length <= 2) {
      toast.error("Cannot remove location", {
        description: "At least 2 locations are required for optimization",
      })
      return
    }
    const newLocations = locations.filter((_, idx) => idx !== index)
    newLocations.forEach((loc, idx) => {
      loc.id = `L${idx + 1}`
    })
    setLocations(newLocations)
    setResult(null)
  }

  const updateLocation = (index: number, field: string, value: string) => {
    const newLocations = [...locations]
    newLocations[index][field] = value === "" ? "" : Number.parseFloat(value)
    setLocations(newLocations)
    setResult(null)
  }

  const validateLocations = () => {
    if (locations.length < 2) {
      toast.error("Validation Error", {
        description: "At least 2 locations are required for optimization",
      })
      return false
    }

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i]
      if (loc.x === "" || loc.y === "" || loc.loadingTime === "" || loc.penaltyTime === "" || loc.penaltyRate === "") {
        toast.error("Validation Error", {
          description: `All fields are required for ${loc.id}`,
        })
        return false
      }

      const x = Number(loc.x)
      const y = Number(loc.y)
      const loadingTime = Number(loc.loadingTime)
      const penaltyTime = Number(loc.penaltyTime)
      const penaltyRate = Number(loc.penaltyRate)

      if (isNaN(x) || isNaN(y) || isNaN(loadingTime) || isNaN(penaltyTime) || isNaN(penaltyRate)) {
        toast.error("Validation Error", {
          description: `All fields must contain valid numbers for ${loc.id}`,
        })
        return false
      }

      if (x < 0 || y < 0) {
        toast.error("Validation Error", {
          description: `${loc.id}: Coordinates must be positive`,
        })
        return false
      }
      if (loadingTime <= 0) {
        toast.error("Validation Error", {
          description: `${loc.id}: Loading time must be greater than 0`,
        })
        return false
      }
      if (penaltyTime <= 0) {
        toast.error("Validation Error", {
          description: `${loc.id}: Penalty time must be greater than 0`,
        })
        return false
      }
      if (penaltyRate < 0) {
        toast.error("Validation Error", {
          description: `${loc.id}: Penalty rate cannot be negative`,
        })
        return false
      }
    }
    return true
  }

  const optimizeRoute = async () => {
    if (!validateLocations()) {
      return
    }

    setIsCalculating(true)
    setAnimationProgress(0)
    setCurrentAnimationLocation(null)

    try {
      const formattedLocations = locations.map((loc) => ({
        id: loc.id,
        x: Number(loc.x),
        y: Number(loc.y),
        loadingTime: Number(loc.loadingTime),
        penaltyTime: Number(loc.penaltyTime),
        penaltyRate: Number(loc.penaltyRate),
      }))

      const response = await fetch(`${API_URL}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locations: formattedLocations,
          algorithm: algorithm,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Optimization failed")
      }

      const optimizationResult = await response.json()

      setResult(optimizationResult)
      setIsCalculating(false)

      toast.success("Route Optimized!", {
        description: `Successfully optimized route using ${optimizationResult.algorithmUsed}`,
      })
    } catch (err: any) {
      setIsCalculating(false)
      toast.error("Optimization Failed", {
        description: err.message || "Could not connect to optimization server. Make sure the API is running.",
      })
    }
  }

  const clearAll = () => {
    setLocations([])
    setResult(null)
    setAnimationProgress(0)
    setIsAnimating(false)
    setCurrentAnimationLocation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      {isCalculating && <LoadingSpinner />}

      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 border-2 border-blue-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-white p-5 rounded-2xl shadow-2xl">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white text-balance mb-2 flex items-center gap-3">
                Warehouse Robot Routing Optimizer
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Add delivery locations and optimize routes using advanced AI algorithms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-6 border-2 border-white/50 mb-6">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Optimization Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-300 font-semibold text-base shadow-sm"
            >
              {algorithms.map((alg) => (
                <option key={alg.value} value={alg.value}>
                  {alg.icon} {alg.label}
                </option>
              ))}
            </select>
          </div>

          <Card className="shadow-xl border-2 border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">Delivery Locations</CardTitle>
                    <CardDescription className="text-sm mt-1">Configure all pickup and delivery points</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-base px-4 py-2 font-bold bg-blue-50 border-blue-300">
                  {isClient ? locations.length : 0} {isClient && locations.length === 1 ? "Location" : "Locations"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {locations.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 py-20 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 mb-4">
                    <MapPin className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Locations Yet</h3>
                  <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    Add delivery locations with coordinates, loading times, and penalty configurations to get started
                  </p>
                  <Button
                    onClick={addLocation}
                    size="lg"
                    className="gap-2 px-8 h-14 text-base shadow-xl hover:shadow-2xl"
                  >
                    <Plus className="w-5 h-5" />
                    Add First Location
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {locations.map((location, index) => (
                      <div key={location.id} ref={index === locations.length - 1 ? newLocationRef : null}>
                        <LocationInputCard
                          location={location}
                          index={index}
                          onUpdate={(field, value) => updateLocation(index, field, value)}
                          onRemove={() => removeLocation(index)}
                          isHovered={hoveredLocation === location.id}
                          onHover={(hover) => setHoveredLocation(hover ? location.id : null)}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addLocation}
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 h-14 text-base border-2 hover:bg-blue-50 hover:border-blue-300 shadow-md bg-transparent"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Location
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={optimizeRoute}
              disabled={locations.length < 2 || isCalculating}
              size="lg"
              className="flex-1 gap-2 h-14 text-lg shadow-xl hover:shadow-2xl"
            >
              <Play className="w-5 h-5" />
              {isCalculating ? "Optimizing..." : "Optimize Route"}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              className="gap-2 h-14 text-lg border-2 hover:bg-red-50 hover:border-red-300 shadow-md bg-transparent"
            >
              <RefreshCw className="w-5 h-5" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 space-y-6 border-2 border-white/50 mb-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Robot Visualization</h2>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAnimating(!isAnimating)
                    if (animationProgress >= 100) {
                      setAnimationProgress(0)
                      setCurrentAnimationLocation(null)
                    }
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                  title={isAnimating ? "Pause animation" : "Play animation"}
                >
                  {isAnimating ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Play
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setAnimationProgress(0)
                    setCurrentAnimationLocation(null)
                    setIsAnimating(false)
                  }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
                  title="Reset animation"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </button>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all"
                >
                  <option value={0.5}>0.5x Speed</option>
                  <option value={1}>1x Speed</option>
                  <option value={1.5}>1.5x Speed</option>
                  <option value={2}>2x Speed</option>
                  <option value={3}>3x Speed</option>
                </select>
              </div>
            )}
          </div>

          {!result ? (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl min-h-96 border-2 border-dashed border-gray-300">
              <div className="text-center p-8">
                <Package className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-bold text-gray-700 mb-2">No optimization results yet</p>
                <p className="text-sm text-gray-500">
                  Add locations with all required fields and click "Optimize Route"
                </p>
              </div>
            </div>
          ) : (
            <RobotVisualization
              result={result}
              locations={locations}
              animationProgress={animationProgress}
              isAnimating={isAnimating}
              currentAnimationLocation={currentAnimationLocation}
              hoveredLocation={hoveredLocation}
              onLocationHover={setHoveredLocation}
            />
          )}
        </div>

        {result && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-white/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Package className="w-7 h-7 text-blue-600" />
              Optimization Results
            </h2>
            <OptimizationResult result={result} />
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  )
}

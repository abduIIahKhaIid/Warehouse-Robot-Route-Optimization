"use client"

import { Trash2, MapPin, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LocationInputCardProps {
  location: {
    id: string
    x: string | number
    y: string | number
    loadingTime: string | number
    penaltyTime: string | number
    penaltyRate: string | number
  }
  index: number
  isHovered: boolean
  onUpdate: (field: string, value: string) => void
  onRemove: () => void
  onHover: (hover: boolean) => void
}

export function LocationInputCard({ location, index, isHovered, onUpdate, onRemove, onHover }: LocationInputCardProps) {
  const hasEmptyFields =
    location.x === "" ||
    location.y === "" ||
    location.loadingTime === "" ||
    location.penaltyTime === "" ||
    location.penaltyRate === ""

  const allFieldsFilled = !hasEmptyFields

  return (
    <Card
      className={`relative transition-all duration-300 ${
        isHovered
          ? "shadow-2xl scale-105 border-blue-500 ring-4 ring-blue-200"
          : "shadow-lg hover:shadow-xl border-gray-200"
      } ${hasEmptyFields ? "border-l-4 border-l-amber-400" : "border-l-4 border-l-emerald-500"}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                {index + 1}
              </div>
              {isHovered && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{location.id}</h3>
              {allFieldsFilled ? (
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1 text-xs px-2 py-0">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  Ready
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border border-amber-300 gap-1 text-xs px-2 py-0"
                >
                  <AlertCircle className="w-2.5 h-2.5" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={onRemove}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {/* Coordinates Section */}
          <div className="bg-blue-50/50 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-700">Position</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                  X <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={location.x}
                  onChange={(e) => onUpdate("x", e.target.value)}
                  placeholder="0"
                  className={`h-8 text-sm font-medium ${
                    location.x === ""
                      ? "border-amber-300 bg-white focus:border-amber-400"
                      : "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                  }`}
                  autoFocus={index === 0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                  Y <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={location.y}
                  onChange={(e) => onUpdate("y", e.target.value)}
                  placeholder="0"
                  className={`h-8 text-sm font-medium ${
                    location.y === ""
                      ? "border-amber-300 bg-white focus:border-amber-400"
                      : "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Time Parameters Section */}
          <div className="bg-indigo-50/50 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">Time</span>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                Loading (min) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={location.loadingTime}
                onChange={(e) => onUpdate("loadingTime", e.target.value)}
                placeholder="0"
                className={`h-8 text-sm font-medium ${
                  location.loadingTime === ""
                    ? "border-amber-300 bg-white focus:border-amber-400"
                    : "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                }`}
              />
            </div>
          </div>

          {/* Penalty Section */}
          <div className="bg-orange-50/50 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-bold text-gray-700">Penalty</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={location.penaltyTime}
                  onChange={(e) => onUpdate("penaltyTime", e.target.value)}
                  placeholder="0"
                  className={`h-8 text-sm font-medium ${
                    location.penaltyTime === ""
                      ? "border-amber-300 bg-white focus:border-amber-400"
                      : "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                  }`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                  Rate <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={location.penaltyRate}
                  onChange={(e) => onUpdate("penaltyRate", e.target.value)}
                  placeholder="0"
                  className={`h-8 text-sm font-medium ${
                    location.penaltyRate === ""
                      ? "border-amber-300 bg-white focus:border-amber-400"
                      : "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

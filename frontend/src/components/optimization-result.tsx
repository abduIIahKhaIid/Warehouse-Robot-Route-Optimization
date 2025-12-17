"use client"

import React from "react"
import { AlertCircle, TrendingDown, Clock, DollarSign, Route, Award, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"

interface OptimizationResultProps {
  result: {
    totalDistance: number
    totalLoadingTime: number
    totalPenalty: number
    grandTotalCost: number
    routeSequence: string[]
    penalties: Record<string, number>
    algorithmUsed: string
    locationDetails?: Array<{
      id: string
      arrivalTime: number
      loadingTime: number
      distance: number
      penalty: number
      penaltyApplied: boolean
    }>
  }
}

export function OptimizationResult({ result }: OptimizationResultProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-100">Total Distance</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{result.totalDistance.toFixed(2)}</p>
            <p className="text-blue-100 text-sm">units</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-100">Loading Time</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{result.totalLoadingTime}</p>
            <p className="text-purple-100 text-sm">minutes</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-orange-600 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-red-100">Total Penalty</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${result.totalPenalty.toFixed(2)}</p>
            <p className="text-red-100 text-sm">cost incurred</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-100">Grand Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${result.grandTotalCost.toFixed(2)}</p>
            <p className="text-green-100 text-sm">total cost</p>
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Algorithm Used</p>
              <p className="text-2xl font-bold text-gray-900">{result.algorithmUsed}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Optimized Route Sequence
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {result.routeSequence.map((loc: string, idx: number) => (
              <React.Fragment key={idx}>
                <div
                  className={`px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-105 ${
                    loc === "Start" || loc === "Return to Start"
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-400"
                      : result.penalties[loc]
                        ? "bg-gradient-to-br from-red-500 to-orange-600 text-white border-2 border-red-400"
                        : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-2 border-blue-400"
                  }`}
                >
                  {loc === "Start" || loc === "Return to Start" ? "🏠 " + loc : "📦 " + loc}
                </div>
                {idx < result.routeSequence.length - 1 && <div className="text-gray-400 font-bold text-xl">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      {result.locationDetails && result.locationDetails.length > 0 && (
        <Card className="bg-white border-2 border-gray-200 shadow-lg">
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              Detailed Location Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                    <th className="text-left p-3 font-bold text-gray-700 text-sm">Location</th>
                    <th className="text-right p-3 font-bold text-gray-700 text-sm">Arrival Time</th>
                    <th className="text-right p-3 font-bold text-gray-700 text-sm">Loading Time</th>
                    <th className="text-right p-3 font-bold text-gray-700 text-sm">Distance</th>
                    <th className="text-right p-3 font-bold text-gray-700 text-sm">Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {result.locationDetails.map((detail, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                        detail.penaltyApplied ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          {detail.id}
                        </span>
                      </td>
                      <td className="text-right p-3 font-semibold text-gray-700">
                        {detail.arrivalTime.toFixed(1)} min
                      </td>
                      <td className="text-right p-3 font-semibold text-gray-700">{detail.loadingTime} min</td>
                      <td className="text-right p-3 font-semibold text-gray-700">{detail.distance.toFixed(2)} units</td>
                      <td className="text-right p-3">
                        <span className={`font-bold ${detail.penaltyApplied ? "text-red-600" : "text-green-600"}`}>
                          {detail.penaltyApplied ? `$${detail.penalty.toFixed(2)}` : "None"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {Object.keys(result.penalties).length > 0 && (
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 shadow-lg">
          <div className="p-5">
            <h3 className="font-bold text-red-900 mb-4 text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Penalty Details - Time Threshold Exceeded
            </h3>
            <div className="grid gap-3">
              {Object.entries(result.penalties).map(([loc, penalty]: [string, any]) => (
                <div
                  key={loc}
                  className="flex justify-between items-center bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-lg">{loc}</span>
                      <p className="text-sm text-gray-600">Late arrival penalty applied</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">${penalty.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

"use client"

import { RefreshCw } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-80">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <RefreshCw className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Optimizing Route</h3>
          <p className="text-gray-600 text-sm">
            Running advanced algorithms to find the most efficient delivery path...
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full animate-pulse"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>
  )
}

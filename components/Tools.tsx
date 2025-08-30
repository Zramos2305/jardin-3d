"use client"
import { useState, useEffect } from "react"

import type { Tool } from "./Scene"

interface ToolsProps {
  activeTool: Tool
  setActiveTool: (tool: Tool) => void
  plantStats?: {
    planted: number
    watered: number
    pruned: number
    score: number
  }
}

interface ToolStats {
  uses: number
}

export default function Tools({
  activeTool,
  setActiveTool,
  plantStats = { planted: 0, watered: 0, pruned: 0, score: 0 },
}: ToolsProps) {
  const [toolStats, setToolStats] = useState<Record<Tool, ToolStats>>({
    regadera: { uses: 0 },
    tijeras: { uses: 0 },
    semillas: { uses: 0 },
  })

  const [waterLevel, setWaterLevel] = useState(100)
  const [seedCount, setSeedCount] = useState(10)
  const [sharpness, setSharpness] = useState(100)
  const [experience, setExperience] = useState(0)
  const [level, setLevel] = useState(1)
  const [showStats, setShowStats] = useState(false)
  const [showGardenStats, setShowGardenStats] = useState(false)

  const tools = [
    {
      id: "regadera" as Tool,
      name: "Regadera",
      icon: "💧",
      description: "Riega las plantas para hacerlas crecer más rápido",
      resource: waterLevel,
      resourceName: "Agua",
      maxResource: 100,
      color: "from-blue-400 to-blue-600",
      glowColor: "shadow-blue-500/50",
    },
    {
      id: "tijeras" as Tool,
      name: "Tijeras",
      icon: "✂️",
      description: "Corta las plantas para podarlas",
      resource: sharpness,
      resourceName: "Filo",
      maxResource: 100,
      color: "from-red-400 to-red-600",
      glowColor: "shadow-red-500/50",
    },
    {
      id: "semillas" as Tool,
      name: "Semillas",
      icon: "🌱",
      description: "Planta nuevas semillas en el suelo",
      resource: seedCount,
      resourceName: "Semillas",
      maxResource: 20,
      color: "from-green-400 to-green-600",
      glowColor: "shadow-green-500/50",
    },
  ]

  useEffect(() => {
    const newLevel = Math.floor(experience / 100) + 1
    setLevel(newLevel)
  }, [experience])

  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel((prev) => Math.min(prev + 2, 100))
      setSharpness((prev) => Math.min(prev + 1, 100))
      setSeedCount((prev) => Math.min(prev + 0.1, 20))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const consumeTool = (toolId: Tool) => {
    setToolStats((prev) => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        uses: prev[toolId].uses + 1,
      },
    }))

    setExperience((prev) => prev + 10)

    switch (toolId) {
      case "regadera":
        setWaterLevel((prev) => Math.max(prev - 15, 0))
        break
      case "tijeras":
        setSharpness((prev) => Math.max(prev - 10, 0))
        break
      case "semillas":
        setSeedCount((prev) => Math.max(prev - 1, 0))
        break
    }
  }

  const canUseTool = (toolId: Tool) => {
    switch (toolId) {
      case "regadera":
        return waterLevel >= 15
      case "tijeras":
        return sharpness >= 10
      case "semillas":
        return seedCount >= 1
      default:
        return true
    }
  }

  const handleButtonClick = (toolId: Tool) => {
    setActiveTool(toolId)
    const canUse = canUseTool(toolId)
    if (canUse) {
      consumeTool(toolId)
    }
  }

  return (
    <>
      <div className="absolute top-6 left-6">
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">L{level}</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Jardinero Experto</div>
              <div className="w-24 bg-white/20 rounded-full h-2 mt-1">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${experience % 100}%` }}
                ></div>
              </div>
              <div className="text-white/60 text-xs mt-1">{experience % 100}/100 EXP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex gap-2">
        <button
          onClick={() => setShowGardenStats(!showGardenStats)}
          className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center"
        >
          <span className="text-xl">📊</span>
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300 hover:scale-110 cursor-pointer flex items-center justify-center"
        >
          <span className="text-xl">🌿</span>
        </button>

        <div
          className={`
          absolute left-0 bottom-16 transition-all duration-300 transform origin-bottom-left
          ${showGardenStats ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
        `}
        >
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl min-w-48">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <div className="text-white font-semibold text-sm">Estadísticas</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{plantStats.planted}</div>
                <div className="text-white/60 text-xs">Sembradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{plantStats.watered}</div>
                <div className="text-white/60 text-xs">Regadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{plantStats.pruned}</div>
                <div className="text-white/60 text-xs">Podadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{plantStats.score}</div>
                <div className="text-white/60 text-xs">Puntos</div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
          absolute left-14 bottom-16 transition-all duration-300 transform origin-bottom-left
          ${showStats ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
        `}
        >
          <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl min-w-56">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌿</span>
              <div className="text-white font-semibold text-sm">Estado de Plantas</div>
            </div>

            <div className="space-y-2">
              {[
                { color: "bg-red-500", label: "Sediento", desc: "Necesita agua" },
                { color: "bg-yellow-500", label: "Necesita cuidado", desc: "Requiere atención" },
                { color: "bg-green-500", label: "Saludable", desc: "Estado óptimo" },
                { color: "bg-blue-500", label: "Bien hidratado", desc: "Excelente salud" },
              ].map((status, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.color} shadow-sm`}></div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">{status.label}</div>
                    <div className="text-white/60 text-xs">{status.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id
          const canUse = canUseTool(tool.id)

          return (
            <div key={tool.id} className="relative group">
              <button
                onClick={() => handleButtonClick(tool.id)}
                className={`
                  relative w-16 h-16 rounded-2xl backdrop-blur-xl border transition-all duration-300 transform hover:scale-110
                  ${
                    isActive
                      ? `bg-gradient-to-br ${tool.color} border-white/30 shadow-2xl ${tool.glowColor} shadow-lg`
                      : "bg-black/20 border-white/10 hover:bg-black/30"
                  }
                  ${!canUse ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="text-2xl relative z-10">{tool.icon}</span>
              </button>

              <div
                className={`
                absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-300 origin-bottom
                ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}
              `}
              >
                <div className="bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl min-w-48">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{tool.icon}</span>
                    <div>
                      <div className="text-white font-semibold text-sm">{tool.name}</div>
                      <div className="text-white/60 text-xs">Usos: {toolStats[tool.id].uses}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>{tool.resourceName}</span>
                      <span>
                        {Math.floor(tool.resource)}/{tool.maxResource}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${tool.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(tool.resource / tool.maxResource) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

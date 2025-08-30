"use client"

import { useRef, useState, useEffect } from "react"
import type { Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import type { Tool } from "./Scene"

export type PlantType = "flower" | "tree" | "bush" | "herb"

interface PlantProps {
  id: number
  position: [number, number, number]
  activeTool: Tool
  onRemove: (id: number) => void
  plantType?: PlantType
  onWatered?: () => void
  onCut?: () => void
  isHovered?: boolean
}

export default function Plant({
  id,
  position,
  activeTool,
  onRemove,
  plantType = "flower",
  onWatered,
  onCut,
  isHovered = false,
}: PlantProps) {
  const stemRef = useRef<Mesh>(null)
  const leavesRef = useRef<Mesh>(null)
  const extraRef = useRef<Mesh>(null)

  const [growth, setGrowth] = useState(0.2)
  const [isGrowing, setIsGrowing] = useState(false)
  const [isAlive, setIsAlive] = useState(true)
  const [waterLevel, setWaterLevel] = useState(0.5)
  const [age, setAge] = useState(0) // Edad de la planta en segundos
  const [season, setSeason] = useState<"spring" | "summer" | "autumn" | "winter">("spring")
  const [hasFlowers, setHasFlowers] = useState(false)
  const [hasFruit, setHasFruit] = useState(false)
  const [isBeingInteracted, setIsBeingInteracted] = useState(false)

  const getPlantConfig = () => {
    switch (plantType) {
      case "tree":
        return {
          maxGrowth: 3.5,
          growthRate: 0.03,
          waterConsumption: 0.015,
          stemWidth: [0.08, 0.15],
          leavesSize: 0.25,
          stemColor: "#8b5a2b",
          leavesColor: "#16a34a",
          flowerColor: "#f59e0b",
          fruitColor: "#dc2626",
        }
      case "bush":
        return {
          maxGrowth: 1.8,
          growthRate: 0.08,
          waterConsumption: 0.02,
          stemWidth: [0.06, 0.12],
          leavesSize: 0.2,
          stemColor: "#22c55e",
          leavesColor: "#15803d",
          flowerColor: "#ec4899",
          fruitColor: "#7c3aed",
        }
      case "herb":
        return {
          maxGrowth: 0.8,
          growthRate: 0.12,
          waterConsumption: 0.025,
          stemWidth: [0.02, 0.04],
          leavesSize: 0.1,
          stemColor: "#4ade80",
          leavesColor: "#22c55e",
          flowerColor: "#ffffff",
          fruitColor: "#84cc16",
        }
      default: // flower
        return {
          maxGrowth: 1.5,
          growthRate: 0.05,
          waterConsumption: 0.02,
          stemWidth: [0.04, 0.08],
          leavesSize: 0.15,
          stemColor: "#22c55e",
          leavesColor: "#16a34a",
          flowerColor: "#f59e0b",
          fruitColor: "#f97316",
        }
    }
  }

  const config = getPlantConfig()

  useEffect(() => {
    const seasonInterval = setInterval(() => {
      const seasons: Array<"spring" | "summer" | "autumn" | "winter"> = ["spring", "summer", "autumn", "winter"]
      setSeason(seasons[Math.floor(Date.now() / 10000) % 4])
    }, 10000) // Cambio de estación cada 10 segundos

    return () => clearInterval(seasonInterval)
  }, [])

  useFrame((state, delta) => {
    if (isAlive) {
      setAge((prev) => prev + delta)

      // Crecimiento con efectos estacionales
      const seasonMultiplier = season === "spring" ? 1.5 : season === "summer" ? 1.2 : season === "autumn" ? 0.8 : 0.3

      if (isGrowing && growth < config.maxGrowth) {
        setGrowth((prev) => Math.min(prev + delta * 1.5 * seasonMultiplier, config.maxGrowth))
      }

      // Animación de balanceo más realista
      if (stemRef.current && leavesRef.current) {
        const windStrength = season === "autumn" ? 0.08 : 0.05
        const sway = Math.sin(state.clock.elapsedTime * 2 + position[0]) * windStrength * growth
        stemRef.current.rotation.z = sway
        leavesRef.current.rotation.z = sway
        leavesRef.current.position.y = 0.5 * growth + Math.sin(state.clock.elapsedTime * 3) * 0.02
      }

      // Desarrollo de flores y frutos
      if (growth > config.maxGrowth * 0.7 && waterLevel > 0.6 && (season === "spring" || season === "summer")) {
        setHasFlowers(true)
      }

      if (hasFlowers && growth > config.maxGrowth * 0.9 && season === "summer" && age > 20) {
        setHasFruit(true)
        setHasFlowers(false)
      }

      // Pérdida de frutos en otoño
      if (season === "autumn" && hasFruit) {
        setTimeout(() => setHasFruit(false), 2000)
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (waterLevel > 0.3 && growth < config.maxGrowth && isAlive) {
        const seasonMultiplier = season === "spring" ? 1.3 : season === "summer" ? 1.1 : season === "autumn" ? 0.7 : 0.4
        setGrowth((prev) => Math.min(prev + config.growthRate * seasonMultiplier, config.maxGrowth))
        setWaterLevel((prev) => Math.max(prev - config.waterConsumption, 0))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [growth, waterLevel, isAlive, season, config])

  const handleClick = (event: any) => {
    event.stopPropagation()
    if (!isAlive) return

    setIsBeingInteracted(true)
    setTimeout(() => setIsBeingInteracted(false), 500)

    switch (activeTool) {
      case "regadera":
        setWaterLevel(1)
        setIsGrowing(true)
        onWatered?.()
        setTimeout(() => setIsGrowing(false), 3000)
        break
      case "tijeras":
        onCut?.()
        if (growth > 0.5) {
          setGrowth((prev) => Math.max(prev * 0.4, 0.2))
          setHasFlowers(false)
          setHasFruit(false)
        } else {
          onRemove(id)
        }
        break
      case "semillas":
        // Esta herramienta se maneja en el suelo
        break
    }
  }

  if (!isAlive) return null

  const getHealthColor = () => {
    let baseColor = config.leavesColor
    if (waterLevel < 0.3) baseColor = "#84cc16" // Amarillento por falta de agua
    if (season === "autumn") baseColor = "#f59e0b" // Colores otoñales
    if (season === "winter") baseColor = "#6b7280" // Gris invernal
    if (isHovered) baseColor = "#10b981" // Color más brillante al hacer hover
    return baseColor
  }

  const getStemColor = () => {
    let baseColor = config.stemColor
    if (waterLevel < 0.2) baseColor = "#a3a3a3" // Gris por deshidratación
    if (isHovered) baseColor = "#16a34a" // Color más brillante al hacer hover
    return baseColor
  }

  const getScale = () => {
    let scale = 1
    if (isHovered) scale = 1.05 // Ligeramente más grande al hacer hover
    if (isBeingInteracted) scale = 1.1 // Más grande durante la interacción
    return scale
  }

  const getHealthStatus = () => {
    if (waterLevel < 0.3) return { text: "Sediento", color: "#ef4444" }
    if (waterLevel < 0.6) return { text: "Necesita cuidado", color: "#f59e0b" }
    if (waterLevel > 0.8) return { text: "Bien hidratado", color: "#3b82f6" }
    return { text: "Saludable", color: "#22c55e" }
  }

  return (
    <group position={position} onClick={handleClick} scale={getScale()} userData={{ type: "plant", id }}>
      {(isHovered || isBeingInteracted) && (
        <group position={[0, 0.8 * growth + 0.3, 0]}>
          {/* Fondo del indicador */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.3]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          {/* Texto del estado - simulado con geometría */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.1, 0.25]} />
            <meshBasicMaterial color={getHealthStatus().color} transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* Indicador de hover */}
      {isHovered && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
        </mesh>
      )}

      {waterLevel > 0.7 && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 8]} />
          <meshLambertMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Indicador de poca agua */}
      {waterLevel < 0.3 && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 8]} />
          <meshLambertMaterial color="#ef4444" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Tallo con userData para raycasting */}
      <mesh ref={stemRef} position={[0, 0.25 * growth, 0]} castShadow userData={{ type: "plant", id }}>
        <cylinderGeometry args={[config.stemWidth[0], config.stemWidth[1], 0.5 * growth, 8]} />
        <meshLambertMaterial color={getStemColor()} />
      </mesh>

      {/* Hojas con userData para raycasting */}
      <mesh ref={leavesRef} position={[0, 0.5 * growth, 0]} castShadow userData={{ type: "plant", id }}>
        <sphereGeometry args={[config.leavesSize * growth, 8, 6]} />
        <meshLambertMaterial color={getHealthColor()} />
      </mesh>

      {/* Hojas adicionales */}
      {growth > config.maxGrowth * 0.6 && (
        <>
          <mesh position={[0.1 * growth, 0.4 * growth, 0]} castShadow userData={{ type: "plant", id }}>
            <sphereGeometry args={[config.leavesSize * 0.6 * growth, 6, 4]} />
            <meshLambertMaterial color={getHealthColor()} />
          </mesh>
          <mesh position={[-0.1 * growth, 0.4 * growth, 0]} castShadow userData={{ type: "plant", id }}>
            <sphereGeometry args={[config.leavesSize * 0.6 * growth, 6, 4]} />
            <meshLambertMaterial color={getHealthColor()} />
          </mesh>
        </>
      )}

      {/* Flores */}
      {hasFlowers && (
        <>
          <mesh position={[0, 0.7 * growth, 0]} castShadow>
            <sphereGeometry args={[0.06, 6, 4]} />
            <meshLambertMaterial color={config.flowerColor} />
          </mesh>
          {plantType === "bush" && (
            <>
              <mesh position={[0.08, 0.65 * growth, 0.05]} castShadow>
                <sphereGeometry args={[0.04, 6, 4]} />
                <meshLambertMaterial color={config.flowerColor} />
              </mesh>
              <mesh position={[-0.08, 0.65 * growth, -0.05]} castShadow>
                <sphereGeometry args={[0.04, 6, 4]} />
                <meshLambertMaterial color={config.flowerColor} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Frutos */}
      {hasFruit && (
        <>
          <mesh position={[0, 0.6 * growth, 0]} castShadow>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshLambertMaterial color={config.fruitColor} />
          </mesh>
          {plantType === "tree" && (
            <>
              <mesh position={[0.12, 0.55 * growth, 0.08]} castShadow>
                <sphereGeometry args={[0.06, 8, 6]} />
                <meshLambertMaterial color={config.fruitColor} />
              </mesh>
              <mesh position={[-0.1, 0.58 * growth, -0.06]} castShadow>
                <sphereGeometry args={[0.07, 8, 6]} />
                <meshLambertMaterial color={config.fruitColor} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* Elemento especial para hierbas */}
      {plantType === "herb" && growth > 0.5 && (
        <mesh ref={extraRef} position={[0, 0.3 * growth, 0]} castShadow>
          <coneGeometry args={[0.05, 0.2 * growth, 6]} />
          <meshLambertMaterial color="#84cc16" />
        </mesh>
      )}
    </group>
  )
}

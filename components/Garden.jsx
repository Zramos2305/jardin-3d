"use client"

import { useRef, useState, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import Plant from "./Plant"

export default function Garden({ activeTool, onToolUse, onPlantInteraction }) {
  const groundRef = useRef(null)
  const { raycaster, camera, scene, pointer, gl } = useThree()

  const [plants, setPlants] = useState([
    { id: 1, position: [2, 0, 2], type: "flower" },
    { id: 2, position: [-2, 0, 1], type: "bush" },
    { id: 3, position: [0, 0, -2], type: "tree" },
    { id: 4, position: [3, 0, -1], type: "herb" },
    { id: 5, position: [-3, 0, -2], type: "flower" },
  ])

  const [gameStats, setGameStats] = useState({
    plantsGrown: 0,
    plantsCut: 0,
    plantsPlanted: 0,
    totalWaterUsed: 0,
    gardenScore: 0,
  })

  const [hoveredObject, setHoveredObject] = useState(null)
  const [clickIndicator, setClickIndicator] = useState({
    position: [0, 0, 0],
    visible: false,
  })

  const getRandomPlantType = () => {
    const types = ["flower", "tree", "bush", "herb"]
    const weights = [0.4, 0.2, 0.25, 0.15] // Probabilidades
    const random = Math.random()
    let sum = 0

    for (let i = 0; i < types.length; i++) {
      sum += weights[i]
      if (random <= sum) return types[i]
    }
    return "flower"
  }

  const showClickIndicator = useCallback((position) => {
    setClickIndicator({ position, visible: true })
    setTimeout(() => {
      setClickIndicator((prev) => ({ ...prev, visible: false }))
    }, 1000)
  }, [])

  const updateGameStats = useCallback((action) => {
    setGameStats((prev) => {
      const newStats = { ...prev }

      switch (action) {
        case "plant":
          newStats.plantsPlanted += 1
          newStats.gardenScore += 10
          break
        case "water":
          newStats.plantsGrown += 1
          newStats.totalWaterUsed += 1
          newStats.gardenScore += 5
          break
        case "cut":
          newStats.plantsCut += 1
          newStats.gardenScore += 3
          break
      }

      return newStats
    })
  }, [])

  const handleGroundClick = useCallback(
    (event) => {
      if (activeTool !== "semillas") return

      event.stopPropagation()
      const point = event.point

      // Verificar límites del jardín
      if (Math.abs(point.x) > 8 || Math.abs(point.z) > 8) {
        onToolUse?.(activeTool, false)
        return
      }

      // Verificar que no hay una planta muy cerca
      const tooClose = plants.some((plant) => {
        const distance = Math.sqrt(
          Math.pow(plant.position[0] - point.x, 2) + Math.pow(plant.position[2] - point.z, 2)
        )
        return distance < 1.2
      })

      if (!tooClose) {
        const plantType = getRandomPlantType()
        const newPlant = {
          id: Date.now(),
          position: [point.x, 0, point.z],
          type: plantType,
        }

        setPlants((prev) => [...prev, newPlant])
        showClickIndicator([point.x, 0.1, point.z])
        updateGameStats("plant", plantType)
        onToolUse?.(activeTool, true)
      } else {
        onToolUse?.(activeTool, false)
      }
    },
    [activeTool, plants, onToolUse, showClickIndicator, updateGameStats],
  )

  const removePlant = useCallback(
    (plantId) => {
      const plant = plants.find((p) => p.id === plantId)
      if (plant) {
        updateGameStats("cut", plant.type)
        onPlantInteraction?.(plantId, "removed")
      }
      setPlants((prev) => prev.filter((plant) => plant.id !== plantId))
    },
    [plants, updateGameStats, onPlantInteraction],
  )

  const handlePlantWatered = useCallback(
    (plantId, plantType) => {
      updateGameStats("water", plantType)
      onPlantInteraction?.(plantId, "watered")
      onToolUse?.("regadera", true)
    },
    [updateGameStats, onPlantInteraction, onToolUse],
  )

  const handlePlantCut = useCallback(
    (plantId, plantType) => {
      updateGameStats("cut", plantType)
      onPlantInteraction?.(plantId, "cut")
      onToolUse?.("tijeras", true)
    },
    [updateGameStats, onPlantInteraction, onToolUse],
  )

  const handlePointerMove = useCallback((event) => {
    if (event.intersections.length > 0) {
      const intersection = event.intersections[0]
      if (intersection.object.userData?.type === "plant") {
        setHoveredObject(`plant-${intersection.object.userData.id}`)
      } else if (intersection.object === groundRef.current) {
        setHoveredObject("ground")
      } else {
        setHoveredObject(null)
      }
    } else {
      setHoveredObject(null)
    }
  }, [])

  useFrame((state) => {
    if (groundRef.current) {
      groundRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.01
      if (hoveredObject === "ground" && activeTool === "semillas") {
        groundRef.current.material.opacity = 0.95
      } else {
        groundRef.current.material.opacity = 0.9
      }
    }
  })

  return (
    <group onPointerMove={handlePointerMove}>
      {/* Suelo */}
      <mesh
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={handleGroundClick}
        userData={{ type: "ground" }}
      >
        <planeGeometry args={[20, 20, 32, 32]} />
        <meshLambertMaterial
          color={hoveredObject === "ground" && activeTool === "semillas" ? "#4ade80" : "#4ade80"}
          transparent
          opacity={0.9}
        />
      </mesh>

      {hoveredObject === "ground" && activeTool === "semillas" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[7.5, 8, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Bordes */}
      <group>
        <mesh position={[0, 0.1, -10]} castShadow>
          <boxGeometry args={[20, 0.2, 0.5]} />
          <meshLambertMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[0, 0.1, 10]} castShadow>
          <boxGeometry args={[20, 0.2, 0.5]} />
          <meshLambertMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[10, 0.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.2, 20]} />
          <meshLambertMaterial color="#8b5a2b" />
        </mesh>
        <mesh position={[-10, 0.1, 0]} castShadow>
          <boxGeometry args={[0.5, 0.2, 20]} />
          <meshLambertMaterial color="#8b5a2b" />
        </mesh>
      </group>

      {/* Rocas */}
      <group>
        <mesh position={[7, 0.15, 7]} castShadow>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshLambertMaterial color="#6b7280" />
        </mesh>
        <mesh position={[-7, 0.1, -7]} castShadow>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshLambertMaterial color="#6b7280" />
        </mesh>
        <mesh position={[6, 0.2, -8]} castShadow>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshLambertMaterial color="#6b7280" />
        </mesh>
      </group>

      {/* Indicador de clic */}
      {clickIndicator.visible && (
        <mesh position={clickIndicator.position}>
          <ringGeometry args={[0.2, 0.4, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Plantas */}
      {plants.map((plant) => (
        <Plant
          key={plant.id}
          id={plant.id}
          position={plant.position}
          activeTool={activeTool}
          onRemove={removePlant}
          plantType={plant.type}
          onWatered={() => handlePlantWatered(plant.id, plant.type)}
          onCut={() => handlePlantCut(plant.id, plant.type)}
          isHovered={hoveredObject === `plant-${plant.id}`}
        />
      ))}

      {/* Panel invisible */}
      <mesh position={[9, 2, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

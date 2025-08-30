"use client" // Este componente se ejecuta en el navegador

// Importamos todas las herramientas que necesitamos
import { useState, useEffect, useCallback } from "react" // Hooks de React para manejar estados y efectos
import { Canvas } from "@react-three/fiber" // Para crear el mundo 3D
import { OrbitControls } from "@react-three/drei" // Para controlar la cámara con el mouse
import Garden from "./Garden" // El componente del jardín
import Tools from "./Tools" // El componente de las herramientas

// Componente principal que contiene todo el jardín 3D
export default function Scene() {
  // Estados principales del juego (variables que pueden cambiar)
  const [plants, setPlants] = useState([]) // Lista de todas las plantas en el jardín
  const [activeTool, setActiveTool] = useState("semillas") // Herramienta que está seleccionada
  const [isDay, setIsDay] = useState(true) // Si es de día (true) o de noche (false)
  const [notifications, setNotifications] = useState([]) // Lista de mensajes para mostrar al usuario
  const [playerStats, setPlayerStats] = useState({
    // Estadísticas del jugador
    level: 1, // Nivel del jugador
    experience: 0, // Puntos de experiencia
    gardenScore: 0, // Puntuación total del jardín
    plantsWatered: 0, // Cuántas plantas ha regado
    plantsCut: 0, // Cuántas plantas ha cortado
    plantsPlanted: 0, // Cuántas plantas ha sembrado
  })

  // Función que se ejecuta cada segundo para actualizar las plantas
  useEffect(() => {
    const interval = setInterval(() => {
      setPlants((currentPlants) =>
        currentPlants.map((plant) => {
          // Cada planta crece automáticamente
          const newSize = Math.min(plant.size + 0.01, 2) // Crece hasta máximo 2
          const newWater = Math.max(plant.water - 0.5, 0) // Pierde agua con el tiempo

          return {
            ...plant, // Mantiene todas las propiedades anteriores
            size: newSize, // Actualiza el tamaño
            water: newWater, // Actualiza el nivel de agua
            age: plant.age + 1, // Aumenta la edad
          }
        }),
      )
    }, 1000) // Se ejecuta cada 1000 milisegundos (1 segundo)

    // Limpia el intervalo cuando el componente se desmonta
    return () => clearInterval(interval)
  }, []) // Solo se ejecuta una vez al cargar el componente

  // Función que cambia entre día y noche cada 30 segundos
  useEffect(() => {
    const dayNightCycle = setInterval(() => {
      setIsDay((prev) => !prev) // Cambia de día a noche o viceversa
    }, 30000) // 30000 milisegundos = 30 segundos

    return () => clearInterval(dayNightCycle)
  }, [])

  // Función que se ejecuta cuando el jugador usa una herramienta
  const handleToolUse = useCallback((tool, success) => {
    // Mensajes que se muestran según la herramienta y si fue exitosa
    const messages = {
      regadera: success ? "Planta regada exitosamente!" : "No hay suficiente agua",
      tijeras: success ? "Planta podada correctamente!" : "Las tijeras están desafiladas",
      semillas: success ? "Nueva planta sembrada!" : "No se puede plantar aquí",
    }

    // Añade una notificación a la lista
    const newNotification = {
      id: Date.now(), // ID único basado en el tiempo actual
      message: messages[tool] || "Acción completada", // Mensaje a mostrar
      type: success ? "success" : "error", // Tipo de notificación (éxito o error)
    }

    setNotifications((prev) => [...prev, newNotification])

    // Elimina la notificación después de 3 segundos
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
    }, 3000)

    // Si la acción fue exitosa, actualiza las estadísticas del jugador
    if (success) {
      setPlayerStats((prev) => {
        const newStats = { ...prev }
        newStats.experience += 10 // Gana 10 puntos de experiencia
        newStats.gardenScore += 1 // Gana 1 punto de puntuación

        // Actualiza contadores específicos según la herramienta
        if (tool === "regadera") newStats.plantsWatered += 1
        if (tool === "tijeras") newStats.plantsCut += 1
        if (tool === "semillas") newStats.plantsPlanted += 1

        // Calcula el nuevo nivel basado en la experiencia
        newStats.level = Math.floor(newStats.experience / 100) + 1

        return newStats
      })
    }
  }, [])

  // Función que se ejecuta cuando el jugador interactúa con una planta
  const handlePlantInteraction = useCallback((plantId, action, value) => {
    setPlants((currentPlants) =>
      currentPlants.map((plant) => {
        if (plant.id === plantId) {
          // Si es la planta correcta, actualiza sus propiedades
          if (action === "water") {
            return { ...plant, water: Math.min(plant.water + value, 100) }
          }
          if (action === "cut") {
            return { ...plant, size: Math.max(plant.size - value, 0.1) }
          }
        }
        return plant // Si no es la planta correcta, la devuelve sin cambios
      }),
    )
  }, [])

  // Función para añadir una nueva planta al jardín
  const addPlant = useCallback((position, type) => {
    const newPlant = {
      id: Date.now(), // ID único
      position: position, // Posición en el jardín [x, y, z]
      size: 0.1, // Tamaño inicial pequeño
      water: 50, // Nivel de agua inicial
      age: 0, // Edad inicial
      type: type, // Tipo de planta (flower, tree, bush, herb)
    }

    setPlants((prev) => [...prev, newPlant])
  }, [])

  // Función para eliminar una planta del jardín
  const removePlant = useCallback((plantId) => {
    setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== plantId))
  }, [])

  return (
    <div className="h-full w-full relative">
      {/* Mundo 3D */}
      <Canvas
        camera={{ position: [0, 5, 5], fov: 60 }} // Posición y configuración de la cámara
        shadows // Habilita las sombras
        className="bg-gradient-to-b from-sky-200 to-green-100" // Fondo degradado
      >
        {/* Luces del mundo 3D */}
        <ambientLight intensity={isDay ? 0.6 : 0.2} /> {/* Luz ambiental (más intensa de día) */}
        <directionalLight
          position={[10, 10, 5]} // Posición de la luz direccional (como el sol)
          intensity={isDay ? 1 : 0.3} // Intensidad según si es día o noche
          castShadow // Esta luz proyecta sombras
          shadow-mapSize-width={2048} // Calidad de las sombras
          shadow-mapSize-height={2048}
        />
        {/* Controles para mover la cámara con el mouse */}
        <OrbitControls
          enablePan={true} // Permite mover la cámara
          enableZoom={true} // Permite hacer zoom
          enableRotate={true} // Permite rotar la vista
          minDistance={3} // Distancia mínima de zoom
          maxDistance={15} // Distancia máxima de zoom
        />
        {/* El jardín donde están las plantas */}
        <Garden
          plants={plants} // Lista de plantas
          activeTool={activeTool} // Herramienta activa
          onPlantInteraction={handlePlantInteraction} // Función para interactuar con plantas
          onAddPlant={addPlant} // Función para añadir plantas
          onRemovePlant={removePlant} // Función para eliminar plantas
          onToolUse={handleToolUse} // Función cuando se usa una herramienta
        />
      </Canvas>

      {/* Interfaz de usuario (botones y paneles) */}
      <Tools
        activeTool={activeTool} // Herramienta seleccionada
        setActiveTool={setActiveTool} // Función para cambiar herramienta
        onToolUse={handleToolUse} // Función cuando se usa herramienta
        playerStats={playerStats} // Estadísticas del jugador
        isDay={isDay} // Si es de día o noche
        plants={plants} // Lista de plantas para mostrar estadísticas
      />

      {/* Notificaciones que aparecen en pantalla */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  )
}

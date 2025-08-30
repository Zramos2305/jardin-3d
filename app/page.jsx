"use client" // Esto le dice a Next.js que este código se ejecuta en el navegador del usuario

// Importamos las herramientas que necesitamos
import { useState } from "react" // Para manejar estados (cosas que cambian)
import Scene from "@/components/Scene" // El componente principal del jardín 3D

// Componente que muestra la pantalla de bienvenida
function WelcomeScreen({ onStart }) {
  return (
    // Contenedor principal que ocupa toda la pantalla
    <div className="h-screen w-full bg-gradient-to-b from-sky-200 to-green-100 flex items-center justify-center">
      {/* Caja central con el mensaje de bienvenida */}
      <div className="text-center space-y-8 p-8 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl max-w-md mx-4">
        <div className="space-y-4">
          {/* Título principal */}
          <h1 className="text-4xl font-bold text-green-800 text-balance">Holi, esto es un jardín interactivo</h1>

          <p className="text-lg text-green-700 text-pretty">Planta, riega y cuida tus plantas en este mundo 3D</p>
        </div>

        {/* Botón para empezar el juego */}
        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
        >
          Comenzar
        </button>

        <p className="text-sm text-green-600/80 font-medium">by: zay</p>
      </div>
    </div>
  )
}

// Componente principal de la aplicación
export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)

  if (showWelcome) {
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />
  }

  return (
    <main className="h-screen w-full bg-gradient-to-b from-sky-200 to-green-100">
      <Scene /> {/* Aquí se carga todo el jardín 3D */}
    </main>
  )
}

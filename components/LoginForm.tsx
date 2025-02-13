"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CheckSquare, Lock, User } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica de autenticación
    console.log("Iniciar sesión con:", username, password)
  }

  const multiTaskIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
      <motion.path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="#4338ca"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <motion.path
        d="M12 3v18"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 0.5 }}
      />
    </svg>
  )

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md overflow-hidden bg-white/80 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
        <CardHeader className="space-y-1 pt-8">
          <div className="flex justify-center mb-4">{multiTaskIcon()}</div>
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-indigo-600">
            MultiTask
          </CardTitle>
          <p className="text-center text-sm text-gray-600">Gestiona múltiples tareas con facilidad</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            onClick={handleSubmit}
          >
            Iniciar Sesión
          </Button>
        </CardFooter>
        <div className="p-6 bg-gradient-to-r from-cyan-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">MultiTask te permite:</h3>
          <ul className="space-y-2">
            {["Gestionar proyectos", "Asignar tareas", "Establecer prioridades", "Colaborar en equipo"].map(
              (feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center space-x-2 text-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckSquare className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </motion.li>
              ),
            )}
          </ul>
        </div>
      </Card>
    </motion.div>
  )
}


"use client"; // Asegúrate de agregar esta línea

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion"; // Agregamos AnimatePresence
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState(""); // Nombre
  const [lastName, setLastName] = useState(""); // Apellido
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmar contraseña
  const [error, setError] = useState(""); // Mensaje de error
  const [shake, setShake] = useState(false); // Estado para la animación de sacudida
  const router = useRouter(); // Hook para redirigir

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: Campos vacíos
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos.");
      triggerShake(); // Activar animación de sacudida
      return;
    }

    // Validación: Contraseñas coinciden
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      triggerShake(); // Activar animación de sacudida
      return;
    }

    // Validación: Correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      triggerShake(); // Activar animación de sacudida
      return;
    }

    // Validación: Contraseña segura (8 caracteres, números y mayúsculas)
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir números y mayúsculas.");
      triggerShake(); // Activar animación de sacudida
      return;
    }

    // Si todo está bien, proceder con el registro
    setError(""); // Limpiar errores
    console.log("Registrarse con:", { firstName, lastName, email, password });

    // Simulación de registro exitoso
    alert("Registro exitoso. Redirigiendo al inicio de sesión...");

    // Redirigir al usuario a la página de inicio de sesión
    router.push("/dashboard/login");
  };

  // Función para activar la animación de sacudida
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // Desactivar la animación después de 500ms
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <motion.div
        animate={{ x: shake ? [0, -10, 10, -10, 10, 0] : 0 }} // Animación de sacudida
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md overflow-hidden bg-white/80 backdrop-blur-md shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-indigo-600">
              Registrarse
            </CardTitle>
            <p className="text-center text-sm text-gray-600">Crea una cuenta para empezar a usar MultiTask</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Nombre */}
              <div className="space-y-2">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Campo: Apellido */}
              <div className="space-y-2">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Campo: Correo electrónico */}
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Campo: Contraseña */}
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Campo: Confirmar contraseña */}
              <div className="space-y-2">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Mostrar mensaje de error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-500 text-sm min-h-[24px]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Botón de registro */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                Registrarse
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/dashboard/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
                Inicia Sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
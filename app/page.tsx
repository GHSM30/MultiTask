"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // Importa AnimatePresence
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";

export default function LandingPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la Sidebar

  // Función para alternar la visibilidad de la Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-100 overflow-x-hidden">
      {/* Navbar */}
      <Navbar onLogoClick={toggleSidebar} /> {/* Pasamos la función toggleSidebar */}

      {/* Sidebar con animación */}
      <AnimatePresence>
        {isSidebarOpen && <Sidebar />} {/* Sidebar se anima al aparecer/desaparecer */}
      </AnimatePresence>

      {/* Hero Section con animación */}
      <motion.main
        initial={{ x: 0 }} // Posición inicial
        animate={{ x: isSidebarOpen ? 256 : 0 }} // Se mueve a la derecha cuando la Sidebar está abierta
        transition={{ type: "spring", stiffness: 100, damping: 15 }} // Animación suave
        className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 w-full"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-indigo-600 text-transparent bg-clip-text"
        >
          Organiza tus tareas eficientemente
        </motion.h2>
        <p className="mt-4 text-lg text-gray-700 max-w-xl">
          MultiTask es la herramienta ideal para gestionar proyectos, asignar tareas y mejorar la productividad de tu equipo.
        </p>
        <Button
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
          onClick={() => router.push("/dashboard/login")}
        >
          Comenzar ahora
        </Button>
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
"use client";

import { Home, Settings, Folder, Users, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion"; // Importa framer-motion

export default function Sidebar() {
  const router = useRouter();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    // Aquí puedes agregar la lógica para cerrar sesión
    console.log("Sesión cerrada");
    router.push("/");
  };

  return (
    <motion.div
      initial={{ x: -300 }} // Posición inicial fuera de la pantalla
      animate={{ x: 0 }} // Posición final (en la pantalla)
      exit={{ x: -300 }} // Posición al salir (fuera de la pantalla)
      transition={{ type: "spring", stiffness: 100, damping: 15 }} // Animación suave
      className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">MultiTask</h1>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-3" />
              Inicio
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Folder className="w-5 h-5 mr-3" />
              Proyectos
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 mr-3" />
              Equipo
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              Configuración
            </a>
          </li>
        </ul>
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar sesión
        </button>
      </div>
    </motion.div>
  );
}
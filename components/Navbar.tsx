"use client";

import { useState } from "react"; // Importa useState
import { User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onLogoClick: () => void; // Nueva prop para manejar el clic en el logo
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo con evento onClick */}
          <h1
            onClick={onLogoClick} // Ejecuta la función onLogoClick al hacer clic
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            MultiTask
          </h1>

          {/* Menú para dispositivos móviles */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Enlaces de navegación (desktop) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Producto
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Características
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Precios
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Empresa
            </a>
            <User
              className="w-6 h-6 text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
              onClick={() => router.push("/dashboard/login")}
            />
          </nav>
        </div>

        {/* Menú desplegable (mobile) */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-4">
              <a
                href="#"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Producto
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Características
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Precios
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Empresa
              </a>
              <button
                onClick={() => router.push("/dashboard/login")}
                className="text-gray-700 hover:text-indigo-600 transition-colors text-left"
              >
                Iniciar Sesión
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
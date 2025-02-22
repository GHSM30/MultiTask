"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sección 1: Logo y descripción */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-indigo-600">MultiTask</h2>
            <p className="text-gray-600">
              Organiza tus tareas eficientemente y mejora la productividad de tu equipo.
            </p>
            <p className="text-gray-600">
              MultiTask es la solución perfecta para equipos que buscan optimizar su flujo de trabajo.
            </p>
          </div>

          {/* Sección 2: Enlaces rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Producto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Sección 3: Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Contacto</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Email: info@multitask.com</li>
              <li className="text-gray-600">Teléfono: +1 234 567 890</li>
              <li className="text-gray-600">Dirección: 123 Calle Falsa, Ciudad</li>
              <li className="text-gray-600">Horario: Lunes a Viernes, 9:00 - 18:00</li>
            </ul>
          </div>

          {/* Sección 4: Redes Sociales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Síguenos</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
            <p className="text-gray-600">
              Mantente al día con las últimas noticias y actualizaciones.
            </p>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} MultiTask. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 mt-2">
            <a href="#" className="hover:text-indigo-600">Política de Privacidad</a> |{" "}
            <a href="#" className="hover:text-indigo-600">Términos y Condiciones</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
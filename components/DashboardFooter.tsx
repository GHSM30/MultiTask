"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function DashboardFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <h2 className="text-xl font-bold text-emerald-600 mb-4">MultiTask</h2>
            <p className="text-gray-600 text-sm">
              La herramienta ideal para gestionar proyectos, asignar tareas y mejorar la productividad de tu equipo.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-emerald-600 text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/tasks" className="text-gray-600 hover:text-emerald-600 text-sm">
                  Tareas
                </Link>
              </li>
              <li>
                <Link href="/dashboard/ai" className="text-gray-600 hover:text-emerald-600 text-sm">
                  Asistente IA
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="text-gray-600 hover:text-emerald-600 text-sm">
                  Configuración
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: info@multitask.com</li>
              <li>Teléfono: +1 234 567 890</li>
              <li>Dirección: 123 Calle Falsa, Ciudad</li>
              <li>Horario: L-V, 9:00 - 18:00</li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Síguenos
            </h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-emerald-600">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 MultiTask. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-emerald-600">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-emerald-600">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
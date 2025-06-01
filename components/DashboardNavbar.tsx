"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardNavbar() {
  const [userName, setUserName] = useState("Cargando...");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/dashboard/login");
          return;
        }

        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await response.json();
        setUserName(`${userData.firstName} ${userData.lastName}`);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("authToken");
        router.push("/dashboard/login");
      }
    };

    fetchUserData();
  }, [router]);

 const handleLogout = () => {
  // Eliminar el token de localStorage
  localStorage.removeItem('authToken');
  // Redirigir al login
  router.push('/');
};

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-emerald-600">MultiTask</h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">Conectado como:</span>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Conectado como:</span>
                  <span className="text-sm font-medium">{userName}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
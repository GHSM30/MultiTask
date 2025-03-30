"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle } from "lucide-react"; // Importamos el ícono de check

export default function LoginSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
          
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-emerald-500" strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Inicio de sesión exitoso!</h1>
            <p className="text-gray-600 mb-6">Has iniciado sesión correctamente en MultiTask</p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Ir al Dashboard
              </Button>
              
              <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
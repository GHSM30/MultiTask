"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, gql } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react"; // Importamos los íconos de visibilidad

const REGISTER_MUTATION = gql`
  mutation RegisterUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    register(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    ) {
      id
      email
      firstName
      lastName
    }
  }
`;

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar confirmación
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [register, { loading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log("Registro exitoso - Datos recibidos:", data);
      if (data?.register) {
        router.push("/dashboard/login");
      }
    },
    onError: (error) => {
      console.group("Error en el registro");
      console.log("Error completo:", error);
      console.log("GraphQL Errors:", error.graphQLErrors);
      console.log("Network Error:", error.networkError);
      console.groupEnd();
  
      const serverMessage = error.graphQLErrors?.[0]?.message || 
                         "Error al procesar el registro";
      
      setError(serverMessage);
      triggerShake();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.confirmPassword) {
      setError("Por favor, completa todos los campos.");
      triggerShake();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      triggerShake();
      return;
    }

    const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluir números y mayúsculas.");
      triggerShake();
      return;
    }

    try {
      console.log("Intentando registrar:", formData);
      const result = await register({
        variables: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }
      });
      console.log("Resultado del registro:", result);
    } catch (err) {
      console.error("Error en el registro:", err);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <motion.div
        animate={{ x: shake ? [0, -10, 10, -10, 10, 0] : 0 }}
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
              <div className="space-y-2">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="space-y-2 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-70"
              >
                {loading ? "Registrando..." : "Registrarse"}
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
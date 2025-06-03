"use client";

import { useState, useEffect, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, MoreVertical, User, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function DashboardNavbar() {
  const [userName, setUserName] = useState("Cargando...");
  const [userData, setUserData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/dashboard/login");
          return;
        }

        const response = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario");
        }

        const data = await response.json();
        setUserData(data);
        setUserName(`${data.firstName} ${data.lastName}`);
        setEditForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("authToken");
        router.push("/dashboard/login");
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/");
  };

 const handleEditProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    const response = await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: userData._id, // solo enviamos el id
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      }),
    });

    console.log("Respuesta:", response);
    console.log("Status:", response.status);
    const errorText = await response.text();
    console.log("Error Text:", errorText);

    if (!response.ok) {
      throw new Error("Error al actualizar el perfil");
    }

    const updatedUser = await response.json();
    setUserData(updatedUser);
    setUserName(`${updatedUser.firstName} ${updatedUser.lastName}`);
    setIsEditModalOpen(false);
    toast.success("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Error al actualizar el perfil");
  }
};


  const handleDeleteAccount = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    const response = await fetch("/api/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: userData._id, // <-- Agregamos de nuevo el id en el body
      }),
    });

    console.log("Respuesta:", response);
    console.log("Status:", response.status);
    const errorText = await response.text();
    console.log("Error Text:", errorText);

    if (!response.ok) {
      throw new Error("Error al eliminar la cuenta");
    }

    localStorage.removeItem("authToken");
    setIsDeleteModalOpen(false);
    toast.success("Cuenta eliminada correctamente");
    router.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
    toast.error("Error al eliminar la cuenta");
  }
};

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

              {/* Menú de tres puntos */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Editar perfil
                      </button>
                      <button
                        onClick={() => {
                          setIsDeleteModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar cuenta
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
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
                onClick={() => setIsEditModalOpen(true)}
                className="w-full text-gray-600 hover:text-emerald-600 mb-2"
              >
                <User className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full text-gray-600 hover:text-red-600 mb-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar cuenta
              </Button>

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

      {/* Modal para editar perfil */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Editar perfil
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Actualiza la información de tu perfil
                    </p>
                  </div>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="firstName" className="text-right">
                        Nombre
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="lastName" className="text-right">
                        Apellido
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={handleEditChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="email" className="text-right">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleEditProfile}>Guardar cambios</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal para confirmar eliminación */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    ¿Estás seguro?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Esta acción eliminará permanentemente tu cuenta y todos
                      tus datos. ¿Deseas continuar?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Eliminar cuenta
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}

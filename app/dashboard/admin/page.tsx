"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Save, X, Plus, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Componentes de tabla
const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="min-w-full divide-y divide-gray-200">{children}</table>
);
const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50">{children}</thead>
);
const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
);
const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr>{children}</tr>
);
const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);
const TableCell = ({ 
  children, 
  colSpan, 
  className 
}: { 
  children: React.ReactNode, 
  colSpan?: number,
  className?: string 
}) => (
  <td className={`px-6 py-4 whitespace-nowrap ${className || ''}`} colSpan={colSpan}>
    {children}
  </td>
);

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/dashboard/login");
        return;
      }

      const response = await fetch("/api/user?getAll=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No tienes permisos para ver esta información");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    router.push("/dashboard/login");
    toast.success("Sesión cerrada correctamente");
  };

  const handleEdit = (user: User) => {
    setEditingId(user._id);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (id: string) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    // Verificar campos obligatorios
    if (!editData.firstName || !editData.lastName || !editData.email) {
      throw new Error("Todos los campos son requeridos");
    }

    const response = await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id,
        ...editData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar usuario");
    }

    const updatedUser = await response.json();
    setUsers(users.map(user => 
      user._id === id ? { ...user, ...updatedUser } : user
    ));
    setEditingId(null);
    toast.success("Usuario actualizado correctamente");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error al actualizar usuario";
    setError(errorMessage);
    toast.error(errorMessage);
  }
};

  const handleDelete = async (id: string) => {
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
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }

    setUsers(users.filter(user => user._id !== id));
    toast.success("Usuario eliminado correctamente");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error al eliminar usuario";
    setError(errorMessage);
    toast.error(errorMessage);
  }
};

  const handleAddUser = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    // Validación básica de campos
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      throw new Error("Todos los campos son obligatorios");
    }

    const response = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear usuario");
    }

    const createdUser = await response.json();
    setUsers([...users, createdUser]);
    setShowAddForm(false);
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
    toast.success("Usuario creado correctamente");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error al crear usuario";
    setError(errorMessage);
    toast.error(errorMessage);
  }
};

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-cyan-700">
              Panel de Administración
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                {showAddForm ? "Cancelar" : "Agregar Usuario"}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">
                Agregar Nuevo Usuario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <Input
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleAddChange}
                    placeholder="Nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <Input
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleAddChange}
                    placeholder="Apellido"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleAddChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <Input
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleAddChange}
                    placeholder="Contraseña"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddUser}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        {editingId === user._id ? (
                          <Input
                            name="firstName"
                            value={editData.firstName || ""}
                            onChange={handleEditChange}
                            required
                          />
                        ) : (
                          user.firstName
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user._id ? (
                          <Input
                            name="lastName"
                            value={editData.lastName || ""}
                            onChange={handleEditChange}
                            required
                          />
                        ) : (
                          user.lastName
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === user._id ? (
                          <Input
                            name="email"
                            type="email"
                            value={editData.email || ""}
                            onChange={handleEditChange}
                            required
                          />
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {editingId === user._id ? (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(user._id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
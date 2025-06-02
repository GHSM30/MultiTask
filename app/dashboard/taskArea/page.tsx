"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  ListChecks,
  Send,
  Loader2,
  User,
  Calendar,
  Flag,
  Plus,
  Check,
  Edit,
  RotateCcw,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardFooter from "@/components/DashboardFooter";
import { format} from "date-fns";
import { es } from "date-fns/locale";
//import AuthGuard from '@/components/AuthGuard'

type Task = {
  id: string;
  _id?: string; // Para compatibilidad con MongoDB
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "Baja" | "Media" | "Alta";
  status: "todo" | "in-progress" | "done";
  createdAt: Date;
};

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  taskData?: Partial<Task>;
};

export default function TaskArea() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "todo" | "in-progress" | "done"
  >("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy MultiTask AI, tu asistente inteligente para gestión de tareas. Puedo ayudarte a:",
      role: "assistant",
    },
    {
      id: "2",
      content:
        "📝 Crear tareas con nombre, prioridad y fecha límite\n🔄 Modificar tareas existentes\n✅ Marcar tareas como completadas\n🗓️ Mostrar tus tareas pendientes\n🔍 Buscar tareas específicas",
      role: "assistant",
    },
    {
      id: "3",
      content:
        'Prueba decir: "Crear tarea Revisar documentos con prioridad alta para el viernes"',
      role: "assistant",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    priority: "Media",
    status: "todo",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const generateUniqueId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const fetchTasks = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return [];

    try {
      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener tareas");
      const data = await response.json();
      return data.map((task: Task) => ({
        ...task,
        id: task._id || task.id, // Mapea _id a id
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

  const saveTaskToServer = async (task: Partial<Task>) => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error("Error al guardar tarea");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const updateTaskOnServer = async (taskId: string, updates: Partial<Task>) => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token); // Debug
    console.log("Enviando:", { taskId, updates }); // Debug

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, ...updates }),
      });

      console.log("Respuesta:", response); // Debug

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error en respuesta:", errorText); // Debug
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en updateTaskOnServer:", error); // Debug
      return null;
    }
  };

  const deleteTaskOnServer = async (taskId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId }),
      });
      return response.ok;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    const updatedTask = await updateTaskOnServer(taskId, { status: newStatus });

    if (updatedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(), // Usar generateUniqueId aquí
            content: `✅ Tarea "${task.title}" ${
              newStatus === "done"
                ? "completada"
                : newStatus === "in-progress"
                ? "en progreso"
                : "pendiente"
            }`,
            role: "assistant",
          },
        ]);
      }
    }
  };

  // Función para editar una tarea
  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setNewTask({
        title: taskToEdit.title,
        description: taskToEdit.description,
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate,
      });
     
      setIsCreatingTask(true);
    }
  };

  

  // Función mejorada para manejar mensajes
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(), // Usar generateUniqueId aquí
          content: "⚠️ Necesitas iniciar sesión para usar el chat",
          role: "assistant",
        },
      ]);
      router.push("/dashboard/login");
      return;
    }

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: generateUniqueId(), // Usar generateUniqueId aquí
      content: input,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response = "";
      let taskData: Partial<Task> | undefined;
      const lowerInput = input.toLowerCase();

      // Comandos mejorados con expresiones regulares
      if (/(mostrar|listar|ver)\s+(mis\s+)?tareas/i.test(lowerInput)) {
        const pendingTasks = tasks.filter((t) => t.status !== "done");
        if (pendingTasks.length === 0) {
          response = "No tienes tareas pendientes. ¡Buen trabajo!";
        } else {
          response =
            "📋 Tus tareas pendientes:\n" +
            pendingTasks
              .map(
                (t) =>
                  `• ${t.title} (${
                    t.priority === "Alta"
                      ? "🔴 Alta"
                      : t.priority === "Media"
                      ? "🟡 Media"
                      : "🟢 Baja"
                  })` +
                  (t.dueDate
                    ? ` - Para el ${format(t.dueDate, "PP", { locale: es })}`
                    : "")
              )
              .join("\n");
        }
      } else if (/(crear|nueva|agregar)\s+tarea/i.test(lowerInput)) {
        const { title, priority, dueDate } = parseTaskCommand(input);

        if (!title) {
          response =
            "Por favor especifica el nombre de la tarea. Ejemplo: 'Crear tarea Proyecto final con prioridad alta para el 30 de mayo'";
        } else {
          const newTaskData : Partial<Task>= {
            title,
            description: `Tarea creada desde el chat: ${input}`,
            priority: priority || "Media",
            status: "todo",
            dueDate,
            createdAt: new Date(),
          };

          const savedTask = await saveTaskToServer(newTaskData);

          if (savedTask) {
            setTasks((prev) => [...prev, savedTask]);
            response = `✅ Tarea creada: "${savedTask.title}"${
              priority ? ` (Prioridad: ${priority})` : ""
            }${
              dueDate
                ? ` (Fecha límite: ${format(dueDate, "PPP", { locale: es })})`
                : ""
            }`;
            taskData = savedTask;
          } else {
            response =
              "⚠️ Error al guardar la tarea. Por favor intenta nuevamente.";
          }
        }
      } else if (/(modificar|editar|actualizar)\s+tarea/i.test(lowerInput)) {
        const taskName = extractTaskTitle(input);
        const task = tasks.find((t) =>
          t.title.toLowerCase().includes(taskName.toLowerCase())
        );

        if (!task) {
          response = `No encontré la tarea "${taskName}". ¿Podrías verificar el nombre?`;
        } else {
          // Verificar si el comando incluye detalles de modificación
          if (/(cambiar|modificar)\s+prioridad/i.test(lowerInput)) {
            const newPriority = detectPriority(input);
            if (newPriority) {
              const updatedTask = await updateTaskOnServer(task.id, {
                priority: newPriority,
              });
              if (updatedTask) {
                setTasks((prev) =>
                  prev.map((t) => (t.id === task.id ? updatedTask : t))
                );
                response = `✅ Prioridad de "${updatedTask.title}" cambiada a ${newPriority}`;
              } else {
                response =
                  "⚠️ Error al actualizar la prioridad. Por favor intenta nuevamente.";
              }
            } else {
              response = `Por favor especifica la nueva prioridad. Ejemplo: "Cambiar prioridad de ${taskName} a alta"`;
            }
          } else if (/(cambiar|modificar)\s+fecha/i.test(lowerInput)) {
            const newDate = parseDateFromCommand(input);
            if (newDate) {
              const updatedTask = await updateTaskOnServer(task.id, {
                dueDate: newDate,
              });
              if (updatedTask) {
                setTasks((prev) =>
                  prev.map((t) => (t.id === task.id ? updatedTask : t))
                );
                response = `✅ Fecha de "${
                  updatedTask.title
                }" cambiada a ${format(newDate, "PPP", { locale: es })}`;
              } else {
                response =
                  "⚠️ Error al actualizar la fecha. Por favor intenta nuevamente.";
              }
            } else {
              response = `Por favor especifica la nueva fecha. Ejemplo: "Cambiar fecha de ${taskName} al 30 de mayo"`;
            }
          } else {
            response = `Para modificar la tarea "${task.title}", por favor especifica qué quieres cambiar:\n\n- "Cambiar prioridad de ${taskName} a alta"\n- "Cambiar fecha de ${taskName} al 30 de mayo"\n- "Editar descripción de ${taskName}"`;
          }
        }
      } else if (/(completar|marcar|terminar)\s+tarea/i.test(lowerInput)) {
        const taskName = extractTaskTitle(input);
        const task = tasks.find((t) =>
          t.title.toLowerCase().includes(taskName.toLowerCase())
        );

        if (!task) {
          response = `No encontré la tarea "${taskName}". ¿Podrías verificar el nombre?`;
        } else {
          const updatedTask = await updateTaskOnServer(task.id, {
            status: "done",
          });
          if (updatedTask) {
            setTasks((prev) =>
              prev.map((t) => (t.id === task.id ? updatedTask : t))
            );
            response = `✅ Tarea "${updatedTask.title}" marcada como completada. ¡Buen trabajo!`;
          } else {
            response =
              "⚠️ Error al marcar la tarea como completada. Por favor intenta nuevamente.";
          }
        }
      } else if (/(buscar|encontrar|localizar)\s+tarea/i.test(lowerInput)) {
        const searchTerm = input
          .replace(/(buscar|encontrar|localizar)\s+tarea/i, "")
          .trim();
        if (!searchTerm) {
          response =
            "Por favor especifica qué tarea buscas. Ejemplo: 'Buscar tarea documentos'";
        } else {
          const foundTasks = tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (t.description &&
                t.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (foundTasks.length === 0) {
            response = `No encontré tareas que coincidan con "${searchTerm}"`;
          } else {
            response =
              `🔍 Tareas encontradas (${foundTasks.length}):\n` +
              foundTasks
                .map(
                  (t) =>
                    `• ${t.title} (${
                      t.status === "done" ? "✅ Completada" : "🟡 Pendiente"
                    })`
                )
                .join("\n");
          }
        }
      } else {
        try {
          const chatResponse = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: input }),
          });

          const chatData = await chatResponse.json();
          response =
            chatData.content ||
            "🤖 No entendí tu mensaje. ¿Puedes reformularlo?";
        } catch (apiError) {
          console.error("Error llamando a la API de Hugging Face:", apiError);
          response =
            "⚠️ No se pudo contactar al asistente. Usa comandos como 'crear tarea' o 'mostrar tareas'.";
        }
      }

      const aiMessage: Message = {
        id: generateUniqueId(),
        content: response,
        role: "assistant",
        taskData,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: generateUniqueId(),
        content:
          "⚠️ Lo siento, ocurrió un error. Por favor intenta de nuevo o usa comandos más específicos.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar una tarea
  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTaskOnServer(taskId);

    if (success) {
      const taskToDelete = tasks.find((task) => task.id === taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      if (taskToDelete) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(), // Usar generateUniqueId aquí
            content: `🗑️ Tarea "${taskToDelete.title}" eliminada`,
            role: "assistant",
          },
        ]);
      }
    }
  };

  // Funciones auxiliares mejoradas
  const extractTaskTitle = (text: string): string => {
    const patterns = [
      /(?:modificar|editar|completar|marcar|buscar|cambiar)\s+(?:tarea\s+)?["']?([^"'\n]+)/i,
      /(?:modificar|editar|completar|marcar|buscar|cambiar)\s+(?:la tarea\s+)?["']?([^"'\n]+)/i,
      /(?:tarea\s+)?["']?([^"'\n]+)\s+(?:como completada|a alta|a media|a baja|al \d+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/\s*$/, "");
      }
    }
    return "";
  };

  const parseTaskCommand = (
    text: string
  ): {
    title: string;
    priority?: "Baja" | "Media" | "Alta";
    dueDate?: Date;
  } => {
    const titleMatch =
      text.match(
        /(?:crear|nueva|agregar)\s+tarea\s+(?:llamada|con nombre)?\s*["']?([^"'\n]+)/i
      ) || text.match(/(?:crear|nueva|agregar)\s+tarea\s*["']?([^"'\n]+)/i);
    let title = titleMatch?.[1]?.trim() || "";

    title = title
      .replace(/\s+con\s+prioridad\s+(alta|media|baja)/i, "")
      .replace(/\s+para\s+el\s+.+$/i, "")
      .trim();

    let priority: "Baja" | "Media" | "Alta" | undefined;
    const priorityMatch = text.match(/(?:prioridad\s+)?(alta|media|baja)/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as "Baja" | "Media" | "Alta";
    }

    let dueDate: Date | undefined;
    try {
      dueDate = parseDateFromCommand(text);
      if (dueDate && isNaN(dueDate.getTime())) {
        dueDate = undefined;
      }
    } catch {
      dueDate = undefined;
    }

    return { title, priority, dueDate };
  };

  const parseDateFromCommand = (text: string): Date | undefined => {
    const datePatterns = [
      /(?:para|el|hasta)\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,
      /(?:para|el|hasta)\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      /(?:para|el|hasta)\s+(\d{1,2})\/(\d{1,2})/i,
      /(?:para|el|hasta)\s+(\w+)\s+(\d{1,2})/i,
      /(?:para|el|hasta)\s+(mañana|pasado mañana|próximo lunes|próxima semana)/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[0].replace(/(?:para|el|hasta)\s+/i, "");

          if (dateStr === "mañana") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
          }
          if (dateStr === "pasado mañana") {
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            return dayAfterTomorrow;
          }
          if (dateStr === "próximo lunes") {
            const nextMonday = new Date();
            nextMonday.setDate(
              nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)
            );
            return nextMonday;
          }
          if (dateStr === "próxima semana") {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek;
          }

          return new Date(dateStr);
        } catch {
          continue;
        }
      }
    }
    return undefined;
  };

  const detectPriority = (
    text: string
  ): "Baja" | "Media" | "Alta" | undefined => {
    const priorityMatch = text.match(/(?:a|prioridad)\s+(alta|media|baja)/i);
    if (priorityMatch) {
      return priorityMatch[1].toLowerCase() as "Baja" | "Media" | "Alta";
    }
    return undefined;
  };

  const startManualTaskCreation = () => {
    setIsCreatingTask(true);
    setNewTask({
      title: "",
      priority: "Media",
      status: "todo",
      dueDate: undefined,
    });
  };

  const saveManualTask = async () => {
    if (!newTask.title?.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(), // Usar generateUniqueId aquí
          content: "⚠️ Por favor ingresa un título para la tarea",
          role: "assistant",
        },
      ]);
      return;
    }

    const taskToSave = {
      ...newTask,
      id: generateUniqueId(), // ID único para la nueva tarea
      createdAt: new Date(),
    };

    const savedTask = await saveTaskToServer(taskToSave);

    if (savedTask) {
      setTasks((prev) => [...prev, savedTask]);
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(), // ID único para el mensaje
          content: `✅ Tarea "${savedTask.title}" creada`,
          role: "assistant",
          taskData: savedTask,
        },
      ]);
      setIsCreatingTask(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/dashboard/login");
      return;
    }

    const loadData = async () => {
      try {
        const tasks = await fetchTasks();
        setTasks(tasks);
      } catch {
        localStorage.removeItem("authToken");
        router.push("/dashboard/login");
      }
    };

    loadData();
  }, [router ]);

  // Auto-scroll
  /*
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
*/
  const filteredTasks = tasks.filter((task) =>
    activeTab === "all" ? true : task.status === activeTab
  );

  // Ordenar tareas por prioridad y fecha
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { Alta: 1, Media: 2, Baja: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />

      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gestión de Tareas
            </h1>
            <p className="text-sm text-gray-500">
              Organiza y planifica tus actividades
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={startManualTaskCreation}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Rápido</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Mis Tareas</h2>
              <span className="ml-auto text-sm text-gray-500">
                {sortedTasks.length}{" "}
                {sortedTasks.length === 1 ? "tarea" : "tareas"}
              </span>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
                className="whitespace-nowrap"
              >
                Todas
              </Button>
              <Button
                variant={activeTab === "todo" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("todo")}
                className="whitespace-nowrap"
              >
                Por hacer
              </Button>
              <Button
                variant={activeTab === "in-progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("in-progress")}
                className="whitespace-nowrap"
              >
                En progreso
              </Button>
              <Button
                variant={activeTab === "done" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("done")}
                className="whitespace-nowrap"
              >
                Completadas
              </Button>
            </div>

            <div className="space-y-3">
              {sortedTasks.length > 0 ? (
                sortedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={`p-4 hover:shadow-md transition-shadow group ${
                      task.dueDate &&
                      task.dueDate < new Date() &&
                      task.status !== "done"
                        ? "border-l-4 border-red-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {task.title}
                          </h3>
                          {task.status === "done" ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Completada
                            </span>
                          ) : task.status === "in-progress" ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              En progreso
                            </span>
                          ) : null}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(task.dueDate, "PPP", { locale: es })}
                              {task.dueDate < new Date() &&
                                task.status !== "done" && (
                                  <span className="text-red-500 ml-1">
                                    (Vencida)
                                  </span>
                                )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === "Alta"
                              ? "bg-red-100 text-red-800"
                              : task.priority === "Media"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Botón Editar */}
                          <div className="relative group/tooltip">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0"
                              onClick={() => handleEditTask(task.id)}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                              Editar tarea
                              <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                            </div>
                          </div>

                          {/* Botón Eliminar */}
                          <div className="relative group/tooltip">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                              Eliminar tarea
                              <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                            </div>
                          </div>

                          {task.status === "done" ? (
                            // Botón Reabrir
                            <div className="relative group/tooltip">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() =>
                                  handleStatusChange(task.id, "todo")
                                }
                              >
                                <RotateCcw className="h-5 w-5" />
                              </Button>
                              <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                                Reabrir tarea
                                <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                              </div>
                            </div>
                          ) : task.status === "in-progress" ? (
                            // Botón Completar
                            <div className="relative group/tooltip">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
                                onClick={() =>
                                  handleStatusChange(task.id, "done")
                                }
                              >
                                <Check className="h-5 w-5" />
                              </Button>
                              <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                                Completar tarea
                                <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Botón Mover a En Progreso */}
                              <div className="relative group/tooltip">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                  onClick={() =>
                                    handleStatusChange(task.id, "in-progress")
                                  }
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </Button>
                                <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                                  Mover a En Progreso
                                  <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                                </div>
                              </div>
                              {/* Botón Completar */}
                              <div className="relative group/tooltip">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0"
                                  onClick={() =>
                                    handleStatusChange(task.id, "done")
                                  }
                                >
                                  <Check className="h-5 w-5" />
                                </Button>
                                <div className="absolute z-10 left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap">
                                  Completar tarea
                                  <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 transform -translate-x-1/2"></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No hay tareas{" "}
                    {activeTab !== "all" ? "en esta categoría" : "aún"}.
                  </p>
                  <Button
                    variant="outline"
                    className="text-emerald-600 mt-2"
                    onClick={startManualTaskCreation}
                  >
                    Crear una nueva tarea
                  </Button>
                </Card>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 bg-emerald-50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                <h2 className="font-semibold">Asistente MultiTask AI</h2>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                ¿En qué puedo ayudarte hoy?
              </p>
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto space-y-3"
              style={{ maxHeight: "600px" }} // Altura fija para activar el scroll
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Card
                    className={`max-w-xs p-3 ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === "user" ? (
                        <User className="h-4 w-4 mr-2" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === "user" ? "Tú" : "MultiTask AI"}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                    {message.taskData && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          <span className="capitalize">
                            {message.taskData.priority}
                          </span>
                        </div>
                        {message.taskData.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(message.taskData.dueDate),
                                "PP",
                                { locale: es }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <Card className="max-w-xs p-3 bg-gray-50">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              {isCreatingTask ? (
                <div className="space-y-3">
                  <input
                    placeholder="Título de la tarea"
                    value={newTask.title || ""}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <input
                    placeholder="Descripción (opcional)"
                    value={newTask.description || ""}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as "Baja" | "Media" | "Alta",
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    <option value="Baja">Baja prioridad</option>
                    <option value="Media">Media prioridad</option>
                    <option value="Alta">Alta prioridad</option>
                  </select>
                  <input
                    type="date"
                    value={
                      newTask.dueDate
                        ? format(newTask.dueDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreatingTask(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={saveManualTask}
                      disabled={!newTask.title}
                    >
                      Guardar Tarea
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Escribe tu consulta o comando..."
                      className="w-full pr-10 border rounded-lg p-2 text-sm"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setInput("Mostrar mis tareas pendientes")}
                    >
                      <ListChecks className="h-3 w-3 mr-1" />
                      Ver tareas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => setInput("Crear tarea ")}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nueva tarea
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}

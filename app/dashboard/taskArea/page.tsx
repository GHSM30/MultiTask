"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Bot, ListChecks, Send, Loader2, User, Calendar, Flag, ChevronDown, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardFooter from "@/components/DashboardFooter";
import { getToken } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
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
  const [activeTab, setActiveTab] = useState<"all" | "todo" | "in-progress" | "done">("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy MultiTask AI, tu asistente inteligente para gestión de tareas. Puedo ayudarte a:",
      role: "assistant",
    },
    {
      id: "2",
      content: "📝 Crear tareas con nombre, prioridad y fecha límite\n🔄 Modificar tareas existentes\n✅ Marcar tareas como completadas\n🗓️ Mostrar tus tareas pendientes\n🔍 Buscar tareas específicas",
      role: "assistant",
    },
    {
      id: "3",
      content: 'Prueba decir: "Crear tarea Revisar documentos con prioridad alta para el viernes"',
      role: "assistant",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    priority: "medium",
    status: "todo"
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función mejorada para manejar mensajes
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const token = getToken();
    if (!token) {
      setMessages(prev => [...prev, {
        id: generateId(),
        content: "⚠️ Necesitas iniciar sesión para usar el chat",
        role: "assistant",
      }]);
      return;
    }

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: generateId(),
      content: input,
      role: "user",
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response = "";
      let taskData: Partial<Task> | undefined;
      const lowerInput = input.toLowerCase();

      // Comandos mejorados con expresiones regulares
      if (/(mostrar|listar|ver)\s+(mis\s+)?tareas/i.test(lowerInput)) {
        const pendingTasks = tasks.filter(t => t.status !== "done");
        if (pendingTasks.length === 0) {
          response = "No tienes tareas pendientes. ¡Buen trabajo!";
        } else {
          response = "📋 Tus tareas pendientes:\n" + 
            pendingTasks.map(t => 
              `• ${t.title} (${t.priority === "high" ? "🔴 Alta" : t.priority === "medium" ? "🟡 Media" : "🟢 Baja"})` +
              (t.dueDate ? ` - Para el ${format(t.dueDate, 'PP', { locale: es })}` : "")
            ).join("\n");
        }
      } 
      else if (/(crear|nueva|agregar)\s+tarea/i.test(lowerInput)) {
        const { title, priority, dueDate } = parseTaskCommand(input);
        
        if (!title) {
          response = "Por favor especifica el nombre de la tarea. Ejemplo: 'Crear tarea Proyecto final con prioridad alta para el 30 de mayo'";
        } else {
          const newTask: Task = {
            id: generateId(),
            title,
            description: `Tarea creada desde el chat: ${input}`,
            priority: priority || "medium",
            status: "todo",
            dueDate,
            createdAt: new Date()
          };
          setTasks(prev => [...prev, newTask]);
          response = `✅ Tarea creada: "${title}"${priority ? ` (Prioridad: ${priority})` : ''}${dueDate ? ` (Fecha límite: ${format(dueDate, 'PPP', { locale: es })})` : ''}`;
          taskData = newTask;
        }
      }
      else if (/(modificar|editar|actualizar)\s+tarea/i.test(lowerInput)) {
        const taskName = extractTaskTitle(input);
        const taskIndex = tasks.findIndex(t => t.title.toLowerCase().includes(taskName.toLowerCase()));
        
        if (taskIndex === -1) {
          response = `No encontré la tarea "${taskName}". ¿Podrías verificar el nombre?`;
        } else {
          // Verificar si el comando incluye detalles de modificación
          if (/(cambiar|modificar)\s+prioridad/i.test(lowerInput)) {
            const newPriority = detectPriority(input);
            if (newPriority) {
              const updatedTasks = [...tasks];
              updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], priority: newPriority };
              setTasks(updatedTasks);
              response = `✅ Prioridad de "${updatedTasks[taskIndex].title}" cambiada a ${newPriority}`;
            } else {
              response = `Por favor especifica la nueva prioridad. Ejemplo: "Cambiar prioridad de ${taskName} a alta"`;
            }
          } 
          else if (/(cambiar|modificar)\s+fecha/i.test(lowerInput)) {
            const newDate = parseDateFromCommand(input);
            if (newDate) {
              const updatedTasks = [...tasks];
              updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], dueDate: newDate };
              setTasks(updatedTasks);
              response = `✅ Fecha de "${updatedTasks[taskIndex].title}" cambiada a ${format(newDate, 'PPP', { locale: es })}`;
            } else {
              response = `Por favor especifica la nueva fecha. Ejemplo: "Cambiar fecha de ${taskName} al 30 de mayo"`;
            }
          }
          else {
            response = `Para modificar la tarea "${tasks[taskIndex].title}", por favor especifica qué quieres cambiar:\n\n- "Cambiar prioridad de ${taskName} a alta"\n- "Cambiar fecha de ${taskName} al 30 de mayo"\n- "Editar descripción de ${taskName}"`;
          }
        }
      }
      else if (/(completar|marcar|terminar)\s+tarea/i.test(lowerInput)) {
        const taskName = extractTaskTitle(input);
        const taskIndex = tasks.findIndex(t => t.title.toLowerCase().includes(taskName.toLowerCase()));
        
        if (taskIndex === -1) {
          response = `No encontré la tarea "${taskName}". ¿Podrías verificar el nombre?`;
        } else {
          const updatedTasks = [...tasks];
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: "done" };
          setTasks(updatedTasks);
          response = `✅ Tarea "${updatedTasks[taskIndex].title}" marcada como completada. ¡Buen trabajo!`;
        }
      }
      else if (/(buscar|encontrar|localizar)\s+tarea/i.test(lowerInput)) {
        const searchTerm = input.replace(/(buscar|encontrar|localizar)\s+tarea/i, "").trim();
        if (!searchTerm) {
          response = "Por favor especifica qué tarea buscas. Ejemplo: 'Buscar tarea documentos'";
        } else {
          const foundTasks = tasks.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          
          if (foundTasks.length === 0) {
            response = `No encontré tareas que coincidan con "${searchTerm}"`;
          } else {
            response = `🔍 Tareas encontradas (${foundTasks.length}):\n` + 
              foundTasks.map(t => 
                `• ${t.title} (${t.status === "done" ? "✅ Completada" : "🟡 Pendiente"})`
              ).join("\n");
          }
        }
      }
      else {
        // Respuesta por defecto mejorada
        response = `Puedo ayudarte con:\n\n` +
          `• Crear tareas: "Crear tarea Revisar documentos con prioridad alta"\n` +
          `• Mostrar tareas: "Mostrar mis tareas pendientes"\n` +
          `• Modificar tareas: "Cambiar prioridad de Revisar documentos a media"\n` +
          `• Completar tareas: "Marcar Revisar documentos como completada"\n` +
          `• Buscar tareas: "Buscar tarea documentos"\n\n` +
          `¿En qué más puedo ayudarte?`;
      }

      const aiMessage: Message = {
        id: generateId(),
        content: response,
        role: "assistant",
        taskData
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: generateId(),
        content: "⚠️ Lo siento, ocurrió un error. Por favor intenta de nuevo o usa comandos más específicos.",
        role: "assistant",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones auxiliares mejoradas
  const extractTaskTitle = (text: string): string => {
    const patterns = [
      /(?:modificar|editar|completar|marcar|buscar|cambiar)\s+(?:tarea\s+)?["']?([^"'\n]+)/i,
      /(?:modificar|editar|completar|marcar|buscar|cambiar)\s+(?:la tarea\s+)?["']?([^"'\n]+)/i,
      /(?:tarea\s+)?["']?([^"'\n]+)\s+(?:como completada|a alta|a media|a baja|al \d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/\s*$/, '');
      }
    }
    return "";
  };

  const parseTaskCommand = (text: string): { title: string; priority?: "low" | "medium" | "high"; dueDate?: Date } => {
    const titleMatch = text.match(/(?:crear|nueva|agregar)\s+tarea\s+(?:llamada|con nombre)?\s*["']?([^"'\n]+)/i) || 
                      text.match(/(?:crear|nueva|agregar)\s+tarea\s*["']?([^"'\n]+)/i);
    let title = titleMatch?.[1]?.trim() || "";

    // Limpiar el título
    title = title.replace(/\s+con\s+prioridad\s+(alta|media|baja)/i, '')
                 .replace(/\s+para\s+el\s+.+$/i, '')
                 .trim();

    // Extraer prioridad
    let priority: "low" | "medium" | "high" | undefined;
    const priorityMatch = text.match(/(?:prioridad\s+)?(alta|media|baja)/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as "low" | "medium" | "high";
    }

    // Extraer fecha
    let dueDate: Date | undefined = parseDateFromCommand(text);

    return { title, priority, dueDate };
  };

  const parseDateFromCommand = (text: string): Date | undefined => {
    const datePatterns = [
      /(?:para|el|hasta)\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i,
      /(?:para|el|hasta)\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      /(?:para|el|hasta)\s+(\d{1,2})\/(\d{1,2})/i,
      /(?:para|el|hasta)\s+(\w+)\s+(\d{1,2})/i,
      /(?:para|el|hasta)\s+(mañana|pasado mañana|próximo lunes|próxima semana)/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let dateStr = match[0].replace(/(?:para|el|hasta)\s+/i, "");
          
          // Manejar expresiones especiales
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
          
          return new Date(dateStr);
        } catch (e) {
          continue;
        }
      }
    }
    return undefined;
  };

  const detectPriority = (text: string): "low" | "medium" | "high" | undefined => {
    const priorityMatch = text.match(/(?:a|prioridad)\s+(alta|media|baja)/i);
    if (priorityMatch) {
      return priorityMatch[1].toLowerCase() as "low" | "medium" | "high";
    }
    return undefined;
  };

  const startManualTaskCreation = () => {
    setIsCreatingTask(true);
    setNewTask({
      title: "",
      priority: "medium",
      status: "todo",
      dueDate: undefined
    });
  };

  const saveManualTask = () => {
    if (!newTask.title.trim()) return;
    
    const generateId = () => {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    };

    const task: Task = {
      id: generateId(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority || "medium",
      status: "todo",
      dueDate: newTask.dueDate,
      createdAt: new Date()
    };

    setTasks(prev => [...prev, task]);
    setMessages(prev => [...prev, {
      id: generateId(),
      content: `✅ Tarea creada manualmente: "${task.title}"`,
      role: "assistant",
      taskData: task
    }]);
    setIsCreatingTask(false);
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredTasks = tasks.filter(task => 
    activeTab === "all" ? true : task.status === activeTab
  );

  // Ordenar tareas por prioridad y fecha
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
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
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Tareas</h1>
            <p className="text-sm text-gray-500">Organiza y planifica tus actividades</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push("/dashboard/taskArea/create")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
            <Button 
              onClick={startManualTaskCreation}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Rápido
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
                {sortedTasks.length} {sortedTasks.length === 1 ? "tarea" : "tareas"}
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
                sortedTasks.map(task => (
                  <Card key={task.id} className="p-3 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          {task.status === "done" && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Completada
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(task.dueDate, 'PPP', { locale: es })}
                              {task.dueDate < new Date() && task.status !== "done" && (
                                <span className="text-red-500 ml-1">(Vencida)</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === "high" ? "bg-red-100 text-red-800" : 
                          task.priority === "medium" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-green-100 text-green-800"
                        }`}>
                          {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baja"}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="xs" className="h-6">
                            Editar
                          </Button>
                          <Button variant="ghost" size="xs" className="h-6">
                            {task.status === "done" ? "Reabrir" : "Completar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    No hay tareas {activeTab !== "all" ? "en esta categoría" : "aún"}.
                  </p>
                  <Button 
                    variant="link" 
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
              <p className="text-sm text-gray-500 mt-1">¿En qué puedo ayudarte hoy?</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3"
            style={{ maxHeight: '600px' }} // Altura fija para activar el scroll
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card className={`max-w-xs p-3 ${
                    message.role === "user" ? "bg-emerald-600 text-white" : "bg-gray-50"
                  }`}>
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
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.taskData && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          <span className="capitalize">{message.taskData.priority}</span>
                        </div>
                        {message.taskData.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(message.taskData.dueDate), 'PP', { locale: es })}</span>
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
                  <Input
                    placeholder="Título de la tarea"
                    value={newTask.title || ""}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                  <Input
                    placeholder="Descripción (opcional)"
                    value={newTask.description || ""}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-between">
                          <Flag className="h-4 w-4 mr-2" />
                          {newTask.priority === "high" ? "Alta" : 
                           newTask.priority === "medium" ? "Media" : "Baja"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setNewTask({...newTask, priority: "high"})}>
                          <span className="text-red-500">Alta prioridad</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setNewTask({...newTask, priority: "medium"})}>
                          <span className="text-yellow-500">Media prioridad</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setNewTask({...newTask, priority: "low"})}>
                          <span className="text-green-500">Baja prioridad</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {newTask.dueDate ? format(newTask.dueDate, 'PPP', { locale: es }) : "Fecha límite"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarUI
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask({...newTask, dueDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
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
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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
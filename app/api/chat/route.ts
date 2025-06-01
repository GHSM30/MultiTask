import { NextResponse } from 'next/server';

// Modelos de Hugging Face (pueden cambiar según disponibilidad)
const FREE_MODEL = "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5";
const FALLBACK_MODEL = "gpt2";

// Tipos para las acciones
type TaskAction = 'create' | 'modify' | 'complete' | 'list' | 'search' | 'reminder' | 'delete' | 'categorize' | 'unknown';
type ModifySubType = 'date' | 'priority' | 'description' | 'title' | 'category' | 'unknown';

// Interfaz para la acción detectada
interface DetectedAction {
  type: TaskAction;
  subType?: ModifySubType;
  taskName?: string;
  date?: string;
  priority?: string;
  category?: string;
}

export async function POST(request: Request) {
  try {
    const { message, context = [] } = await request.json();
    
    // Validamos el mensaje recibido
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje no válido' },
        { status: 400 }
      );
    }

    // Detección mejorada de la acción
    const action = detectEnhancedTaskAction(message, context);
    
    // Primero generamos una respuesta local por si fallan los modelos
    let response = getEnhancedFallbackResponse(message, action.type, action.subType);
    
    // Solo intentamos usar los modelos si tenemos API key
    if (process.env.NEXT_PUBLIC_HF_API_KEY) {
      try {
        // Intentamos con el modelo principal primero
        const modelResponse = await queryModel(FREE_MODEL, message, action);
        if (modelResponse && !isGibberish(modelResponse)) {
          response = modelResponse;
        }
      } catch (primaryError) {
        console.error('Error con el modelo principal:', primaryError);
        try {
          // Si falla, intentamos con el modelo alternativo
          const fallbackResponse = await queryModel(FALLBACK_MODEL, message, action);
          if (fallbackResponse && !isGibberish(fallbackResponse)) {
            response = fallbackResponse;
          }
        } catch (fallbackError) {
          console.error('Error con el modelo alternativo:', fallbackError);
        }
      }
    }

    // Mejoramos la respuesta final
    response = enhanceResponse(response, action.type, action);
    
    // Devolvemos la respuesta
    return NextResponse.json({ 
      content: response,
      detectedAction: action
    });

  } catch (error) {
    console.error('Error en la API de chat:', error);
    return NextResponse.json(
      { content: 'Actualmente estoy teniendo dificultades técnicas. Por favor, intenta nuevamente más tarde o usa comandos más específicos para gestionar tus tareas.' },
      { status: 200 }
    );
  }
}

// Función para consultar los modelos de Hugging Face
async function queryModel(model: string, message: string, action: DetectedAction): Promise<string | null> {
  try {
    let systemPrompt = '';
    let examples = '';

    // Generamos el prompt según el tipo de acción
    switch(action.type) {
      case 'create':
        systemPrompt = `Eres un asistente especializado en creación de tareas. Ayuda al usuario a formular correctamente la tarea con todos los detalles necesarios.`;
        examples = `Ejemplos:
- "Crear tarea 'Revisar documentos del contrato' con prioridad Alta para el viernes 15 de junio"
- "Agregar 'Llamar al cliente Juan Pérez para confirmar la reunión' para mañana a las 11am"`;
        break;
        
      case 'modify':
        systemPrompt = `Eres un asistente para modificar tareas. Pide confirmación antes de cambiar cualquier dato.`;
        examples = `Ejemplos:
- "Cambiar fecha de 'Revisar documentos' al 15 de junio"
- "Actualizar la prioridad de 'Informe final' a Alta"`;
        break;
        
      case 'complete':
        systemPrompt = `Eres un asistente para marcar tareas como completadas. Verifica que el usuario mencionó correctamente el nombre de la tarea.`;
        examples = `Ejemplos:
- "Completar tarea 'Revisar documentos'"
- "Marcar como terminado el 'Informe final'"`;
        break;
        
      case 'list':
        systemPrompt = `Eres un asistente para listar tareas. Ofrece opciones de filtrado.`;
        examples = `Ejemplos:
- "Mostrar mis tareas pendientes"
- "Listar tareas con prioridad Alta"`;
        break;
        
      case 'search':
        systemPrompt = `Eres un asistente para buscar tareas específicas. Pide más detalles si la búsqueda es muy amplia.`;
        examples = `Ejemplos:
- "Buscar tareas de documentos"
- "Encontrar la tarea de llamar al cliente"`;
        break;
        
      case 'reminder':
        systemPrompt = `Eres un asistente para gestionar recordatorios. Explica claramente cuándo y cómo se activarán.`;
        examples = `Ejemplos:
- "Recordarme revisar el correo cada mañana a las 9am"
- "Configurar alerta para 'Renovar suscripción' una semana antes"`;
        break;
        
      case 'delete':
        systemPrompt = `Eres un asistente para eliminar tareas. Pide confirmación explícita antes de proceder.`;
        examples = `Ejemplos:
- "Eliminar la tarea 'Reunión cancelada'"
- "Borrar todas las tareas completadas de la categoría 'Personal'"`;
        break;
        
      case 'categorize':
        systemPrompt = `Eres un asistente para organizar tareas en categorías. Sugiere categorías relevantes si no se especifican.`;
        examples = `Ejemplos:
- "Mover 'Preparar presentación' a la categoría 'Trabajo'"
- "Clasificar todas las tareas de compras en 'Personal'"`;
        break;
        
      default:
        systemPrompt = `Eres MultiTask AI, un asistente especializado en gestión de tareas. Responde en español de forma clara, útil y profesional.`;
        examples = `Puedo ayudarte con:
- Creación/modificación/eliminación de tareas
- Recordatorios y fechas límite
- Organización por prioridad o categorías`;
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `[INST] <<SYS>>
${systemPrompt}
${examples}
<</SYS>> ${message} [/INST]`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!response.ok) {
      console.error(`Modelo ${model} respondió con estado ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data[0]?.generated_text || null;
  } catch (error) {
    console.error(`Error consultando el modelo ${model}:`, error);
    return null;
  }
}

// Función mejorada para detectar acciones con subtipos
function detectEnhancedTaskAction(message: string, context: string[] = []): DetectedAction {
  const lowerMsg = message.toLowerCase();
  
  const taskNameMatch = message.match(/(?:^|["“'])([^"“']+)["”']|(?:tarea|recordatorio|reunión|llamar|hacer)\s+([^.,;!?]+)/i);
  const taskName = taskNameMatch ? (taskNameMatch[1] || taskNameMatch[2]).trim() : undefined;
  
  const dateMatch = message.match(/(\d{1,2}\s+(?:de\s+)?[a-z]+\s*(?:de\s+\d{4})?|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|mañana|pasado mañana|lunes|martes|miércoles|jueves|viernes|sábado|domingo|próxima semana|fin de semana)/i);
  const date = dateMatch ? dateMatch[0] : undefined;
  
  const priorityMatch = lowerMsg.match(/(Alta|Media|Baja|crítica|importante|urgente|prioritaria)/i);
  const priority = priorityMatch ? priorityMatch[0] : undefined;
  
  const categoryMatch = message.match(/(?:categoría|etiqueta|área)\s*(?:de\s+)?["']?([^"'\.,;!?]+)/i);
  const category = categoryMatch ? categoryMatch[1].trim() : undefined;
  
  const lastAction = context.length > 0 ? context[context.length - 1].toLowerCase() : '';
  
  if (/(crear|nueva|agregar|añadir|necesito|quiero)\s+(?:tarea|recordatorio|reunión|llamar|hacer)/i.test(lowerMsg) ||
      (lastAction.includes('crear') && /sí|si|ok|vale|correcto/i.test(lowerMsg))) {
    return { 
      type: 'create', 
      taskName,
      date,
      priority,
      category
    };
  }
  
  if (/(cambiar|modificar|mover|actualizar|editar|renombrar)\s+(?:la\s+)?(?:tarea|fecha|prioridad|descripción|nombre)/i.test(lowerMsg)) {
    let subType: ModifySubType = 'unknown';
    
    if (/(fecha|día|dias|días|día|para el|para)\s/i.test(lowerMsg)) {
      subType = 'date';
    } else if (/prioridad|importancia/i.test(lowerMsg)) {
      subType = 'priority';
    } else if (/descripción|detalles|detalle/i.test(lowerMsg)) {
      subType = 'description';
    } else if (/nombre|título/i.test(lowerMsg)) {
      subType = 'title';
    } else if (/categoría|etiqueta|área/i.test(lowerMsg)) {
      subType = 'category';
    }
    
    return { 
      type: 'modify', 
      subType,
      taskName,
      date,
      priority,
      category
    };
  }
  
  if (/(completar|marcar|terminar|finalizar)\s+(?:la\s+)?(?:tarea|reunión|llamada)/i.test(lowerMsg) ||
      /(he|ya)\s+(terminado|finalizado|completado)/i.test(lowerMsg)) {
    return { 
      type: 'complete',
      taskName
    };
  }
  
  if (/(mostrar|listar|ver|consultar)\s+(?:mis\s+)?(?:tareas|pendientes)/i.test(lowerMsg) ||
      /¿?(cuáles|que)\s+tareas\s+tengo/i.test(lowerMsg)) {
    return { type: 'list' };
  }
  
  if (/(buscar|encontrar|localizar|filtrar)\s+(?:tareas|pendientes)/i.test(lowerMsg)) {
    return { type: 'search' };
  }
  
  if (/(recordar|recordatorio|alerta|notificación|aviso)\s/i.test(lowerMsg)) {
    return { 
      type: 'reminder',
      taskName,
      date
    };
  }
  
  if (/(eliminar|borrar|quitar|remover)\s+(?:la\s+)?(?:tarea|recordatorio)/i.test(lowerMsg)) {
    return { 
      type: 'delete',
      taskName
    };
  }
  
  if (/(categorizar|organizar|clasificar|mover\s+a\s+la\s+categoría)/i.test(lowerMsg)) {
    return { 
      type: 'categorize',
      taskName,
      category
    };
  }
  
  if (context.length > 0) {
    if (lastAction.includes('listar') && /más|siguiente|otras/i.test(lowerMsg)) {
      return { type: 'list' };
    }
    
    if (lastAction.includes('buscar') && /no|nada|encontré/i.test(lowerMsg)) {
      return { type: 'search' };
    }
  }
  
  return { type: 'unknown' };
}

// Función de respaldo mejorada con subtipos
function getEnhancedFallbackResponse(message: string, action: TaskAction, subType?: string): string {
  const lowerMsg = message.toLowerCase();
  
  switch(action) {
    case 'create':
      return `Para crear una tarea, por favor especifica: 
1. Nombre claro de la tarea (ej: "Revisar documentos del contrato")
2. Fecha límite si aplica (ej: "para el viernes 15 de junio")
3. Prioridad si es importante (ej: "con prioridad Alta")
4. Categoría si aplica (ej: "en la categoría Trabajo")`;
      
    case 'modify':
      if (subType === 'date') {
        return `Para cambiar fechas, usa un formato como: 
"Cambiar fecha de [nombre tarea] para el [nueva fecha]"
Ejemplos:
- "Cambiar fecha de 'Revisar documentos' al 30 de mayo"
- "Mover 'Reunión con equipo' al próximo martes"`;
      }
      if (subType === 'priority') {
        return `Para cambiar prioridades, especifica: 
1. Nombre exacto de la tarea
2. Nueva prioridad (alta, media o baja)
Ejemplo: 
"Cambiar prioridad de 'Preparar presentación' a Alta"`;
      }
      if (subType === 'description') {
        return `Para editar descripciones, indica:
1. Nombre de la tarea
2. Nueva descripción o cambios
Ejemplo:
"Actualizar descripción de 'Revisar documentos' para incluir los archivos de contrato"`;
      }
      return `Para modificar tareas, especifica qué quieres cambiar:
- "Cambiar fecha de [tarea] a [nueva fecha]"
- "Actualizar prioridad de [tarea] a [Alta/Media/Baja]"
- "Editar descripción de [tarea] para incluir [nuevos detalles]"`;
      
    case 'complete':
      return `Para marcar tareas como completadas:
1. Usa el nombre exacto de la tarea
2. Puedes confirmar con "Sí" si acabo de mostrarte la tarea
Ejemplos:
- "Completar tarea 'Revisar documentos'"
- "Marcar como terminado 'Enviar correo a cliente'"`;
      
    case 'list':
      return `Puedo listar tus tareas de varias formas:
- "Mostrar todas mis tareas pendientes"
- "Listar tareas con prioridad Alta para esta semana"
- "¿Qué tengo pendiente para hoy?"
- "Mostrar tareas completadas en junio"`;
      
    case 'search':
      return `Para buscar tareas, puedes usar:
- "Buscar tareas sobre [tema clave]"
- "Encontrar todas las tareas de [nombre persona]"
- "Mostrar tareas de la categoría [nombre categoría]"`;
      
    case 'reminder':
      return `Para recordatorios, especifica:
1. Qué necesitas que te recuerde
2. Cuándo (fecha/hora específica o frecuencia)
Ejemplos:
- "Recordarme llamar al cliente mañana a las 10am"
- "Alerta para renovar suscripción 3 días antes"`;
      
    case 'delete':
      return `Para eliminar tareas:
1. Usa el nombre exacto de la tarea
2. Confirma con "Sí, eliminar" cuando te pregunte
Ejemplo: "Eliminar tarea 'Reunión cancelada'"`;
      
    case 'categorize':
      return `Para organizar tareas en categorías:
1. Especifica el nombre de la tarea
2. Indica la categoría deseada
Ejemplo: "Mover 'Preparar presentación' a 'Trabajo'"`;
      
    default:
      if (/(hola|buenos|saludos)/i.test(lowerMsg)) {
        return `¡Hola! Soy tu asistente de tareas. ¿En qué puedo ayudarte hoy? Puedes:
- Crear una nueva tarea
- Consultar tus pendientes
- Modificar o completar tareas existentes`;
      }
      
      if (/(gracias|ok|vale|perfecto)/i.test(lowerMsg)) {
        return `¡De nada! ¿Hay algo más en lo que pueda ayudarte con tus tareas?`;
      }
      
      if (/(ayuda|qué puedes hacer|qué soportas)/i.test(lowerMsg)) {
        return `Puedo ayudarte con:
1. 🗓 Gestión de tareas (crear, modificar, completar)
2. ⏰ Recordatorios y fechas límite
3. 📂 Organización por categorías/etiquetas
4. 🔍 Búsqueda y filtrado de tareas

Ejemplos:
- "Crear tarea 'Enviar informe' para mañana con prioridad Alta"
- "Mostrar mis tareas pendientes de esta semana"`;
      }
      
      return `No estoy seguro de cómo ayudarte con eso. ¿Quieres que te ayude con alguna de estas opciones?
- Crear una nueva tarea
- Listar tus tareas pendientes
- Modificar una tarea existente

Puedes decir "ayuda" para ver todo lo que puedo hacer.`;
  }
}

// Función para detectar si un texto no tiene sentido
function isGibberish(text: string): boolean {
  if (!text) return true;
  
  if (text.trim().length < 3) return true;
  
  const gibberishPatterns = [
    /^[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/,
    /(.)\1{4,}/,
    /[xq]{5,}/i,
    /^[^a-z]*$/i
  ];
  
  return gibberishPatterns.some(pattern => pattern.test(text));
}

// Función para mejorar las respuestas
function enhanceResponse(response: string, action: TaskAction, details?: DetectedAction): string {
  let enhanced = response.trim();
  
  if (enhanced.length > 0) {
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  }
  
  if (!/[.!?]$/.test(enhanced)) {
    enhanced += '.';
  }
  
  switch(action) {
    case 'create':
      if (!enhanced.includes('¿') && !enhanced.includes('?')) {
        if (details && !details.date) {
          enhanced += ' ¿Necesitas agregar una fecha límite para esta tarea?';
        } else if (details && !details.priority) {
          enhanced += ' ¿Quieres asignar una prioridad (Alta, Media, Baja)?';
        }
      }
      break;
      
    case 'modify':
      if (!enhanced.includes('¿') && !enhanced.includes('?')) {
        enhanced += ' ¿Quieres que haga este cambio?';
      }
      break;
      
    case 'complete':
      if (!enhanced.includes('¿') && !enhanced.includes('?')) {
        enhanced += ' ¿Confirmas que completaste esta tarea?';
      }
      break;
      
    case 'list':
      if (enhanced.includes('tareas') && !enhanced.includes('¿') && !enhanced.includes('?')) {
        enhanced += ' ¿Necesitas más detalles de alguna tarea en particular?';
      }
      break;
  }
  
  if (!enhanced.startsWith('¡') && !enhanced.startsWith('Por please') && 
      !enhanced.includes('gracias') && !enhanced.includes('puedes')) {
    if (action !== 'unknown') {
      enhanced = enhanced.replace('.', ', por favor.');
    }
  }
  
  return enhanced;
}
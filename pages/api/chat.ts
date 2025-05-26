import type { NextApiRequest, NextApiResponse } from 'next';

// Modelo que no requiere autorización especial
const FREE_MODEL = "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje no válido' });
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${FREE_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `[INST] <<SYS>>
            Eres MultiTask AI, asistente especializado en gestión de tareas. 
            Responde en español de forma breve y útil.
            <</SYS>> ${message} [/INST]`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            return_full_text: false
          }
        })
      }
    );

    if (!response.ok) {
      // Respuesta de respaldo si la API falla
      return res.status(200).json({ 
        content: getFallbackResponse(message) 
      });
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || getFallbackResponse(message);
    
    return res.status(200).json({ content: generatedText });

  } catch (error) {
    // Respuesta de respaldo en caso de error
    return res.status(200).json({ 
      content: getFallbackResponse(req.body?.message || '') 
    });
  }
}

function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('hola')) return '¡Hola! Soy MultiTask AI. ¿En qué puedo ayudarte?';
  if (lowerMsg.includes('crear tarea')) {
    return '✅ Para crear tareas usa: "Crear tarea [nombre] con prioridad [alta/media/baja]"';
  }
  return 'Puedo ayudarte a organizar tareas. Ejemplo: "Crear tarea Revisar documentos"';
}
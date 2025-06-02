import mongoose, { Mongoose } from "mongoose";

// 1. Define una interfaz explícita para el objeto cacheado
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// 2. Extiende la interfaz global con tipos más específicos
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// 3. Validación más estricta de la variable de entorno
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Por favor define la variable MONGODB_URI en .env.local como una cadena de conexión válida"
  );
}

// 4. Inicialización del caché con tipos explícitos (usando const ya que no se reasigna)
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

/**
 * Conexión global a MongoDB con manejo mejorado de tipos y errores
 */
async function dbConnect(): Promise<Mongoose> {
  // 5. Retorna conexión existente si está disponible
  if (cached.conn) {
    return cached.conn;
  }

  // 6. Crea una nueva conexión si no hay una promesa pendiente
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Deshabilita el buffering de comandos
      serverSelectionTimeoutMS: 5000, // Tiempo de espera para selección de servidor
      socketTimeoutMS: 45000, // Cierra sockets después de 45s de inactividad
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Conexión a MongoDB establecida correctamente");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("Error al conectar a MongoDB:", error);
        cached.promise = null; // Resetea la promesa en caso de error
        throw error;
      });
  }

  // 7. Espera la conexión y maneja errores
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw new Error(`Error en la conexión a MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 8. Retorna la conexión establecida
  return cached.conn;
}

export default dbConnect;
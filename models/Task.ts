import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // Referencia al usuario asignado
  status: {
    type: String,
    enum: ["pendiente", "en progreso", "completada"],
    default: "pendiente",
  },
  dueDate: { type: Date },
});

// Exporta el modelo si ya existe, o créalo si no existe
export default mongoose.models.Task || mongoose.model("Task", taskSchema);
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Task from "../../../models/Task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Conecta a la base de datos

  if (req.method === "POST") {
    try {
      const { title, description, assignedTo, dueDate } = req.body;

      // Crea una nueva tarea
      const task = new Task({ title, description, assignedTo, dueDate });
      await task.save(); // Guarda la tarea en la base de datos

      res.status(201).json(task); // Devuelve la tarea creada
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creando la tarea" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
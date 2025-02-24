import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../lib/dbConnect";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Conectar a la base de datos
    await dbConnect();

    // Crear un modelo de prueba (si no existe)
    const TestModel =
      mongoose.models.Test || mongoose.model("Test", new mongoose.Schema({ name: String }));

    // Insertar un documento de prueba
    const testDoc = await TestModel.create({ name: "Test Document" });

    // Leer el documento insertado
    const foundDoc = await TestModel.findById(testDoc._id);

    // Responder con el resultado
    res.status(200).json({
      success: true,
      message: "Conexión a MongoDB exitosa",
      data: foundDoc,
    });
  } catch (error) {
    console.error("Error probando la conexión a MongoDB:", error);
    res.status(500).json({
      success: false,
      message: "Error conectando a MongoDB",
      error: error.message,
    });
  }
}
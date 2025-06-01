import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import connectDB from '@/lib/dbConnect';

export async function GET(request: Request) {
  await connectDB();
  
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('tasks');
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user.tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener tareas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connectDB();
  
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const body = await request.json();
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $push: { tasks: body } },
      { new: true }
    ).select('tasks');
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const newTask = user.tasks[user.tasks.length - 1];
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear tarea' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await connectDB();
  
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { taskId, ...updates } = await request.json();
    
    const user = await User.findOneAndUpdate(
      { 
        _id: decoded.userId,
        'tasks._id': taskId 
      },
      { 
        $set: Object.fromEntries(
          Object.entries(updates).map(([key, value]) => [`tasks.$.${key}`, value])
        )
      },
      { new: true }
    ).select('tasks');
    
    if (!user) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    const updatedTask = user.tasks.find(task => task._id.toString() === taskId);
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar tarea' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connectDB();
  
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { taskId } = await request.json();
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar tarea' }, { status: 500 });
  }
}
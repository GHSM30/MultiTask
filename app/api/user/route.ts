import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import connectDB from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

// Obtener usuario actual o listar todos los usuarios
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const getAll = url.searchParams.get('getAll');
    
    // Endpoint para obtener todos los usuarios
    if (getAll === 'true') {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.split(' ')[1];
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token no proporcionado' },
          { status: 401 }
        );
      }

      // Verificar token (sin validación de isAdmin ya que no existe en el modelo)
      try {
        jwt.verify(token, process.env.JWT_SECRET!);
      } catch {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        );
      }

      const users = await User.find().select('-password -tasks');
      return NextResponse.json(users);
    }
    
    // Endpoint original para obtener datos del usuario autenticado
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

// Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const { firstName, lastName, email, password } = await request.json();
    
    // Validación básica
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // No devolver la contraseña
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(userResponse, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
}

// Actualizar usuario
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { id, firstName, lastName, email } = await request.json();
    
    // Validación
    if (!id || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (decoded.userId !== id) {
      return NextResponse.json(
        { error: 'Solo puedes actualizar tu propio perfil' },
        { status: 403 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar campos
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    await user.save();

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(userResponse);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    );
  }
}

// Eliminar usuario
export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario solo pueda eliminarse a sí mismo
    if (decoded.userId !== id) {
      return NextResponse.json(
        { error: 'Solo puedes eliminar tu propia cuenta' },
        { status: 403 }
      );
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Usuario eliminado correctamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
}
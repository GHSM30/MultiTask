import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

export const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
  Mutation: {
    register: async (
      _: any,
      args: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
      }
    ) => {
      try {
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error('El correo electrónico ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(args.password, 10);
        const user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: hashedPassword
        });

        await user.save();

        return user;
      } catch (error) {
        console.error('Error en el registro:', error);
        throw new Error(error instanceof Error ? error.message : 'Error en el registro');
      }
    },

    login: async (
      _: any,
      args: {
        email: string;
        password: string;
      }
    ) => {
      try {
        const normalizedEmail = args.email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        
        if (!user) {
          throw new GraphQLError('Usuario no encontrado', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        const isValid = await bcrypt.compare(args.password, user.password);
        if (!isValid) {
          throw new GraphQLError('Credenciales incorrectas', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }

        const token = generateToken(user);

        return {
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt
          }
        };
      } catch (error) {
        console.error('Error en el login:'); //, error -> en caso de un error en solicitud
        throw error;
      }
    }
  }
};
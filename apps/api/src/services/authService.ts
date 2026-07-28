import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { ConflictError, UnauthorizedError } from '../lib/errors';

const SALT_ROUNDS = 12;

export const authService = {
  async register(email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create(email, passwordHash);
    return this.issueToken(user.id, user.email);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      // Pesan error SAMA persis dengan "user not found" di atas —
      // jangan bocorin informasi mana yang salah (email vs password),
      // itu bisa dipakai untuk enumerate email terdaftar
      throw new UnauthorizedError('Invalid email or password');
    }
    return this.issueToken(user.id, user.email);
  },

  issueToken(id: string, email: string) {
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
      expiresIn: '2h',
    });
    return { token, user: { id, email } };
  },
};
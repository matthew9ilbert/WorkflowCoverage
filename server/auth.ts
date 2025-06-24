import jwt from 'jsonwebtoken';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable not set');
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export async function verifyAuthToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as { sub: string; email?: string; name?: string };
    
    const user = await storage.getUser(decoded.sub);
    
    if (!user) return null;
    
    return {
      id: decoded.sub,
      email: decoded.email ?? user.email ?? '',
      name: decoded.name ?? user.name ?? ''
    };
  } catch (err) {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET as jwt.Secret,
    { expiresIn: '1h' }
  );
}

import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: number;
  role: UserRole;
}

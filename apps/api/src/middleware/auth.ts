import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import { prisma } from '../lib/prisma';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
    };
    req.user = payload;
    next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

// RBAC middleware — dipakai untuk endpoint yang scoped ke satu organization
export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const orgId = req.params.orgId;
    if (!req.user) return next(new UnauthorizedError());
    if (!orgId || Array.isArray(orgId)) {
      return next(new ForbiddenError('Invalid organization id'));
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership || !allowedRoles.includes(membership.role)) {
      return next(new ForbiddenError('Insufficient permissions for this organization'));
    }
    next();
  };
}
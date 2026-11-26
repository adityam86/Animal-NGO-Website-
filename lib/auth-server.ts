import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type AdminRole,
} from "./session-token";

export class AuthError extends Error {
  status: 401 | 403;
  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export interface AuthenticatedAdmin {
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  jti: string;
}

export async function getAdminSession(): Promise<AuthenticatedAdmin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const dbSession = await prisma.adminSession.findUnique({
      where: { jti: payload.jti },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (
      !dbSession ||
      dbSession.revokedAt !== null ||
      dbSession.expiresAt <= new Date() ||
      !dbSession.user ||
      !dbSession.user.isActive
    ) {
      return null;
    }

    return {
      userId: dbSession.user.id,
      email: dbSession.user.email,
      name: dbSession.user.name,
      role: dbSession.user.role as AdminRole,
      jti: dbSession.jti,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(
  allowedRoles?: AdminRole[]
): Promise<AuthenticatedAdmin> {
  const session = await getAdminSession();
  if (!session) {
    throw new AuthError("Unauthorized", 401);
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new AuthError("Forbidden", 403);
  }
  return session;
}

export async function recordAuditLog(params: {
  userId?: string | null;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

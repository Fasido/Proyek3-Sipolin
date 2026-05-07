// src/lib/prisma.js
// ─────────────────────────────────────────────────────────────────────────────
// Exports a single PrismaClient instance for the entire application.
//
// WHY A SINGLETON?
//   PrismaClient opens a connection pool. Instantiating it more than once
//   (e.g., once per module import) wastes connections and triggers Prisma's
//   "already 10 instances" warning in development.
//
//   In development, Next.js / nodemon hot-reloads modules on every file save,
//   which would create a new client on every reload. The global trick below
//   prevents that by caching the instance on the Node.js `global` object,
//   which is NOT cleared between hot-reloads.
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
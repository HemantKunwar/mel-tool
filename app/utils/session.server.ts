// app/utils/session.server.ts

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { db } from "./db.server";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  } else {
    console.warn(
      "No SESSION_SECRET set. This is okay in development, but should be set in production."
    );
  }
}

const storage = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "ME_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret || "default_secret_for_development"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});


async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

async function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await db.staff.findUnique({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw logout(request);
  }
}

async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export { createUserSession, getUserId, requireUserId, getUser, logout };
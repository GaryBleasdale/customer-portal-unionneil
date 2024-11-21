import { json, createCookieSessionStorage, redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-key'
const SALT_ROUNDS = 10

// Create session storage
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'auth_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
  },
})

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUserSession(userId: string, role: string) {
  const session = await sessionStorage.getSession()
  session.set('userId', userId)
  session.set('role', role)
  
  // Update last login time
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
  
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export async function getUserFromSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')
  
  if (!userId) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, name: true },
    })
    return user
  } catch {
    return null
  }
}

export async function requireUser(request: Request) {
  const user = await getUserFromSession(request)
  if (!user) {
    throw redirect('/login')
  }
  return user
}

export async function requireAdmin(request: Request) {
  const user = await getUserFromSession(request)
  if (!user) {
    throw redirect('/login')
  }
  if (user.role !== 'ADMIN') {
    throw redirect('/')
  }
  return user
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'))
}

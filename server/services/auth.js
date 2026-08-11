const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../db/client');
const { validateLogin, validateRegister } = require('../validation/auth');

const JWT_SECRET     = process.env.JWT_SECRET     || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function safeUser(user) {
  const { password: _pwd, ...rest } = user;
  return rest;
}

async function login(data) {
  const { email, password } = validateLogin(data);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);
  return { token, user: safeUser(user) };
}

async function register(data) {
  const { name, email, password } = validateRegister(data);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    err.field = 'email';
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = signToken(user);
  return { token, user: safeUser(user) };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return safeUser(user);
}

module.exports = { login, register, getMe };

const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

function validateLogin(data) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path[issue.path.length - 1] || 'general';
    const error = new Error(issue.message);
    error.statusCode = 400;
    error.field = field;
    throw error;
  }
  return result.data;
}

function validateRegister(data) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path[issue.path.length - 1] || 'general';
    const error = new Error(issue.message);
    error.statusCode = 400;
    error.field = field;
    throw error;
  }
  return result.data;
}

module.exports = { validateLogin, validateRegister };

const { z } = require('zod');

const VALID_STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

const projectSchema = z
  .object({
    clientName: z
      .string({ required_error: 'Client Name is required' })
      .trim()
      .min(1, { message: 'Client Name is required' }),
    projectName: z
      .string({ required_error: 'Project Name is required' })
      .trim()
      .min(1, { message: 'Project Name is required' }),
    description: z.string().optional().default(''),
    status: z.enum(VALID_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      }),
    }),
    priority: z.enum(VALID_PRIORITIES, {
      errorMap: () => ({
        message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`,
      }),
    }),
    startDate: z
      .string({ required_error: 'Start Date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start Date must be in YYYY-MM-DD format' }),
    dueDate: z
      .string({ required_error: 'Due Date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Due Date must be in YYYY-MM-DD format' }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const due = new Date(data.dueDate);
      return due >= start;
    },
    {
      message: 'Due Date cannot be earlier than Start Date',
      path: ['dueDate'],
    }
  );

function validateProject(data) {
  const result = projectSchema.safeParse(data);
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

module.exports = {
  projectSchema,
  validateProject,
  VALID_STATUSES,
  VALID_PRIORITIES,
};

const prisma = require('../db/client');
const { validateProject } = require('../validation/project');

async function getAllProjects(filters = {}) {
  const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page, limit } = filters;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (search) {
    where.OR = [
      { projectName: { contains: search } },
      { clientName: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const total = await prisma.project.count({ where });

  const orderBy = {};
  if (['dueDate', 'startDate', 'createdAt', 'projectName', 'clientName'].includes(sortBy)) {
    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else if (sortBy !== 'priority') {
    orderBy.id = 'asc';
  }

  let projects = await prisma.project.findMany({
    where,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined,
  });

  if (sortBy === 'priority') {
    const priorityRank = { High: 1, Medium: 2, Low: 3 };
    projects.sort((a, b) => {
      const rankA = priorityRank[a.priority] ?? 99;
      const rankB = priorityRank[b.priority] ?? 99;
      return sortOrder === 'asc' ? rankB - rankA : rankA - rankB;
    });
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 6);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedData = projects.slice(startIndex, startIndex + limitNum);

    return {
      data: paginatedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  return projects;
}

async function getProjectById(id) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    const error = new Error('Invalid project ID format');
    error.statusCode = 400;
    throw error;
  }

  const project = await prisma.project.findUnique({
    where: { id: numericId },
  });

  if (!project) {
    const error = new Error(`Project with ID ${numericId} not found`);
    error.statusCode = 404;
    throw error;
  }

  return project;
}

async function createProject(data) {
  const validated = validateProject(data);

  return await prisma.project.create({
    data: validated,
  });
}

async function updateProject(id, data) {
  const project = await getProjectById(id);
  const validated = validateProject(data);

  return await prisma.project.update({
    where: { id: project.id },
    data: validated,
  });
}

async function deleteProject(id) {
  const project = await getProjectById(id);

  await prisma.project.delete({
    where: { id: project.id },
  });

  return { message: `Project ${project.id} deleted successfully` };
}

async function getProjectStats() {
  const [total, inProgress, completed, onHold, planning] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'In Progress' } }),
    prisma.project.count({ where: { status: 'Completed' } }),
    prisma.project.count({ where: { status: 'On Hold' } }),
    prisma.project.count({ where: { status: 'Planning' } }),
  ]);

  return { total, inProgress, completed, onHold, planning };
}

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
};

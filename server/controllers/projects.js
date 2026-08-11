const projectService = require('../services/projects');

async function getAll(req, res, next) {
  try {
    const projects = await projectService.getAllProjects(req.query);
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const newProject = await projectService.createProject(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const updatedProject = await projectService.updateProject(req.params.id, req.body);
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await projectService.getProjectStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  getStats,
  create,
  update,
  remove,
};

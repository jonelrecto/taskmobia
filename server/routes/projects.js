const express = require('express');
const projectController = require('../controllers/projects');

const router = express.Router();

router.get('/', projectController.getAll);
router.get('/stats', projectController.getStats);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

module.exports = router;

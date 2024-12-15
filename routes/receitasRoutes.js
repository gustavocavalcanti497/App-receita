const express = require('express');
const router = express.Router();
const receitasController = require('../controllers/receitasController');

// Rota para buscar receitas por ingredientes
router.post('/buscar', receitasController.buscarReceitas);

// Rota para detalhes da receita
router.get('/detalhes/:idReceita', receitasController.receitaDetalhes);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
    registrar,
    login,
    obterPerfil,
    listarUsuarios,
    obterUsuario,
    atualizarUsuario,
    deletarUsuario,
    atualizarLocalizacao,
} = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

// ─── Rotas públicas ────────────────────────────
router.post('/registro', registrar);
router.post('/login', login);

// ─── Rotas protegidas (JWT obrigatório) ────────
router.get('/perfil', authMiddleware, obterPerfil);
router.get('/', authMiddleware, listarUsuarios);
router.put('/localizacao', authMiddleware, atualizarLocalizacao);
router.get('/:id', authMiddleware, obterUsuario);
router.put('/:id', authMiddleware, atualizarUsuario);
router.delete('/:id', authMiddleware, deletarUsuario);

module.exports = router;

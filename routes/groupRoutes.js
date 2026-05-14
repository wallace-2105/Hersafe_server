const express = require('express');
const router = express.Router();

const {
    criarGrupo,
    listarGrupos,
    obterGrupo,
    atualizarGrupo,
    deletarGrupo,
    removerMembro,
} = require('../controllers/groupController');

const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de grupos requerem autenticação
router.use(authMiddleware);

router.post('/', criarGrupo);
router.get('/', listarGrupos);
router.get('/:id', obterGrupo);
router.put('/:id', atualizarGrupo);
router.delete('/:id', deletarGrupo);
router.delete('/:id/membros/:membroId', removerMembro);

module.exports = router;

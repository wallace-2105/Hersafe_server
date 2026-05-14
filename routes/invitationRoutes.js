const express = require('express');
const router = express.Router();

const {
    enviarConvite,
    listarConvitesPendentes,
    responderConvite,
} = require('../controllers/invitationController');

const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de convites requerem autenticação
router.use(authMiddleware);

router.post('/', enviarConvite);
router.get('/pendentes', listarConvitesPendentes);
router.put('/:id/responder', responderConvite);

module.exports = router;

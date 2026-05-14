const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const User = require('../models/User');

// POST /api/convites
const enviarConvite = async (req, res) => {
    try {
        const { destinatarioId, grupoId } = req.body;

        if (!destinatarioId || !grupoId) {
            return res.status(400).json({ mensagem: 'Destinatário e Grupo são obrigatórios.' });
        }

        const grupo = await Group.findById(grupoId);
        if (!grupo) {
            return res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        }

        // Verifica se quem está enviando tem permissão (pode ser o criador ou qualquer membro, dependendo da regra. Vamos deixar qualquer membro convidar por enquanto)
        if (!grupo.membros.includes(req.userId)) {
            return res.status(403).json({ mensagem: 'Acesso negado. Você não é membro deste grupo.' });
        }

        // Verifica se destinatário existe
        const destinatario = await User.findById(destinatarioId);
        if (!destinatario) {
            return res.status(404).json({ mensagem: 'Destinatário não encontrado.' });
        }

        // Verifica se já é membro
        if (grupo.membros.includes(destinatarioId)) {
            return res.status(400).json({ mensagem: 'Usuário já é membro deste grupo.' });
        }

        // Verifica se já existe um convite pendente
        const conviteExistente = await Invitation.findOne({
            grupo: grupoId,
            destinatario: destinatarioId,
            status: 'pendente'
        });

        if (conviteExistente) {
            return res.status(400).json({ mensagem: 'Já existe um convite pendente para este usuário neste grupo.' });
        }

        const convite = await Invitation.create({
            remetente: req.userId,
            destinatario: destinatarioId,
            grupo: grupoId,
            status: 'pendente'
        });

        return res.status(201).json({ mensagem: 'Convite enviado com sucesso.', convite });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// GET /api/convites/pendentes
const listarConvitesPendentes = async (req, res) => {
    try {
        const convites = await Invitation.find({ destinatario: req.userId, status: 'pendente' })
            .populate('remetente', 'nome email')
            .populate('grupo', 'nome descricao');
            
        return res.status(200).json({ total: convites.length, convites });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// PUT /api/convites/:id/responder
const responderConvite = async (req, res) => {
    try {
        const { status } = req.body; // 'aceito' ou 'recusado'

        if (!['aceito', 'recusado'].includes(status)) {
            return res.status(400).json({ mensagem: 'Status inválido. Use "aceito" ou "recusado".' });
        }

        const convite = await Invitation.findById(req.params.id);
        if (!convite) {
            return res.status(404).json({ mensagem: 'Convite não encontrado.' });
        }

        // Apenas o destinatário pode responder
        if (String(convite.destinatario) !== String(req.userId)) {
            return res.status(403).json({ mensagem: 'Acesso negado. Você não é o destinatário deste convite.' });
        }

        if (convite.status !== 'pendente') {
            return res.status(400).json({ mensagem: `Este convite já foi ${convite.status}.` });
        }

        convite.status = status;
        await convite.save();

        if (status === 'aceito') {
            const grupo = await Group.findById(convite.grupo);
            if (grupo && !grupo.membros.includes(req.userId)) {
                grupo.membros.push(req.userId);
                await grupo.save();
            }
        }

        return res.status(200).json({ mensagem: `Convite ${status} com sucesso.`, convite });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

module.exports = {
    enviarConvite,
    listarConvitesPendentes,
    responderConvite,
};

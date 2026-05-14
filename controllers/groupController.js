const Group = require('../models/Group');
const User = require('../models/User');

// POST /api/grupos
const criarGrupo = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({ mensagem: 'O nome do grupo é obrigatório.' });
        }

        const grupo = await Group.create({
            nome,
            descricao,
            criador: req.userId,
            membros: [req.userId] // O criador já começa como membro
        });

        return res.status(201).json({ mensagem: 'Grupo criado com sucesso.', grupo });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// GET /api/grupos
const listarGrupos = async (req, res) => {
    try {
        // Busca os grupos onde o usuário é membro
        const grupos = await Group.find({ membros: req.userId }).populate('criador', 'nome email');
        
        return res.status(200).json({ total: grupos.length, grupos });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// GET /api/grupos/:id
const obterGrupo = async (req, res) => {
    try {
        const grupo = await Group.findById(req.params.id)
            .populate('criador', 'nome email')
            .populate('membros', 'nome email telefone contatoDeEmergencia meusLocais ultimaLocalizacao');

        if (!grupo) {
            return res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        }

        // Verifica se o usuário é membro do grupo
        const isMembro = grupo.membros.some(membro => String(membro._id) === String(req.userId));
        if (!isMembro) {
            return res.status(403).json({ mensagem: 'Acesso negado. Você não faz parte deste grupo.' });
        }

        return res.status(200).json({ grupo });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// PUT /api/grupos/:id
const atualizarGrupo = async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        const grupo = await Group.findById(req.params.id);
        if (!grupo) {
            return res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        }

        // Apenas o criador pode atualizar os dados do grupo
        if (String(grupo.criador) !== String(req.userId)) {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas o criador pode editar o grupo.' });
        }

        grupo.nome = nome || grupo.nome;
        grupo.descricao = descricao !== undefined ? descricao : grupo.descricao;
        await grupo.save();

        return res.status(200).json({ mensagem: 'Grupo atualizado.', grupo });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// DELETE /api/grupos/:id
const deletarGrupo = async (req, res) => {
    try {
        const grupo = await Group.findById(req.params.id);
        if (!grupo) {
            return res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        }

        // Apenas o criador pode deletar
        if (String(grupo.criador) !== String(req.userId)) {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas o criador pode deletar o grupo.' });
        }

        await Group.findByIdAndDelete(req.params.id);
        return res.status(200).json({ mensagem: 'Grupo deletado com sucesso.' });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// DELETE /api/grupos/:id/membros/:membroId
const removerMembro = async (req, res) => {
    try {
        const { id, membroId } = req.params;

        const grupo = await Group.findById(id);
        if (!grupo) {
            return res.status(404).json({ mensagem: 'Grupo não encontrado.' });
        }

        const isCriador = String(grupo.criador) === String(req.userId);
        const isProprioMembro = String(req.userId) === String(membroId);

        // Somente o criador pode remover alguém, ou a pessoa pode sair por conta própria
        if (!isCriador && !isProprioMembro) {
            return res.status(403).json({ mensagem: 'Acesso negado. Apenas o criador pode remover outros membros.' });
        }

        if (String(grupo.criador) === String(membroId)) {
            return res.status(400).json({ mensagem: 'O criador não pode ser removido do grupo. Exclua o grupo ou passe a propriedade (não implementado).' });
        }

        grupo.membros = grupo.membros.filter(m => String(m) !== String(membroId));
        await grupo.save();

        return res.status(200).json({ mensagem: 'Membro removido com sucesso.', grupo });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

module.exports = {
    criarGrupo,
    listarGrupos,
    obterGrupo,
    atualizarGrupo,
    deletarGrupo,
    removerMembro,
};

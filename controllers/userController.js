const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Gera token JWT
const gerarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

// POST /api/usuarios/registro
const registrar = async (req, res) => {
    try {
        const { nome, email, senha, telefone, contatoDeEmergencia, meusLocais } = req.body;

        const emailExistente = await User.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        }

        const usuario = await User.create({
            nome,
            email,
            senha,
            telefone,
            contatoDeEmergencia,
            meusLocais,
        });

        const token = gerarToken(usuario._id);

        return res.status(201).json({
            mensagem: 'Usuário criado com sucesso.',
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                contatoDeEmergencia: usuario.contatoDeEmergencia,
                meusLocais: usuario.meusLocais,
            },
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// POST /api/usuarios/login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
        }

        // Busca incluindo o campo senha (select: false no schema)
        const usuario = await User.findOne({ email }).select('+senha');
        if (!usuario) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        const senhaCorreta = await usuario.compararSenha(senha);
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
        }

        const token = gerarToken(usuario._id);

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                telefone: usuario.telefone,
                contatoDeEmergencia: usuario.contatoDeEmergencia,
                meusLocais: usuario.meusLocais,
            },
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// ─────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────

// GET /api/usuarios/perfil  (usuário autenticado vê o próprio perfil)
const obterPerfil = async (req, res) => {
    try {
        const usuario = await User.findById(req.userId);
        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        return res.status(200).json({ usuario });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// GET /api/usuarios  (lista todos — protegido, permite busca por nome)
const listarUsuarios = async (req, res) => {
    try {
        const { nome } = req.query;
        let query = {};
        if (nome) {
            query.nome = { $regex: new RegExp(nome, 'i') }; // Busca case-insensitive
        }
        
        // Não retornar a si mesmo na busca (opcional, mas recomendado)
        query._id = { $ne: req.userId };

        const usuarios = await User.find(query).select('-__v -senha');
        
        // Mapeia para incluir campo 'id' explícito (compatível com o frontend)
        const usuariosMapeados = usuarios.map(u => ({
            id: u._id,
            _id: u._id,
            nome: u.nome,
            email: u.email,
            telefone: u.telefone,
            contatoDeEmergencia: u.contatoDeEmergencia,
            meusLocais: u.meusLocais,
            ultimaLocalizacao: u.ultimaLocalizacao,
        }));
        
        return res.status(200).json({ total: usuariosMapeados.length, usuarios: usuariosMapeados });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// GET /api/usuarios/:id
const obterUsuario = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id).select('-__v');
        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
        return res.status(200).json({ usuario });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// PUT /api/usuarios/:id
const atualizarUsuario = async (req, res) => {
    try {
        const { nome, email, telefone, contatoDeEmergencia, meusLocais } = req.body;

        // Impede que outro usuário edite um perfil que não é o dele
        if (String(req.userId) !== String(req.params.id)) {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }

        const dadosAtualizados = {};
        if (nome !== undefined) dadosAtualizados.nome = nome;
        if (email !== undefined) dadosAtualizados.email = email;
        if (telefone !== undefined) dadosAtualizados.telefone = telefone;
        if (contatoDeEmergencia !== undefined) {
            dadosAtualizados.contatoDeEmergencia = contatoDeEmergencia;
        }
        if (meusLocais !== undefined) dadosAtualizados.meusLocais = meusLocais;

        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            dadosAtualizados,
            { new: true, runValidators: true }
        ).select('-__v');

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        return res.status(200).json({ mensagem: 'Usuário atualizado.', usuario });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// DELETE /api/usuarios/:id
const deletarUsuario = async (req, res) => {
    try {
        if (req.userId !== req.params.id) {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }

        const usuario = await User.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        return res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

// PUT /api/usuarios/localizacao
const atualizarLocalizacao = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ mensagem: 'Latitude e longitude são obrigatórias.' });
        }

        const usuario = await User.findByIdAndUpdate(
            req.userId,
            {
                ultimaLocalizacao: {
                    latitude,
                    longitude,
                    atualizadoEm: new Date()
                }
            },
            { new: true }
        ).select('-__v');

        if (!usuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }

        return res.status(200).json({ mensagem: 'Localização atualizada com sucesso.', ultimaLocalizacao: usuario.ultimaLocalizacao });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno.', erro: error.message });
    }
};

module.exports = {
    registrar,
    login,
    obterPerfil,
    listarUsuarios,
    obterUsuario,
    atualizarUsuario,
    deletarUsuario,
    atualizarLocalizacao,
};

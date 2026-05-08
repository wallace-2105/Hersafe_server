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

// GET /api/usuarios  (lista todos — protegido)
const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select('-__v');
        return res.status(200).json({ total: usuarios.length, usuarios });
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
        if (req.userId !== req.params.id) {
            return res.status(403).json({ mensagem: 'Acesso negado.' });
        }

        const usuario = await User.findByIdAndUpdate(
            req.params.id,
            { nome, email, telefone, contatoDeEmergencia, meusLocais },
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

module.exports = {
    registrar,
    login,
    obterPerfil,
    listarUsuarios,
    obterUsuario,
    atualizarUsuario,
    deletarUsuario,
};

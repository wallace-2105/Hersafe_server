const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LocalSchema = new mongoose.Schema({
    nome: { type: String },
    endereco: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    tipo: { 
        type: String, 
        enum: ['trabalho', 'academia', 'faculdade', 'escola', 'casa', 'casa passeio'], 
        required: true 
    }
}, { _id: true });

const UserSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: [true, 'O nome é obrigatório'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'O e-mail é obrigatório'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'E-mail inválido'],
        },
        senha: {
            type: String,
            required: [true, 'A senha é obrigatória'],
            minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
            select: false, // nunca retorna a senha nas queries
        },
        telefone: {
            type: String,
            required: [true, 'O telefone é obrigatório'],
            trim: true,
        },
        contatoDeEmergencia: {
            nome: { type: String, default: '' },
            telefone: { type: String, default: '' },
        },
        meusLocais: {
            type: [LocalSchema],
            default: [],
        },
    },
    { timestamps: true }
);

// Hash da senha antes de salvar
UserSchema.pre('save', async function () {
    if (!this.isModified('senha')) return;
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
});

// Método para comparar senha
UserSchema.methods.compararSenha = async function (senhaInformada) {
    return bcrypt.compare(senhaInformada, this.senha);
};

module.exports = mongoose.model('User', UserSchema);

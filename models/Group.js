const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: [true, 'O nome do grupo é obrigatório'],
            trim: true,
        },
        descricao: {
            type: String,
            trim: true,
            default: '',
        },
        criador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        membros: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Group', GroupSchema);

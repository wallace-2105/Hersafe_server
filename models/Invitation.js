const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema(
    {
        remetente: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        destinatario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        grupo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        status: {
            type: String,
            enum: ['pendente', 'aceito', 'recusado'],
            default: 'pendente',
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Invitation', InvitationSchema);

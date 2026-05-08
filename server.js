const express = require('express');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB
connectDB();

// Middlewares globais
app.use(express.json());

// Rota de saúde
app.get('/', (req, res) => {
    res.json({ status: 'ok', mensagem: 'Servidor HERSAFE rodando 🚀' });
});

// Rotas
app.use('/api/usuarios', require('./routes/userRoutes'));

// Subir servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});